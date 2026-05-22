<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;

    /**
     * Create a new message instance.
     */
    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        $htmlContent = '
        <div style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <div style="background-color: #111111; padding: 25px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px;">VION.</h1>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #aaa; letter-spacing: 1px;">THỜI TRANG THẾ HỆ MỚI</p>
            </div>
            <div style="padding: 30px; background-color: #ffffff; color: #333333; line-height: 1.6;">
                <h2 style="margin-top: 0; color: #111111; font-size: 20px;">Khôi phục mật khẩu tài khoản</h2>
                <p>Xin chào,</p>
                <p>Chúng tôi nhận được yêu cầu thiết lập lại mật khẩu cho tài khoản của bạn tại VION. Vui lòng sử dụng mã xác thực OTP dưới đây để hoàn tất quá trình:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; padding: 15px 35px; background: linear-gradient(135deg, #111 0%, #222 100%); color: #ffffff; border-radius: 8px; font-size: 32px; font-weight: 800; letter-spacing: 8px; border-bottom: 3px solid #EE4D2D;">
                        ' . $this->otp . '
                    </div>
                </div>
                
                <p style="color: #666; font-size: 14px;">Mã OTP này có hiệu lực trong vòng <b>10 phút</b>. Để bảo mật tài khoản, vui lòng <b>không chia sẻ mã này</b> với bất kỳ ai khác.</p>
                <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ bộ phận hỗ trợ khách hàng của chúng tôi để được giúp đỡ.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #888;">Trân trọng,<br><b>Đội ngũ VION.</b></p>
            </div>
            <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #f0f0f0;">
                <p style="margin: 0 0 5px 0;">Đây là email được gửi tự động, vui lòng không phản hồi trực tiếp email này.</p>
                <p style="margin: 0;">&copy; ' . date('Y') . ' VION. All rights reserved.</p>
            </div>
        </div>
        ';

        return $this->subject('[VION] Mã xác thực OTP khôi phục mật khẩu')
                    ->html($htmlContent);
    }
}
