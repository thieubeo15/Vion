import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './ProductsPage.css';

const ProductsPage = () => {
    const { categoryId } = useParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentCategoryName, setCurrentCategoryName] = useState('Tất cả sản phẩm');
    const [sort, setSort] = useState('latest');
    const API_BASE_URL = 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Lấy danh mục
                const catRes = await axios.get(`${API_BASE_URL}/api/categories`);
                const allCats = catRes.data.data || [];
                setCategories(allCats);

                // Xác định tên danh mục hiện tại
                if (categoryId) {
                    let foundName = 'Danh mục';
                    for (const cat of allCats) {
                        if (cat.id == categoryId) {
                            foundName = cat.name;
                            break;
                        }
                        if (cat.children) {
                            const child = cat.children.find(c => c.id == categoryId);
                            if (child) {
                                foundName = child.name;
                                break;
                            }
                        }
                    }
                    setCurrentCategoryName(foundName);
                } else {
                    setCurrentCategoryName('Tất cả sản phẩm');
                }

                // Lấy sản phẩm (Lọc theo danh mục nếu có id)
                let prodUrl = `${API_BASE_URL}/api/products?sort=${sort}`;
                if (categoryId) {
                    prodUrl += `&category_id=${categoryId}`;
                }
                    
                const prodRes = await axios.get(prodUrl);
                setProducts(prodRes.data.data || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang sản phẩm: ", error);
            }
            setLoading(false);
        };
        fetchData();
        
        // Cuộn lên đầu trang
        window.scrollTo(0, 0);
    }, [categoryId, sort]);

    if (loading) return <div className="vion-loading">ĐANG TẢI SẢN PHẨM...</div>;

    return (
        <div className="products-page">
            <div className="container">
                <div className="products-header">
                    <h1 className="page-title">{currentCategoryName}</h1>
                    <div className="breadcrumbs">
                        <Link to="/">Trang chủ</Link> / <span>{currentCategoryName}</span>
                    </div>
                </div>

                <div className="products-layout">
                    {/* Thanh lọc (Sidebar) */}
                    <aside className="products-sidebar">
                        <h3 className="filter-title">DANH MỤC</h3>
                        <ul className="category-list">
                            <li>
                                <Link to="/products" className={!categoryId ? 'active' : ''}>
                                    Tất cả sản phẩm
                                </Link>
                            </li>
                            {categories.map(cat => (
                                <li key={cat.id} className="cat-parent-item">
                                    <Link to={`/category/${cat.id}`} className={categoryId == cat.id ? 'active' : ''}>
                                        {cat.name}
                                    </Link>
                                    {cat.children && cat.children.length > 0 && (
                                        <ul className="sub-category-list">
                                            {cat.children.map(child => (
                                                <li key={child.id}>
                                                    <Link to={`/category/${child.id}`} className={categoryId == child.id ? 'active' : ''}>
                                                        - {child.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Vùng hiển thị sản phẩm */}
                    <main className="products-main">
                        <div className="filter-bar">
                            <span className="filter-label">Sắp xếp theo:</span>
                            <select 
                                className="sort-select" 
                                value={sort} 
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="latest">Mới nhất</option>
                                <option value="price_asc">Giá: Thấp đến Cao</option>
                                <option value="price_desc">Giá: Cao đến Thấp</option>
                                <option value="best_selling">Bán chạy nhất</option>
                            </select>
                        </div>
                        <div className="product-grid-display">
                            {products.length > 0 ? (
                                products.map((prod) => (
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
                                ))
                            ) : (
                                <div className="no-products-msg">Chưa có sản phẩm nào trong danh mục này.</div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
