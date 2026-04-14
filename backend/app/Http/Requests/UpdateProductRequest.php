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
            'MainImage' => 'sometimes|required|string|max:255',
            'Description' => 'nullable|string',
        ];
    }
}
