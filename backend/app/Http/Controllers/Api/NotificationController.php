<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    
    public function index()
    {
        $user = Auth::user();
        $query = Notification::query();

        if ($user->Role === 'Admin') {
            
            $query->where(function($q) use ($user) {
                $q->where('IsAdminNotification', true)
                  ->orWhere('UserID', $user->UserID);
            });
        } else {
            
            $query->where('UserID', $user->UserID)
                  ->where('IsAdminNotification', false);
        }

        $notifications = $query->orderBy('NotificationID', 'desc')
                               ->take(20)
                               ->get();

        
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
