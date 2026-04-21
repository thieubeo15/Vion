<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'CategoryID' => 'nullable|integer|exists:categories,CategoryID',
            'Name' => 'sometimes|required|string|max:255',
            'MainImage' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120',
            'Description' => 'nullable|string',
            'variants' => 'nullable|string', // Chuỗi JSON từ React
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120', // Gallery images
        ];
    }
}
