import React, { useState } from 'react';
import './SupportPage.css';
import { HelpCircle, RefreshCw, Truck, Shield, Phone, Mail, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const SupportPage = () => {
    const [activeTab, setActiveTab] = useState('faq'); 
    const [expandedFaq, setExpandedFaq] = useState(null);

    const toggleFaq = (index) => {
        if (expandedFaq === index) {
            setExpandedFaq(null);
        } else {
            setExpandedFaq(index);
        }
    };

    const faqs = [
        {
            q: "Chính sách đổi trả của VION như thế nào?",
            a: "VION hỗ trợ khách hàng đổi trả sản phẩm trong vòng 7 ngày kể từ lúc nhận được hàng. Sản phẩm đổi trả phải còn nguyên tem mác, chưa qua sử dụng, chưa qua giặt là và không có mùi lạ. Quý khách có thể đổi sang sản phẩm cùng giá trị hoặc cao hơn (thanh toán thêm phần chênh lệch)."
        },
        {
            q: "Thời gian nhận hàng là bao lâu và phí ship tính thế nào?",
            a: "Thời gian giao hàng tiêu chuẩn là 2-4 ngày làm việc đối với khu vực tỉnh/thành phố khác, và 1-2 ngày đối với nội thành Hà Nội. Phí vận chuyển nội thành Hà Nội là 20.000đ, các tỉnh/thành phố khác là 35.000đ. Đặc biệt, VION miễn phí vận chuyển cho tất cả các đơn hàng có giá trị (sau khi trừ voucher) từ 500.000đ trở lên."
        },
        {
            q: "Làm thế nào để tôi chọn được size quần áo vừa vặn?",
            a: "Tại trang chi tiết của mỗi sản phẩm, VION đều tích hợp bảng quy đổi size chi tiết dựa trên chiều cao và cân nặng. Nếu quý khách vẫn còn băn khoăn, vui lòng click vào biểu tượng Trợ lý AI ở góc phải màn hình hoặc nhắn tin trực tiếp để nhân viên tư vấn số đo chính xác nhất."
        },
        {
            q: "Tôi có thể kiểm tra sản phẩm trước khi thanh toán không?",
            a: "VION áp dụng chính sách cho phép khách hàng kiểm tra sản phẩm (đồng kiểm) trước khi nhận hàng. Quý khách vui lòng kiểm tra đúng mẫu mã, màu sắc và size trước khi thanh toán cho nhân viên giao hàng (Shipper)."
        },
        {
            q: "VION hỗ trợ các hình thức thanh toán nào?",
            a: "Hiện tại VION chỉ hỗ trợ hình thức thanh toán duy nhất là Thanh toán khi nhận hàng (COD). Quý khách sẽ kiểm tra hàng và thanh toán tiền mặt trực tiếp cho nhân viên giao hàng (Shipper) khi nhận sản phẩm."
        }
    ];

    return (
        <div className="support-page container py-5">
            <div className="text-center mb-5">
                <span className="support-tag">TRUNG TÂM HỖ TRỢ KHÁCH HÀNG</span>
                <h1 className="support-main-title">Chúng Tôi Có Thể Giúp Gì Cho Bạn?</h1>
                <p className="support-subtitle">Tra cứu nhanh chính sách và lời khuyên giải quyết vấn đề mua sắm của bạn.</p>
            </div>

            <div className="row g-4">
                
                <div className="col-lg-3">
                    <div className="support-sidebar shadow-sm">
                        <button 
                            className={`support-tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
                            onClick={() => setActiveTab('faq')}
                        >
                            <HelpCircle size={18} />
                            <span>Câu hỏi thường gặp</span>
                        </button>
                        <button 
                            className={`support-tab-btn ${activeTab === 'return' ? 'active' : ''}`}
                            onClick={() => setActiveTab('return')}
                        >
                            <RefreshCw size={18} />
                            <span>Chính sách đổi trả</span>
                        </button>
                        <button 
                            className={`support-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                            onClick={() => setActiveTab('shipping')}
                        >
                            <Truck size={18} />
                            <span>Chính sách vận chuyển</span>
                        </button>
                        <button 
                            className={`support-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                            onClick={() => setActiveTab('privacy')}
                        >
                            <Shield size={18} />
                            <span>Chính sách bảo mật</span>
                        </button>
                    </div>

                    
                    <div className="support-contact-box mt-4 shadow-sm">
                        <h5>Liên hệ trực tiếp</h5>
                        <ul className="support-contact-list">
                            <li>
                                <Phone size={16} />
                                <div>
                                    <strong>Hotline</strong>
                                    <span>1900 1234 (8h00 - 22h00)</span>
                                </div>
                            </li>
                            <li>
                                <Mail size={16} />
                                <div>
                                    <strong>Email hỗ trợ</strong>
                                    <span>support@vion.vn</span>
                                </div>
                            </li>
                            <li>
                                <MapPin size={16} />
                                <div>
                                    <strong>Địa chỉ cửa hàng</strong>
                                    <span>Đống Đa, Hà Nội</span>
                                </div>
                            </li>
                            <li>
                                <Clock size={16} />
                                <div>
                                    <strong>Thời gian mở cửa</strong>
                                    <span>09h00 - 21h30 (Tất cả các ngày)</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                
                <div className="col-lg-9">
                    <div className="support-content shadow-sm">
                        
                        {activeTab === 'faq' && (
                            <div>
                                <h3 className="content-title">Câu Hỏi Thường Gặp (FAQs)</h3>
                                <div className="faq-list mt-4">
                                    {faqs.map((faq, index) => (
                                        <div key={index} className={`faq-item ${expandedFaq === index ? 'open' : ''}`}>
                                            <div className="faq-question" onClick={() => toggleFaq(index)}>
                                                <span>{faq.q}</span>
                                                {expandedFaq === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                            {expandedFaq === index && (
                                                <div className="faq-answer">
                                                    <p>{faq.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        
                        {activeTab === 'return' && (
                            <div>
                                <h3 className="content-title">Chính Sách Đổi Trả Sản Phẩm</h3>
                                <div className="policy-text mt-4">
                                    <h5>1. Điều kiện đổi trả</h5>
                                    <p>Sản phẩm mua tại VION được đổi hàng trong vòng <strong>7 ngày</strong> kể từ ngày quý khách nhận hàng.</p>
                                    <ul>
                                        <li>Sản phẩm còn nguyên tem mác, nhãn mác của nhà sản xuất.</li>
                                        <li>Chưa qua sử dụng, giặt ủi, không bám bẩn, không bị rách hay có mùi lạ.</li>
                                        <li>Hóa đơn mua hàng hoặc thông tin đơn hàng trên hệ thống vẫn còn rõ ràng.</li>
                                    </ul>

                                    <h5>2. Quy trình thực hiện</h5>
                                    <p>Quý khách vui lòng liên hệ hotline <strong>1900 1234</strong> hoặc email <strong>support@vion.vn</strong> để thông báo lý do đổi sản phẩm. Sau đó:</p>
                                    <ul>
                                        <li><strong>Đổi hàng tại cửa hàng:</strong> Mang sản phẩm kèm hóa đơn tới địa chỉ cửa hàng của VION tại Đống Đa, Hà Nội để nhân viên trực tiếp đổi size/mẫu mới.</li>
                                        <li><strong>Đổi hàng qua bưu điện/vận chuyển:</strong> Đóng gói sản phẩm gửi về địa chỉ VION cung cấp. Sau khi nhận được sản phẩm đổi của khách hàng, VION sẽ gửi sản phẩm thay thế trong vòng 2 ngày làm việc.</li>
                                    </ul>

                                    <h5>3. Chi phí vận chuyển đổi hàng</h5>
                                    <ul>
                                        <li>Nếu do lỗi của VION (gửi sai size, sai mẫu, lỗi vải của nhà sản xuất): VION chịu hoàn toàn 100% phí giao hàng đổi trả 2 chiều.</li>
                                        <li>Nếu theo nhu cầu chủ quan của quý khách (đổi size do mặc rộng/chật, đổi mẫu khác): Quý khách vui lòng thanh toán phí chuyển phát 2 chiều.</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        
                        {activeTab === 'shipping' && (
                            <div>
                                <h3 className="content-title">Chính Sách Giao Nhận & Vận Chuyển</h3>
                                <div className="policy-text mt-4">
                                    <h5>1. Thời gian vận chuyển</h5>
                                    <p>Sau khi đơn hàng được xác nhận trên hệ thống, thời gian giao hàng dự kiến như sau:</p>
                                    <ul>
                                        <li><strong>Khu vực Hà Nội:</strong> 1 - 2 ngày làm việc.</li>
                                        <li><strong>Khu vực miền Bắc, Trung, Nam:</strong> 2 - 4 ngày làm việc.</li>
                                    </ul>
                                    <p><em>* Lưu ý: Thời gian giao hàng có thể kéo dài hơn một chút trong các dịp lễ Tết, khuyến mãi lớn, hoặc thiên tai dịch bệnh ngoài ý muốn.</em></p>

                                    <h5>2. Biểu phí giao hàng</h5>
                                    <ul>
                                        <li><strong>Phí ship nội thành Hà Nội:</strong> <strong>20.000đ</strong>.</li>
                                        <li><strong>Phí ship các tỉnh/thành phố khác:</strong> <strong>35.000đ</strong>.</li>
                                        <li><strong>Chính sách freeship:</strong> Miễn phí hoàn toàn phí vận chuyển cho tất cả đơn hàng có tổng giá trị thanh toán thực tế (sau khi trừ voucher) đạt từ <strong>500.000đ</strong> trở lên.</li>
                                    </ul>

                                    <h5>3. Chính sách đồng kiểm</h5>
                                    <p>Khách hàng được quyền **kiểm tra sản phẩm** trước khi nhận hàng và thanh toán tiền mặt cho shipper (COD). Tuy nhiên, chính sách này không bao gồm quyền **mặc thử đồ** để đảm bảo sản phẩm còn nguyên vẹn, sạch sẽ tối đa.</p>
                                </div>
                            </div>
                        )}

                        
                        {activeTab === 'privacy' && (
                            <div>
                                <h3 className="content-title">Chính Sách Bảo Mật Thông Tin</h3>
                                <div className="policy-text mt-4">
                                    <h5>1. Mục đích thu thập thông tin cá nhân</h5>
                                    <p>VION thu thập thông tin của quý khách khi đăng ký tài khoản, đặt hàng hoặc sử dụng hệ thống nhằm:</p>
                                    <ul>
                                        <li>Xử lý đơn đặt hàng, giao nhận sản phẩm và thanh toán.</li>
                                        <li>Giải quyết khiếu nại, hỗ trợ đổi trả sản phẩm nhanh chóng.</li>
                                        <li>Gửi các thông báo cập nhật về sản phẩm mới, chương trình ưu đãi, mã giảm giá qua email (nếu được sự đồng ý của khách hàng).</li>
                                    </ul>

                                    <h5>2. Phạm vi thu thập</h5>
                                    <p>Chúng tôi chỉ thu thập các thông tin cơ bản tối thiểu gồm: Họ tên, Email, Số điện thoại, Địa chỉ nhận hàng và Lịch sử đơn hàng.</p>

                                    <h5>3. Cam kết bảo mật</h5>
                                    <p>VION cam kết bảo mật tuyệt đối dữ liệu cá nhân của quý khách bằng các biện pháp bảo mật hiện đại. Chúng tôi tuyệt đối không mua bán, trao đổi hoặc tiết lộ thông tin cá nhân của bạn cho bên thứ ba ngoại trừ đối tác vận chuyển để phục vụ giao nhận hàng hóa.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
