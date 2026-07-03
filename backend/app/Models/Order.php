<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    
    protected $primaryKey = 'OrderID';

    
    public $timestamps = true;

    
    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    protected $fillable = [
        'UserID', 
        'FullName', 
        'Phone', 
        'Address', 
        'SpecificAddress',
        'Province',
        'District',
        'Ward',
        'TotalAmount', 
        'OrderDate', 
        'Status', 
        'PaymentMethod',
        'VoucherCode',
        'DiscountAmount',
        'ShippingFee',
        'CancelReason',
        'ReturnReason',
        'RefundMethod',
        'RefundDetails',
        'ReturnAdminNote'
    ];

    
    public function details()
    {
        
        
        
        return $this->hasMany(OrderDetail::class, 'OrderID', 'OrderID');
    }

}