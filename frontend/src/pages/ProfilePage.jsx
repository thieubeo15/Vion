import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Package, Camera, Lock, Loader2, CheckCircle, AlertTriangle, LayoutDashboard, X, Ticket, Copy, Tag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    
    // State dữ liệu
    const [userData, setUserData] = useState({ FullName: '', Email: '', Phone: '', Address: '', Role: '' });
    const [displayName, setDisplayName] = useState(''); 
    const [passData, setPassData] = useState({ 
        current_password: '', 
        new_password: '', 
        new_password_confirmation: '' 
    });
    
    // State UI
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // State Voucher
    const [myVouchers, setMyVouchers] = useState([]);
    const [publicVouchers, setPublicVouchers] = useState([]);
    const [voucherLoading, setVoucherLoading] = useState(false);

    const API_BASE_URL = 'http://127.0.0.1:8000';
    const token = localStorage.getItem('vion_token');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/user`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(res.data);
                setDisplayName(res.data.FullName || '');
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        if (token) fetchProfile();
    }, [token]);

    const triggerToast = (msg, type = 'success') => {
        setToast({ show: true, message: msg, type: type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };

    // Xử lý Cập nhật Hồ sơ
    const handleUpdateProfile = async () => {
        setShowConfirm(false);
        setIsSaving(true);
        try {
            const res = await axios.put(`${API_BASE_URL}/api/user/update`, userData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                triggerToast("Hồ sơ đã được cập nhật thành công!");
                setDisplayName(userData.FullName);
            }
        } catch (err) {
            triggerToast(err.response?.data?.message || "Lỗi cập nhật!", "error");
        } finally { setIsSaving(false); }
    };

    // Xử lý Đổi mật khẩu (Đủ 3 trường)
    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        // Kiểm tra khớp mật khẩu ở Frontend
        if (passData.new_password !== passData.new_password_confirmation) {
            triggerToast("Mật khẩu xác nhận không khớp!", "error");
            return;
        }

        setIsSaving(true);
        try {
            await axios.put(`${API_BASE_URL}/api/user/change-password`, passData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            triggerToast("Đổi mật khẩu thành công! 🔐");
            setPassData({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err) {
            triggerToast(err.response?.data?.message || "Mật khẩu cũ không đúng!", "error");
        } finally { setIsSaving(false); }
    };

    // Fetch voucher của user + voucher public
    const fetchMyVouchers = async () => {
        setVoucherLoading(true);
        try {
            const [myRes, pubRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/my-vouchers`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/vouchers/public`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setMyVouchers(myRes.data.data || []);
            setPublicVouchers(pubRes.data.data || []);
        } catch (err) { console.error(err); }
        finally { setVoucherLoading(false); }
    };

    const handleSaveVoucher = async (voucherId) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/vouchers/${voucherId}/save`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                triggerToast('Đã lưu voucher vào ví! 🏷️');
                fetchMyVouchers();
            }
        } catch (err) {
            triggerToast(err.response?.data?.message || 'Lỗi lưu voucher!', 'error');
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        triggerToast(`Đã sao chép mã ${code}!`);
    };

    const formatVoucherValue = (v) => {
        const type = v.type || v.Type;
        const val = v.value !== undefined ? v.value : v.Value;
        if (type === 'percent') {
            const max = v.max_discount || v.MaxDiscount;
            return `Giảm ${val}%${max ? ` (tối đa ${Number(max).toLocaleString()}đ)` : ''}`;
        }
        if (type === 'freeship') {
            return Number(val) > 0 ? `Freeship tối đa ${Number(val).toLocaleString()}đ` : 'Freeship 100%';
        }
        return `Giảm ${Number(val).toLocaleString()}đ`;
    };

    const getVoucherStatusBadge = (v) => {
        if (v.is_used) return { label: 'Đã dùng', cls: 'v-badge-used' };
        if (v.is_expired || v.status === 'expired') return { label: 'Hết hạn', cls: 'v-badge-expired' };
        if (!v.is_active) return { label: 'Ngừng HĐ', cls: 'v-badge-used' };
        return { label: 'Còn dùng được', cls: 'v-badge-active' };
    };

    const getSourceBadge = (source) => {
        const map = {
            saved: { label: 'Đã lưu', cls: 'v-badge-saved' },
            gifted: { label: 'Được tặng', cls: 'v-badge-gifted' },
            birthday: { label: 'Sinh nhật 🎂', cls: 'v-badge-birthday' },
            event: { label: 'Sự kiện', cls: 'v-badge-event' },
        };
        return map[source] || { label: source, cls: 'v-badge-saved' };
    };

    if (loading) return <div className="vion-loading-box">Vion Era đang tải dữ liệu...</div>;

    return (
        <div className="vion-profile-page">
            {/* THÔNG BÁO TOAST */}
            {toast.show && (
                <div className={`vion-toast ${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* MODAL XÁC NHẬN KHI LƯU HỒ SƠ */}
            {showConfirm && (
                <div className="vion-modal-overlay">
                    <div className="vion-confirm-card">
                        <AlertTriangle size={32} color="#EE4D2D" />
                        <h3>Xác nhận lưu hồ sơ?</h3>
                        <p>Dữ liệu cá nhân của bạn sẽ được cập nhật trên toàn hệ thống Vion.</p>
                        <div className="modal-actions">
                            <button className="btn-no" onClick={() => setShowConfirm(false)}>Hủy bỏ</button>
                            <button className="btn-yes" onClick={handleUpdateProfile}>Đồng ý lưu</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="vion-profile-container" style={{ maxWidth: '1000px', margin: '0 auto 10px', padding: '0 20px' }}>
                <div className="v-profile-back" onClick={() => navigate('/')}>
                    <ArrowLeft size={18} /> <span>Quay lại Trang chủ</span>
                </div>
            </div>

            <div className="vion-profile-wrapper">
                {/* SIDEBAR */}
                <aside className="vion-sidebar">
                    <div className="vion-user-card">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=111&color=fff`} alt="Avatar" />
                        <div>
                            <p className="v-name-sidebar">{displayName}</p>
                            <p className="v-role-badge">{userData.Role === 'Admin' ? 'Quản trị viên' : 'Thành viên Vion'}</p>
                        </div>
                    </div>

                    <nav className="vion-nav-list">
                        {userData.Role === 'Admin' && (
                            <div className="v-nav-item admin-btn" onClick={() => navigate('/admin')}>
                                <LayoutDashboard size={18} /> <strong>Trang quản trị</strong>
                            </div>
                        )}
                        <div className={`v-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                            <User size={18} /> Hồ sơ của tôi
                        </div>
                        <div className={`v-nav-item ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
                            <Lock size={18} /> Đổi mật khẩu
                        </div>
                        <div className="v-nav-item" onClick={() => navigate('/orders')}>
                            <Package size={18} /> Đơn mua của tôi
                        </div>
                        <div className={`v-nav-item ${activeTab === 'vouchers' ? 'active' : ''}`} onClick={() => { setActiveTab('vouchers'); fetchMyVouchers(); }}>
                            <Ticket size={18} /> Voucher của tôi
                        </div>
                    </nav>
                </aside>

                {/* NỘI DUNG CHÍNH */}
                <main className="vion-profile-main">
                    <div className="v-main-header">
                        <h2>{activeTab === 'profile' ? 'Thiết lập hồ sơ' : activeTab === 'password' ? 'Bảo mật tài khoản' : 'Voucher của tôi'}</h2>
                    </div>

                    {activeTab === 'profile' ? (
                        <form className="vion-form" onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }}>
                            <div className="v-form-row"><label>Họ tên</label><input type="text" value={userData.FullName} onChange={(e) => setUserData({...userData, FullName: e.target.value})} /></div>
                            <div className="v-form-row"><label>Email</label><div className="v-email-lock">{userData.Email}</div></div>
                            <div className="v-form-row"><label>Số điện thoại</label><input type="text" value={userData.Phone} onChange={(e) => setUserData({...userData, Phone: e.target.value})} /></div>
                            <div className="v-form-row"><label>Địa chỉ</label><textarea value={userData.Address} onChange={(e) => setUserData({...userData, Address: e.target.value})} /></div>
                            <div className="v-form-row"><label>Ngày sinh</label><input type="date" value={userData.Birthday || ''} onChange={(e) => setUserData({...userData, Birthday: e.target.value})} /></div>
                            <div className="v-form-footer">
                                <button type="submit" className="v-btn-mini-save" disabled={isSaving}>{isSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}</button>
                            </div>
                        </form>
                    ) : activeTab === 'password' ? (
                        <form className="vion-form" onSubmit={handleChangePassword}>
                            <div className="v-form-row">
                                <label>Mật khẩu cũ</label>
                                <input type="password" required value={passData.current_password} onChange={(e) => setPassData({...passData, current_password: e.target.value})} />
                            </div>
                            <div className="v-form-row">
                                <label>Mật khẩu mới</label>
                                <input type="password" required value={passData.new_password} onChange={(e) => setPassData({...passData, new_password: e.target.value})} />
                            </div>
                            <div className="v-form-row">
                                <label>Xác nhận lại</label>
                                <input type="password" required value={passData.new_password_confirmation} onChange={(e) => setPassData({...passData, new_password_confirmation: e.target.value})} />
                            </div>
                            <div className="v-form-footer">
                                <button type="submit" className="v-btn-mini-save" disabled={isSaving}>{isSaving ? 'Đang xử lý...' : 'Đổi mật khẩu'}</button>
                            </div>
                        </form>
                    ) : (
                        <div className="v-voucher-tab">
                            {voucherLoading ? (
                                <div className="v-voucher-empty"><Loader2 className="v-spin" size={24} /> Đang tải...</div>
                            ) : (
                                <>
                                    {/* VOUCHER CỦA TÔI */}
                                    <div className="v-voucher-section-title">🏷️ Voucher của tôi ({myVouchers.length})</div>
                                    {myVouchers.length === 0 ? (
                                        <div className="v-voucher-empty">Bạn chưa có voucher nào. Hãy lưu voucher bên dưới!</div>
                                    ) : (
                                        <div className="v-voucher-list">
                                            {myVouchers.map(v => {
                                                const status = getVoucherStatusBadge(v);
                                                const source = getSourceBadge(v.source);
                                                return (
                                                    <div key={v.id} className={`v-voucher-card ${v.is_used || v.is_expired ? 'v-voucher-card--dim' : ''}`}>
                                                        <div className="v-voucher-card-header">
                                                            <span className="v-voucher-code">{v.code}</span>
                                                            <div className="v-voucher-badges">
                                                                <span className={`v-voucher-badge ${source.cls}`}>{source.label}</span>
                                                                <span className={`v-voucher-badge ${status.cls}`}>{status.label}</span>
                                                            </div>
                                                        </div>
                                                        <div className="v-voucher-card-body">
                                                            <div className="v-voucher-value">{formatVoucherValue(v)}</div>
                                                            {v.min_order > 0 && <div className="v-voucher-min">Đơn tối thiểu: {Number(v.min_order).toLocaleString()}đ</div>}
                                                            {v.description && <div className="v-voucher-desc">{v.description}</div>}
                                                            <div className="v-voucher-expiry">HSD: {v.end_date ? new Date(v.end_date).toLocaleDateString('vi-VN') : '—'}</div>
                                                        </div>
                                                        <div className="v-voucher-card-footer">
                                                            <button className="v-voucher-copy-btn" onClick={() => handleCopyCode(v.code)}>
                                                                <Copy size={13} /> Sao chép mã
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* VOUCHER CÓ THỂ LƯU */}
                                    <div className="v-voucher-divider"></div>
                                    <div className="v-voucher-section-title">🎁 Voucher có thể lưu</div>
                                    {(() => {
                                        const savedIds = myVouchers.map(v => v.voucher_id);
                                        const available = publicVouchers.filter(v => !savedIds.includes(v.VoucherID));
                                        return available.length === 0 ? (
                                            <div className="v-voucher-empty">Hiện không có voucher công khai nào để lưu.</div>
                                        ) : (
                                            <div className="v-voucher-list">
                                                {available.map(v => (
                                                    <div key={v.VoucherID} className="v-voucher-card">
                                                        <div className="v-voucher-card-header">
                                                            <span className="v-voucher-code">{v.Code}</span>
                                                            <span className="v-voucher-badge v-badge-active">Công khai</span>
                                                        </div>
                                                        <div className="v-voucher-card-body">
                                                            <div className="v-voucher-value">{formatVoucherValue(v)}</div>
                                                            {v.MinOrderAmount > 0 && <div className="v-voucher-min">Đơn tối thiểu: {Number(v.MinOrderAmount).toLocaleString()}đ</div>}
                                                            {v.Description && <div className="v-voucher-desc">{v.Description}</div>}
                                                            <div className="v-voucher-expiry">HSD: {v.EndDate ? new Date(v.EndDate).toLocaleDateString('vi-VN') : '—'}</div>
                                                        </div>
                                                        <div className="v-voucher-card-footer">
                                                            <button className="v-voucher-save-btn" onClick={() => handleSaveVoucher(v.VoucherID)}>
                                                                <Tag size={13} /> Lưu voucher
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;