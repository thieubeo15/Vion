import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const SearchResults = () => {
    const location = useLocation();
    // Lấy mảng sản phẩm AI tìm được và ảnh gốc mà khách đã up từ trạng thái điều hướng
    const { products, searchImage } = location.state || { products: [], searchImage: null };
    const API_BASE_URL = 'http://127.0.0.1:8000';

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textTransform: 'uppercase' }}>
                Kết quả tìm kiếm bằng AI
            </h2>

            {/* Hiển thị lại ảnh gốc mà khách đã tải lên để đối chiếu */}
            {searchImage && (
                <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <p style={{ color: '#666' }}>Ảnh bạn tìm kiếm:</p>
                    <img 
                        src={searchImage} 
                        alt="Search Target" 
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} 
                    />
                </div>
            )}

            {/* Danh sách sản phẩm tương đồng do mô hình CLIP tìm được */}
            {products.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
                    {products.map((prod) => (
                        <Link to={`/product/${prod.id || prod.ProductID}`} key={prod.id || prod.ProductID} style={{ textDecoration: 'none', color: '#111' }}>
                            <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                                <img 
                                    src={`${API_BASE_URL}/storage/${prod.main_image || prod.MainImage}`} 
                                    alt={prod.name || prod.Name} 
                                    style={{ width: '100%', height: '280px', objectFit: 'cover' }}
                                />
                                <div style={{ padding: '12px' }}>
                                    <h3 style={{ fontSize: '15px', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {prod.name || prod.Name}
                                    </h3>
                                   <p style={{ fontWeight: 'bold', color: '#111', margin: 0 }}>
    {(() => {
        const variant = prod.variants?.[0];
        if (!variant) return '0';
        // Tự động ăn theo cả price viết thường lẫn Price viết hoa
        const priceValue = variant.price ?? variant.Price ?? 0; 
        return Number(priceValue).toLocaleString();
    })()}đ
</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    Không tìm thấy sản phẩm nào có ngoại hình tương tự. Vui lòng thử lại bằng ảnh khác!
                </div>
            )}
        </div>
    );
};

export default SearchResults;