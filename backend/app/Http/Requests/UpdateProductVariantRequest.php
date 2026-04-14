<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'Size' => 'sometimes|required|string|max:20',
            'Color' => 'sometimes|required|string|max:50',
            'Price' => 'sometimes|required|numeric|min:0',
            'Stock' => 'sometimes|required|integer|min:0',
        ];
    }
}
