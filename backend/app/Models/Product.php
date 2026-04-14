<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'ProductID';
    
    // Tự động quản lý created_at, updated_at
    public $timestamps = true;

    protected $fillable = [
        'CategoryID',
        'Name',
        'MainImage',
        'Description'
    ];

    /**
     * Thuộc về một danh mục
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'CategoryID', 'CategoryID');
    }

    /**
     * Dòng sản phẩm có nhiều biến thể
     */
    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'ProductID', 'ProductID');
    }

    /**
     * Sản phẩm có nhiều hình ảnh phụ
     */
    public function images()
    {
        return $this->hasMany(ProductImage::class, 'ProductID', 'ProductID');
    }

    /**
     * Sản phẩm có nhiều lượt đánh giá
     */
    public function reviews()
    {
        return $this->hasMany(Review::class, 'ProductID', 'ProductID'); // Giả sử bảng reviews liên kết tới ProductID
    }
}
