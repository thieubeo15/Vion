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
        // Kiểm tra dữ liệu đầu vào
        $request->validate([
            'FullName' => 'required|string|max:255',
            'Email' => 'required|string|email|unique:users,Email',
            'Password' => 'required|string|min:6'
        ]);

        // Tạo User mới (Mặc định Role là Customer)
        $user = User::create([
            'FullName' => $request->FullName,
            'Email' => $request->Email,
            'Password' => Hash::make($request->Password), // Mã hóa mật khẩu
            'Role' => 'Customer'
        ]);

        // Cấp Token (Thẻ thông hành)
        $token = $user->createToken('VionToken')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // 2. ĐĂNG NHẬP
    public function login(Request $request)
    {
        // Tìm User theo Email
        $user = User::where('Email', $request->Email)->first();

        // Kiểm tra xem User có tồn tại không và Mật khẩu có khớp không
        if (!$user || !Hash::check($request->Password, $user->Password)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác!'
            ], 401);
        }

        // Đăng nhập thành công -> Xóa Token cũ (nếu có) và Cấp Token mới
        $user->tokens()->delete();
        $token = $user->createToken('VionToken')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'user' => $user,
            'token' => $token // Phải trả về cái này để React cất đi
        ]);
    }

    // 3. ĐĂNG XUẤT
    public function logout(Request $request)
    {
        // Thu hồi toàn bộ Token của User này
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Đã đăng xuất thành công!'
        ]);
    }
}