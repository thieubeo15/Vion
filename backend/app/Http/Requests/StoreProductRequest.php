<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
{
    return [
        'CategoryID' => 'required|integer|exists:categories,CategoryID',
        'Name' => 'required|string|max:255',
        'MainImage' => 'required|image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120', 
        'Description' => 'nullable|string',
        'Material' => 'nullable|string|max:255',
        'UsageInstruction' => 'nullable|string',
        'variants' => 'nullable|string', 
        'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120', 
    ];
}
}
