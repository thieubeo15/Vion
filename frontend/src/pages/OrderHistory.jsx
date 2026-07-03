import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Clock, Truck, CheckCircle, XCircle, Inbox, X, AlertTriangle, ChevronRight, ArrowLeft, Star } from 'lucide-react';
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

    
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnOrderId, setReturnOrderId] = useState(null);
    const [returnReason, setReturnReason] = useState('');
    const [refundMethod, setRefundMethod] = useState('Bank'); 
    const [refundDetails, setRefundDetails] = useState('');
    const [returning, setReturning] = useState(false);

    
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewProductId, setReviewProductId] = useState(null);
    const [reviewProductName, setReviewProductName] = useState('');
    const [reviewProductImage, setReviewProductImage] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const openReviewModal = (productId, productName, productImage) => {
        setReviewProductId(productId);
        setReviewProductName(productName);
        setReviewProductImage(productImage);
        setReviewRating(5);
        setReviewComment('');
        setShowReviewModal(true);
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setReviewProductId(null);
        setReviewProductName('');
        setReviewProductImage('');
        setReviewRating(5);
        setReviewComment('');
    };

    const handleSubmitReview = async () => {
        if (!reviewComment.trim()) {
            Swal.fire('Chú ý', 'Vui lòng nhập nội dung đánh giá!', 'warning');
            return;
        }
        setSubmittingReview(true);
        try {
            await axios.post(`${API_URL}/reviews`, {
                ProductID: reviewProductId,
                Rating: reviewRating,
                Comment: reviewComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            closeReviewModal();
            Swal.fire({
                icon: 'success',
                title: 'Đánh giá thành công',
                text: 'Cảm ơn bạn đã gửi đánh giá cho sản phẩm!',
                confirmButtonColor: '#111',
                timer: 2500,
                timerProgressBar: true,
            });
            fetchMyOrders();
        } catch (err) {
            Swal.fire('Lỗi', err.response?.data?.message || 'Không thể gửi đánh giá sản phẩm!', 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api';
    const ASSET_URL = 'http://127.0.0.1:8000/storage/'; 

    const tabs = [
        { id: 'All', label: 'Tất cả' },
        { id: 'Pending', label: 'Chờ xử lý' },
        { id: 'CancelRequested', label: 'Yêu cầu hủy' },
        { id: 'Shipping', label: 'Đang giao' },
        { id: 'Completed', label: 'Hoàn thành' },
        { id: 'Cancelled', label: 'Đã hủy' },
        { id: 'Returns', label: 'Trả hàng/Hoàn tiền' }
    ];

    useEffect(() => { fetchMyOrders(); }, []);

    const fetchMyOrders = async () => {
        if (orders.length === 0) setLoading(true);
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

    const getTabCount = (tabId) => {
        if (tabId === 'All') return 0;
        if (tabId === 'Returns') {
            return orders.filter(o => ['ReturnRequested', 'ReturnApproved', 'ReturnReceived', 'Refunded', 'Returned'].includes(o.Status)).length;
        }
        return orders.filter(o => o.Status === tabId).length;
    };

    const filteredOrders = filterStatus === 'All'
        ? orders
        : filterStatus === 'Returns'
            ? orders.filter(order => ['ReturnRequested', 'ReturnApproved', 'ReturnReceived', 'Refunded', 'Returned'].includes(order.Status))
            : orders.filter(order => order.Status === filterStatus);

    const openReturnModal = (orderId) => {
        setReturnOrderId(orderId);
        setReturnReason('');
        setRefundMethod('Bank');
        setRefundDetails('');
        setShowReturnModal(true);
    };

    const closeReturnModal = () => {
        setShowReturnModal(false);
        setReturnOrderId(null);
        setReturnReason('');
        setRefundMethod('Bank');
        setRefundDetails('');
    };

    const handleConfirmReturn = async () => {
        if (!returnReason.trim()) {
            Swal.fire('Chú ý', 'Vui lòng nhập lý do hoàn hàng!', 'warning');
            return;
        }
        if (!refundDetails.trim()) {
            Swal.fire('Chú ý', 'Vui lòng nhập thông tin nhận tiền hoàn!', 'warning');
            return;
        }
        setReturning(true);
        try {
            await axios.post(`${API_URL}/orders/${returnOrderId}/return`, {
                reason: returnReason,
                refund_method: refundMethod,
                refund_details: refundDetails
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            closeReturnModal();
            Swal.fire({
                icon: 'success',
                title: 'Gửi yêu cầu thành công',
                text: 'Yêu cầu hoàn hàng đã được gửi tới Vion Era.',
                confirmButtonColor: '#111',
                timer: 2500,
                timerProgressBar: true,
            });
            fetchMyOrders();
        } catch (err) {
            Swal.fire('Lỗi', err.response?.data?.message || 'Không thể gửi yêu cầu hoàn hàng!', 'error');
        } finally {
            setReturning(false);
        }
    };

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

    const isWithin7Days = (dateStr) => {
        if (!dateStr) return false;
        const completedDate = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now - completedDate);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock size={16} strokeWidth={2.5} />;
            case 'CancelRequested': return <AlertTriangle size={16} strokeWidth={2.5} />;
            case 'Shipping': return <Truck size={16} strokeWidth={2.5} />;
            case 'Completed': return <CheckCircle size={16} strokeWidth={2.5} />;
            case 'Cancelled': return <XCircle size={16} strokeWidth={2.5} />;
            case 'ReturnRequested': return <Clock size={16} strokeWidth={2.5} />;
            case 'ReturnApproved': return <Truck size={16} strokeWidth={2.5} />;
            case 'ReturnReceived': return <Inbox size={16} strokeWidth={2.5} />;
            case 'Refunded': return <CheckCircle size={16} strokeWidth={2.5} />;
            case 'Returned': return <Package size={16} strokeWidth={2.5} />;
            default: return <Package size={16} strokeWidth={2.5} />;
        }
    };

    const getStatusLabel = (status) => {
        const map = { 
            Pending: 'Chờ xác nhận', 
            CancelRequested: 'Yêu cầu hủy', 
            Shipping: 'Đang giao', 
            Completed: 'Hoàn thành', 
            Cancelled: 'Đã hủy',
            ReturnRequested: 'Yêu cầu hoàn hàng',
            ReturnApproved: 'Chờ gửi hàng về shop',
            ReturnReceived: 'Shop đang kiểm hàng',
            Refunded: 'Đã hoàn tiền',
            Returned: 'Hoàn hàng hoàn tất'
        };
        return map[status] || status;
    };

    if (loading && orders.length === 0) return <div className="v-loading">Đang tải đơn mua...</div>;

    return (
        <div className="v-order-history container py-5">
            <div className="v-back-action mb-4" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} /> <span>Quay lại</span>
            </div>
            <h2 className="fw-900 mb-4 text-center">ĐƠN MUA CỦA TÔI</h2>

            
            <div className="v-order-tabs shadow-sm mb-4">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={`v-tab-item ${filterStatus === tab.id ? 'active' : ''}`}
                        onClick={() => setFilterStatus(tab.id)}
                    >
                        {tab.label}
                        {tab.id !== 'All' && getTabCount(tab.id) > 0 && (
                            <span className="v-tab-count">
                                {getTabCount(tab.id)}
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
                            
                            <div className="v-order-header d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <Package size={18} className="text-muted" />
                                    <span className="v-order-id text-dark">Mã đơn: <b className="text-uppercase">#VION-{order.OrderID}</b></span>
                                </div>
                                <span className={`v-status-label ${order.Status.toLowerCase()}`}>
                                    {getStatusIcon(order.Status)} {getStatusLabel(order.Status)}
                                </span>
                            </div>

                            
                            <div className="v-order-body">
                                {order.details.map((item, index) => {
                                    const productId = item.variant?.product?.ProductID || item.variant?.product?.id || item.variant?.ProductID;
                                    return (
                                        <div 
                                            key={index} 
                                            className="v-product-row d-flex align-items-center"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => productId && navigate(`/product/${productId}`)}
                                        >
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
                                                {order.Status === 'Completed' && (
                                                    <button 
                                                        className="v-btn-product-review"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const pId = item.variant?.product?.ProductID || item.variant?.product?.id || item.variant?.ProductID;
                                                            const pName = item.variant?.product?.Name || '';
                                                            const pImage = item.variant?.product?.MainImage || '';
                                                            openReviewModal(pId, pName, pImage);
                                                        }}
                                                    >
                                                        Đánh giá sản phẩm
                                                    </button>
                                                )}
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
                                    );
                                })}
                            </div>

                            
                            <div className="v-order-pricing-summary" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                padding: '15px 20px',
                                borderTop: '1px solid #f0f0f0',
                                borderBottom: '1px solid #f0f0f0',
                                background: '#fafafb',
                                fontSize: '13px',
                                color: '#555',
                                gap: '5px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                                    <span>Tổng tiền hàng:</span>
                                    <strong className="text-dark">{(order.details || []).reduce((sum, item) => sum + (Number(item.Price) * Number(item.Quantity)), 0).toLocaleString()}đ</strong>
                                </div>
                                {Number(order.DiscountAmount) > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', color: '#10b981' }}>
                                        <span>Giảm giá voucher:</span>
                                        <strong>-{Number(order.DiscountAmount).toLocaleString()}đ</strong>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                                    <span>Phí vận chuyển:</span>
                                    <strong className="text-dark">{Number(order.ShippingFee) > 0 ? `+${Number(order.ShippingFee).toLocaleString()}đ` : 'Miễn phí'}</strong>
                                </div>
                            </div>

                            
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

                            
                            {(order.Status === 'Cancelled' || order.Status === 'CancelRequested') && order.CancelReason && (
                                <div className="v-cancel-reason-box" style={{ background: order.Status === 'CancelRequested' ? '#fffbeb' : '#fef2f2', color: order.Status === 'CancelRequested' ? '#b45309' : '#dc2626' }}>
                                    <AlertTriangle size={16} color={order.Status === 'CancelRequested' ? '#b45309' : '#dc2626'} />
                                    <span>{order.Status === 'CancelRequested' ? 'Lý do khách yêu cầu hủy' : 'Lý do hủy'}: <strong>{order.CancelReason}</strong></span>
                                </div>
                            )}

                            
                            {['ReturnRequested', 'ReturnApproved', 'ReturnReceived', 'Refunded', 'Returned'].includes(order.Status) && (
                                <div className="v-return-info-box">
                                    <div className="fw-700 fs-14 text-dark mb-1 d-flex align-items-center gap-1">
                                        <Package size={16} className="text-primary" /> Chi tiết yêu cầu trả hàng:
                                    </div>
                                    <div>Lý do hoàn hàng: <strong>{order.ReturnReason}</strong></div>
                                    <div>Phương thức hoàn tiền: <strong>{order.RefundMethod === 'Bank' ? 'Chuyển khoản ngân hàng' : order.RefundMethod}</strong></div>
                                    <div>Thông tin nhận tiền: <strong>{order.RefundDetails}</strong></div>
                                    {order.ReturnAdminNote && (
                                        <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed #bae6fd', color: '#0284c7' }}>
                                            💬 <strong>Phản hồi từ shop:</strong> <span className="text-dark">{order.ReturnAdminNote}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            
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
                                    {order.Status === 'Completed' && (
                                        isWithin7Days(order.updated_at || order.UpdatedAt || order.OrderDate) ? (
                                            <button
                                                className="v-btn-return-action"
                                                onClick={() => openReturnModal(order.OrderID)}
                                            >
                                                Yêu cầu hoàn hàng
                                            </button>
                                        ) : (
                                            <span className="v-cancel-requested-badge" style={{ padding: '8px 16px', background: '#f1f5f9', color: '#64748b', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                                                ❌ Quá hạn đổi trả (Hạn 7 ngày)
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            
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

              
              {showReturnModal && (
                  <div className="v-cancel-modal-overlay" onClick={closeReturnModal}>
                      <div className="v-cancel-modal" onClick={e => e.stopPropagation()}>
                          <div className="v-cancel-modal-header">
                              <div className="v-cancel-modal-title">
                                  <h3>Yêu cầu hoàn hàng</h3>
                                  <p className="text-muted fs-13 mt-1 mb-0">Vui lòng điền thông tin chi tiết để chúng tôi xử lý hoàn hàng cho bạn.</p>
                              </div>
                              <button className="v-cancel-modal-close" onClick={closeReturnModal}><X size={24} /></button>
                          </div>

                          <div className="v-cancel-modal-body">
                              
                              <div className="mb-4">
                                  <label className="fw-700 fs-14 mb-2 d-block text-dark">Lý do hoàn hàng:</label>
                                  <textarea
                                      className="v-custom-reason-input"
                                      placeholder="Vui lòng nhập lý do hoàn hàng cụ thể (ví dụ: Sản phẩm lỗi, không đúng size, v.v.)..."
                                      value={returnReason}
                                      onChange={e => setReturnReason(e.target.value)}
                                      rows={3}
                                      style={{ background: '#fff', borderColor: '#eee', color: '#111' }}
                                  />
                              </div>

                              
                              <div className="mb-4">
                                  <label className="fw-700 fs-14 mb-2 d-block text-dark">Phương thức nhận tiền hoàn:</label>
                                  <div className="d-flex gap-2">
                                      {[
                                          { id: 'Bank', label: 'Chuyển khoản Ngân hàng' },
                                          { id: 'Momo', label: 'Momo' },
                                          { id: 'ZaloPay', label: 'ZaloPay' }
                                      ].map(method => (
                                          <button
                                              key={method.id}
                                              type="button"
                                              className={`v-cancel-modal-btn-back py-2 px-3 fs-13 ${refundMethod === method.id ? 'active' : ''}`}
                                              onClick={() => setRefundMethod(method.id)}
                                              style={{ 
                                                  flex: 1, 
                                                  borderColor: refundMethod === method.id ? '#EE4D2D' : '#e0e0e0',
                                                  background: refundMethod === method.id ? '#fff8f6' : '#fff',
                                                  color: refundMethod === method.id ? '#EE4D2D' : '#111',
                                              }}
                                          >
                                              {method.label}
                                          </button>
                                      ))}
                                  </div>
                              </div>

                              
                              <div className="mb-2">
                                  <label className="fw-700 fs-14 mb-2 d-block text-dark">
                                      {refundMethod === 'Bank' ? 'Thông tin tài khoản ngân hàng:' : 'Thông tin ví điện tử:'}
                                  </label>
                                  <textarea
                                      className="v-custom-reason-input"
                                      placeholder={
                                          refundMethod === 'Bank' 
                                              ? "Nhập: Tên Ngân hàng, Số tài khoản, Tên chủ tài khoản..." 
                                              : "Nhập: Số điện thoại nhận tiền, Tên chủ tài khoản..."
                                      }
                                      value={refundDetails}
                                      onChange={e => setRefundDetails(e.target.value)}
                                      rows={3}
                                      style={{ background: '#fff', borderColor: '#eee', color: '#111' }}
                                  />
                              </div>
                          </div>

                          <div className="v-cancel-modal-footer">
                              <button className="v-cancel-modal-btn-back" onClick={closeReturnModal}>
                                  Đóng
                              </button>
                              <button
                                  className="v-cancel-modal-btn-confirm"
                                  onClick={handleConfirmReturn}
                                  disabled={returning || !returnReason.trim() || !refundDetails.trim()}
                                  style={{ background: '#111' }}
                              >
                                  {returning ? 'Đang gửi...' : 'Xác nhận yêu cầu'}
                              </button>
                          </div>
                      </div>
                  </div>
               )}
               
               {showReviewModal && (
                   <div className="v-cancel-modal-overlay" onClick={closeReviewModal}>
                       <div className="v-cancel-modal" onClick={e => e.stopPropagation()}>
                           <div className="v-cancel-modal-header">
                               <div className="v-cancel-modal-title">
                                   <h3>Đánh giá sản phẩm</h3>
                                   <p className="text-muted fs-13 mt-1 mb-0">Chia sẻ trải nghiệm thực tế của bạn về sản phẩm này.</p>
                               </div>
                               <button className="v-cancel-modal-close" onClick={closeReviewModal}><X size={24} /></button>
                           </div>

                           <div className="v-cancel-modal-body">
                               
                               <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ background: '#f8f9fa', border: '1px solid #eee' }}>
                                   <img 
                                       src={reviewProductImage ? (reviewProductImage.startsWith('http') ? reviewProductImage : `${ASSET_URL}${reviewProductImage}`) : 'https://via.placeholder.com/80'} 
                                       alt={reviewProductName} 
                                       style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                                   />
                                   <div>
                                       <h6 className="fw-700 text-dark mb-0 v-text-truncate" style={{ maxWidth: '340px' }}>{reviewProductName}</h6>
                                   </div>
                               </div>

                               
                               <div className="mb-4 text-center">
                                   <label className="fw-700 fs-14 mb-2 d-block text-dark text-start">Điểm chất lượng:</label>
                                   <div className="d-flex justify-content-center gap-2 my-3">
                                       {[1, 2, 3, 4, 5].map(num => (
                                           <Star 
                                               key={num} 
                                               size={32} 
                                               fill={num <= reviewRating ? "#EE4D2D" : "none"} 
                                               color="#EE4D2D" 
                                               style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }} 
                                               onClick={() => setReviewRating(num)}
                                               onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                               onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                           />
                                       ))}
                                   </div>
                                   <span className="fw-800 fs-14" style={{ color: '#EE4D2D' }}>
                                       {reviewRating === 5 ? 'Cực kỳ hài lòng (5/5 ⭐)' :
                                        reviewRating === 4 ? 'Rất hài lòng (4/5 ⭐)' :
                                        reviewRating === 3 ? 'Bình thường (3/5 ⭐)' :
                                        reviewRating === 2 ? 'Không hài lòng (2/5 ⭐)' :
                                        'Tệ (1/5 ⭐)'}
                                   </span>
                               </div>

                               
                               <div className="mb-2">
                                   <label className="fw-700 fs-14 mb-2 d-block text-dark">Viết nhận xét:</label>
                                   <textarea
                                       className="v-custom-reason-input"
                                       placeholder="Chất liệu vải thế nào? Form dáng có đúng mô tả không? Shop giao hàng nhanh không bạn?..."
                                       value={reviewComment}
                                       onChange={e => setReviewComment(e.target.value)}
                                       rows={4}
                                       style={{ background: '#fff', borderColor: '#eee', color: '#111', padding: '12px' }}
                                   />
                               </div>
                           </div>

                           <div className="v-cancel-modal-footer">
                               <button className="v-cancel-modal-btn-back" onClick={closeReviewModal}>
                                   Đóng
                               </button>
                               <button
                                   className="v-cancel-modal-btn-confirm"
                                   onClick={handleSubmitReview}
                                   disabled={submittingReview || !reviewComment.trim()}
                                   style={{ background: '#EE4D2D', color: '#fff', borderColor: '#EE4D2D' }}
                               >
                                   {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                               </button>
                           </div>
                       </div>
                   </div>
               )}
           </div>
    );
};

export default OrderHistory;