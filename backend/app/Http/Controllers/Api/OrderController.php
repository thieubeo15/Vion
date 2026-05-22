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
        return response()->json(Order::with(['details.variant.product'])->orderBy('OrderID', 'desc')->get());
        }

    /**
     * Hàm đặt hàng CHÍNH cho CheckoutPage
     */
    public function placeOrder(Request $request) {
        $request->validate([
            'FullName' => 'required|string|max:255',
            'Phone' => 'required|string|max:20',
            'SpecificAddress' => 'required|string|max:500',
            'Province' => 'required|string|max:255',
            'District' => 'required|string|max:255',
            'Ward' => 'required|string|max:255',
            'TotalAmount' => 'required|numeric',
            'SelectedItems' => 'required|array|min:1',
            'VoucherCode' => 'nullable|string|max:50',
        ]);

        $user = Auth::guard('sanctum')->user();
        
        try {
            // Nối địa chỉ đầy đủ cho tương thích ngược
            $fullAddress = $request->SpecificAddress . ', ' . $request->Ward . ', ' . $request->District . ', ' . $request->Province;

            if ($user) {
                // Lấy giỏ hàng kèm theo các item và thông tin sản phẩm từ DB
                $cart = Cart::where('UserID', $user->UserID)->with('items.variant.product')->first();

                if (!$cart || $cart->items->isEmpty()) {
                    return response()->json([
                        'success' => false, 
                        'message' => 'Giỏ hàng của bạn đang trống, không thể đặt hàng!'
                    ], 400);
                }

                // Lọc ra các sản phẩm được chọn
                $selectedItems = $cart->items->whereIn('CartItemID', $request->SelectedItems);

                if ($selectedItems->isEmpty()) {
                    throw new \Exception("Không có sản phẩm nào được chọn để thanh toán!");
                }
            } else {
                // Khách vãng lai: SelectedItems là mảng các item [{ VariantID, Quantity }]
                $selectedItems = collect();
                foreach ($request->SelectedItems as $rawItem) {
                    $variantId = $rawItem['VariantID'] ?? $rawItem['variant_id'] ?? null;
                    $quantity = $rawItem['Quantity'] ?? $rawItem['quantity'] ?? null;

                    if (!$variantId || !$quantity || $quantity < 1) {
                        throw new \Exception('Thông tin sản phẩm trong giỏ hàng không hợp lệ!');
                    }

                    $variant = ProductVariant::where('VariantID', $variantId)->with('product')->first();
                    if (!$variant) {
                        throw new \Exception("Sản phẩm phân loại #{$variantId} không tồn tại!");
                    }

                    $selectedItems->push((object)[
                        'VariantID' => $variantId,
                        'Quantity' => (int)$quantity,
                        'Price' => $variant->Price,
                        'variant' => $variant
                    ]);
                }
            }

            return DB::transaction(function () use ($request, $user, $selectedItems, $fullAddress) {
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
                    if (!$user) {
                        throw new \Exception('Vui lòng đăng nhập để sử dụng mã giảm giá!');
                    }

                    $voucherCode = Voucher::cleanCode($voucherCode);
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
                    'UserID'          => $user ? $user->UserID : null,
                    'FullName'        => $request->FullName,
                    'Phone'           => $request->Phone,
                    'Address'         => $fullAddress,
                    'SpecificAddress' => $request->SpecificAddress,
                    'Province'        => $request->Province,
                    'District'        => $request->District,
                    'Ward'            => $request->Ward,
                    'TotalAmount'     => $finalTotal,
                    'OrderDate'       => now(),
                    'Status'          => 'Pending',
                    'PaymentMethod'   => $request->PaymentMethod ?? 'COD',
                    'VoucherCode'     => $voucherCode,
                    'DiscountAmount'  => $discountAmount,
                ]);

                // 2. Chuyển từng món sang Chi tiết đơn hàng
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
                    if ($variant->product) {
                        $variant->product()->increment('sold_count', $item->Quantity);
                    }
                }

                // 3. Ghi nhận lượt sử dụng voucher
                if ($voucher && $user) {
                    VoucherUsage::create([
                        'VoucherID'      => $voucher->VoucherID,
                        'UserID'         => $user->UserID,
                        'OrderID'        => $order->OrderID,
                        'DiscountAmount' => $discountAmount,
                    ]);
                    $voucher->increment('UsedCount');
                }

                // 4. XÓA GIỎ HÀNG (Nếu có user đăng nhập)
                if ($user) {
                    $cart = Cart::where('UserID', $user->UserID)->first();
                    if ($cart) {
                        $cart->items()->whereIn('CartItemID', $request->SelectedItems)->delete();
                    }
                }

                // 5. Tạo thông báo cho Khách hàng (Chỉ dành cho user đăng nhập)
                if ($user) {
                    \App\Models\Notification::create([
                        'UserID' => $user->UserID,
                        'Title' => 'Đặt hàng thành công',
                        'Content' => "Đơn hàng #{$order->OrderID} của bạn đã được đặt thành công với tổng tiền " . number_format($order->TotalAmount, 0, ',', '.') . "đ.",
                        'Type' => 'order_placed',
                        'RedirectUrl' => '/orders',
                        'IsRead' => false,
                        'IsAdminNotification' => false
                    ]);
                }

                // 6. Tạo thông báo cho Admin
                $customerName = $user ? $user->FullName : $request->FullName . ' (Khách vãng lai)';
                \App\Models\Notification::create([
                    'UserID' => null,
                    'Title' => 'Đơn hàng mới từ khách hàng',
                    'Content' => "Đơn hàng mới #{$order->OrderID} vừa được đặt bởi {$customerName} trị giá " . number_format($order->TotalAmount, 0, ',', '.') . "đ.",
                    'Type' => 'order_admin',
                    'RedirectUrl' => '/admin/orders',
                    'IsRead' => false,
                    'IsAdminNotification' => true
                ]);

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
        $order = Order::with(['details.variant'])->find($id);
        if (!$order) return response()->json(['message' => 'Not found'], 404);
        return response()->json($order);
    }

    public function update(Request $request, $id) {
        $order = Order::with('details.variant.product')->find($id);
        if (!$order) return response()->json(['message' => 'Not found'], 404);
        
        $request->validate(['Status' => 'required|string|max:50']);
        $newStatus = $request->Status;

        // Kiểm tra điều kiện hoàn thành đơn hàng: Phải ở trạng thái Shipping mới được hoàn thành
        if ($newStatus === 'Completed' && $order->Status !== 'Shipping') {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng chưa được chuyển sang trạng thái Đang giao hàng (Shipping) nên không thể hoàn thành!'
            ], 400);
        }

        // Nếu chuyển sang Cancelled và trạng thái cũ không phải Cancelled
        if ($newStatus === 'Cancelled' && $order->Status !== 'Cancelled') {
            DB::transaction(function () use ($order) {
                foreach ($order->details as $detail) {
                    if ($detail->variant) {
                        $detail->variant->increment('Stock', $detail->Quantity);
                        if ($detail->variant->product) {
                            $detail->variant->product->decrement('sold_count', $detail->Quantity);
                        }
                    }
                }
            });
        }

        $updateData = ['Status' => $newStatus];
        if ($request->has('CancelReason')) {
            $updateData['CancelReason'] = $request->CancelReason;
        }

        $order->update($updateData);

        // Gửi thông báo cho khách hàng khi thay đổi trạng thái đơn hàng (nếu đơn hàng của thành viên)
        if ($order->UserID) {
            $notificationTitle = '';
            $notificationContent = '';
            $notificationType = 'order_update';

            if ($newStatus === 'Cancelled') {
                $notificationTitle = 'Đơn hàng đã được hủy';
                $reasonText = $order->CancelReason ? " với lý do: {$order->CancelReason}" : "";
                $notificationContent = "Yêu cầu hủy đơn hàng #VION-{$order->OrderID} của bạn đã được Admin xác nhận duyệt hủy{$reasonText}.";
                $notificationType = 'order_cancelled';
            } elseif ($newStatus === 'Shipping') {
                $notificationTitle = 'Đơn hàng đang được giao';
                $notificationContent = "Đơn hàng #VION-{$order->OrderID} của bạn đang trên đường giao tới bạn.";
                $notificationType = 'order_shipping';
            } elseif ($newStatus === 'Completed') {
                $notificationTitle = 'Giao hàng thành công';
                $notificationContent = "Đơn hàng #VION-{$order->OrderID} đã được hoàn thành. Cảm ơn bạn đã mua sắm tại Vion Era!";
                $notificationType = 'order_completed';
            }

            if ($notificationTitle) {
                \App\Models\Notification::create([
                    'UserID' => $order->UserID,
                    'Title' => $notificationTitle,
                    'Content' => $notificationContent,
                    'Type' => $notificationType,
                    'RedirectUrl' => '/orders',
                    'IsRead' => false,
                    'IsAdminNotification' => false
                ]);
            }
        }

        return response()->json($order);
    }

    /**
     * Khách hàng tự gửi yêu cầu hủy đơn (chỉ khi Pending)
     */
    public function cancelOrder(Request $request, $id) {
        $user = Auth::user();
        $order = Order::find($id);

        if (!$order) return response()->json(['success' => false, 'message' => 'Đơn hàng không tồn tại!'], 404);
        if ($order->UserID !== $user->UserID) return response()->json(['success' => false, 'message' => 'Không có quyền hủy đơn này!'], 403);
        if ($order->Status !== 'Pending') return response()->json(['success' => false, 'message' => 'Đơn hàng không thể yêu cầu hủy ở trạng thái này!'], 400);

        $request->validate(['reason' => 'required|string|max:500']);

        // Cập nhật trạng thái thành Yêu cầu hủy (CancelRequested) và lưu lý do (Chưa trả lại kho ở bước này)
        $order->update([
            'Status' => 'CancelRequested',
            'CancelReason' => $request->reason
        ]);

        // Tạo thông báo cho Admin biết có yêu cầu hủy đơn mới
        $customerName = $user ? $user->FullName : 'Khách hàng';
        \App\Models\Notification::create([
            'UserID' => null,
            'Title' => 'Yêu cầu hủy đơn hàng mới',
            'Content' => "Khách hàng {$customerName} vừa gửi yêu cầu hủy đơn hàng #VION-{$order->OrderID} với lý do: {$request->reason}",
            'Type' => 'order_admin',
            'RedirectUrl' => '/admin/orders',
            'IsRead' => false,
            'IsAdminNotification' => true
        ]);

        return response()->json(['success' => true, 'message' => 'Yêu cầu hủy đơn hàng đã được gửi! Vui lòng chờ Admin xác nhận.']);
    }

    public function destroy($id) {
        $order = Order::find($id);
        if ($order) $order->delete();
        return response()->json(['message' => 'Deleted']);
    }
}