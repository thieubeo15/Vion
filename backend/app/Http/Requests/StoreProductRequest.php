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
            'CategoryID' => 'nullable|integer|exists:categories,CategoryID',
            'Name' => 'required|string|max:255',
            'MainImage' => 'required|string|max:255',
            'Description' => 'nullable|string',
        ];
    }
}
