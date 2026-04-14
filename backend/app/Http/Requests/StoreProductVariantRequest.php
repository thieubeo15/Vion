<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ProductID' => 'required|integer|exists:products,ProductID',
            'Size' => 'required|string|max:20',
            'Color' => 'required|string|max:50',
            'Price' => 'required|numeric|min:0',
            'Stock' => 'required|integer|min:0',
        ];
    }
}
