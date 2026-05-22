<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // Lấy danh sách thông báo
    public function index()
    {
        $user = Auth::user();
        $query = Notification::query();

        if ($user->Role === 'Admin') {
            // Admin nhận thông báo chung cho Admin HOẶC gửi riêng cho mình
            $query->where(function($q) use ($user) {
                $q->where('IsAdminNotification', true)
                  ->orWhere('UserID', $user->UserID);
            });
        } else {
            // Customer chỉ nhận thông báo của chính mình
            $query->where('UserID', $user->UserID)
                  ->where('IsAdminNotification', false);
        }

        $notifications = $query->orderBy('NotificationID', 'desc')
                               ->take(20)
                               ->get();

        // Tính số lượng chưa đọc (phải clone query hoặc xây dựng query mới để tránh bị ảnh hưởng bởi take(20))
        $unreadQuery = Notification::query();
        if ($user->Role === 'Admin') {
            $unreadQuery->where(function($q) use ($user) {
                $q->where('IsAdminNotification', true)
                  ->orWhere('UserID', $user->UserID);
            });
        } else {
            $unreadQuery->where('UserID', $user->UserID)
                        ->where('IsAdminNotification', false);
        }
        $unreadCount = $unreadQuery->where('IsRead', false)->count();

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    // Đánh dấu 1 thông báo là đã đọc
    public function markAsRead($id)
    {
        $user = Auth::user();
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông báo.'
            ], 404);
        }

        // Kiểm tra quyền sở hữu thông báo
        if ($notification->IsAdminNotification) {
            if ($user->Role !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Không có quyền truy cập.'
                ], 403);
            }
        } else {
            if ($notification->UserID !== $user->UserID) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không có quyền truy cập.'
                ], 403);
            }
        }

        $notification->update(['IsRead' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Đã đánh dấu đọc.'
        ]);
    }

    // Đánh dấu đọc tất cả
    public function markAllAsRead()
    {
        $user = Auth::user();

        if ($user->Role === 'Admin') {
            Notification::where(function($q) use ($user) {
                $q->where('IsAdminNotification', true)
                  ->orWhere('UserID', $user->UserID);
            })->where('IsRead', false)->update(['IsRead' => true]);
        } else {
            Notification::where('UserID', $user->UserID)
                        ->where('IsAdminNotification', false)
                        ->where('IsRead', false)
                        ->update(['IsRead' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã đọc tất cả thông báo.'
        ]);
    }
}
