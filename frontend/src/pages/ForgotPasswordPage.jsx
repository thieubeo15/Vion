import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (countdown > 0) {
            timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timerRef.current);
    }, [countdown]);

    
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Vui lòng nhập Email!');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('http://127.0.0.1:8000/api/forgot-password', {
                Email: email
            });

            if (response.data.success) {
                setStep(2);
                setCountdown(60); 
                Swal.fire({
                    icon: 'success',
                    title: 'Đã gửi mã OTP!',
                    text: 'Mã xác thực đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư .',
                    confirmButtonColor: '#111'
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    
    const handleResendOtp = async () => {
        if (countdown > 0) return;
        setError('');

        try {
            setLoading(true);
            const response = await axios.post('http://127.0.0.1:8000/api/forgot-password', {
                Email: email
            });

            if (response.data.success) {
                setCountdown(60);
                Swal.fire({
                    icon: 'success',
                    title: 'Đã gửi lại OTP!',
                    text: 'Mã xác thực mới đã được gửi tới email của bạn.',
                    confirmButtonColor: '#111'
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể gửi lại mã OTP!');
        } finally {
            setLoading(false);
        }
    };

    
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp.trim()) {
            setError('Vui lòng nhập mã OTP!');
            return;
        }
        if (otp.length !== 6) {
            setError('Mã OTP phải gồm đúng 6 ký tự số!');
            return;
        }
        if (!password.trim()) {
            setError('Vui lòng nhập Mật khẩu mới!');
            return;
        }
        if (password.length < 6) {
            setError('Mật khẩu mới phải từ 6 ký tự trở lên!');
            return;
        }
        if (password !== confirmPassword) {
            setError('Xác nhận mật khẩu mới không khớp!');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('http://127.0.0.1:8000/api/reset-password', {
                Email: email,
                OTP: otp,
                Password: password,
                Password_confirmation: confirmPassword
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Đặt lại mật khẩu thành công!',
                    text: 'Mật khẩu mới đã được cập nhật. Vui lòng đăng nhập lại.',
                    confirmButtonColor: '#111',
                    confirmButtonText: 'ĐĂNG NHẬP NGAY',
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/login';
                    }
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-page">
            
            <header className="forgot-header">
                <Link to="/" className="logo">Vion.</Link>
                <Link to="/support" className="help-link">Trợ giúp</Link>
            </header>

            <main className="forgot-main">
                
                <div className="forgot-left">
                    <div className="overlay"></div>
                    <div className="left-content">
                        <h1>VION.</h1>
                        <p>THỜI TRANG THẾ HỆ MỚI</p>
                    </div>
                </div>

                
                <div className="forgot-right">
                    <div className="forgot-box">
                        {step === 1 ? (
                            <>
                                <h2>Quên mật khẩu</h2>
                                <p className="forgot-desc">
                                    Vui lòng nhập Email liên kết với tài khoản của bạn để nhận mã xác thực OTP khôi phục mật khẩu.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2>Đặt lại mật khẩu</h2>
                                <p className="forgot-desc email-highlight">
                                    Mã OTP đã được gửi đến: <strong>{email}</strong>
                                </p>
                            </>
                        )}

                        
                        <div className="error-box">
                            {error && <div className="error">{error}</div>}
                        </div>

                        {step === 1 ? (
                            /* FORM BƯỚC 1 */
                            <form onSubmit={handleSendOtp} noValidate>
                                <div className="input-group">
                                    <Mail className="icon" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={error && !email ? 'input-error' : ''}
                                    />
                                    <label>Nhập Email của bạn.</label>
                                </div>

                                <button type="submit" className="forgot-btn" disabled={loading}>
                                    {loading ? "Đang gửi mã..." : "GỬI MÃ OTP"}
                                </button>
                            </form>
                        ) : (
                            /* FORM BƯỚC 2 */
                            <form onSubmit={handleResetPassword} noValidate>
                                
                                <div className="input-group">
                                    <KeyRound className="icon" size={18} />
                                    <input
                                        type="text"
                                        maxLength={6}
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // chỉ nhận số
                                        className={error && !otp ? 'input-error' : ''}
                                    />
                                    <label>Nhập mã OTP 6 số</label>
                                </div>

                                
                                <div className="input-group">
                                    <Lock className="icon" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={error && !password ? 'input-error' : ''}
                                    />
                                    <label>Mật khẩu mới</label>
                                    <div className="toggle" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>

                                
                                <div className="input-group">
                                    <Lock className="icon" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={error && !confirmPassword ? 'input-error' : ''}
                                    />
                                    <label>Xác nhận mật khẩu mới</label>
                                </div>

                                <div className="otp-resend-wrap">
                                    {countdown > 0 ? (
                                        <span className="otp-countdown">Gửi lại mã sau {countdown}s</span>
                                    ) : (
                                        <button 
                                            type="button" 
                                            onClick={handleResendOtp} 
                                            className="resend-btn"
                                            disabled={loading}
                                        >
                                            Gửi lại mã OTP
                                        </button>
                                    )}
                                </div>

                                <button type="submit" className="forgot-btn" disabled={loading}>
                                    {loading ? "Đang xử lý..." : "ĐẶT LẠI MẬT KHẨU"}
                                </button>

                                <button 
                                    type="button" 
                                    onClick={() => { setStep(1); setError(''); }} 
                                    className="back-step-btn"
                                    disabled={loading}
                                >
                                    <ArrowLeft size={14} /> Thay đổi Email
                                </button>
                            </form>
                        )}

                        <div className="back-to-login">
                            Quay lại <Link to="/login">Đăng nhập</Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ForgotPasswordPage;
