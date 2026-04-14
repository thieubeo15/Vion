<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $table = 'cart_items';
    protected $primaryKey = 'CartItemID';
    public $timestamps = false;

    protected $fillable = [
        'CartID',
        'VariantID',
        'Quantity'
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class, 'CartID', 'CartID');
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'VariantID', 'VariantID');
    }
}
