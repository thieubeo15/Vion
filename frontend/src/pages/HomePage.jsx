import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderTimerRef = useRef(null);
    
    const navigate = useNavigate(); 
    const API_BASE_URL = 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [catRes, prodRes, bannerRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/categories`),
                    axios.get(`${API_BASE_URL}/api/products`),
                    axios.get(`${API_BASE_URL}/api/banners`) 
                ]);
                setCategories(catRes.data.data || []);
                setProducts(prodRes.data.data || []);
                setBanners(bannerRes.data || []); 
                setLoading(false);
            } catch (error) {
                console.error("Lỗi kết nối API:", error);
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    // Auto-slide effect
    useEffect(() => {
        if (banners.length <= 1) return;
        sliderTimerRef.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(sliderTimerRef.current);
    }, [banners.length]);

    const goToSlide = (idx) => {
        setCurrentSlide(idx);
        clearInterval(sliderTimerRef.current);
        sliderTimerRef.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % banners.length);
        }, 5000);
    };

    const goPrev = () => goToSlide((currentSlide - 1 + banners.length) % banners.length);
    const goNext = () => goToSlide((currentSlide + 1) % banners.length);

    const handleSeeMore = (e) => {
        e.preventDefault();
        navigate('/products');
    };

    const ProductCard = ({ prod }) => {
        const v = prod.variants && prod.variants.length > 0 ? prod.variants[0] : null;
        const price = v ? (v.price !== undefined ? v.price : v.Price) : null;
        const discountPrice = v ? (v.discount_price !== undefined ? v.discount_price : v.DiscountPrice) : null;
        const discountPercent = v ? (v.discount_percent !== undefined ? v.discount_percent : v.DiscountPercent) : null;
        const hasDiscount = v && discountPrice !== null && discountPrice !== undefined && Number(discountPrice) < Number(price);

        return (
            <Link key={prod.id} to={`/product/${prod.id}`} className="product-card">
                <div className="product-img-wrap">
                    <img 
                        src={prod.main_image ? (prod.main_image.startsWith('http') ? prod.main_image : `${API_BASE_URL}/storage/${prod.main_image}`) : 'https://via.placeholder.com/300x400'} 
                        alt={prod.name} 
                    />
                    {hasDiscount && (
                        <div className="discount-badge-overlay">
                            -{discountPercent}%
                        </div>
                    )}
                    <div className="quick-view">XEM CHI TIẾT</div>
                </div>
                <div className="product-info">
                    <p className="p-name">{prod.name}</p>
                    {v ? (
                        hasDiscount ? (
                            <div className="p-price-container">
                                <span className="p-price-current">
                                    {Number(discountPrice).toLocaleString()}đ
                                </span>
                                <span className="p-price-original">
                                    {Number(price).toLocaleString()}đ
                                </span>
                            </div>
                        ) : (
                            <p className="p-price" style={{ margin: '5px 0 0 0' }}>
                                {Number(price).toLocaleString()}đ
                            </p>
                        )
                    ) : (
                        <p className="p-price" style={{ color: '#999', margin: '5px 0 0 0' }}>
                            Liên hệ
                        </p>
                    )}
                    <p className="p-sold-count">Đã bán {prod.sold_count || 0}</p>
                </div>
            </Link>
        );
    };

    if (loading && products.length === 0) return <div className="vion-loading">VION ERA ĐANG CHUẨN BỊ...</div>;

    return (
        <div className="home-page">
            {/* 1. HERO BANNER SLIDER */}
            <div className="hero-section">
                {banners.length > 0 ? (
                    <>
                        {/* Slides */}
                        {banners.map((banner, idx) => (
                            <div
                                key={banner.id || idx}
                                className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
                            >
                                <img
                                    src={banner.image_path?.startsWith('http') ? banner.image_path : `${API_BASE_URL}/storage/${banner.image_path}`}
                                    className="hero-bg"
                                    alt={banner.title || `Banner ${idx + 1}`}
                                />
                                <div className="hero-overlay"></div>
                                <div className="hero-content">
                                    <h1 className="hero-title">{banner.title || 'VION. ERA 2026'}</h1>
                                    {banner.subtitle && (
                                        <p className="hero-subtitle">{banner.subtitle}</p>
                                    )}
                                    <Link to="/products" className="btn-shop-now">Khám phá ngay</Link>
                                </div>
                            </div>
                        ))}

                        {/* Arrow prev */}
                        <button className="hero-arrow hero-arrow-prev" onClick={goPrev} aria-label="Banner trước">
                            &#8249;
                        </button>

                        {/* Arrow next */}
                        <button className="hero-arrow hero-arrow-next" onClick={goNext} aria-label="Banner sau">
                            &#8250;
                        </button>

                        {/* Số thứ tự banner */}
                        <div className="hero-counter">
                            {currentSlide + 1} / {banners.length}
                        </div>

                        {/* Dot indicators */}
                        <div className="hero-dots">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`hero-dot ${idx === currentSlide ? 'active' : ''}`}
                                    onClick={() => goToSlide(idx)}
                                    aria-label={`Banner ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920" className="hero-bg" alt="Banner Default" />
                        <div className="hero-overlay"></div>
                        <div className="hero-content">
                            <h1 className="hero-title">VION. ERA 2026</h1>
                            <Link to="/products" className="btn-shop-now">Khám phá ngay</Link>
                        </div>
                    </>
                )}
            </div>



            {/* 🚀 3. SẢN PHẨM THEO DANH MỤC (ĐÃ FIX LỌC GỘP CHA + CON) */}
            <section className="category-featured-products container mt-5">
                {categories.slice(0, 3).map((cat) => {
                    // Tạo mảng chứa ID của Cha và tất cả các Con
                    let validCatIds = [Number(cat.id)];
                    if (cat.children && cat.children.length > 0) {
                        const childIds = cat.children.map(child => Number(child.id));
                        validCatIds = [...validCatIds, ...childIds];
                    }

                    // Lọc sản phẩm có category_id nằm trong mảng hợp lệ
                    const catProducts = products.filter(p => 
                        validCatIds.includes(Number(p.category_id || p.CategoryID))
                    ).slice(0, 12);

                    if (catProducts.length === 0) return null;

                    return (
                        <div key={cat.id} className="cat-product-row mb-5">
                            <div className="section-title-wrapper">
                                <h2 className="section-title">{cat.name.toUpperCase()}</h2>
                                <Link to={`/category/${cat.id}`} className="view-all-link">XEM TẤT CẢ</Link>
                            </div>
                            <div className="product-grid">
                                {catProducts.map(prod => <ProductCard key={prod.id} prod={prod} />)}
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* 4. GỢI Ý CHO BẠN */}
            <section className="suggested-section py-5" style={{backgroundColor: '#f8f9fa'}}>
                <div className="container">
                    <div className="section-title-wrapper justify-content-center">
                        <h2 className="section-title">GỢI Ý CHO BẠN</h2>
                    </div>
                    <div className="product-grid mt-4">
                        {products.slice(0, 12).map((prod) => <ProductCard key={prod.id} prod={prod} />)}
                    </div>
                    <div className="text-center mt-5">
                        <button onClick={handleSeeMore} className="btn-see-more">XEM THÊM SẢN PHẨM</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;