// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DollarSign, ShoppingBag, Users, Package, Loader2, ArrowRight, Image as ImageIcon } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalRevenue: 0, totalOrders: 0, totalCustomers: 0, 
        totalProducts: 0, totalBanners: 0, recentOrders: []
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
                    setStats({
                        totalRevenue: res.data.data.total_revenue,
                        totalOrders: res.data.data.total_orders,
                        totalCustomers: res.data.data.total_customers,
                        totalProducts: res.data.data.total_products,
                        totalBanners: res.data.data.total_banners, // Nhận số banner từ API
                        recentOrders: res.data.data.recent_orders
                    });
                }
            } catch (err) { console.error("Lỗi:", err); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, [token]);

    const cardData = [
        { title: 'Doanh thu', value: `${Number(stats.totalRevenue).toLocaleString()}đ`, icon: <DollarSign />, color: '#10b981', path: '/admin/orders' },
        { title: 'Đơn hàng', value: stats.totalOrders, icon: <ShoppingBag />, color: '#3b82f6', path: '/admin/orders' },
        { title: 'Sản phẩm', value: stats.totalProducts, icon: <Package />, color: '#ec4899', path: '/admin/products' },
        { title: 'Khách hàng', value: stats.totalCustomers, icon: <Users />, color: '#f59e0b', path: '/admin/users' },
        { title: 'Banner', value: stats.totalBanners, icon: <ImageIcon />, color: '#8b5cf6', path: '/admin/banners' },
    ];

    if (loading) return <div className="admin-loading"><Loader2 className="spin-icon" /> Đang tải...</div>;

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
                                <th>Sản phẩm đã mua</th> {/* CỘT SP */}
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentOrders.map(order => (
                                <tr key={order.OrderID}>
                                    <td className="fw-800">#VION-{order.OrderID}</td>
                                    <td>
                                        <div className="fw-700">{order.FullName}</div>
                                        <div className="small text-muted">{order.Phone}</div>
                                    </td>
                                   {/* AdminDashboard.jsx - Chỗ render cột Sản phẩm đã mua */}
{/* Chỗ render cột Sản phẩm đã mua */}
<td>
    {order.details && order.details.length > 0 ? (
        order.details.map((detail, i) => (
            <div key={i} className="order-product-item">
                {/* Dùng Name (N viết hoa) vì trong Model Product bro đặt là Name.
                   Thêm cái d.variant?.product?.name (n thường) cho chắc.
                */}
                • {detail.variant?.product?.Name || detail.variant?.product?.name || "Tên SP trống"} 
                <span className="text-muted"> (x{detail.Quantity})</span>
            </div>
        ))
    ) : (
        <span className="text-muted">Không có dữ liệu SP</span>
    )}
</td>
                                    <td className="fw-800 text-danger">{Number(order.TotalAmount).toLocaleString()}đ</td>
                                    <td><span className={`status-pill ${order.Status.toLowerCase()}`}>{order.Status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
export default AdminDashboard;