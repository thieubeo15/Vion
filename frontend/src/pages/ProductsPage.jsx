import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useLocation } from 'react-router-dom'; // 🚀 Thêm useLocation
import './ProductsPage.css';

const ProductsPage = () => {
    const { categoryId } = useParams();
    const location = useLocation(); // 🚀 Khởi tạo location để lấy query string
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
                // 1. Lấy keyword từ URL (ví dụ: ?search=ao+thun)
                const queryParams = new URLSearchParams(location.search);
                const searchKeyword = queryParams.get('search');

                const catRes = await axios.get(`${API_BASE_URL}/api/categories`);
                const allCats = catRes.data.data || [];
                setCategories(allCats);

                // 2. Xác định tiêu đề hiển thị
                if (searchKeyword) {
                    setCurrentCategoryName(`Kết quả tìm kiếm cho: "${searchKeyword}"`);
                } else if (categoryId) {
                    let foundName = 'Danh mục';
                    for (const cat of allCats) {
                        if (cat.id == categoryId) { foundName = cat.name; break; }
                        if (cat.children) {
                            const child = cat.children.find(c => c.id == categoryId);
                            if (child) { foundName = child.name; break; }
                        }
                    }
                    setCurrentCategoryName(foundName);
                } else {
                    setCurrentCategoryName('Tất cả sản phẩm');
                }

                // 3. Lấy sản phẩm
                let prodUrl = `${API_BASE_URL}/api/products`;
                if (categoryId) prodUrl += `?category_id=${categoryId}`;
                    
                const prodRes = await axios.get(prodUrl);
                let rawProducts = prodRes.data.data || [];

                // 🚀 4. LOGIC LỌC TÌM KIẾM + SẮP XẾP
                let filteredProducts = [...rawProducts];

                // Nếu có từ khóa search -> Lọc danh sách theo tên
                if (searchKeyword) {
                    filteredProducts = filteredProducts.filter(p => 
                        (p.name || p.Name || "").toLowerCase().includes(searchKeyword.toLowerCase())
                    );
                }

                // Sau đó mới Sắp xếp (Sort)
                filteredProducts.sort((a, b) => {
                    const priceA = a.variants?.[0] ? Number(a.variants[0].Price || a.variants[0].price) : 0;
                    const priceB = b.variants?.[0] ? Number(b.variants[0].Price || b.variants[0].price) : 0;

                    switch (sort) {
                        case 'price_asc': return priceA - priceB;
                        case 'price_desc': return priceB - priceA;
                        case 'best_selling': return (b.sold_count || 0) - (a.sold_count || 0);
                        default: return (b.id || 0) - (a.id || 0);
                    }
                });

                setProducts(filteredProducts);
            } catch (error) {
                console.error("Lỗi: ", error);
            }
            setLoading(false);
        };

        fetchData();
        window.scrollTo(0, 0);
    }, [categoryId, sort, location.search]); // 🚀 QUAN TRỌNG: Thêm location.search vào đây

    if (loading) return <div className="vion-loading">ĐANG TẢI...</div>;

    return (
        <div className="products-page">
            <div className="container">
                <div className="products-header">
                    <h1 className="page-title">{currentCategoryName}</h1>
                    <div className="breadcrumbs">
                        <Link to="/">Trang chủ</Link> <span>/</span> <span>Sản phẩm</span>
                    </div>
                </div>

                <div className="products-layout">
                    <aside className="products-sidebar">
                        <h3 className="filter-title">DANH MỤC</h3>
                        <ul className="category-list">
                            <li><Link to="/products" className={!categoryId ? 'active' : ''}>Tất cả sản phẩm</Link></li>
                            {categories.map(cat => (
                                <li key={cat.id} className="cat-parent-item">
                                    <Link to={`/category/${cat.id}`} className={categoryId == cat.id ? 'active' : ''}>{cat.name}</Link>
                                    {cat.children && cat.children.length > 0 && (
                                        <ul className="sub-category-list">
                                            {cat.children.map(child => (
                                                <li key={child.id}>
                                                    <Link to={`/category/${child.id}`} className={categoryId == child.id ? 'active' : ''}>
                                                        {child.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <main className="products-main">
                        <div className="filter-bar">
                            <div className="product-count">Có <b>{products.length}</b> sản phẩm</div>
                            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                                <option value="latest">Mới nhất</option>
                                <option value="price_asc">Giá tăng dần</option>
                                <option value="price_desc">Giá giảm dần</option>
                                <option value="best_selling">Bán chạy nhất</option>
                            </select>
                        </div>

                        <div className="product-grid-display">
                            {products.length > 0 ? (
                                products.map((prod) => (
                                    <Link key={prod.id} to={`/product/${prod.id}`} className="product-card">
                                        <div className="product-img-wrap">
                                            <img src={`${API_BASE_URL}/storage/${prod.main_image}`} alt={prod.name} />
                                            <div className="quick-view">XEM CHI TIẾT</div>
                                        </div>
                                        <div className="product-info">
                                            <p className="p-name">{prod.name}</p>
                                            <p className="p-price">
                                                {prod.variants?.[0] ? Number(prod.variants[0].Price).toLocaleString() : '0'}đ
                                            </p>
                                            <p className="p-sold-count">Đã bán {prod.sold_count || 0}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="no-products-msg">Không tìm thấy sản phẩm nào phù hợp.</div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;