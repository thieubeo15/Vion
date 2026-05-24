<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;

class CloudinaryService
{
    protected Cloudinary $cloudinary;

    public function __construct()
    {
        $config = [
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key'    => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
            'url' => [
                'secure' => true,
            ],
        ];

        $this->cloudinary = new Cloudinary($config);
    }

    /**
     * Upload một file ảnh lên Cloudinary
     *
     * @param  string  $filePath  Đường dẫn thực của file (getRealPath())
     * @param  string  $folder    Thư mục con trong Cloudinary (vd: 'vion/products')
     * @return string  URL https đầy đủ của ảnh trên Cloudinary
     */
    public function upload(string $filePath, string $folder = 'vion'): string
    {
        $result = $this->cloudinary->uploadApi()->upload($filePath, [
            'folder'    => $folder,
            'overwrite' => true,
            'resource_type' => 'image',
        ]);

        return $result['secure_url'];
    }

    /**
     * Xóa ảnh khỏi Cloudinary theo public_id
     * public_id = phần path không có đuôi mở rộng (vd: 'vion/products/abc123')
     *
     * @param  string  $url  URL đầy đủ của ảnh Cloudinary
     */
    public function deleteByUrl(string $url): void
    {
        // Trích xuất public_id từ URL Cloudinary
        // URL dạng: https://res.cloudinary.com/cloud/image/upload/v123/vion/products/file.jpg
        if (!str_contains($url, 'cloudinary.com')) return;

        $parsed = parse_url($url, PHP_URL_PATH);
        // Bỏ /cloud_name/image/upload/vXXX/ ở đầu, bỏ đuôi file
        $parts = explode('/upload/', $parsed);
        if (count($parts) < 2) return;

        $withVersion = $parts[1]; // vd: v1234567/vion/products/file.jpg
        $withoutVersion = preg_replace('/^v\d+\//', '', $withVersion); // vion/products/file.jpg
        $publicId = pathinfo($withoutVersion, PATHINFO_DIRNAME)
            . '/' . pathinfo($withoutVersion, PATHINFO_FILENAME); // vion/products/file

        $this->cloudinary->uploadApi()->destroy($publicId);
    }
}
