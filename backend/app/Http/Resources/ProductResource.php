<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ProductID,
            'category_id' => $this->CategoryID,
            'name' => $this->Name,
            'main_image' => $this->MainImage,
            'description' => $this->Description,
            'material' => $this->Material,
            'usage_instruction' => $this->UsageInstruction,
            'sold_count' => (int) ($this->sold_count ?? 0),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            'category' => new CategoryResource($this->whenLoaded('category')),
            
            // 🚀 SỬA LẠI ĐOẠN VARIANTS Ở ĐÂY
            'variants' => $this->whenLoaded('variants', function () {
                return $this->variants->map(function ($v) {
                    $variantData = [
                        'id' => $v->VariantID,
                        'size' => $v->Size,
                        'color' => $v->Color,
                        'price' => $v->Price,
                        'discount_price' => $v->DiscountPrice,
                        'discount_percent' => ($v->DiscountPrice !== null && $v->DiscountPrice < $v->Price) 
                            ? (int) round((($v->Price - $v->DiscountPrice) / $v->Price) * 100) 
                            : 0,
                        'stock' => $v->Stock,
                    ];

                    // 🛑 CHỈ HIỆN GIÁ NHẬP NẾU LÀ ADMIN
                    $user = request()->user('sanctum');
                    
                    // Luôn luôn trả về import_price để test xem DB có lưu không
                    $variantData['import_price'] = $v->ImportPrice;

                    return $variantData;
                });
            }),

            'images' => $this->whenLoaded('images'),
            'reviews' => $this->whenLoaded('reviews', function () {
                return $this->reviews->sortByDesc('created_at')->values();
            }),
            'average_rating' => $this->whenLoaded('reviews') ? round($this->reviews->avg('Rating'), 1) : 0,
        ];
    }
}