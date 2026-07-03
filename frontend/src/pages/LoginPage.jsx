import React, { useState, useEffect } from 'react';
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

    const handleGoogleLoginResponse = async (response) => {
        setError('');
        try {
            setLoading(true);
            const res = await axios.post('http://127.0.0.1:8000/api/auth/google', {
                credential: response.credential
            });
            
            if (res.data.success) {
                localStorage.setItem('vion_token', res.data.token);
                localStorage.setItem('vion_user', JSON.stringify(res.data.user));
                if (res.data.user?.Role === 'Admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/';
                }
            } else {
                setError(res.data.message || 'Đăng nhập Google thất bại.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Không thể kết nối đến máy chủ Google!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadGoogleScript = () => {
            if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
                initializeGoogleBtn();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleBtn;
            document.body.appendChild(script);
        };

        const initializeGoogleBtn = () => {
            if (window.google) {
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1008719970978-hb24n2dstb40o45avcl46cotftg283u3.apps.googleusercontent.com';
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleLoginResponse
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("google-signin-btn"),
                    { theme: "outline", size: "large", width: "320" }
                );
            }
        };

        const timer = setTimeout(loadGoogleScript, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        
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
            if (response.data.user?.Role === 'Admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/';
            }
            
        } catch (err) {
            
            if (err.response && err.response.data) {
                const data = err.response.data;
                
                
                if (data.errors) {
                    const firstErrorKey = Object.keys(data.errors)[0];
                    setError(data.errors[firstErrorKey][0]); 
                } 
                
                else if (data.message) {
                    setError(data.message);
                } 
                else {
                    setError('Có lỗi xảy ra, vui lòng thử lại!');
                }
            } else {
                setError('Không thể kết nối đến máy chủ!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            
            <header className="login-header">
                <Link to="/" className="logo">Vion.</Link>
                <Link to="/support" className="help-link">Trợ giúp</Link>
            </header>

            <main className="login-main">
                
                <div className="login-left">
                    <div className="overlay"></div>
                    <div className="left-content">
                        <h1>VION.</h1>
                        <p>THỜI TRANG THẾ HỆ MỚI</p>
                    </div>
                </div>

                
                <div className="login-right">
                    <div className="login-box">
                        <h2>Đăng nhập</h2>

                        
                        <div className="error-box">
                            {error && <div className="error">{error}</div>}
                        </div>

                        <form onSubmit={handleLogin} noValidate>
                            
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

                        <div className="google-btn-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                            <div id="google-signin-btn"></div>
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