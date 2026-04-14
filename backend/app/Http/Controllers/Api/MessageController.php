<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request) {
        $request->validate([
            'SessionID' => 'required|exists:chat_sessions,SessionID',
            'Sender' => 'required|string|max:20',
            'Content' => 'required|string',
            'SentAt' => 'required|date'
        ]);
        return response()->json(Message::create($request->all()), 201);
    }

    public function show($id) {
        $m = Message::find($id);
        return $m ? response()->json($m) : response()->json(['message' => 'Not found'], 404);
    }

    public function destroy($id) {
        $m = Message::find($id);
        if ($m) $m->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
