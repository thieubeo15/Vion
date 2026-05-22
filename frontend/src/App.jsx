import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// 1. Nhúng các trang khách hàng
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import ProductsPage from './pages/ProductsPage';
import SearchResults from './pages/SearchResults'; // Sửa lại đường dẫn cho đúng thư mục của bro

// 2. Nhúng các trang ADMIN
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import CategoryManager from './admin/CategoryManager'; // Nhớ kiểm tra đúng file này nhé
import ProductManager from './admin/ProductManager';
import ProductDetail from './pages/ProductDetail';
import CheckoutPage from './pages/CheckoutPage';
import OrderManager from './admin/OrderManager';
import OrderHistory from './pages/OrderHistory';
import BannerManager from './admin/BannerManager';
import VoucherManager from './admin/VoucherManager';
import UserManager from './admin/UserManager';



// Nhúng các linh kiện (Components)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';

// 3. Trạm kiểm soát Menu (Ẩn Navbar ở Login, Register và toàn bộ trang ADMIN)
const MenuBar = () => {
  const location = useLocation();
  const hideOn = ['/login', '/register', '/forgot'];
  // Nếu đường dẫn là login/register HOẶC bắt đầu bằng /admin -> Không hiện Navbar
  if (hideOn.includes(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }
  return <Navbar />;
};

// 4. Trạm kiểm soát Footer (Ẩn Footer tương tự Navbar)
const FooterControl = () => {
  const location = useLocation();
  const hideOn = ['/login', '/register', '/forgot'];
  if (hideOn.includes(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }
  return <Footer />;
};

// 5. Trạm kiểm soát Chatbot (Ẩn Chatbot ở Login, Register và ADMIN)
const ChatWidgetControl = () => {
  const location = useLocation();
  const hideOn = ['/login', '/register', '/forgot'];
  if (hideOn.includes(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }
  return <ChatWidget />;
};

function App() {
  return (
    <BrowserRouter>
      {/* Thanh điều hướng khách hàng */}
      <MenuBar />

      {/* Nội dung chính của Web */}
      <main>
        <Routes>
          {/* --- ROUTE KHÁCH HÀNG --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category/:categoryId" element={<ProductsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/search-results" element={<SearchResults />} />

          {/* --- ROUTE ADMIN (Bố cục lồng nhau) --- */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* Trang mặc định khi vào /admin là Thống kê */}
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="orders" element={<OrderManager />} />
            <Route path="banners" element={<BannerManager />} />
            <Route path="vouchers" element={<VoucherManager />} />
            <Route path="users" element={<UserManager />} />
            {/* Sau này thêm Quản lý sản phẩm, đơn hàng vào đây... */}
          </Route>

        </Routes>
      </main>

      {/* Chân trang khách hàng */}
      <FooterControl />

      {/* Chatbot AI trợ lý bán hàng */}
      <ChatWidgetControl />
    </BrowserRouter>
  );
}

export default App;