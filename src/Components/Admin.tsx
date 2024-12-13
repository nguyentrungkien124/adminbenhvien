import React, { useState } from 'react';
import { Layout, Menu, Breadcrumb, Button } from 'antd'; // Import các module từ 'antd'
import {
  UserOutlined,

  ProfileOutlined,
  SolutionOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  CodeOutlined,
  BellOutlined,
  MailOutlined,
  BookOutlined,
  DatabaseOutlined,
  ToolOutlined,
  MedicineBoxOutlined,
  BarChartOutlined,
  TeamOutlined,
  ShopOutlined
} from '@ant-design/icons';

import { Link, Navigate } from 'react-router-dom'; // Import Link từ react-router-dom

// Định nghĩa biến theme với giá trị mặc định
const theme = {
  useToken: () => ({
    token: {
      colorBgContainer: '#ffffff', // Màu nền cho container
      borderRadiusLG: '8px', // Độ cong của góc container
    }
  })
};

const { Header, Content, Footer, Sider } = Layout;

const items1 = [].map((key) => ({
  key,
  label: `nav ${key}`,
}));

const items2 = [
  {
    key: 'sub4',
    icon: <BarChartOutlined />, // Thống kê -> Bar chart biểu đồ
    label: 'Thống kê',
    children: [
      { key: '1', label: <Link to="/thongke">Danh sách</Link>, },
    ]
  },
  {
    key: 'sub1',
    icon: <TeamOutlined />, // Chuyên Khoa -> Team để đại diện cho nhiều chuyên khoa
    label: 'Chuyên Khoa',
    children: [
      { key: '1', label: <Link to="/Index">Danh sách</Link>, },
      { key: '2', label: <Link to="/create">Thêm khoa</Link>, },
    ]
  },
  {
    key: 'sub2',
    icon: <SolutionOutlined />, // Bác sĩ -> Solution (phù hợp cho bác sĩ)
    label: 'Bác sĩ',
    children: [
      { key: '1', label: <Link to="/indexBS">Danh sách</Link>, },
      { key: '2', label: <Link to="/createBS">Thêm bác sĩ</Link>, },
    ]
  },
  {
    key: 'sub3',
    icon: <ShopOutlined />, // Nhà phân phối -> Shop để biểu thị nguồn cung
    label: 'Nhà phân phối',
    children: [
      { key: '1', label: <Link to="/indexPP">Danh sách</Link>, },
      { key: '2', label: <Link to="/createPP">Thêm sản phẩm</Link>, },
    ]
  },
  {
    key: 'sub5',
    icon: <ShopOutlined />, // Kho -> Warehouse (biểu thị kho)
    label: 'Kho',
    children: [
      { key: '1', label: <Link to="/indexKho">Danh sách</Link>, },
      { key: '2', label: <Link to="/createKho">Thêm kho</Link>, },
    ]
  },
  {
    key: 'sub7',
    icon: <MedicineBoxOutlined />, // Chuyên môn BS -> Medicine box (biểu thị chuyên môn y khoa)
    label: 'Chuyên môn BS',
    children: [
      { key: '1', label: <Link to="/indexCM">Danh sách</Link>, },
      { key: '2', label: <Link to="/createCM">Thêm chuyên môn</Link>, },
    ]
  },
  {
    key: 'sub8',
    icon: <ToolOutlined />, // Trang thiết bị -> Tool biểu thị dụng cụ, trang thiết bị
    label: 'Trang thiết bị',
    children: [
      { key: '1', label: <Link to="/indexNTTB">Nhóm trang thiết bị</Link>, },
      { key: '2', label: <Link to="/indexTTB">Trang thiết bị</Link>, },
    ]
  },
  {
    key: 'sub9',
    icon: <ProfileOutlined />, // Gói Khám -> Profile để biểu thị dịch vụ khám
    label: 'Gói Khám',
    children: [
      { key: '1', label: <Link to="/indexCTTGoikham">Gói khám</Link>, },
      { key: '2', label: <Link to="/indexGoikham">Chi tiết gói khám</Link>, },
    ]
  }
  , {
    key: 'sub10',
    icon: <ProfileOutlined />, // Gói Khám -> Profile để biểu thị dịch vụ khám
    label: 'Tin tức',
    children: [
      { key: '1', label: <Link to="/Tintuc">Tin tức</Link>, },
      { key: '2', label: <Link to="/IndexLoaiTinTuc">Loại tin tức</Link>, },
    ]
  }
];


const Admin = ({ children, onLogout }: { children: React.ReactNode, onLogout: () => void }) => {
  // Sử dụng biến theme
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    onLogout();
  };

  return (
    <Layout>
      <Header style={{ backgroundColor: '#31304d', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <div className="logo" style={{ width: 120, height: 31, margin: '16px 24px 16px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="../image/logobenhvienKhoaiChau.jpg" alt="Logo" style={{ width: 65, height: 65, borderRadius: '10px' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'none', color: '#ffff' }}>
            Hệ thống quản trị bệnh viện Khoái Châu
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={items1}
          style={{ flex: 1, backgroundColor: '#4a90e2' }}
        />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BellOutlined style={{ fontSize: '20px', color: '#ffff', marginRight: '16px' }} />
          <MailOutlined style={{ fontSize: '20px', color: '#ffff', marginRight: '16px' }} />
          <Button
            type="primary"
            onClick={handleLogout}
            style={{ backgroundColor: '#2ecc71', border: 'none', color: '#fff' }}
          >
            Đăng xuất
          </Button>
        </div>
      </Header>
      <Content style={{ padding: '0 48px', maxHeight: 1660, border: 20, backgroundColor: '#31304d' }}>
        <Breadcrumb style={{ margin: '16px 0', color: '#fff' }}>
        </Breadcrumb>
        <Layout
          style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG, marginLeft: -28, marginRight: -20, marginTop: -20 }}
        >
          <Sider style={{ background: colorBgContainer }} width={200}>
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub4']}
              style={{ height: '100%' }}
              items={items2}
            />
          </Sider>
          <Content style={{ padding: '0 24px', minHeight: 600 }}>


            {children}
          </Content>
        </Layout>
        <Footer style={{ textAlign: 'center', backgroundColor: '#31304d', color: '#ffffff' }}>
          © 2024 Hệ thống quản trị bệnh viện Khoái Châu
        </Footer>
      </Content>

    </Layout>
  );
};

export default Admin;
