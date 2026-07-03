<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Http\Resources\ProductResource;

class ProductSearchController extends Controller
{
    
    public function searchByImage(Request $request)
    {
        if (!$request->hasFile('image')) {
            return response()->json(['success' => false, 'message' => 'Vui lòng tải lên một bức ảnh!'], 400);
        }

        try {
            $image = $request->file('image');

            
            $response = Http::attach(
                'image', file_get_contents($image->getRealPath()), $image->getClientOriginalName()
            )->post('http://127.0.0.1:8001/vectorize');

            if ($response->failed() || !$response->json('success')) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Lỗi AI: ' . ($response->json('message') ?? 'Không thể kết nối Python 8001')
                ], 500);
            }

            $targetVector = $response->json('vector');
            $predictedCategory = $response->json('category') ?? 'khac';

            
            $productImages = DB::table('product_images')->get();
            $imageToProductMap = [];
            foreach ($productImages as $img) {
                $imgId = $img->ImageID ?? $img->image_id ?? $img->id ?? null;
                $prodId = $img->ProductID ?? $img->product_id ?? null;
                if ($imgId && $prodId) {
                    $imageToProductMap[$imgId] = $prodId;
                }
            }

            
            $dbProducts = Product::with('category')->get();
            $productGroups = [];
            foreach ($dbProducts as $product) {
                $pid = $product->ProductID ?? $product->id;
                $productGroups[$pid] = $this->getProductCategoryGroup($product);
            }

            
            $productVectors = DB::table('product_vectors')->get();
            $similarities = [];

            foreach ($productVectors as $pv) {
                $vectorData = $pv->VectorData ?? null;
                $imageId = $pv->ImageID ?? null;

                if (!$vectorData || !$imageId || !isset($imageToProductMap[$imageId])) {
                    continue;
                }

                $productId = $imageToProductMap[$imageId];

                
                if (isset($productGroups[$productId])) {
                    $prodGroup = $productGroups[$productId];
                    if ($predictedCategory !== 'khac' && $prodGroup !== 'khac' && $prodGroup !== $predictedCategory) {
                        continue;
                    }
                }

                $currentVector = json_decode($vectorData, true);
                if (!is_array($currentVector)) continue;

                
                $similarity = 0;
                foreach ($targetVector as $index => $value) {
                    $similarity += $value * ($currentVector[$index] ?? 0);
                }

                
                if (!isset($similarities[$productId]) || $similarity > $similarities[$productId]) {
                    $similarities[$productId] = $similarity;
                }
            }

            
            arsort($similarities);
            
            
            $minThreshold = 0.73;
            $similarities = array_filter($similarities, fn($score) => $score >= $minThreshold);
            
            $topProductIds = array_slice(array_keys($similarities), 0, 5, true);

            if (empty($topProductIds)) {
                return response()->json(['success' => true, 'data' => [], 'similarities' => []]);
            }

            
            $similarityScores = [];
            foreach ($topProductIds as $pid) {
                $similarityScores[$pid] = round(max(0, $similarities[$pid]) * 100, 1);
            }

            
            $idsOrder = implode(',', $topProductIds);
            $firstProduct = Product::first();
            $primaryKey = ($firstProduct && isset($firstProduct->ProductID)) ? 'ProductID' : 'id';

            $products = Product::with(['variants'])
                ->whereIn($primaryKey, $topProductIds)
                ->orderByRaw("FIELD($primaryKey, $idsOrder)")
                ->get();

            return response()->json([
                'success' => true,
                'data' => ProductResource::collection($products),
                'similarities' => $similarityScores
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi Laravel: ' . $e->getMessage()], 500);
        }
    }

    
    public function syncVectors(Request $request)
    {
        try {
            
            $isForce = $request->query('force') === 'true';

            $images = DB::table('product_images')->get();
            if ($images->isEmpty()) {
                return response()->json(['success' => false, 'message' => 'Bảng product_images trống!']);
            }

            $count = 0;
            $scanned = 0;
            $reportErrors = [];

            foreach ($images as $img) {
                $scanned++;
                $imgId = $img->ImageID ?? $img->image_id ?? $img->id ?? null;
                $path = $img->Url ?? $img->ImagePath ?? $img->image_path ?? $img->path ?? $img->url ?? null;

                if (!$imgId || !$path) {
                    $reportErrors[] = "Dòng số {$scanned}: Thiếu dữ liệu ảnh.";
                    continue;
                }

                
                $exists = DB::table('product_vectors')->where('ImageID', $imgId)->exists();
                if ($exists && !$isForce) {
                    continue;
                }

                if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    $fullPath = $path;
                } else {
                    
                    $fullPath = storage_path('app/public/' . $path);
                    if (!file_exists($fullPath)) {
                        $cleanedPath = str_replace(['storage/', 'public/'], '', $path);
                        $fullPath = storage_path('app/public/' . $cleanedPath);
                    }
                    if (!file_exists($fullPath)) {
                        $fullPath = public_path($path);
                    }

                    if (!file_exists($fullPath)) {
                        $reportErrors[] = "Ảnh ID {$imgId}: Không tìm thấy file thật tại: " . $fullPath;
                        continue;
                    }
                }

                
                $success = self::executeVectorization($imgId, $fullPath, $isForce);
                if ($success) {
                    $count++;
                } else {
                    $reportErrors[] = "Ảnh ID {$imgId}: Lỗi khi gửi sang máy chủ Python AI.";
                }
            }

            return response()->json([
                'success' => true,
                'message' => $isForce ? "Đã ép buộc quét đè lại TOÀN BỘ kho ảnh!" : "Quá trình quét ảnh mới hoàn tất!",
                'so_luong_anh_da_dich_thanh_vector' => $count,
                'tong_so_anh_da_quet_qua' => $scanned,
                'danh_sach_loi' => $reportErrors
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    
    public static function vectorizeSingleImage($imgId, $relativePath)
    {
        if (str_starts_with($relativePath, 'http://') || str_starts_with($relativePath, 'https://')) {
            $fullPath = $relativePath;
        } else {
            $fullPath = storage_path('app/public/' . $relativePath);
            if (!file_exists($fullPath)) {
                $fullPath = public_path($relativePath);
            }
            
            if (!file_exists($fullPath)) {
                \Log::error("Tự động Vector thất bại: Không tìm thấy file tại " . $fullPath);
                return false;
            }
        }

        return self::executeVectorization($imgId, $fullPath, true);
    }

    
    private static function executeVectorization($imgId, $absolutePath, $shouldDeleteOld = false)
    {
        try {
            $response = Http::attach(
                'image', file_get_contents($absolutePath), basename($absolutePath)
            )->post('http://127.0.0.1:8001/vectorize');

            if ($response->successful() && $response->json('success')) {
                $vector = $response->json('vector');
                
                if ($shouldDeleteOld) {
                    DB::table('product_vectors')->where('ImageID', $imgId)->delete();
                }

                DB::table('product_vectors')->insert([
                    'ImageID' => $imgId,
                    'VectorData' => json_encode($vector)
                ]);
                return true;
            }
            return false;
        } catch (\Exception $e) {
            \Log::error("Lỗi executeVectorization cho ảnh ID {$imgId}: " . $e->getMessage());
            return false;
        }
    }

    
    private function getProductCategoryGroup($product)
    {
        $name = mb_strtolower($product->Name ?? '');
        
        $categoryName = '';
        if ($product->category) {
            $categoryName = mb_strtolower($product->category->Name ?? '');
        }

        
        if (
            str_contains($name, 'quần') || 
            str_contains($name, 'jean') || 
            str_contains($name, 'short') || 
            str_contains($name, 'jogger') ||
            str_contains($categoryName, 'quần')
        ) {
            return 'quan';
        }

        
        if (
            str_contains($name, 'váy') || 
            str_contains($name, 'đầm') || 
            str_contains($categoryName, 'váy') || 
            str_contains($categoryName, 'đầm')
        ) {
            return 'vay';
        }

        
        if (
            str_contains($name, 'áo') || 
            str_contains($name, 'polo') || 
            str_contains($name, 'sơ mi') || 
            str_contains($name, 'hoodie') || 
            str_contains($name, 'bomber') || 
            str_contains($name, 'thun') ||
            str_contains($categoryName, 'áo') || 
            str_contains($categoryName, 'polo') || 
            str_contains($categoryName, 'sơ mi')
        ) {
            return 'ao';
        }

        
        return 'khac';
    }
}