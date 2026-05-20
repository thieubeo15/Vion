<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserVoucher extends Model
{
    protected $table = 'user_vouchers';

    protected $fillable = [
        'UserID',
        'VoucherID',
        'Source',
        'IsUsed',
    ];

    protected $casts = [
        'IsUsed' => 'boolean',
    ];

    // Quan hệ: Thuộc về một user
    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    // Quan hệ: Thuộc về một voucher
    public function voucher()
    {
        return $this->belongsTo(Voucher::class, 'VoucherID', 'VoucherID');
    }
}
