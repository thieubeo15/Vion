import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronRight, Inbox } from 'lucide-react';
import './OrderHistory.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All'); // State để quản lý Tab hiện tại

    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api';

    // Danh sách các Tab
    const tabs = [
        { id: 'All', label: 'Tất cả' },
        { id: 'Pending', label: 'Chờ xử lý' },
        { id: 'Shipping', label: 'Đang giao' },
        { id: 'Completed', label: 'Hoàn thành' },
        { id: 'Cancelled', label: 'Đã hủy' },
    ];

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/my-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error("Lỗi lấy lịch sử đơn hàng", err);
        } finally {
            setLoading(false);
        }
    };

    // LOGIC LỌC ĐƠN HÀNG
    const filteredOrders = filterStatus === 'All' 
        ? orders 
        : orders.filter(order => order.Status === filterStatus);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock size={16} />;
            case 'Shipping': return <Truck size={16} />;
            case 'Completed': return <CheckCircle size={16} />;
            case 'Cancelled': return <XCircle size={16} />;
            default: return <Package size={16} />;
        }
    };

    if (loading) return <div className="v-loading">Đang tải đơn mua...</div>;

    return (
        <div className="v-order-history container py-5">
            <h2 className="fw-900 mb-4 text-center">ĐƠN MUA CỦA TÔI</h2>

            {/* THANH TAB PHÂN LOẠI */}
            <div className="v-order-tabs shadow-sm mb-4">
                {tabs.map(tab => (
                    <div 
                        key={tab.id} 
                        className={`v-tab-item ${filterStatus === tab.id ? 'active' : ''}`}
                        onClick={() => setFilterStatus(tab.id)}
                    >
                        {tab.label}
                    </div>
                ))}
            </div>
            
            {filteredOrders.length === 0 ? (
                <div className="v-empty-order text-center py-5 bg-white rounded-4 shadow-sm">
                    <Inbox size={64} className="text-muted mb-3 opacity-25" />
                    <p className="text-muted fw-600">Không tìm thấy đơn hàng nào trong mục này!</p>
                    <button className="v-btn-shop mt-3" onClick={() => window.location.href='/'}>MUA SẮM NGAY</button>
                </div>
            ) : (
                <div className="v-order-list">
                    {filteredOrders.map(order => (
                        <div key={order.OrderID} className="v-order-card shadow-sm mb-4">
                            <div className="v-order-header d-flex justify-content-between align-items-center">
                                <span className="v-order-id">Mã đơn: <b>#VION-{order.OrderID}</b></span>
                                <span className={`v-status-label ${order.Status.toLowerCase()}`}>
                                    {getStatusIcon(order.Status)} {order.Status}
                                </span>
                            </div>

                            <div className="v-order-body">
                                {order.details.map((item, index) => (
                                    <div key={index} className="v-product-row d-flex align-items-center mb-3">
                                        <div className="v-product-info">
                                            <h6 className="mb-0 fw-700">{item.variant?.product?.Name}</h6>
                                            <small className="text-muted">Size: {item.variant?.Size} | SL: x{item.Quantity}</small>
                                        </div>
                                        <div className="v-product-price ms-auto fw-800">
                                            {(item.Price * item.Quantity).toLocaleString()}đ
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="v-order-footer d-flex justify-content-between align-items-center border-top pt-3">
                                <div className="v-order-date text-muted fs-12">
                                    Ngày đặt: {new Date(order.OrderDate).toLocaleDateString('vi-VN')}
                                </div>
                                <div className="v-total">
                                    Tổng thanh toán: <span className="v-price-grand text-danger">{Number(order.TotalAmount).toLocaleString()}đ</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;