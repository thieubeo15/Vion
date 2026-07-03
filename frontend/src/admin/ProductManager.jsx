import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Package, Search, Upload, Save, X, Image as ImageIcon, Eye, Loader2, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import './ProductManager.css';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const [formData, setFormData] = useState({
        Name: '', CategoryID: '', Description: '', Material: '', UsageInstruction: '', MainImage: null, additionalImages: [],
        variants: [{ size: '', color: '', price: '', discountPrice: '', stock: '', importPrice: '' }]
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 7;
    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api';

    const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
    });

    
    const [cropModal, setCropModal] = useState({
        isOpen: false,
        imgSrc: '',
        fileName: '',
        onCropDone: null,
        title: 'Cắt ảnh'
    });
    const [cropState, setCropState] = useState({
        zoom: 1,
        x: 0,
        y: 0,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imgSize, setImgSize] = useState({ w: 0, h: 0, baseW: 0, baseH: 0 });
    const cropImgRef = useRef(null);

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [prodRes, catRes] = await Promise.all([
                axios.get(`${API_URL}/products`, config),
                axios.get(`${API_URL}/categories`, config)
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
                        <img src="${prod.main_image?.startsWith('http') ? prod.main_image : 'http://127.0.0.1:8000/storage/' + prod.main_image}" style="width: 80px; height: 110px; object-fit: cover; border-radius: 8px;" />
                        <div>
                            <h4 style="margin: 0 0 5px 0; font-size: 16px;">${prod.name}</h4>
                            <p style="margin: 0; color: #EE4D2D; font-weight: 700;">Danh mục: ${prod.category?.name || 'N/A'}</p>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: #555;"><b>Chất liệu:</b> ${prod.material || 'Chưa cập nhật'}</p>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: #555; white-space: pre-line;"><b>HD sử dụng:</b> ${prod.usage_instruction || 'Chưa cập nhật'}</p>
                            <p style="font-size: 13px; color: #777; margin-top: 8px;">${prod.description || 'Không có mô tả.'}</p>
                        </div>
                    </div>
                    <div style="font-weight: 800; font-size: 11px; color: #999; text-transform: uppercase; margin-bottom: 10px;">Biến thể sản phẩm</div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #eee;">
                        <thead style="background: #fafafa;">
                            <tr>
                                <th style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">Size</th>
                                <th style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">Màu</th>
                                <th style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Giá bán</th>
                                <th style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Giá giảm</th>
                                <th style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Giá nhập</th>
                                <th style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">Kho</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${prod.variants?.map(v => `
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${v.size || v.Size || '-'}</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${v.color || v.Color || '-'}</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 700;">${Number(v.price || v.Price || 0).toLocaleString()}đ</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 700; color: #EE4D2D;">${v.discount_price || v.DiscountPrice ? `${Number(v.discount_price || v.DiscountPrice).toLocaleString()}đ` : '-'}</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 700;">${Number(v.importPrice || v.import_price || v.ImportPrice || 0).toLocaleString()}đ</td>
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

    const openCropModal = (file, callback, title = 'Cắt ảnh sản phẩm') => {
        const reader = new FileReader();
        reader.onload = () => {
            setCropModal({
                isOpen: true,
                imgSrc: reader.result,
                fileName: file.name,
                onCropDone: callback,
                title: title
            });
            setCropState({ zoom: 1, x: 0, y: 0 });
        };
        reader.readAsDataURL(file);
    };

    const handleImageLoad = (e) => {
        const img = e.target;
        const wOrig = img.naturalWidth;
        const hOrig = img.naturalHeight;
        const vpW = 300;
        const vpH = 400;
        let baseW = vpW;
        let baseH = vpH;
        const origRatio = wOrig / hOrig;
        if (origRatio > 0.75) {
            baseH = vpH;
            baseW = wOrig * (vpH / hOrig);
        } else {
            baseW = vpW;
            baseH = hOrig * (vpW / wOrig);
        }
        setImgSize({ w: wOrig, h: hOrig, baseW, baseH });
        setCropState({
            zoom: 1,
            x: (vpW - baseW) / 2,
            y: (vpH - baseH) / 2
        });
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - cropState.x,
            y: e.clientY - cropState.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const vpW = 300;
        const vpH = 400;
        const dispW = imgSize.baseW * cropState.zoom;
        const dispH = imgSize.baseH * cropState.zoom;
        let newX = e.clientX - dragStart.x;
        let newY = e.clientY - dragStart.y;
        newX = Math.min(0, Math.max(vpW - dispW, newX));
        newY = Math.min(0, Math.max(vpH - dispH, newY));
        setCropState(prev => ({ ...prev, x: newX, y: newY }));
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
            x: touch.clientX - cropState.x,
            y: touch.clientY - cropState.y
        });
    };

    const handleTouchMove = (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const vpW = 300;
        const vpH = 400;
        const dispW = imgSize.baseW * cropState.zoom;
        const dispH = imgSize.baseH * cropState.zoom;
        let newX = touch.clientX - dragStart.x;
        let newY = touch.clientY - dragStart.y;
        newX = Math.min(0, Math.max(vpW - dispW, newX));
        newY = Math.min(0, Math.max(vpH - dispH, newY));
        setCropState(prev => ({ ...prev, x: newX, y: newY }));
    };

    const handleZoomChange = (e) => {
        const newZoom = parseFloat(e.target.value);
        const oldZoom = cropState.zoom;
        const vpW = 300;
        const vpH = 400;
        const vpCenterX = vpW / 2;
        const vpCenterY = vpH / 2;
        const imgCenterX = vpCenterX - cropState.x;
        const imgCenterY = vpCenterY - cropState.y;
        const imgCenterXNew = imgCenterX * (newZoom / oldZoom);
        const imgCenterYNew = imgCenterY * (newZoom / oldZoom);
        let newX = vpCenterX - imgCenterXNew;
        let newY = vpCenterY - imgCenterYNew;
        const dispW = imgSize.baseW * newZoom;
        const dispH = imgSize.baseH * newZoom;
        newX = Math.min(0, Math.max(vpW - dispW, newX));
        newY = Math.min(0, Math.max(vpH - dispH, newY));
        setCropState({ zoom: newZoom, x: newX, y: newY });
    };

    const handleCropConfirm = () => {
        if (!cropImgRef.current) return;
        const vpW = 300;
        const vpH = 400;
        const dispW = imgSize.baseW * cropState.zoom;
        const dispH = imgSize.baseH * cropState.zoom;
        const scaleX = imgSize.w / dispW;
        const scaleY = imgSize.h / dispH;
        const srcX = -cropState.x * scaleX;
        const srcY = -cropState.y * scaleY;
        const srcW = vpW * scaleX;
        const srcH = vpH * scaleY;

        const canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(cropImgRef.current, srcX, srcY, srcW, srcH, 0, 0, 900, 1200);

        canvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], cropModal.fileName, { type: 'image/jpeg' });
                croppedFile.preview = URL.createObjectURL(croppedFile);
                cropModal.onCropDone(croppedFile);
                setCropModal({ isOpen: false, imgSrc: '', fileName: '', onCropDone: null, title: '' });
            }
        }, 'image/jpeg', 0.9);
    };

    const revokePreview = (file) => {
        if (file && file.preview) {
            URL.revokeObjectURL(file.preview);
        }
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        revokePreview(formData.MainImage);
        openCropModal(file, (croppedFile) => {
            setFormData(prev => ({ ...prev, MainImage: croppedFile }));
        }, 'Cắt ảnh đại diện (Tỉ lệ chuẩn 3:4)');
        e.target.value = '';
    };

    const handleAdditionalImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        let index = 0;
        const croppedFiles = [];
        const processNext = () => {
            if (index < files.length) {
                openCropModal(files[index], (croppedFile) => {
                    croppedFiles.push(croppedFile);
                    index++;
                    processNext();
                }, `Cắt ảnh phụ ${index + 1}/${files.length} (Tỉ lệ chuẩn 3:4)`);
            } else {
                setFormData(prev => ({
                    ...prev,
                    additionalImages: [...(prev.additionalImages || []), ...croppedFiles]
                }));
            }
        };
        processNext();
        e.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('Name', formData.Name);
        data.append('CategoryID', formData.CategoryID);
        data.append('Description', formData.Description || '');
        data.append('Material', formData.Material || '');
        data.append('UsageInstruction', formData.UsageInstruction || '');
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
            Material: prod.material || '', UsageInstruction: prod.usage_instruction || '',
            MainImage: null, additionalImages: [],
            variants: prod.variants?.map(v => ({
                size: v.size || v.Size,
                color: v.color || v.Color,
                price: v.price || v.Price,
                discountPrice: v.discount_price || v.DiscountPrice || '',
                stock: v.stock || v.Stock,
                importPrice: v.import_price || v.ImportPrice || '' // Lấy giá vốn từ API
            })) || []
        });
    };

    const resetForm = () => {
        revokePreview(formData.MainImage);
        if (formData.additionalImages) {
            formData.additionalImages.forEach(revokePreview);
        }
        setFormData({ Name: '', CategoryID: '', Description: '', Material: '', UsageInstruction: '', MainImage: null, additionalImages: [], variants: [{ size: '', color: '', price: '', discountPrice: '', importPrice: '', stock: '' }] });
        setIsEditing(false); setEditId(null);
    };

    return (
        <div className="v-admin-card">
            <div className="v-card-header">
                <div className="v-title-box">
                    <Package className="v-brand-icon" size={24} />
                    <h2>Quản lý sản phẩm</h2>
                </div>
                <div className="v-header-tools">
                    <button onClick={fetchData} className="v-refresh-btn"><RefreshCw size={16}/></button>
                </div>
            </div>

            
            {!isEditing && (
                <form className="v-inline-form" onSubmit={handleSubmit}>
                    <div className="v-form-grid">
                        
                        <div className="v-col">
                            <div className="v-input-group">
                                <label>Tên sản phẩm</label>
                                <input type="text" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required placeholder="Hoodie Vion..." />
                            </div>
                            <div className="v-input-group">
                                <label>Danh mục</label>
                                <select value={formData.CategoryID} onChange={(e) => setFormData({ ...formData, CategoryID: e.target.value })} required>
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.display}</option>)}
                                </select>
                            </div>
                            <div className="v-input-group">
                                <label>Chất liệu</label>
                                <input type="text" value={formData.Material} onChange={(e) => setFormData({ ...formData, Material: e.target.value })} placeholder="Cotton 100%, Nỉ bông..." />
                            </div>
                        </div>
                        
                        
                        <div className="v-col">
                            <div className="v-input-group">
                                <label>Hình ảnh sản phẩm</label>
                                <div className="v-image-uploads">
                                    <label className="v-upload-main">
                                        <Upload size={22} />
                                        <span>{formData.MainImage ? "Đã chọn ảnh chính" : "Ảnh đại diện"}</span>
                                        <input type="file" hidden onChange={handleMainImageChange} />
                                    </label>
                                    <label className="v-upload-sub">
                                        <ImageIcon size={22} />
                                        <span>Ảnh phụ (+{formData.additionalImages.length})</span>
                                        <input type="file" multiple hidden onChange={handleAdditionalImagesChange} />
                                    </label>
                                </div>
                            </div>

                            
                            {(formData.MainImage || (formData.additionalImages && formData.additionalImages.length > 0)) && (
                                <div className="v-image-previews-container" style={{ marginTop: '12px' }}>
                                    {formData.MainImage && (
                                        <div className="v-preview-card main-preview">
                                            <div className="v-preview-badge">Ảnh chính</div>
                                            <img 
                                                src={formData.MainImage.preview || formData.MainImage} 
                                                alt="Main Preview" 
                                            />
                                            <button type="button" className="v-preview-remove" onClick={() => {
                                                revokePreview(formData.MainImage);
                                                setFormData({ ...formData, MainImage: null });
                                            }} title="Xóa ảnh chính">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )}
                                    {formData.additionalImages && formData.additionalImages.map((file, idx) => (
                                        <div key={idx} className="v-preview-card sub-preview">
                                            <div className="v-preview-badge">Phụ {idx + 1}</div>
                                            <img 
                                                src={file.preview || file} 
                                                alt={`Sub Preview ${idx}`} 
                                            />
                                            <button type="button" className="v-preview-remove" onClick={() => {
                                                revokePreview(file);
                                                const updated = formData.additionalImages.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, additionalImages: updated });
                                            }} title="Xóa ảnh phụ">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    
                    <div className="v-form-fullwidth" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                        <div className="v-input-group" style={{ margin: 0 }}>
                            <label>Mô tả sản phẩm</label>
                            <textarea rows="3" value={formData.Description} onChange={(e) => setFormData({ ...formData, Description: e.target.value })} placeholder="Nhập mô tả chi tiết sản phẩm..."></textarea>
                        </div>
                        <div className="v-input-group" style={{ margin: 0 }}>
                            <label>Hướng dẫn sử dụng</label>
                            <textarea rows="3" value={formData.UsageInstruction} onChange={(e) => setFormData({ ...formData, UsageInstruction: e.target.value })} placeholder="Giặt máy chế độ nhẹ, không dùng chất tẩy..."></textarea>
                        </div>
                    </div>

                    <div className="v-variant-section">
                        <div className="v-section-header">
                            <h3>Biến thể & Giá nhập (Giá vốn)</h3>
                            <button type="button" onClick={() => setFormData({ ...formData, variants: [...formData.variants, { size: '', color: '', price: '', discountPrice: '', importPrice: '', stock: '' }] })} className="v-btn-add-var">+ Thêm dòng</button>
                        </div>

                        {formData.variants.map((v, i) => (
                            <div key={i} className="v-variant-row">
                                <input type="text" placeholder="Size" value={v.size} onChange={(e) => { const n = [...formData.variants]; n[i].size = e.target.value; setFormData({ ...formData, variants: n }); }} />
                                <input type="text" placeholder="Màu" value={v.color} onChange={(e) => { const n = [...formData.variants]; n[i].color = e.target.value; setFormData({ ...formData, variants: n }); }} />
                                <input type="number" placeholder="Giá bán" value={v.price} onChange={(e) => { const n = [...formData.variants]; n[i].price = e.target.value; setFormData({ ...formData, variants: n }); }} />
                                <input type="number" placeholder="Giá giảm" value={v.discountPrice || ''} onChange={(e) => { const n = [...formData.variants]; n[i].discountPrice = e.target.value; setFormData({ ...formData, variants: n }); }} />
                                <input type="number" placeholder="Giá nhập" value={v.importPrice} onChange={(e) => { const n = [...formData.variants]; n[i].importPrice = e.target.value; setFormData({ ...formData, variants: n }); }} />
                                <input type="number" placeholder="Kho" value={v.stock} onChange={(e) => { const n = [...formData.variants]; n[i].stock = e.target.value; setFormData({ ...formData, variants: n }); }} />
                                <button type="button" onClick={() => setFormData({ ...formData, variants: formData.variants.filter((_, idx) => idx !== i) })} className="v-del-var"><X size={16} /></button>
                            </div>
                        ))}
                    </div>

                    <div className="v-form-footer">
                        <button type="submit" className="v-btn-submit">
                            <Plus size={18} /> ĐĂNG BÁN SẢN PHẨM
                        </button>
                    </div>
                </form>
            )}

            
            {isEditing && (
                <div className="v-modal-overlay" onClick={resetForm}>
                    <div className="v-modal-content v-product-modal" onClick={e => e.stopPropagation()}>
                        <div className="v-modal-header">
                            <h3>Sửa sản phẩm</h3>
                            <button className="v-modal-close" onClick={resetForm}><X size={20} /></button>
                        </div>
                        <form className="v-modal-form" onSubmit={handleSubmit}>
                            <div className="v-form-grid">
                                
                                <div className="v-col">
                                    <div className="v-form-group">
                                        <label>Tên sản phẩm</label>
                                        <input type="text" value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required placeholder="Hoodie Vion..." />
                                    </div>
                                    <div className="v-form-group">
                                        <label>Danh mục</label>
                                        <select value={formData.CategoryID} onChange={(e) => setFormData({ ...formData, CategoryID: e.target.value })} required>
                                            <option value="">-- Chọn danh mục --</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.display}</option>)}
                                        </select>
                                    </div>
                                    <div className="v-form-group">
                                        <label>Chất liệu</label>
                                        <input type="text" value={formData.Material} onChange={(e) => setFormData({ ...formData, Material: e.target.value })} placeholder="Cotton 100%, Nỉ bông..." />
                                    </div>
                                </div>
                                
                                
                                <div className="v-col">
                                    <div className="v-form-group">
                                        <label>Hình ảnh sản phẩm</label>
                                        <div className="v-image-uploads">
                                            <label className="v-upload-main">
                                                <Upload size={22} />
                                                <span>{formData.MainImage ? "Đã chọn ảnh chính" : "Ảnh đại diện"}</span>
                                                <input type="file" hidden onChange={handleMainImageChange} />
                                            </label>
                                            <label className="v-upload-sub">
                                                <ImageIcon size={22} />
                                                <span>Ảnh phụ (+{formData.additionalImages.length})</span>
                                                <input type="file" multiple hidden onChange={handleAdditionalImagesChange} />
                                            </label>
                                        </div>
                                    </div>

                                    
                                    {(formData.MainImage || (formData.additionalImages && formData.additionalImages.length > 0)) && (
                                        <div className="v-image-previews-container" style={{ marginTop: '12px' }}>
                                            {formData.MainImage && (
                                                <div className="v-preview-card main-preview">
                                                    <div className="v-preview-badge">Ảnh chính</div>
                                                    <img 
                                                        src={formData.MainImage.preview || formData.MainImage} 
                                                        alt="Main Preview" 
                                                    />
                                                    <button type="button" className="v-preview-remove" onClick={() => {
                                                        revokePreview(formData.MainImage);
                                                        setFormData({ ...formData, MainImage: null });
                                                    }} title="Xóa ảnh chính">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            )}
                                            {formData.additionalImages && formData.additionalImages.map((file, idx) => (
                                                <div key={idx} className="v-preview-card sub-preview">
                                                    <div className="v-preview-badge">Phụ {idx + 1}</div>
                                                    <img 
                                                        src={file.preview || file} 
                                                        alt={`Sub Preview ${idx}`} 
                                                    />
                                                    <button type="button" className="v-preview-remove" onClick={() => {
                                                        revokePreview(file);
                                                        const updated = formData.additionalImages.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, additionalImages: updated });
                                                    }} title="Xóa ảnh phụ">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            
                            <div className="v-form-fullwidth" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                                <div className="v-form-group" style={{ margin: 0 }}>
                                    <label>Mô tả sản phẩm</label>
                                    <textarea rows="3" value={formData.Description} onChange={(e) => setFormData({ ...formData, Description: e.target.value })} placeholder="Nhập mô tả chi tiết sản phẩm..."></textarea>
                                </div>
                                <div className="v-form-group" style={{ margin: 0 }}>
                                    <label>Hướng dẫn sử dụng</label>
                                    <textarea rows="3" value={formData.UsageInstruction} onChange={(e) => setFormData({ ...formData, UsageInstruction: e.target.value })} placeholder="Giặt máy chế độ nhẹ, không dùng chất tẩy..."></textarea>
                                </div>
                            </div>

                            <div className="v-variant-section">
                                <div className="v-section-header">
                                    <h3>Biến thể & Giá nhập (Giá vốn)</h3>
                                    <button type="button" onClick={() => setFormData({ ...formData, variants: [...formData.variants, { size: '', color: '', price: '', discountPrice: '', importPrice: '', stock: '' }] })} className="v-btn-add-var">+ Thêm dòng</button>
                                </div>

                                {formData.variants.map((v, i) => (
                                    <div key={i} className="v-variant-row">
                                        <input type="text" placeholder="Size" value={v.size} onChange={(e) => { const n = [...formData.variants]; n[i].size = e.target.value; setFormData({ ...formData, variants: n }); }} />
                                        <input type="text" placeholder="Màu" value={v.color} onChange={(e) => { const n = [...formData.variants]; n[i].color = e.target.value; setFormData({ ...formData, variants: n }); }} />
                                        <input type="number" placeholder="Giá bán" value={v.price} onChange={(e) => { const n = [...formData.variants]; n[i].price = e.target.value; setFormData({ ...formData, variants: n }); }} />
                                        <input type="number" placeholder="Giá giảm" value={v.discountPrice || ''} onChange={(e) => { const n = [...formData.variants]; n[i].discountPrice = e.target.value; setFormData({ ...formData, variants: n }); }} />
                                        <input type="number" placeholder="Giá nhập" value={v.importPrice} onChange={(e) => { const n = [...formData.variants]; n[i].importPrice = e.target.value; setFormData({ ...formData, variants: n }); }} />
                                        <input type="number" placeholder="Kho" value={v.stock} onChange={(e) => { const n = [...formData.variants]; n[i].stock = e.target.value; setFormData({ ...formData, variants: n }); }} />
                                        <button type="button" onClick={() => setFormData({ ...formData, variants: formData.variants.filter((_, idx) => idx !== i) })} className="v-del-var"><X size={16} /></button>
                                    </div>
                                ))}
                            </div>

                            <div className="v-modal-actions">
                                <button type="button" className="v-btn-cancel" onClick={resetForm}>Hủy</button>
                                <button type="submit" className="v-btn-save v-btn-submit">
                                    <Save size={16} /> Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="v-table-header d-flex justify-content-between align-items-center mb-3 mt-5">
                <h3 className="fw-800 text-dark m-0" style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={18} className="v-brand-icon" /> DANH SÁCH SẢN PHẨM ĐÃ ĐĂNG BÁN.
                </h3>
                <div className="v-table-tools">
                    <div className="v-search">
                        <Search size={16} color="#999" />
                        <input type="text" placeholder="Tìm kiếm nhanh..." onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="v-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="name_asc">Tên A → Z</option>
                        <option value="name_desc">Tên Z → A</option>
                        <option value="stock_asc">Tồn kho tăng dần</option>
                        <option value="stock_desc">Tồn kho giảm dần</option>
                        <option value="out_of_stock">Hết hàng trước</option>
                    </select>
                </div>
            </div>

            <table className="v-modern-table">
                <thead><tr><th width="80">Ảnh</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Tồn kho</th><th className="v-actions">Thao tác</th></tr></thead>
                <tbody>
                    {(() => {
                        if (loading) {
                            return <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}><Loader2 className="v-spin" /> Đang tải...</td></tr>;
                        }
                        
                        const processed = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => {
                            const stockA = a.variants?.reduce((s, v) => s + (v.stock || v.Stock || 0), 0) || 0;
                            const stockB = b.variants?.reduce((s, v) => s + (v.stock || v.Stock || 0), 0) || 0;
                            switch (sortBy) {
                                case 'oldest': return (a.id || 0) - (b.id || 0);
                                case 'name_asc': return (a.name || '').localeCompare(b.name || '');
                                case 'name_desc': return (b.name || '').localeCompare(a.name || '');
                                case 'stock_asc': return stockA - stockB;
                                case 'stock_desc': return stockB - stockA;
                                case 'out_of_stock': return stockA - stockB;
                                case 'newest':
                                default: return (b.id || 0) - (a.id || 0);
                            }
                        });

                        if (processed.length === 0) {
                            return <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>Không tìm thấy sản phẩm nào.</td></tr>;
                        }

                        const indexOfLast = currentPage * productsPerPage;
                        const indexOfFirst = indexOfLast - productsPerPage;
                        const currentProds = processed.slice(indexOfFirst, indexOfLast);

                        return currentProds.map(prod => (
                            <tr key={prod.id}>
                                <td><img src={prod.main_image?.startsWith('http') ? prod.main_image : `http://127.0.0.1:8000/storage/${prod.main_image}`} className="v-table-img" alt="" /></td>
                                <td><div className="v-prod-name">{prod.name}</div></td>
                                <td><span className="v-tag">{prod.category?.name}</span></td>
                                <td>
                                    {(() => {
                                        const total = prod.variants?.reduce((sum, v) => sum + (v.stock || v.Stock || 0), 0) || 0;
                                        return total > 0 
                                            ? <span className="v-stock-num">{total}</span>
                                            : <span className="v-stock-badge-empty">Hết hàng</span>;
                                    })()}
                                </td>
                                <td className="v-actions">
                                    <button onClick={() => handleViewDetails(prod)} className="v-view" title="Xem nhanh"><Eye size={16} /></button>
                                    <button onClick={() => startEdit(prod)} className="v-edit" title="Sửa"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(prod.id)} className="v-del" title="Xóa"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ));
                    })()}
                </tbody>
            </table>

            
            {!loading && (() => {
                const processed = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
                const totalPages = Math.ceil(processed.length / productsPerPage);
                if (totalPages <= 1) return null;
                return (
                    <div className="v-pagination">
                        <button 
                            className="v-page-btn" 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            &laquo; Trước
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`v-page-btn ${currentPage === page ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button 
                            className="v-page-btn" 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Sau &raquo;
                        </button>
                    </div>
                );
            })()}

            
            {cropModal.isOpen && (
                <div className="v-crop-modal-overlay">
                    <div className="v-crop-modal">
                        <div className="v-crop-header">
                            <h3>{cropModal.title}</h3>
                            <button type="button" className="v-crop-close-btn" onClick={() => setCropModal({ isOpen: false, imgSrc: '', fileName: '', onCropDone: null, title: '' })}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="v-crop-body">
                            <div 
                                className="v-crop-viewport"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUpOrLeave}
                                onMouseLeave={handleMouseUpOrLeave}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleMouseUpOrLeave}
                            >
                                <img 
                                    ref={cropImgRef}
                                    src={cropModal.imgSrc} 
                                    alt="Crop source" 
                                    onLoad={handleImageLoad}
                                    style={{
                                        position: 'absolute',
                                        left: `${cropState.x}px`,
                                        top: `${cropState.y}px`,
                                        width: `${imgSize.baseW * cropState.zoom}px`,
                                        height: `${imgSize.baseH * cropState.zoom}px`,
                                        maxWidth: 'none',
                                        maxHeight: 'none',
                                        userSelect: 'none',
                                        pointerEvents: 'none'
                                    }}
                                />
                                <div className="v-crop-overlay-grid"></div>
                            </div>
                            
                            <div className="v-crop-slider-container">
                                <span className="v-crop-zoom-label">Thu nhỏ</span>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="3" 
                                    step="0.01" 
                                    value={cropState.zoom} 
                                    onChange={handleZoomChange}
                                    className="v-crop-slider"
                                />
                                <span className="v-crop-zoom-label">Phóng to</span>
                            </div>
                        </div>
                        
                        <div className="v-crop-footer">
                            <button 
                                type="button" 
                                className="v-crop-btn-cancel" 
                                onClick={() => setCropModal({ isOpen: false, imgSrc: '', fileName: '', onCropDone: null, title: '' })}
                            >
                                HỦY
                            </button>
                            <button 
                                type="button" 
                                className="v-crop-btn-confirm" 
                                onClick={handleCropConfirm}
                            >
                                CẮT & LƯU ẢNH
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManager;