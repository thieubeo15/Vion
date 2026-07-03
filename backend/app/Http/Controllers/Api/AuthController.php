<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    
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

    
    public function login(Request $request)
    {
        
        $request->validate([
            'Email' => 'required|email|exists:users,Email',
            'Password' => 'required|min:6'
        ], [
            
            'Email.required' => 'Email không được để trống!',
            'Email.email' => 'Email sai định dạng!',
            'Email.exists' => 'Email không tồn tại trong hệ thống!',
            
            'Password.required' => 'Mật khẩu không được để trống!',
            'Password.min' => 'Mật khẩu quá ngắn (phải có ít nhất 6 ký tự).'
        ]);

        
        $user = User::where('Email', $request->Email)->first();

        
        if (!Hash::check($request->Password, $user->Password)) {
            
            return response()->json([
                'message' => 'Sai mật khẩu! Vui lòng thử lại.'
            ], 401);
        }

        
        $user->tokens()->delete();
        $token = $user->createToken('VionToken')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'user' => $user,
            'token' => $token 
        ]);
    }

    
    public function googleLogin(Request $request)
    {
        $request->validate([
            'credential' => 'required|string'
        ]);

        $credential = $request->credential;

        try {
            
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

            
            $user = User::where('Email', $email)->first();

            if (!$user) {
                
                $user = User::create([
                    'FullName' => $name ?? 'Khách hàng Google',
                    'Email' => $email,
                    'Password' => Hash::make(\Illuminate\Support\Str::random(16)), 
                    'Role' => 'Customer'
                ]);
            }

            
            $user->tokens()->delete(); 
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

    
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Đã đăng xuất thành công!'
        ]);
    }
}