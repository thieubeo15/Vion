<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    
    public function authorize(): bool
    {
        return true;
    }

    
    public function rules(): array
    {
        return [
            'Name' => 'sometimes|required|string|max:255|unique:categories,Name,' . $this->route('id') . ',CategoryID',
            'ParentID' => 'nullable|integer|exists:categories,CategoryID',
        ];
    }

    public function messages(): array
    {
        return [
            'Name.required' => 'Tên danh mục là bắt buộc.',
            'Name.max' => 'Tên danh mục không được vượt quá 255 ký tự.',
            'Name.unique' => 'Tên danh mục đã tồn tại trong hệ thống.',
            'ParentID.integer' => 'ID danh mục cha phải là số nguyên.',
            'ParentID.exists' => 'Danh mục cha không tồn tại.',
        ];
    }
}
