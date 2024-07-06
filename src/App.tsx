import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Import các thành phần từ react-router-dom
import './App.css';
import Admin from './Components/Admin';
import Index from './pages/Chuyenmuc/Index';
import CreateCM from './pages/Chuyenmuc/create';
import Edit from './pages/Chuyenmuc/edit';
import IndexSP from './pages/Sanpham/indexSP';
import CreateSP from './pages/Sanpham/createSP';
import EditSP from './pages/Sanpham/editSP';
import IndexPP from './pages/NhaPhanPhoi/indexPP';
import EditPP from './pages/NhaPhanPhoi/editPP';
import CreatePP from './pages/NhaPhanPhoi/createPP';
import Login from './pages/Login/login';
import IndexHDN from './pages/HoaDonNhap/indexHDN';
import CreateHDN from './pages/HoaDonNhap/createHDN';
import IndexHDB from './pages/HoaDonBan/indexHDB';
import CreateHDB from './pages/HoaDonBan/createHDB';
import DetailHDB from './pages/HoaDonBan/detailHDB';
import EditHDB from './pages/HoaDonBan/editHDB';
import Thongke from './pages/ThongKe/thongke';
import CreateKH from './pages/Khach/createKH';
import IndexKH from './pages/Khach/indexKH';
import EditKH from './pages/Khach/editKH';
import IndexSL from './pages/Slide/indexSL';
import CreateSL from './pages/Slide/createSL';
import EditSL from './pages/Slide/editSL';


function App() {
    // Quản lý trạng thái đăng nhập
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    // Hàm xử lý đăng nhập thành công
    // Sau khi người dùng đăng nhập thành công
    const handleLoginSuccess = () => {
        // Lưu trạng thái đăng nhập vào local storage
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
    };

    // Khi tải lại trang, kiểm tra trạng thái đăng nhập
    useEffect(() => {   
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);
    }, []);
    const handleLogout = () => {
        // Xoá trạng thái đăng nhập khỏi local storage
        localStorage.removeItem('isLoggedIn');
        // Đặt trạng thái đăng nhập thành false
        setIsLoggedIn(false);
    };

    


    return (
        <Router> {/* Bọc toàn bộ ứng dụng với BrowserRouter */}
            {/* Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập */}
            {!isLoggedIn ? (
                <Routes>
                    <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                    {/* Điều hướng mặc định đến trang đăng nhập */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            ) : (
                // Nếu đã đăng nhập, hiển thị giao diện admin
                <Admin onLogout={handleLogout}>
                    <Routes>
                        <Route index path="/Index" element={<Index />} />
                        <Route path="/create" element={<CreateCM />} />
                        <Route path="/editCM" element={<Edit />} />
                        <Route path="/indexSP" element={<IndexSP />} />
                        <Route path="/createSP" element={<CreateSP />} />
                        <Route path="/editSP/:maSanPham" element={<EditSP />} />
                        <Route path="/indexPP" element={<IndexPP />} />
                        <Route path="/editPP/:maNhaPhanPhoi" element={<EditPP />} />
                        <Route path="/createPP" element={<CreatePP />} />
                        <Route path="/indexHDN" element={<IndexHDN />} />
                        <Route path="/createHDN" element={<CreateHDN />} />
                        <Route path="/indexHDB" element={<IndexHDB />} />
                        <Route path="/createHDB" element={<CreateHDB />} />
                        <Route path="/editHDB/:maHoaDon" element={<EditHDB />} />
                        <Route path="/detailHDB/:maHoaDon" element={<DetailHDB />} />
                        <Route path="/thongke" element={<Thongke />} />
                        <Route path="/createKH" element={<CreateKH />} />
                        <Route path="/indexKH" element={<IndexKH />} />
                        <Route path="/editKH/:maKH" element={<EditKH />} />
                        <Route path="/indexSL" element={<IndexSL />} />
                        <Route path="/createSL" element={<CreateSL />} />
                        <Route path="/editSL/:maSlide" element={<EditSL />} />
                    </Routes>
                </Admin>
            )}
        </Router>
    );
}

export default App;