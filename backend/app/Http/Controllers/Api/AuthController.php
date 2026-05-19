<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // 1. ĐĂNG KÝ TÀI KHOẢN
    public function register(Request $request)
    {
        $request->validate([
            'FullName' => 'required|string|max:255',
            'Email' => 'required|string|email|unique:users,Email',
            'Password' => 'required|string|min:6'
        ]);

        $user = User::create([
            'FullName' => $request->FullName,
            'Email' => $request->Email,
            'Password' => Hash::make($request->Password),
            'Role' => 'Customer'
        ]);

        $token = $user->createToken('VionToken')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // 🚀 2. ĐĂNG NHẬP (ĐÃ THÊM VALIDATE CHI TIẾT)
    public function login(Request $request)
    {
        // Kiểm tra định dạng, để trống, độ dài và sự tồn tại của Email
        $request->validate([
            'Email' => 'required|email|exists:users,Email',
            'Password' => 'required|min:6'
        ], [
            // Custom thông báo lỗi theo đúng ý bạn
            'Email.required' => 'Email không được để trống!',
            'Email.email' => 'Email sai định dạng!',
            'Email.exists' => 'Email không tồn tại trong hệ thống!',
            
            'Password.required' => 'Mật khẩu không được để trống!',
            'Password.min' => 'Mật khẩu quá ngắn (phải có ít nhất 6 ký tự).'
        ]);

        // Lúc này Email chắc chắn đã đúng định dạng và có tồn tại trong DB rồi
        $user = User::where('Email', $request->Email)->first();

        // Chỉ cần kiểm tra xem Mật khẩu có khớp không
        if (!Hash::check($request->Password, $user->Password)) {
            // Trả về lỗi 401 Unauthorized nếu sai mật khẩu
            return response()->json([
                'message' => 'Sai mật khẩu! Vui lòng thử lại.'
            ], 401);
        }

        // Đăng nhập thành công -> Xóa Token cũ (nếu có) và Cấp Token mới
        $user->tokens()->delete();
        $token = $user->createToken('VionToken')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'user' => $user,
            'token' => $token 
        ]);
    }

    // 3. ĐĂNG XUẤT (Giữ nguyên của bạn)
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Đã đăng xuất thành công!'
        ]);
    }
}