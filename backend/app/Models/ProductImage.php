<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $table = 'product_images';
    protected $primaryKey = 'ImageID';
    
    public $timestamps = false;

    protected $fillable = [
        'ProductID',
        'Url'
    ];

    /**
     * Hình ảnh thuộc về một sản phẩm
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }

    /**
     * Hình ảnh có một vector data
     */
    public function vector()
    {
        return $this->hasOne(ProductVector::class, 'ImageID', 'ImageID');
    }
}
