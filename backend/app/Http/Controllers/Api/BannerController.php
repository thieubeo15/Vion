<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    // Lấy danh sách Banner hiện ra trang chủ
    public function index()
    {
        return response()->json(Banner::where('is_active', true)->get());
    }

    // Admin thêm Banner mới (Có upload ảnh)
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'title' => 'nullable|string',
            'subtitle' => 'nullable|string',
        ]);

        if ($request->hasFile('image')) {
            // Lưu ảnh vào thư mục storage/app/public/banners
            $path = $request->file('image')->store('banners', 'public');

            $banner = Banner::create([
                'image_path' => $path,
                'title' => $request->title,
                'subtitle' => $request->subtitle,
                'link' => $request->link,
                'is_active' => true
            ]);

            return response()->json($banner, 201);
        }
    }

    // Xóa Banner
    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);
        
        // Xóa file ảnh vật lý trong thư mục storage để tránh nặng máy
        Storage::disk('public')->delete($banner->image_path);
        
        $banner->delete();
        return response()->json(['message' => 'Đã xóa banner']);
    }
}