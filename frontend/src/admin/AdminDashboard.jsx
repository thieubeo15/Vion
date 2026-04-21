import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Thêm useNavigate
import axios from 'axios';
import { DollarSign, ShoppingBag, Users, Package, Loader2, ArrowRight } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate(); // 2. Khởi tạo navigate
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://127.0.0.1:8000';
    const token = localStorage.getItem('vion_token');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success && res.data.data) {
                    const serverData = res.data.data;
                    setStats({
                        totalRevenue: serverData.total_revenue,
                        totalOrders: serverData.total_orders,
                        totalCustomers: serverData.total_customers,
                        totalProducts: serverData.total_products,
                        recentOrders: serverData.recent_orders
                    });
                }
            } catch (err) {
                console.error("Lỗi lấy dữ liệu thống kê:", err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchStats();
    }, [token]);

    if (loading) return (
        <div className="admin-loading">
            <Loader2 className="spin-icon" />
            <p>Vion Era đang tải dữ liệu...</p>
        </div>
    );

    const cardData = [
        { title: 'Doanh thu', value: `${(stats.totalRevenue || 0).toLocaleString()}đ`, icon: <DollarSign />, color: '#10b981' },
        { title: 'Đơn hàng', value: stats.totalOrders || 0, icon: <ShoppingBag />, color: '#3b82f6' },
        { title: 'Khách hàng', value: stats.totalCustomers || 0, icon: <Users />, color: '#f59e0b' },
        { title: 'Sản phẩm', value: stats.totalProducts || 0, icon: <Package />, color: '#ec4899' },
    ];

    return (
        <div className="admin-dashboard-content">
            <div className="dashboard-header">
                <h1>Tổng quan hệ thống</h1>
                <p>Cập nhật số liệu thực tế từ Vion Era</p>
            </div>

            <div className="stats-grid">
                {cardData.map((item, idx) => (
                    <div className="stat-card" key={idx}>
                        <div className="stat-icon" style={{ backgroundColor: item.color }}>{item.icon}</div>
                        <div className="stat-text">
                            <h3>{item.title}</h3>
                            <p>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="recent-orders-card">
                <div className="card-header">
                    <h2>Đơn hàng mới nhất</h2>
                    {/* 3. SỬA NÚT XEM TẤT CẢ TẠI ĐÂY */}
                    <button className="view-all-btn" onClick={() => navigate('/admin/orders')}>
                        Xem tất cả <ArrowRight size={14} />
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders?.length > 0 ? (
                                stats.recentOrders.map((order) => (
                                    // 4. SỬA KEY VÀ CÁC TRƯỜNG DỮ LIỆU HIỂN THỊ
                                    <tr key={order.OrderID}> 
                                        <td><strong>#VION-{order.OrderID}</strong></td>
                                        {/* Hiển thị tên từ cột FullName mà mình đã thêm vào bảng orders */}
                                        <td>{order.FullName || 'Khách lẻ'}</td> 
                                        <td>{new Date(order.OrderDate || order.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td>{(Number(order.TotalAmount) || 0).toLocaleString()}đ</td>
                                        <td>
                                            <span className={`status-pill ${(order.Status || 'pending').toLowerCase()}`}>
                                                {order.Status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="empty-table">Chưa có đơn hàng nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;