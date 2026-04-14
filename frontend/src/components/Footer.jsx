import React from 'react';
import './Footer.css';
// Thay các icon thương hiệu bằng các icon UI cơ bản chắc chắn có
import { Globe, Mail, Phone, MapPin } from 'lucide-react'; 

const Footer = () => {
    return (
        <footer className="vion-footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <h2 className="footer-logo">VION.</h2>
                    <p>Thương hiệu thời trang dẫn đầu xu hướng cho giới trẻ Việt Nam. Tinh tế trong từng đường kim mũi chỉ.</p>
                    <div className="footer-socials">
                        {/* Tạm thời dùng icon Globe (quả địa cầu) để thay cho mạng xã hội */}
                        <Globe size={20} /> 
                        <Globe size={20} />
                        <Globe size={20} />
                    </div>
                </div>

                <div className="footer-links">
                    <h4>VỀ CHÚNG TÔI</h4>
                    <ul>
                        <li>Giới thiệu</li>
                        <li>Tuyển dụng</li>
                        <li>Hệ thống cửa hàng</li>
                    </ul>
                </div>

                <div className="footer-links">
                    <h4>HỖ TRỢ</h4>
                    <ul>
                        <li>Chính sách đổi trả</li>
                        <li>Hướng dẫn chọn size</li>
                        <li>Thanh toán</li>
                    </ul>
                </div>

                <div className="footer-links">
                    <h4>LIÊN HỆ</h4>
                    <ul className="footer-contact">
                        <li style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <MapPin size={16} /> Đống Đa, Hà Nội
                        </li>
                        <li style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <Phone size={16} /> 1900 1234
                        </li>
                        <li style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <Mail size={16} /> support@vion.vn
                        </li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                © 2026 VION VIETNAM. ALL RIGHTS RESERVED.
            </div>
        </footer>
    );
};

export default Footer;