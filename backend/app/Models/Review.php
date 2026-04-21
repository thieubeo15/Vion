<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $table = 'reviews';
    protected $primaryKey = 'ReviewID';
    public $timestamps = false;

   protected $fillable = [
    'UserID', 
    'ProductID', 
    'Rating', 
    'Content', // <--- THÊM CHỮ NÀY VÀO, VIẾT HOA CHỮ C
    'Image'
];

    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'ProductID');
    }
}
