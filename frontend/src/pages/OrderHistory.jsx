import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock, Truck, CheckCircle, XCircle, Inbox, X, AlertTriangle, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './OrderHistory.css';

const CANCEL_REASONS = [
    'Tôi muốn thay đổi địa chỉ giao hàng',
    'Tôi muốn thay đổi sản phẩm / số lượng',
    'Tôi tìm thấy giá rẻ hơn ở nơi khác',
    'Đặt nhầm sản phẩm',
    'Thay đổi phương thức thanh toán',
    'Không còn nhu cầu mua nữa',
];

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    // Cancel modal state
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api';
    const ASSET_URL = 'http://127.0.0.1:8000/storage/'; // Đường dẫn lấy ảnh

    const tabs = [
        { id: 'All', label: 'Tất cả' },
        { id: 'Pending', label: 'Chờ xử lý' },
        { id: 'CancelRequested', label: 'Yêu cầu hủy' },
        { id: 'Shipping', label: 'Đang giao' },
        { id: 'Completed', label: 'Hoàn thành' },
        { id: 'Cancelled', label: 'Đã hủy' },
    ];

    useEffect(() => { fetchMyOrders(); }, []);

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

    const filteredOrders = filterStatus === 'All'
        ? orders
        : orders.filter(order => order.Status === filterStatus);

    const openCancelModal = (orderId) => {
        setCancelOrderId(orderId);
        setSelectedReason('');
        setCustomReason('');
        setShowCancelModal(true);
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
        setCancelOrderId(null);
        setSelectedReason('');
        setCustomReason('');
    };

    const handleConfirmCancel = async () => {
        const reason = selectedReason === '__other__' ? customReason.trim() : selectedReason;
        if (!reason) {
            Swal.fire('Chú ý', 'Vui lòng chọn hoặc nhập lý do hủy đơn!', 'warning');
            return;
        }
        setCancelling(true);
        try {
            await axios.post(`${API_URL}/orders/${cancelOrderId}/cancel`, { reason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            closeCancelModal();
            Swal.fire({
                icon: 'success',
                title: 'Đã hủy đơn hàng',
                text: 'Đơn hàng của bạn đã được hủy thành công.',
                confirmButtonColor: '#111',
                timer: 2500,
                timerProgressBar: true,
            });
            fetchMyOrders();
        } catch (err) {
            Swal.fire('Lỗi', err.response?.data?.message || 'Không thể hủy đơn hàng!', 'error');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock size={16} strokeWidth={2.5} />;
            case 'CancelRequested': return <AlertTriangle size={16} strokeWidth={2.5} />;
            case 'Shipping': return <Truck size={16} strokeWidth={2.5} />;
            case 'Completed': return <CheckCircle size={16} strokeWidth={2.5} />;
            case 'Cancelled': return <XCircle size={16} strokeWidth={2.5} />;
            default: return <Package size={16} strokeWidth={2.5} />;
        }
    };

    const getStatusLabel = (status) => {
        const map = { 
            Pending: 'Chờ xác nhận', 
            CancelRequested: 'Yêu cầu hủy', 
            Shipping: 'Đang giao', 
            Completed: 'Hoàn thành', 
            Cancelled: 'Đã hủy' 
        };
        return map[status] || status;
    };

    if (loading) return <div className="v-loading">Đang tải đơn mua...</div>;

    return (
        <div className="v-order-history container py-5">
            <div className="v-back-action mb-4" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} /> <span>Quay lại</span>
            </div>
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
                        {tab.id !== 'All' && orders.filter(o => o.Status === tab.id).length > 0 && (
                            <span className="v-tab-count">
                                {orders.filter(o => o.Status === tab.id).length}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="v-empty-order text-center py-5 bg-white rounded-4 shadow-sm">
                    <Inbox size={64} className="text-muted mb-3 opacity-25" />
                    <p className="text-muted fw-600">Không tìm thấy đơn hàng nào trong mục này!</p>
                    <button className="v-btn-shop mt-3" onClick={() => window.location.href = '/'}>MUA SẮM NGAY</button>
                </div>
            ) : (
                <div className="v-order-list">
                    {filteredOrders.map(order => (
                        <div key={order.OrderID} className="v-order-card shadow-sm mb-4">
                            {/* HEADER ĐƠN HÀNG */}
                            <div className="v-order-header d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <Package size={18} className="text-muted" />
                                    <span className="v-order-id text-dark">Mã đơn: <b className="text-uppercase">#VION-{order.OrderID}</b></span>
                                </div>
                                <span className={`v-status-label ${order.Status.toLowerCase()}`}>
                                    {getStatusIcon(order.Status)} {getStatusLabel(order.Status)}
                                </span>
                            </div>

                            {/* DANH SÁCH SẢN PHẨM */}
                            <div className="v-order-body">
                                {order.details.map((item, index) => (
                                    <div key={index} className="v-product-row d-flex align-items-center">
                                        <div className="v-product-img-box">
                                            <img 
                                                src={item.variant?.product?.MainImage ? (item.variant.product.MainImage.startsWith('http') ? item.variant.product.MainImage : `${ASSET_URL}${item.variant.product.MainImage}`) : 'https://via.placeholder.com/80'} 
                                                alt={item.variant?.product?.Name} 
                                                className="v-product-img"
                                            />
                                        </div>
                                        <div className="v-product-info flex-grow-1">
                                            <h6 className="mb-1 fw-700 text-dark v-text-truncate">{item.variant?.product?.Name}</h6>
                                            <div className="text-muted fs-13 mb-1">
                                                Phân loại: {item.variant?.Color} / {item.variant?.Size}
                                            </div>
                                            <div className="fw-600 fs-14">x{item.Quantity}</div>
                                        </div>
                                        <div className="v-product-price text-end">
                                            <div className="fw-800 text-danger fs-15">{(item.Price * item.Quantity).toLocaleString()}đ</div>
                                            {item.Price !== (item.variant?.Price || item.Price) && (
                                                <div className="text-muted text-decoration-line-through fs-12 mt-1">
                                                    {(item.variant?.Price * item.Quantity).toLocaleString()}đ
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* THÔNG TIN GIAO HÀNG */}
                            <div className="v-order-shipping-info">
                                <div className="fw-700 text-dark mb-1">📍 Địa chỉ nhận hàng:</div>
                                <div><strong>{order.FullName}</strong> | {order.Phone}</div>
                                <div className="text-muted mt-1">
                                    {order.SpecificAddress ? (
                                        `${order.SpecificAddress}, ${order.Ward}, ${order.District}, ${order.Province}`
                                    ) : (
                                        order.Address
                                    )}
                                </div>
                            </div>

                            {/* LÝ DO HỦY */}
                            {(order.Status === 'Cancelled' || order.Status === 'CancelRequested') && order.CancelReason && (
                                <div className="v-cancel-reason-box" style={{ background: order.Status === 'CancelRequested' ? '#fffbeb' : '#fef2f2', color: order.Status === 'CancelRequested' ? '#b45309' : '#dc2626' }}>
                                    <AlertTriangle size={16} color={order.Status === 'CancelRequested' ? '#b45309' : '#dc2626'} />
                                    <span>{order.Status === 'CancelRequested' ? 'Lý do khách yêu cầu hủy' : 'Lý do hủy'}: <strong>{order.CancelReason}</strong></span>
                                </div>
                            )}

                            {/* FOOTER ĐƠN HÀNG */}
                            <div className="v-order-footer d-flex justify-content-between align-items-center">
                                <div className="v-order-date text-muted fs-13 d-flex align-items-center gap-1">
                                    <Clock size={14} /> Ngày đặt: {new Date(order.OrderDate).toLocaleDateString('vi-VN')}
                                </div>
                                <div className="v-total-section d-flex align-items-center gap-4">
                                    <div className="d-flex flex-column align-items-end">
                                        <span className="fs-13 text-muted">Thành tiền</span>
                                        <span className="v-price-grand text-danger fw-900 fs-18">{Number(order.TotalAmount).toLocaleString()}đ</span>
                                    </div>
                                    {order.Status === 'Pending' && (
                                        <button
                                            className="v-btn-cancel-action"
                                            onClick={() => openCancelModal(order.OrderID)}
                                        >
                                            Hủy đơn hàng
                                        </button>
                                    )}
                                    {order.Status === 'CancelRequested' && (
                                        <span className="v-cancel-requested-badge" style={{ padding: '8px 16px', background: '#fffbeb', color: '#b45309', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                                            ⏳ Đang chờ admin xác nhận hủy
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL HỦY ĐƠN */}
            {showCancelModal && (
                <div className="v-cancel-modal-overlay" onClick={closeCancelModal}>
                    <div className="v-cancel-modal" onClick={e => e.stopPropagation()}>
                        <div className="v-cancel-modal-header">
                            <div className="v-cancel-modal-title">
                                <h3>Chọn lý do hủy đơn</h3>
                                <p className="text-muted fs-13 mt-1 mb-0">Việc hủy đơn sẽ không thể hoàn tác. Vui lòng cân nhắc kỹ.</p>
                            </div>
                            <button className="v-cancel-modal-close" onClick={closeCancelModal}><X size={24} /></button>
                        </div>

                        <div className="v-cancel-modal-body">
                            <div className="v-reason-grid">
                                {CANCEL_REASONS.map((reason, i) => (
                                    <label key={i} className={`v-reason-block ${selectedReason === reason ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="cancelReason"
                                            value={reason}
                                            className="d-none"
                                            checked={selectedReason === reason}
                                            onChange={() => { setSelectedReason(reason); setCustomReason(''); }}
                                        />
                                        <div className="v-reason-content">
                                            <span>{reason}</span>
                                            <div className="v-check-circle"></div>
                                        </div>
                                    </label>
                                ))}
                                <label className={`v-reason-block ${selectedReason === '__other__' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="cancelReason"
                                        value="__other__"
                                        className="d-none"
                                        checked={selectedReason === '__other__'}
                                        onChange={() => setSelectedReason('__other__')}
                                    />
                                    <div className="v-reason-content">
                                        <span>Lý do khác...</span>
                                        <div className="v-check-circle"></div>
                                    </div>
                                </label>
                            </div>

                            {selectedReason === '__other__' && (
                                <textarea
                                    className="v-custom-reason-input mt-3"
                                    placeholder="Vui lòng nhập lý do cụ thể để Vion có thể phục vụ bạn tốt hơn..."
                                    value={customReason}
                                    onChange={e => setCustomReason(e.target.value)}
                                    rows={3}
                                    autoFocus
                                />
                            )}
                        </div>

                        <div className="v-cancel-modal-footer">
                            <button className="v-cancel-modal-btn-back" onClick={closeCancelModal}>
                                Đóng
                            </button>
                            <button
                                className="v-cancel-modal-btn-confirm"
                                onClick={handleConfirmCancel}
                                disabled={cancelling || !selectedReason || (selectedReason === '__other__' && !customReason.trim())}
                            >
                                {cancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;