import React, { useState } from 'react';
import { Layout, Menu, Breadcrumb, Button } from 'antd'; // Import các module từ 'antd'
import { UserOutlined, ProfileOutlined, SolutionOutlined, ShoppingCartOutlined, HomeOutlined, CodeOutlined,BellOutlined,MailOutlined,BookOutlined,DatabaseOutlined } from '@ant-design/icons'; // Import các icon từ '@ant-design/icons'
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
    icon: <HomeOutlined />,
    label: 'Thống kê',
    children: [
      { key: '1', label: <Link to="/thongke" >Danh sách</Link>, },
  
    ]
  },
  {
    key: 'sub1',
    icon: <UserOutlined />,
    label: 'Chuyên mục SP',
    children: [
      { key: '1', label: <Link to="/Index">Danh sách</Link>, },
      { key: '2', label: <Link to="/create">Thêm chuyên mục</Link>, },
    ]
  },
  {
    key: 'sub2',
    icon: <ProfileOutlined />,
    label: 'Sản phẩm',
    children: [
      { key: '1', label: <Link to="/indexSP">Danh sách</Link>, },
      { key: '2', label: <Link to="/createSP">Thêm sản phẩm</Link>, },
    ]
  },
  {
    key: 'sub3',
    icon: <SolutionOutlined />,
    label: 'Nhà phân phối',
    children: [
      { key: '1', label: <Link to="/indexPP">Danh sách</Link>, },
      { key: '2', label: <Link to="/createPP">Thêm sản phẩm</Link>, },
    ]
  },
  {
    key: 'sub5',
    icon: <CodeOutlined />,
    label: 'Hóa đơn nhập',
    children: [
      { key: '1', label: <Link to="/indexHDN">Danh sách</Link>, },
      { key: '2', label: <Link to="/createHDN">Thêm sản phẩm</Link>, },
    ]
  },
  {
    key: 'sub6',
    icon: <ShoppingCartOutlined />,
    label: 'Hóa đơn bán',
    children: [
      { key: '1', label: <Link to="/indexHDB">Danh sách</Link>, },
      { key: '2', label: <Link to="/createHDB">Thêm sản phẩm</Link>, },
    ]
  },
  {
    key: 'sub7',
    icon: <DatabaseOutlined />,
    label: 'Khách hàng',
    children: [
      { key: '1', label: <Link to="/indexKH">Danh sách</Link>, },
      { key: '2', label: <Link to="/createKH">Thêm khách hàng</Link>, },
    ]
  },
  {
    key: 'sub8',
    icon: <BookOutlined />,
    label: 'Slide',
    children: [
      { key: '1', label: <Link to="/indexSL">Danh sách</Link>, },
      { key: '2', label: <Link to="/createSL">Thêm Slide</Link>, },
    ]
  }
];


const Admin = ({ children, onLogout }: { children: React.ReactNode, onLogout: () => void }) => {
  // Sử dụng biến theme
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    onLogout(); // Gọi hàm đăng xuất từ `App`
  };

  return (
    <Layout>
     <Header style={{ backgroundColor: '#31304d', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
    <div className="logo" style={{ width: 120, height: 31, margin: '16px 24px 16px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src="../image/image.png" alt="Logo" style={{ width: 150, height: 65, borderRadius: '10px' }} />
    </div>
    <div>
      <h1 style={{fontFamily:'none',color:'#ffff'}}>
        Hệ thống quản trị cửa hàng bán nước hoa
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
      <Content style={{ padding: '0 48px', maxHeight: 1660 ,border:20, backgroundColor: '#31304d'}}>
        <Breadcrumb style={{ margin: '16px 0',color:'#fff' }}>
        </Breadcrumb>
        <Layout
          style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG,marginLeft:-28, marginRight:-20,marginTop:-20 }}
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
      </Content>

    </Layout>
  );
};

export default Admin;
