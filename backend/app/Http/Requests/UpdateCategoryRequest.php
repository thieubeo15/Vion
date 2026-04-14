<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'Name' => 'sometimes|required|string|max:255',
            'ParentID' => 'nullable|integer|exists:categories,CategoryID',
        ];
    }

    public function messages(): array
    {
        return [
            'Name.required' => 'Tên danh mục là bắt buộc.',
            'Name.max' => 'Tên danh mục không được vượt quá 255 ký tự.',
            'ParentID.integer' => 'ID danh mục cha phải là số nguyên.',
            'ParentID.exists' => 'Danh mục cha không tồn tại.',
        ];
    }
}
