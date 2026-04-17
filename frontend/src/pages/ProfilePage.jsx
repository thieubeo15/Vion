import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Package, Camera, Lock, Loader2, CheckCircle, AlertTriangle, LayoutDashboard, X } from 'lucide-react';
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
                        <div className="v-nav-item"><Package size={18} /> Đơn mua của tôi</div>
                    </nav>
                </aside>

                {/* NỘI DUNG CHÍNH */}
                <main className="vion-profile-main">
                    <div className="v-main-header">
                        <h2>{activeTab === 'profile' ? 'Thiết lập hồ sơ' : 'Bảo mật tài khoản'}</h2>
                    </div>

                    {activeTab === 'profile' ? (
                        <form className="vion-form" onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }}>
                            <div className="v-form-row"><label>Họ tên</label><input type="text" value={userData.FullName} onChange={(e) => setUserData({...userData, FullName: e.target.value})} /></div>
                            <div className="v-form-row"><label>Email</label><div className="v-email-lock">{userData.Email}</div></div>
                            <div className="v-form-row"><label>Số điện thoại</label><input type="text" value={userData.Phone} onChange={(e) => setUserData({...userData, Phone: e.target.value})} /></div>
                            <div className="v-form-row"><label>Địa chỉ</label><textarea value={userData.Address} onChange={(e) => setUserData({...userData, Address: e.target.value})} /></div>
                            <div className="v-form-footer">
                                <button type="submit" className="v-btn-mini-save" disabled={isSaving}>{isSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}</button>
                            </div>
                        </form>
                    ) : (
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
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;