<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $table = 'product_variants';
    protected $primaryKey = 'VariantID';
    
    public $timestamps = false; // Bảng này không có timestamps trong migration

    protected $fillable = [
        'ProductID',
        'Size',
        'Color',
        'Price',
        'Stock'
    ];

    /**
     * Biến thể thuộc về một sản phẩm
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }
}
