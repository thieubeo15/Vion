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
}