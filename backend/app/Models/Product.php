<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'ProductID';
    
    
    public $timestamps = true;

  protected $fillable = ['Name', 'CategoryID', 'MainImage', 'Description', 'sold_count', 'Material', 'UsageInstruction'];

    
    public function category()
    {
        return $this->belongsTo(Category::class, 'CategoryID', 'CategoryID');
    }

    
    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'ProductID', 'ProductID');
    }

    
    public function images()
    {
        return $this->hasMany(ProductImage::class, 'ProductID', 'ProductID');
    }

    
    public function reviews()
    {
        return $this->hasMany(Review::class, 'ProductID', 'ProductID'); 
    }

    
    public function orderDetails()
    {
        return $this->hasManyThrough(
            OrderDetail::class,
            ProductVariant::class,
            'ProductID', 
            'VariantID', 
            'ProductID', 
            'VariantID'  
        );
    }
    
}