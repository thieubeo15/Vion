<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Resources\ProductResource;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Support\Facades\DB;
use App\Services\CloudinaryService;

class ProductController extends Controller
{
    
    public function index(Request $request)
    {
        $query = Product::with(['category', 'variants', 'images'])->latest();

        if ($request->has('category_id')) {
            $query->where('CategoryID', $request->category_id);
        }

        $products = $query->get();
        return ProductResource::collection($products);
    }

    
    public function store(StoreProductRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $productData = $request->only(['Name', 'CategoryID', 'Description', 'Material', 'UsageInstruction']);

            
            if ($request->hasFile('MainImage')) {
                $cloudinary = new CloudinaryService();
                $productData['MainImage'] = $cloudinary->upload(
                    $request->file('MainImage')->getRealPath(),
                    'vion/products'
                );
            }

            
            $product = Product::create($productData);

            
            if (!empty($product->MainImage)) {
                $mainImageRecord = $product->images()->create(['Url' => $product->MainImage]);
                
                \App\Http\Controllers\Api\ProductSearchController::vectorizeSingleImage(
                    $mainImageRecord->ImageID ?? $mainImageRecord->id ?? $mainImageRecord->getKey(),
                    $product->MainImage
                );
            }

            
            if ($request->filled('variants')) {
                $variants = json_decode($request->variants, true);
                foreach ($variants as $v) {
                    $product->variants()->create([
                        'Size'  => $v['size'],
                        'Color' => $v['color'],
                        'Price' => $v['price'],
                        'DiscountPrice' => isset($v['discountPrice']) && $v['discountPrice'] !== '' ? $v['discountPrice'] : null,
                        'Stock' => $v['stock'],
                        'ImportPrice' => $v['importPrice'] ?? 0,
                    ]);
                }
            }

            
            if ($request->hasFile('images')) {
                $cloudinary = new CloudinaryService();
                foreach ($request->file('images') as $img) {
                    $imgUrl = $cloudinary->upload(
                        $img->getRealPath(),
                        'vion/products/gallery'
                    );
                    $galleryImage = $product->images()->create(['Url' => $imgUrl]);

                    \App\Http\Controllers\Api\ProductSearchController::vectorizeSingleImage(
                        $galleryImage->ImageID ?? $galleryImage->id ?? $galleryImage->getKey(),
                        $imgUrl
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Đã đăng bán sản phẩm Vion Era thành công!',
                'data'    => new ProductResource($product->load(['variants', 'images']))
            ], 201);
        });
    }

    
    public function show($id)
    {
      $product = Product::with(['category', 'variants', 'images', 'reviews.user'])->find($id);

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

    
    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm.'
            ], 404);
        }

        return DB::transaction(function () use ($request, $product) {
            $data = $request->validated();

            
            if ($request->hasFile('MainImage')) {
                $cloudinary = new CloudinaryService();
                $oldMainImage = $product->MainImage;
                
                if ($oldMainImage && str_contains($oldMainImage, 'cloudinary.com')) {
                    $cloudinary->deleteByUrl($oldMainImage);
                }
                $newMainImage = $cloudinary->upload(
                    $request->file('MainImage')->getRealPath(),
                    'vion/products'
                );
                $data['MainImage'] = $newMainImage;

                
                $imgRecord = $product->images()->where('Url', $oldMainImage)->first();
                if ($imgRecord) {
                    $imgRecord->update(['Url' => $newMainImage]);
                } else {
                    $imgRecord = $product->images()->create(['Url' => $newMainImage]);
                }

                \App\Http\Controllers\Api\ProductSearchController::vectorizeSingleImage(
                    $imgRecord->ImageID ?? $imgRecord->id ?? $imgRecord->getKey(),
                    $newMainImage
                );
            }

            $product->update($data);

            
            if ($request->has('variants')) {
                $variants = json_decode($request->variants, true);
                if (is_array($variants)) {
                    $incomingSignatures = [];
                    foreach ($variants as $v) {
                        $variant = $product->variants()
                            ->where('Size', $v['size'])
                            ->where('Color', $v['color'])
                            ->first();

                        if ($variant) {
                            $variant->update([
                                'Price' => $v['price'],
                                'DiscountPrice' => isset($v['discountPrice']) && $v['discountPrice'] !== '' ? $v['discountPrice'] : null,
                                'Stock' => $v['stock'],
                                'ImportPrice' => isset($v['importPrice']) && $v['importPrice'] !== '' ? $v['importPrice'] : $variant->ImportPrice,
                            ]);
                            $incomingSignatures[] = $variant->VariantID;
                        } else {
                            $newVariant = $product->variants()->create([
                                'Size'  => $v['size'],
                                'Color' => $v['color'],
                                'Price' => $v['price'],
                                'DiscountPrice' => isset($v['discountPrice']) && $v['discountPrice'] !== '' ? $v['discountPrice'] : null,
                                'Stock' => $v['stock'],
                                'ImportPrice' => isset($v['importPrice']) && $v['importPrice'] !== '' ? $v['importPrice'] : 0,
                            ]);
                            $incomingSignatures[] = $newVariant->VariantID;
                        }
                    }

                    $product->variants()->whereNotIn('VariantID', $incomingSignatures)->update(['Stock' => 0]);
                }
            }

            
            if ($request->hasFile('images')) {
                $cloudinary = new CloudinaryService();
                foreach ($request->file('images') as $img) {
                    $imgUrl = $cloudinary->upload(
                        $img->getRealPath(),
                        'vion/products/gallery'
                    );
                    $galleryImage = $product->images()->create(['Url' => $imgUrl]);

                    \App\Http\Controllers\Api\ProductSearchController::vectorizeSingleImage(
                        $galleryImage->ImageID ?? $galleryImage->id ?? $galleryImage->getKey(),
                        $imgUrl
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật sản phẩm thành công.',
                'data' => new ProductResource($product->load(['variants', 'images']))
            ], 200);
        });
    }

    
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