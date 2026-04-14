<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index()
    {
        return response()->json(Cart::with('items.variant')->get());
    }

    public function store(Request $request)
    {
        $request->validate(['UserID' => 'required|exists:users,UserID']);
        
        // Ensure user only has one cart (or allow multiple if desired)
        $cart = Cart::firstOrCreate(['UserID' => $request->UserID]);
        
        return response()->json($cart, 201);
    }

    public function show($id)
    {
        $cart = Cart::with('items.variant')->find($id);
        if (!$cart) return response()->json(['message' => 'Not found'], 404);
        return response()->json($cart);
    }

    public function destroy($id)
    {
        $cart = Cart::find($id);
        if ($cart) $cart->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
