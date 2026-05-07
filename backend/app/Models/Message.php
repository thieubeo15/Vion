<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'messages';
    protected $primaryKey = 'MessageID';
    public $timestamps = false;

    protected $fillable = [
        'UserID',
        'Sender',
        'Content',
        'SentAt'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }
}
