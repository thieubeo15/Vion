import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, X, Bot, User, Loader2, Minus } from 'lucide-react';
import './ChatWidget.css';

// Hàm helper để tách phần tin nhắn text và danh sách sản phẩm JSON đính kèm
const parseMessageContent = (content) => {
    if (!content) return { text: '', products: [] };
    const regex = /\[PRODUCTS_JSON:\s*(.*?)\]/s;
    const match = content.match(regex);
    if (match) {
        try {
            const products = JSON.parse(match[1]);
            const textOnly = content.replace(regex, '').trim();
            return { text: textOnly, products };
        } catch (e) {
            console.error("Error parsing products JSON in message:", e);
        }
    }
    return { text: content, products: [] };
};

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState('');

    const messagesEndRef = useRef(null);
    const backendHost = window.location.hostname === 'localhost' ? 'localhost' : '127.0.0.1';
    const API_URL = `http://${backendHost}:8000/api`;

    // 1. Quản lý Session ID & Tải lịch sử chat khi load trang
    useEffect(() => {
        // Lấy hoặc tạo mới session_id cho khách vãng lai
        let sId = localStorage.getItem('vion_chatbot_session');
        if (!sId) {
            sId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('vion_chatbot_session', sId);
        }
        setSessionId(sId);

        fetchChatHistory(sId);
    }, []);

    // Tự động cuộn xuống cuối mỗi khi có tin nhắn mới
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const fetchChatHistory = async (sId) => {
        const token = localStorage.getItem('vion_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        try {
            const res = await axios.get(`${API_URL}/chatbot/history`, {
                params: { session_id: sId },
                headers
            });
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (err) {
            console.error('Lỗi khi lấy lịch sử chat:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput('');

        // Thêm tin nhắn của User vào danh sách hiển thị tạm thời
        const tempUserMessage = {
            id: Date.now(),
            Role: 'user',
            Content: userMsg,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempUserMessage]);
        setIsTyping(true);

        const token = localStorage.getItem('vion_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            const res = await axios.post(`${API_URL}/chatbot/send`, {
                message: userMsg,
                session_id: sessionId
            }, { headers });

            if (res.data.success) {
                // Thêm phản hồi của AI vào danh sách hiển thị
                setMessages(prev => [...prev, res.data.data]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    Role: 'assistant',
                    Content: 'Rất tiếc, Vion Era đang gặp sự cố nhỏ. Bạn vui lòng thử lại sau nhé!'
                }]);
            }
        } catch (err) {
            console.error('Lỗi gửi tin nhắn chatbot:', err);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                Role: 'assistant',
                Content: err.response?.data?.message || 'Không thể kết nối tới máy chủ AI. Xin vui lòng kiểm tra lại kết nối!'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Định dạng thời gian gửi tin nhắn
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const d = new Date(timeStr);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="v-chatbot-wrapper">
            {/* NÚT BÓNG BÓNG CHAT NỔI (FLOAT BUTTON) */}
            {!isOpen && (
                <button className="v-chatbot-toggle shadow-lg" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={28} />
                    <span className="v-chatbot-badge">AI</span>
                </button>
            )}

            {/* KHUNG CỬA SỔ CHAT */}
            {isOpen && (
                <div className="v-chatbot-window shadow-2xl">
                    {/* Header */}
                    <div className="v-chatbot-header d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <div className="v-bot-avatar">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h4 className="v-chatbot-title mb-0">Vion Era Assistant</h4>
                                <small className="v-chatbot-subtitle"><span className="v-online-dot"></span>Trợ lý AI đang trực tuyến</small>
                            </div>
                        </div>
                        <div className="v-chatbot-actions">
                            <button className="v-chatbot-close-btn" onClick={() => setIsOpen(false)}>
                                <Minus size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Chat Body */}
                    <div className="v-chatbot-body">
                        {messages.length === 0 && (
                            <div className="v-chatbot-welcome text-center py-4 px-3">
                                <div className="v-welcome-icon mb-3">
                                    <Bot size={36} />
                                </div>
                                <h5>Xin chào! 👋</h5>
                                <p className="text-muted">
                                    Mình là trợ lý thời trang Vion Era Assistant. Mình có thể giúp bạn kiểm tra giá cả, tìm kiếm quần áo, size đồ hoặc các mẫu màu sắc đang có sẵn. 
                                </p>
                                <div className="v-suggested-prompts">
                                    <button onClick={() => setInput('Tìm các mẫu áo phông còn hàng')}>🔍 Tìm áo phông</button>
                                    <button onClick={() => setInput('Có mẫu đầm nào mới không?')}>👗 Đầm mới nhất</button>
                                    <button onClick={() => setInput('Shop còn mẫu nào size L không?')}>📏 Check size L</button>
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => {
                            const { text, products } = parseMessageContent(msg.Content);
                            return (
                                <div key={msg.id} className={`v-chat-msg-row-wrapper ${msg.Role === 'user' ? 'user-side' : 'bot-side'}`}>
                                    <div className={`v-chat-msg-row ${msg.Role === 'user' ? 'user-side' : 'bot-side'}`}>
                                        <div className="v-chat-avatar">
                                            {msg.Role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                        </div>
                                        <div className="v-chat-msg-bubble shadow-sm">
                                            <div className="v-chat-msg-text">
                                                {text.split('\n').map((line, idx) => (
                                                    <p key={idx} className="mb-1">{line}</p>
                                                ))}
                                            </div>
                                            <span className="v-chat-msg-time">{formatTime(msg.created_at || msg.id)}</span>
                                        </div>
                                    </div>
                                    
                                    {/* HIỂN THỊ DANH SÁCH SẢN PHẨM DẠNG CARD NẾU CÓ */}
                                    {msg.Role === 'assistant' && products && products.length > 0 && (
                                        <div className="v-chatbot-products-list d-flex flex-column gap-2 mt-2">
                                            {products.map((prod) => {
                                                return (
                                                    <div key={prod.id} className="v-product-card-mini d-flex align-items-center gap-2 p-2 shadow-sm">
                                                        <Link 
                                                            to={`/product/${prod.id}`} 
                                                            className="v-product-card-click-area d-flex align-items-center gap-2 flex-grow-1 text-decoration-none"
                                                            style={{ color: 'inherit', minWidth: 0 }}
                                                        >
                                                            <div className="v-product-card-info flex-grow-1" style={{ minWidth: 0 }}>
                                                                <h6 className="v-product-card-title mb-0 text-truncate">{prod.name}</h6>
                                                                <span className="v-product-card-price">{prod.price ? `${prod.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}</span>
                                                            </div>
                                                        </Link>
                                                        <Link 
                                                            to={`/product/${prod.id}`} 
                                                            className="v-product-card-link-btn"
                                                        >
                                                            Xem
                                                        </Link>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* AI ĐANG GÕ (TYPING INDICATOR) */}
                        {isTyping && (
                            <div className="v-chat-msg-row bot-side">
                                <div className="v-chat-avatar">
                                    <Bot size={14} />
                                </div>
                                <div className="v-chat-msg-bubble v-typing-bubble shadow-sm">
                                    <div className="v-typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Footer/Input */}
                    <form className="v-chatbot-footer" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Hỏi Vion Era về sản phẩm, giá cả..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isTyping}
                            autoFocus
                        />
                        <button type="submit" className="v-chatbot-send-btn" disabled={!input.trim() || isTyping}>
                            {isTyping ? <Loader2 size={18} className="v-spin" /> : <Send size={18} />}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
