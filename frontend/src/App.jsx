import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Nhúng các trang của bạn
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// Nhúng các linh kiện (Components)
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // Import Footer vào đây

// 1. Trạm kiểm soát Menu (Ẩn hiện Navbar)
const MenuBar = () => {
  const location = useLocation(); 
  if (location.pathname === '/login' || location.pathname === '/register'){
    return null;
  }
  return <Navbar />;
};

// 2. Trạm kiểm soát Footer (Ẩn hiện Footer)
const FooterControl = () => {
  const location = useLocation();
  // Nếu ở trang Login hoặc Register -> Không hiện Footer
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }
  return <Footer />;
};

function App() {
  return (
    <BrowserRouter>
      
      {/* Gọi Trạm kiểm soát Menu */}
      <MenuBar />

      {/* Nội dung chính của Web */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> 
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      {/* 3. Gọi Trạm kiểm soát Footer ra */}
      <FooterControl />
      
    </BrowserRouter>
  );
}

export default App;