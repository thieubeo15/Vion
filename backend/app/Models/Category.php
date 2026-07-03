<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';
    protected $primaryKey = 'CategoryID';
    
    
    public $timestamps = false; 

    protected $fillable = ['Name', 'ParentID'];

    
    public function parent()
    {
        return $this->belongsTo(Category::class, 'ParentID', 'CategoryID');
    }

    
    public function children()
    {
        return $this->hasMany(Category::class, 'ParentID', 'CategoryID');
    }

    
    public function products()
    {
        return $this->hasMany(Product::class, 'CategoryID', 'CategoryID');
    }
}