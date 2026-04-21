import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Package, Search, Upload, Save, X, Image as ImageIcon, Eye, Loader2, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import './ProductManager.css';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        Name: '', CategoryID: '', Description: '', MainImage: null, additionalImages: [],
        variants: [{ size: '', color: '', price: '', stock: '' }]
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api';

    const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                axios.get(`${API_URL}/products`),
                axios.get(`${API_URL}/categories`)
            ]);
            setProducts(prodRes.data.data || []);
            const flat = [];
            const flatten = (items, level = 0) => {
                items.forEach(item => {
                    flat.push({ id: item.id, display: level > 0 ? `|-- ${item.name}` : item.name });
                    if (item.children) flatten(item.children, level + 1);
                });
            };
            flatten(catRes.data.data || []);
            setCategories(flat);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleViewDetails = (prod) => {
        Swal.fire({
            title: `<div style="text-align: left; font-family: 'Plus Jakarta Sans'; font-weight: 800; font-size: 19px;">Chi tiết sản phẩm</div>`,
            html: `
                <div style="text-align: left; font-family: 'Plus Jakarta Sans'; font-size: 14px;">
                    <div style="display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                        <img src="http://127.0.0.1:8000/storage/${prod.main_image}" style="width: 80px; height: 110px; object-fit: cover; border-radius: 8px;" />
                        <div>
                            <h4 style="margin: 0 0 5px 0; font-size: 16px;">${prod.name}</h4>
                            <p style="margin: 0; color: #EE4D2D; font-weight: 700;">Danh mục: ${prod.category?.name || 'N/A'}</p>
                            <p style="font-size: 13px; color: #777; margin-top: 8px;">${prod.description || 'Không có mô tả.'}</p>
                        </div>
                    </div>
                    <div style="font-weight: 800; font-size: 11px; color: #999; text-transform: uppercase; margin-bottom: 10px;">Biến thể sản phẩm</div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #eee;">
                        <thead style="background: #fafafa;">
                            <tr>
                                <th style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">Size</th>
                                <th style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">Màu</th>
                                <th style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Giá</th>
                                <th style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">Kho</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${prod.variants?.map(v => `
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${v.size || v.Size || '-'}</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${v.color || v.Color || '-'}</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 700;">${Number(v.price || v.Price || 0).toLocaleString()}đ</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${v.stock || v.Stock || 0}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `,
            confirmButtonText: 'Đóng', confirmButtonColor: '#111', borderRadius: '15px', width: '550px'
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('Name', formData.Name);
        data.append('CategoryID', formData.CategoryID);
        data.append('Description', formData.Description || '');
        if (formData.MainImage instanceof File) data.append('MainImage', formData.MainImage);
        
        // Gửi các ảnh phụ (Gallery)
        if (formData.additionalImages && formData.additionalImages.length > 0) {
            formData.additionalImages.forEach(file => {
                data.append('images[]', file);
            });
        }

        data.append('variants', JSON.stringify(formData.variants));
        if (isEditing) data.append('_method', 'PUT');

        try {
            const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
            const url = isEditing ? `${API_URL}/products/${editId}` : `${API_URL}/products`;
            await axios.post(url, data, config);
            Toast.fire({ icon: 'success', title: 'Thành công!' });
            resetForm(); fetchData();
        } catch {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Vui lòng kiểm tra lại!', confirmButtonColor: '#EE4D2D' });
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Xóa sản phẩm?', text: "Hành động không thể hoàn tác!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Xóa ngay', cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_URL}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                    Toast.fire({ icon: 'success', title: 'Đã xóa sản phẩm' });
                    fetchData();
                } catch { Swal.fire('Lỗi', 'Thao tác thất bại!', 'error'); }
            }
        });
    };

    const startEdit = (prod) => {
        setIsEditing(true); setEditId(prod.id);
        setFormData({
            Name: prod.name, CategoryID: prod.category_id, Description: prod.description || '',
            MainImage: null, additionalImages: [],
            variants: prod.variants?.map(v => ({ size: v.size || v.Size, color: v.color || v.Color, price: v.price || v.Price, stock: v.stock || v.Stock })) || []
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({ Name: '', CategoryID: '', Description: '', MainImage: null, additionalImages: [], variants: [{ size: '', color: '', price: '', stock: '' }] });
        setIsEditing(false); setEditId(null);
    };

    return (
        <div className="v-admin-card">
            <div className="v-card-header">
                <div className="v-title-box">
                    <Package className="v-brand-icon" size={24} />
                    <h2>{isEditing ? 'Sửa sản phẩm' : 'Quản lý sản phẩm'}</h2>
                </div>
                <div className="v-header-tools">
                    <div className="v-search-box">
                        <Search size={16} color="#999" />
                        <input type="text" placeholder="Tìm kiếm nhanh..." onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={fetchData} className="v-refresh-btn"><RefreshCw size={16} /></button>
                </div>
            </div>

            <form className="v-inline-form" onSubmit={handleSubmit}>
                <div className="v-form-grid">
                    <div className="v-col">
                        <div className="v-input-group"><label>Tên sản phẩm</label><input type="text" value={formData.Name} onChange={(e) => setFormData({...formData, Name: e.target.value})} required placeholder="Hoodie Vion..." /></div>
                        <div className="v-input-group"><label>Danh mục</label><select value={formData.CategoryID} onChange={(e) => setFormData({...formData, CategoryID: e.target.value})} required><option value="">-- Chọn danh mục --</option>{categories.map(c => <option key={c.id} value={c.id}>{c.display}</option>)}</select></div>
                        <div className="v-input-group"><label>Mô tả</label><textarea rows="2" value={formData.Description} onChange={(e) => setFormData({...formData, Description: e.target.value})}></textarea></div>
                    </div>
                    <div className="v-col">
                        <label style={{fontWeight: 700, fontSize: '11px', color: '#999', textTransform: 'uppercase'}}>Hình ảnh</label>
                        <div className="v-image-uploads">
                            <label className="v-upload-main">
                                <Upload size={22} />
                                <span>{formData.MainImage ? "Đã chọn ảnh chính" : "Ảnh đại diện"}</span>
                                <input type="file" hidden onChange={(e) => setFormData({...formData, MainImage: e.target.files[0]})} />
                            </label>
                            <label className="v-upload-sub">
                                <ImageIcon size={22} />
                                <span>Ảnh phụ (+{formData.additionalImages.length})</span>
                                <input type="file" multiple hidden onChange={(e) => setFormData({...formData, additionalImages: [...formData.additionalImages, ...Array.from(e.target.files)]})} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="v-variant-section">
                    <div className="v-section-header">
                        <h3>Biến thể (Size & Màu)</h3>
                        <button type="button" onClick={() => setFormData({...formData, variants: [...formData.variants, {size:'', color:'', price:'', stock:''}]})} className="v-btn-add-var">+ Thêm dòng</button>
                    </div>
                    <div className="v-variant-header"><span>Size</span><span>Màu</span><span>Giá bán</span><span>Kho</span><span></span></div>
                    {formData.variants.map((v, i) => (
                        <div key={i} className="v-variant-row">
                            <input type="text" placeholder="Size" value={v.size} onChange={(e) => { const n = [...formData.variants]; n[i].size = e.target.value; setFormData({...formData, variants: n}); }} />
                            <input type="text" placeholder="Màu" value={v.color} onChange={(e) => { const n = [...formData.variants]; n[i].color = e.target.value; setFormData({...formData, variants: n}); }} />
                            <input type="number" placeholder="Giá" value={v.price} onChange={(e) => { const n = [...formData.variants]; n[i].price = e.target.value; setFormData({...formData, variants: n}); }} />
                            <input type="number" placeholder="Kho" value={v.stock} onChange={(e) => { const n = [...formData.variants]; n[i].stock = e.target.value; setFormData({...formData, variants: n}); }} />
                            <button type="button" onClick={() => setFormData({...formData, variants: formData.variants.filter((_, idx) => idx !== i)})} className="v-del-var"><X size={16}/></button>
                        </div>
                    ))}
                </div>

                <div className="v-form-footer">
                    <button type="submit" className="v-btn-submit">
                        {isEditing ? <><Save size={18}/> LƯU THAY ĐỔI</> : <><Plus size={18}/> ĐĂNG BÁN SẢN PHẨM</>}
                    </button>
                    {isEditing && <button type="button" className="v-btn-cancel" onClick={resetForm}>HỦY</button>}
                </div>
            </form>

            <table className="v-table">
                <thead><tr><th width="80">Ảnh</th><th>Tên sản phẩm</th><th>Danh mục</th><th className="v-actions">Thao tác</th></tr></thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="4" style={{textAlign: 'center', padding: '30px'}}><Loader2 className="v-spin" /> Đang tải...</td></tr>
                    ) : products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(prod => (
                        <tr key={prod.id}>
                            <td><img src={`http://127.0.0.1:8000/storage/${prod.main_image}`} className="v-table-img" alt="" /></td>
                            <td><div className="v-prod-name">{prod.name}</div></td>
                            <td><span className="v-tag">{prod.category?.name}</span></td>
                            <td className="v-actions">
                                <button onClick={() => handleViewDetails(prod)} className="v-view" title="Xem nhanh"><Eye size={16}/></button>
                                <button onClick={() => startEdit(prod)} className="v-edit" title="Sửa"><Edit2 size={16}/></button>
                                <button onClick={() => handleDelete(prod.id)} className="v-del" title="Xóa"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductManager;