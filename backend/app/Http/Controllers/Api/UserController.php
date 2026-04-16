<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;    // THÊM DÒNG NÀY
use App\Models\Product;  // THÊM DÒNG NÀY
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    // Lấy thông tin user đang đăng nhập
    public function profile() 
    {
        return response()->json(Auth::user());
    }

    // Cập nhật thông tin cá nhân
    public function updateProfile(Request $request) 
    {
        $user = Auth::user();
        $request->validate([
            'FullName' => 'sometimes|string|max:255',
            'Phone'    => 'sometimes|string|max:20',
            'Address'  => 'sometimes|string',
        ]);

        $user->update($request->only('FullName', 'Phone', 'Address'));
        return response()->json(['success' => true, 'message' => 'Vion đã cập nhật hồ sơ!', 'user' => $user]);
    }

    // Đổi mật khẩu
    public function changePassword(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ]);

        if (!Hash::check($request->current_password, $user->Password)) {
            return response()->json(['success' => false, 'message' => 'Mật khẩu hiện tại không đúng.'], 422);
        }

        $user->update(['Password' => Hash::make($request->new_password)]);
        return response()->json(['success' => true, 'message' => 'Đổi mật khẩu thành công!']);
    }

    // --- CÁC HÀM QUẢN TRỊ ---
    public function index() { return response()->json(User::all()); }
    
    public function show($id) {
        $u = User::find($id);
        return $u ? response()->json($u) : response()->json(['message' => 'Không tìm thấy'], 404);
    }

    public function getStats() {
        // Kiểm tra quyền Admin
        if (Auth::user()->Role !== 'Admin') {
            return response()->json(['message' => 'Quyền truy cập bị từ chối!'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'totalRevenue' => (float)Order::whereIn('Status', ['Success', 'Completed', 'Paid'])->sum('TotalAmount'),
                'totalOrders' => Order::count(),
                'totalCustomers' => User::where('Role', 'User')->count(),
                'totalProducts' => Product::count(),
                // Lấy thêm 5 đơn hàng mới nhất để Dashboard nhìn cho xịn
                'recentOrders' => Order::with('user')->orderBy('created_at', 'desc')->take(5)->get()
            ]
        ]);
    }
}