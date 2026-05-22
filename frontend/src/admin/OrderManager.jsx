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
        const order = orders.find(o => (o.OrderID || o.id) === orderId);
        const isGuest = order && !order.UserID;

        if (newStatus === 'Cancelled') {
            if (order?.Status === 'CancelRequested') {
                const confirmCancel = await Swal.fire({
                    title: 'Xác nhận duyệt hủy?',
                    text: `Phê duyệt yêu cầu hủy đơn hàng #VION-${orderId} của khách hàng?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Duyệt hủy ngay',
                    cancelButtonText: 'Quay lại'
                });

                if (confirmCancel.isConfirmed) {
                    try {
                        await axios.put(`${API_URL}/orders/${orderId}`, { Status: newStatus }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        Swal.fire('Thành công', 'Đã phê duyệt hủy đơn hàng!', 'success');
                        fetchOrders();
                    } catch (err) {
                        Swal.fire('Lỗi', 'Không thể cập nhật', 'error');
                    }
                }
                return;
            }

            const { value: reason } = await Swal.fire({
                title: 'Hủy đơn hàng này?',
                input: 'text',
                inputLabel: 'Vui lòng nhập lý do hủy đơn (bắt buộc):',
                inputPlaceholder: 'Nhập lý do tại đây...',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Đồng ý hủy',
                cancelButtonText: 'Quay lại',
                inputValidator: (value) => {
                    if (!value) {
                        return 'Bạn phải nhập lý do hủy đơn hàng!';
                    }
                }
            });

            if (reason) {
                try {
                    await axios.put(`${API_URL}/orders/${orderId}`, { Status: newStatus, CancelReason: reason }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    Swal.fire('Thành công', 'Đã hủy đơn hàng và ghi nhận lý do!', 'success');
                    fetchOrders();
                } catch (err) { 
                    Swal.fire('Lỗi', 'Không thể cập nhật', 'error'); 
                }
            }
            return;
        }

        if (isGuest && newStatus === 'Shipping') {
            const confirmGuest = await Swal.fire({
                title: '📞 Xác nhận gọi điện kiểm tra?',
                html: `Đây là đơn hàng của <strong>Khách vãng lai</strong>.<br/>Bạn <strong>bắt buộc phải gọi điện thoại</strong> xác nhận địa chỉ và thông tin đơn hàng trước khi duyệt.<br/><br/>Họ tên: <strong>${order.FullName || order.name}</strong><br/>SĐT: <strong style="color: #ea580c; font-size: 20px;">${order.Phone || order.phone}</strong>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ea580c',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Đã gọi điện & Khách xác nhận',
                cancelButtonText: 'Chưa gọi điện / Quay lại'
            });

            if (!confirmGuest.isConfirmed) {
                return;
            }
        }

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
                const errorMsg = err.response?.data?.message || 'Không thể cập nhật';
                Swal.fire('Lỗi', errorMsg, 'error'); 
            }
        }
    };

    const getStatusLabel = (status) => {
        const map = { 
            Pending: 'Chờ xử lý', 
            CancelRequested: 'Yêu cầu hủy', 
            Shipping: 'Đang giao', 
            Completed: 'Đã xong', 
            Cancelled: 'Đã hủy' 
        };
        return map[status] || status;
    };

    const filteredOrders = filterStatus === 'All' ? orders : orders.filter(o => o.Status === filterStatus);

    if (loading) return <div className="v-admin-loading">VION ERA đang tải dữ liệu...</div>;

    return (
        <div className="v-order-manager">
            <div className="v-admin-header mb-4">
                <h2 className="fw-900">QUẢN LÝ ĐƠN HÀNG</h2>
                <div className="v-filter-bar">
                    {['All', 'Pending', 'CancelRequested', 'Shipping', 'Completed', 'Cancelled'].map(status => (
                        <button 
                            key={status}
                            className={filterStatus === status ? 'active' : ''} 
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'All' ? 'Tất cả' : getStatusLabel(status)}
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
                                    <div className="fw-700 d-flex align-items-center gap-2">
                                        {order.FullName || order.name}
                                        {!order.UserID && (
                                            <span className="v-guest-badge">Khách vãng lai</span>
                                        )}
                                    </div>
                                    <div className="small text-muted">{order.Phone || order.phone}</div>
                                </td>
                                <td className="fw-800 text-danger">{Number(order.TotalAmount || order.total_amount).toLocaleString()}đ</td>
                                <td>
                                    <span className={`v-status-tag ${(order.Status || '').toLowerCase()}`}>{getStatusLabel(order.Status)}</span>
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
                                            disabled={order.Status !== 'Shipping'} 
                                            onClick={() => updateStatus(order.OrderID || order.id, 'Completed')}
                                            style={{ 
                                                opacity: order.Status !== 'Shipping' ? 0.4 : 1,
                                                cursor: order.Status !== 'Shipping' ? 'not-allowed' : 'pointer'
                                            }}
                                            title={order.Status !== 'Shipping' ? "Đơn hàng phải ở trạng thái Đang giao (Shipping) mới có thể Hoàn thành" : "Hoàn thành đơn hàng"}
                                        >
                                            <CheckCircle size={18}/>
                                        </button>

                                        <button 
                                            className="v-btn cancel" 
                                            disabled={order.Status === 'Shipping' || order.Status === 'Completed' || order.Status === 'Cancelled'} 
                                            onClick={() => updateStatus(order.OrderID || order.id, 'Cancelled')}
                                            style={{ 
                                                opacity: (order.Status === 'Shipping' || order.Status === 'Completed' || order.Status === 'Cancelled') ? 0.4 : 1,
                                                cursor: (order.Status === 'Shipping' || order.Status === 'Completed' || order.Status === 'Cancelled') ? 'not-allowed' : 'pointer',
                                                backgroundColor: order.Status === 'CancelRequested' ? '#fee2e2' : undefined,
                                                color: order.Status === 'CancelRequested' ? '#dc2626' : undefined,
                                                width: order.Status === 'CancelRequested' ? 'auto' : undefined,
                                                padding: order.Status === 'CancelRequested' ? '0 12px' : undefined,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                border: order.Status === 'CancelRequested' ? '1px solid #fecaca' : undefined
                                            }}
                                            title={order.Status === 'CancelRequested' ? "Xác nhận yêu cầu hủy đơn hàng" : "Hủy đơn hàng"}
                                        >
                                            <XCircle size={18}/>
                                            {order.Status === 'CancelRequested' && <span className="fw-700" style={{ fontSize: '11px' }}>Xác nhận hủy</span>}
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
                            {!selectedOrder.UserID && (
                                <div className="v-guest-alert">
                                    📞 <strong>Đơn hàng Khách vãng lai:</strong> Vui lòng liên hệ số điện thoại <strong style={{ fontSize: '15px', color: '#ea580c' }}>{selectedOrder.Phone || selectedOrder.phone}</strong> để gọi xác nhận thông tin đơn hàng và địa chỉ trước khi xác nhận đơn!
                                </div>
                            )}
                            <div className="v-info-grid">
                                <div className="v-info-item">
                                    <label>Người nhận:</label> <span>{selectedOrder.FullName || selectedOrder.name}</span>
                                </div>
                                <div className="v-info-item">
                                    <label>Địa chỉ:</label>
                                    <span>
                                        {selectedOrder.SpecificAddress ? (
                                            <span className="d-block">
                                                <div>{selectedOrder.SpecificAddress}</div>
                                                <div>{selectedOrder.Ward}, {selectedOrder.District}, {selectedOrder.Province}</div>
                                            </span>
                                        ) : (
                                            selectedOrder.Address || selectedOrder.address
                                        )}
                                    </span>
                                </div>
                                {selectedOrder.CancelReason && (
                                    <div className="v-info-item v-cancel-reason">
                                        <label>Lý do hủy:</label> <span className="text-danger fw-700">{selectedOrder.CancelReason}</span>
                                    </div>
                                )}
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

                            {selectedOrder.Status === 'CancelRequested' && (
                                <div className="v-modal-actions mt-4 p-3 bg-light rounded text-center" style={{ border: '1px solid #fee2e2' }}>
                                    <h6 className="fw-800 text-warning mb-3">⚠️ KHÁCH HÀNG YÊU CẦU HỦY ĐƠN HÀNG</h6>
                                    <div className="d-flex justify-content-center gap-3">
                                        <button 
                                            className="btn btn-danger btn-sm fw-700 px-3 py-2"
                                            onClick={() => {
                                                updateStatus(selectedOrder.OrderID || selectedOrder.id, 'Cancelled');
                                                setSelectedOrder(null);
                                            }}
                                        >
                                            Đồng ý hủy đơn (Duyệt hủy)
                                        </button>
                                        <button 
                                            className="btn btn-secondary btn-sm fw-700 px-3 py-2"
                                            onClick={() => {
                                                updateStatus(selectedOrder.OrderID || selectedOrder.id, 'Shipping');
                                                setSelectedOrder(null);
                                            }}
                                        >
                                            Từ chối & Giao hàng
                                        </button>
                                    </div>
                                </div>
                            )}
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