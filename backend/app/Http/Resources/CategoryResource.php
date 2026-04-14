<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
{
    return [
        'id' => $this->CategoryID,
        'name' => $this->Name,
        'parent_id' => $this->ParentID,
        'Image' => $this->Image, // CỰC KỲ QUAN TRỌNG: Phải có dòng này ảnh mới hiện
        'children' => CategoryResource::collection($this->whenLoaded('children')),
    ];
}
}
