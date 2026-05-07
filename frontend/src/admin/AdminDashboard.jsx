// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 🚀 Nhớ import thêm TrendingUp cho cái icon Lợi nhuận nhé
import { DollarSign, ShoppingBag, Users, Package, Loader2, ArrowRight, Image as ImageIcon, TrendingUp } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalRevenue: 0, 
        totalProfit: 0, // 🚀 Thêm state Lợi nhuận
        totalOrders: 0, 
        totalCustomers: 0, 
        totalProducts: 0, 
        totalBanners: 0, 
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
                if (res.data.success) {
                    const d = res.data.data;
                    setStats({
                        totalRevenue: d.total_revenue || 0,
                        totalProfit: d.total_profit || 0, // 🚀 Lấy dữ liệu Lợi nhuận từ Backend
                        totalOrders: d.total_orders || 0,
                        totalCustomers: d.total_customers || 0,
                        totalProducts: d.total_products || 0,
                        totalBanners: d.total_banners || 0,
                        recentOrders: d.recent_orders || []
                    });
                }
            } catch (err) { 
                console.error("Lỗi fetch stats:", err); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchStats();
    }, [token]);

    const cardData = [
        { title: 'Doanh thu', value: `${Number(stats.totalRevenue).toLocaleString()}đ`, icon: <DollarSign />, color: '#3b82f6', path: '/admin/orders' },
        
        // 🚀 THẺ LỢI NHUẬN THÊM VÀO ĐÂY
        { title: 'Lợi nhuận', value: `${Number(stats.totalProfit).toLocaleString()}đ`, icon: <TrendingUp />, color: '#10b981', path: '/admin/orders' },
        
        { title: 'Đơn hàng', value: stats.totalOrders, icon: <ShoppingBag />, color: '#f59e0b', path: '/admin/orders' },
        { title: 'Sản phẩm', value: stats.totalProducts, icon: <Package />, color: '#ec4899', path: '/admin/products' },
        { title: 'Khách hàng', value: stats.totalCustomers, icon: <Users />, color: '#6366f1', path: '/admin/users' },
        { title: 'Banner', value: stats.totalBanners, icon: <ImageIcon />, color: '#8b5cf6', path: '/admin/banners' },
    ];

    if (loading) return <div className="admin-loading"><Loader2 className="spin-icon" /> Đang tải dữ liệu...</div>;

    return (
        <div className="admin-dashboard-content">
            <div className="dashboard-header">
                <h1>Tổng quan hệ thống</h1>
                <p>Quản trị cửa hàng Vion Era</p>
            </div>

            <div className="stats-grid">
                {cardData.map((item, idx) => (
                    <div className="stat-card clickable" key={idx} onClick={() => navigate(item.path)}>
                        <div className="stat-icon" style={{ backgroundColor: item.color }}>{item.icon}</div>
                        <div className="stat-text">
                            <h3>{item.title}</h3>
                            <p>{item.value}</p>
                        </div>
                        <div className="stat-arrow"><ArrowRight size={14} /></div>
                    </div>
                ))}
            </div>

            <div className="recent-orders-card">
                <div className="card-header">
                    <h2>Đơn hàng mới nhất</h2>
                    <button className="view-all-btn" onClick={() => navigate('/admin/orders')}>Xem tất cả</button>
                </div>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Sản phẩm đã mua</th>
                                <th>Giá trị đơn</th>
                                <th>Lợi nhuận (Dự kiến)</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.map(order => {
                                // 🚀 Tính toán lợi nhuận cho từng đơn hàng hiển thị ở bảng
                                const orderRevenue = Number(order.TotalAmount);
                                const orderCost = order.details?.reduce((sum, d) => sum + (Number(d.ImportPrice || d.import_price || 0) * d.Quantity), 0) || 0;
                                const orderProfit = orderRevenue - orderCost;

                                return (
                                    <tr key={order.OrderID}>
                                        <td className="fw-800">#VION-{order.OrderID}</td>
                                        <td>
                                            <div className="fw-700">{order.FullName}</div>
                                            <div className="small text-muted">{order.Phone}</div>
                                        </td>
                                        <td>
                                            {order.details && order.details.length > 0 ? (
                                                order.details.map((detail, i) => (
                                                    <div key={i} className="order-product-item">
                                                        • {detail.variant?.product?.Name || detail.variant?.product?.name || "Sản phẩm"} 
                                                        <span className="text-muted"> (x{detail.Quantity})</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-muted">N/A</span>
                                            )}
                                        </td>
                                        <td className="fw-800 text-primary">
                                            {orderRevenue.toLocaleString()}đ
                                        </td>
                                        
                                        {/* 🚀 HIỂN THỊ LỢI NHUẬN ĐƠN HÀNG Ở ĐÂY */}
                                        <td className="fw-800 text-success">
                                            +{orderProfit.toLocaleString()}đ
                                        </td>

                                        <td>
                                            <span className={`status-pill ${order.Status?.toLowerCase()}`}>
                                                {order.Status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;