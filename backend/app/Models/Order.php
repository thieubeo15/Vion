<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    // Báo cho Laravel biết khóa chính không phải là 'id'
    protected $primaryKey = 'OrderID';

    // Nếu bạn không dùng created_at/updated_at thì tắt timestamps
    public $timestamps = false;

    // Định nghĩa quan hệ với User (UserID khớp với migration của bạn)
    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    protected $fillable = [
        'UserID', 
        'FullName', 
        'Phone', 
        'Address', 
        'TotalAmount', 
        'OrderDate', 
        'Status', 
        'PaymentMethod'
    ];

    // --- THÊM ĐOẠN NÀY VÀO ---
    public function details()
    {
        // Một đơn hàng có NHIỀU chi tiết đơn hàng
        // 'OrderID' đầu tiên là khóa ngoại trong bảng order_details
        // 'OrderID' thứ hai là khóa chính của bảng orders
        return $this->hasMany(OrderDetail::class, 'OrderID', 'OrderID');
    }

    // Nếu có bảng payments, bro có thể thêm luôn (để tránh lỗi sau này)
    public function payment()
    {
        return $this->hasOne(Payment::class, 'OrderID', 'OrderID');
    }
    
}