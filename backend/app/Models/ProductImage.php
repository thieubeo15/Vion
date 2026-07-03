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

    
    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }

    
    public function vector()
    {
        return $this->hasOne(ProductVector::class, 'ImageID', 'ImageID');
    }
}
