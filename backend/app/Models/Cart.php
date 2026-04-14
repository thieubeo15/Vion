<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $table = 'carts';
    protected $primaryKey = 'CartID';
    public $timestamps = false; // as per migration

    protected $fillable = [
        'UserID'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    public function items()
    {
        return $this->hasMany(CartItem::class, 'CartID', 'CartID');
    }
}
