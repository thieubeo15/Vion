import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, RefreshCw, Ticket, Edit2, X, Save, Search, Loader2, ToggleLeft, ToggleRight, Gift, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import './VoucherManager.css';

const cleanVoucherCode = (val) => {
    if (!val) return '';
    return val
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
};

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
    const [giftMode, setGiftMode] = useState('all');
    const [giftRandomCount, setGiftRandomCount] = useState(10);
    const [giftLoading, setGiftLoading] = useState(false);

    const [showUsagesModal, setShowUsagesModal] = useState(false);
    const [usagesList, setUsagesList] = useState([]);
    const [usagesLoading, setUsagesLoading] = useState(false);
    const [usagesVoucherCode, setUsagesVoucherCode] = useState('');

    const token = localStorage.getItem('vion_token');
    const API_URL = 'http://127.0.0.1:8000/api/vouchers';

    const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false,
        timer: 3000, timerProgressBar: true,
    });

    const fetchVouchers = async () => {
        if (vouchers.length === 0) setLoading(true);
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
        setEditId(voucher.VoucherID || voucher.id || voucher.ID);
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
        const id = voucher.VoucherID || voucher.id;
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

    const openUsagesModal = async (voucher) => {
        const id = voucher.VoucherID || voucher.id;
        setUsagesVoucherCode(voucher.Code);
        setShowUsagesModal(true);
        setUsagesLoading(true);
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/vouchers/${id}/usages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsagesList(res.data.data || []);
        } catch (err) {
            console.error("Lỗi lấy lịch sử sử dụng:", err);
            setUsagesList([]);
        } finally {
            setUsagesLoading(false);
        }
    };

    const openGiftModal = (voucher) => {
        setGiftVoucherId(voucher.VoucherID || voucher.id);
        setGiftVoucherCode(voucher.Code);
        setGiftMode('all');
        setGiftRandomCount(10);
        setShowGiftModal(true);
    };

    const handleGift = async () => {
        setGiftLoading(true);
        try {
            const res = await axios.post(`http://127.0.0.1:8000/api/vouchers/${giftVoucherId}/gift-segment`, {
                segment: giftMode,
                count: giftMode === 'random' ? giftRandomCount : undefined
            }, { headers: { Authorization: `Bearer ${token}` } });
            
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
        if (voucher.Type === 'freeship') {
            return Number(voucher.Value) > 0 ? `Freeship tối đa ${Number(voucher.Value).toLocaleString()}đ` : 'Freeship 100%';
        }
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
                        {loading && vouchers.length === 0 ? (
                            <tr><td colSpan="8" className="v-loading"><Loader2 className="v-spin" /> Đang tải...</td></tr>
                        ) : filteredVouchers.length === 0 ? (
                            <tr><td colSpan="8" className="v-loading">Không tìm thấy voucher nào</td></tr>
                        ) : filteredVouchers.map(v => {
                            const status = getStatus(v);
                            return (
                                <tr key={v.VoucherID || v.id || v.ID} className="v-row-parent">
                                    <td className="v-voucher-code-cell">{v.Code}</td>
                                    <td>{v.Type === 'percent' ? 'Phần trăm' : v.Type === 'freeship' ? 'Miễn phí ship' : 'Cố định'}</td>
                                    <td className="fw-700">{formatValue(v)}</td>
                                    <td>{v.MinOrderAmount ? `${Number(v.MinOrderAmount).toLocaleString()}đ` : '—'}</td>
                                    <td>
                                        <span 
                                            className="v-usage-badge clickable"
                                            onClick={() => openUsagesModal(v)}
                                            title="Xem danh sách người dùng đã áp dụng"
                                            style={{ cursor: 'pointer' }}
                                        >
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
                                        <button onClick={() => handleDelete(v.VoucherID || v.id)} className="v-del-icon"><Trash2 size={16} /></button>
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
                                        onChange={e => setFormData({ ...formData, Code: cleanVoucherCode(e.target.value) })}
                                        placeholder="VD: GIAM50K" />
                                </div>
                                <div className="v-form-group">
                                    <label>Loại giảm giá</label>
                                    <select value={formData.Type}
                                        onChange={e => setFormData({ ...formData, Type: e.target.value })}>
                                        <option value="fixed">Cố định (VNĐ)</option>
                                        <option value="percent">Phần trăm (%)</option>
                                        <option value="freeship">Miễn phí vận chuyển (Freeship)</option>
                                    </select>
                                </div>
                                <div className="v-form-group">
                                    <label>
                                        {formData.Type === 'percent' ? 'Giá trị (%)' : formData.Type === 'freeship' ? 'Giảm tối đa (0 = Freeship 100%)' : 'Giá trị (VNĐ)'}
                                    </label>
                                    <input type="number" required min="0" value={formData.Value}
                                        onChange={e => setFormData({ ...formData, Value: e.target.value })}
                                        placeholder={formData.Type === 'percent' ? 'VD: 10' : formData.Type === 'freeship' ? 'VD: 20000' : 'VD: 50000'} />
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
                            <div className="v-gift-modes-grid">
                                <label className={`v-gift-mode-card ${giftMode === 'all' ? 'active' : ''}`}>
                                    <input type="radio" hidden checked={giftMode === 'all'} onChange={() => setGiftMode('all')} />
                                    <Users size={18} />
                                    <span>Tất cả khách</span>
                                </label>
                                <label className={`v-gift-mode-card ${giftMode === 'new' ? 'active' : ''}`}>
                                    <input type="radio" hidden checked={giftMode === 'new'} onChange={() => setGiftMode('new')} />
                                    <Plus size={18} />
                                    <span>Khách hàng mới</span>
                                </label>
                                <label className={`v-gift-mode-card ${giftMode === 'loyal' ? 'active' : ''}`}>
                                    <input type="radio" hidden checked={giftMode === 'loyal'} onChange={() => setGiftMode('loyal')} />
                                    <span style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>👑</span>
                                    <span>Thân thiết (VIP)</span>
                                </label>
                                <label className={`v-gift-mode-card ${giftMode === 'zero_orders' ? 'active' : ''}`}>
                                    <input type="radio" hidden checked={giftMode === 'zero_orders'} onChange={() => setGiftMode('zero_orders')} />
                                    <span style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>💤</span>
                                    <span>Chưa mua hàng</span>
                                </label>
                                <label className={`v-gift-mode-card ${giftMode === 'random' ? 'active' : ''}`}>
                                    <input type="radio" hidden checked={giftMode === 'random'} onChange={() => setGiftMode('random')} />
                                    <span style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>🎲</span>
                                    <span>Ngẫu nhiên</span>
                                </label>
                                <label className={`v-gift-mode-card ${giftMode === 'birthday' ? 'active' : ''}`}>
                                    <input type="radio" hidden checked={giftMode === 'birthday'} onChange={() => setGiftMode('birthday')} />
                                    <span style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>🎂</span>
                                    <span>Sinh nhật hôm nay</span>
                                </label>
                            </div>

                            <div className="v-gift-details-box">
                                {giftMode === 'all' && (
                                    <div className="v-gift-desc all">
                                        <p>🎁 Hệ thống sẽ tặng voucher này cho <strong>tất cả khách hàng</strong> có tài khoản trên cửa hàng (loại trừ quản trị viên Admin).</p>
                                        <p className="v-gift-warning">Lưu ý: Chỉ những người chưa sở hữu voucher này mới được nhận.</p>
                                    </div>
                                )}
                                {giftMode === 'new' && (
                                    <div className="v-gift-desc new">
                                        <p>🆕 Hệ thống sẽ tặng voucher cho <strong>khách hàng đăng ký trong 30 ngày gần đây</strong>.</p>
                                        <p className="v-gift-warning">Thích hợp để kích thích tương tác cho nhóm khách hàng mới.</p>
                                    </div>
                                )}
                                {giftMode === 'loyal' && (
                                    <div className="v-gift-desc loyal">
                                        <p>👑 Hệ thống sẽ tặng voucher cho các <strong>khách hàng VIP</strong> thỏa mãn:</p>
                                        <ul>
                                            <li>Có ít nhất 3 đơn hàng hoàn thành (Status: Completed)</li>
                                            <li>HOẶC tổng số tiền chi tiêu tích lũy từ 1.000.000đ trở lên</li>
                                        </ul>
                                    </div>
                                )}
                                {giftMode === 'zero_orders' && (
                                    <div className="v-gift-desc zero_orders">
                                        <p>💤 Hệ thống sẽ tặng voucher cho các khách hàng <strong>chưa mua đơn hàng nào thành công</strong>.</p>
                                        <p className="v-gift-warning">Thúc đẩy tỷ lệ chuyển đổi khách hàng tiềm năng mua đơn hàng đầu tiên!</p>
                                    </div>
                                )}
                                {giftMode === 'random' && (
                                    <div className="v-gift-random">
                                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#444', display: 'block', marginBottom: '10px' }}>Số lượng tặng ngẫu nhiên</label>
                                        <input type="number" min="1" max="1000" value={giftRandomCount}
                                            onChange={e => setGiftRandomCount(Number(e.target.value))}
                                            className="v-gift-count-input" />
                                        <p className="v-gift-hint">🎲 Hệ thống sẽ tự động chọn ngẫu nhiên {giftRandomCount} khách hàng chưa có voucher này để gửi tặng.</p>
                                    </div>
                                )}
                                {giftMode === 'birthday' && (
                                    <div className="v-gift-birthday-info">
                                        🎂 Hệ thống sẽ tặng voucher cho tất cả khách hàng có <strong>ngày sinh nhật hôm nay</strong>.
                                    </div>
                                )}
                            </div>
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

            {/* MODAL DANH SÁCH NGƯỜI ĐÃ DÙNG */}
            {showUsagesModal && (
                <div className="v-modal-overlay" onClick={() => setShowUsagesModal(false)}>
                    <div className="v-modal-content v-usages-modal" onClick={e => e.stopPropagation()}>
                        <div className="v-modal-header">
                            <h3>📊 Lịch sử sử dụng: <span style={{color:'#EE4D2D'}}>{usagesVoucherCode}</span></h3>
                            <button className="v-modal-close" onClick={() => setShowUsagesModal(false)}><X size={20} /></button>
                        </div>
                        <div className="v-usages-body">
                            {usagesLoading ? (
                                <div className="v-loading" style={{ textAlign: 'center', padding: '30px' }}><Loader2 className="v-spin" style={{ display: 'inline-block', marginRight: '8px' }} /> Đang tải lịch sử sử dụng...</div>
                            ) : usagesList.length === 0 ? (
                                <div className="v-no-data" style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '14px' }}>Chưa có khách hàng nào sử dụng mã giảm giá này.</div>
                            ) : (
                                <div className="v-usages-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table className="v-usages-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                                <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 700, color: '#888' }}>Khách hàng</th>
                                                <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 700, color: '#888' }}>Đơn hàng</th>
                                                <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 700, color: '#888' }}>Tổng tiền</th>
                                                <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 700, color: '#888' }}>Giảm giá</th>
                                                <th style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 700, color: '#888' }}>Ngày dùng</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usagesList.map(usage => (
                                                <tr key={usage.id || usage.ID} style={{ borderBottom: '1px solid #f8f8f8' }}>
                                                    <td style={{ padding: '12px 8px' }}>
                                                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>{usage.user?.FullName || 'Khách vãng lai'}</div>
                                                        <div style={{ fontSize: '11px', color: '#999' }}>{usage.user?.Email || '—'}</div>
                                                    </td>
                                                    <td style={{ padding: '12px 8px' }}>
                                                        <span style={{ fontSize: '12px', background: '#f1f3f5', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>#{usage.OrderID}</span>
                                                    </td>
                                                    <td style={{ padding: '12px 8px', fontSize: '13px' }}>{Number(usage.order?.TotalAmount || 0).toLocaleString()}đ</td>
                                                    <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 700, color: '#e74c3c' }}>-{Number(usage.DiscountAmount || 0).toLocaleString()}đ</td>
                                                    <td style={{ padding: '12px 8px', fontSize: '11px', color: '#666' }}>{formatDate(usage.created_at || usage.CreatedAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="v-modal-actions" style={{ marginTop: '20px' }}>
                            <button className="v-btn-cancel" onClick={() => setShowUsagesModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherManager;
