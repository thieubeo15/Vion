<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request) {
        $request->validate([
            'UserID' => 'required|exists:users,UserID',
            'Sender' => 'required|string|max:20',
            'Content' => 'required|string',
            'SentAt' => 'required|date'
        ]);
        return response()->json(Message::create($request->all()), 201);
    }

    public function getUserMessages($userId) {
        $messages = Message::where('UserID', $userId)->orderBy('SentAt', 'asc')->get();
        return response()->json($messages);
    }

    public function destroy($id) {
        $m = Message::find($id);
        if ($m) $m->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
