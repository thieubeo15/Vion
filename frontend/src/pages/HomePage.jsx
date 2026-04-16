import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/categories`),
                    axios.get(`${API_BASE_URL}/api/products`)
                ]);
                setCategories(catRes.data.data || []);
                setProducts(prodRes.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Lỗi kết nối API:", error);
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    if (loading) return <div className="vion-loading">VION ERA ĐANG CHUẨN BỊ...</div>;

    return (
        <div className="home-page">
            {/* 1. HERO BANNER */}
            <div className="hero-section">
                <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920" className="hero-bg" alt="Banner" />
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">VION. ERA 2026</h1>
                    <Link to="/products" className="btn-shop-now">Khám phá ngay</Link>
                </div>
            </div>

            {/* 2. DANH MỤC GRID */}
            <section className="home-categories">
                <div className="container">
                    <div className="category-header">DANH MỤC SẢN PHẨM</div>
                    <div className="category-text-grid">
                        {categories.map((cat) => (
                            <div key={cat.id} className="category-group">
                                <Link to={`/category/${cat.id}`} className="cat-parent-label">
                                    {cat.name}
                                </Link>
                                {cat.children && cat.children.length > 0 && (
                                    <div className="cat-child-list">
                                        {cat.children.map((child) => (
                                            <Link key={child.id} to={`/category/${child.id}`} className="cat-child-label">
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. SẢN PHẨM MỚI */}
            <section className="new-arrivals">
                <div className="container">
                    <div className="section-title-wrapper">
                        <h2 className="section-title">SẢN PHẨM MỚI</h2>
                        <Link to="/products" className="view-all-link">XEM TẤT CẢ</Link>
                    </div>
                    
                    <div className="product-grid">
                        {products.length > 0 ? (
                            products.slice(0, 8).map((prod) => (
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
                                        {/* THÊM DÒNG ĐÃ BÁN Ở ĐÂY */}
                                        <p className="p-sold-count">
                                            Đã bán {prod.sold_count || 0}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="empty-msg">VION ERA đang cập nhật sản phẩm mới...</div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;