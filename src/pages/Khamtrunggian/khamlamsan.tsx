import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  message,
  Spin,
  Empty,
  Card,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Divider,
  Breadcrumb,
  Form,
  Tooltip,
  Avatar,
  Tabs,
  Input as AntInput
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MedicineBoxOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  InsuranceOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  BellOutlined,
  CalendarOutlined,
  HomeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = AntInput;

interface Appointment {
  id: number;
  khach_hang_id: number;
  ho_ten: string;
  so_dien_thoai: string;
  trieu_chung: string;
  khoa_id: number;
  khoa_name: string;
  bac_si_id: number | null;
  status: number;
  source: string;
  so_bao_hiem_y_te: string;
  bao_hiem_y_te: boolean | null;
  created_at: string;
  ket_qua_kham: string | null;
}

interface Department {
  id: string;
  name: string;
}

interface AppointmentStats {
  total: number;
  pending: number;
  received: number;
}

const KhamTieuHoa: React.FC = () => {
  // State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isKetLuanModalVisible, setIsKetLuanModalVisible] = useState<boolean>(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [selectedKhoaId, setSelectedKhoaId] = useState<string>('');
  const [ketQuaKham, setKetQuaKham] = useState<string>('');
  const [stats, setStats] = useState<AppointmentStats>({ total: 0, pending: 0, received: 0 });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [transferLoading, setTransferLoading] = useState<boolean>(false);
  const [ketLuanLoading, setKetLuanLoading] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<string>('all');

  // Lấy thông tin từ session
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const khoaId = user.khoa_id;
  const bacSiId = user.bac_si_id;
  const khoaName = user.khoa_name || 'Tiêu hóa'; // Fallback nếu không có tên khoa

  // Lấy dữ liệu lịch hẹn và khoa
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appointmentsRes, departmentsRes] = await Promise.all([
          axios.get(`http://localhost:9999/api/letan/appointments?khoa_id=${khoaId}`),
          axios.get('http://localhost:9999/api/khoa/getall'),
        ]);

        // Process appointment data
        const data = appointmentsRes.data.data.map((appt: any) => ({
          ...appt,
          bac_si_id: appt.bac_si_id === null ? null : appt.bac_si_id,
          status: Number(appt.status),
          ket_qua_kham: appt.ket_qua_kham || null,
        }));

        setAppointments(data);
        setFilteredAppointments(data);

        // Tính toán thống kê
        const total = data.length;
        const pending = data.filter((app: Appointment) => app.status === 0).length;
        const received = data.filter((app: Appointment) => app.status === 1).length;
        setStats({ total, pending, received });

        // Process departments (exclude current department)
        setDepartments(
          departmentsRes.data
            .filter((d: any) => d.id !== khoaId)
            .map((d: any) => ({
              id: d.id.toString(),
              name: d.ten,
            }))
        );

        // Display appropriate messages
        if (data.length === 0) {
          message.info('Không có lịch hẹn nào trong khoa');
        } else {
          const pendingAppointments = data.filter(
            (appt: Appointment) => appt.status === 0 && appt.bac_si_id === null
          );
          if (pendingAppointments.length === 0 && total > 0) {
            message.info('Không có lịch hẹn nào chưa được nhận');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (khoaId) {
      fetchData();
    } else {
      message.error('Không tìm thấy thông tin khoa. Vui lòng đăng nhập lại.');
    }
  }, [khoaId]);

  // Filter appointments based on search and status
  useEffect(() => {
    let filtered = appointments;

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(
        (appt) =>
          appt.ho_ten.toLowerCase().includes(searchText.toLowerCase()) ||
          appt.so_dien_thoai.includes(searchText)
      );
    }

    // Filter by status
    if (activeTabKey !== 'all') {
      if (activeTabKey === 'pending') {
        filtered = filtered.filter((appt) => appt.status === 0);
      } else if (activeTabKey === 'received') {
        filtered = filtered.filter((appt) => appt.status === 1);
      }
    }

    // Additional filter for dropdown
    if (statusFilter !== 'all') {
      filtered = filtered.filter((appt) =>
        statusFilter === 'pending' ? appt.status === 0 : appt.status === 1
      );
    }

    setFilteredAppointments(filtered);
  }, [searchText, statusFilter, appointments, activeTabKey]);

  // Handle accepting an appointment
  const handleNhanLich = async (appointmentId: number) => {
    if (!bacSiId) {
      message.error('Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setLoading(true);
      await axios.put(`http://localhost:9999/api/letan/nhan-lich/${appointmentId}/${bacSiId}`);
      
      // Update local state
      const updatedAppointments = appointments.map((appt) =>
        appt.id === appointmentId ? { ...appt, bac_si_id: bacSiId, status: 1 } : appt
      );
      setAppointments(updatedAppointments);
      
      // Update statistics
      const pending = updatedAppointments.filter((app: Appointment) => app.status === 0).length;
      const received = updatedAppointments.filter((app: Appointment) => app.status === 1).length;
      setStats({ ...stats, pending, received });
      
      message.success('Nhận lịch khám thành công!');
    } catch (error) {
      console.error('Error accepting appointment:', error);
      message.error('Có lỗi khi nhận lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Handle department transfer
  const handleChuyenKhoa = async () => {
    if (!selectedAppointmentId || !selectedKhoaId) {
      message.error('Vui lòng chọn khoa để chuyển');
      return;
    }

    try {
      setTransferLoading(true);
      await axios.put(`http://localhost:9999/api/letan/chuyen-khoa/${selectedAppointmentId}`, {
        khoa_id: parseInt(selectedKhoaId),
      });
      
      // Update local state
      const updatedAppointments = appointments.filter((appt) => appt.id !== selectedAppointmentId);
      setAppointments(updatedAppointments);
      
      // Update statistics
      const total = updatedAppointments.length;
      const pending = updatedAppointments.filter((app: Appointment) => app.status === 0).length;
      const received = updatedAppointments.filter((app: Appointment) => app.status === 1).length;
      setStats({ total, pending, received });
      
      message.success('Chuyển khoa thành công');
      setIsModalVisible(false);
      setSelectedKhoaId('');
      setSelectedAppointmentId(null);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error transferring department:', error);
      message.error('Có lỗi khi chuyển khoa. Vui lòng thử lại.');
    } finally {
      setTransferLoading(false);
    }
  };

  // Handle save conclusion
  const handleLuuKetLuan = async () => {
    if (!selectedAppointmentId || !ketQuaKham.trim()) {
      message.error('Vui lòng nhập kết luận khám');
      return;
    }

    try {
      setKetLuanLoading(true);
      await axios.put(`http://localhost:9999/api/letan/ket-luan/${selectedAppointmentId}`, {
        ket_qua_kham: ketQuaKham,
        bac_si_id: bacSiId,
      });

      // Update local state
      const updatedAppointments = appointments.map((appt) =>
        appt.id === selectedAppointmentId ? { ...appt, ket_qua_kham: ketQuaKham } : appt
      );
      setAppointments(updatedAppointments);
      
      message.success('Lưu kết luận thành công');
      setIsKetLuanModalVisible(false);
      setKetQuaKham('');
      setSelectedAppointmentId(null);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error saving conclusion:', error);
      message.error('Có lỗi khi lưu kết luận. Vui lòng thử lại.');
    } finally {
      setKetLuanLoading(false);
    }
  };

  // Show transfer modal
  const showChuyenKhoaModal = (appointmentId: number) => {
    const appt = appointments.find(a => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setIsModalVisible(true);
  };

  // Show conclusion modal
  const showKetLuanModal = (appointmentId: number, currentKetQua: string | null) => {
    const appt = appointments.find(a => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setKetQuaKham(currentKetQua || '');
    setIsKetLuanModalVisible(true);
  };

  // Close modals
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedKhoaId('');
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const handleCancelKetLuan = () => {
    setIsKetLuanModalVisible(false);
    setKetQuaKham('');
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  // Get status tag with color
  const getStatusTag = (status: number) => {
    if (status === 0) {
      return <Tag color="orange" icon={<ClockCircleOutlined />}>Chưa nhận</Tag>;
    }
    return <Tag color="green" icon={<CheckCircleOutlined />}>Đã nhận</Tag>;
  };

  // Get insurance tag with color
  const getInsuranceTag = (hasInsurance: boolean | null, insuranceNumber: string) => {
    if (hasInsurance) {
      return (
        <Tooltip title={insuranceNumber}>
          <Tag color="blue" icon={<InsuranceOutlined />}>
            {insuranceNumber || 'Có BHYT'}
          </Tag>
        </Tooltip>
      );
    }
    return <Tag color="default">Không có BHYT</Tag>;
  };

  // Table columns
  const columns = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Thông tin bệnh nhân',
      key: 'patient',
      width: 250,
      render: (_: any, record: Appointment) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <Text strong>{record.ho_ten}</Text>
          </Space>
          <Space align="center">
            <PhoneOutlined style={{ color: '#1890ff' }} />
            <Text>{record.so_dien_thoai}</Text>
          </Space>
          {record.bao_hiem_y_te !== null && (
            <div style={{ marginTop: 4 }}>
              {getInsuranceTag(record.bao_hiem_y_te, record.so_bao_hiem_y_te)}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Triệu chứng',
      dataIndex: 'trieu_chung',
      key: 'trieu_chung',
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <Paragraph ellipsis={{ rows: 2 }}>{text}</Paragraph>
        </Tooltip>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {formatDate(date)}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: 'Kết luận',
      dataIndex: 'ket_qua_kham',
      key: 'ket_qua_kham',
      ellipsis: { showTitle: false },
      render: (ket_qua_kham: string | null) => (
        <Tooltip title={ket_qua_kham} placement="topLeft">
          <Paragraph ellipsis={{ rows: 2 }}>{ket_qua_kham || 'Chưa có'}</Paragraph>
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 250,
      render: (_: any, record: Appointment) => (
        <Space>
          {record.status === 0 && record.bac_si_id === null && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              size="middle"
              onClick={() => handleNhanLich(record.id)}
            >
              Nhận lịch
            </Button>
          )}
          {record.status === 1 && record.bac_si_id === bacSiId && (
            <Button
              type="default"
              icon={<FileTextOutlined />}
              size="middle"
              onClick={() => showKetLuanModal(record.id, record.ket_qua_kham)}
            >
              Kết luận
            </Button>
          )}
          <Button 
            type="default"
            icon={<SwapOutlined />}
            size="middle"
            onClick={() => showChuyenKhoaModal(record.id)}
          >
            Chuyển khoa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="appointment-manager" style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            <Breadcrumb>
              <Breadcrumb.Item>
                <HomeOutlined />
              </Breadcrumb.Item>
              <Breadcrumb.Item>Quản lý khám bệnh</Breadcrumb.Item>
              <Breadcrumb.Item>{khoaName}</Breadcrumb.Item>
            </Breadcrumb>
            <Title level={2} style={{ margin: '16px 0' }}>
              <MedicineBoxOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Quản lý lịch hẹn - Khoa {khoaName}
            </Title>
          </Card>
        </Col>

        <Col span={24}>
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Tổng số lịch hẹn"
                  value={stats.total}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Chưa nhận"
                  value={stats.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Đã nhận"
                  value={stats.received}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Card>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={16}>
                <Input
                  placeholder="Tìm kiếm theo tên bệnh nhân hoặc số điện thoại"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                />
              </Col>
              <Col span={8}>
                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  <Option value="pending">Chưa nhận</Option>
                  <Option value="received">Đã nhận</Option>
                </Select>
              </Col>
            </Row>

            <Tabs activeKey={activeTabKey} onChange={handleTabChange} size="large">
              <TabPane 
                tab={
                  <span><FileSearchOutlined /> Tất cả ({stats.total})</span>
                } 
                key="all"
              />
              <TabPane 
                tab={
                  <span><ClockCircleOutlined /> Chưa nhận ({stats.pending})</span>
                } 
                key="pending"
              />
              <TabPane 
                tab={
                  <span><CheckCircleOutlined /> Đã nhận ({stats.received})</span>
                } 
                key="received"
              />
            </Tabs>

            <Spin spinning={loading}>
              {filteredAppointments.length === 0 ? (
                <Empty 
                  description="Không có lịch hẹn nào" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  style={{ margin: '40px 0' }}
                />
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredAppointments}
                  rowKey="id"
                  pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng cộng ${total} lịch hẹn`,
                    showQuickJumper: true
                  }}
                  bordered
                  size="middle"
                  style={{ marginTop: 16 }}
                />
              )}
            </Spin>
          </Card>
        </Col>
      </Row>

      {/* Modal Chuyển Khoa */}
      <Modal
        title={
          <Space>
            <SwapOutlined style={{ color: '#1890ff' }} />
            <span>Chuyển khoa cho bệnh nhân</span>
          </Space>
        }
        visible={isModalVisible}
        onOk={handleChuyenKhoa}
        onCancel={handleCancel}
        okText="Xác nhận chuyển"
        cancelText="Hủy"
        confirmLoading={transferLoading}
        width={600}
      >
        {selectedAppointment && (
          <>
            <Card bordered={false} style={{ marginBottom: 16 }}>
              <Space align="start">
                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <div>
                  <Title level={4}>{selectedAppointment.ho_ten}</Title>
                  <Space direction="vertical" size={2}>
                    <Text type="secondary">
                      <PhoneOutlined /> {selectedAppointment.so_dien_thoai}
                    </Text>
                    {selectedAppointment.bao_hiem_y_te !== null && (
                      <Text type="secondary">
                        <InsuranceOutlined /> {selectedAppointment.bao_hiem_y_te ? 'Có BHYT' : 'Không có BHYT'}
                        {selectedAppointment.so_bao_hiem_y_te && ` - ${selectedAppointment.so_bao_hiem_y_te}`}
                      </Text>
                    )}
                  </Space>
                </div>
              </Space>
            </Card>

            <Card 
              title={
                <Space>
                  <InfoCircleOutlined style={{ color: '#fa8c16' }} />
                  <span>Triệu chứng</span>
                </Space>
              }
              bordered={false}
              style={{ marginBottom: 16 }}
            >
              <Paragraph>{selectedAppointment.trieu_chung}</Paragraph>
            </Card>
          </>
        )}
        
        <Form layout="vertical">
          <Form.Item
            label={
              <Space>
                <MedicineBoxOutlined />
                <span>Chọn khoa chuyển đến</span>
              </Space>
            }
            required
            validateStatus={!selectedKhoaId && selectedAppointmentId ? 'error' : ''}
            help={!selectedKhoaId && selectedAppointmentId ? 'Vui lòng chọn khoa' : ''}
          >
            <Select
              placeholder="Chọn khoa chuyển đến"
              value={selectedKhoaId}
              onChange={(value) => setSelectedKhoaId(value)}
              style={{ width: '100%' }}
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        
        <div style={{ marginTop: 16 }}>
          <Tag color="orange" icon={<BellOutlined />}>
            Lưu ý: Sau khi chuyển khoa, lịch hẹn sẽ được chuyển sang danh sách của khoa mới
          </Tag>
        </div>
      </Modal>

      {/* Modal Kết luận */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span>Nhập kết luận khám</span>
          </Space>
        }
        visible={isKetLuanModalVisible}
        onOk={handleLuuKetLuan}
        onCancel={handleCancelKetLuan}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={ketLuanLoading}
        width={600}
      >
        {selectedAppointment && (
          <Card bordered={false} style={{ marginBottom: 16 }}>
            <Space align="start">
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div>
                <Title level={4}>{selectedAppointment.ho_ten}</Title>
                <Space direction="vertical" size={2}>
                  <Text type="secondary">
                    <PhoneOutlined /> {selectedAppointment.so_dien_thoai}
                  </Text>
                  <Text type="secondary">
                    <InfoCircleOutlined /> {selectedAppointment.trieu_chung}
                  </Text>
                </Space>
              </div>
            </Space>
          </Card>
        )}
        <Form layout="vertical">
          <Form.Item
            label="Kết luận khám"
            required
            validateStatus={!ketQuaKham.trim() && isKetLuanModalVisible ? 'error' : ''}
            help={!ketQuaKham.trim() && isKetLuanModalVisible ? 'Vui lòng nhập kết luận' : ''}
          >
            <TextArea
              rows={4}
              value={ketQuaKham}
              onChange={(e) => setKetQuaKham(e.target.value)}
              placeholder="Nhập kết luận khám (ví dụ: Viêm dạ dày nhẹ, kê đơn thuốc)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KhamTieuHoa;