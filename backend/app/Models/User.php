<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'UserID';
    public $timestamps = true;

    protected $fillable = [
        'Email',
        'Password',
        'Role',
        'FullName',
        'Phone',
        'Address',
    ];

    protected $hidden = [
        'Password',
        'remember_token',
    ];

    public function getAuthPassword()
    {
        return $this->Password;
    }

    public function orders() {
        return $this->hasMany(Order::class, 'UserID', 'UserID');
    }

    public function reviews() {
        return $this->hasMany(Review::class, 'UserID', 'UserID');
    }

    public function cart() {
        return $this->hasOne(Cart::class, 'UserID', 'UserID');
    }
}