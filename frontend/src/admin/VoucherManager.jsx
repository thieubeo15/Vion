import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, RefreshCw, Ticket, Edit2, X, Save, Search, Loader2, ToggleLeft, ToggleRight, Gift, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import './VoucherManager.css';

const VoucherManager = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const emptyForm = {
        Code: '', Type: 'fixed', Value: '', MaxDiscount: '', MinOrderAmount: '',
        UsageLimit: '0', PerUserLimit: '1', StartDate: '', EndDate: '',
        Description: '', IsActive: true, Visibility: 'public'
    };
    const [formData, setFormData] = useState({ ...emptyForm });

    const [showGiftModal, setShowGiftModal] = useState(false);
    const [giftVoucherId, setGiftVoucherId] = useState(null);
    const [giftVoucherCode, setGiftVoucherCode] = useState('');
    const [giftMode, setGiftMode] = useState('specific');
    const [giftUserIds, setGiftUserIds] = useState([]);
    const [giftRandomCount, setGiftRandomCount] = useState(10);
    const [allUsers, setAllUsers] = useState([]);
    const [giftLoading, setGiftLoading] = useState(false);

    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api/vouchers';

    const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false,
        timer: 3000, timerProgressBar: true,
    });

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVouchers(res.data.data || res.data || []);
        } catch (err) { console.error("Lỗi fetch vouchers:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchVouchers(); }, []);

    const filteredVouchers = vouchers.filter(v => {
        const term = searchTerm.toLowerCase();
        return (v.Code || '').toLowerCase().includes(term) ||
               (v.Description || '').toLowerCase().includes(term);
    });

    const openCreateModal = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ ...emptyForm });
        setShowModal(true);
    };

    const openEditModal = (voucher) => {
        setIsEditing(true);
        setEditId(voucher.id || voucher.ID);
        setFormData({
            Code: voucher.Code || '',
            Type: voucher.Type || 'fixed',
            Value: voucher.Value || '',
            MaxDiscount: voucher.MaxDiscount || '',
            MinOrderAmount: voucher.MinOrderAmount || '',
            UsageLimit: voucher.UsageLimit ?? '0',
            PerUserLimit: voucher.PerUserLimit ?? '1',
            StartDate: voucher.StartDate ? voucher.StartDate.slice(0, 16) : '',
            EndDate: voucher.EndDate ? voucher.EndDate.slice(0, 16) : '',
            Description: voucher.Description || '',
            IsActive: voucher.IsActive ?? true
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ ...emptyForm });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            Value: Number(formData.Value),
            MaxDiscount: formData.MaxDiscount ? Number(formData.MaxDiscount) : null,
            MinOrderAmount: formData.MinOrderAmount ? Number(formData.MinOrderAmount) : 0,
            UsageLimit: Number(formData.UsageLimit),
            PerUserLimit: Number(formData.PerUserLimit),
            IsActive: formData.IsActive ? 1 : 0
        };

        try {
            if (isEditing) {
                await axios.put(`${API_URL}/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Toast.fire({ icon: 'success', title: 'Cập nhật voucher thành công!' });
            } else {
                await axios.post(API_URL, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Toast.fire({ icon: 'success', title: 'Tạo voucher thành công!' });
            }
            closeModal();
            fetchVouchers();
        } catch (err) {
            const errorMsg = err.response?.data?.errors;
            if (errorMsg) {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: Object.values(errorMsg).flat()[0] });
            } else {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: err.response?.data?.message || 'Có lỗi xảy ra!' });
            }
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Xóa voucher này?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EE4D2D',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Đồng ý xóa',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_URL}/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    Toast.fire({ icon: 'success', title: 'Đã xóa voucher!' });
                    fetchVouchers();
                } catch (err) {
                    Swal.fire({ icon: 'error', title: 'Lỗi', text: err.response?.data?.message || 'Lỗi xóa!' });
                }
            }
        });
    };

    const handleToggleActive = async (voucher) => {
        const id = voucher.id || voucher.VoucherID;
        try {
            await axios.put(`${API_URL}/${id}`, {
                ...voucher,
                IsActive: voucher.IsActive ? 0 : 1
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Toast.fire({ icon: 'success', title: voucher.IsActive ? 'Đã tắt voucher' : 'Đã bật voucher' });
            fetchVouchers();
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể cập nhật trạng thái!' });
        }
    };

    const fetchAllUsers = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/users/list', { headers: { Authorization: `Bearer ${token}` } });
            setAllUsers(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    const openGiftModal = (voucher) => {
        setGiftVoucherId(voucher.VoucherID || voucher.id);
        setGiftVoucherCode(voucher.Code);
        setGiftMode('specific');
        setGiftUserIds([]);
        setGiftRandomCount(10);
        setShowGiftModal(true);
        fetchAllUsers();
    };

    const toggleGiftUser = (userId) => {
        setGiftUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    const handleGift = async () => {
        if (giftMode === 'specific' && giftUserIds.length === 0) {
            Swal.fire('Chú ý', 'Chọn ít nhất 1 người dùng!', 'warning'); return;
        }
        setGiftLoading(true);
        try {
            let res;
            if (giftMode === 'specific') {
                res = await axios.post(`${API_URL}/${giftVoucherId}/gift`, { user_ids: giftUserIds, source: 'gifted' }, { headers: { Authorization: `Bearer ${token}` } });
            } else if (giftMode === 'random') {
                res = await axios.post(`${API_URL}/${giftVoucherId}/gift-random`, { count: giftRandomCount }, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                res = await axios.post(`${API_URL}/${giftVoucherId}/gift-birthday`, {}, { headers: { Authorization: `Bearer ${token}` } });
            }
            if (res.data.success) {
                Swal.fire('Thành công! 🎁', res.data.message, 'success');
                setShowGiftModal(false);
            }
        } catch (err) {
            Swal.fire('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra!', 'error');
        } finally { setGiftLoading(false); }
    };

    const getStatus = (voucher) => {
        if (!voucher.IsActive) return { label: 'Tắt', cls: 'v-status-inactive' };
        const now = new Date();
        if (voucher.EndDate && new Date(voucher.EndDate) < now) return { label: 'Hết hạn', cls: 'v-status-expired' };
        if (voucher.StartDate && new Date(voucher.StartDate) > now) return { label: 'Chưa bắt đầu', cls: 'v-status-pending' };
        return { label: 'Hoạt động', cls: 'v-status-active' };
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatValue = (voucher) => {
        if (voucher.Type === 'percent') return `${voucher.Value}%`;
        return `${Number(voucher.Value).toLocaleString()}đ`;
    };

    return (
        <div className="v-admin-card">
            <div className="v-card-header">
                <div className="v-title-box">
                    <Ticket className="v-brand-icon" />
                    <h2>Quản lý Voucher</h2>
                </div>
                <div className="v-header-tools">
                    <div className="v-search-box">
                        <Search size={16} />
                        <input
                            type="text" placeholder="Tìm mã voucher..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchVouchers} className="v-refresh-btn"><RefreshCw size={18} /></button>
                    <button onClick={openCreateModal} className="v-btn-add">
                        <Plus size={18} /> Tạo mới
                    </button>
                </div>
            </div>

            <div className="v-table-wrapper">
                <table className="v-table">
                    <thead>
                        <tr>
                            <th>Mã</th>
                            <th>Loại</th>
                            <th>Giá trị</th>
                            <th>Đơn tối thiểu</th>
                            <th>Đã dùng</th>
                            <th>Thời hạn</th>
                            <th>Trạng thái</th>
                            <th style={{ textAlign: 'right', paddingRight: '25px' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" className="v-loading"><Loader2 className="v-spin" /> Đang tải...</td></tr>
                        ) : filteredVouchers.length === 0 ? (
                            <tr><td colSpan="8" className="v-loading">Không tìm thấy voucher nào</td></tr>
                        ) : filteredVouchers.map(v => {
                            const status = getStatus(v);
                            return (
                                <tr key={v.id || v.ID} className="v-row-parent">
                                    <td className="v-voucher-code-cell">{v.Code}</td>
                                    <td>{v.Type === 'percent' ? 'Phần trăm' : 'Cố định'}</td>
                                    <td className="fw-700">{formatValue(v)}</td>
                                    <td>{v.MinOrderAmount ? `${Number(v.MinOrderAmount).toLocaleString()}đ` : '—'}</td>
                                    <td>
                                        <span className="v-usage-badge">
                                            {v.UsedCount || 0} / {v.UsageLimit ? v.UsageLimit : '∞'}
                                        </span>
                                    </td>
                                    <td className="v-date-cell">
                                        <div>{formatDate(v.StartDate)}</div>
                                        <div className="v-date-to">→ {formatDate(v.EndDate)}</div>
                                    </td>
                                    <td><span className={`v-status-badge ${status.cls}`}>{status.label}</span></td>
                                    <td className="v-actions">
                                        <button onClick={() => handleToggleActive(v)} className="v-toggle-icon" title={v.IsActive ? 'Tắt' : 'Bật'}>
                                            {v.IsActive ? <ToggleRight size={20} color="#34c759" /> : <ToggleLeft size={20} color="#999" />}
                                        </button>
                                        <button onClick={() => openGiftModal(v)} className="v-gift-icon" title="Tặng voucher"><Gift size={16} /></button>
                                        <button onClick={() => openEditModal(v)} className="v-edit-icon"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(v.id || v.VoucherID)} className="v-del-icon"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* MODAL FORM */}
            {showModal && (
                <div className="v-modal-overlay" onClick={closeModal}>
                    <div className="v-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="v-modal-header">
                            <h3>{isEditing ? 'Sửa voucher' : 'Tạo voucher mới'}</h3>
                            <button className="v-modal-close" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="v-modal-form">
                            <div className="v-form-grid">
                                <div className="v-form-group">
                                    <label>Mã voucher</label>
                                    <input type="text" required value={formData.Code}
                                        onChange={e => setFormData({ ...formData, Code: e.target.value.toUpperCase() })}
                                        placeholder="VD: GIAM50K" />
                                </div>
                                <div className="v-form-group">
                                    <label>Loại giảm giá</label>
                                    <select value={formData.Type}
                                        onChange={e => setFormData({ ...formData, Type: e.target.value })}>
                                        <option value="fixed">Cố định (VNĐ)</option>
                                        <option value="percent">Phần trăm (%)</option>
                                    </select>
                                </div>
                                <div className="v-form-group">
                                    <label>Giá trị {formData.Type === 'percent' ? '(%)' : '(VNĐ)'}</label>
                                    <input type="number" required min="0" value={formData.Value}
                                        onChange={e => setFormData({ ...formData, Value: e.target.value })}
                                        placeholder={formData.Type === 'percent' ? 'VD: 10' : 'VD: 50000'} />
                                </div>
                                {formData.Type === 'percent' && (
                                    <div className="v-form-group">
                                        <label>Giảm tối đa (VNĐ)</label>
                                        <input type="number" min="0" value={formData.MaxDiscount}
                                            onChange={e => setFormData({ ...formData, MaxDiscount: e.target.value })}
                                            placeholder="VD: 100000" />
                                    </div>
                                )}
                                <div className="v-form-group">
                                    <label>Đơn tối thiểu (VNĐ)</label>
                                    <input type="number" min="0" value={formData.MinOrderAmount}
                                        onChange={e => setFormData({ ...formData, MinOrderAmount: e.target.value })}
                                        placeholder="VD: 200000" />
                                </div>
                                <div className="v-form-group">
                                    <label>Giới hạn dùng (0 = không giới hạn)</label>
                                    <input type="number" min="0" value={formData.UsageLimit}
                                        onChange={e => setFormData({ ...formData, UsageLimit: e.target.value })} />
                                </div>
                                <div className="v-form-group">
                                    <label>Giới hạn / người</label>
                                    <input type="number" min="1" value={formData.PerUserLimit}
                                        onChange={e => setFormData({ ...formData, PerUserLimit: e.target.value })} />
                                </div>
                                <div className="v-form-group">
                                    <label>Phạm vi hiển thị</label>
                                    <select value={formData.Visibility} onChange={e => setFormData({ ...formData, Visibility: e.target.value })}>
                                        <option value="public">Công khai (user tự lưu)</option>
                                        <option value="private">Riêng tư (chỉ tặng)</option>
                                    </select>
                                </div>
                                <div className="v-form-group">
                                    <label>Bắt đầu</label>
                                    <input type="datetime-local" value={formData.StartDate}
                                        onChange={e => setFormData({ ...formData, StartDate: e.target.value })} />
                                </div>
                                <div className="v-form-group">
                                    <label>Kết thúc</label>
                                    <input type="datetime-local" value={formData.EndDate}
                                        onChange={e => setFormData({ ...formData, EndDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="v-form-group v-full-width">
                                <label>Mô tả</label>
                                <textarea rows="2" value={formData.Description}
                                    onChange={e => setFormData({ ...formData, Description: e.target.value })}
                                    placeholder="Mô tả ngắn về voucher..." />
                            </div>
                            <div className="v-form-group v-checkbox-group">
                                <label className="v-checkbox-label">
                                    <input type="checkbox" checked={formData.IsActive}
                                        onChange={e => setFormData({ ...formData, IsActive: e.target.checked })} />
                                    <span>Kích hoạt ngay</span>
                                </label>
                            </div>
                            <div className="v-modal-actions">
                                <button type="button" className="v-btn-cancel" onClick={closeModal}>Hủy</button>
                                <button type="submit" className={isEditing ? 'v-btn-save' : 'v-btn-add'}>
                                    {isEditing ? <><Save size={16} /> Lưu</> : <><Plus size={16} /> Tạo</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL TẶNG VOUCHER */}
            {showGiftModal && (
                <div className="v-modal-overlay" onClick={() => setShowGiftModal(false)}>
                    <div className="v-modal-content v-gift-modal" onClick={e => e.stopPropagation()}>
                        <div className="v-modal-header">
                            <h3>🎁 Tặng voucher: <span style={{color:'#EE4D2D'}}>{giftVoucherCode}</span></h3>
                            <button className="v-modal-close" onClick={() => setShowGiftModal(false)}><X size={20} /></button>
                        </div>
                        <div className="v-gift-body">
                            <div className="v-gift-modes">
                                <label className={`v-gift-mode-btn ${giftMode === 'specific' ? 'active' : ''}`}>
                                    <input type="radio" hidden checked={giftMode === 'specific'} onChange={() => setGiftMode('specific')} />
                                    <Users size={16} /> Chọn user cụ thể
                                </label>
                                <label className={`v-gift-mode-btn ${giftMode === 'random' ? 'active' : ''}`}>
                                    <input type="radio" hidden checked={giftMode === 'random'} onChange={() => setGiftMode('random')} />
                                    🎲 Ngẫu nhiên
                                </label>
                                <label className={`v-gift-mode-btn ${giftMode === 'birthday' ? 'active' : ''}`}>
                                    <input type="radio" hidden checked={giftMode === 'birthday'} onChange={() => setGiftMode('birthday')} />
                                    🎂 Sinh nhật hôm nay
                                </label>
                            </div>

                            {giftMode === 'specific' && (
                                <div className="v-gift-user-list">
                                    <div className="v-gift-user-search"><Users size={14} /> {allUsers.length} người dùng — Đã chọn: {giftUserIds.length}</div>
                                    <div className="v-gift-user-scroll">
                                        {allUsers.map(u => (
                                            <label key={u.UserID} className={`v-gift-user-item ${giftUserIds.includes(u.UserID) ? 'selected' : ''}`}>
                                                <input type="checkbox" hidden checked={giftUserIds.includes(u.UserID)} onChange={() => toggleGiftUser(u.UserID)} />
                                                <div className="v-gift-user-avatar">{(u.FullName || 'U')[0].toUpperCase()}</div>
                                                <div>
                                                    <div className="v-gift-user-name">{u.FullName}</div>
                                                    <div className="v-gift-user-email">{u.Email}</div>
                                                </div>
                                                {giftUserIds.includes(u.UserID) && <span className="v-gift-check">✓</span>}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {giftMode === 'random' && (
                                <div className="v-gift-random">
                                    <label>Số lượng tặng ngẫu nhiên</label>
                                    <input type="number" min="1" max="1000" value={giftRandomCount}
                                        onChange={e => setGiftRandomCount(Number(e.target.value))}
                                        className="v-gift-count-input" />
                                    <p className="v-gift-hint">🎲 Hệ thống sẽ tự động chọn ngẫu nhiên {giftRandomCount} người dùng chưa có voucher này.</p>
                                </div>
                            )}

                            {giftMode === 'birthday' && (
                                <div className="v-gift-birthday-info">
                                    🎂 Hệ thống sẽ tặng voucher cho tất cả user có <strong>ngày sinh nhật hôm nay</strong>. Đảm bảo user đã điền Ngày sinh trong hồ sơ.
                                </div>
                            )}
                        </div>
                        <div className="v-modal-actions">
                            <button className="v-btn-cancel" onClick={() => setShowGiftModal(false)}>Hủy</button>
                            <button className="v-btn-add" onClick={handleGift} disabled={giftLoading}>
                                {giftLoading ? <Loader2 className="v-spin" size={16} /> : <Gift size={16} />}
                                {giftLoading ? 'Đang tặng...' : 'Xác nhận tặng'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherManager;
