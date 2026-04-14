<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
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

    // Cập nhật thông tin cá nhân (Họ tên, SĐT, Địa chỉ)
    public function updateProfile(Request $request) 
    {
        $user = Auth::user();

        $request->validate([
            'FullName' => 'sometimes|string|max:255',
            'Phone'    => 'sometimes|string|max:20',
            'Address'  => 'sometimes|string',
        ]);

        $user->update($request->only('FullName', 'Phone', 'Address'));

        return response()->json([
            'success' => true,
            'message' => 'Vion đã cập nhật hồ sơ của bạn!',
            'user'    => $user
        ]);
    }

    // Đổi mật khẩu
    public function changePassword(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'new_password.confirmed' => 'Xác nhận mật khẩu mới không khớp.',
            'new_password.min' => 'Mật khẩu phải có ít nhất 8 ký tự.'
        ]);

        // Kiểm tra mật khẩu cũ (Dùng cột Password của bro)
        if (!Hash::check($request->current_password, $user->Password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu hiện tại không đúng.'
            ], 422);
        }

        // Cập nhật mật khẩu mới
        $user->update([
            'Password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đổi mật khẩu thành công!'
        ]);
    }

    // Các hàm quản trị
    public function index() { return response()->json(User::all()); }
    public function show($id) {
        $u = User::find($id);
        return $u ? response()->json($u) : response()->json(['message' => 'Không tìm thấy'], 404);
    }
}