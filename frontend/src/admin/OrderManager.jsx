import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Truck, CheckCircle, XCircle, Package, Search, X } from 'lucide-react';
import Swal from 'sweetalert2';
import './OrderManager.css';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); 
    const [filterStatus, setFilterStatus] = useState('All');
    
    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // 🚀 SẮP XẾP: Đơn mới nhất (ID lớn nhất) lên đầu
            const sortedData = res.data.sort((a, b) => (b.OrderID || b.id) - (a.OrderID || a.id));
            setOrders(sortedData);
        } catch (err) { 
            console.error("Lỗi fetch đơn hàng", err); 
        } finally { 
            setLoading(false); 
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        const confirm = await Swal.fire({
            title: 'Xác nhận?',
            text: `Chuyển trạng thái đơn hàng sang ${newStatus}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#111'
        });

        if (confirm.isConfirmed) {
            try {
                await axios.put(`${API_URL}/orders/${orderId}`, { Status: newStatus }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Thành công', 'Đã cập nhật trạng thái!', 'success');
                fetchOrders();
            } catch (err) { 
                Swal.fire('Lỗi', 'Không thể cập nhật', 'error'); 
            }
        }
    };

    const filteredOrders = filterStatus === 'All' ? orders : orders.filter(o => o.Status === filterStatus);

    if (loading) return <div className="v-admin-loading">VION ERA đang tải dữ liệu...</div>;

    return (
        <div className="v-order-manager">
            <div className="v-admin-header mb-4">
                <h2 className="fw-900">QUẢN LÝ ĐƠN HÀNG</h2>
                <div className="v-filter-bar">
                    {['All', 'Pending', 'Shipping', 'Completed', 'Cancelled'].map(status => (
                        <button 
                            key={status}
                            className={filterStatus === status ? 'active' : ''} 
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'All' ? 'Tất cả' : 
                             status === 'Pending' ? 'Chờ xử lý' : 
                             status === 'Shipping' ? 'Đang giao' : 
                             status === 'Completed' ? 'Đã xong' : 'Đã hủy'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="v-table-wrapper">
                <table className="v-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.OrderID || order.id}>
                                <td className="fw-800 text-muted">#VION-{order.OrderID || order.id}</td>
                                <td>
                                    <div className="fw-700">{order.FullName || order.name}</div>
                                    <div className="small text-muted">{order.Phone || order.phone}</div>
                                </td>
                                <td className="fw-800 text-danger">{Number(order.TotalAmount || order.total_amount).toLocaleString()}đ</td>
                                <td>
                                    <span className={`v-status-tag ${(order.Status || '').toLowerCase()}`}>{order.Status}</span>
                                </td>
                                <td>
                                    <div className="v-btns">
                                        <button className="v-btn view" onClick={() => setSelectedOrder(order)}>
                                            <Eye size={18}/>
                                        </button>

                                        <button 
                                            className="v-btn ship" 
                                            disabled={order.Status === 'Cancelled' || order.Status === 'Completed'} 
                                            onClick={() => updateStatus(order.OrderID || order.id, 'Shipping')}
                                            style={{ 
                                                opacity: (order.Status === 'Cancelled' || order.Status === 'Completed') ? 0.4 : 1,
                                                cursor: (order.Status === 'Cancelled' || order.Status === 'Completed') ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <Truck size={18}/>
                                        </button>

                                        <button 
                                            className="v-btn done" 
                                            disabled={order.Status === 'Cancelled'} 
                                            onClick={() => updateStatus(order.OrderID || order.id, 'Completed')}
                                            style={{ 
                                                opacity: order.Status === 'Cancelled' ? 0.4 : 1,
                                                cursor: order.Status === 'Cancelled' ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <CheckCircle size={18}/>
                                        </button>

                                        <button 
                                            className="v-btn cancel" 
                                            disabled={order.Status === 'Shipping' || order.Status === 'Completed' || order.Status === 'Cancelled'} 
                                            onClick={() => updateStatus(order.OrderID || order.id, 'Cancelled')}
                                            style={{ 
                                                opacity: (order.Status === 'Shipping' || order.Status === 'Completed' || order.Status === 'Cancelled') ? 0.4 : 1,
                                                cursor: (order.Status === 'Shipping' || order.Status === 'Completed' || order.Status === 'Cancelled') ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            <XCircle size={18}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL XEM CHI TIẾT ĐƠN HÀNG --- */}
            {selectedOrder && (
                <div className="v-modal-overlay">
                    <div className="v-modal-content">
                        <div className="v-modal-header">
                            <h5>Chi tiết đơn hàng #VION-{selectedOrder.OrderID || selectedOrder.id}</h5>
                            <button onClick={() => setSelectedOrder(null)}><X size={24}/></button>
                        </div>
                        <div className="v-modal-body">
                            <div className="v-info-grid">
                                <div className="v-info-item">
                                    <label>Người nhận:</label> <span>{selectedOrder.FullName || selectedOrder.name}</span>
                                </div>
                                <div className="v-info-item">
                                    <label>Địa chỉ:</label> <span>{selectedOrder.Address || selectedOrder.address}</span>
                                </div>
                            </div>

                            <div className="v-product-list mt-4">
                                <h6 className="fw-800 border-bottom pb-2">SẢN PHẨM ĐÃ MUA</h6>
                                {selectedOrder.details?.map((detail, idx) => (
                                    <div key={idx} className="v-item-detail">
                                        <Package size={20} className="text-muted" />
                                        <div className="flex-grow-1 ms-3">
                                            {/* 🚀 FIX HIỂN THỊ TÊN SẢN PHẨM TẠI ĐÂY */}
                                            <div className="fw-700">
                                                {detail.variant?.product?.name || detail.variant?.product?.Name || "Sản phẩm của Vion"}
                                            </div>
                                            <small className="text-muted">
                                                Màu: {detail.variant?.Color || detail.variant?.color} | 
                                                Size: {detail.variant?.Size || detail.variant?.size} | 
                                                SL: x{detail.Quantity || detail.quantity}
                                            </small>
                                        </div>
                                        <div className="fw-800">
                                            {(Number(detail.Price || detail.price) * Number(detail.Quantity || detail.quantity)).toLocaleString()}đ
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="v-modal-footer">
                            <div className="fs-5">TỔNG CỘNG: <span className="text-danger fw-900">{Number(selectedOrder.TotalAmount || selectedOrder.total_amount).toLocaleString()}đ</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;