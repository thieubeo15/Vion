import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';


import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import ProductsPage from './pages/ProductsPage';
import SearchResults from './pages/SearchResults'; 
import AboutUsPage from './pages/AboutUsPage';
import SupportPage from './pages/SupportPage';


import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import CategoryManager from './admin/CategoryManager'; 
import ProductManager from './admin/ProductManager';
import ProductDetail from './pages/ProductDetail';
import CheckoutPage from './pages/CheckoutPage';
import OrderManager from './admin/OrderManager';
import OrderHistory from './pages/OrderHistory';
import BannerManager from './admin/BannerManager';
import VoucherManager from './admin/VoucherManager';
import UserManager from './admin/UserManager';




import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';


const MenuBar = () => {
  const location = useLocation();
  const hideOn = ['/login', '/register', '/forgot'];
  
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


const ChatWidgetControl = () => {
  const location = useLocation();
  const hideOn = ['/login', '/register', '/forgot'];
  if (hideOn.includes(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }
  return <ChatWidget />;
};

// Hỗ trợ tự động cuộn lên đầu trang khi chuyển trang (Route change)
const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const adminMain = document.querySelector('.vion-admin-main');
    if (adminMain) {
      adminMain.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      
      <ScrollToTop />

      
      <MenuBar />

      
      <main>
        <Routes>
          
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
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/support" element={<SupportPage />} />

          
          <Route path="/admin" element={<AdminLayout />}>
            
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="orders" element={<OrderManager />} />
            <Route path="banners" element={<BannerManager />} />
            <Route path="vouchers" element={<VoucherManager />} />
            <Route path="users" element={<UserManager />} />
            
          </Route>

        </Routes>
      </main>

      
      <FooterControl />

      
      <ChatWidgetControl />
    </BrowserRouter>
  );
}

export default App;