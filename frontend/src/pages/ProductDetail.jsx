import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import axios from 'axios';
import { ShoppingCart, ChevronRight, Star, MessageSquare, PackageCheck, X } from 'lucide-react';
import Swal from 'sweetalert2'; // Thêm SweetAlert2
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // Khởi tạo điều hướng
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedImage, setSelectedImage] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const API_BASE_URL = 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
                const data = res.data.data;
                setProduct(data);
                setSelectedImage(data.MainImage || data.main_image);

                if (data.variants?.length > 0) {
                    setSelectedSize(data.variants[0].Size || data.variants[0].size);
                    setSelectedColor(data.variants[0].Color || data.variants[0].color);
                }

                const allRes = await axios.get(`${API_BASE_URL}/api/products`);
                const related = allRes.data.data.filter(p => p.CategoryID === data.CategoryID && p.id !== data.id);
                setRelatedProducts(related.slice(0, 6));

                setLoading(false);
                window.scrollTo(0, 0);
            } catch (err) {
                console.error("Lỗi API:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Tìm variant đang được chọn
    const currentVariant = product?.variants?.find(v =>
        (v.Size === selectedSize || v.size === selectedSize) &&
        (v.Color === selectedColor || v.color === selectedColor)
    );
    const maxStock = currentVariant?.Stock || currentVariant?.stock || 0;

    // Logic Xử lý Thêm vào giỏ hàng
    const handleAddToCart = async () => {
        const token = localStorage.getItem('vion_token');

        // 1. Kiểm tra đăng nhập
        if (!token) {
            Swal.fire({
                icon: 'info',
                title: 'Vion Era thông báo',
                text: 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ nhé!',
                confirmButtonColor: '#111',
                confirmButtonText: 'Đăng nhập ngay',
                showCancelButton: true,
                cancelButtonText: 'Để sau'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login');
                }
            });
            return;
        }

        // 2. Kiểm tra variant
        if (!currentVariant) {
            Swal.fire('Lỗi', 'Vui lòng chọn đầy đủ Size và Màu sắc!', 'error');
            return;
        }

        try {
            // Gọi API lưu vào DB
            await axios.post(`${API_BASE_URL}/api/cart/add`, {
                VariantID: currentVariant.id || currentVariant.VariantID || currentVariant.VariantItemID, // Tùy theo tên cột ID variant của bạn
                Quantity: quantity
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Thông báo thành công
            window.dispatchEvent(new Event('cartUpdated'));
            Swal.fire({
                icon: 'success',
                title: 'Đã thêm vào giỏ!',
                text: `Bạn đã thêm ${quantity} sản phẩm vào giỏ hàng.`,
                showConfirmButton: true,
                confirmButtonColor: '#111',
                confirmButtonText: 'Xem giỏ hàng',
                showCancelButton: true,
                cancelButtonText: 'Tiếp tục mua sắm'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/cart'); // Chuyển hướng sang trang giỏ hàng
                }
            });

        } catch (err) {
            console.error("Lỗi thêm giỏ hàng:", err);
            Swal.fire('Thất bại', 'Không thể thêm sản phẩm vào giỏ.Vui lòng thử lại!', 'error');
        }
    };

    // Gán lại số lượng khi biến maxStock thay đổi (chọn màu/size khác)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setQuantity((prevQuantity) => {
            if (maxStock === 0) return 0;
            if (prevQuantity > maxStock && maxStock > 0) return maxStock;
            if (prevQuantity === 0 && maxStock > 0) return 1;
            return prevQuantity;
        });
    }, [maxStock]);

    if (loading || !product) return <div className="v-loading">VION ERA ĐANG TẢI...</div>;

    const displayPrice = currentVariant ? (currentVariant.Price || currentVariant.price) : (product.variants?.[0]?.Price || 0);
    const averageRating = product.average_rating || 0;
    const reviews = product.reviews || [];

    return (
        <div className="product-detail-page">
            {/* LIGHTBOX PHÓNG TO ẢNH */}
            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
                    <img src={`${API_BASE_URL}/storage/${selectedImage}`} alt="Zoom" className="lightbox-img" />
                </div>
            )}

            <div className="container">
                <nav className="v-breadcrumb">
                    <Link to="/">Trang chủ</Link> <ChevronRight size={14} />
                    <span>{product.category?.Name || product.category?.name}</span> <ChevronRight size={14} />
                    <span className="active">{product.Name || product.name}</span>
                </nav>

                <div className="detail-grid">
                    <div className="gallery-section">
                        <div className="main-image-wrap" onClick={() => setIsLightboxOpen(true)}>
                            <img src={`${API_BASE_URL}/storage/${selectedImage}`} alt="main" />
                        </div>
                        <div className="thumb-list">
                            <div className={`thumb-item ${selectedImage === (product.MainImage || product.main_image) ? 'active' : ''}`}
                                onClick={() => setSelectedImage(product.MainImage || product.main_image)}>
                                <img src={`${API_BASE_URL}/storage/${product.MainImage || product.main_image}`} alt="thumb" />
                            </div>
                            {product.images?.map((img, idx) => (
                                <div key={idx} className={`thumb-item ${selectedImage === img.Url ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(img.Url)}>
                                    <img src={`${API_BASE_URL}/storage/${img.Url}`} alt="thumb" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="info-section">
                        <h1 className="p-title">{product.Name || product.name}</h1>

                        <div className="p-meta">
                            <div className="p-rating">
                                <span className="rating-num">{averageRating}</span>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < averageRating ? "#EE4D2D" : "none"} color={i < averageRating ? "#EE4D2D" : "#ccc"} />
                                ))}
                                <span className="rev-count">| {reviews.length} Đánh giá</span>
                            </div>
                            <div className="p-sold">Đã bán {product.sold_count || 0}</div>
                        </div>

                        <div className="p-price-big">
                            {Number(displayPrice).toLocaleString()}đ
                        </div>

                        <div className="p-divider"></div>

                        <div className="option-group">
                            <label>Kích thước: <span>{selectedSize}</span></label>
                            <div className="btn-options">
                                {[...new Set(product.variants?.map(v => v.Size || v.size))].filter(Boolean).map(size => (
                                    <button key={size} className={selectedSize === size ? 'active' : ''}
                                        onClick={() => setSelectedSize(size)}>{size}</button>
                                ))}
                            </div>
                        </div>

                        <div className="option-group">
                            <label>Màu sắc: <span>{selectedColor}</span></label>
                            <div className="btn-options">
                                {[...new Set(product.variants?.map(v => v.Color || v.color))].filter(Boolean).map(color => (
                                    <button key={color} className={selectedColor === color ? 'active' : ''}
                                        onClick={() => setSelectedColor(color)}>{color}</button>
                                ))}
                            </div>
                        </div>

                        <div className="quantity-stock">
                            <div className="quantity-box">
                                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>-</button>
                                <input type="number" value={quantity} readOnly />
                                <button onClick={() => quantity < maxStock && setQuantity(quantity + 1)} disabled={quantity >= maxStock}>+</button>
                            </div>
                            <span className="stock-label">
                                {maxStock > 0 ? `Kho: ${maxStock} sản phẩm` : 'Hết hàng'}
                            </span>
                        </div>

                        <div className="action-buttons">
                            {/* GẮN SỰ KIỆN CLICK Ở ĐÂY */}
                            <button className="btn-add-cart" disabled={maxStock === 0} onClick={handleAddToCart}>
                                <ShoppingCart size={20} /> THÊM VÀO GIỎ
                            </button>
                            <button className="btn-buy-now" disabled={maxStock === 0} onClick={handleAddToCart}>MUA NGAY</button>
                        </div>
                    </div>
                </div>

                {/* Giữ nguyên phần Review và Sản phẩm tương tự bên dưới... */}
                <div className="bottom-content-grid">
                    {/* ... code cũ của bạn ... */}
                    <div className="description-left">
                        <h3 className="section-subtitle">Mô tả sản phẩm</h3>
                        <div className="desc-content">
                            {product.Description || product.description || "Đang cập nhật nội dung..."}
                        </div>
                    </div>

                    <div className="reviews-right">
                        <h3 className="section-subtitle">Đánh giá sản phẩm</h3>
                        <div className="review-summary-box">
                            <div className="rating-overview">
                                <span className="score-big">{averageRating}</span><span className="score-max"> trên 5</span>
                                <div className="stars-row">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < averageRating ? "#EE4D2D" : "none"} color="#EE4D2D" />)}
                                </div>
                            </div>
                            <div className="rating-filters">
                                <button className="filter-btn active">Tất Cả ({reviews.length})</button>
                                <button className="filter-btn">5 Sao (0)</button>
                                <button className="filter-btn">Có Bình Luận (0)</button>
                            </div>
                        </div>

                        {reviews.length > 0 ? (
                            reviews.map((rev, i) => (
                                <div key={i} className="rev-item">
                                    <div className="rev-user"><b>{rev.user_name}</b> <PackageCheck size={14} color="#27ae60" /></div>
                                    <p>{rev.comment}</p>
                                </div>
                            ))
                        ) : (
                            <div className="no-rev-box">
                                <MessageSquare size={32} color="#ccc" />
                                <p>Chưa có đánh giá nào.</p>
                                <small>Chỉ khách hàng đã mua mới có thể đánh giá.</small>
                            </div>
                        )}
                    </div>
                </div>

                <div className="related-section">
                    <h3 className="section-subtitle">Sản phẩm tương tự</h3>
                    <div className="related-grid">
                        {relatedProducts.map(p => (
                            <Link key={p.id} to={`/product/${p.id}`} className="rel-card">
                                <div className="rel-img">
                                    <img src={`${API_BASE_URL}/storage/${p.MainImage || p.main_image}`} alt="" />
                                </div>
                                <p className="rel-name">{p.Name || p.name}</p>
                                <p className="rel-price">{Number(p.variants?.[0]?.Price || 0).toLocaleString()}đ</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;