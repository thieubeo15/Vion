import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, RefreshCw, Layers, ChevronRight, Edit2, X, Save, Search, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './CategoryManager.css';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]); 
    const [allCategories, setAllCategories] = useState([]); 
    const [formData, setFormData] = useState({ name: '', parent_id: '' });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api/categories';

    // Cấu hình Toast thông báo nhanh cho đẹp
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_URL);
            const responseData = res.data.data || []; 
            setCategories(responseData);

            const flatList = [];
            const flatten = (items, level = 0) => {
                items.forEach(item => {
                    const itemName = item.name || item.Name || item.CategoryName;
                    flatList.push({ 
                        id: item.id, 
                        display: level > 0 ? `|-- ${itemName}` : itemName 
                    });
                    if (item.children && item.children.length > 0) flatten(item.children, level + 1);
                });
            };
            flatten(responseData);
            setAllCategories(flatList);
        } catch (err) { console.error("Lỗi fetch:", err); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCategories(); }, []);

    const filteredCategories = categories.filter(parent => {
        const pName = (parent.name || parent.Name || '').toLowerCase();
        const parentMatches = pName.includes(searchTerm.toLowerCase());
        const childMatches = parent.children?.some(child => 
            (child.name || child.Name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        return parentMatches || childMatches;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            Name: formData.name,
            name: formData.name,
            CategoryName: formData.name,
            ParentID: formData.parent_id || null,
            parent_id: formData.parent_id || null
        };

        try {
            if (isEditing) {
                await axios.put(`${API_URL}/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Toast.fire({ icon: 'success', title: 'Cập nhật thành công!' });
            } else {
                await axios.post(API_URL, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Toast.fire({ icon: 'success', title: 'Thêm danh mục thành công!' });
            }
            cancelEdit();
            fetchCategories();
        } catch (err) {
            const errorMsg = err.response?.data?.errors;
            if (errorMsg) {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: Object.values(errorMsg)[0][0] });
            } else {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: err.response?.data?.message || "Lỗi nhập liệu!" });
            }
        }
    };

    const startEdit = (cat) => {
        setIsEditing(true);
        setEditId(cat.id);
        setFormData({ 
            name: cat.name || cat.Name || cat.CategoryName, 
            parent_id: cat.parent_id || cat.ParentID || '' 
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: '', parent_id: '' });
    };

    const handleDelete = async (id) => {
        // Thay window.confirm bằng Swal.fire
        Swal.fire({
            title: 'Bro chắc chắn chứ?',
            text: "Xóa danh mục này sẽ không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EE4D2D',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Đồng ý.',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_URL}/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    Toast.fire({ icon: 'success', title: 'Đã xóa danh mục!' });
                    fetchCategories();
                } catch (err) { 
                    Swal.fire({ icon: 'error', title: 'Lỗi', text: err.response?.data?.message || "Lỗi xóa!" });
                }
            }
        });
    };

    return (
        <div className="v-admin-card">
            <div className="v-card-header">
                <div className="v-title-box">
                    <Layers className="v-brand-icon" />
                    <h2>{isEditing ? 'Sửa danh mục' : 'Quản lý danh mục'}</h2>
                </div>
                <div className="v-header-tools">
                    <div className="v-search-box">
                        <Search size={16} />
                        <input 
                            type="text" 
                            placeholder="Tìm nhanh..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchCategories} className="v-refresh-btn"><RefreshCw size={18} /></button>
                </div>
            </div>

            <form className={`v-inline-form ${isEditing ? 'v-edit-active' : ''}`} onSubmit={handleSubmit}>
                <div className="v-input-wrapper">
                    <input 
                        type="text" 
                        placeholder="Tên danh mục mới..." 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                    />
                    <select value={formData.parent_id} onChange={(e) => setFormData({...formData, parent_id: e.target.value})}>
                        <option value="">-- Danh mục Cha --</option>
                        {allCategories.filter(c => c.id !== editId).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.display}</option>
                        ))}
                    </select>
                    <div className="v-form-btns">
                        <button type="submit" className={isEditing ? 'v-btn-save' : 'v-btn-add'}>
                            {isEditing ? <><Save size={18} /> Lưu</> : <><Plus size={18} /> Thêm</>}
                        </button>
                        {isEditing && (
                            <button type="button" className="v-btn-cancel" onClick={cancelEdit}>
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </form>

            <div className="v-table-wrapper">
                <table className="v-table">
                    <thead>
                        <tr>
                            <th width="80">ID</th>
                            <th>Tên danh mục</th>
                            <th width="120" style={{textAlign: 'right', paddingRight: '25px'}}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" className="v-loading"><Loader2 className="v-spin" /> Đang tải dữ liệu Vion...</td></tr>
                        ) : filteredCategories.map(parent => (
                            <React.Fragment key={parent.id}>
                                <tr className="v-row-parent">
                                    <td>#{parent.id}</td>
                                    <td className="v-name-main">{parent.name || parent.Name}</td>
                                    <td className="v-actions">
                                        <button onClick={() => startEdit(parent)} className="v-edit-icon"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(parent.id)} className="v-del-icon"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                                {parent.children?.map(child => (
                                    (!searchTerm || (child.name || child.Name).toLowerCase().includes(searchTerm.toLowerCase())) && (
                                        <tr key={child.id} className="v-row-child">
                                            <td>#{child.id}</td>
                                            <td className="v-name-sub">
                                                <ChevronRight size={14} color="#ccc" />
                                                <span>{child.name || child.Name}</span>
                                            </td>
                                            <td className="v-actions">
                                                <button onClick={() => startEdit(child)} className="v-edit-icon"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(child.id)} className="v-del-icon"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryManager;