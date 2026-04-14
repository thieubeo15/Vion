<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use App\Http\Requests\StoreProductVariantRequest;
use App\Http\Requests\UpdateProductVariantRequest;

class ProductVariantController extends Controller
{
    public function index()
    {
        $variants = ProductVariant::with('product')->get();
        return response()->json(['success' => true, 'data' => $variants]);
    }

    public function store(StoreProductVariantRequest $request)
    {
        $variant = ProductVariant::create($request->validated());
        return response()->json(['success' => true, 'data' => $variant], 201);
    }

    public function show($id)
    {
        $variant = ProductVariant::with('product')->find($id);
        if (!$variant) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        return response()->json(['success' => true, 'data' => $variant]);
    }

    public function update(UpdateProductVariantRequest $request, $id)
    {
        $variant = ProductVariant::find($id);
        if (!$variant) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        $variant->update($request->validated());
        return response()->json(['success' => true, 'data' => $variant]);
    }

    public function destroy($id)
    {
        $variant = ProductVariant::find($id);
        if (!$variant) return response()->json(['success' => false, 'message' => 'Not found'], 404);
        $variant->delete();
        return response()->json(['success' => true, 'message' => 'Deleted']);
    }
}
