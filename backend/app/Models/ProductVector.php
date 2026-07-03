<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVector extends Model
{
    protected $table = 'product_vectors';
    protected $primaryKey = 'VectorID';
    
    public $timestamps = false;

    protected $fillable = [
        'ImageID',
        'VectorData'
    ];

    
    public function image()
    {
        return $this->belongsTo(ProductImage::class, 'ImageID', 'ImageID');
    }
}
