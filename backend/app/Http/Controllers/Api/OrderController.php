<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\ProductVariant;
use App\Models\Cart; // Thêm Model Cart
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index() {
        return response()->json(Order::with(['details.variant', 'payment'])->get());
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
        ]);

        $user = Auth::user();
        
        // Lấy giỏ hàng kèm theo các item và thông tin sản phẩm
        $cart = Cart::where('UserID', $user->UserID)->with('items.variant.product')->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false, 
                'message' => 'Giỏ hàng của bro đang trống, không thể đặt hàng!'
            ], 400);
        }

        try {
            return DB::transaction(function () use ($request, $user, $cart) {
                // Lọc ra các sản phẩm được chọn
                $selectedItems = $cart->items->whereIn('CartItemID', $request->SelectedItems);

                if ($selectedItems->isEmpty()) {
                    throw new \Exception("Không có sản phẩm nào được chọn để thanh toán!");
                }

                // 1. Tạo bản ghi Đơn hàng
                $order = Order::create([
                    'UserID'      => $user->UserID,
                    'FullName'    => $request->FullName,
                    'Phone'       => $request->Phone,
                    'Address'     => $request->Address,
                    'TotalAmount' => $request->TotalAmount,
                    'OrderDate'   => now(),
                    'Status'      => 'Pending', // Trạng thái chờ xử lý
                    'PaymentMethod' => $request->PaymentMethod ?? 'COD'
                ]);

                // 2. Chuyển từng món từ Giỏ hàng sang Chi tiết đơn hàng
               // 2. Chuyển từng món từ Giỏ hàng sang Chi tiết đơn hàng
foreach ($selectedItems as $item) {
    $variant = $item->variant;

    // Kiểm tra tồn kho
    if ($variant->Stock < $item->Quantity) {
        throw new \Exception("Sản phẩm {$variant->product->Name} không đủ tồn kho!");
    }

    // --- ĐOẠN FIX LỖI Ở ĐÂY ---
    // Lấy giá theo thứ tự ưu tiên: 
    // 1. Giá trong giỏ hàng ($item->Price)
    // 2. Nếu (1) null thì lấy giá hiện tại của sản phẩm ($variant->Price)
    // 3. Nếu vẫn không có thì để 0 (để tránh lỗi database)
    $finalPrice = $item->Price ?? $variant->Price ?? 0;

    // Tạo chi tiết đơn hàng
    OrderDetail::create([
        'OrderID'   => $order->OrderID,
        'VariantID' => $item->VariantID,
        'Quantity'  => $item->Quantity,
        'Price'     => $finalPrice 
    ]);

    // Trừ tồn kho
    $variant->decrement('Stock', $item->Quantity);
}

                // 3. XÓA GIỎ HÀNG (Làm sạch sau khi mua theo các món đã chọn)
                $cart->items()->whereIn('CartItemID', $request->SelectedItems)->delete();

                return response()->json([
                    'success' => true,
                    'message' => 'Vion Era đã nhận đơn hàng của bro!',
                    'order_id' => $order->OrderID
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
        $order = Order::find($id);
        if (!$order) return response()->json(['message' => 'Not found'], 404);
        
        $request->validate(['Status' => 'required|string|max:50']);
        $order->update($request->only('Status'));
        return response()->json($order);
    }

    public function destroy($id) {
        $order = Order::find($id);
        if ($order) $order->delete();
        return response()->json(['message' => 'Deleted']);
    }
}