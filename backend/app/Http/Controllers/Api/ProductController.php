<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Resources\ProductResource;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Support\Facades\DB; 
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     * Sắp xếp sản phẩm mới nhất lên đầu bằng latest()
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'variants', 'images'])->latest();

        if ($request->has('category_id')) {
            $query->where('CategoryID', $request->category_id);
        }

        $products = $query->get();
        return ProductResource::collection($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $productData = $request->only(['Name', 'CategoryID', 'Description']);

            // 1. Lưu Ảnh chính
            if ($request->hasFile('MainImage')) {
                $path = $request->file('MainImage')->store('products', 'public');
                $productData['MainImage'] = $path;
            }

            // 2. Tạo sản phẩm
            $product = Product::create($productData);

            // 3. Lưu Biến thể (Variants)
            if ($request->filled('variants')) {
                $variants = json_decode($request->variants, true);
                foreach ($variants as $v) {
                    $product->variants()->create([
                        'Size'  => $v['size'],
                        'Color' => $v['color'],
                        'Price' => $v['price'],
                        'Stock' => $v['stock'],
                    ]);
                }
            }

            // 4. Lưu Nhiều ảnh phụ (Gallery)
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $img) {
                    $imgPath = $img->store('products/gallery', 'public');
                    $product->images()->create(['Url' => $imgPath]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Đã đăng bán sản phẩm Vion Era thành công!',
                'data'    => new ProductResource($product->load(['variants', 'images']))
            ], 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $product = Product::with(['category', 'variants', 'images'])->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product)
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm.'
            ], 404);
        }

        $product->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sản phẩm thành công.',
            'data' => new ProductResource($product)
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm.'
            ], 404);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa sản phẩm thành công.'
        ], 200);
    }
}