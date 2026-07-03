<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    
    public function toArray($request): array
{
    return [
        'id' => $this->CategoryID,
        'name' => $this->Name,
        'parent_id' => $this->ParentID,
        'Image' => $this->Image, 
        'children' => CategoryResource::collection($this->whenLoaded('children')),
    ];
}
}
