import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]); 
    const [loading, setLoading] = useState(true);
    
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

    const handleSeeMore = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('vion_token');
        if (token) navigate('/products');
        else navigate('/login');
    };

    const ProductCard = ({ prod }) => (
        <Link key={prod.id} to={`/product/${prod.id}`} className="product-card">
            <div className="product-img-wrap">
                <img 
                    src={prod.main_image ? `${API_BASE_URL}/storage/${prod.main_image}` : 'https://via.placeholder.com/300x400'} 
                    alt={prod.name} 
                />
                <div className="quick-view">XEM CHI TIẾT</div>
            </div>
            <div className="product-info">
                <p className="p-name">{prod.name}</p>
                <p className="p-price">
                    {prod.variants && prod.variants.length > 0 
                        ? Number(prod.variants[0].Price).toLocaleString() 
                        : "Liên hệ"}đ
                </p>
                <p className="p-sold-count">Đã bán {prod.sold_count || 0}</p>
            </div>
        </Link>
    );

    if (loading) return <div className="vion-loading">VION ERA ĐANG CHUẨN BỊ...</div>;

    const currentBanner = banners.length > 0 ? banners[0] : null;

    return (
        <div className="home-page">
            {/* 1. HERO BANNER - GIỮ NGUYÊN FORM CŨ */}
            <div className="hero-section">
                {currentBanner ? (
                    <>
                        <img src={`${API_BASE_URL}/storage/${currentBanner.image_path}`} className="hero-bg" alt="Banner Admin" />
                        <div className="hero-overlay"></div>
                        <div className="hero-content">
                            <h1 className="hero-title">{currentBanner.title || "VION. ERA 2026"}</h1>
                            <p className="hero-subtitle" style={{color: '#fff', marginBottom: '20px'}}>{currentBanner.subtitle}</p>
                            <Link to="/products" className="btn-shop-now">Khám phá ngay</Link>
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

            {/* 2. DANH MỤC GRID - GIỮ NGUYÊN FORM CỦA BRO */}
            <section className="home-categories">
                <div className="container">
                    <div className="category-header">DANH MỤC SẢN PHẨM</div>
                    <div className="category-text-grid">
                        {categories.map((cat) => (
                            <div key={cat.id} className="category-group">
                                <Link to={`/category/${cat.id}`} className="cat-parent-label">{cat.name}</Link>
                                {cat.children && cat.children.length > 0 && (
                                    <div className="cat-child-list">
                                        {cat.children.map((child) => (
                                            <Link key={child.id} to={`/category/${child.id}`} className="cat-child-label">{child.name}</Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. SẢN PHẨM THEO DANH MỤC */}
            <section className="category-featured-products container mt-5">
                {categories.slice(0, 3).map((cat) => {
                    const catProducts = products.filter(p => p.category_id === cat.id || p.CategoryID === cat.id).slice(0, 4);
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
                        {products.slice(0, 8).map((prod) => <ProductCard key={prod.id} prod={prod} />)}
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