<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Resources\CategoryResource;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;

class CategoryController extends Controller
{
    /**
     * Lấy danh sách tất cả danh mục.
     */
public function index()
{
    // 1. Phải có with('children') để lấy quan hệ con
    // 2. Phải có whereNull('ParentID') để chỉ lấy các thằng CHA to nhất ở ngoài
    $categories = Category::with('children')->whereNull('ParentID')->get();
    
    return response()->json([
        'success' => true,
        'data' => CategoryResource::collection($categories)
    ], 200);
}
    /**
     * Tạo mới một danh mục.
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Tạo danh mục thành công.',
            'data' => new CategoryResource($category)
        ], 201);
    }

    /**
     * Hiển thị thông tin chi tiết một danh mục theo ID.
     */
    public function show($id)
    {
        $category = Category::with(['children', 'parent'])->find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category)
        ], 200);
    }

    /**
     * Cập nhật thông tin danh mục.
     */
    public function update(UpdateCategoryRequest $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục.'
            ], 404);
        }

        $category->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật danh mục thành công.',
            'data' => new CategoryResource($category)
        ], 200);
    }

    /**
     * Xóa danh mục.
     */
    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục.'
            ], 404);
        }

        // Kiểm tra xem danh mục có con hay không trước khi xóa (Tuỳ chọn)
        if ($category->children()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa danh mục này vì vẫn còn danh mục con.'
            ], 400);
        }

        // Tương tự, có thể kiểm tra danh mục có sản phẩm không
        if ($category->products()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa danh mục này vì đã có sản phẩm thuộc về danh mục này.'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa danh mục thành công.'
        ], 200);
    }
}
