import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, MapPin, Phone, User, CreditCard, ShieldCheck, Loader2, Tag, X, Ticket } from 'lucide-react';
import Swal from 'sweetalert2';
import './CheckoutPage.css';

const cleanVoucherCode = (val) => {
    if (!val) return '';
    return val
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const selectedItems = location.state?.selectedItems || [];

    const [orderInfo, setOrderInfo] = useState({
        FullName: '',
        Phone: '',
        SpecificAddress: '',
        Province: '',
        District: '',
        Ward: ''
    });

    const [voucherCode, setVoucherCode] = useState('');
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [voucherInfo, setVoucherInfo] = useState(null);
    const [voucherError, setVoucherError] = useState('');
    const [applyingVoucher, setApplyingVoucher] = useState(false);
    const [showVoucherPicker, setShowVoucherPicker] = useState(false);
    const [walletVouchers, setWalletVouchers] = useState([]);

    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api';

    useEffect(() => {
        fetchSummary();
    }, [token]);

    const fetchSummary = async () => {
        try {
            let allItems = [];
            if (token) {
                const res = await axios.get(`${API_URL}/my-cart`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                allItems = res.data.data?.items || [];
            } else {
                try {
                    const stored = localStorage.getItem('vion_guest_cart');
                    allItems = stored ? JSON.parse(stored) : [];
                } catch (e) {
                    allItems = [];
                }
            }

            if (selectedItems.length > 0) {
                const filtered = allItems.filter(item => selectedItems.includes(item.id || item.CartItemID));
                setCartItems(filtered);
                if (filtered.length === 0) {
                    navigate('/cart');
                }
            } else {
                navigate('/cart');
            }
        } catch (err) {
            console.error("Lỗi lấy thông tin đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    // FIX LỖI NaN: Hàm tính tổng cực mạnh, chấp cả chữ hoa lẫn chữ thường
    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => {
            const price = Number(item.Price || item.price || item.variant?.Price || item.variant?.price || 0);
            const qty = Number(item.Quantity || item.quantity || 0);
            return sum + (price * qty);
        }, 0);
    };

    const calculateFinalTotal = () => {
        return calculateTotal() - voucherDiscount;
    };

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;
        setApplyingVoucher(true);
        setVoucherError('');
        try {
            const res = await axios.post(`${API_URL}/voucher/apply`, {
                code: voucherCode,
                total_amount: calculateTotal()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVoucherDiscount(res.data.discount_amount);
            setVoucherInfo(res.data.voucher_info);
            setVoucherError('');
        } catch (err) {
            setVoucherError(err.response?.data?.message || 'Mã giảm giá không hợp lệ!');
            setVoucherDiscount(0);
            setVoucherInfo(null);
        } finally {
            setApplyingVoucher(false);
        }
    };

    const handleRemoveVoucher = () => {
        setVoucherCode('');
        setVoucherDiscount(0);
        setVoucherInfo(null);
        setVoucherError('');
    };

    const fetchWalletVouchers = async () => {
        try {
            const res = await axios.get(`${API_URL}/my-vouchers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const active = (res.data.data || []).filter(v => v.status === 'active');
            setWalletVouchers(active);
            setShowVoucherPicker(true);
        } catch (err) { console.error(err); }
    };

    const handleSelectWalletVoucher = async (code) => {
        setShowVoucherPicker(false);
        setVoucherCode(code);
        setApplyingVoucher(true);
        setVoucherError('');
        try {
            const res = await axios.post(`${API_URL}/voucher/apply`, {
                code, total_amount: calculateTotal()
            }, { headers: { Authorization: `Bearer ${token}` } });
            setVoucherDiscount(res.data.discount_amount);
            setVoucherInfo(res.data.voucher_info);
        } catch (err) {
            setVoucherError(err.response?.data?.message || 'Voucher không hợp lệ!');
            setVoucherDiscount(0); setVoucherInfo(null);
        } finally { setApplyingVoucher(false); }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Kiểm tra nhanh thông tin
        if (!orderInfo.FullName || !orderInfo.Phone || !orderInfo.SpecificAddress || !orderInfo.Province || !orderInfo.District || !orderInfo.Ward) {
            Swal.fire('Chú ý', 'Vui lòng nhập đầy đủ thông tin giao hàng!', 'warning');
            return;
        }

        const itemsToSend = token
            ? selectedItems
            : cartItems.map(item => ({
                VariantID: item.VariantID || item.variant?.VariantID,
                Quantity: item.Quantity
            }));

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            const res = await axios.post(`${API_URL}/orders/place`, {
                FullName: orderInfo.FullName,
                Phone: orderInfo.Phone,
                SpecificAddress: orderInfo.SpecificAddress,
                Province: orderInfo.Province,
                District: orderInfo.District,
                Ward: orderInfo.Ward,
                TotalAmount: calculateFinalTotal(),
                PaymentMethod: 'COD',
                SelectedItems: itemsToSend,
                VoucherCode: token && voucherInfo ? voucherCode : undefined
            }, {
                headers: headers
            });

            if (res.data.success) {
                if (!token) {
                    let guestCart = [];
                    try {
                        guestCart = JSON.parse(localStorage.getItem('vion_guest_cart')) || [];
                    } catch (errGuest) {}
                    const updatedCart = guestCart.filter(item => !selectedItems.includes(item.id || item.CartItemID));
                    localStorage.setItem('vion_guest_cart', JSON.stringify(updatedCart));
                    window.dispatchEvent(new Event('cartUpdated'));
                }
                Swal.fire({
                    icon: 'success',
                    title: 'ĐẶT HÀNG THÀNH CÔNG!',
                    text: 'Đơn hàng của bạn đã được hệ thống ghi nhận.',
                    confirmButtonColor: '#111',
                    confirmButtonText: 'Về trang chủ'
                }).then(() => navigate('/'));
            }
        } catch (err) {
            Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi khi đặt hàng!', 'error');
        }
    };

    if (loading) return (
        <div className="v-checkout-loading">
            <Loader2 className="v-spin" size={40} />
            <p>Đang chuẩn bị đơn hàng...</p>
        </div>
    );

    return (
        <div className="v-checkout-wrapper container py-5">
            <div className="v-back-cart mb-4" onClick={() => navigate('/cart')}>
                <ChevronLeft size={18} /> <span>Quay lại giỏ hàng</span>
            </div>

            <form onSubmit={handlePlaceOrder} className="row g-5">
                {/* BÊN TRÁI: THÔNG TIN GIAO HÀNG */}
                <div className="col-lg-7">
                    <h4 className="v-section-title mb-4">THÔNG TIN GIAO HÀNG</h4>
                    <div className="v-checkout-form-box">
                        <div className="v-input-field">
                            <label><User size={16} /> Họ và tên người nhận</label>
                            <input
                                type="text"
                                required
                                placeholder="VD: Nguyễn Văn A"
                                onChange={e => setOrderInfo({ ...orderInfo, FullName: e.target.value })}
                            />
                        </div>
                        <div className="v-input-field mt-4">
                            <label><Phone size={16} /> Số điện thoại liên hệ</label>
                            <input
                                type="text"
                                required
                                placeholder="Số điện thoại nhận hàng"
                                onChange={e => setOrderInfo({ ...orderInfo, Phone: e.target.value })}
                            />
                        </div>
                        <div className="v-input-field mt-4">
                            <label><MapPin size={16} /> Địa chỉ cụ thể</label>
                            <textarea
                                required
                                rows="2"
                                placeholder="Số nhà, tên đường..."
                                value={orderInfo.SpecificAddress}
                                onChange={e => setOrderInfo({ ...orderInfo, SpecificAddress: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="row mt-4">
                            <div className="col-md-4">
                                <div className="v-input-field">
                                    <label>Tỉnh / Thành phố</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Tỉnh / Thành phố"
                                        value={orderInfo.Province}
                                        onChange={e => setOrderInfo({ ...orderInfo, Province: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="v-input-field">
                                    <label>Quận / Huyện</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Quận / Huyện"
                                        value={orderInfo.District}
                                        onChange={e => setOrderInfo({ ...orderInfo, District: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="v-input-field">
                                    <label>Phường / Xã</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Phường / Xã"
                                        value={orderInfo.Ward}
                                        onChange={e => setOrderInfo({ ...orderInfo, Ward: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <h4 className="v-section-title mt-5 mb-4">PHƯƠNG THỨC THANH TOÁN</h4>
                    <div className="v-pay-option">
                        <div className="v-pay-card active">
                            <CreditCard size={20} />
                            <div className="ms-3">
                                <div className="fw-800 fs-15">Thanh toán khi nhận hàng (COD)</div>
                                <div className="text-muted fs-12">Nhận hàng rồi mới trả tiền cho shipper.</div>
                            </div>
                            <div className="v-dot-active"></div>
                        </div>
                    </div>
                </div>

                {/* BÊN PHẢI: TỔNG KẾT ĐƠN HÀNG */}
                <div className="col-lg-5">
                    <div className="v-order-bill-card sticky-top" style={{ top: '100px' }}>
                        <h5 className="v-bill-title">CHI TIẾT ĐƠN HÀNG</h5>

                        <div className="v-bill-items mb-4">
                            {cartItems.map(item => (
                                <div key={item.id || item.CartItemID} className="v-bill-item d-flex justify-content-between mb-3">
                                    <div className="v-bill-info">
                                        <div className="fw-700 fs-14">{item.variant?.product?.Name || 'Sản phẩm'}</div>
                                        <div className="text-muted fs-12">Size: {item.variant?.Size} | SL: x{item.Quantity}</div>
                                    </div>
                                    <div className="fw-800 text-dark">
                                        {(Number(item.Price || item.price || item.variant?.Price || item.variant?.price || 0) * Number(item.Quantity || item.quantity || 0)).toLocaleString()}đ
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="v-bill-calc">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tạm tính</span>
                                <span>{calculateTotal().toLocaleString()}đ</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 text-success">
                                <span>Phí vận chuyển</span>
                                <span className="fw-700">MIỄN PHÍ</span>
                            </div>

                            {/* VOUCHER SECTION */}
                            {token ? (
                                <div className="v-voucher-section">
                                    <div className="v-voucher-label">
                                        <Tag size={14} /> Mã giảm giá
                                    </div>
                                    {!voucherInfo ? (
                                        <>
                                            <div className="v-voucher-input-wrap">
                                                <input
                                                    type="text"
                                                    className="v-voucher-input"
                                                    placeholder="Nhập mã giảm giá..."
                                                    value={voucherCode}
                                                    onChange={e => setVoucherCode(cleanVoucherCode(e.target.value))}
                                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyVoucher())}
                                                />
                                                <button
                                                    type="button"
                                                    className="v-voucher-apply-btn"
                                                    onClick={handleApplyVoucher}
                                                    disabled={applyingVoucher}
                                                >
                                                    {applyingVoucher ? <Loader2 className="v-spin" size={14} /> : 'ÁP DỤNG'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="v-voucher-wallet-btn"
                                                    onClick={fetchWalletVouchers}
                                                    title="Chọn từ ví voucher"
                                                >
                                                    <Ticket size={14} /> Ví
                                                </button>
                                            </div>
                                            {showVoucherPicker && (
                                                <div className="v-voucher-picker">
                                                    <div className="v-picker-header">
                                                        <span>🏷️ Chọn voucher từ ví</span>
                                                        <button type="button" onClick={() => setShowVoucherPicker(false)}><X size={14} /></button>
                                                    </div>
                                                    {walletVouchers.length === 0 ? (
                                                        <div className="v-picker-empty">Ví không có voucher khả dụng</div>
                                                    ) : walletVouchers.map(v => (
                                                        <div key={v.id} className="v-picker-item" onClick={() => handleSelectWalletVoucher(v.code)}>
                                                            <div className="v-picker-code">{v.code}</div>
                                                            <div className="v-picker-value">
                                                                {v.type === 'fixed' ? `Giảm ${Number(v.value).toLocaleString()}đ` : `Giảm ${v.value}%${v.max_discount ? ` (tối đa ${Number(v.max_discount).toLocaleString()}đ)` : ''}`}
                                                            </div>
                                                            {v.min_order > 0 && <div className="v-picker-min">Đơn tối thiểu: {Number(v.min_order).toLocaleString()}đ</div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {voucherError && (
                                                <div className="v-voucher-error">{voucherError}</div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="v-voucher-applied">
                                            <Tag size={14} />
                                            <span>Giảm {voucherDiscount.toLocaleString()}đ</span>
                                            <button type="button" className="v-voucher-remove" onClick={handleRemoveVoucher}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="v-voucher-guest-notice p-3 text-center border rounded mb-3 bg-light">
                                    <span className="text-muted fs-13"> Đăng nhập để sử dụng mã giảm giá!</span>
                                </div>
                            )}

                            <div className="v-bill-divider my-3"></div>
                            {voucherDiscount > 0 && (
                                <div className="v-discount-row d-flex justify-content-between mb-2">
                                    <span>Giảm giá</span>
                                    <span>-{voucherDiscount.toLocaleString()}đ</span>
                                </div>
                            )}
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-800 fs-16">TỔNG TIỀN</span>
                                <span className="v-grand-total">{calculateFinalTotal().toLocaleString()}đ</span>
                            </div>
                        </div>

                        <button type="submit" className="v-btn-place-order mt-4">XÁC NHẬN ĐẶT HÀNG</button>

                        <div className="v-security-note mt-3">
                            <ShieldCheck size={14} /> Giao dịch được bảo mật bởi VION ERA
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;