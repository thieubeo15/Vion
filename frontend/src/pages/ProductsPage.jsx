import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import './ProductsPage.css';

const ProductsPage = () => {
    const { categoryId } = useParams();
    const location = useLocation(); 
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentCategoryName, setCurrentCategoryName] = useState('Tất cả sản phẩm');
    const [sort, setSort] = useState('latest');
    const API_BASE_URL = 'http://127.0.0.1:8000';

    
    const [selectedPriceRange, setSelectedPriceRange] = useState('all');
    const [customMinPrice, setCustomMinPrice] = useState('');
    const [customMaxPrice, setCustomMaxPrice] = useState('');
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const [availableMaterials, setAvailableMaterials] = useState([]);

    
    const [tempCategoryId, setTempCategoryId] = useState(categoryId || '');
    const [tempPriceRange, setTempPriceRange] = useState('all');
    const [tempMinInput, setTempMinInput] = useState('');
    const [tempMaxInput, setTempMaxInput] = useState('');
    const [tempSizes, setTempSizes] = useState([]);
    const [tempColors, setTempColors] = useState([]);
    const [tempMaterials, setTempMaterials] = useState([]);

    
    useEffect(() => {
        setTempCategoryId(categoryId || '');
    }, [categoryId]);



    const handleApplyFilters = (e) => {
        if (e) e.preventDefault();
        
        
        setSelectedPriceRange(tempPriceRange);
        setCustomMinPrice(tempMinInput);
        setCustomMaxPrice(tempMaxInput);
        setSelectedSizes(tempSizes);
        setSelectedColors(tempColors);
        setSelectedMaterials(tempMaterials);

        
        if (tempCategoryId) {
            navigate(`/category/${tempCategoryId}${location.search}`);
        } else {
            navigate(`/products${location.search}`);
        }
    };

    const handleResetFilters = () => {
        
        setSelectedPriceRange('all');
        setCustomMinPrice('');
        setCustomMaxPrice('');
        setSelectedSizes([]);
        setSelectedColors([]);
        setSelectedMaterials([]);

        
        setTempCategoryId('');
        setTempPriceRange('all');
        setTempMinInput('');
        setTempMaxInput('');
        setTempSizes([]);
        setTempColors([]);
        setTempMaterials([]);

        navigate('/products');
    };

    useEffect(() => {
        const fetchData = async () => {
            const isFirstLoad = products.length === 0;
            if (isFirstLoad) setLoading(true);
            try {
                
                const queryParams = new URLSearchParams(location.search);
                const searchKeyword = queryParams.get('search');

                
                const catRes = await axios.get(`${API_BASE_URL}/api/categories`);
                const allCats = catRes.data.data || [];
                setCategories(allCats);

                
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

                
                const prodRes = await axios.get(`${API_BASE_URL}/api/products`);
                let rawProducts = prodRes.data.data || [];

                let filteredProducts = [...rawProducts];

                
                if (categoryId) {
                    let validCatIds = [Number(categoryId)];
                    const selectedParentCat = allCats.find(c => c.id == categoryId);
                    if (selectedParentCat && selectedParentCat.children) {
                        const childIds = selectedParentCat.children.map(child => Number(child.id));
                        validCatIds = [...validCatIds, ...childIds];
                    }
                    filteredProducts = filteredProducts.filter(p => 
                        validCatIds.includes(Number(p.category_id || p.CategoryID))
                    );
                }

                
                if (searchKeyword) {
                    filteredProducts = filteredProducts.filter(p => 
                        (p.name || p.Name || "").toLowerCase().includes(searchKeyword.toLowerCase())
                    );
                }

                
                const uniqueColors = [...new Set(filteredProducts.flatMap(p => p.variants?.map(v => v.Color || v.color) || []))].filter(Boolean);
                const uniqueMaterials = [...new Set(filteredProducts.map(p => p.material || p.Material).filter(Boolean))];
                setAvailableColors(uniqueColors);
                setAvailableMaterials(uniqueMaterials);

                
                if (selectedPriceRange !== 'all' && selectedPriceRange !== 'custom') {
                    filteredProducts = filteredProducts.filter(p => {
                        if (!p.variants || p.variants.length === 0) return false;
                        const v = p.variants[0];
                        const orig = Number(v.Price || v.price || 0);
                        const disc = v.DiscountPrice !== undefined ? v.DiscountPrice : v.discount_price;
                        const price = (disc !== null && disc !== undefined && Number(disc) < orig) ? Number(disc) : orig;

                        if (selectedPriceRange === 'under100') return price < 100000;
                        if (selectedPriceRange === '100to200') return price >= 100000 && price <= 200000;
                        if (selectedPriceRange === '200to500') return price >= 200000 && price <= 500000;
                        if (selectedPriceRange === 'over500') return price > 500000;
                        return true;
                    });
                }

                
                if (selectedPriceRange === 'custom') {
                    if (customMinPrice !== '') {
                        filteredProducts = filteredProducts.filter(p => {
                            if (!p.variants || p.variants.length === 0) return false;
                            const v = p.variants[0];
                            const orig = Number(v.Price || v.price || 0);
                            const disc = v.DiscountPrice !== undefined ? v.DiscountPrice : v.discount_price;
                            const price = (disc !== null && disc !== undefined && Number(disc) < orig) ? Number(disc) : orig;
                            return price >= Number(customMinPrice);
                        });
                    }
                    if (customMaxPrice !== '') {
                        filteredProducts = filteredProducts.filter(p => {
                            if (!p.variants || p.variants.length === 0) return false;
                            const v = p.variants[0];
                            const orig = Number(v.Price || v.price || 0);
                            const disc = v.DiscountPrice !== undefined ? v.DiscountPrice : v.discount_price;
                            const price = (disc !== null && disc !== undefined && Number(disc) < orig) ? Number(disc) : orig;
                            return price <= Number(customMaxPrice);
                        });
                    }
                }

                
                if (selectedSizes.length > 0) {
                    filteredProducts = filteredProducts.filter(p => {
                        const productSizes = p.variants?.map(v => (v.Size || v.size || '').toUpperCase()) || [];
                        return selectedSizes.some(size => productSizes.includes(size.toUpperCase()));
                    });
                }

                
                if (selectedColors.length > 0) {
                    filteredProducts = filteredProducts.filter(p => {
                        const productColors = p.variants?.map(v => (v.Color || v.color || '').toLowerCase()) || [];
                        return selectedColors.some(color => productColors.includes(color.toLowerCase()));
                    });
                }

                
                if (selectedMaterials.length > 0) {
                    filteredProducts = filteredProducts.filter(p => {
                        const mat = (p.material || p.Material || '').toLowerCase();
                        return selectedMaterials.some(m => mat.includes(m.toLowerCase()) || m.toLowerCase().includes(mat));
                    });
                }

                
                filteredProducts.sort((a, b) => {
                    const getSellingPrice = (p) => {
                        if (!p.variants || p.variants.length === 0) return 0;
                        const v = p.variants[0];
                        const orig = Number(v.Price || v.price || 0);
                        const disc = v.DiscountPrice !== undefined ? v.DiscountPrice : v.discount_price;
                        return (disc !== null && disc !== undefined && Number(disc) < orig) ? Number(disc) : orig;
                    };
                    const priceA = getSellingPrice(a);
                    const priceB = getSellingPrice(b);

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
    }, [categoryId, sort, location.search, selectedPriceRange, customMinPrice, customMaxPrice, selectedSizes, selectedColors, selectedMaterials]);

    if (loading && products.length === 0) return <div className="vion-loading">ĐANG TẢI...</div>;

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
                        
                        <div className="filter-section">
                            <h3 className="filter-title">DANH MỤC</h3>
                            <ul className="category-list">
                                <li>
                                    <button 
                                        type="button" 
                                        className={`category-filter-btn ${!categoryId ? 'active' : ''}`}
                                        onClick={() => { setTempCategoryId(''); navigate('/products'); }}
                                    >
                                        Tất cả sản phẩm
                                    </button>
                                </li>
                                {categories.map(cat => (
                                    <li key={cat.id} className="cat-parent-item">
                                        <button 
                                            type="button" 
                                            className={`category-filter-btn ${categoryId == cat.id ? 'active' : ''}`}
                                            onClick={() => { setTempCategoryId(cat.id); navigate(`/category/${cat.id}`); }}
                                        >
                                            {cat.name}
                                        </button>
                                        {cat.children && cat.children.length > 0 && (
                                            <ul className="sub-category-list">
                                                {cat.children.map(child => (
                                                    <li key={child.id}>
                                                        <button 
                                                            type="button" 
                                                            className={`category-filter-btn ${categoryId == child.id ? 'active' : ''}`}
                                                            onClick={() => { setTempCategoryId(child.id); navigate(`/category/${child.id}`); }}
                                                        >
                                                            {child.name}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        
                        <div className="filter-section mt-4">
                            <h3 className="filter-title">KHOẢNG GIÁ</h3>
                            <div className="price-range-presets">
                                <label className="price-preset-label">
                                    <input 
                                        type="radio" 
                                        name="price_range" 
                                        checked={tempPriceRange === 'all'} 
                                        onChange={() => setTempPriceRange('all')} 
                                    />
                                    <span>Tất cả giá</span>
                                </label>
                                <label className="price-preset-label">
                                    <input 
                                        type="radio" 
                                        name="price_range" 
                                        checked={tempPriceRange === 'under100'} 
                                        onChange={() => setTempPriceRange('under100')} 
                                    />
                                    <span>Dưới 100.000đ</span>
                                </label>
                                <label className="price-preset-label">
                                    <input 
                                        type="radio" 
                                        name="price_range" 
                                        checked={tempPriceRange === '100to200'} 
                                        onChange={() => setTempPriceRange('100to200')} 
                                    />
                                    <span>100.000đ - 200.000đ</span>
                                </label>
                                <label className="price-preset-label">
                                    <input 
                                        type="radio" 
                                        name="price_range" 
                                        checked={tempPriceRange === '200to500'} 
                                        onChange={() => setTempPriceRange('200to500')} 
                                    />
                                    <span>200.000đ - 500.000đ</span>
                                </label>
                                <label className="price-preset-label">
                                    <input 
                                        type="radio" 
                                        name="price_range" 
                                        checked={tempPriceRange === 'over500'} 
                                        onChange={() => setTempPriceRange('over500')} 
                                    />
                                    <span>Trên 500.000đ</span>
                                </label>
                            </div>

                            
                            <div className="custom-price-slider mt-3">
                                <div className="d-flex justify-content-between font-size-xs mb-1 text-muted" style={{ fontSize: '12px', color: '#888' }}>
                                    <span>100.000đ</span>
                                    <span>1.000.000đ</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="100000" 
                                    max="1000000" 
                                    step="10000"
                                    value={tempPriceRange === 'custom' ? (tempMaxInput || 1000000) : 1000000}
                                    onChange={e => {
                                        setTempPriceRange('custom');
                                        setTempMinInput('100000');
                                        setTempMaxInput(e.target.value);
                                    }}
                                    className="price-range-slider w-100"
                                />
                                <div className="text-center mt-2 font-weight-bold" style={{ fontSize: '13px', color: '#EE4D2D', fontWeight: '700' }}>
                                    {tempPriceRange === 'custom' ? `Khoảng giá: 100.000đ - ${Number(tempMaxInput || 1000000).toLocaleString()}đ` : 'Kéo để chọn khoảng giá'}
                                </div>
                            </div>
                        </div>

                        
                        <div className="filter-section mt-4">
                            <h3 className="filter-title">KÍCH CỠ</h3>
                            <div className="size-checkbox-group">
                                {['S', 'M', 'L', 'XL','XXL'].map(size => (
                                    <label key={size} className="size-checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            checked={tempSizes.includes(size)}
                                            onChange={() => {
                                                setTempSizes(prev => 
                                                    prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                                                );
                                            }}
                                        />
                                        <span className="size-box">{size}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        
                        {availableColors.length > 0 && (
                            <div className="filter-section mt-4">
                                <h3 className="filter-title">MÀU SẮC</h3>
                                <div className="color-filter-group">
                                    {availableColors.map(color => (
                                        <label key={color} className="color-filter-label">
                                            <input 
                                                type="checkbox" 
                                                checked={tempColors.includes(color)}
                                                onChange={() => {
                                                    setTempColors(prev => 
                                                        prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                                                    );
                                                }}
                                            />
                                            <span className="color-filter-box">{color}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        
                        {availableMaterials.length > 0 && (
                            <div className="filter-section mt-4">
                                <h3 className="filter-title">CHẤT LIỆU</h3>
                                <div className="material-filter-group">
                                    {availableMaterials.map(mat => (
                                        <label key={mat} className="material-filter-label">
                                            <input 
                                                type="checkbox" 
                                                checked={tempMaterials.includes(mat)}
                                                onChange={() => {
                                                    setTempMaterials(prev => 
                                                        prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
                                                    );
                                                }}
                                            />
                                            <span className="material-filter-box">{mat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        
                        <button className="btn-apply-filters mt-4 w-100" onClick={handleApplyFilters}>
                            ÁP DỤNG BỘ LỌC
                        </button>

                        
                        <button className="btn-reset-filters mt-2 w-100" onClick={handleResetFilters}>
                            XÓA BỘ LỌC
                        </button>
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
                                products.map((prod) => {
                                    const v = prod.variants && prod.variants.length > 0 ? prod.variants[0] : null;
                                    const price = v ? (v.price !== undefined ? v.price : v.Price) : null;
                                    const discountPrice = v ? (v.discount_price !== undefined ? v.discount_price : v.DiscountPrice) : null;
                                    const discountPercent = v ? (v.discount_percent !== undefined ? v.discount_percent : v.DiscountPercent) : null;
                                    const hasDiscount = v && discountPrice !== null && discountPrice !== undefined && Number(discountPrice) < Number(price);

                                    return (
                                        <Link key={prod.id} to={`/product/${prod.id}`} className="product-card">
                                            <div className="product-img-wrap">
                                                <img src={prod.main_image?.startsWith('http') ? prod.main_image : `${API_BASE_URL}/storage/${prod.main_image}`} alt={prod.name} />
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
                                })
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