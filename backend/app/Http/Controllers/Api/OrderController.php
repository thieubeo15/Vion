<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\ProductVariant;
use App\Models\Cart;
use App\Models\Voucher;
use App\Models\VoucherUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index() {
        return response()->json(Order::with(['details.variant.product', 'payment'])->orderBy('OrderID', 'desc')->get());
        }

    /**
     * Hàm đặt hàng CHÍNH cho CheckoutPage
     */
    public function placeOrder(Request $request) {
        $request->validate([
            'FullName' => 'required|string|max:255',
            'Phone' => 'required|string|max:20',
            'Address' => 'required|string',
            'TotalAmount' => 'required|numeric',
            'SelectedItems' => 'required|array|min:1',
            'VoucherCode' => 'nullable|string|max:50',
        ]);

        $user = Auth::user();
        
        // Lấy giỏ hàng kèm theo các item và thông tin sản phẩm
        $cart = Cart::where('UserID', $user->UserID)->with('items.variant.product')->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false, 
                'message' => 'Giỏ hàng của bạn đang trống, không thể đặt hàng!'
            ], 400);
        }

        try {
            return DB::transaction(function () use ($request, $user, $cart) {
                // Lọc ra các sản phẩm được chọn
                $selectedItems = $cart->items->whereIn('CartItemID', $request->SelectedItems);

                if ($selectedItems->isEmpty()) {
                    throw new \Exception("Không có sản phẩm nào được chọn để thanh toán!");
                }

                // Tính TotalAmount phía server (không tin client)
                $totalAmount = 0;
                foreach ($selectedItems as $item) {
                    $price = $item->Price ?? $item->variant->Price ?? 0;
                    $totalAmount += $price * $item->Quantity;
                }

                // Xử lý voucher nếu có
                $voucherCode = $request->VoucherCode;
                $discountAmount = 0;
                $voucher = null;

                if ($voucherCode) {
                    $voucher = Voucher::where('Code', $voucherCode)->first();

                    if (!$voucher) {
                        throw new \Exception('Mã giảm giá không tồn tại!');
                    }
                    if (!$voucher->IsActive) {
                        throw new \Exception('Mã giảm giá đã bị vô hiệu hóa!');
                    }

                    $now = now();
                    if ($now->lt($voucher->StartDate) || $now->gt($voucher->EndDate)) {
                        throw new \Exception('Mã giảm giá không trong thời gian hiệu lực!');
                    }
                    if ($voucher->UsageLimit !== null && $voucher->UsedCount >= $voucher->UsageLimit) {
                        throw new \Exception('Mã giảm giá đã hết lượt sử dụng!');
                    }

                    $userUsageCount = VoucherUsage::where('VoucherID', $voucher->VoucherID)
                        ->where('UserID', $user->UserID)
                        ->count();
                    if ($userUsageCount >= $voucher->PerUserLimit) {
                        throw new \Exception('Bạn đã sử dụng mã giảm giá này đủ số lần cho phép!');
                    }

                    if ($totalAmount < $voucher->MinOrderAmount) {
                        throw new \Exception('Đơn hàng chưa đạt giá trị tối thiểu để sử dụng mã này!');
                    }

                    // Tính số tiền giảm
                    if ($voucher->Type === 'fixed') {
                        $discountAmount = $voucher->Value;
                    } else {
                        $discountAmount = ($totalAmount * $voucher->Value) / 100;
                        if ($voucher->MaxDiscount !== null && $discountAmount > $voucher->MaxDiscount) {
                            $discountAmount = $voucher->MaxDiscount;
                        }
                    }

                    if ($discountAmount > $totalAmount) {
                        $discountAmount = $totalAmount;
                    }

                    $discountAmount = round($discountAmount, 2);
                }

                // Trừ discount vào tổng tiền
                $finalTotal = $totalAmount - $discountAmount;

                // 1. Tạo bản ghi Đơn hàng
                $order = Order::create([
                    'UserID'         => $user->UserID,
                    'FullName'       => $request->FullName,
                    'Phone'          => $request->Phone,
                    'Address'        => $request->Address,
                    'TotalAmount'    => $finalTotal,
                    'OrderDate'      => now(),
                    'Status'         => 'Pending',
                    'PaymentMethod'  => $request->PaymentMethod ?? 'COD',
                    'VoucherCode'    => $voucherCode,
                    'DiscountAmount' => $discountAmount,
                ]);

                // 2. Chuyển từng món từ Giỏ hàng sang Chi tiết đơn hàng
                foreach ($selectedItems as $item) {
                    $variant = $item->variant;

                    // Kiểm tra tồn kho
                    if ($variant->Stock < $item->Quantity) {
                        throw new \Exception("Sản phẩm {$variant->product->Name} không đủ tồn kho!");
                    }

                    $finalPrice = $item->Price ?? $variant->Price ?? 0;

                    // Tạo chi tiết đơn hàng
                    OrderDetail::create([
                        'OrderID'     => $order->OrderID,
                        'VariantID'   => $item->VariantID,
                        'Quantity'    => $item->Quantity,
                        'Price'       => $finalPrice,
                        'ImportPrice' => $variant->ImportPrice ?? 0
                    ]);

                    // Trừ tồn kho
                    $variant->decrement('Stock', $item->Quantity);

                    // Tăng số lượng đã bán
                    $variant->product()->increment('sold_count', $item->Quantity);
                }

                // 3. Ghi nhận lượt sử dụng voucher
                if ($voucher) {
                    VoucherUsage::create([
                        'VoucherID'      => $voucher->VoucherID,
                        'UserID'         => $user->UserID,
                        'OrderID'        => $order->OrderID,
                        'DiscountAmount' => $discountAmount,
                    ]);
                    $voucher->increment('UsedCount');
                }

                // 4. XÓA GIỎ HÀNG (Làm sạch sau khi mua theo các món đã chọn)
                $cart->items()->whereIn('CartItemID', $request->SelectedItems)->delete();

                return response()->json([
                    'success'         => true,
                    'message'         => 'Vion Era đã nhận đơn hàng của bạn!',
                    'order_id'        => $order->OrderID,
                    'discount_amount' => $discountAmount,
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function myOrders() {
    $user = Auth::user();
    
    // Lấy đơn hàng của chính User đó, kèm theo chi tiết món hàng và sản phẩm
    $orders = Order::where('UserID', $user->UserID)
        ->with(['details.variant.product'])
        ->orderBy('OrderDate', 'desc')
        ->get();

    return response()->json($orders);
    }

    public function show($id) {
        $order = Order::with(['details.variant', 'payment'])->find($id);
        if (!$order) return response()->json(['message' => 'Not found'], 404);
        return response()->json($order);
    }

    public function update(Request $request, $id) {
        $order = Order::with('details.variant.product')->find($id);
        if (!$order) return response()->json(['message' => 'Not found'], 404);
        
        $request->validate(['Status' => 'required|string|max:50']);
        $newStatus = $request->Status;

        // Nếu chuyển sang Cancelled và trạng thái cũ không phải Cancelled
        if ($newStatus === 'Cancelled' && $order->Status !== 'Cancelled') {
            DB::transaction(function () use ($order) {
                foreach ($order->details as $detail) {
                    if ($detail->variant) {
                        // Trả lại tồn kho
                        $detail->variant->increment('Stock', $detail->Quantity);
                        
                        // Giảm số lượng đã bán của sản phẩm
                        if ($detail->variant->product) {
                            $detail->variant->product->decrement('sold_count', $detail->Quantity);
                        }
                    }
                }
            });
        }

        $order->update(['Status' => $newStatus]);
        return response()->json($order);
    }

    public function destroy($id) {
        $order = Order::find($id);
        if ($order) $order->delete();
        return response()->json(['message' => 'Deleted']);
    }
}