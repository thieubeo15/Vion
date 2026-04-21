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
            'sold_count' => (int) ($this->sold_count ?? 0),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships (được load theo ngữ cảnh)
            'category' => new CategoryResource($this->whenLoaded('category')),
            // Nếu có Variants, trả về luôn list variant
            'variants' => $this->whenLoaded('variants'),
            'images' => $this->whenLoaded('images'),
            'reviews' => $this->whenLoaded('reviews', function () {
                // Sắp xếp reviews mới nhất lên đầu
                return $this->reviews->sortByDesc('created_at')->values();
            }),
            'average_rating' => $this->whenLoaded('reviews') ? round($this->reviews->avg('Rating'), 1) : 0,
        ];
    }
}
