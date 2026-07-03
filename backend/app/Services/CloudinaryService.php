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

    
    public function upload(string $filePath, string $folder = 'vion'): string
    {
        $result = $this->cloudinary->uploadApi()->upload($filePath, [
            'folder'    => $folder,
            'overwrite' => true,
            'resource_type' => 'image',
        ]);

        return $result['secure_url'];
    }

    
    public function deleteByUrl(string $url): void
    {
        
        
        if (!str_contains($url, 'cloudinary.com')) return;

        $parsed = parse_url($url, PHP_URL_PATH);
        
        $parts = explode('/upload/', $parsed);
        if (count($parts) < 2) return;

        $withVersion = $parts[1]; 
        $withoutVersion = preg_replace('/^v\d+\//', '', $withVersion); 
        $publicId = pathinfo($withoutVersion, PATHINFO_DIRNAME)
            . '/' . pathinfo($withoutVersion, PATHINFO_FILENAME); 

        $this->cloudinary->uploadApi()->destroy($publicId);
    }
}
