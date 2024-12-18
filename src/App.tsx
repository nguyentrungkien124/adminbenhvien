import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import các thành phần từ react-router-dom
import './App.css';
import Admin from './Components/Admin';
import Index from './pages/ChuyenKhoa/Index';
import CreateCM from './pages/ChuyenKhoa/create';
import Edit from './pages/ChuyenKhoa/edit';
import IndexSP from './pages/Bacsi/indexBS';
import CreateSP from './pages/Bacsi/createBS';
import EditSP from './pages/Bacsi/editBS';
import IndexPP from './pages/NhaPhanPhoi/indexPP';
import EditPP from './pages/NhaPhanPhoi/editPP';
import CreatePP from './pages/NhaPhanPhoi/createPP';
import IndexHDN from './pages/Kho/indexKho';
import CreateHDN from './pages/Kho/createKho';
import IndexHDB from './pages/HoaDonBan/indexHDB';
import CreateHDB from './pages/HoaDonBan/createHDB';
import DetailHDB from './pages/HoaDonBan/detailHDB';
import EditHDB from './pages/HoaDonBan/editHDB';
import Thongke from './pages/ThongKe/thongke';
import CreateKH from './pages/Chuyên môn BS/createCM';
import IndexKH from './pages/Chuyên môn BS/indexCM';
import EditKH from './pages/Chuyên môn BS/editCM';
import IndexSL from './pages/Trangthietbi/indexTTB';
import CreateSL from './pages/Trangthietbi/createTTB';
import EditSL from './pages/Trangthietbi/editTTB';
import IndexNTTB from './pages/NhomTrangThietBi/indexNTTB';
import CreateNTTB from './pages/NhomTrangThietBi/createNTTB';
import EditNTTB from './pages/NhomTrangThietBi/editNTTB';
import IndexTTB from './pages/Trangthietbi/indexTTB';
import IndexKho from './pages/Kho/indexKho';
import CreateKho from './pages/Kho/createKho';
import IndexCTTGoikham from './pages/chitietgoikham/indexCTTGoikham';
import EditCTTGoikham from './pages/chitietgoikham/updateCTTGoikham';
import CreateCTTGoikham from './pages/chitietgoikham/createCTTGoikham';
import ChitietKho from './pages/Kho/chitietKho';
import Goikham from './pages/goikham/Index';
import MyEditor from './Components/MyEditor';
import IndexLoaiTinTuc from './pages/LoaiTinTuc/indexLoaiTinTuc';
import Tintuc from './pages/Tintuc/tintuc';
import Khachhang from './pages/Khachhang/khachhang';

function App() {
    return (
        <Router>
            {/* Không kiểm tra đăng nhập, hiển thị luôn các trang Admin */}
            <Admin onLogout={() => {}}>
                <Routes>
                <Route path="/MyEditor" element={<MyEditor />} />
                    <Route path="/Index" element={<Index />} />
                    <Route path="/create" element={<CreateCM />} />
                    <Route path="/editKhoa/:id" element={<Edit />} />
                    <Route path="/indexBS" element={<IndexSP />} />
                    <Route path="/createBS" element={<CreateSP />} />
                    <Route path="/editBS/:id" element={<EditSP />} />
                    <Route path="/indexPP" element={<IndexPP />} />
                    <Route path="/editPP/:id" element={<EditPP />} />
                    <Route path="/createPP" element={<CreatePP />} />
                    <Route path="/indexKho" element={<IndexKho />} />
                    <Route path="/createKho" element={<CreateKho />} />
                    <Route path="/chitietKho/:kho_id" element={<ChitietKho />} />
                    <Route path="/indexHDB" element={<IndexHDB />} />
                    <Route path="/createHDB" element={<CreateHDB />} />
                    <Route path="/editHDB/:maHoaDon" element={<EditHDB />} />
                    <Route path="/detailHDB/:MaHoaDon" element={<DetailHDB />} />
                    <Route path="/thongke" element={<Thongke />} />
                    <Route path="/createCM" element={<CreateKH />} />
                    <Route path="/indexCM" element={<IndexKH />} />
                    <Route path="/editCM/:id" element={<EditKH />} />
                    <Route path="/indexTTB" element={<IndexTTB />} />
                    <Route path="/createTTB" element={<CreateSL />} />
                    <Route path="/editTTB/:id" element={<EditSL />} />
                    <Route path="/indexNTTB" element={<IndexNTTB />} />
                    <Route path="/createNTTB" element={<CreateNTTB />} />
                    <Route path="/editNTTB/:id" element={<EditNTTB />} />
                    <Route path="/indexCTTGoikham" element={<IndexCTTGoikham />} />
                    <Route path="/editCTTGoikham/:id" element={<EditCTTGoikham />} />
                    <Route path="/createCTTGoikham" element={<CreateCTTGoikham />} />
                    <Route path='/indexGoikham' element={<Goikham />} />
                    <Route path='/IndexLoaiTinTuc' element={<IndexLoaiTinTuc />} />
                    <Route path='/Tintuc' element={<Tintuc />} />
                    <Route path='/Khachhang' element={<Khachhang />} />
                </Routes>
            </Admin>
        </Router>
    );
}

export default App;
