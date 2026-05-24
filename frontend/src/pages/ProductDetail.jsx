import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, ChevronRight, Star, MessageSquare, PackageCheck, Trash2, ArrowLeft } from 'lucide-react';
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

            // Lấy toàn bộ danh sách sản phẩm để lọc hàng tương tự
            const allRes = await axios.get(`${API_BASE_URL}/api/products`);
            
            // 🚀 BỌC LÓT LẤY ID DANH MỤC & SẢN PHẨM HIỆN TẠI
            const catID = data.CategoryID || data.category_id || data.category?.id || data.category?.CategoryID;
            const currentProdID = data.ProductID || data.id;
            
            // Đảm bảo bốc đúng mảng dữ liệu dù API trả về dạng nào
            const productsList = Array.isArray(allRes.data) ? allRes.data : (allRes.data.data || []);
            
            // LỌC CHUẨN XÁC: Lọc sản phẩm cùng danh mục trước
            let related = productsList.filter(p => {
                const pCatID = p.CategoryID || p.category_id || p.category?.id || p.category?.CategoryID;
                const pProdID = p.ProductID || p.id;
                
                return String(pCatID) === String(catID) && String(pProdID) !== String(currentProdID);
            });
            
            // Nếu không đủ 12 sản phẩm cùng danh mục, lấy thêm sản phẩm khác để điền đầy lưới gợi ý
            if (related.length < 12) {
                const otherProducts = productsList.filter(p => {
                    const pProdID = p.ProductID || p.id;
                    const isCurrent = String(pProdID) === String(currentProdID);
                    const isAlreadyRelated = related.some(r => String(r.ProductID || r.id) === String(pProdID));
                    return !isCurrent && !isAlreadyRelated;
                });
                related = [...related, ...otherProducts].slice(0, 12);
            } else {
                related = related.slice(0, 12);
            }
            
            setRelatedProducts(related);
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

    useEffect(() => {
        if (!product || !selectedSize) return;
        
        const availableColors = [...new Set(
            product.variants
                ?.filter(v => (v.Size === selectedSize || v.size === selectedSize))
                ?.map(v => v.Color || v.color)
        )].filter(Boolean);

        if (availableColors.length > 0 && !availableColors.includes(selectedColor)) {
            setSelectedColor(availableColors[0]);
        }
    }, [selectedSize, product]);

    const currentVariant = product?.variants?.find(v =>
        (v.Size === selectedSize || v.size === selectedSize) &&
        (v.Color === selectedColor || v.color === selectedColor)
    );
    const maxStock = currentVariant?.Stock || currentVariant?.stock || 0;

    const handleAddToCart = async (isBuyNow = false) => {
        if (!currentVariant) return Swal.fire('Lỗi', 'Chọn Size & Màu sắc!', 'error');

        const token = localStorage.getItem('vion_token');
        const variantId = currentVariant.id || currentVariant.VariantID;

        // Xử lý cho KHÁCH VÃNG LAI (không có token)
        if (!token) {
            let guestCart = [];
            try {
                const storedCart = localStorage.getItem('vion_guest_cart');
                if (storedCart) guestCart = JSON.parse(storedCart);
            } catch (e) {
                guestCart = [];
            }

            const existingIdx = guestCart.findIndex(item => item.VariantID === variantId);
            let finalQty = quantity;

            if (existingIdx > -1) {
                finalQty = guestCart[existingIdx].Quantity + quantity;
                if (finalQty > maxStock) {
                    Swal.fire('Thất bại', `Vượt quá tồn kho! Kho còn ${maxStock} sản phẩm, trong giỏ bạn đã có ${guestCart[existingIdx].Quantity} sản phẩm.`, 'error');
                    return;
                }
                guestCart[existingIdx].Quantity = finalQty;
            } else {
                if (quantity > maxStock) {
                    Swal.fire('Thất bại', `Vượt quá tồn kho! Kho chỉ còn ${maxStock} sản phẩm.`, 'error');
                    return;
                }
                const originalPrice = Number(currentVariant.Price || currentVariant.price || 0);
                const discountPrice = currentVariant.DiscountPrice !== undefined ? currentVariant.DiscountPrice : currentVariant.discount_price;
                const sellingPrice = (discountPrice !== null && discountPrice !== undefined && Number(discountPrice) < originalPrice)
                    ? Number(discountPrice)
                    : originalPrice;

                const guestItem = {
                    id: `guest_${variantId}`,
                    CartItemID: `guest_${variantId}`,
                    VariantID: variantId,
                    Quantity: quantity,
                    Price: sellingPrice,
                    variant: {
                        id: variantId,
                        VariantID: variantId,
                        Size: selectedSize,
                        Color: selectedColor,
                        Price: originalPrice,
                        DiscountPrice: discountPrice,
                        discount_price: discountPrice,
                        discount_percent: currentVariant.discount_percent || 0,
                        Stock: maxStock,
                        product: {
                            ProductID: product.ProductID || product.id,
                            id: product.ProductID || product.id,
                            Name: product.name || product.Name,
                            MainImage: product.main_image || product.MainImage
                        }
                    }
                };
                guestCart.push(guestItem);
            }

            localStorage.setItem('vion_guest_cart', JSON.stringify(guestCart));
            window.dispatchEvent(new Event('cartUpdated'));

            if (isBuyNow) {
                navigate('/checkout', { state: { selectedItems: [`guest_${variantId}`] } });
            } else {
                Swal.fire('Thành công', 'Đã thêm vào giỏ hàng vãng lai!', 'success');
            }
            return;
        }

        // Xử lý cho THÀNH VIÊN ĐÃ ĐĂNG NHẬP
        try {
            await axios.post(`${API_BASE_URL}/api/cart/add`, {
                VariantID: variantId,
                Quantity: quantity
            }, { headers: { Authorization: `Bearer ${token}` } });

            window.dispatchEvent(new Event('cartUpdated'));
            
            if (isBuyNow) {
                // Tải giỏ hàng để lấy CartItemID vừa thêm
                const res = await axios.get(`${API_BASE_URL}/api/my-cart`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const items = res.data.data?.items || [];
                const matchedItem = items.find(item => item.VariantID === variantId);
                if (matchedItem) {
                    navigate('/checkout', { state: { selectedItems: [matchedItem.CartItemID || matchedItem.id] } });
                } else {
                    navigate('/checkout'); // Fallback nếu không tìm thấy
                }
            } else {
                Swal.fire('Thành công', 'Đã thêm vào giỏ!', 'success');
            }
        } catch (err) { 
            const errorMessage = err.response?.data?.message || 'Lỗi thêm vào giỏ!';
            Swal.fire('Thất bại', errorMessage, 'error'); 
        }
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

    const getPriceDetails = () => {
        const variant = currentVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);
        if (!variant) return { price: 0, discountPrice: null, discountPercent: 0, hasDiscount: false };
        const price = variant.price !== undefined ? variant.price : variant.Price;
        const discountPrice = variant.discount_price !== undefined ? variant.discount_price : variant.DiscountPrice;
        const discountPercent = variant.discount_percent !== undefined ? variant.discount_percent : variant.DiscountPercent || 0;
        const hasDiscount = discountPrice !== null && discountPrice !== undefined && Number(discountPrice) < Number(price);
        return { price, discountPrice, discountPercent, hasDiscount };
    };

    const { price: vPrice, discountPrice: vDiscountPrice, discountPercent: vDiscountPercent, hasDiscount: vHasDiscount } = getPriceDetails();
    const averageRating = product.average_rating || 0;
    const reviews = product.reviews || [];

    const storedUser = localStorage.getItem('vion_user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    return (
        <div className="product-detail-page">
            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
                    <img src={selectedImage?.startsWith('http') ? selectedImage : `${API_BASE_URL}/storage/${selectedImage}`} alt="Zoom" className="lightbox-img" />
                </div>
            )}

            <div className="container">
                <button className="v-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> Quay lại
                </button>

                <nav className="v-breadcrumb">
                    <Link to="/">Trang chủ</Link> <ChevronRight size={14} />
                    <span>{product.category?.name || product.category?.Name}</span> <ChevronRight size={14} />
                    <span className="active">{product.name || product.Name}</span>
                </nav>

                <div className="detail-grid">
                    <div className="gallery-section">
                        <div className="main-image-wrap" onClick={() => setIsLightboxOpen(true)}>
                            <img src={selectedImage?.startsWith('http') ? selectedImage : `${API_BASE_URL}/storage/${selectedImage}`} alt="main" />
                        </div>
                        <div className="thumb-list">
                            <div className={`thumb-item ${selectedImage === (product.main_image || product.MainImage) ? 'active' : ''}`}
                                onClick={() => setSelectedImage(product.main_image || product.MainImage)}>
                                <img src={(product.main_image || product.MainImage)?.startsWith('http') ? (product.main_image || product.MainImage) : `${API_BASE_URL}/storage/${product.main_image || product.MainImage}`} alt="thumb" />
                            </div>
                            {product.images?.filter(img => (img.url || img.Url) !== (product.main_image || product.MainImage)).map((img, idx) => (
                                <div key={idx} className={`thumb-item ${selectedImage === (img.url || img.Url) ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(img.url || img.Url)}>
                                    <img src={(img.url || img.Url)?.startsWith('http') ? (img.url || img.Url) : `${API_BASE_URL}/storage/${img.url || img.Url}`} alt="thumb" />
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

                        {vHasDiscount ? (
                            <div className="p-price-big-container" style={{ display: 'flex', alignItems: 'baseline', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                                <span className="p-price-big-current" style={{ fontSize: '30px', fontWeight: '900', color: '#EE4D2D' }}>
                                    {Number(vDiscountPrice).toLocaleString()}đ
                                </span>
                                <span className="p-price-big-original" style={{ fontSize: '18px', textDecoration: 'line-through', color: '#999', fontWeight: '500' }}>
                                    {Number(vPrice).toLocaleString()}đ
                                </span>
                                <span className="p-price-big-discount-badge" style={{ fontSize: '14px', fontWeight: '700', color: '#EE4D2D', backgroundColor: '#FFF0EE', padding: '3px 8px', borderRadius: '3px', border: '1px solid #FCD5D0' }}>
                                    GIẢM {vDiscountPercent}%
                                </span>
                            </div>
                        ) : (
                            <div className="p-price-big" style={{ fontSize: '30px', fontWeight: '900', color: '#111', marginBottom: '25px' }}>
                                {Number(vPrice).toLocaleString()}đ
                            </div>
                        )}
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
                                {[...new Set(
                                    product.variants
                                        ?.filter(v => (v.Size === selectedSize || v.size === selectedSize))
                                        ?.map(v => v.Color || v.color)
                                )].filter(Boolean).map(color => (
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
                        
                        {(product.material || product.usage_instruction) && (
                            <div className="product-specs-box">
                                <h4 className="specs-box-title">Thông số chi tiết</h4>
                                {product.material && (
                                    <div className="spec-item">
                                        <span className="spec-label">Chất liệu</span>
                                        <span className="spec-value">{product.material}</span>
                                    </div>
                                )}
                                {product.usage_instruction && (
                                    <div className="spec-item usage-instruction-item">
                                        <span className="spec-label">Hướng dẫn sử dụng</span>
                                        <div className="spec-value instruction-text">{product.usage_instruction}</div>
                                    </div>
                                )}
                            </div>
                        )}
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
                            const isOwner = currentUser && (currentUser.id === rev.UserID || currentUser.UserID === rev.UserID);
                            
                            return (
                                <div key={i} className="rev-item">
                                    <div className="rev-user" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <b>{rev.user?.FullName || rev.user?.name || "Khách hàng Vion"}</b> 
                                            <PackageCheck size={14} color="#27ae60" style={{ marginLeft: '5px' }} />
                                        </div>
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
                                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < (rev.Rating || 0) ? "#EE4D2D" : "none"} color="#EE4D2D" />)}
                                    </div>
                                    <p style={{ marginTop: '8px', color: '#444' }}>
                                        {rev.Content || rev.Comment || "Người dùng không để lại bình luận."}
                                    </p>
                                </div>
                            );
                        }) : <p>Chưa có đánh giá nào.</p>}
                    </div>
                </div>

                {/* 🚀 GỢI Ý SẢN PHẨM TƯƠNG TỰ ĐƯỢC THÊM VÀO DƯỚI ĐÂY */}
                <div className="related-section">
                    <h3 className="section-subtitle" style={{ textAlign: 'center', borderLeft: 'none', paddingLeft: 0 }}>Có thể bạn sẽ thích</h3>
                    
                    {relatedProducts.length > 0 ? (
                        <div className="related-grid">
                            {relatedProducts.map(relProd => {
                                const v = relProd.variants && relProd.variants.length > 0 ? relProd.variants[0] : null;
                                const price = v ? (v.price !== undefined ? v.price : v.Price) : null;
                                const discountPrice = v ? (v.discount_price !== undefined ? v.discount_price : v.DiscountPrice) : null;
                                const discountPercent = v ? (v.discount_percent !== undefined ? v.discount_percent : v.DiscountPercent) : null;
                                const hasDiscount = v && discountPrice !== null && discountPrice !== undefined && Number(discountPrice) < Number(price);

                                return (
                                    <Link key={relProd.id} to={`/product/${relProd.id}`} className="rel-card">
                                        <div className="rel-img" style={{ position: 'relative' }}>
                                            <img src={relProd.main_image || relProd.MainImage ? ((relProd.main_image || relProd.MainImage).startsWith('http') ? (relProd.main_image || relProd.MainImage) : `${API_BASE_URL}/storage/${relProd.main_image || relProd.MainImage}`) : 'https://via.placeholder.com/300x400'} alt={relProd.name || relProd.Name} />
                                            {hasDiscount && (
                                                <div className="discount-badge-overlay" style={{ top: '5px', left: '5px', fontSize: '9px', padding: '2px 5px' }}>
                                                    -{discountPercent}%
                                                </div>
                                            )}
                                        </div>
                                        <div className="rel-info">
                                            <p className="rel-name">{relProd.name || relProd.Name}</p>
                                            {v ? (
                                                hasDiscount ? (
                                                    <div className="p-price-container" style={{ margin: '0' }}>
                                                        <span className="p-price-current">
                                                            {Number(discountPrice).toLocaleString()}đ
                                                        </span>
                                                        <span className="p-price-original">
                                                            {Number(price).toLocaleString()}đ
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <p className="rel-price">
                                                        {Number(price).toLocaleString()}đ
                                                    </p>
                                                )
                                            ) : (
                                                <p className="rel-price" style={{ color: '#999' }}>
                                                    Liên hệ
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Hiện chưa có sản phẩm cùng danh mục.</p>
                    )}
                </div>
                {/* KẾT THÚC GỢI Ý */}
            </div>
        </div>
    );
};

export default ProductDetail;