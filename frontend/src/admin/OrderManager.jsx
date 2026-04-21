import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Truck, CheckCircle, XCircle, Package, Search, X } from 'lucide-react';
import Swal from 'sweetalert2';
import './OrderManager.css';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); // Lưu đơn hàng đang xem chi tiết
    const [filterStatus, setFilterStatus] = useState('All');
    
    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) { console.error("Lỗi fetch đơn hàng"); }
        finally { setLoading(false); }
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
            } catch (err) { Swal.fire('Lỗi', 'Không thể cập nhật', 'error'); }
        }
    };

    const filteredOrders = filterStatus === 'All' ? orders : orders.filter(o => o.Status === filterStatus);

    if (loading) return <div className="v-admin-loading">VION ERA đang tải dữ liệu...</div>;

    return (
        <div className="v-order-manager">
            <div className="v-admin-header mb-4">
                <h2 className="fw-900">QUẢN LÝ ĐƠN HÀNG</h2>
                <div className="v-filter-bar">
                    <button className={filterStatus === 'All' ? 'active' : ''} onClick={() => setFilterStatus('All')}>Tất cả</button>
                    <button className={filterStatus === 'Pending' ? 'active' : ''} onClick={() => setFilterStatus('Pending')}>Chờ xử lý</button>
                    <button className={filterStatus === 'Shipping' ? 'active' : ''} onClick={() => setFilterStatus('Shipping')}>Đang giao</button>
                    <button className={filterStatus === 'Completed' ? 'active' : ''} onClick={() => setFilterStatus('Completed')}>Đã xong</button>
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
                            <tr key={order.OrderID}>
                                <td className="fw-800 text-muted">#VION-{order.OrderID}</td>
                                <td>
                                    <div className="fw-700">{order.FullName}</div>
                                    <div className="small text-muted">{order.Phone}</div>
                                </td>
                                <td className="fw-800 text-danger">{Number(order.TotalAmount).toLocaleString()}đ</td>
                                <td>
                                    <span className={`v-status-tag ${order.Status.toLowerCase()}`}>{order.Status}</span>
                                </td>
                                <td>
                                    <div className="v-btns">
                                        {/* Nút Xem chi tiết: Luôn luôn cho xem */}
    <button className="v-btn view" onClick={() => setSelectedOrder(order)}>
        <Eye size={18}/>
    </button>

    {/* Nút Giao hàng: Chặn nếu đã Hủy hoặc đã Hoàn thành */}
    <button 
        className="v-btn ship" 
        disabled={order.Status === 'Cancelled' || order.Status === 'Completed'} 
        onClick={() => updateStatus(order.OrderID, 'Shipping')}
        style={{ 
            opacity: (order.Status === 'Cancelled' || order.Status === 'Completed') ? 0.4 : 1,
            cursor: (order.Status === 'Cancelled' || order.Status === 'Completed') ? 'not-allowed' : 'pointer'
        }}
    >
        <Truck size={18}/>
    </button>

    {/* Nút Hoàn thành: Chặn nếu đã Hủy */}
    <button 
        className="v-btn done" 
        disabled={order.Status === 'Cancelled'} 
        onClick={() => updateStatus(order.OrderID, 'Completed')}
        style={{ 
            opacity: order.Status === 'Cancelled' ? 0.4 : 1,
            cursor: order.Status === 'Cancelled' ? 'not-allowed' : 'pointer'
        }}
    >
        <CheckCircle size={18}/>
    </button>

    {/* Nút Hủy: Chặn nếu đã Giao, đã Xong hoặc chính nó đã Hủy */}
    <button 
        className="v-btn cancel" 
        disabled={order.Status === 'Shipping' || order.Status === 'Completed' || order.Status === 'Cancelled'} 
        onClick={() => updateStatus(order.OrderID, 'Cancelled')}
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
                            <h5>Chi tiết đơn hàng #VION-{selectedOrder.OrderID}</h5>
                            <button onClick={() => setSelectedOrder(null)}><X size={24}/></button>
                        </div>
                        <div className="v-modal-body">
                            <div className="v-info-grid">
                                <div className="v-info-item">
                                    <label>Người nhận:</label> <span>{selectedOrder.FullName}</span>
                                </div>
                                <div className="v-info-item">
                                    <label>Địa chỉ:</label> <span>{selectedOrder.Address}</span>
                                </div>
                            </div>

                            <div className="v-product-list mt-4">
                                <h6 className="fw-800 border-bottom pb-2">SẢN PHẨM ĐÃ MUA</h6>
                                {selectedOrder.details?.map((detail, idx) => (
                                    <div key={idx} className="v-item-detail">
                                        <Package size={20} className="text-muted" />
                                        <div className="flex-grow-1 ms-3">
                                            <div className="fw-700">{detail.variant?.product?.Name}</div>
                                            <small>Size: {detail.variant?.Size} | SL: x{detail.Quantity}</small>
                                        </div>
                                        <div className="fw-800">{(detail.Price * detail.Quantity).toLocaleString()}đ</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="v-modal-footer">
                            <div className="fs-5">TỔNG CỘNG: <span className="text-danger fw-900">{Number(selectedOrder.TotalAmount).toLocaleString()}đ</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;