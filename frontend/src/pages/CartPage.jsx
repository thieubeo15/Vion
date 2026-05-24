import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import './CartPage.css';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api';

    const handleSelect = (id) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(cartItems.map(item => item.CartItemID || item.id));
        } else {
            setSelectedItems([]);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [token]);

    const fetchCart = async () => {
        setLoading(true);
        if (!token) {
            let guestCart = [];
            try {
                const storedCart = localStorage.getItem('vion_guest_cart');
                if (storedCart) guestCart = JSON.parse(storedCart);
            } catch (e) {
                guestCart = [];
            }
            setCartItems(guestCart);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/my-cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartItems(res.data.data?.items || []);
        } catch (err) {
            console.error("Lỗi fetch giỏ hàng");
        } finally {
            setLoading(false);
        }
    };

    const updateQty = async (itemId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;

        if (!token) {
            let guestCart = [];
            try {
                guestCart = JSON.parse(localStorage.getItem('vion_guest_cart')) || [];
            } catch (e) {
                guestCart = [];
            }

            const itemIndex = guestCart.findIndex(item => (item.CartItemID || item.id) === itemId);
            if (itemIndex > -1) {
                const stock = guestCart[itemIndex].variant?.Stock || guestCart[itemIndex].variant?.stock || 0;
                if (newQty > stock) {
                    Swal.fire('Thất bại', `Vượt quá tồn kho! Kho chỉ còn ${stock} sản phẩm.`, 'error');
                    return;
                }
                guestCart[itemIndex].Quantity = newQty;
                localStorage.setItem('vion_guest_cart', JSON.stringify(guestCart));
                window.dispatchEvent(new Event('cartUpdated'));
                fetchCart();
            }
            return;
        }

        try {
            await axios.put(`${API_URL}/cart-items/${itemId}`,
                { Quantity: newQty },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            window.dispatchEvent(new Event('cartUpdated'));
            fetchCart();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể cập nhật số lượng!";
            Swal.fire('Thất bại', errorMessage, 'error');
        }
    };

    const handleRemove = (itemId) => {
        Swal.fire({
            title: 'Xóa khỏi giỏ?', icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#111', confirmButtonText: 'Xóa ngay'
        }).then(async (result) => {
            if (result.isConfirmed) {
                if (!token) {
                    let guestCart = [];
                    try {
                        guestCart = JSON.parse(localStorage.getItem('vion_guest_cart')) || [];
                    } catch (e) {
                        guestCart = [];
                    }
                    const updatedCart = guestCart.filter(item => (item.CartItemID || item.id) !== itemId);
                    localStorage.setItem('vion_guest_cart', JSON.stringify(updatedCart));
                    window.dispatchEvent(new Event('cartUpdated'));
                    fetchCart();
                    setSelectedItems(prev => prev.filter(i => i !== itemId));
                    return;
                }

                await axios.delete(`${API_URL}/cart-items/${itemId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                window.dispatchEvent(new Event('cartUpdated'));
                fetchCart();
                setSelectedItems(prev => prev.filter(i => i !== itemId));
            }
        });
    };

    const getCartItemPrice = (item) => {
        const originalPrice = Number(item.variant?.Price || item.variant?.price || item.Price || item.price || 0);
        const discountPrice = item.variant?.DiscountPrice !== undefined ? item.variant.DiscountPrice : (item.variant?.discount_price !== undefined ? item.variant.discount_price : (item.DiscountPrice || item.discount_price));
        if (discountPrice !== null && discountPrice !== undefined && Number(discountPrice) < originalPrice) {
            return Number(discountPrice);
        }
        return originalPrice;
    };

    const calculateTotal = () => {
        return cartItems
            .filter(item => selectedItems.includes(item.CartItemID || item.id))
            .reduce((sum, item) => {
                const price = getCartItemPrice(item);
                return sum + (price * item.Quantity);
            }, 0);
    };

    if (loading) return (
        <div className="v-loading-screen">
            <Loader2 className="v-spin mb-3" size={48} color="#111" />
            <p className="fw-800" style={{ letterSpacing: '2px', color: '#111' }}>ĐANG TẢI GIỎ HÀNG...</p>
        </div>
    );

    return (
        <div className="v-cart-page container py-5">
            <div className="v-cart-header mb-4">
                <h2 className="fw-800">GIỎ HÀNG <span>({cartItems.length} món)</span></h2>
                <div className="v-back-link" onClick={() => navigate('/')}><ChevronLeft size={18} /> Tiếp tục mua sắm</div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    {cartItems.length > 0 ? (
                        <div className="v-cart-list-wrapper">
                            <div className="v-cart-select-all mb-3 bg-white p-3 rounded-4 border">
                                <label className="v-checkbox-wrapper d-flex align-items-center mb-0" style={{ cursor: 'pointer' }}>
                                    <input type="checkbox" checked={cartItems.length > 0 && selectedItems.length === cartItems.length} onChange={handleSelectAll} className="v-custom-checkbox" />
                                    <span className="fw-800" style={{ fontSize: '14px', marginLeft: '12px' }}>CHỌN TẤT CẢ ({cartItems.length} SẢN PHẨM)</span>
                                </label>
                            </div>
                            {cartItems.map(item => (
                                <div key={item.CartItemID || item.id} className="v-cart-card position-relative">
                                    <div className="v-item-check-col" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingRight: '10px' }}>
                                        <input type="checkbox" checked={selectedItems.includes(item.CartItemID || item.id)} onChange={() => handleSelect(item.CartItemID || item.id)} className="v-custom-checkbox" style={{ cursor: 'pointer', zoom: '1.5' }} />
                                    </div>
                                    <div
                                        className="d-flex align-items-center"
                                        style={{ cursor: 'pointer', flex: 1, gap: '24px' }}
                                        onClick={() => navigate(`/product/${item.variant?.product?.ProductID || item.variant?.product?.id}`)}
                                        title="Nhấn để xem chi tiết sản phẩm"
                                    >
                                        <img src={item.variant?.product?.MainImage?.startsWith('http') ? item.variant?.product?.MainImage : `http://127.0.0.1:8000/storage/${item.variant?.product?.MainImage}`} className="v-card-img mb-0" alt="prod" />
                                        <div className="v-card-details">
                                            <h5 className="v-product-name hover-text-primary">{item.variant?.product?.Name}</h5>
                                            <p className="v-product-meta">Size: {item.variant?.Size} | Màu: {item.variant?.Color}</p>
                                            {(() => {
                                                const originalPrice = Number(item.variant?.Price || item.variant?.price || item.Price || item.price || 0);
                                                const discountPrice = item.variant?.DiscountPrice !== undefined ? item.variant.DiscountPrice : (item.variant?.discount_price !== undefined ? item.variant.discount_price : (item.DiscountPrice || item.discount_price));
                                                const hasDiscount = discountPrice !== null && discountPrice !== undefined && Number(discountPrice) < originalPrice;

                                                if (hasDiscount) {
                                                    return (
                                                        <div className="p-price-container">
                                                            <span className="p-price-current">
                                                                {Number(discountPrice).toLocaleString()}đ
                                                            </span>
                                                            <span className="p-price-original" style={{ fontSize: '11px' }}>
                                                                {Number(originalPrice).toLocaleString()}đ
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div className="v-price-unit">
                                                        {Number(originalPrice).toLocaleString()}đ
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <div className="v-qty-selector">
                                        <button onClick={() => updateQty(item.CartItemID || item.id, item.Quantity, -1)}><Minus size={14} /></button>
                                        <span>{item.Quantity}</span>
                                        <button onClick={() => updateQty(item.CartItemID || item.id, item.Quantity, 1)}><Plus size={14} /></button>
                                    </div>
                                    <div className="v-card-subtotal">{(getCartItemPrice(item) * item.Quantity).toLocaleString()}đ</div>
                                    <button className="v-btn-del" onClick={() => handleRemove(item.CartItemID || item.id)}><Trash2 size={18} /></button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="v-empty-box">
                            <ShoppingBag size={80} strokeWidth={1} className="mb-4 opacity-25" />
                            <p className="fs-5">Giỏ hàng của bạn đang trống!</p>
                            <button className="btn btn-dark rounded-pill px-5 py-2 mt-3 fw-bold" onClick={() => navigate('/')}>MUA SẮM NGAY</button>
                        </div>
                    )}
                </div>

                <div className="col-lg-4">
                    <div className="v-checkout-sidebar">
                        <div className="v-sidebar-title">
                            <h5>Tổng đơn hàng</h5>
                        </div>
                        <div className="v-bill-row"><span>Đã chọn ({selectedItems.length} món)</span><span>{calculateTotal().toLocaleString()}đ</span></div>
                        <div className="v-total-divider"></div>
                        <div className="v-bill-row total"><span>TỔNG TIỀN</span><span className="v-final-price">{calculateTotal().toLocaleString()}đ</span></div>

                       <button 
    className="v-btn-checkout" 
    onClick={() => {
        if (selectedItems.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Chú ý',
                text: 'Vui lòng chọn sản phẩm để thanh toán',
                confirmButtonColor: '#111'
            });
            return;
        }
        navigate('/checkout', { state: { selectedItems } });
    }}
>
    THANH TOÁN NGAY
</button>
                        <div className="v-secure-checkout">
                            <ShieldCheck size={14} color="#27ae60" /> Thanh toán an toàn 100%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;