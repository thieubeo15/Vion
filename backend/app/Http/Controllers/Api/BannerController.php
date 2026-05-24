<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use App\Services\CloudinaryService;

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
            'image'    => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'title'    => 'nullable|string',
            'subtitle' => 'nullable|string',
        ]);

        if ($request->hasFile('image')) {
            $cloudinary = new CloudinaryService();
            $imageUrl = $cloudinary->upload(
                $request->file('image')->getRealPath(),
                'vion/banners'
            );

            $banner = Banner::create([
                'image_path' => $imageUrl,
                'title'      => $request->title,
                'subtitle'   => $request->subtitle,
                'link'       => $request->link,
                'is_active'  => true,
            ]);

            return response()->json($banner, 201);
        }

        return response()->json(['message' => 'Không có file ảnh'], 400);
    }

    // Xóa Banner
    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);

        // Xóa ảnh trên Cloudinary nếu là URL Cloudinary
        if ($banner->image_path && str_contains($banner->image_path, 'cloudinary.com')) {
            $cloudinary = new CloudinaryService();
            $cloudinary->deleteByUrl($banner->image_path);
        }

        $banner->delete();
        return response()->json(['message' => 'Đã xóa banner']);
    }
}