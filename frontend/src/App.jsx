import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// 1. Nhúng các trang khách hàng
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';

// 2. Nhúng các trang ADMIN
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import CategoryManager from './admin/CategoryManager'; // Nhớ kiểm tra đúng file này nhé
import ProductManager from './admin/ProductManager';
import ProductDetail from './pages/ProductDetail';



// Nhúng các linh kiện (Components)
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// 3. Trạm kiểm soát Menu (Ẩn Navbar ở Login, Register và toàn bộ trang ADMIN)
const MenuBar = () => {
  const location = useLocation();
  const hideOn = ['/login', '/register'];
  // Nếu đường dẫn là login/register HOẶC bắt đầu bằng /admin -> Không hiện Navbar
  if (hideOn.includes(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }
  return <Navbar />;
};

// 4. Trạm kiểm soát Footer (Ẩn Footer tương tự Navbar)
const FooterControl = () => {
  const location = useLocation();
  const hideOn = ['/login', '/register'];
  if (hideOn.includes(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }
  return <Footer />;
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />


          {/* --- ROUTE ADMIN (Bố cục lồng nhau) --- */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* Trang mặc định khi vào /admin là Thống kê */}
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="products" element={<ProductManager />} />
            {/* Sau này thêm Quản lý sản phẩm, đơn hàng vào đây... */}
          </Route>

        </Routes>
      </main>

      {/* Chân trang khách hàng */}
      <FooterControl />
    </BrowserRouter>
  );
}

export default App;