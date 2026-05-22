<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';
    protected $primaryKey = 'NotificationID';
    public $timestamps = true;

    protected $fillable = [
        'UserID',
        'Title',
        'Content',
        'Type',
        'RedirectUrl',
        'IsRead',
        'IsAdminNotification',
    ];

    protected $casts = [
        'IsRead' => 'boolean',
        'IsAdminNotification' => 'boolean',
    ];

    // Quan hệ với User
    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }
}
