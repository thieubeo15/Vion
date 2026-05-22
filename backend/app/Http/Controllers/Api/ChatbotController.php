<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatbotMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    /**
     * Gửi tin nhắn tới chatbot AI
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'session_id' => 'nullable|string'
        ]);

        $user = $request->user('sanctum');
        $userId = $user ? $user->UserID : null;
        $sessionId = $request->session_id;

        if (!$userId && !$sessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Thiếu thông tin nhận diện người dùng (UserID hoặc session_id)!'
            ], 400);
        }

        try {
            // 1. Lưu tin nhắn của User vào database
            $userMessage = ChatbotMessage::create([
                'session_id' => $sessionId,
                'UserID'     => $userId,
                'Role'       => 'user',
                'Content'    => $request->message
            ]);

            // 2. Lấy 15 tin nhắn gần nhất làm lịch sử ngữ cảnh
            $query = ChatbotMessage::query();
            if ($userId) {
                $query->where('UserID', $userId);
            } else {
                $query->where('session_id', $sessionId);
            }

            $history = $query->orderBy('created_at', 'asc')
                ->limit(15)
                ->get()
                ->map(function ($msg) {
                    return [
                        'role' => $msg->Role, // 'user' hoặc 'assistant'
                        'content' => $msg->Content
                    ];
                })
                ->toArray();

            // 3. Gửi sang Python AI Server ở cổng 8002
            $pythonUrl = 'http://127.0.0.1:8002/chat';
            
            // Lấy API key từ env, nếu không có thì lấy giá trị mặc định trống
            $geminiKey = env('GEMINI_API_KEY', '');

            // Hỗ trợ xoay vòng nhiều key ngăn cách bởi dấu phẩy
            if (str_contains($geminiKey, ',')) {
                $keys = array_filter(array_map('trim', explode(',', $geminiKey)));
                if (!empty($keys)) {
                    $geminiKey = $keys[array_rand($keys)];
                }
            }

            $response = Http::timeout(120)->post($pythonUrl, [
                'message' => $request->message,
                'history' => $history,
                'gemini_api_key' => $geminiKey
            ]);

            if ($response->failed()) {
                $errorMsg = $response->json('detail') ?? $response->body();
                Log::error('Python AI Service failed. Status: ' . $response->status() . ' Error: ' . $errorMsg);
                throw new \Exception('Lỗi từ Máy chủ AI: ' . $errorMsg);
            }

            $reply = $response->json('reply') ?? 'Rất tiếc, AI không phản hồi vào lúc này.';

            // 4. Lưu câu trả lời của AI vào database
            $aiMessage = ChatbotMessage::create([
                'session_id' => $sessionId,
                'UserID'     => $userId,
                'Role'       => 'assistant',
                'Content'    => $reply
            ]);

            return response()->json([
                'success' => true,
                'reply'   => $reply,
                'data'    => $aiMessage
            ]);

        } catch (\Exception $e) {
            Log::error('Chatbot Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy lịch sử hội thoại
     */
    public function getHistory(Request $request)
    {
        $user = $request->user('sanctum');
        $userId = $user ? $user->UserID : null;
        $sessionId = $request->query('session_id');

        if (!$userId && !$sessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Thiếu thông tin session_id hoặc người dùng chưa đăng nhập!'
            ], 400);
        }

        $query = ChatbotMessage::query();
        if ($userId) {
            $query->where('UserID', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        $history = $query->orderBy('created_at', 'asc')->get();

        return response()->json([
            'success' => true,
            'data'    => $history
        ]);
    }
}
