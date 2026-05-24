import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Layers, Box, ShoppingCart, LogOut, Ticket, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import NotificationBell from '../components/NotificationBell';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('vion_token');
    const user = JSON.parse(localStorage.getItem('vion_user') || '{}');

    useEffect(() => {
        if (!token || user.Role !== 'Admin') {
            Swal.fire({
                title: 'Truy cập bị từ chối!',
                text: 'Bạn không có quyền truy cập khu vực quản trị.',
                icon: 'error',
                confirmButtonColor: '#EE4D2D',
                confirmButtonText: 'Quay lại trang chủ'
            }).then(() => {
                navigate('/');
            });
        }
    }, [token, user.Role, navigate]);

    const handleLogout = () => {
        Swal.fire({
            title: 'Đăng xuất?',
            text: "Bạn có chắc chắn muốn đăng xuất không?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#111',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post('http://127.0.0.1:8000/api/logout', {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (err) { console.error(err); }
                localStorage.removeItem('vion_token');
                localStorage.removeItem('vion_user');
                navigate('/login');
            }
        });
    };

    if (!token || user.Role !== 'Admin') {
        return null;
    }

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

                    <NavLink to="/admin/vouchers" className={({isActive}) => isActive ? 'active' : ''}>
                        <Ticket size={20} /> <span>Voucher</span>
                    </NavLink>

                    <NavLink to="/admin/users" className={({isActive}) => isActive ? 'active' : ''}>
                        <Users size={20} /> <span>Người dùng</span>
                    </NavLink>
                </nav>

                <div className="vion-logout-btn" onClick={handleLogout}>
                    <LogOut size={18} /> <span>Đăng xuất</span>
                </div>
            </aside>

            <main className="vion-admin-main p-0">
                <header className="vion-admin-header d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom shadow-sm" style={{ height: '60px' }}>
                    <div className="v-admin-welcome fw-bold" style={{ color: '#333' }}>
                        Xin chào, <span style={{ color: '#EE4D2D' }}>{user.FullName || 'Quản trị viên'}</span>
                    </div>
                    <div className="v-admin-header-actions">
                        <NotificationBell />
                    </div>
                </header>
                <div className="vion-admin-content p-4">
                    {/* Nơi nội dung của Dashboard hoặc Category sẽ hiện ra */}
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;