<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PasswordResetOtp;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    
    public function sendOtp(Request $request)
    {
        $request->validate([
            'Email' => 'required|email'
        ], [
            'Email.required' => 'Email không được để trống!',
            'Email.email' => 'Email không đúng định dạng!'
        ]);

        
        $user = User::where('Email', $request->Email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email này chưa được đăng ký trong hệ thống!'
            ], 404);
        }

        
        $otp = (string) rand(100000, 999999);

        try {
            
            PasswordResetOtp::where('Email', $request->Email)->delete();

            
            PasswordResetOtp::create([
                'Email' => $request->Email,
                'OTP' => $otp,
                'ExpiresAt' => now()->addMinutes(10)
            ]);

            
            Mail::to($request->Email)->send(new OtpMail($otp));

            return response()->json([
                'success' => true,
                'message' => 'Mã OTP khôi phục mật khẩu đã được gửi vào email của bạn.'
            ]);

        } catch (\Exception $e) {
            \Log::error('Lỗi gửi OTP: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: Không thể gửi email. Vui lòng thử lại sau!'
            ], 500);
        }
    }

    
    public function resetPassword(Request $request)
    {
        $request->validate([
            'Email' => 'required|email',
            'OTP' => 'required|string|size:6',
            'Password' => 'required|string|min:6|confirmed'
        ], [
            'Email.required' => 'Email không được để trống!',
            'Email.email' => 'Email không đúng định dạng!',
            'OTP.required' => 'Mã OTP không được để trống!',
            'OTP.size' => 'Mã OTP phải gồm đúng 6 ký tự số!',
            'Password.required' => 'Mật khẩu mới không được để trống!',
            'Password.min' => 'Mật khẩu mới phải từ 6 ký tự trở lên!',
            'Password.confirmed' => 'Xác nhận mật khẩu mới không trùng khớp!'
        ]);

        
        $otpRecord = PasswordResetOtp::where('Email', $request->Email)
            ->where('OTP', $request->OTP)
            ->where('ExpiresAt', '>', now())
            ->first();

        if (!$otpRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Mã OTP không chính xác hoặc đã hết hạn!'
            ], 400);
        }

        
        $user = User::where('Email', $request->Email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy người dùng có email này!'
            ], 404);
        }

        
        $user->Password = Hash::make($request->Password);
        $user->save();

        
        $otpRecord->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.'
        ]);
    }
}
