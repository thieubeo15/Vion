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

    // 🚀 4. ĐĂNG NHẬP BẰNG GOOGLE
    public function googleLogin(Request $request)
    {
        $request->validate([
            'credential' => 'required|string'
        ]);

        $credential = $request->credential;

        try {
            // Xác thực token bằng cách gọi tới Google OAuth2 tokeninfo endpoint
            $response = \Illuminate\Support\Facades\Http::get("https://oauth2.googleapis.com/tokeninfo", [
                'id_token' => $credential
            ]);

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token Google không hợp lệ hoặc đã hết hạn.'
                ], 400);
            }

            $payload = $response->json();

            // Xác minh client_id (để chống tấn công giả mạo token từ ứng dụng khác)
            $clientId = config('services.google.client_id');
            if ($clientId && $clientId !== 'your-google-client-id.apps.googleusercontent.com') {
                if (($payload['aud'] ?? '') !== $clientId && ($payload['azp'] ?? '') !== $clientId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Yêu cầu không hợp lệ (Client ID mismatch).'
                    ], 400);
                }
            }

            $email = $payload['email'] ?? null;
            $name = $payload['name'] ?? null;

            if (!$email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không lấy được thông tin Email từ tài khoản Google.'
                ], 400);
            }

            // Tìm hoặc tạo User mới
            $user = User::where('Email', $email)->first();

            if (!$user) {
                // Đăng ký mới
                $user = User::create([
                    'FullName' => $name ?? 'Khách hàng Google',
                    'Email' => $email,
                    'Password' => Hash::make(\Illuminate\Support\Str::random(16)), // Mật khẩu ngẫu nhiên
                    'Role' => 'Customer'
                ]);
            }

            // Đăng nhập thành công -> Tạo Sanctum Token
            $user->tokens()->delete(); // Xóa các token cũ
            $token = $user->createToken('VionToken')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Đăng nhập Google thành công!',
                'user' => $user,
                'token' => $token
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi kết nối máy chủ Google: ' . $e->getMessage()
            ], 500);
        }
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