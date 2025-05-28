import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Button, Badge, Popover, List, Typography } from 'antd';
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
  IdcardOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

const theme = {
  useToken: () => ({
    token: {
      colorBgContainer: '#ffffff',
      borderRadiusLG: '8px',
    },
  }),
};

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

interface Notification {
  message: string;
  time: number;
  seen: boolean;
  bac_si_id?: number | string;
}

interface SocketNotificationData {
  message: string;
  bac_si_id?: number | string;
}

interface AppointmentCountData {
  count: number;
}

let socketInstance: Socket | null = null;

const connectSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io('http://localhost:9999', {
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance?.id, 'at', new Date().toISOString());
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message, 'at', new Date().toISOString());
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after maximum attempts.', 'at', new Date().toISOString());
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason, 'at', new Date().toISOString());
    });
  }
  return socketInstance;
};

const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    console.log('Socket instance disconnected and cleared at', new Date().toISOString());
  }
};

const items2 = [
  {
    key: 'sub4',
    icon: <BarChartOutlined />,
    label: 'Thống kê',
    children: [
      { key: '1', label: <Link to="/thongke">Danh sách</Link> },
    ],
  },
  {
    key: 'sub1',
    icon: <TeamOutlined />,
    label: 'Chuyên Khoa',
    children: [
      { key: '1', label: <Link to="/Index">Danh sách</Link> },
      { key: '2', label: <Link to="/create">Thêm khoa</Link> },
    ],
  },
  {
    key: 'sub2',
    icon: <SolutionOutlined />,
    label: 'Bác sĩ',
    children: [
      { key: '1', label: <Link to="/indexBS">Danh sách</Link> },
      { key: '2', label: <Link to="/createBS">Thêm bác sĩ</Link> },
    ],
  },
  {
    key: 'sub3',
    icon: <ShopOutlined />,
    label: 'Nhà phân phối',
    children: [
      { key: '1', label: <Link to="/indexPP">Danh sách</Link> },
      { key: '2', label: <Link to="/createPP">Thêm sản phẩm</Link> },
    ],
  },
  {
    key: 'sub5',
    icon: <ShopOutlined />,
    label: 'Kho',
    children: [
      { key: '1', label: <Link to="/indexKho">Danh sách</Link> },
      { key: '2', label: <Link to="/createKho">Thêm kho</Link> },
    ],
  },
  {
    key: 'sub7',
    icon: <MedicineBoxOutlined />,
    label: 'Chuyên môn BS',
    children: [
      { key: '1', label: <Link to="/indexCM">Danh sách</Link> },
      { key: '2', label: <Link to="/createCM">Thêm chuyên môn</Link> },
    ],
  },
  {
    key: 'sub8',
    icon: <ToolOutlined />,
    label: 'Trang thiết bị',
    children: [
      { key: '1', label: <Link to="/indexNTTB">Nhóm trang thiết bị</Link> },
      { key: '2', label: <Link to="/indexTTB">Trang thiết bị</Link> },
    ],
  },
  {
    key: 'sub9',
    icon: <ProfileOutlined />,
    label: 'Gói Khám',
    children: [
      { key: '1', label: <Link to="/indexCTTGoikham">Gói khám</Link> },
      { key: '2', label: <Link to="/indexGoikham">Chi tiết gói khám</Link> },
    ],
  },
  {
    key: 'sub10',
    icon: <ReadOutlined />,
    label: 'Tin tức',
    children: [
      { key: '1', label: <Link to="/Tintuc">Tin tức</Link> },
      { key: '2', label: <Link to="/IndexLoaiTinTuc">Loại tin tức</Link> },
    ],
  },
  {
    key: 'sub11',
    icon: <IdcardOutlined />,
    label: 'Khách hàng',
    children: [
      { key: '1', label: <Link to="/Khachhang">Khách hàng</Link> },
    ],
  },
  {
    key: 'sub12',
    icon: <IdcardOutlined />,
    label: 'Nội trú',
    children: [
      { key: '1', label: <Link to="/Noitru">Nội trú</Link> },
    ],
  },
  {
    key: 'sub13',
    icon: <IdcardOutlined />,
    label: 'Giường bệnh',
    children: [
      { key: '1', label: <Link to="/Giuongbenh">Giường bệnh</Link> },
    ],
  },
  {
    key: 'sub15',
    icon: <IdcardOutlined />,
    label: 'Lễ tân',
    children: [
      { key: '1', label: <Link to="/Letan">Lễ tân</Link> },
    ],
  },
  {
    key: 'sub16',
    icon: <IdcardOutlined />,
    label: 'Quản lý khám bệnh',
    children: [
      { key: '1', label: <Link to="/Quanlykhambenh">Quản lý khám bệnh</Link> },
    ],
  },
  {
    key: 'sub17',
    icon: <IdcardOutlined />,
    label: 'Lịch làm việc',
    children: [
      { key: '1', label: <Link to="/Lichlamviecbybs">Lịch làm việc</Link> },
    ],
  },
  {
    key: 'sub18',
    icon: <IdcardOutlined />,
    label: 'Bảng lịch làm việc',
    children: [
      { key: '1', label: <Link to="/Banglichlamviecbybs">Bảng lịch làm việc</Link> },
    ],
  },
  {
    key: 'sub19',
    icon: <IdcardOutlined />,
    label: 'Lịch hẹn khám',
    children: [
      { key: '1', label: <Link to="/Lichhenkham">Lịch hẹn khám</Link> },
    ],
  },
  {
    key: 'sub20',
    icon: <IdcardOutlined />,
    label: 'Quản lý khám lâm sàng',
    children: [
      { key: '1', label: <Link to="/Khamlamsan">Quản lý khám lâm sàng</Link> },
    ],
  },
  {
    key: 'sub21',
    icon: <IdcardOutlined />,
    label: 'Thanh toán',
    children: [
      { key: '1', label: <Link to="/Xacnhanthanhtoanbyletan">Thanh toán</Link> },
    ],
  },
  {
    key: 'sub22',
    icon: <IdcardOutlined />,
    label: 'Thống kê',
    children: [
      { key: '1', label: <Link to="/StatisticsPage">Thống kê</Link> },
    ],
  },
];

const Admin: React.FC<{ children: React.ReactNode; onLogout: () => void }> = ({ children, onLogout }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [role, setRole] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ ho_ten: string; ten_khoa: string } | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  console.log('Admin component re-rendered at', new Date().toISOString());
  console.log('Notifications:', notifications);
  console.log('Notification Count:', notificationCount);
  console.log('User Data:', userData);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    console.log('Stored user from sessionStorage:', storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Parsed user:', parsedUser);
        setUserData(parsedUser);
        setRole(parsedUser.role);
      } catch (error) {
        console.error('Error parsing user from sessionStorage:', error);
        sessionStorage.removeItem('user');
      }
    } else {
      console.error('No user data found in sessionStorage');
    }
  }, []);

  useEffect(() => {
    if (!userData) {
      console.log('userData is null, skipping effect');
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const bac_si_id = userData.bac_si_id || userData.id;
        const khoa_id = userData.khoa_id;

        console.log('Fetching user info for bac_si_id:', bac_si_id, 'khoa_id:', khoa_id);

        if (!bac_si_id || !khoa_id) {
          throw new Error('Không tìm thấy bac_si_id hoặc khoa_id');
        }

        const [bacsiResponse, khoaResponse] = await Promise.all([
          fetch(`http://localhost:9999/api/bacsi/getbacsibyID/${bac_si_id}`),
          fetch(`http://localhost:9999/api/khoa/getkhoabyid/${khoa_id}`),
        ]);

        if (!bacsiResponse.ok || !khoaResponse.ok) {
          throw new Error('Không thể lấy dữ liệu từ API');
        }

        const bacsiData = await bacsiResponse.json();
        const khoaData = await khoaResponse.json();
        console.log('Bác sĩ data:', bacsiData);
        setUserInfo({
          ho_ten: bacsiData[0].ho_ten || 'Không có tên',
          ten_khoa: khoaData[0]?.ten || 'Không có khoa',
        });
      } catch (error: any) {
        console.error('Lỗi khi lấy thông tin:', error.message);
        setUserInfo({
          ho_ten: 'Không thể lấy tên',
          ten_khoa: 'Không có khoa',
        });
      }
    };

    fetchUserInfo();

    const storedNotifications = localStorage.getItem(`notifications_${userData.bac_si_id || userData.id}`);
    console.log('Stored notifications:', storedNotifications);
    if (storedNotifications) {
      const parsedNotifications: Notification[] = JSON.parse(storedNotifications);
      setNotifications(parsedNotifications);
      setNotificationCount(parsedNotifications.filter((noti) => !noti.seen).length); // Đồng bộ ngay từ đầu
    }

    const socket = connectSocket();

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id, 'at', new Date().toISOString());
      setSocketError(null);
      const bacId = userData.bac_si_id || userData.id;
      console.log('bacId for joining room:', bacId);
      if (bacId) {
        console.log('Joining room for bac_si_id:', bacId);
        socket.emit('join_room', { bac_si_id: bacId });
        socket.on('room_joined', (room) => {
          console.log('Successfully joined room:', room, 'at', new Date().toISOString());
        });
      } else {
        console.error('No bac_si_id or id found for joining room');
      }
    });

    socket.on('newNotification', (data: SocketNotificationData) => {
      console.log('New notification received:', data, 'at', new Date().toISOString());
      const currentBacSiId = userData.bac_si_id || userData.id;
      console.log('Current bac_si_id:', currentBacSiId, 'Received bac_si_id:', data.bac_si_id);

      const newNotification: Notification = {
        message: data.message || 'Thông báo mặc định',
        time: Date.now(),
        seen: false,
        bac_si_id: data.bac_si_id || currentBacSiId,
      };

      setNotifications((prev) => {
        // Kiểm tra trùng lặp với khoảng thời gian rộng hơn (5 giây)
        const isDuplicate = prev.some(
          (noti) =>
            noti.message === newNotification.message &&
            noti.bac_si_id === newNotification.bac_si_id &&
            Math.abs(noti.time - newNotification.time) < 5000 // Tăng lên 5 giây
        );

        if (isDuplicate) {
          console.log('Duplicate notification detected, skipping:', newNotification);
          return prev;
        }

        const updatedNotifications = [...prev, newNotification];
        localStorage.setItem(`notifications_${currentBacSiId}`, JSON.stringify(updatedNotifications));
        setNotificationCount(updatedNotifications.filter((noti) => !noti.seen).length); // Đồng bộ ngay sau khi thêm
        return updatedNotifications;
      });
    });

    socket.on('appointmentCount', (data: AppointmentCountData) => {
      console.log('Received appointment count:', data.count, 'at', new Date().toISOString());
      setAppointmentCount(data.count);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message, 'at', new Date().toISOString());
      setSocketError('Không thể kết nối đến server thông báo.');
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed.', 'at', new Date().toISOString());
      setSocketError('Không thể kết nối lại server thông báo.');
    });

    return () => {
      socket.off('newNotification');
      socket.off('appointmentCount');
      socket.off('connect_error');
      socket.off('reconnect_failed');
      socket.off('room_joined');
    };
  }, [userData]);

  // Đồng bộ notificationCount mỗi khi notifications thay đổi
  useEffect(() => {
    setNotificationCount(notifications.filter((noti) => !noti.seen).length);
  }, [notifications]);

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  const handleNotificationClick = (index: number) => {
    setNotifications((prev) => {
      const updatedNotifications = [...prev];
      updatedNotifications[index].seen = true;
      const currentBacSiId = userData?.bac_si_id || userData?.id;
      localStorage.setItem(`notifications_${currentBacSiId}`, JSON.stringify(updatedNotifications));
      setNotificationCount(updatedNotifications.filter((noti) => !noti.seen).length); // Đồng bộ sau khi đánh dấu seen
      return updatedNotifications;
    });
    navigate('/Lichhenkham');
  };

  const handleLogout = () => {
    onLogout();
    sessionStorage.removeItem('user');
    disconnectSocket();
  };

  const filteredMenuItems = items2
    .filter((item) => {
      if (role === 'admin') {
        return ['sub4', 'sub1', 'sub2', 'sub3', 'sub5', 'sub7', 'sub8', 'sub9', 'sub10', 'sub11'].includes(item.key);
      } else if (role === 'bacsi') {
        if (userData?.khoa_id && parseInt(userData.khoa_id) === 20) {
          return ['sub20', 'sub2', 'sub8'].includes(item.key);
        } else {
          const baseItems = ['sub2', 'sub8', 'sub12', 'sub13', 'sub14', 'sub16', 'sub18', 'sub19', 'sub22'];
          return baseItems.includes(item.key);
        }
      } else if (role === 'letan') {
        return ['sub15', 'sub21'].includes(item.key);
      }
      return false;
    })
    .map((item) => {
      if (role === 'bacsi') {
        if (item.key === 'sub2') {
          return {
            ...item,
            children: item.children.filter((child) => child.key === '1'),
          };
        } else if (item.key === 'sub8') {
          return {
            ...item,
            children: item.children.filter((child) => child.key === '2'),
          };
        }
      }
      return item;
    });

  const notificationContent = (
    <div>
      {socketError && (
        <div style={{ color: 'red', padding: '8px', textAlign: 'center' }}>
          {socketError}
        </div>
      )}
      <List
        dataSource={notifications}
        renderItem={(item, index) => (
          <List.Item
            onClick={() => handleNotificationClick(index)}
            style={{
              cursor: 'pointer',
              backgroundColor: item.seen ? '#f5f5f5' : '#e6f7ff',
              padding: '8px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <List.Item.Meta
              title={<Text strong={!item.seen}>{item.message}</Text>}
              description={getTimeAgo(item.time)}
            />
          </List.Item>
        )}
        locale={{ emptyText: 'Không có thông báo' }}
        style={{ maxHeight: '300px', overflowY: 'auto', width: '300px' }}
      />
    </div>
  );

  const userInfoContent = (
    <div style={{ padding: '8px', width: '200px' }}>
      <p>
        <strong>Tên:</strong> {userInfo?.ho_ten || 'Không có tên'}
      </p>
      <p>
        <strong>Khoa:</strong> {userInfo?.ten_khoa || 'Không có khoa'}
      </p>
    </div>
  );

  return (
    <Layout>
      <Header style={{ backgroundColor: '#31304d', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <div
          className="logo"
          style={{
            width: 120,
            height: 31,
            margin: '16px 24px 16px 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src="../image/logobenhvienKhoaiChau-removebg-preview.png"
            alt="Logo"
            style={{ width: 65, height: 65, borderRadius: '10px' }}
          />
        </div>
        <div>
          <h1 style={{ fontFamily: 'none', color: '#ffff' }}>Hệ thống quản trị bệnh viện Khoái Châu</h1>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          style={{ flex: 1, backgroundColor: '#4a90e2' }}
        />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Popover content={notificationContent} title="Thông báo" trigger="click" placement="bottomRight">
            <Badge
              count={notificationCount}
              offset={[10, 0]}
              showZero={true}
              style={{ backgroundColor: '#ff4d4f', right: 20 }}
            >
              <BellOutlined
                style={{ fontSize: '20px', color: '#ffff', marginRight: '16px', cursor: 'pointer' }}
              />
            </Badge>
          </Popover>
          <MailOutlined style={{ fontSize: '20px', color: '#ffff', marginRight: '16px' }} />
          <Popover
            content={userInfoContent}
            title="Thông tin người dùng"
            trigger="click"
            placement="bottomRight"
          >
            <UserOutlined
              style={{ fontSize: '20px', color: '#ffff', marginRight: '16px', cursor: 'pointer' }}
            />
          </Popover>
          <Button
            type="primary"
            onClick={handleLogout}
            style={{ backgroundColor: '#2ecc71', border: 'none', color: '#fff' }}
          >
            Đăng xuất
          </Button>
        </div>
      </Header>
      <Content style={{ padding: '0 48px', maxHeight: 2207, border: 20, backgroundColor: '#31304d' }}>
        <Breadcrumb style={{ margin: '16px 0', color: 'white' }} />
        <Layout
          style={{
            padding: '24px 0',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            marginLeft: -28,
            marginRight: -20,
            marginTop: -20,
          }}
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
          <Content style={{ padding: '0 24px', minHeight: 600 }}>{children}</Content>
        </Layout>
        <Footer style={{ textAlign: 'center', backgroundColor: '#31304d', color: '#ffffff' }}>
          © 2024 Hệ thống quản trị bệnh viện Khoái Châu
        </Footer>
      </Content>
    </Layout>
  );
};

export default Admin;