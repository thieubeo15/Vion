<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatSession extends Model
{
    protected $table = 'chat_sessions';
    protected $primaryKey = 'SessionID';
    public $timestamps = false;

    protected $fillable = [
        'UserID',
        'StartTime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'UserID', 'UserID');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'SessionID', 'SessionID');
    }
}
