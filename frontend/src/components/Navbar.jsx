import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Search, Camera, ShoppingBag, User, LogOut } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2'; // 🚀 1. Import thư viện Swal
import './Navbar.css';

const Navbar = () => {
    const [cartCount, setCartCount] = useState(0);
    const [allProducts, setAllProducts] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    const navigate = useNavigate();
    const API_BASE_URL = 'http://127.0.0.1:8000';

    let user = null;
    try {
        const userJson = localStorage.getItem('vion_user');
        if (userJson && userJson !== 'undefined') {
            user = JSON.parse(userJson);
        }
    } catch { user = null; }

    const loadInitialData = async () => {
        try {
            const prodRes = await axios.get(`${API_BASE_URL}/api/products`);
            setAllProducts(prodRes.data.data || []);

            const token = localStorage.getItem('vion_token');
            if (user && token) {
                const res = await axios.get(`${API_BASE_URL}/api/my-cart`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const items = res.data.data?.items || [];
                const count = items.reduce((sum, item) => sum + item.Quantity, 0);
                setCartCount(count);
            }
        } catch (err) { console.error("Lỗi tải dữ liệu Navbar", err); }
    };

    useEffect(() => {
        loadInitialData();
        const handleCartChange = () => loadInitialData();
        window.addEventListener('cartUpdated', handleCartChange);
        return () => window.removeEventListener('cartUpdated', handleCartChange);
    }, []);

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        if (searchTerm.trim() !== '') {
            navigate(`/products?search=${searchTerm}`);
            setSearchTerm(''); 
            setSearchResults([]); 
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim() === '') {
            setSearchResults([]);
            return;
        }

        const filtered = allProducts.filter(prod => 
            (prod.name || prod.Name || "").toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);
        setSearchResults(filtered);
    };

    // 🚀 2. Sửa lại hàm Đăng xuất dùng SweetAlert2
    const handleLogout = () => {
        Swal.fire({
            title: 'Đăng xuất?',
            text: "Bạn có chắc chắn muốn đăng xuất khỏi Vion không?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#111', // Màu đen cho ngầu
            cancelButtonColor: '#d33', // Đỏ cho nút Hủy
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                // Xóa Token và Dữ liệu user
                localStorage.removeItem('vion_token');
                localStorage.removeItem('vion_user');
                
               
                    window.location.href = '/login'; 
            }
        });
    };

    return (
        <header className="vion-header">
            <div className="header-main">
                <Link to="/" className="header-logo">VION.</Link>

                <div className="search-container">
                    <form className="search-input-wrap" onSubmit={handleSearchSubmit}>
                        <Search 
                            size={18} 
                            color="#999" 
                            style={{ cursor: 'pointer' }} 
                            onClick={handleSearchSubmit} 
                        />
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Tìm kiếm sản phẩm..." 
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <div className="search-tools">
                            <Camera size={20} className="camera-icon" title="Tìm kiếm bằng hình ảnh" />
                        </div>

                        {searchTerm.trim() !== '' && (
                            <div className="nav-search-dropdown">
                                {searchResults.length > 0 ? (
                                    searchResults.map(prod => (
                                        <Link 
                                            key={prod.id} 
                                            to={`/product/${prod.id}`} 
                                            className="nav-search-item"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            <img src={`${API_BASE_URL}/storage/${prod.main_image}`} alt="" />
                                            <div className="nav-search-info">
                                                <p className="nav-search-name">{prod.name}</p>
                                                <p className="nav-search-price">
                                                    {prod.variants?.[0] ? Number(prod.variants[0].Price).toLocaleString() : '0'}đ
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="nav-search-empty">Không tìm thấy sản phẩm nào</div>
                                )}
                            </div>
                        )}
                    </form>
                </div>

                <div className="header-actions">
                    <Link to="/cart" className="action-icon">
                        <ShoppingBag size={24} strokeWidth={1.5} />
                        <span className="cart-badge">{cartCount}</span>
                    </Link>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <Link to="/profile" className="action-icon" title="Trang cá nhân">
                                <User size={24} strokeWidth={1.5} />
                            </Link>
                            <div className="action-icon" onClick={handleLogout} title="Đăng xuất" style={{ cursor: 'pointer' }}>
                                <LogOut size={20} strokeWidth={1.5} />
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="auth-text">Đăng nhập</Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;