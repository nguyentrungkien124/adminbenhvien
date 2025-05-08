import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Button } from 'antd';
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
  ShopOutlined,
  ReadOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const theme = {
  useToken: () => ({
    token: {
      colorBgContainer: '#ffffff',
      borderRadiusLG: '8px',
    }
  })
};

const { Header, Content, Footer, Sider } = Layout;

const items2 = [
  {
    key: 'sub4',
    icon: <BarChartOutlined />,
    label: 'Thống kê',
    children: [
      { key: '1', label: <Link to="/thongke">Danh sách</Link> },
    ]
  },
  {
    key: 'sub1',
    icon: <TeamOutlined />,
    label: 'Chuyên Khoa',
    children: [
      { key: '1', label: <Link to="/Index">Danh sách</Link> },
      { key: '2', label: <Link to="/create">Thêm khoa</Link> },
    ]
  },
  {
    key: 'sub2',
    icon: <SolutionOutlined />,
    label: 'Bác sĩ',
    children: [
      { key: '1', label: <Link to="/indexBS">Danh sách</Link> },
      { key: '2', label: <Link to="/createBS">Thêm bác sĩ</Link> },
    ]
  },
  {
    key: 'sub3',
    icon: <ShopOutlined />,
    label: 'Nhà phân phối',
    children: [
      { key: '1', label: <Link to="/indexPP">Danh sách</Link> },
      { key: '2', label: <Link to="/createPP">Thêm sản phẩm</Link> },
    ]
  },
  {
    key: 'sub5',
    icon: <ShopOutlined />,
    label: 'Kho',
    children: [
      { key: '1', label: <Link to="/indexKho">Danh sách</Link> },
      { key: '2', label: <Link to="/createKho">Thêm kho</Link> },
    ]
  },
  {
    key: 'sub7',
    icon: <MedicineBoxOutlined />,
    label: 'Chuyên môn BS',
    children: [
      { key: '1', label: <Link to="/indexCM">Danh sách</Link> },
      { key: '2', label: <Link to="/createCM">Thêm chuyên môn</Link> },
    ]
  },
  {
    key: 'sub8',
    icon: <ToolOutlined />,
    label: 'Trang thiết bị',
    children: [
      { key: '1', label: <Link to="/indexNTTB">Nhóm trang thiết bị</Link> },
      { key: '2', label: <Link to="/indexTTB">Trang thiết bị</Link> },
    ]
  },
  {
    key: 'sub9',
    icon: <ProfileOutlined />,
    label: 'Gói Khám',
    children: [
      { key: '1', label: <Link to="/indexCTTGoikham">Gói khám</Link> },
      { key: '2', label: <Link to="/indexGoikham">Chi tiết gói khám</Link> },
    ]
  },
  {
    key: 'sub10',
    icon: <ReadOutlined />,
    label: 'Tin tức',
    children: [
      { key: '1', label: <Link to="/Tintuc">Tin tức</Link> },
      { key: '2', label: <Link to="/IndexLoaiTinTuc">Loại tin tức</Link> },
    ]
  },
  {
    key: 'sub11',
    icon: <IdcardOutlined />,
    label: 'Khách hàng',
    children: [
      { key: '1', label: <Link to="/Khachhang">Khách hàng</Link> },
    ]
  },
  {
    key: 'sub12',
    icon: <IdcardOutlined />,
    label: 'Nội trú',
    children: [
      { key: '1', label: <Link to="/Noitru">Nội trú</Link> },
    ]
  },
  {
    key: 'sub13',
    icon: <IdcardOutlined />,
    label: 'Giường bệnh',
    children: [
      { key: '1', label: <Link to="/Giuongbenh">Giường bệnh</Link> },
    ]
  },
  // {
  //   key: 'sub14',
  //   icon: <IdcardOutlined />,
  //   label: 'Phòng bệnh',
  //   children: [
  //     { key: '1', label: <Link to="/PhongBenh">Phòng bệnh</Link> },
  //   ]
  // },
  {
    key: 'sub15',
    icon: <IdcardOutlined />,
    label: 'Lễ tân',
    children: [
      { key: '1', label: <Link to="/Letan">Lễ tân</Link> },
    ]
  }
];

const Admin = ({ children, onLogout }: { children: React.ReactNode, onLogout: () => void }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setRole(userData.role);
  }, []);

  const handleLogout = () => {
    onLogout();
    sessionStorage.removeItem('user');
  };

  // Lọc menu theo vai trò
  const filteredMenuItems = items2
    .filter(item => {
      if (role === 'admin') {
        return ['sub4', 'sub1', 'sub2', 'sub3', 'sub5', 'sub7', 'sub8', 'sub9', 'sub10', 'sub11'].includes(item.key);
      } else if (role === 'bacsi') {
        return ['sub2', 'sub5', 'sub8', 'sub12', 'sub13', 'sub14'].includes(item.key);
      } else if (role === 'letan') {
        return item.key === 'sub15';
      }
      return false;
    })
    .map(item => {
      if (role === 'bacsi' && item.key === 'sub2') {
        // Chỉ giữ mục con có key: '1' trong sub2 cho vai trò bacsi
        return {
          ...item,
          children: item.children.filter(child => child.key === '1')
        };
      }
      return item;
    });

  return (
    <Layout>
      <Header style={{ backgroundColor: '#31304d', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <div className="logo" style={{ width: 120, height: 31, margin: '16px 24px 16px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="../image/logobenhvienKhoaiChau-removebg-preview.png" alt="Logo" style={{ width: 65, height: 65, borderRadius: '10px' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'none', color: '#ffff' }}>
            Hệ thống quản trị bệnh viện Khoái Châu
          </h1>
        </div>
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']} style={{ flex: 1, backgroundColor: '#4a90e2' }} />
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
        <Breadcrumb style={{ margin: '16px 0', color: '#fff' }} />
        <Layout
          style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG, marginLeft: -28, marginRight: -20, marginTop: -20 }}
        >
          <Sider style={{ background: colorBgContainer }} width={200}>
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub4']}
              style={{ height: '100%' }}
              items={filteredMenuItems}
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