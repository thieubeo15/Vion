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

    // Thuộc về một voucher
    public function voucher()
    {
        return $this->belongsTo(Voucher::class, 'VoucherID', 'VoucherID');
    }

    // Thuộc về một user
    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    // Thuộc về một đơn hàng
    public function order()
    {
        return $this->belongsTo(Order::class, 'OrderID', 'OrderID');
    }
}
