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
        'MainImage' => 'required|image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120', // Hỗ trợ mọi loại ảnh, tối đa 5MB
        'Description' => 'nullable|string',
        'variants' => 'nullable|string', // Nhận chuỗi JSON từ React gửi lên
        'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,svg|max:5120', // Cho phép nhiều ảnh phụ
    ];
}
}
