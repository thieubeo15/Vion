import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
    Search, Plus, Edit2, Trash2, UserPlus, 
    ChevronLeft, ChevronRight, Mail, Phone, 
    MapPin, Calendar, Shield, X 
} from 'lucide-react';
import './UserManager.css';

const UserManager = () => {
    const token = localStorage.getItem('vion_token');
    const currentUser = JSON.parse(localStorage.getItem('vion_user') || '{}');

    // States cho dữ liệu và bộ lọc
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // States cho Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        Email: '',
        Password: '',
        FullName: '',
        Phone: '',
        Address: '',
        Birthday: '',
        Role: 'Customer'
    });

    // Lấy danh sách users
    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/users`, {
                params: {
                    page: page,
                    search: search,
                    role: roleFilter
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUsers(response.data.data.data);
                setCurrentPage(response.data.data.current_page);
                setLastPage(response.data.data.last_page);
                setTotalUsers(response.data.data.total);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Lỗi!', 'Không thể tải danh sách người dùng.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Gọi fetchUsers khi thay đổi bộ lọc hoặc trang
    useEffect(() => {
        fetchUsers(1);
    }, [roleFilter, search]);

    // Handle thay đổi form input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Mở modal thêm
    const openAddModal = () => {
        setFormData({
            Email: '',
            Password: '',
            FullName: '',
            Phone: '',
            Address: '',
            Birthday: '',
            Role: 'Customer'
        });
        setShowAddModal(true);
    };

    // Mở modal sửa
    const openEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            Email: user.Email || '',
            Password: '', // Để trống, chỉ điền nếu muốn đổi mật khẩu
            FullName: user.FullName || '',
            Phone: user.Phone || '',
            Address: user.Address || '',
            Birthday: user.Birthday || '',
            Role: user.Role || 'Customer'
        });
        setShowEditModal(true);
    };

    // Submit thêm user
    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/admin/users`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                Swal.fire({
                    title: 'Thành công!',
                    text: response.data.message,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                setShowAddModal(false);
                fetchUsers(currentPage);
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản.';
            Swal.fire('Thất bại', msg, 'error');
        }
    };

    // Submit sửa user
    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://127.0.0.1:8000/api/admin/users/${selectedUser.UserID}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                Swal.fire({
                    title: 'Thành công!',
                    text: response.data.message,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                setShowEditModal(false);
                // Nếu sửa thông tin của chính mình, cập nhật lại localStorage
                if (selectedUser.UserID === currentUser.UserID) {
                    localStorage.setItem('vion_user', JSON.stringify(response.data.user));
                }
                fetchUsers(currentPage);
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.';
            Swal.fire('Thất bại', msg, 'error');
        }
    };

    // Xóa user
    const handleDeleteUser = async (user) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: `Tài khoản ${user.FullName} (${user.Email}) sẽ bị xóa vĩnh viễn khỏi hệ thống!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EE4D2D',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Đồng ý xóa',
            cancelButtonText: 'Hủy bỏ'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(`http://127.0.0.1:8000/api/admin/users/${user.UserID}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.success) {
                        Swal.fire('Đã xóa!', response.data.message, 'success');
                        fetchUsers(currentPage);
                    }
                } catch (error) {
                    console.error(error);
                    const msg = error.response?.data?.message || 'Không thể xóa người dùng này.';
                    Swal.fire('Thất bại', msg, 'error');
                }
            }
        });
    };

    // Format ngày sinh
    const formatDate = (dateStr) => {
        if (!dateStr) return '---';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="v-user-manager">
            {/* Header */}
            <div className="v-manager-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="v-title mb-1">Quản lý Thành viên</h2>
                    <p className="v-subtitle text-muted mb-0">Hệ thống phân quyền & quản lý tài khoản người dùng ({totalUsers})</p>
                </div>
                <button className="v-add-btn btn d-flex align-items-center gap-2" onClick={openAddModal}>
                    <UserPlus size={18} />
                    <span>Thêm Thành viên</span>
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="v-filter-card card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-8 col-lg-9">
                            <div className="v-search-box position-relative">
                                <Search className="v-search-icon text-muted" size={18} />
                                <input
                                    type="text"
                                    className="form-control ps-5"
                                    placeholder="Tìm kiếm theo Tên, Email hoặc Số điện thoại..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-4 col-lg-3">
                            <select
                                className="form-select"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="">Tất cả Vai trò</option>
                                <option value="Admin">Admin</option>
                                <option value="Customer">Khách hàng</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Users Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">Thành viên</th>
                                    <th>Liên hệ</th>
                                    <th>Thông tin cá nhân</th>
                                    <th>Vai trò</th>
                                    <th>Ngày tham gia</th>
                                    <th className="text-end pe-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2 text-muted mb-0">Đang tải danh sách người dùng...</p>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <p className="text-muted mb-0">Không tìm thấy người dùng nào phù hợp.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.UserID}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="v-avatar d-flex align-items-center justify-content-center">
                                                        {user.FullName ? user.FullName.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div>
                                                        <h6 className="v-user-name mb-0">
                                                            {user.FullName} 
                                                            {user.UserID === currentUser.UserID && (
                                                                <span className="badge bg-secondary ms-2 small-badge">Tôi</span>
                                                            )}
                                                        </h6>
                                                        <span className="v-user-email text-muted small">{user.Email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="v-contact-info d-flex flex-column gap-1">
                                                    <span className="small d-flex align-items-center gap-1">
                                                        <Phone size={12} className="text-muted" /> 
                                                        {user.Phone || '---'}
                                                    </span>
                                                    <span className="small text-muted d-flex align-items-center gap-1">
                                                        <MapPin size={12} /> 
                                                        <span className="text-truncate" style={{maxWidth: '180px'}} title={user.Address}>
                                                            {user.Address || 'Chưa cập nhật'}
                                                        </span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="small d-flex align-items-center gap-1">
                                                    <Calendar size={12} className="text-muted" />
                                                    Sinh nhật: {formatDate(user.Birthday)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge v-role-badge ${user.Role === 'Admin' ? 'bg-danger-light text-danger' : 'bg-success-light text-success'}`}>
                                                    <Shield size={12} className="me-1" />
                                                    {user.Role === 'Admin' ? 'Admin' : 'Khách hàng'}
                                                </span>
                                            </td>
                                            <td className="small text-muted">
                                                {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button 
                                                        className="btn btn-sm btn-light-edit btn-action"
                                                        onClick={() => openEditModal(user)}
                                                        title="Chỉnh sửa thông tin"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    {user.UserID !== currentUser.UserID && (
                                                        <button 
                                                            className="btn btn-sm btn-light-danger btn-action"
                                                            onClick={() => handleDeleteUser(user)}
                                                            title="Xóa tài khoản"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination Controls */}
            {!loading && lastPage > 1 && (
                <div className="v-pagination-wrap d-flex justify-content-between align-items-center mt-4">
                    <span className="small text-muted">Trang {currentPage} / {lastPage}</span>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                            disabled={currentPage === 1}
                            onClick={() => fetchUsers(currentPage - 1)}
                        >
                            <ChevronLeft size={16} /> Trước
                        </button>
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                            disabled={currentPage === lastPage}
                            onClick={() => fetchUsers(currentPage + 1)}
                        >
                            Sau <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL THÊM THÀNH VIÊN */}
            {showAddModal && (
                <div className="v-modal-overlay">
                    <div className="v-modal card border-0 shadow-lg">
                        <div className="v-modal-header d-flex justify-content-between align-items-center p-3 border-bottom">
                            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                <UserPlus className="text-primary" size={20} /> Thêm Thành Viên Mới
                            </h5>
                            <button className="btn border-0 p-1" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="v-modal-body p-3">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Họ và tên *</label>
                                        <input
                                            type="text"
                                            name="FullName"
                                            className="form-control"
                                            required
                                            value={formData.FullName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Email *</label>
                                        <input
                                            type="email"
                                            name="Email"
                                            className="form-control"
                                            required
                                            value={formData.Email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Mật khẩu *</label>
                                        <input
                                            type="password"
                                            name="Password"
                                            className="form-control"
                                            required
                                            minLength="6"
                                            value={formData.Password}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Số điện thoại</label>
                                        <input
                                            type="text"
                                            name="Phone"
                                            className="form-control"
                                            value={formData.Phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Ngày sinh</label>
                                        <input
                                            type="date"
                                            name="Birthday"
                                            className="form-control"
                                            value={formData.Birthday}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Địa chỉ</label>
                                        <input
                                            type="text"
                                            name="Address"
                                            className="form-control"
                                            value={formData.Address}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Vai trò (Phân quyền) *</label>
                                        <select
                                            name="Role"
                                            className="form-select"
                                            value={formData.Role}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Customer">Khách hàng</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="v-modal-footer d-flex justify-content-end gap-2 p-3 border-top bg-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary px-4">Tạo tài khoản</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL SỬA THÀNH VIÊN */}
            {showEditModal && (
                <div className="v-modal-overlay">
                    <div className="v-modal card border-0 shadow-lg">
                        <div className="v-modal-header d-flex justify-content-between align-items-center p-3 border-bottom">
                            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                <Edit2 className="text-primary" size={18} /> Cập nhật Thành Viên
                            </h5>
                            <button className="btn border-0 p-1" onClick={() => setShowEditModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditUser}>
                            <div className="v-modal-body p-3">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Họ và tên *</label>
                                        <input
                                            type="text"
                                            name="FullName"
                                            className="form-control"
                                            required
                                            value={formData.FullName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Email *</label>
                                        <input
                                            type="email"
                                            name="Email"
                                            className="form-control"
                                            required
                                            value={formData.Email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Mật khẩu mới (Bỏ trống nếu không đổi)</label>
                                        <input
                                            type="password"
                                            name="Password"
                                            className="form-control"
                                            placeholder="••••••••"
                                            minLength="6"
                                            value={formData.Password}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Số điện thoại</label>
                                        <input
                                            type="text"
                                            name="Phone"
                                            className="form-control"
                                            value={formData.Phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Ngày sinh</label>
                                        <input
                                            type="date"
                                            name="Birthday"
                                            className="form-control"
                                            value={formData.Birthday}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Địa chỉ</label>
                                        <input
                                            type="text"
                                            name="Address"
                                            className="form-control"
                                            value={formData.Address}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold">Vai trò (Phân quyền) *</label>
                                        <select
                                            name="Role"
                                            className="form-select"
                                            value={formData.Role}
                                            onChange={handleInputChange}
                                            disabled={selectedUser?.UserID === currentUser.UserID} // Chặn tự hạ quyền ở UI
                                        >
                                            <option value="Customer">Khách hàng</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                        {selectedUser?.UserID === currentUser.UserID && (
                                            <span className="text-danger small mt-1 d-block">Bạn không thể tự đổi vai trò của chính mình.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="v-modal-footer d-flex justify-content-end gap-2 p-3 border-top bg-light">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Hủy</button>
                                <button type="submit" className="btn btn-primary px-4">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;
