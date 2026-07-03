import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Truck, CheckCircle, XCircle, Package, Search, X, ShoppingCart } from 'lucide-react';
import Swal from 'sweetalert2';
import './OrderManager.css';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); 
    const [filterStatus, setFilterStatus] = useState('All');
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        if (selectedOrder) {
            setAdminNote(selectedOrder.ReturnAdminNote || '');
        } else {
            setAdminNote('');
        }
    }, [selectedOrder]);
    
    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
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
            confirmButtonColor: '#111',
            cancelButtonText: 'Hủy'
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

    const handleUpdateReturnStatus = async (orderId, newStatus) => {
        const confirm = await Swal.fire({
            title: 'Xác nhận?',
            text: `Chuyển trạng thái hoàn trả đơn hàng sang: ${getStatusLabel(newStatus)}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#111',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });

        if (confirm.isConfirmed) {
            try {
                const res = await axios.put(`${API_URL}/orders/${orderId}`, {
                    Status: newStatus,
                    ReturnAdminNote: adminNote
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Thành công', 'Đã cập nhật trạng thái hoàn hàng!', 'success');
                setSelectedOrder(res.data);
                fetchOrders();
            } catch (err) {
                Swal.fire('Lỗi', err.response?.data?.message || 'Không thể cập nhật trạng thái', 'error');
            }
        }
    };

    const handleRejectReturn = async (orderId) => {
        const { value: rejectReason } = await Swal.fire({
            title: 'Từ chối yêu cầu hoàn hàng?',
            input: 'textarea',
            inputLabel: 'Vui lòng nhập lý do từ chối (bắt buộc):',
            inputPlaceholder: 'Nhập lý do tại đây...',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xác nhận từ chối',
            cancelButtonText: 'Quay lại',
            inputValidator: (value) => {
                if (!value) {
                    return 'Bạn phải nhập lý do từ chối hoàn hàng!';
                }
            }
        });

        if (rejectReason) {
            try {
                const res = await axios.put(`${API_URL}/orders/${orderId}`, {
                    Status: 'Completed',
                    ReturnAdminNote: `Từ chối hoàn hàng: ${rejectReason}`
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Thành công', 'Đã từ chối hoàn hàng và khôi phục đơn hàng!', 'success');
                setSelectedOrder(res.data);
                fetchOrders();
            } catch (err) {
                Swal.fire('Lỗi', err.response?.data?.message || 'Không thể từ chối hoàn hàng', 'error');
            }
        }
    };

    const getStatusLabel = (status) => {
        const map = { 
            Pending: 'Chờ xử lý', 
            CancelRequested: 'Yêu cầu hủy', 
            Shipping: 'Đang giao', 
            Completed: 'Đã xong', 
            Cancelled: 'Đã hủy',
            ReturnRequested: 'Yêu cầu trả hàng',
            ReturnApproved: 'Chờ nhận hàng trả',
            ReturnReceived: 'Đang kiểm hàng',
            Refunded: 'Đã hoàn tiền',
            Returned: 'Hoàn hàng hoàn tất'
        };
        return map[status] || status;
    };

    const filteredOrders = filterStatus === 'All' 
        ? orders 
        : filterStatus === 'Returns'
            ? orders.filter(o => ['ReturnRequested', 'ReturnApproved', 'ReturnReceived', 'Refunded', 'Returned'].includes(o.Status))
            : orders.filter(o => o.Status === filterStatus);

    if (loading && orders.length === 0) return <div className="v-admin-loading">VION ERA đang tải dữ liệu...</div>;

    return (
        <div className="v-order-manager">
            <div className="v-admin-header mb-4">
                <h2>
                    <ShoppingCart className="v-brand-icon" size={24} />
                    Quản lý đơn hàng
                </h2>
                <div className="v-filter-bar">
                    {['All', 'Pending', 'CancelRequested', 'Shipping', 'Completed', 'Cancelled', 'Returns'].map(status => (
                        <button 
                            key={status}
                            className={filterStatus === status ? 'active' : ''} 
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'All' ? 'Tất cả' : (status === 'Returns' ? 'Trả hàng' : getStatusLabel(status))}
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
                                            disabled={order.Status === 'Cancelled' || order.Status === 'Completed' || ['ReturnRequested', 'ReturnApproved', 'ReturnReceived', 'Refunded', 'Returned'].includes(order.Status)} 
                                            onClick={() => updateStatus(order.OrderID || order.id, 'Shipping')}
                                            style={{ 
                                                opacity: (order.Status === 'Cancelled' || order.Status === 'Completed' || ['ReturnRequested', 'ReturnApproved', 'ReturnReceived', 'Refunded', 'Returned'].includes(order.Status)) ? 0.4 : 1,
                                                cursor: (order.Status === 'Cancelled' || order.Status === 'Completed' || ['ReturnRequested', 'ReturnApproved', 'ReturnReceived', 'Refunded', 'Returned'].includes(order.Status)) ? 'not-allowed' : 'pointer'
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
                                            disabled={order.Status === 'Shipping' || order.Status === 'Completed' || order.Status === 'Cancelled' || ['ReturnRequested', 'ReturnApproved', 'ReturnReceived', 'Refunded', 'Returned'].includes(order.Status)} 
                                            onClick={() => updateStatus(order.OrderID || order.id, 'Cancelled')}
                                            style={{ 
                                                opacity: (order.Status === 'Shipping' || order.Status === 'Completed' || order.Status === 'Cancelled' || ['ReturnRequested', 'ReturnApproved', 'ReturnReceived', 'Refunded', 'Returned'].includes(order.Status)) ? 0.4 : 1,
                                                cursor: (order.Status === 'Shipping' || order.Status === 'Completed' || order.Status === 'Cancelled' || ['ReturnRequested', 'ReturnApproved', 'ReturnReceived', 'Refunded', 'Returned'].includes(order.Status)) ? 'not-allowed' : 'pointer',
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
                                {['ReturnRequested', 'ReturnApproved', 'ReturnReceived', 'Refunded', 'Returned'].includes(selectedOrder.Status) && (
                                    <div className="v-info-item v-return-info mt-4 p-3 rounded" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', gridColumn: '1 / -1', display: 'block' }}>
                                        <h6 className="fw-800 text-primary mb-3">📦 THÔNG TIN YÊU CẦU HOÀN HÀNG</h6>
                                        <div className="mb-2">
                                            <strong>Lý do hoàn hàng:</strong> <span className="text-dark">{selectedOrder.ReturnReason}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Phương thức nhận tiền:</strong> <span className="text-dark">{selectedOrder.RefundMethod === 'Bank' ? 'Chuyển khoản ngân hàng' : selectedOrder.RefundMethod}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Thông tin tài khoản/ví:</strong> <span className="text-dark">{selectedOrder.RefundDetails}</span>
                                        </div>
                                        {selectedOrder.ReturnAdminNote && (
                                            <div className="mb-2">
                                                <strong>Ghi chú từ Shop:</strong> <span className="text-muted italic">{selectedOrder.ReturnAdminNote}</span>
                                            </div>
                                        )}
                                        
                                        
                                        {selectedOrder.Status !== 'Returned' && (
                                            <div className="mt-3">
                                                <label className="fw-700 fs-13 mb-1 d-block text-dark">Ghi chú của Shop:</label>
                                                <textarea 
                                                    className="v-return-admin-note-input"
                                                    placeholder="Nhập phản hồi, ghi chú kiểm hàng hoặc thông tin nhận hàng trả..."
                                                    value={adminNote}
                                                    onChange={(e) => setAdminNote(e.target.value)}
                                                    rows={2}
                                                    style={{ width: '100%', borderRadius: '8px', fontSize: '13px', padding: '8px', border: '1px solid #cbd5e1' }}
                                                />
                                            </div>
                                        )}

                                        
                                        <div className="v-return-actions mt-3 d-flex gap-2 flex-wrap">
                                            {selectedOrder.Status === 'ReturnRequested' && (
                                                <button 
                                                    className="btn btn-primary btn-sm fw-700 px-3 py-2"
                                                    onClick={() => handleUpdateReturnStatus(selectedOrder.OrderID || selectedOrder.id, 'ReturnApproved')}
                                                >
                                                    Duyệt yêu cầu (Chờ nhận hàng)
                                                </button>
                                            )}
                                            {selectedOrder.Status === 'ReturnApproved' && (
                                                <button 
                                                    className="btn btn-warning btn-sm text-dark fw-700 px-3 py-2"
                                                    onClick={() => handleUpdateReturnStatus(selectedOrder.OrderID || selectedOrder.id, 'ReturnReceived')}
                                                >
                                                    Đã nhận hàng (Kiểm hàng)
                                                </button>
                                            )}
                                            {selectedOrder.Status === 'ReturnReceived' && (
                                                <button 
                                                    className="btn btn-info btn-sm text-white fw-700 px-3 py-2"
                                                    onClick={() => handleUpdateReturnStatus(selectedOrder.OrderID || selectedOrder.id, 'Refunded')}
                                                >
                                                    Xác nhận đã hoàn tiền
                                                </button>
                                            )}
                                            {selectedOrder.Status === 'Refunded' && (
                                                <button 
                                                    className="btn btn-success btn-sm fw-700 px-3 py-2"
                                                    onClick={() => handleUpdateReturnStatus(selectedOrder.OrderID || selectedOrder.id, 'Returned')}
                                                >
                                                    Hoàn tất (Cộng tồn kho)
                                                </button>
                                            )}
                                            
                                            
                                            {selectedOrder.Status !== 'Returned' && (
                                                <button 
                                                    className="btn btn-outline-danger btn-sm fw-700 px-3 py-2 ms-auto"
                                                    onClick={() => handleRejectReturn(selectedOrder.OrderID || selectedOrder.id)}
                                                >
                                                    Từ chối hoàn hàng
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="v-product-list mt-4">
                                <h6 className="fw-800 border-bottom pb-2">SẢN PHẨM ĐÃ MUA</h6>
                                {selectedOrder.details?.map((detail, idx) => (
                                    <div key={idx} className="v-item-detail">
                                        <Package size={20} className="text-muted" />
                                        <div className="flex-grow-1 ms-3">
                                            
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

                            
                            <div className="v-billing-summary mt-4 p-3 bg-light rounded" style={{ fontSize: '14px', border: '1px solid #e2e8f0' }}>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Tổng tiền hàng:</span>
                                    <span className="fw-700 text-dark">{(selectedOrder.details || []).reduce((sum, item) => sum + (Number(item.Price || item.price) * Number(item.Quantity || item.quantity)), 0).toLocaleString()}đ</span>
                                </div>
                                {Number(selectedOrder.DiscountAmount || selectedOrder.discount_amount || 0) > 0 && (
                                    <div className="d-flex justify-content-between mb-2 text-success">
                                        <span>Giảm giá voucher:</span>
                                        <span className="fw-700">-{Number(selectedOrder.DiscountAmount || selectedOrder.discount_amount || 0).toLocaleString()}đ</span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between mb-0">
                                    <span className="text-muted">Phí vận chuyển:</span>
                                    <span className="fw-700 text-dark">
                                        {Number(selectedOrder.ShippingFee || selectedOrder.shipping_fee || 0) > 0 
                                            ? `+${Number(selectedOrder.ShippingFee || selectedOrder.shipping_fee || 0).toLocaleString()}đ` 
                                            : 'Miễn phí'}
                                    </span>
                                </div>
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