<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoucherUsage extends Model
{
    protected $table = 'voucher_usages';

    protected $fillable = [
        'VoucherID',
        'UserID',
        'OrderID',
        'DiscountAmount',
    ];

    
    public function voucher()
    {
        return $this->belongsTo(Voucher::class, 'VoucherID', 'VoucherID');
    }

    
    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    
    public function order()
    {
        return $this->belongsTo(Order::class, 'OrderID', 'OrderID');
    }
}
