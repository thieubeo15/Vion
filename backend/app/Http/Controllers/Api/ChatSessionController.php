<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use Illuminate\Http\Request;

class ChatSessionController extends Controller
{
    public function index() { return response()->json(ChatSession::with('messages')->get()); }
    
    public function store(Request $request) {
        $request->validate([
            'UserID' => 'required|exists:users,UserID',
            'StartTime' => 'required|date'
        ]);
        return response()->json(ChatSession::create($request->all()), 201);
    }

    public function show($id) {
        $s = ChatSession::with('messages')->find($id);
        return $s ? response()->json($s) : response()->json(['message' => 'Not found'], 404);
    }

    public function destroy($id) {
        $s = ChatSession::find($id);
        if ($s) $s->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
