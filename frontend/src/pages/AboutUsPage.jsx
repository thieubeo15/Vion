import React from 'react';
import './AboutUsPage.css';
import { Award, Sparkles, Heart, Target, ShieldCheck } from 'lucide-react';

const AboutUsPage = () => {
    return (
        <div className="about-us-page">
            
            <section className="about-hero">
                <img 
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600" 
                    alt="Vion Era Banner" 
                    className="about-hero-bg"
                />
                <div className="about-hero-overlay"></div>
                <div className="about-hero-content">
                    <h1 className="about-hero-title">VION. ERA</h1>
                    <p className="about-hero-subtitle">Thương Hiệu Thời Trang Thiết Kế Hàng Đầu Cho Giới Trẻ</p>
                </div>
            </section>

            
            <section className="about-story container py-5">
                <div className="row align-items-center">
                    <div className="col-lg-6 mb-4 mb-lg-0">
                        <div className="story-img-wrap">
                            <img 
                                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800" 
                                alt="Our Story" 
                                className="img-fluid rounded shadow-lg"
                            />
                        </div>
                    </div>
                    <div className="col-lg-6 ps-lg-5">
                        <span className="section-subtitle-tag">CÂU CHUYỆN CỦA VION</span>
                        <h2 className="story-title mb-4">Khởi Nguồn Từ Sự Khát Khao Đột Phá</h2>
                        <p className="story-text">
                            Được thành lập vào năm 2026, <strong>VION. ERA</strong> ra đời với sứ mệnh mang lại một làn gió mới cho bản đồ thời trang giới trẻ Việt Nam. Chúng tôi tin rằng, trang phục không chỉ đơn thuần là vải vóc mặc trên người, mà là một ngôn ngữ không lời giúp bạn thể hiện cá tính, bản lĩnh và cái tôi độc bản của chính mình.
                        </p>
                        <p className="story-text">
                            Tại VION, mỗi sản phẩm từ áo thun basic, polo thanh lịch, sơ mi cá tính cho đến những mẫu hoodie và váy đầm thiết kế đều trải qua quy trình phát triển sản phẩm nghiêm ngặt. Từ khâu tuyển chọn sợi vải tự nhiên thân thiện, thiết kế form dáng chuẩn người Việt đến từng đường kim chỉ may tỉ mỉ, tất cả đều hướng tới sự trải nghiệm hoàn hảo cho khách hàng.
                        </p>
                    </div>
                </div>
            </section>

            
            <section className="about-values py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <span className="section-subtitle-tag">ĐỊNH HƯỚNG PHÁT TRIỂN</span>
                        <h2 className="values-main-title">Giá Trị Cốt Lõi Tại VION.</h2>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="value-card shadow-sm">
                                <div className="value-icon-box">
                                    <Sparkles size={32} />
                                </div>
                                <h4>Sáng Tạo Đột Phá</h4>
                                <p>Không ngừng đổi mới, cập nhật xu hướng thời trang thế giới và biến tấu để phù hợp với phong cách và cá tính của giới trẻ Việt.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="value-card shadow-sm">
                                <div className="value-icon-box">
                                    <ShieldCheck size={32} />
                                </div>
                                <h4>Chất Lượng Cam Kết</h4>
                                <p>Sử dụng chất liệu vải cao cấp, quy trình may mặc khắt khe nhằm đảm bảo mỗi sản phẩm giao tới tay khách hàng đều có độ bền và trải nghiệm thoải mái nhất.</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="value-card shadow-sm">
                                <div className="value-icon-box">
                                    <Heart size={32} />
                                </div>
                                <h4>Khách Hàng Là Trọng Tâm</h4>
                                <p>Luôn lắng nghe, cải tiến dịch vụ chăm sóc và mang lại chế độ hậu mãi tận tâm nhất để khách hàng luôn an lòng đồng hành cùng thương hiệu.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="about-vision py-5 container">
                <div className="row g-5 align-items-center">
                    <div className="col-lg-6 order-lg-2">
                        <div className="vision-img-wrap">
                            <img 
                                src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800" 
                                alt="Vision and Mission" 
                                className="img-fluid rounded shadow-lg"
                            />
                        </div>
                    </div>
                    <div className="col-lg-6 order-lg-1">
                        <div className="vision-box mb-4">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <Target className="vision-icon" size={24} />
                                <h3 className="m-0">Tầm Nhìn 2030</h3>
                            </div>
                            <p>Trở thành biểu tượng thời trang thiết kế hàng đầu dành cho giới trẻ Việt Nam, vươn mình ra khu vực Đông Nam Á thông qua tinh thần sáng tạo bền bỉ và chất lượng sản phẩm dẫn đầu phân khúc.</p>
                        </div>
                        <div className="vision-box">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <Award className="vision-icon" size={24} />
                                <h3 className="m-0">Sứ Mệnh Thương Hiệu</h3>
                            </div>
                            <p>Đồng hành cùng giới trẻ trên hành trình định hình phong cách cá nhân, truyền cảm hứng sống năng động, dám khác biệt và tự tin bộc lộ bản thân mỗi ngày thông qua thời trang thiết kế.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUsPage;
