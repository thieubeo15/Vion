import React, { useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import './SearchResults.css';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const retryInputRef = useRef(null);
    const API_BASE_URL = 'http://127.0.0.1:8000';

    // Lấy dữ liệu từ navigation state
    const { products, similarities, searchImage } = location.state || { 
        products: [], 
        similarities: {},
        searchImage: null 
    };

    // Hàm lấy similarity score cho 1 sản phẩm
    const getSimilarity = (prod) => {
        const id = prod.id || prod.ProductID;
        if (similarities && similarities[id] !== undefined) {
            return similarities[id];
        }
        return null;
    };

    // Hàm xác định class CSS dựa trên mức similarity
    const getSimilarityClass = (score) => {
        if (score >= 82) return 'high';
        if (score >= 74) return 'medium';
        return 'low';
    };

    const getBarClass = (score) => {
        if (score >= 82) return '';
        if (score >= 74) return 'medium-bar';
        return 'low-bar';
    };

    // Hàm xác định rank class
    const getRankClass = (index) => {
        if (index === 0) return 'rank-1';
        if (index === 1) return 'rank-2';
        if (index === 2) return 'rank-3';
        return 'rank-other';
    };

    // Hàm tìm lại bằng ảnh khác
    const handleRetrySearch = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset input
        if (retryInputRef.current) {
            retryInputRef.current.value = '';
        }

        Swal.fire({
            title: 'VION AI ĐANG QUÉT ẢNH...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const bodyData = new FormData();
        bodyData.append('image', file);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/search/image`, bodyData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Swal.close();

            if (res.data.success) {
                navigate('/search-results?type=image', { 
                    state: { 
                        products: res.data.data, 
                        similarities: res.data.similarities || {},
                        searchImage: URL.createObjectURL(file) 
                    },
                    replace: true
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Không tìm thấy kết quả',
                    text: res.data.message || 'AI không thể phân tích hình ảnh này.',
                    confirmButtonColor: '#111'
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi quét ảnh',
                text: err.response?.data?.message || 'Không thể kết nối tới máy chủ AI.',
                confirmButtonColor: '#111'
            });
        }
    };

    // === TRẠNG THÁI: Mất data khi refresh ===
    if (!location.state) {
        return (
            <div className="search-results-page">
                <div className="sr-lost-state">
                    <div className="sr-empty-icon">🔄</div>
                    <h3>Phiên tìm kiếm đã hết hạn</h3>
                    <p>Dữ liệu tìm kiếm không còn tồn tại. Vui lòng thực hiện tìm kiếm mới từ trang chủ.</p>
                    <Link to="/" className="sr-back-btn">
                        <ArrowLeft size={16} />
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="search-results-page">
            <button className="sr-back-action-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Quay lại
            </button>

            {/* BREADCRUMB */}
            <nav className="sr-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <ChevronRight size={14} className="sr-breadcrumb-sep" />
                <span className="sr-breadcrumb-current">Tìm kiếm bằng hình ảnh</span>
            </nav>

            {/* HEADER */}
            <div className="sr-header">
                <div className="sr-header-left">
                    {searchImage && (
                        <img 
                            src={searchImage} 
                            alt="Ảnh tìm kiếm" 
                            className="sr-uploaded-image" 
                        />
                    )}
                    <div className="sr-header-info">
                        <h1>Kết quả tìm kiếm </h1>
                        <p className="sr-subtitle">
                            Tìm thấy {products.length} sản phẩm tương đồng
                        </p>
                    </div>
                </div>

                {/* NÚT TÌM LẠI */}
                <label className="sr-retry-btn">
                    <Camera size={16} />
                    Tìm bằng ảnh khác
                    <input 
                        ref={retryInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleRetrySearch} 
                        style={{ display: 'none' }} 
                    />
                </label>
            </div>

            {/* GRID SẢN PHẨM */}
            {products.length > 0 ? (
                <div className="sr-products-grid">
                    {products.map((prod, index) => {
                        const score = getSimilarity(prod);
                        const simClass = score !== null ? getSimilarityClass(score) : null;

                        return (
                            <Link 
                                to={`/product/${prod.id || prod.ProductID}`} 
                                key={prod.id || prod.ProductID} 
                                className="sr-product-card"
                            >
                                {/* RANK BADGE */}
                                <div className={`sr-rank-badge ${getRankClass(index)}`}>
                                    {index + 1}
                                </div>

                                {/* SIMILARITY BADGE */}
                                {score !== null && (
                                    <div className={`sr-similarity-badge ${simClass}`}>
                                        {score}% khớp
                                    </div>
                                )}

                                {/* ẢNH */}
                                <div className="sr-product-image-wrap" style={{ position: 'relative' }}>
                                    <img 
                                        src={(prod.main_image || prod.MainImage)?.startsWith('http') ? (prod.main_image || prod.MainImage) : `${API_BASE_URL}/storage/${prod.main_image || prod.MainImage}`}
                                        alt={prod.name || prod.Name}
                                        className="sr-product-image"
                                    />
                                    {(() => {
                                        const v = prod.variants && prod.variants.length > 0 ? prod.variants[0] : null;
                                        if (!v) return null;
                                        const price = v.price !== undefined ? v.price : v.Price;
                                        const discountPrice = v.discount_price !== undefined ? v.discount_price : v.DiscountPrice;
                                        const discountPercent = v.discount_percent !== undefined ? v.discount_percent : v.DiscountPercent;
                                        const hasDiscount = discountPrice !== null && discountPrice !== undefined && Number(discountPrice) < Number(price);
                                        if (hasDiscount) {
                                            return (
                                                <div className="discount-badge-overlay" style={{ top: '8px', left: '8px' }}>
                                                    -{discountPercent}%
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                {/* THÔNG TIN */}
                                <div className="sr-product-info">
                                    <h3 className="sr-product-name">
                                        {prod.name || prod.Name}
                                    </h3>
                                    {(() => {
                                        const v = prod.variants && prod.variants.length > 0 ? prod.variants[0] : null;
                                        if (!v) return <p className="sr-product-price">Liên hệ</p>;
                                        const price = v.price !== undefined ? v.price : v.Price;
                                        const discountPrice = v.discount_price !== undefined ? v.discount_price : v.DiscountPrice;
                                        const discountPercent = v.discount_percent !== undefined ? v.discount_percent : v.DiscountPercent;
                                        const hasDiscount = discountPrice !== null && discountPrice !== undefined && Number(discountPrice) < Number(price);

                                        if (hasDiscount) {
                                            return (
                                                <div className="p-price-container" style={{ justifyContent: 'center', margin: '0' }}>
                                                    <span className="p-price-current">
                                                        {Number(discountPrice).toLocaleString()}đ
                                                    </span>
                                                    <span className="p-price-original">
                                                        {Number(price).toLocaleString()}đ
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <p className="sr-product-price">
                                                {Number(price).toLocaleString()}đ
                                            </p>
                                        );
                                    })()}

                                    {/* THANH SIMILARITY */}
                                    {score !== null && (
                                        <div className="sr-similarity-bar-wrap">
                                            <div className="sr-similarity-bar">
                                                <div 
                                                    className={`sr-similarity-bar-fill ${getBarClass(score)}`}
                                                    style={{ width: `${score}%` }}
                                                />
                                            </div>
                                            <span className="sr-similarity-text">{score}%</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="sr-empty-state">
                    <div className="sr-empty-icon">🔍</div>
                    <h3>Không tìm thấy sản phẩm tương đồng</h3>
                    <p>AI không tìm thấy sản phẩm nào có ngoại hình giống với ảnh của bạn. Hãy thử lại bằng ảnh khác!</p>
                    <label className="sr-retry-btn">
                        <Camera size={16} />
                        Thử ảnh khác
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleRetrySearch} 
                            style={{ display: 'none' }} 
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default SearchResults;