<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $table = 'product_variants';
    protected $primaryKey = 'VariantID';
    
    public $timestamps = false; 

    protected $fillable = [
        'ProductID',
        'Size',
        'Color',
        'Price',
        'DiscountPrice',
        'Stock',
        'ImportPrice'
    ];

    
    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }
}
