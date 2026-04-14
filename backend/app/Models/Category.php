<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';
    protected $primaryKey = 'CategoryID';
    
    // Tắt tự động lưu thời gian
    public $timestamps = false; 

    protected $fillable = ['Name', 'ParentID'];

    /**
     * Mối quan hệ với danh mục cha (Parent)
     */
    public function parent()
    {
        return $this->belongsTo(Category::class, 'ParentID', 'CategoryID');
    }

    /**
     * Mối quan hệ với các danh mục con (Children)
     */
    public function children()
    {
        return $this->hasMany(Category::class, 'ParentID', 'CategoryID');
    }

    /**
     * Mối quan hệ với các sản phẩm (Products)
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'CategoryID', 'CategoryID');
    }
}