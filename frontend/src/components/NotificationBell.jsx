import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, Check, ExternalLink } from 'lucide-react';
import './NotificationBell.css';

const NotificationBell = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('vion_token');
    const user = JSON.parse(localStorage.getItem('vion_user') || '{}');

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    
    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.unread_count);
            }
        } catch (error) {
            console.error('Lỗi khi tải thông báo:', error);
        }
    };

    
    const handleMarkAsRead = async (id, redirectUrl) => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNotifications(prev => 
                prev.map(n => n.NotificationID === id ? { ...n, IsRead: true } : n)
            );
            
            setUnreadCount(prev => Math.max(0, prev - 1));
            setIsOpen(false);

            
            if (redirectUrl) {
                navigate(redirectUrl);
            }
        } catch (error) {
            console.error(error);
        }
    };

    
    const handleMarkAllAsRead = async () => {
        try {
            const response = await axios.put('http://127.0.0.1:8000/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, IsRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error(error);
        }
    };

    
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [token]);

    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    
    const formatTimeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHrs / 24);

        if (diffMin < 1) return 'Vừa xong';
        if (diffMin < 60) return `${diffMin} phút trước`;
        if (diffHrs < 24) return `${diffHrs} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    if (!token) return null;

    return (
        <div className="v-notification-bell-container" ref={dropdownRef}>
            
            <button className="v-noti-trigger-btn" onClick={() => setIsOpen(!isOpen)}>
                <Bell size={21} />
                {unreadCount > 0 && (
                    <span className="v-noti-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            
            {isOpen && (
                <div className="v-noti-dropdown shadow-lg">
                    <div className="v-noti-header d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Thông báo</span>
                        {unreadCount > 0 && (
                            <button className="btn-mark-all d-flex align-items-center gap-1" onClick={handleMarkAllAsRead}>
                                <Check size={14} /> Đọc tất cả
                            </button>
                        )}
                    </div>

                    <div className="v-noti-list">
                        {notifications.length === 0 ? (
                            <div className="v-noti-empty text-center py-4 text-muted">
                                Không có thông báo nào.
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div 
                                    key={n.NotificationID} 
                                    className={`v-noti-item ${!n.IsRead ? 'unread' : ''}`}
                                    onClick={() => handleMarkAsRead(n.NotificationID, n.RedirectUrl)}
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="v-noti-item-title fw-bold small">{n.Title}</div>
                                        {!n.IsRead && <span className="v-unread-dot"></span>}
                                    </div>
                                    <div className="v-noti-item-content text-muted small mt-1">
                                        {n.Content}
                                    </div>
                                    <div className="v-noti-item-time text-muted small mt-2">
                                        {formatTimeAgo(n.created_at)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="v-noti-footer text-center">
                        <button 
                            className="btn-view-all text-muted small border-0 bg-transparent w-100 py-2"
                            onClick={() => {
                                setIsOpen(false);
                                navigate(user.Role === 'Admin' ? '/admin/orders' : '/orders');
                            }}
                        >
                            Xem lịch sử đơn hàng <ExternalLink size={12} className="ms-1" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
