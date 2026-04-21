import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Upload, ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import './BannerManager.css'; // Sẽ tạo file này ở bước sau

const BannerManager = () => {
    const [banners, setBanners] = useState([]);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [file, setFile] = useState(null);
    const API_BASE = 'http://127.0.0.1:8000';
    const token = localStorage.getItem('vion_token');

    useEffect(() => { fetchBanners(); }, []);

    const fetchBanners = () => {
        axios.get(`${API_BASE}/api/banners`).then(res => setBanners(res.data));
    };

    const handleAddBanner = async (e) => {
        e.preventDefault();
        if (!file) return Swal.fire('Lỗi', 'Vui lòng chọn ảnh', 'error');

        // BẮT BUỘC dùng FormData để gửi file
        const formData = new FormData();
        formData.append('image', file); // 'image' phải trùng với validation ở Laravel
        formData.append('title', title);
        formData.append('subtitle', subtitle);

        try {
            await axios.post(`${API_BASE}/api/banners`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` 
                }
            });
            Swal.fire('Thành công', 'Banner đã được tải lên!', 'success');
            setFile(null); setTitle(''); setSubtitle('');
            fetchBanners();
        } catch (err) {
            console.log(err.response?.data);
            Swal.fire('Lỗi', 'Thử lại nhé, nhớ chọn đúng định dạng ảnh!', 'error');
        }
    };

    const deleteBanner = (id) => {
        Swal.fire({ title: 'Bạn có chắc chắn?', icon: 'warning', showCancelButton: true }).then(async (result) => {
            if (result.isConfirmed) {
                await axios.delete(`${API_BASE}/api/banners/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                fetchBanners();
            }
        });
    };

    return (
        <div className="banner-admin-wrapper">
            <div className="banner-header">
                <h3><ImageIcon /> QUẢN LÝ BANNER TRANG CHỦ</h3>
            </div>
            
            <form onSubmit={handleAddBanner} className="upload-box shadow-sm">
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label>Chọn hình ảnh</label>
                        <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} accept="image/*" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label>Tiêu đề chính</label>
                        <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ví dụ: SALE UP TO 50%" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label>Mô tả ngắn</label>
                        <input type="text" className="form-control" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Ví dụ: Chỉ trong hôm nay" />
                    </div>
                </div>
                <button type="submit" className="btn-upload"><Upload size={18}/> TẢI LÊN NGAY</button>
            </form>

            <div className="row mt-4">
                {banners.map(b => (
                    <div key={b.id} className="col-md-4 mb-4">
                        <div className="banner-card shadow-sm">
                            <img src={`${API_BASE}/storage/${b.image_path}`} alt="banner" />
                            <div className="banner-info">
                                <h6>{b.title || 'Không tiêu đề'}</h6>
                                <button onClick={() => deleteBanner(b.id)} className="btn-del"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BannerManager;