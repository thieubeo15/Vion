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
        
        $cart = Cart::with(['items.variant.product'])
                    ->firstOrCreate(['UserID' => $user->UserID]);

        return response()->json([
            'success' => true,
            'data' => $cart
        ]);
    }

    public function addToCart(Request $request)
    {
        $user = Auth::user(); 
        $variantId = $request->input('VariantID') ?? $request->input('variant_id'); 
        $quantityToAdd = $request->input('Quantity') ?? $request->input('quantity');

        
        $variant = ProductVariant::where('VariantID', $variantId)->first();
        if (!$variant) {
            return response()->json(['success' => false, 'message' => 'Sản phẩm không tồn tại'], 404);
        }

        
        $cart = Cart::firstOrCreate(['UserID' => $user->UserID]);

        
        $cartItem = CartItem::where('CartID', $cart->CartID)
                            ->where('VariantID', $variantId)
                            ->first();

        
        $currentQuantityInCart = $cartItem ? $cartItem->Quantity : 0;
        $totalRequestedQuantity = $currentQuantityInCart + $quantityToAdd;

        
        if ($totalRequestedQuantity > $variant->Stock) {
            return response()->json([
                'success' => false,
                'message' => 'Vượt quá tồn kho! Kho còn ' . $variant->Stock . ' sản phẩm, nhưng trong giỏ bạn đã có ' . $currentQuantityInCart . ' sản phẩm.'
            ], 400); 
        }

        
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