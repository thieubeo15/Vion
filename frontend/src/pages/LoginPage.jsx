import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // BẮT LỖI CHI TIẾT TỪNG Ô (PLEASE FILL THE FIELD)
        if (!email.trim()) {
            setError('Vui lòng nhập Email!');
            return;
        }
        if (!password.trim()) {
            setError('Vui lòng nhập Mật khẩu của bạn!');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('http://127.0.0.1:8000/api/login', {
                Email: email,
                Password: password
            });
            
            localStorage.setItem('vion_token', response.data.token);
            localStorage.setItem('vion_user', JSON.stringify(response.data.user));
            window.location.href = '/';
        } catch (err) {
            // Lỗi từ phía Server (Sai tài khoản/mật khẩu)
            setError('Email hoặc mật khẩu không chính xác.Xin thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* HEADER */}
            <header className="login-header">
                <Link to="/" className="logo">Vion.</Link>
                <a href="/help" className="help-link">Trợ giúp</a>
            </header>

            <main className="login-main">
                {/* TRÁI: BANNER ẢNH */}
                <div className="login-left">
                    <div className="overlay"></div>
                    <div className="left-content">
                        <h1>VION.</h1>
                        <p>THỜI TRANG THẾ HỆ MỚI</p>
                    </div>
                </div>

                {/* PHẢI: FORM ĐĂNG NHẬP */}
                <div className="login-right">
                    <div className="login-box">
                        <h2>Đăng nhập</h2>

                        {/* HỘP LỖI CỐ ĐỊNH CHIỀU CAO - CHỐNG NHẢY FORM */}
                        <div className="error-box">
                            {error && <div className="error">{error}</div>}
                        </div>

                        <form onSubmit={handleLogin} noValidate>
                            {/* EMAIL INPUT */}
                            <div className="input-group">
                                <Mail className="icon" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={error && !email ? 'input-error' : ''}
                                />
                                <label>Nhập Email của bạn.</label>
                            </div>

                            {/* PASSWORD INPUT */}
                            <div className="input-group">
                                <Lock className="icon" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={error && !password ? 'input-error' : ''}
                                />
                                <label>Mật khẩu</label>
                                <div className="toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>

                            <div className="extra">
                                <Link to="/forgot">Quên mật khẩu?</Link>
                            </div>

                            <button className="login-btn" disabled={loading}>
                                {loading ? "Đang xử lý..." : "Đăng nhập"}
                            </button>
                        </form>

                        <div className="divider">HOẶC</div>

                        <div className="social">
                            <button type="button">Facebook</button>
                            <button type="button">Google</button>
                        </div>

                        <p className="register">
                            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;