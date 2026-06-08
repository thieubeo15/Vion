import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Upload, ImageIcon, Plus, Link as LinkIcon, FileText, CheckCircle, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';
import './BannerManager.css';

const BannerManager = () => {
    const [banners, setBanners] = useState([]);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [link, setLink] = useState('');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const API_BASE = 'http://127.0.0.1:8000';
    const token = localStorage.getItem('vion_token');

    useEffect(() => { fetchBanners(); }, []);

    const fetchBanners = () => {
        axios.get(`${API_BASE}/api/banners`).then(res => setBanners(res.data));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleAddBanner = async (e) => {
        e.preventDefault();
        if (!file) return Swal.fire({
            title: 'Lỗi',
            text: 'Vui lòng chọn hoặc kéo thả một hình ảnh banner!',
            icon: 'error',
            confirmButtonColor: '#111'
        });

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('link', link);

        try {
            await axios.post(`${API_BASE}/api/banners`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` 
                }
            });
            Swal.fire({
                title: 'Thành công',
                text: 'Banner đã được thiết lập và xuất bản thành công! 🌟',
                icon: 'success',
                confirmButtonColor: '#111'
            });
            // Reset form states
            setFile(null);
            setPreviewUrl('');
            setTitle('');
            setSubtitle('');
            setLink('');
            fetchBanners();
        } catch (err) {
            console.error(err.response?.data);
            Swal.fire({
                title: 'Lỗi upload',
                text: 'Không thể tải lên banner. Vui lòng kiểm tra định dạng và kích thước ảnh (tối đa 5MB).',
                icon: 'error',
                confirmButtonColor: '#111'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const deleteBanner = (id) => {
        Swal.fire({
            title: 'Xóa banner này?',
            text: "Hành động này sẽ gỡ bỏ banner khỏi trang chủ ngay lập tức!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4d4f',
            cancelButtonColor: '#111',
            confirmButtonText: 'Đồng ý xóa',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_BASE}/api/banners/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    Swal.fire({
                        title: 'Đã xóa',
                        text: 'Banner đã được gỡ bỏ thành công.',
                        icon: 'success',
                        confirmButtonColor: '#111'
                    });
                    fetchBanners();
                } catch (err) {
                    Swal.fire('Lỗi', 'Không thể xóa banner này.', 'error');
                }
            }
        });
    };

    return (
        <div className="banner-admin-container">
            {/* Dashboard Welcome Header */}
            <div className="banner-dashboard-header shadow-sm">
                <div className="banner-header-info">
                    <span className="banner-badge"><Sparkles size={14}/> QUẢN TRỊ GIAO DIỆN</span>
                    <h2>Quản Lý Banner Trang Chủ</h2>
                    <p>Thiết lập các hình ảnh quảng cáo, sự kiện khuyến mãi nổi bật tại đầu trang chủ</p>
                </div>
                <div className="banner-stats">
                    <div className="stat-card">
                        <span className="stat-num">{banners.length}</span>
                        <span className="stat-label">Banner hoạt động</span>
                    </div>
                </div>
            </div>

            <div className="row g-4 mt-1">
                {/* LEFT COLUMN: Upload Form */}
                <div className="col-lg-4">
                    <div className="upload-sidebar-card shadow-sm">
                        <div className="sidebar-header">
                            <h5>Tạo Banner Mới</h5>
                        </div>
                        <form onSubmit={handleAddBanner}>
                            {/* File Upload Zone */}
                            <div className="upload-zone-wrapper mb-4">
                                <label className={`upload-dropzone ${previewUrl ? 'has-preview' : ''}`}>
                                    <input 
                                        type="file" 
                                        className="d-none" 
                                        onChange={handleFileChange} 
                                        accept="image/*" 
                                    />
                                    {previewUrl ? (
                                        <div className="preview-container animate-fade-in">
                                            <img src={previewUrl} alt="Preview" className="img-preview" />
                                            <div className="preview-overlay">
                                                <Upload size={20} />
                                                <span>Thay đổi hình ảnh</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <ImageIcon size={40} className="mb-2 text-muted" />
                                            <h6>Chọn hoặc kéo thả ảnh vào đây</h6>
                                            <p className="text-muted small">Định dạng JPG, PNG, WEBP (Tối đa 5MB)</p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {/* Inputs Group */}
                            <div className="form-group-custom mb-3">
                                <label className="form-label-custom">
                                    <FileText size={16} /> Tiêu đề chính (Title)
                                </label>
                                <input 
                                    type="text" 
                                    className="form-control-custom" 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)} 
                                    placeholder="Ví dụ: SUMMER SALE 50%" 
                                />
                            </div>

                            <div className="form-group-custom mb-3">
                                <label className="form-label-custom">
                                    <FileText size={16} /> Mô tả phụ (Subtitle)
                                </label>
                                <input 
                                    type="text" 
                                    className="form-control-custom" 
                                    value={subtitle} 
                                    onChange={e => setSubtitle(e.target.value)} 
                                    placeholder="Ví dụ: Áp dụng từ ngày 15/06" 
                                />
                            </div>

                            <div className="form-group-custom mb-4">
                                <label className="form-label-custom">
                                    <LinkIcon size={16} /> Đường dẫn liên kết (Link URL)
                                </label>
                                <input 
                                    type="text" 
                                    className="form-control-custom" 
                                    value={link} 
                                    onChange={e => setLink(e.target.value)} 
                                    placeholder="Ví dụ: /products hoặc http://..." 
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn-upload-submit"
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        ĐANG TẢI LÊN...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} /> THÊM & XUẤT BẢN
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Banner Gallery List */}
                <div className="col-lg-8">
                    <div className="banners-list-container">
                        <div className="list-header mb-3 d-flex justify-content-between align-items-center">
                            <h5>Danh Sách Banner Hiện Tại</h5>
                            <span className="text-muted small">Kéo thả hoặc thay đổi thứ tự trên trang chủ</span>
                        </div>

                        {banners.length === 0 ? (
                            <div className="empty-banners-placeholder shadow-sm">
                                <ImageIcon size={50} className="text-muted mb-3" />
                                <h5>Chưa có banner nào hoạt động</h5>
                                <p className="text-muted">Hãy tải lên một banner mới bằng form bên cạnh để cập nhật trang chủ.</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {banners.map((b, idx) => (
                                    <div key={b.id || idx} className="col-md-6 col-xl-6">
                                        <div className="premium-banner-card shadow-sm">
                                            <div className="banner-image-wrapper">
                                                <img 
                                                    src={b.image_path?.startsWith('http') ? b.image_path : `${API_BASE}/storage/${b.image_path}`} 
                                                    alt="banner" 
                                                    className="banner-img-fluid"
                                                />
                                                <div className="banner-status-tag">
                                                    <span className="pulse-dot"></span> Hoạt động
                                                </div>
                                                <button 
                                                    onClick={() => deleteBanner(b.id)} 
                                                    className="banner-delete-btn"
                                                    title="Xóa banner này"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="banner-details">
                                                <div className="banner-meta-info">
                                                    <h6 className="card-banner-title">{b.title || 'Không có tiêu đề'}</h6>
                                                    <p className="card-banner-subtitle text-muted">{b.subtitle || 'Không có mô tả phụ'}</p>
                                                    {b.link && (
                                                        <div className="card-banner-link-badge">
                                                            <LinkIcon size={12} /> <span>{b.link}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerManager;