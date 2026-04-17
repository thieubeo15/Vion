<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
        $request->validate([
            'VariantID' => 'required|exists:product_variants,VariantID',
            'Quantity'  => 'required|integer|min:1'
        ]);

        $user = Auth::user();
        $cart = Cart::firstOrCreate(['UserID' => $user->UserID]);

        $item = CartItem::where('CartID', $cart->CartID)
                        ->where('VariantID', $request->VariantID)
                        ->first();

        if ($item) {
            $item->increment('Quantity', $request->Quantity);
        } else {
            $variant = ProductVariant::find($request->VariantID);
            CartItem::create([
                'CartID'    => $cart->CartID,
                'VariantID' => $request->VariantID,
                'Quantity'  => $request->Quantity,
                'Price'     => $variant->Price
            ]);
        }

        return response()->json(['success' => true, 'message' => 'Đã thêm vào giỏ!']);
    }

    public function updateQuantity(Request $request, $id)
    {
        $request->validate(['Quantity' => 'required|integer|min:1']);
        $item = CartItem::findOrFail($id);
        $item->update(['Quantity' => $request->Quantity]);

        return response()->json(['success' => true]);
    }

    public function removeItem($id)
    {
        CartItem::destroy($id);
        return response()->json(['success' => true, 'message' => 'Đã xóa sản phẩm']);
    }
}