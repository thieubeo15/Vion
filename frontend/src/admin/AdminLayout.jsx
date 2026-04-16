import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Layers, Box, ShoppingCart, LogOut } from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('vion_token');

    const handleLogout = async () => {
        if (window.confirm("Bro muốn đăng xuất khỏi quản trị?")) {
            try {
                await axios.post('http://127.0.0.1:8000/api/logout', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) { console.error(err); }
            localStorage.removeItem('vion_token');
            navigate('/login');
        }
    };

    return (
        <div className="vion-admin-container">
            <aside className="vion-admin-sidebar">
                <div className="vion-admin-logo" onClick={() => navigate('/')}>
                    VION <span>ADMIN</span>
                </div>
                
                <nav className="vion-admin-nav">
                    <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? 'active' : ''}>
                        <LayoutDashboard size={20} /> <span>Thống kê</span>
                    </NavLink>

                    <NavLink to="/admin/categories" className={({isActive}) => isActive ? 'active' : ''}>
                        <Layers size={20} /> <span>Danh mục</span>
                    </NavLink>

                    <NavLink to="/admin/products" className={({isActive}) => isActive ? 'active' : ''}>
                        <Box size={20} /> <span>Sản phẩm</span>
                    </NavLink>

                    <NavLink to="/admin/orders" className={({isActive}) => isActive ? 'active' : ''}>
                        <ShoppingCart size={20} /> <span>Đơn hàng</span>
                    </NavLink>
                </nav>

                <div className="vion-logout-btn" onClick={handleLogout}>
                    <LogOut size={18} /> <span>Đăng xuất</span>
                </div>
            </aside>

            <main className="vion-admin-main">
                <div className="vion-admin-content">
                    {/* Nơi nội dung của Dashboard hoặc Category sẽ hiện ra */}
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;