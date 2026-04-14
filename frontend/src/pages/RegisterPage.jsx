import React, { useState } from 'react';
import './RegisterPage.css';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // 1. BẮT LỖI CHI TIẾT (CHECK TỪNG Ô)
        if (!formData.fullName.trim()) {
            setError('Vui lòng nhập Họ và tên!');
            return;
        }
        if (!formData.email.trim()) {
            setError('Vui lòng nhập Email!');
            return;
        }
        if (!formData.password.trim()) {
            setError('Vui lòng nhập Mật khẩu!');
            return;
        }
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không trùng khớp!');
            return;
        }

        try {
            setLoading(true);
            await axios.post('http://127.0.0.1:8000/api/register', {
                FullName: formData.fullName,
                Email: formData.email,
                Password: formData.password
            });
            alert('Chúc mừng bro đã gia nhập Vion! Đăng nhập ngay nhé.');
            window.location.href = '/login';
        } catch (err) {
            setError(err.response?.data?.message || 'Email này đã được sử dụng. Thử cái khác nhé!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <header className="auth-header">
                <Link to="/" className="auth-logo">Vion.</Link>
                <span className="auth-header-title">Đăng ký</span>
            </header>

            <main className="auth-container">
                {/* CỘT TRÁI: ẢNH NỀN (Khóa cứng 55%) */}
                <div className="auth-image-col">
                    <div className="auth-overlay">
                        <h1>GIA NHẬP VION.</h1>
                        <p>NHẬN ƯU ĐÃI ĐỘC QUYỀN KHI LÀ THÀNH VIÊN</p>
                    </div>
                </div>

                {/* CỘT PHẢI: FORM (Khóa cứng 45%) */}
                <div className="auth-form-col">
                    <div className="auth-form-card">
                        <h2>Tạo tài khoản</h2>
                        
                        {/* HỘP LỖI CỐ ĐỊNH CHIỀU CAO - CHỐNG NHẢY FORM */}
                        <div className="auth-error-box">
                            {error && <div className="auth-error-msg">{error}</div>}
                        </div>
                        
                        <form onSubmit={handleRegister} noValidate>
                            <div className="auth-input-group">
                                <User size={18} className="auth-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Họ và tên" 
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                />
                            </div>

                            <div className="auth-input-group">
                                <Mail size={18} className="auth-icon" />
                                <input 
                                    type="email" 
                                    placeholder="Email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>

                            <div className="auth-input-group">
                                <Lock size={18} className="auth-icon" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Mật khẩu (ít nhất 6 ký tự)" 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                                <div className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </div>
                            </div>

                            <div className="auth-input-group">
                                <Lock size={18} className="auth-icon" />
                                <input 
                                    type="password" 
                                    placeholder="Xác nhận mật khẩu" 
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                />
                            </div>

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ NGAY"}
                            </button>
                        </form>

                        <div className="auth-footer-text">
                            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;