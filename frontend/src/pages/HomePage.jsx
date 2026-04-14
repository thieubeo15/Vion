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

                // Log ra để kiểm tra xem dữ liệu có về không (F12 Console)
                console.log("Dữ liệu danh mục:", catRes.data.data);

                // Quan trọng: Phải lấy .data.data
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

    if (loading) return <div className="vion-loading">Đang chuẩn bị hàng...</div>;

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

            {/* 2. DANH MỤC GRID (STYLE SHOPEE) */}
            <section className="home-categories">
                <div className="container">
                    <div className="category-header">DANH MỤC</div>
                    
                    <div className="category-grid">
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <div key={cat.id} className="category-item-wrapper">
                                    <Link to={`/category/${cat.id}`} className="parent-item">
                                        <div className="icon-box">
                                            {/* Chỗ này dùng placeholder nếu bro chưa thêm trường Image vào Resource */}
                                            <img 
                                                src={cat.Image ? `${API_BASE_URL}/storage/${cat.Image}` : 'https://via.placeholder.com/100?text=Vion'} 
                                                alt={cat.name} 
                                            />
                                        </div>
                                        <span className="cat-name">{cat.name}</span>
                                    </Link>

                                    {/* HIỆN DANH MỤC CON KHI HOVER */}
                                    {cat.children && cat.children.length > 0 && (
                                        <div className="child-popover">
                                            <div className="popover-title">Gợi ý cho bạn</div>
                                            <div className="child-links">
                                                {cat.children.map((child) => (
                                                    <Link key={child.id} to={`/category/${child.id}`} className="child-link">
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div style={{padding: '20px', textAlign: 'center', width: '100%'}}>
                                Không tìm thấy danh mục nào. Kiểm tra Seeder nhé!
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;