<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\ProductVariant;
use App\Models\Cart;
use App\Models\CartItem; 

class CartController extends Controller
{
    public function myCart()
    {
        $user = Auth::user();
        // Lấy giỏ hàng kèm Item -> Variant -> Product
        $cart = Cart::with(['items.variant.product'])
                    ->firstOrCreate(['UserID' => $user->UserID]);

        return response()->json([
            'success' => true,
            'data' => $cart // Trả về object cart, bên trong có mảng items
        ]);
    }

    public function addToCart(Request $request)
    {
        $user = Auth::user(); 
        $variantId = $request->input('VariantID') ?? $request->input('variant_id'); 
        $quantityToAdd = $request->input('Quantity') ?? $request->input('quantity');

        // 1. Kiểm tra tồn kho của phân loại hàng
        $variant = ProductVariant::where('VariantID', $variantId)->first();
        if (!$variant) {
            return response()->json(['success' => false, 'message' => 'Sản phẩm không tồn tại'], 404);
        }

        // 2. TÌM HOẶC TẠO GIỎ HÀNG CHO USER 
        $cart = Cart::firstOrCreate(['UserID' => $user->UserID]);

        // 3. TÌM SẢN PHẨM TRONG BẢNG CHI TIẾT GIỎ HÀNG 
        $cartItem = CartItem::where('CartID', $cart->CartID)
                            ->where('VariantID', $variantId)
                            ->first();

        // 4. Tính toán tổng số lượng
        $currentQuantityInCart = $cartItem ? $cartItem->Quantity : 0;
        $totalRequestedQuantity = $currentQuantityInCart + $quantityToAdd;

        // 5. CHỐT CHẶN VƯỢT KHO
        if ($totalRequestedQuantity > $variant->Stock) {
            return response()->json([
                'success' => false,
                'message' => 'Vượt quá tồn kho! Kho còn ' . $variant->Stock . ' sản phẩm, nhưng trong giỏ bạn đã có ' . $currentQuantityInCart . ' sản phẩm.'
            ], 400); 
        }

        // 6. Lưu vào bảng chi tiết giỏ hàng (CartItem)
        if ($cartItem) {
            $cartItem->Quantity = $totalRequestedQuantity;
            $cartItem->save();
        } else {
            CartItem::create([
                'CartID' => $cart->CartID,   
                'VariantID' => $variantId,   
                'Quantity' => $quantityToAdd,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã thêm vào giỏ hàng thành công!'
        ]);
    }

    public function updateQuantity(Request $request, $id)
    {
        $request->validate(['Quantity' => 'required|integer|min:1']);
        $item = CartItem::findOrFail($id);
        
        $variant = ProductVariant::where('VariantID', $item->VariantID)->first();
        if ($variant && $request->Quantity > $variant->Stock) {
            return response()->json([
                'success' => false,
                'message' => 'Vượt quá tồn kho! Kho chỉ còn ' . $variant->Stock . ' sản phẩm.'
            ], 400);
        }

        $item->update(['Quantity' => $request->Quantity]);

        return response()->json(['success' => true]);
    }

    public function removeItem($id)
    {
        CartItem::destroy($id);
        return response()->json(['success' => true, 'message' => 'Đã xóa sản phẩm']);
    }
}