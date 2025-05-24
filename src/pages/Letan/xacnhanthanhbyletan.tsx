import React, { useState } from 'react';
import axios from 'axios';
import { 
  Button, 
  Input, 
  message, 
  Divider, 
  Tag, 
  Card, 
  Row, 
  Col, 
  Descriptions, 
  Spin,
  Typography,
  Space,
  Alert
} from 'antd';
import { 
  DollarOutlined, 
  SearchOutlined, 
  UserOutlined, 
  IdcardOutlined, 
  PhoneOutlined, 
  CalendarOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  ScheduleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Xacnhanthanhtoanbyletan = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) {
      message.error('Vui lòng nhập số điện thoại hoặc CMND để tìm kiếm!');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:9999/api/letan/tra-cuu', {
        params: {
          so_dien_thoai: searchQuery,
          CMND: searchQuery,
        },
      });

      const { user: fetchedUser, appointments } = response.data.data;

      if (!fetchedUser) {
        setUser(null);
        setAppointment(null);
        message.info('Không tìm thấy bệnh nhân.');
        return;
      }

      setUser(fetchedUser);

      if (appointments.length > 0) {
        setAppointment(appointments[0]);
        message.success('Đã tìm thấy bệnh nhân và lịch hẹn.');
      } else {
        setAppointment(null);
        message.success('Đã tìm thấy bệnh nhân, nhưng không có lịch hẹn hôm nay.');
      }
    } catch (error: any) {
      console.error('Lỗi khi tìm kiếm:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi tra cứu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };


  const handleConfirmPayment = async () => {
    if (!appointment?.appointment_id) {
      message.error('Không có lịch hẹn để xác nhận thanh toán!');
      return;
    }

    try {
      setLoading(true);
      const nguoiDuyetId = 2;
      await axios.post(`http://localhost:9999/api/letan/thanhtoan/xac-nhan/${appointment.appointment_id}`, {
        nguoi_duyet_id: nguoiDuyetId,
      });
      message.success('Xác nhận thanh toán thành công');

      setAppointment((prev: any) => (prev ? { ...prev, da_thanh_toan: 1 } : null));
    } catch (error: any) {
      console.error('Lỗi khi xác nhận thanh toán:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi xác nhận thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card 
        title={<Title level={3} className="text-center">XÁC NHẬN THANH TOÁN</Title>}
        bordered={false}
        className="shadow-md"
      >
        {/* Search Section */}
        <Space direction="vertical" size="large" className="w-full">
          <Input
            placeholder="Nhập số điện thoại hoặc CMND bệnh nhân"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            suffix={<SearchOutlined />}
            size="large"
            allowClear
            prefix={<UserOutlined />}
          />
          
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
            block
            size="large"
          >
            TRA CỨU BỆNH NHÂN
          </Button>
        </Space>

        {loading && (
          <div className="text-center my-8">
            <Spin size="large" />
            <p className="mt-4">Đang tìm kiếm thông tin...</p>
          </div>
        )}

        {/* Patient Information */}
        {user && (
          <Card 
            title={<Text strong><UserOutlined /> THÔNG TIN BỆNH NHÂN</Text>}
            className="mt-6"
            bordered={false}
          >
            <Descriptions column={1} bordered>
              <Descriptions.Item label={<Text strong><UserOutlined /> Họ tên</Text>}>
                {user.ho_ten}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong><PhoneOutlined /> Số điện thoại</Text>}>
                {user.so_dien_thoai}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong><IdcardOutlined /> CMND</Text>}>
                {user.CMND}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong><CalendarOutlined /> Ngày sinh</Text>}>
                {dayjs(user.ngay_sinh).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong><HomeOutlined /> Địa chỉ</Text>}>
                {user.dia_chi}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Appointment Information */}
        {appointment && (
          <Card 
            title={<Text strong><ScheduleOutlined /> THÔNG TIN LỊCH HẸN</Text>}
            className="mt-6"
            bordered={false}
          >
            <Descriptions column={1} bordered>
              <Descriptions.Item label={<Text strong>ID Lịch hẹn</Text>}>
                {appointment.appointment_id}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong><MedicineBoxOutlined /> Khoa</Text>}>
                {appointment.khoa_id}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong><UserOutlined /> Bác sĩ</Text>}>
                {appointment.bac_si_id}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong><InfoCircleOutlined /> Triệu chứng</Text>}>
                {appointment.trieu_chung}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong><CalendarOutlined /> Ngày khám</Text>}>
                {dayjs(appointment.ngay_kham).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Hình thức</Text>}>
                <Tag 
                  icon={appointment.source === 'online' ? <InfoCircleOutlined /> : <UserOutlined />}
                  color={appointment.source === 'online' ? 'blue' : 'green'}
                >
                  {appointment.source === 'online' ? 'Đặt khám trực tuyến' : 'Đặt khám trực tiếp'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<Text strong>Trạng thái thanh toán</Text>}>
                <Tag 
                  icon={<DollarOutlined />}
                  color={appointment.da_thanh_toan === 1 ? 'success' : 'error'}
                >
                  {appointment.da_thanh_toan === 1 ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {appointment.da_thanh_toan !== 1 && (
              <div className="text-center mt-6">
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  onClick={handleConfirmPayment}
                  loading={loading}
                  size="large"
                  className="min-w-40"
                >
                  XÁC NHẬN THANH TOÁN
                </Button>
              </div>
            )}
          </Card>
        )}

        {!user && !loading && (
          <Alert
            message="Hướng dẫn"
            description="Vui lòng nhập số điện thoại hoặc CMND của bệnh nhân để tra cứu thông tin."
            type="info"
            showIcon
            className="mt-6"
          />
        )}
      </Card>
    </div>
  );
};

export default Xacnhanthanhtoanbyletan;