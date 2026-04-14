<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class CartItemController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'CartID' => 'required|exists:carts,CartID',
            'VariantID' => 'required|exists:product_variants,VariantID',
            'Quantity' => 'required|integer|min:1'
        ]);

        $variant = ProductVariant::find($request->VariantID);
        if ($variant->Stock < $request->Quantity) {
            return response()->json(['message' => 'Not enough stock'], 400);
        }

        $cartItem = CartItem::where('CartID', $request->CartID)
                            ->where('VariantID', $request->VariantID)
                            ->first();

        if ($cartItem) {
            // Update quantity
            $newQuantity = $cartItem->Quantity + $request->Quantity;
            if ($variant->Stock < $newQuantity) {
                 return response()->json(['message' => 'Not enough stock for total quantity'], 400);
            }
            $cartItem->update(['Quantity' => $newQuantity]);
        } else {
            $cartItem = CartItem::create($request->all());
        }

        return response()->json($cartItem, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['Quantity' => 'required|integer|min:1']);
        
        $cartItem = CartItem::find($id);
        if (!$cartItem) return response()->json(['message' => 'Not found'], 404);

        $variant = ProductVariant::find($cartItem->VariantID);
        if ($variant->Stock < $request->Quantity) {
            return response()->json(['message' => 'Not enough stock'], 400);
        }

        $cartItem->update(['Quantity' => $request->Quantity]);
        return response()->json($cartItem);
    }

    public function destroy($id)
    {
        $cartItem = CartItem::find($id);
        if ($cartItem) $cartItem->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
