import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Camera, ShoppingBag, User, LogOut } from 'lucide-react'; // Thêm icon LogOut
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
    const [cartCount, setCartCount] = useState(0);

    // 1. Lấy thông tin user an toàn
    let user = null;
    try {
        const userJson = localStorage.getItem('vion_user');
        if (userJson && userJson !== 'undefined') {
            user = JSON.parse(userJson);
        }
    } catch {
        user = null;
    }

    const loadCartCount = async () => {
        if (!user) {
            setCartCount(0);
            return;
        }
        try {
            const token = localStorage.getItem('vion_token');
            if(!token) return;
            const res = await axios.get('http://127.0.0.1:8000/api/my-cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const items = res.data.data?.items || [];
            const count = items.reduce((sum, item) => sum + item.Quantity, 0);
            setCartCount(count);
        } catch { } // Bỏ qua lỗi nếu token hết hạn
    };

    useEffect(() => {
        loadCartCount();
        const handleCartChange = () => loadCartCount();
        window.addEventListener('cartUpdated', handleCartChange);
        return () => window.removeEventListener('cartUpdated', handleCartChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. Hàm Đăng xuất (Quan trọng nè)
    const handleLogout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('vion_token');
            localStorage.removeItem('vion_user');
            // Dùng window.location để reset toàn bộ trạng thái web cho sạch
            window.location.href = '/login'; 
        }
    };

    return (
        <header className="vion-header">
            <div className="header-main">
                <Link to="/" className="header-logo">VION.</Link>

                <div className="search-container">
                    <div className="search-input-wrap">
                        <Search size={18} color="#999" />
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Tìm kiếm sản phẩm thời trang..." 
                        />
                        <div className="search-tools">
                            <Camera size={20} className="camera-icon" title="Tìm kiếm bằng hình ảnh" />
                        </div>
                    </div>
                </div>

                <div className="header-actions">
                    {/* GIỎ HÀNG */}
                    <Link to="/cart" className="action-icon">
                        <ShoppingBag size={24} strokeWidth={1.5} />
                        <span className="cart-badge">{cartCount}</span>
                    </Link>

                    {/* 3. LOGIC ĐĂNG NHẬP / TRANG CÁ NHÂN & ĐĂNG XUẤT */}
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            {/* Icon vào trang cá nhân */}
                            <Link to="/profile" className="action-icon" title="Trang cá nhân">
                                <User size={24} strokeWidth={1.5} />
                            </Link>
                            
                            {/* Nút Đăng xuất hiện ra ngay bên cạnh */}
                            <div 
                                className="action-icon" 
                                onClick={handleLogout} 
                                title="Đăng xuất"
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <LogOut size={20} strokeWidth={1.5} />
                                <span style={{ fontSize: '12px', fontWeight: '500' }}>ĐĂNG XUẤT</span>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="auth-text">Đăng nhập</Link>
                    )}
                </div>
            </div>

        </header>
    );
};

export default Navbar;