<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'messages';
    protected $primaryKey = 'MessageID';
    public $timestamps = false;

    protected $fillable = [
        'SessionID',
        'Sender',
        'Content',
        'SentAt'
    ];

    public function session()
    {
        return $this->belongsTo(ChatSession::class, 'SessionID', 'SessionID');
    }
}
