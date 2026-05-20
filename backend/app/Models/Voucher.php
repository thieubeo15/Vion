<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $table = 'vouchers';
    protected $primaryKey = 'VoucherID';

    protected $fillable = [
        'Code',
        'Type',
        'Value',
        'MaxDiscount',
        'MinOrderAmount',
        'UsageLimit',
        'UsedCount',
        'PerUserLimit',
        'StartDate',
        'EndDate',
        'IsActive',
        'Description',
        'Visibility',
    ];

    protected $casts = [
        'StartDate' => 'datetime',
        'EndDate'   => 'datetime',
        'IsActive'  => 'boolean',
    ];

    // Quan hệ: Một voucher có nhiều lượt sử dụng
    public function usages()
    {
        return $this->hasMany(VoucherUsage::class, 'VoucherID', 'VoucherID');
    }
}
