import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, ChevronRight, Star, MessageSquare, PackageCheck, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedImage, setSelectedImage] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');

    const API_BASE_URL = 'http://127.0.0.1:8000';

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
            const data = res.data.data;
            setProduct(data);
            setSelectedImage(data.main_image || data.MainImage);

            if (data.variants?.length > 0) {
                setSelectedSize(data.variants[0].Size || data.variants[0].size);
                setSelectedColor(data.variants[0].Color || data.variants[0].color);
            }

            const allRes = await axios.get(`${API_BASE_URL}/api/products`);
            const catID = data.category_id || data.CategoryID;
            const related = allRes.data.data.filter(p => 
                (p.category_id === catID || p.CategoryID === catID) && 
                (p.id !== data.id && p.ProductID !== data.ProductID)
            );
            setRelatedProducts(related.slice(0, 6));

            setLoading(false);
        } catch (err) {
            console.error("Lỗi API:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const currentVariant = product?.variants?.find(v =>
        (v.Size === selectedSize || v.size === selectedSize) &&
        (v.Color === selectedColor || v.color === selectedColor)
    );
    const maxStock = currentVariant?.Stock || currentVariant?.stock || 0;

    const handleAddToCart = async (isBuyNow = false) => {
        const token = localStorage.getItem('vion_token');
        if (!token) {
            Swal.fire({ icon: 'info', title: 'Thông báo', text: 'Vui lòng đăng nhập!', confirmButtonColor: '#111' })
                .then((res) => { if (res.isConfirmed) navigate('/login'); });
            return;
        }
        if (!currentVariant) return Swal.fire('Lỗi', 'Chọn Size & Màu sắc!', 'error');

        try {
            await axios.post(`${API_BASE_URL}/api/cart/add`, {
                VariantID: currentVariant.id || currentVariant.VariantID,
                Quantity: quantity
            }, { headers: { Authorization: `Bearer ${token}` } });

            window.dispatchEvent(new Event('cartUpdated'));
            if (isBuyNow) navigate('/checkout');
            else Swal.fire('Thành công', 'Đã thêm vào giỏ!', 'success');
        } catch (err) { Swal.fire('Thất bại', 'Lỗi thêm vào giỏ!', 'error'); }
    };

    const handleSubmitReview = async () => {
        const token = localStorage.getItem('vion_token');
        if (!token) return Swal.fire('Thông báo', 'Đăng nhập để đánh giá!', 'info');
        if (!newComment.trim()) return Swal.fire('Lỗi', 'Nhập nội dung nhận xét!', 'error');

        try {
            await axios.post(`${API_BASE_URL}/api/reviews`, {
                ProductID: id,
                Rating: newRating,
                Comment: newComment
            }, { headers: { Authorization: `Bearer ${token}` } });

            Swal.fire('Thành công', 'Cảm ơn bạn đã đánh giá!', 'success');
            setNewComment('');
            setNewRating(5);
            fetchData(); 
        } catch (err) {
            Swal.fire('Thất bại', err.response?.data?.message || 'Không thể gửi đánh giá!', 'error');
        }
    };

    // 🗑️ HÀM XỬ LÝ XÓA REVIEW
    const handleDeleteReview = async (reviewId) => {
        const token = localStorage.getItem('vion_token');
        const result = await Swal.fire({
            title: 'Xóa đánh giá?',
            text: "Bạn có chắc muốn xóa nhận xét này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa luôn!',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Đã xóa!', 'Đánh giá đã bị xóa.', 'success');
                fetchData();
            } catch (err) {
                Swal.fire('Lỗi', err.response?.data?.message || 'Không thể xóa', 'error');
            }
        }
    };

    if (loading || !product) return <div className="v-loading">VION ERA ĐANG TẢI...</div>;

    const displayPrice = currentVariant ? (currentVariant.Price || currentVariant.price) : (product.variants?.[0]?.Price || 0);
    const averageRating = product.average_rating || 0;
    const reviews = product.reviews || [];

    // Lấy thông tin user đang đăng nhập để so sánh quyền xóa
    const storedUser = localStorage.getItem('vion_user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    return (
        <div className="product-detail-page">
            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
                    <img src={`${API_BASE_URL}/storage/${selectedImage}`} alt="Zoom" className="lightbox-img" />
                </div>
            )}

            <div className="container">
                <nav className="v-breadcrumb">
                    <Link to="/">Trang chủ</Link> <ChevronRight size={14} />
                    <span>{product.category?.name || product.category?.Name}</span> <ChevronRight size={14} />
                    <span className="active">{product.name || product.Name}</span>
                </nav>

                <div className="detail-grid">
                    <div className="gallery-section">
                        <div className="main-image-wrap" onClick={() => setIsLightboxOpen(true)}>
                            <img src={`${API_BASE_URL}/storage/${selectedImage}`} alt="main" />
                        </div>
                        <div className="thumb-list">
                            <div className={`thumb-item ${selectedImage === (product.main_image || product.MainImage) ? 'active' : ''}`}
                                onClick={() => setSelectedImage(product.main_image || product.MainImage)}>
                                <img src={`${API_BASE_URL}/storage/${product.main_image || product.MainImage}`} alt="thumb" />
                            </div>
                            {product.images?.map((img, idx) => (
                                <div key={idx} className={`thumb-item ${selectedImage === (img.url || img.Url) ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(img.url || img.Url)}>
                                    <img src={`${API_BASE_URL}/storage/${img.url || img.Url}`} alt="thumb" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="info-section">
                        <h1 className="p-title">{product.name || product.Name}</h1>
                        <div className="p-meta">
                            <div className="p-rating">
                                <span className="rating-num">{averageRating}</span>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < averageRating ? "#EE4D2D" : "none"} color={i < averageRating ? "#EE4D2D" : "#ccc"} />
                                ))}
                                <span className="rev-count">| {reviews.length} Đánh giá</span>
                                <a href="#review-section" className="btn-jump-review" onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('review-section').scrollIntoView({ behavior: 'smooth' });
                                }}>Viết đánh giá</a>
                            </div>
                            <div className="p-sold">Đã bán {product.sold_count || 0}</div>
                        </div>

                        <div className="p-price-big">{Number(displayPrice).toLocaleString()}đ</div>
                        <div className="p-divider"></div>

                        <div className="option-group">
                            <label>Kích thước: <span>{selectedSize}</span></label>
                            <div className="btn-options">
                                {[...new Set(product.variants?.map(v => v.Size || v.size))].filter(Boolean).map(size => (
                                    <button key={size} className={selectedSize === size ? 'active' : ''} onClick={() => setSelectedSize(size)}>{size}</button>
                                ))}
                            </div>
                        </div>

                        <div className="option-group">
                            <label>Màu sắc: <span>{selectedColor}</span></label>
                            <div className="btn-options">
                                {[...new Set(product.variants?.map(v => v.Color || v.color))].filter(Boolean).map(color => (
                                    <button key={color} className={selectedColor === color ? 'active' : ''} onClick={() => setSelectedColor(color)}>{color}</button>
                                ))}
                            </div>
                        </div>

                        <div className="quantity-stock">
                            <div className="quantity-box">
                                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>-</button>
                                <input type="number" value={quantity} readOnly />
                                <button onClick={() => quantity < maxStock && setQuantity(quantity + 1)} disabled={quantity >= maxStock}>+</button>
                            </div>
                            <span className="stock-label">{maxStock > 0 ? `Kho: ${maxStock} sản phẩm` : 'Hết hàng'}</span>
                        </div>

                        <div className="action-buttons">
                            <button className="btn-add-cart" disabled={maxStock === 0} onClick={() => handleAddToCart(false)}>
                                <ShoppingCart size={20} /> THÊM VÀO GIỎ
                            </button>
                            <button className="btn-buy-now" disabled={maxStock === 0} onClick={() => handleAddToCart(true)}>MUA NGAY</button>
                        </div>
                    </div>
                </div>

                <div className="bottom-content-grid">
                    <div className="description-left">
                        <h3 className="section-subtitle">Mô tả sản phẩm</h3>
                        <div className="desc-content" style={{ whiteSpace: 'pre-line', color: '#333', lineHeight: '1.6' }}>
                            {product.description || product.Description || "Sản phẩm này hiện chưa có mô tả chi tiết."}
                        </div>
                    </div>

                    <div className="reviews-right" id="review-section">
                        <h3 className="section-subtitle">Đánh giá sản phẩm</h3>
                        
                        <div className="add-review-box highlight-box">
                            <h4>Trải nghiệm của bạn thế nào?</h4>
                            <div className="star-selector">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <Star key={num} size={26} fill={num <= newRating ? "#EE4D2D" : "none"} color="#EE4D2D" style={{ cursor: 'pointer' }} onClick={() => setNewRating(num)} />
                                ))}
                                <span className="rating-label">({newRating}/5 sao)</span>
                            </div>
                            <textarea placeholder="Chất liệu vải, form dáng có ok không bạn?" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                            <button className="btn-send-review" onClick={handleSubmitReview}>GỬI ĐÁNH GIÁ</button>
                        </div>

                        <div className="review-summary-box">
                            <div className="rating-overview">
                                <span className="score-big">{averageRating}</span><span className="score-max">/5</span>
                                <div className="stars-row">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < averageRating ? "#EE4D2D" : "none"} color="#EE4D2D" />)}
                                </div>
                            </div>
                        </div>

                        {reviews.length > 0 ? reviews.map((rev, i) => {
                            // Kiểm tra xem user đang đăng nhập có phải chủ nhân review không
                            const isOwner = currentUser && (currentUser.id === rev.UserID || currentUser.UserID === rev.UserID);
                            
                            return (
                                <div key={i} className="rev-item">
                                    <div className="rev-user" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <b>{rev.user?.FullName || rev.user?.name || "Khách hàng Vion"}</b> 
                                            <PackageCheck size={14} color="#27ae60" style={{ marginLeft: '5px' }} />
                                        </div>
                                        {/* 🗑️ NÚT XÓA CHIẾN THUẬT */}
                                        {isOwner && (
                                            <button 
                                                onClick={() => handleDeleteReview(rev.id || rev.ReviewID)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4d', padding: '5px' }}
                                                title="Xóa đánh giá"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="rev-stars" style={{ color: '#EE4D2D', fontSize: '12px', marginBottom: '5px' }}>
                                        {'★'.repeat(rev.Rating)}{'☆'.repeat(5 - rev.Rating)}
                                    </div>
                                    <p style={{ marginTop: '8px', color: '#444' }}>
    {/* Dùng rev.Content vì JSON của bro trả về tên này */}
    {rev.Content || "Người dùng không để lại bình luận."}
</p>
                                    <small className="text-muted" style={{fontSize: '11px'}}>{new Date(rev.created_at).toLocaleDateString('vi-VN')}</small>
                                </div>
                            );
                        }) : <div className="no-rev-box"><MessageSquare size={32} color="#ccc" /><p>Chưa có đánh giá nào.</p></div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;