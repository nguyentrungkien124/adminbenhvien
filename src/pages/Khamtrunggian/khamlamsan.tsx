// import React, { useState, useEffect } from 'react';
// import {
//   Table,
//   Button,
//   Input,
//   Select,
//   Modal,
//   message,
//   Spin,
//   Empty,
//   Card,
//   Typography,
//   Space,
//   Tag,
//   Row,
//   Col,
//   Statistic,
//   Divider,
//   Breadcrumb,
//   Form,
//   Tooltip,
//   Avatar,
//   Tabs,
//   Input as AntInput
// } from 'antd';
// import {
//   SearchOutlined,
//   UserOutlined,
//   PhoneOutlined,
//   MedicineBoxOutlined,
//   SwapOutlined,
//   CheckCircleOutlined,
//   ClockCircleOutlined,
//   TeamOutlined,
//   InsuranceOutlined,
//   FileSearchOutlined,
//   InfoCircleOutlined,
//   BellOutlined,
//   CalendarOutlined,
//   HomeOutlined,
//   FileTextOutlined
// } from '@ant-design/icons';
// import axios from 'axios';
// import dayjs from 'dayjs';

// const { Title, Text, Paragraph } = Typography;
// const { Option } = Select;
// const { TabPane } = Tabs;
// const { TextArea } = AntInput;

// interface Appointment {
//   id: number;
//   khach_hang_id: number;
//   ho_ten: string;
//   so_dien_thoai: string;
//   trieu_chung: string;
//   khoa_id: number;
//   khoa_name: string;
//   bac_si_id: number | null;
//   status: number;
//   source: string;
//   so_bao_hiem_y_te: string;
//   bao_hiem_y_te: boolean | null;
//   created_at: string;
//   ket_qua_kham: string | null;
// }

// interface Department {
//   id: string;
//   name: string;
// }

// interface AppointmentStats {
//   total: number;
//   pending: number;
//   received: number;
// }

// const KhamTieuHoa: React.FC = () => {
//   // State
//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [searchText, setSearchText] = useState<string>('');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
//   const [isKetLuanModalVisible, setIsKetLuanModalVisible] = useState<boolean>(false);
//   const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
//   const [selectedKhoaId, setSelectedKhoaId] = useState<string>('');
//   const [ketQuaKham, setKetQuaKham] = useState<string>('');
//   const [stats, setStats] = useState<AppointmentStats>({ total: 0, pending: 0, received: 0 });
//   const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
//   const [transferLoading, setTransferLoading] = useState<boolean>(false);
//   const [ketLuanLoading, setKetLuanLoading] = useState<boolean>(false);
//   const [activeTabKey, setActiveTabKey] = useState<string>('all');

//   // Lấy thông tin từ session
//   const user = JSON.parse(sessionStorage.getItem('user') || '{}');
//   const khoaId = user.khoa_id;
//   const bacSiId = user.bac_si_id;
//   const khoaName = user.khoa_name || 'Tiêu hóa'; // Fallback nếu không có tên khoa

//   // Lấy dữ liệu lịch hẹn và khoa
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [appointmentsRes, departmentsRes] = await Promise.all([
//           axios.get(`http://localhost:9999/api/letan/appointments?khoa_id=${khoaId}`),
//           axios.get('http://localhost:9999/api/khoa/getall'),
//         ]);

//         // Process appointment data
//         const data = appointmentsRes.data.data.map((appt: any) => ({
//           ...appt,
//           bac_si_id: appt.bac_si_id === null ? null : appt.bac_si_id,
//           status: Number(appt.status),
//           ket_qua_kham: appt.ket_qua_kham || null,
//         }));

//         setAppointments(data);
//         setFilteredAppointments(data);

//         // Tính toán thống kê
//         const total = data.length;
//         const pending = data.filter((app: Appointment) => app.status === 0).length;
//         const received = data.filter((app: Appointment) => app.status === 1).length;
//         setStats({ total, pending, received });

//         // Process departments (exclude current department)
//         setDepartments(
//           departmentsRes.data
//             .filter((d: any) => d.id !== khoaId)
//             .map((d: any) => ({
//               id: d.id.toString(),
//               name: d.ten,
//             }))
//         );

//         // Display appropriate messages
//         if (data.length === 0) {
//           message.info('Không có lịch hẹn nào trong khoa');
//         } else {
//           const pendingAppointments = data.filter(
//             (appt: Appointment) => appt.status === 0 && appt.bac_si_id === null
//           );
//           if (pendingAppointments.length === 0 && total > 0) {
//             message.info('Không có lịch hẹn nào chưa được nhận');
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (khoaId) {
//       fetchData();
//     } else {
//       message.error('Không tìm thấy thông tin khoa. Vui lòng đăng nhập lại.');
//     }
//   }, [khoaId]);

//   // Filter appointments based on search and status
//   useEffect(() => {
//     let filtered = appointments;

//     // Filter by search text
//     if (searchText) {
//       filtered = filtered.filter(
//         (appt) =>
//           appt.ho_ten.toLowerCase().includes(searchText.toLowerCase()) ||
//           appt.so_dien_thoai.includes(searchText)
//       );
//     }

//     // Filter by status
//     if (activeTabKey !== 'all') {
//       if (activeTabKey === 'pending') {
//         filtered = filtered.filter((appt) => appt.status === 0);
//       } else if (activeTabKey === 'received') {
//         filtered = filtered.filter((appt) => appt.status === 1);
//       }
//     }

//     // Additional filter for dropdown
//     if (statusFilter !== 'all') {
//       filtered = filtered.filter((appt) =>
//         statusFilter === 'pending' ? appt.status === 0 : appt.status === 1
//       );
//     }

//     setFilteredAppointments(filtered);
//   }, [searchText, statusFilter, appointments, activeTabKey]);

//   // Handle accepting an appointment
//   const handleNhanLich = async (appointmentId: number) => {
//     if (!bacSiId) {
//       message.error('Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.');
//       return;
//     }

//     try {
//       setLoading(true);
//       await axios.put(`http://localhost:9999/api/letan/nhan-lich/${appointmentId}/${bacSiId}`);

//       // Update local state
//       const updatedAppointments = appointments.map((appt) =>
//         appt.id === appointmentId ? { ...appt, bac_si_id: bacSiId, status: 1 } : appt
//       );
//       setAppointments(updatedAppointments);

//       // Update statistics
//       const pending = updatedAppointments.filter((app: Appointment) => app.status === 0).length;
//       const received = updatedAppointments.filter((app: Appointment) => app.status === 1).length;
//       setStats({ ...stats, pending, received });

//       message.success('Nhận lịch khám thành công!');
//     } catch (error) {
//       console.error('Error accepting appointment:', error);
//       message.error('Có lỗi khi nhận lịch. Vui lòng thử lại.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle department transfer
//   const handleChuyenKhoa = async () => {
//     if (!selectedAppointmentId || !selectedKhoaId) {
//       message.error('Vui lòng chọn khoa để chuyển');
//       return;
//     }

//     try {
//       setTransferLoading(true);
//       await axios.put(`http://localhost:9999/api/letan/chuyen-khoa/${selectedAppointmentId}`, {
//         khoa_id: parseInt(selectedKhoaId),
//       });

//       // Update local state
//       const updatedAppointments = appointments.filter((appt) => appt.id !== selectedAppointmentId);
//       setAppointments(updatedAppointments);

//       // Update statistics
//       const total = updatedAppointments.length;
//       const pending = updatedAppointments.filter((app: Appointment) => app.status === 0).length;
//       const received = updatedAppointments.filter((app: Appointment) => app.status === 1).length;
//       setStats({ total, pending, received });

//       message.success('Chuyển khoa thành công');
//       setIsModalVisible(false);
//       setSelectedKhoaId('');
//       setSelectedAppointmentId(null);
//       setSelectedAppointment(null);
//     } catch (error) {
//       console.error('Error transferring department:', error);
//       message.error('Có lỗi khi chuyển khoa. Vui lòng thử lại.');
//     } finally {
//       setTransferLoading(false);
//     }
//   };

//   // Handle save conclusion
//   const handleLuuKetLuan = async () => {
//     if (!selectedAppointmentId || !ketQuaKham.trim()) {
//       message.error('Vui lòng nhập kết luận khám');
//       return;
//     }

//     try {
//       setKetLuanLoading(true);
//       await axios.put(`http://localhost:9999/api/letan/ket-luan/${selectedAppointmentId}`, {
//         ket_qua_kham: ketQuaKham,
//         bac_si_id: bacSiId,
//       });

//       // Update local state
//       const updatedAppointments = appointments.map((appt) =>
//         appt.id === selectedAppointmentId ? { ...appt, ket_qua_kham: ketQuaKham } : appt
//       );
//       setAppointments(updatedAppointments);

//       message.success('Lưu kết luận thành công');
//       setIsKetLuanModalVisible(false);
//       setKetQuaKham('');
//       setSelectedAppointmentId(null);
//       setSelectedAppointment(null);
//     } catch (error) {
//       console.error('Error saving conclusion:', error);
//       message.error('Có lỗi khi lưu kết luận. Vui lòng thử lại.');
//     } finally {
//       setKetLuanLoading(false);
//     }
//   };

//   // Show transfer modal
//   const showChuyenKhoaModal = (appointmentId: number) => {
//     const appt = appointments.find(a => a.id === appointmentId) || null;
//     setSelectedAppointment(appt);
//     setSelectedAppointmentId(appointmentId);
//     setIsModalVisible(true);
//   };

//   // Show conclusion modal
//   const showKetLuanModal = (appointmentId: number, currentKetQua: string | null) => {
//     const appt = appointments.find(a => a.id === appointmentId) || null;
//     setSelectedAppointment(appt);
//     setSelectedAppointmentId(appointmentId);
//     setKetQuaKham(currentKetQua || '');
//     setIsKetLuanModalVisible(true);
//   };

//   // Close modals
//   const handleCancel = () => {
//     setIsModalVisible(false);
//     setSelectedKhoaId('');
//     setSelectedAppointmentId(null);
//     setSelectedAppointment(null);
//   };

//   const handleCancelKetLuan = () => {
//     setIsKetLuanModalVisible(false);
//     setKetQuaKham('');
//     setSelectedAppointmentId(null);
//     setSelectedAppointment(null);
//   };

//   // Format date
//   const formatDate = (dateString: string) => {
//     return dayjs(dateString).format('DD/MM/YYYY HH:mm');
//   };

//   // Handle tab change
//   const handleTabChange = (key: string) => {
//     setActiveTabKey(key);
//   };

//   // Get status tag with color
//   const getStatusTag = (status: number) => {
//     if (status === 0) {
//       return <Tag color="orange" icon={<ClockCircleOutlined />}>Chưa nhận</Tag>;
//     }
//     return <Tag color="green" icon={<CheckCircleOutlined />}>Đã nhận</Tag>;
//   };

//   // Get insurance tag with color
//   const getInsuranceTag = (hasInsurance: boolean | null, insuranceNumber: string) => {
//     if (hasInsurance) {
//       return (
//         <Tooltip title={insuranceNumber}>
//           <Tag color="blue" icon={<InsuranceOutlined />}>
//             {insuranceNumber || 'Có BHYT'}
//           </Tag>
//         </Tooltip>
//       );
//     }
//     return <Tag color="default">Không có BHYT</Tag>;
//   };

//   // Table columns
//   const columns = [
//     {
//       title: 'Mã',
//       dataIndex: 'id',
//       key: 'id',
//       width: 80,
//     },
//     {
//       title: 'Thông tin bệnh nhân',
//       key: 'patient',
//       width: 250,
//       render: (_: any, record: Appointment) => (
//         <Space direction="vertical" size={0}>
//           <Space>
//             <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
//             <Text strong>{record.ho_ten}</Text>
//           </Space>
//           <Space align="center">
//             <PhoneOutlined style={{ color: '#1890ff' }} />
//             <Text>{record.so_dien_thoai}</Text>
//           </Space>
//           {record.bao_hiem_y_te !== null && (
//             <div style={{ marginTop: 4 }}>
//               {getInsuranceTag(record.bao_hiem_y_te, record.so_bao_hiem_y_te)}
//             </div>
//           )}
//         </Space>
//       ),
//     },
//     {
//       title: 'Triệu chứng',
//       dataIndex: 'trieu_chung',
//       key: 'trieu_chung',
//       ellipsis: { showTitle: false },
//       render: (text: string) => (
//         <Tooltip title={text} placement="topLeft">
//           <Paragraph ellipsis={{ rows: 2 }}>{text}</Paragraph>
//         </Tooltip>
//       ),
//     },
//     {
//       title: 'Ngày tạo',
//       dataIndex: 'created_at',
//       key: 'created_at',
//       width: 150,
//       render: (date: string) => (
//         <Space>
//           <CalendarOutlined />
//           {formatDate(date)}
//         </Space>
//       ),
//     },
//     {
//       title: 'Trạng thái',
//       dataIndex: 'status',
//       key: 'status',
//       width: 120,
//       render: (status: number) => getStatusTag(status),
//     },
//     {
//       title: 'Kết luận',
//       dataIndex: 'ket_qua_kham',
//       key: 'ket_qua_kham',
//       ellipsis: { showTitle: false },
//       render: (ket_qua_kham: string | null) => (
//         <Tooltip title={ket_qua_kham} placement="topLeft">
//           <Paragraph ellipsis={{ rows: 2 }}>{ket_qua_kham || 'Chưa có'}</Paragraph>
//         </Tooltip>
//       ),
//     },
//     {
//       title: 'Hành động',
//       key: 'action',
//       width: 250,
//       render: (_: any, record: Appointment) => (
//         <Space>
//           {record.status === 0 && record.bac_si_id === null && (
//             <Button
//               type="primary"
//               icon={<CheckCircleOutlined />}
//               size="middle"
//               onClick={() => handleNhanLich(record.id)}
//             >
//               Nhận lịch
//             </Button>
//           )}
//           {record.status === 1 && record.bac_si_id === bacSiId && (
//             <Button
//               type="default"
//               icon={<FileTextOutlined />}
//               size="middle"
//               onClick={() => showKetLuanModal(record.id, record.ket_qua_kham)}
//             >
//               Kết luận
//             </Button>
//           )}
//           <Button 
//             type="default"
//             icon={<SwapOutlined />}
//             size="middle"
//             onClick={() => showChuyenKhoaModal(record.id)}
//           >
//             Chuyển khoa
//           </Button>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="appointment-manager" style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
//       <Row gutter={[0, 16]}>
//         <Col span={24}>
//           <Card>
//             <Breadcrumb>
//               <Breadcrumb.Item>
//                 <HomeOutlined />
//               </Breadcrumb.Item>
//               <Breadcrumb.Item>Quản lý khám bệnh</Breadcrumb.Item>
//               <Breadcrumb.Item>{khoaName}</Breadcrumb.Item>
//             </Breadcrumb>
//             <Title level={2} style={{ margin: '16px 0' }}>
//               <MedicineBoxOutlined style={{ marginRight: 8, color: '#1890ff' }} />
//               Quản lý lịch hẹn - Khoa {khoaName}
//             </Title>
//           </Card>
//         </Col>

//         <Col span={24}>
//           <Row gutter={16}>
//             <Col span={8}>
//               <Card>
//                 <Statistic
//                   title="Tổng số lịch hẹn"
//                   value={stats.total}
//                   prefix={<TeamOutlined />}
//                   valueStyle={{ color: '#1890ff' }}
//                 />
//               </Card>
//             </Col>
//             <Col span={8}>
//               <Card>
//                 <Statistic
//                   title="Chưa nhận"
//                   value={stats.pending}
//                   prefix={<ClockCircleOutlined />}
//                   valueStyle={{ color: '#fa8c16' }}
//                 />
//               </Card>
//             </Col>
//             <Col span={8}>
//               <Card>
//                 <Statistic
//                   title="Đã nhận"
//                   value={stats.received}
//                   prefix={<CheckCircleOutlined />}
//                   valueStyle={{ color: '#52c41a' }}
//                 />
//               </Card>
//             </Col>
//           </Row>
//         </Col>

//         <Col span={24}>
//           <Card>
//             <Row gutter={16} style={{ marginBottom: 16 }}>
//               <Col span={16}>
//                 <Input
//                   placeholder="Tìm kiếm theo tên bệnh nhân hoặc số điện thoại"
//                   prefix={<SearchOutlined />}
//                   value={searchText}
//                   onChange={(e) => setSearchText(e.target.value)}
//                   allowClear
//                   size="large"
//                 />
//               </Col>
//               <Col span={8}>
//                 <Select
//                   value={statusFilter}
//                   onChange={(value) => setStatusFilter(value)}
//                   style={{ width: '100%' }}
//                   size="large"
//                 >
//                   <Option value="all">Tất cả trạng thái</Option>
//                   <Option value="pending">Chưa nhận</Option>
//                   <Option value="received">Đã nhận</Option>
//                 </Select>
//               </Col>
//             </Row>

//             <Tabs activeKey={activeTabKey} onChange={handleTabChange} size="large">
//               <TabPane 
//                 tab={
//                   <span><FileSearchOutlined /> Tất cả ({stats.total})</span>
//                 } 
//                 key="all"
//               />
//               <TabPane 
//                 tab={
//                   <span><ClockCircleOutlined /> Chưa nhận ({stats.pending})</span>
//                 } 
//                 key="pending"
//               />
//               <TabPane 
//                 tab={
//                   <span><CheckCircleOutlined /> Đã nhận ({stats.received})</span>
//                 } 
//                 key="received"
//               />
//             </Tabs>

//             <Spin spinning={loading}>
//               {filteredAppointments.length === 0 ? (
//                 <Empty 
//                   description="Không có lịch hẹn nào" 
//                   image={Empty.PRESENTED_IMAGE_SIMPLE} 
//                   style={{ margin: '40px 0' }}
//                 />
//               ) : (
//                 <Table
//                   columns={columns}
//                   dataSource={filteredAppointments}
//                   rowKey="id"
//                   pagination={{ 
//                     pageSize: 10,
//                     showSizeChanger: true,
//                     showTotal: (total) => `Tổng cộng ${total} lịch hẹn`,
//                     showQuickJumper: true
//                   }}
//                   bordered
//                   size="middle"
//                   style={{ marginTop: 16 }}
//                 />
//               )}
//             </Spin>
//           </Card>
//         </Col>
//       </Row>

//       {/* Modal Chuyển Khoa */}
//       <Modal
//         title={
//           <Space>
//             <SwapOutlined style={{ color: '#1890ff' }} />
//             <span>Chuyển khoa cho bệnh nhân</span>
//           </Space>
//         }
//         visible={isModalVisible}
//         onOk={handleChuyenKhoa}
//         onCancel={handleCancel}
//         okText="Xác nhận chuyển"
//         cancelText="Hủy"
//         confirmLoading={transferLoading}
//         width={600}
//       >
//         {selectedAppointment && (
//           <>
//             <Card bordered={false} style={{ marginBottom: 16 }}>
//               <Space align="start">
//                 <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
//                 <div>
//                   <Title level={4}>{selectedAppointment.ho_ten}</Title>
//                   <Space direction="vertical" size={2}>
//                     <Text type="secondary">
//                       <PhoneOutlined /> {selectedAppointment.so_dien_thoai}
//                     </Text>
//                     {selectedAppointment.bao_hiem_y_te !== null && (
//                       <Text type="secondary">
//                         <InsuranceOutlined /> {selectedAppointment.bao_hiem_y_te ? 'Có BHYT' : 'Không có BHYT'}
//                         {selectedAppointment.so_bao_hiem_y_te && ` - ${selectedAppointment.so_bao_hiem_y_te}`}
//                       </Text>
//                     )}
//                   </Space>
//                 </div>
//               </Space>
//             </Card>

//             <Card 
//               title={
//                 <Space>
//                   <InfoCircleOutlined style={{ color: '#fa8c16' }} />
//                   <span>Triệu chứng</span>
//                 </Space>
//               }
//               bordered={false}
//               style={{ marginBottom: 16 }}
//             >
//               <Paragraph>{selectedAppointment.trieu_chung}</Paragraph>
//             </Card>
//           </>
//         )}

//         <Form layout="vertical">
//           <Form.Item
//             label={
//               <Space>
//                 <MedicineBoxOutlined />
//                 <span>Chọn khoa chuyển đến</span>
//               </Space>
//             }
//             required
//             validateStatus={!selectedKhoaId && selectedAppointmentId ? 'error' : ''}
//             help={!selectedKhoaId && selectedAppointmentId ? 'Vui lòng chọn khoa' : ''}
//           >
//             <Select
//               placeholder="Chọn khoa chuyển đến"
//               value={selectedKhoaId}
//               onChange={(value) => setSelectedKhoaId(value)}
//               style={{ width: '100%' }}
//               size="large"
//               showSearch
//               optionFilterProp="children"
//             >
//               {departments.map((dept) => (
//                 <Option key={dept.id} value={dept.id}>
//                   {dept.name}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>
//         </Form>

//         <div style={{ marginTop: 16 }}>
//           <Tag color="orange" icon={<BellOutlined />}>
//             Lưu ý: Sau khi chuyển khoa, lịch hẹn sẽ được chuyển sang danh sách của khoa mới
//           </Tag>
//         </div>
//       </Modal>

//       {/* Modal Kết luận */}
//       <Modal
//         title={
//           <Space>
//             <FileTextOutlined style={{ color: '#1890ff' }} />
//             <span>Nhập kết luận khám</span>
//           </Space>
//         }
//         visible={isKetLuanModalVisible}
//         onOk={handleLuuKetLuan}
//         onCancel={handleCancelKetLuan}
//         okText="Xác nhận"
//         cancelText="Hủy"
//         confirmLoading={ketLuanLoading}
//         width={600}
//       >
//         {selectedAppointment && (
//           <Card bordered={false} style={{ marginBottom: 16 }}>
//             <Space align="start">
//               <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
//               <div>
//                 <Title level={4}>{selectedAppointment.ho_ten}</Title>
//                 <Space direction="vertical" size={2}>
//                   <Text type="secondary">
//                     <PhoneOutlined /> {selectedAppointment.so_dien_thoai}
//                   </Text>
//                   <Text type="secondary">
//                     <InfoCircleOutlined /> {selectedAppointment.trieu_chung}
//                   </Text>
//                 </Space>
//               </div>
//             </Space>
//           </Card>
//         )}
//         <Form layout="vertical">
//           <Form.Item
//             label="Kết luận khám"
//             required
//             validateStatus={!ketQuaKham.trim() && isKetLuanModalVisible ? 'error' : ''}
//             help={!ketQuaKham.trim() && isKetLuanModalVisible ? 'Vui lòng nhập kết luận' : ''}
//           >
//             <TextArea
//               rows={4}
//               value={ketQuaKham}
//               onChange={(e) => setKetQuaKham(e.target.value)}
//               placeholder="Nhập kết luận khám (ví dụ: Viêm dạ dày nhẹ, kê đơn thuốc)"
//             />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default KhamTieuHoa;
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
  Breadcrumb,
  Form,
  Tooltip,
  Avatar,
  Tabs,
  Input as AntInput,
  Radio,
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
  FileTextOutlined,
  SolutionOutlined,
  PlusCircleOutlined,
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
  chuyen_khoa_ghi_chu: string | null;
  loai_dieu_tri: 'noi_tru' | 'ngoai_tru' | 'chua_quyet_dinh' | null;
  is_admitted: boolean;
  hasPrescription?: boolean;
}

interface Department {
  id: string;
  name: string;
}

interface Room {
  id: number;
  ten_phong: string;
}

interface Bed {
  id: number;
  room_id: number;
  ma_giuong: string;
}

interface Kho {
  kho_id: number;
  ten_san_pham: string;
  don_vi_tinh: string;
}

interface AppointmentStats {
  total: number;
  pending: number;
  received: number;
}

interface ChiDinhThuoc {
  id: number;
  kho_id: number;
  ten_thuoc: string;
  don_vi: string;
  so_luong: number;
  lieu_luong: string;
  tan_suat: string;
  ngay_chi_dinh: string;
  nguoi_chi_dinh: string;
  thanh_tien: number;
}

const KhamLamSan: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [khoList, setKhoList] = useState<Kho[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isKetLuanModalVisible, setIsKetLuanModalVisible] = useState<boolean>(false);
  const [isPhanLoaiModalVisible, setIsPhanLoaiModalVisible] = useState<boolean>(false);
  const [isXepGiuongModalVisible, setIsXepGiuongModalVisible] = useState<boolean>(false);
  const [isChiDinhThuocModalVisible, setIsChiDinhThuocModalVisible] = useState<boolean>(false);
  const [isDonThuocModalVisible, setIsDonThuocModalVisible] = useState<boolean>(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [selectedKhoaId, setSelectedKhoaId] = useState<string>('');
  const [chuyenKhoaGhiChu, setChuyenKhoaGhiChu] = useState<string>('');
  const [ketQuaKham, setKetQuaKham] = useState<string>('');
  const [loaiDieuTri, setLoaiDieuTri] = useState<'noi_tru' | 'ngoai_tru' | 'chua_quyet_dinh' | null>(null);
  const [selectedBedId, setSelectedBedId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [stats, setStats] = useState<AppointmentStats>({ total: 0, pending: 0, received: 0 });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [transferLoading, setTransferLoading] = useState<boolean>(false);
  const [ketLuanLoading, setKetLuanLoading] = useState<boolean>(false);
  const [phanLoaiLoading, setPhanLoaiLoading] = useState<boolean>(false);
  const [xepGiuongLoading, setXepGiuongLoading] = useState<boolean>(false);
  const [chiDinhThuocLoading, setChiDinhThuocLoading] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<string>('all');
  const [chiDinhThuocForm] = Form.useForm();
  const [donThuocData, setDonThuocData] = useState<ChiDinhThuoc[]>([]);

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const khoaId = user.khoa_id;
  const bacSiId = user.bac_si_id;
  const khoaName = user.khoa_name || 'Tim mạch';

  const checkHasPrescription = async (appointmentId: number): Promise<boolean> => {
    try {
      const response = await axios.get(`http://localhost:9999/api/noitru/chi-dinh-thuoc/null?appointment_id=${appointmentId}`);
      const hasPrescription = !!response.data.data; // Sửa ở đây: Chỉ kiểm tra sự tồn tại của dữ liệu
      console.log(`checkHasPrescription for appointment ${appointmentId}: ${hasPrescription}, data:`, response.data.data);
      console.log(`ok`, appointmentId);
      return hasPrescription;
    } catch (error) {
      console.error(`Error checking prescription for appointment ${appointmentId}:`, error);
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appointmentsRes, departmentsRes, roomsRes, bedsRes, khoRes] = await Promise.all([
          axios.get(`http://localhost:9999/api/letan/appointments?khoa_id=${khoaId}`),
          axios.get('http://localhost:9999/api/khoa/getall'),
          axios.get(`http://localhost:9999/api/phongbenh/rooms?khoa_id=${khoaId}`),
          axios.get(`http://localhost:9999/api/phongbenh/beds?khoa_id=${khoaId}&trang_thai=trong`),
          axios.get(`http://localhost:9999/api/noitru/kho`),
        ]);

        const appointmentsData = appointmentsRes.data.data;
        const prescriptionChecks = await Promise.all(
          appointmentsData.map((appt: any) => checkHasPrescription(appt.id).catch(() => false))
        );

        const data = appointmentsData.map((appt: any, index: number) => ({
          ...appt,
          bac_si_id: appt.bac_si_id === null ? null : appt.bac_si_id,
          status: Number(appt.status),
          ket_qua_kham: appt.ket_qua_kham || null,
          chuyen_khoa_ghi_chu: appt.chuyen_khoa_ghi_chu || null,
          loai_dieu_tri: appt.loai_dieu_tri || 'chua_quyet_dinh',
          is_admitted: !!appt.is_admitted,
          hasPrescription: prescriptionChecks[index] ?? false,
        }));

        data.forEach((appt: Appointment) => console.log(`Initial Appointment ${appt.id}: hasPrescription = ${appt.hasPrescription}, loai_dieu_tri = ${appt.loai_dieu_tri}`));
        setAppointments(data);
        setFilteredAppointments(data);
        console.log('Fetched appointments with prescription status:', data);

        const total = data.length;
        const pending = data.filter((app: Appointment) => app.status === 0).length;
        const received = data.filter((app: Appointment) => app.status === 1).length;
        setStats({ total, pending, received });

        setDepartments(
          departmentsRes.data
            .filter((d: any) => d.id !== khoaId)
            .map((d: any) => ({
              id: d.id.toString(),
              name: d.ten,
            }))
        );

        const fetchedRooms = roomsRes.data.map((room: any) => ({
          id: room.id,
          ten_phong: room.ten_phong,
        }));
        console.log('Fetched rooms:', fetchedRooms);
        setRooms(fetchedRooms);

        const fetchedBeds = bedsRes.data.map((bed: any) => ({
          id: bed.id,
          room_id: bed.room_id,
          ma_giuong: bed.ma_giuong,
        }));
        console.log('Fetched beds:', fetchedBeds);
        setBeds(fetchedBeds);

        const fetchedKho = [{
          kho_id: khoRes.data.data.kho_id,
          ten_san_pham: khoRes.data.data.ten_san_pham,
          don_vi_tinh: khoRes.data.data.don_vi_tinh || 'Không có đơn vị tính',
        }];
        console.log('Fetched kho:', fetchedKho);
        setKhoList(fetchedKho);

        if (data.length === 0) {
          message.info('Không có lịch hẹn nào trong khoa');
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

  useEffect(() => {
    let filtered = appointments;

    if (searchText) {
      filtered = filtered.filter(
        (appt) =>
          appt.ho_ten.toLowerCase().includes(searchText.toLowerCase()) ||
          appt.so_dien_thoai.includes(searchText)
      );
    }

    if (activeTabKey !== 'all') {
      if (activeTabKey === 'pending') {
        filtered = filtered.filter((appt) => appt.status === 0);
      } else if (activeTabKey === 'received') {
        filtered = filtered.filter((appt) => appt.status === 1);
      }
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((appt) =>
        statusFilter === 'pending' ? appt.status === 0 : appt.status === 1
      );
    }

    setFilteredAppointments(filtered);
  }, [searchText, statusFilter, appointments, activeTabKey]);

  const handleNhanLich = async (appointmentId: number) => {
    if (!bacSiId) {
      message.error('Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setLoading(true);
      console.log('Calling API nhan-lich:', { appointmentId, bacSiId, khoaId });
      await axios.put(`http://localhost:9999/api/letan/nhan-lich/${appointmentId}/${bacSiId}`);

      const updatedAppointments = appointments.map((appt) =>
        appt.id === appointmentId ? { ...appt, bac_si_id: bacSiId, status: 1 } : appt
      );
      setAppointments(updatedAppointments);

      const pending = updatedAppointments.filter((app: Appointment) => app.status === 0).length;
      const received = updatedAppointments.filter((app: Appointment) => app.status === 1).length;
      setStats({ ...stats, pending, received });

      message.success('Nhận lịch khám thành công!');
    } catch (error: any) {
      console.error('Error accepting appointment:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi nhận lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChuyenKhoa = async () => {
    if (!selectedAppointmentId || !selectedKhoaId) {
      message.error('Vui lòng chọn khoa để chuyển');
      return;
    }

    try {
      setTransferLoading(true);
      console.log('Calling API chuyen-khoa:', { selectedAppointmentId, selectedKhoaId, chuyenKhoaGhiChu });
      await axios.put(`http://localhost:9999/api/letan/chuyen-khoa/${selectedAppointmentId}`, {
        khoa_id: parseInt(selectedKhoaId),
        ghi_chu: chuyenKhoaGhiChu,
      });

      const updatedAppointments = appointments.filter((appt) => appt.id !== selectedAppointmentId);
      setAppointments(updatedAppointments);

      const total = updatedAppointments.length;
      const pending = updatedAppointments.filter((app: Appointment) => app.status === 0).length;
      const received = updatedAppointments.filter((app: Appointment) => app.status === 1).length;
      setStats({ total, pending, received });

      message.success('Chuyển khoa thành công');
      setIsModalVisible(false);
      setSelectedKhoaId('');
      setChuyenKhoaGhiChu('');
      setSelectedAppointmentId(null);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Error transferring department:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi chuyển khoa. Vui lòng thử lại.');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleLuuKetLuan = async () => {
    if (!selectedAppointmentId || !ketQuaKham.trim()) {
      message.error('Vui lòng nhập kết luận khám');
      return;
    }

    try {
      setKetLuanLoading(true);
      console.log('Calling API ket-luan:', { selectedAppointmentId, ketQuaKham, bacSiId });
      await axios.put(`http://localhost:9999/api/letan/ket-luan/${selectedAppointmentId}`, {
        ket_qua_kham: ketQuaKham,
        bac_si_id: bacSiId,
      });

      const updatedAppointments = appointments.map((appt) =>
        appt.id === selectedAppointmentId ? { ...appt, ket_qua_kham: ketQuaKham } : appt
      );
      setAppointments(updatedAppointments);

      message.success('Lưu kết luận thành công');
      setIsKetLuanModalVisible(false);
      setKetQuaKham('');
      setSelectedAppointmentId(null);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Error saving conclusion:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi lưu kết luận. Vui lòng thử lại.');
    } finally {
      setKetLuanLoading(false);
    }
  };

  const handlePhanLoaiDieuTri = async () => {
    if (!selectedAppointmentId || !loaiDieuTri) {
      message.error('Vui lòng chọn loại điều trị');
      return;
    }

    try {
      setPhanLoaiLoading(true);
      console.log('Calling API phan-loai-dieu-tri:', { selectedAppointmentId, loaiDieuTri, bacSiId });
      const response = await axios.put(`http://localhost:9999/api/letan/phan-loai-dieu-tri/${selectedAppointmentId}`, {
        loai_dieu_tri: loaiDieuTri,
        bac_si_id: bacSiId,
      });
      console.log('API phan-loai-dieu-tri response:', response.data);

      const updatedAppointments = appointments.map((appt) =>
        appt.id === selectedAppointmentId
          ? { ...appt, loai_dieu_tri: loaiDieuTri, is_admitted: false }
          : appt
      );
      setAppointments(updatedAppointments);

      message.success('Phân loại điều trị thành công');
      setIsPhanLoaiModalVisible(false);
      setLoaiDieuTri(null);
      setSelectedAppointmentId(null);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Error classifying treatment:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi phân loại điều trị. Vui lòng thử lại.');
    } finally {
      setPhanLoaiLoading(false);
    }
  };

  const handleXepGiuong = async () => {
    if (!selectedAppointmentId || !selectedBedId) {
      message.error('Vui lòng chọn giường');
      return;
    }

    try {
      setXepGiuongLoading(true);
      console.log('Calling API admissions:', { appointment_id: selectedAppointmentId, khach_hang_id: selectedAppointment?.khach_hang_id, bed_id: selectedBedId, bac_si_id: bacSiId });
      const admissionResponse = await axios.post(`http://localhost:9999/api/letan/admissions`, {
        appointment_id: selectedAppointmentId,
        khach_hang_id: selectedAppointment?.khach_hang_id,
        bac_si_id: bacSiId,
        bed_id: selectedBedId,
      });
      console.log('API admissions response:', admissionResponse.data);

      const admissionId = admissionResponse.data.data?.id;
      if (!admissionId) {
        throw new Error('Không nhận được admission_id từ API admissions');
      }

      console.log('Calling API chi-phi-giuong:', { admission_id: admissionId, bed_id: selectedBedId, ngay: dayjs().format('YYYY-MM-DD') });
      await axios.post(`http://localhost:9999/api/noitru/chi-phi-giuong`, {
        admission_id: admissionId,
        bed_id: selectedBedId,
        ngay: dayjs().format('YYYY-MM-DD'),
      });
      console.log('API chi-phi-giuong response: Chi phí giường ghi nhận thành công');

      const updatedAppointments = appointments.map((appt) =>
        appt.id === selectedAppointmentId ? { ...appt, is_admitted: true } : appt
      );
      setAppointments(updatedAppointments);

      message.success('Xếp giường và ghi nhận chi phí giường thành công');
      setIsXepGiuongModalVisible(false);
      setSelectedBedId(null);
      setSelectedRoomId(null);
      setSelectedAppointmentId(null);
      setSelectedAppointment(null);

      const [roomsRes, bedsRes] = await Promise.all([
        axios.get(`http://localhost:9999/api/phongbenh/rooms?khoa_id=${khoaId}`),
        axios.get(`http://localhost:9999/api/phongbenh/beds?khoa_id=${khoaId}&trang_thai=trong`),
      ]);
      const fetchedRooms = roomsRes.data.map((room: any) => ({
        id: room.id,
        ten_phong: room.ten_phong,
      }));
      console.log('Refreshed rooms:', fetchedRooms);
      setRooms(fetchedRooms);

      const fetchedBeds = bedsRes.data.map((bed: any) => ({
        id: bed.id,
        room_id: bed.room_id,
        ma_giuong: bed.ma_giuong,
      }));
      console.log('Refreshed beds:', fetchedBeds);
      setBeds(fetchedBeds);
    } catch (error: any) {
      console.error('Error assigning bed or recording bed cost:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi xếp giường hoặc ghi nhận chi phí giường. Vui lòng thử lại.');
    } finally {
      setXepGiuongLoading(false);
    }
  };

  const handleChiDinhThuoc = async (values: any) => {
    console.log('handleChiDinhThuoc triggered with values:', values);
    if (!selectedAppointmentId) {
      message.error('Không tìm thấy thông tin lịch hẹn. Vui lòng thử lại.');
      return;
    }

    try {
      setChiDinhThuocLoading(true);
      const data = {
        admission_id: null,
        appointment_id: selectedAppointmentId,
        kho_id: values.kho_id,
        so_luong: Number(values.so_luong),
        lieu_luong: values.lieu_luong,
        tan_suat: values.tan_suat,
        nguoi_chi_dinh_id: bacSiId,
      };
      console.log('Calling API /api/noitru/chi-dinh-thuoc with data:', data);
      const response = await axios.post('http://localhost:9999/api/noitru/chi-dinh-thuoc', data);
      console.log('API response:', response.data);

      // Làm mới dữ liệu
      const [appointmentsRes] = await Promise.all([
        axios.get(`http://localhost:9999/api/letan/appointments?khoa_id=${khoaId}`),
      ]);
      const appointmentsData = appointmentsRes.data.data;
      const prescriptionChecks = await Promise.all(
        appointmentsData.map((appt: any) => checkHasPrescription(appt.id).catch(() => false))
      );
      const updatedData = appointmentsData.map((appt: any, index: number) => ({
        ...appt,
        bac_si_id: appt.bac_si_id === null ? null : appt.bac_si_id,
        status: Number(appt.status),
        ket_qua_kham: appt.ket_qua_kham || null,
        chuyen_khoa_ghi_chu: appt.chuyen_khoa_ghi_chu || null,
        loai_dieu_tri: appt.loai_dieu_tri || 'chua_quyet_dinh',
        is_admitted: !!appt.is_admitted,
        hasPrescription: prescriptionChecks[index] ?? false,
      }));
      updatedData.forEach((appt: Appointment) => console.log(`Updated Appointment ${appt.id}: hasPrescription = ${appt.hasPrescription}, loai_dieu_tri = ${appt.loai_dieu_tri}`));
      setAppointments(updatedData);
      setFilteredAppointments(updatedData);

      message.success(response.data.message || 'Chỉ định thuốc thành công');
      setIsChiDinhThuocModalVisible(false);
      chiDinhThuocForm.resetFields();
      setSelectedAppointmentId(null);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Error prescribing medicine:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi kê đơn thuốc. Vui lòng thử lại.');
    } finally {
      setChiDinhThuocLoading(false);
    }
  };

  const showChuyenKhoaModal = (appointmentId: number) => {
    const appt = appointments.find((a) => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setIsModalVisible(true);
  };

  const showKetLuanModal = (appointmentId: number, currentKetQua: string | null) => {
    const appt = appointments.find((a) => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setKetQuaKham(currentKetQua || '');
    setIsKetLuanModalVisible(true);
  };

  const showPhanLoaiModal = (appointmentId: number) => {
    const appt = appointments.find((a) => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setLoaiDieuTri(appt?.loai_dieu_tri || null);
    setIsPhanLoaiModalVisible(true);
  };

  const showXepGiuongModal = (appointmentId: number) => {
    const appt = appointments.find((a) => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setIsXepGiuongModalVisible(true);
  };

  const showChiDinhThuocModal = (appointmentId: number) => {
    const appt = appointments.find((a) => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setIsChiDinhThuocModalVisible(true);
  };

  const showDonThuocModal = async (appointmentId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:9999/api/noitru/chi-dinh-thuoc/null?appointment_id=${appointmentId}`);
      // Chuyển object thành mảng để hiển thị trong Table
      const data = response.data.data ? [response.data.data] : [];
      setDonThuocData(data);
      console.log(`DonThuocModal data for appointment ${appointmentId}:`, data);
      setIsDonThuocModalVisible(true);
    } catch (error: any) {
      console.error('Error fetching don thuoc:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi lấy danh sách đơn thuốc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedKhoaId('');
    setChuyenKhoaGhiChu('');
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const handleCancelKetLuan = () => {
    setIsKetLuanModalVisible(false);
    setKetQuaKham('');
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const handleCancelPhanLoai = () => {
    setIsPhanLoaiModalVisible(false);
    setLoaiDieuTri(null);
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const handleCancelXepGiuong = () => {
    setIsXepGiuongModalVisible(false);
    setSelectedBedId(null);
    setSelectedRoomId(null);
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const handleCancelChiDinhThuoc = () => {
    setIsChiDinhThuocModalVisible(false);
    chiDinhThuocForm.resetFields();
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const getStatusTag = (status: number) => {
    if (status === 0) {
      return <Tag color="orange" icon={<ClockCircleOutlined />}>Chưa nhận</Tag>;
    }
    return <Tag color="green" icon={<CheckCircleOutlined />}>Đã nhận</Tag>;
  };

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

  const getLoaiDieuTriTag = (loai_dieu_tri: string | null) => {
    if (loai_dieu_tri === 'noi_tru') {
      return <Tag color="purple">Nội trú</Tag>;
    } else if (loai_dieu_tri === 'ngoai_tru') {
      return <Tag color="cyan">Ngoại trú</Tag>;
    }
    return <Tag color="default">Chưa quyết định</Tag>;
  };

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
      title: 'Loại điều trị',
      dataIndex: 'loai_dieu_tri',
      key: 'loai_dieu_tri',
      width: 120,
      render: (loai_dieu_tri: string | null) => getLoaiDieuTriTag(loai_dieu_tri),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 350,
      render: (_: any, record: Appointment) => {
        console.log(`Render Action for Appointment ${record.id}: hasPrescription = ${record.hasPrescription}, loai_dieu_tri = ${record.loai_dieu_tri}`);
        return (
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
              <>
                <Button
                  type="default"
                  icon={<FileTextOutlined />}
                  size="middle"
                  onClick={() => showKetLuanModal(record.id, record.ket_qua_kham)}
                >
                  Kết luận
                </Button>
                {record.ket_qua_kham && record.loai_dieu_tri === 'chua_quyet_dinh' && (
                  <Button
                    type="default"
                    icon={<SolutionOutlined />}
                    size="middle"
                    onClick={() => showPhanLoaiModal(record.id)}
                  >
                    Phân loại
                  </Button>
                )}
                {record.loai_dieu_tri === 'noi_tru' && !record.is_admitted && (
                  <Button
                    type="default"
                    icon={<MedicineBoxOutlined />}
                    size="middle"
                    onClick={() => showXepGiuongModal(record.id)}
                  >
                    Xếp giường
                  </Button>
                )}
                {record.loai_dieu_tri === 'ngoai_tru' && !record.hasPrescription && (
                  <Button
                    type="default"
                    icon={<PlusCircleOutlined />}
                    size="middle"
                    onClick={() => showChiDinhThuocModal(record.id)}
                  >
                    Kê đơn thuốc
                  </Button>
                )}
                {record.hasPrescription && record.loai_dieu_tri === 'ngoai_tru' && (
                  <Button
                    type="default"
                    icon={<FileSearchOutlined />}
                    size="middle"
                    onClick={() => showDonThuocModal(record.id)}
                  >
                    Xem các thuốc đã kê + giá tiền
                  </Button>
                )}
              </>
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
        );
      },
    },
  ];

  const DonThuocModal = (
    <Modal
      title={
        <Space>
          <FileSearchOutlined style={{ color: '#1890ff' }} />
          <span>Xem các thuốc đã kê + giá tiền</span>
        </Space>
      }
      open={isDonThuocModalVisible}
      onCancel={() => setIsDonThuocModalVisible(false)}
      footer={null}
      width={800}
    >
      <Spin spinning={loading}>
        {donThuocData.length === 0 ? (
          <Empty description="Không có đơn thuốc nào" />
        ) : (
          <Table
            columns={[
              { title: 'Tên thuốc', dataIndex: 'ten_thuoc', key: 'ten_thuoc' },
              { title: 'Đơn vị', dataIndex: 'don_vi', key: 'don_vi' },
              { title: 'Số lượng', dataIndex: 'so_luong', key: 'so_luong' },
              { title: 'Liều lượng', dataIndex: 'lieu_luong', key: 'lieu_luong' },
              { title: 'Tần suất', dataIndex: 'tan_suat', key: 'tan_suat' },
              { title: 'Tổng tiền', dataIndex: 'thanh_tien', key: 'thanh_tien', render: (text) => `${text} VNĐ` },
              { title: 'Ngày chỉ định', dataIndex: 'ngay_chi_dinh', key: 'ngay_chi_dinh' },
              { title: 'Người chỉ định', dataIndex: 'nguoi_chi_dinh', key: 'nguoi_chi_dinh' },
            ]}
            dataSource={donThuocData}
            rowKey="id"
            pagination={false}
          />
        )}
      </Spin>
    </Modal>
  );

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
                  <span>
                    <FileSearchOutlined /> Tất cả ({stats.total})
                  </span>
                }
                key="all"
              />
              <TabPane
                tab={
                  <span>
                    <ClockCircleOutlined /> Chưa nhận ({stats.pending})
                  </span>
                }
                key="pending"
              />
              <TabPane
                tab={
                  <span>
                    <CheckCircleOutlined /> Đã nhận ({stats.received})
                  </span>
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
                    showQuickJumper: true,
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

      <Modal
        title={
          <Space>
            <SwapOutlined style={{ color: '#1890ff' }} />
            <span>Chuyển khoa cho bệnh nhân</span>
          </Space>
        }
        open={isModalVisible}
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

            {selectedAppointment.ket_qua_kham && (
              <Card
                title={
                  <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <span>Kết luận khám</span>
                  </Space>
                }
                bordered={false}
                style={{ marginBottom: 16 }}
              >
                <Paragraph>{selectedAppointment.ket_qua_kham}</Paragraph>
              </Card>
            )}
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
          <Form.Item label="Ghi chú chuyển khoa">
            <TextArea
              rows={3}
              value={chuyenKhoaGhiChu}
              onChange={(e) => setChuyenKhoaGhiChu(e.target.value)}
              placeholder="Nhập lý do chuyển khoa (ví dụ: Nghi ngờ nhồi máu cơ tim, cần khám chuyên sâu)"
            />
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16 }}>
          <Tag color="orange" icon={<BellOutlined />}>
            Lưu ý: Sau khi chuyển khoa, lịch hẹn sẽ được chuyển sang danh sách của khoa mới
          </Tag>
        </div>
      </Modal>

      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span>Nhập kết luận khám</span>
          </Space>
        }
        open={isKetLuanModalVisible}
        onOk={handleLuuKetLuan}
        onCancel={handleCancelKetLuan}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={ketLuanLoading}
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
                    <Text type="secondary">
                      <InfoCircleOutlined /> {selectedAppointment.trieu_chung}
                    </Text>
                    {selectedAppointment.chuyen_khoa_ghi_chu && (
                      <Text type="secondary">
                        <SwapOutlined /> Lý do chuyển khoa: {selectedAppointment.chuyen_khoa_ghi_chu}
                      </Text>
                    )}
                  </Space>
                </div>
              </Space>
            </Card>
          </>
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
              placeholder="Nhập kết luận khám (ví dụ: Nghi ngờ nhồi máu cơ tim, cần nhập viện)"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <SolutionOutlined style={{ color: '#1890ff' }} />
            <span>Phân loại điều trị</span>
          </Space>
        }
        open={isPhanLoaiModalVisible}
        onOk={handlePhanLoaiDieuTri}
        onCancel={handleCancelPhanLoai}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={phanLoaiLoading}
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
                    <Text type="secondary">
                      <InfoCircleOutlined /> {selectedAppointment.trieu_chung}
                    </Text>
                    <Text type="secondary">
                      <FileTextOutlined /> Kết luận: {selectedAppointment.ket_qua_kham}
                    </Text>
                  </Space>
                </div>
              </Space>
            </Card>
          </>
        )}
        <Form layout="vertical">
          <Form.Item
            label="Loại điều trị"
            required
            validateStatus={!loaiDieuTri && isPhanLoaiModalVisible ? 'error' : ''}
            help={!loaiDieuTri && isPhanLoaiModalVisible ? 'Vui lòng chọn loại điều trị' : ''}
          >
            <Radio.Group value={loaiDieuTri} onChange={(e) => setLoaiDieuTri(e.target.value)}>
              <Radio value="noi_tru">Nội trú (Nhập viện)</Radio>
              <Radio value="ngoai_tru">Ngoại trú (Về nhà)</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: '#1890ff' }} />
            <span>Xếp giường cho bệnh nhân</span>
          </Space>
        }
        open={isXepGiuongModalVisible}
        onOk={handleXepGiuong}
        onCancel={handleCancelXepGiuong}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={xepGiuongLoading}
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
                    <Text type="secondary">
                      <InfoCircleOutlined /> {selectedAppointment.trieu_chung}
                    </Text>
                    <Text type="secondary">
                      <FileTextOutlined /> Kết luận: {selectedAppointment.ket_qua_kham}
                    </Text>
                  </Space>
                </div>
              </Space>
            </Card>
          </>
        )}
        <Form layout="vertical">
          <Form.Item
            label="Chọn phòng bệnh"
            required
            validateStatus={!selectedRoomId && isXepGiuongModalVisible ? 'error' : ''}
            help={!selectedRoomId && isXepGiuongModalVisible ? 'Vui lòng chọn phòng' : ''}
          >
            <Select
              placeholder="Chọn phòng bệnh"
              value={selectedRoomId}
              onChange={(value) => {
                setSelectedRoomId(value);
                setSelectedBedId(null);
              }}
              style={{ width: '100%' }}
              size="large"
            >
              {rooms.map((room) => (
                <Option key={room.id} value={room.id}>
                  {room.ten_phong}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Chọn giường"
            required
            validateStatus={!selectedBedId && isXepGiuongModalVisible ? 'error' : ''}
            help={!selectedBedId && isXepGiuongModalVisible ? 'Vui lòng chọn giường' : ''}
          >
            <Select
              placeholder="Chọn giường trống"
              value={selectedBedId}
              onChange={(value) => setSelectedBedId(value)}
              style={{ width: '100%' }}
              size="large"
              disabled={!selectedRoomId}
            >
              {beds
                .filter((bed) => bed.room_id === selectedRoomId)
                .map((bed) => (
                  <Option key={bed.id} value={bed.id}>
                    {bed.ma_giuong}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 16 }}>
          <Tag color="orange" icon={<BellOutlined />}>
            Lưu ý: Giường sẽ được đánh dấu là đã sử dụng sau khi xác nhận
          </Tag>
        </div>
      </Modal>

      <Modal
        title={
          <Space>
            <PlusCircleOutlined style={{ color: '#1890ff' }} />
            <span>Kê đơn thuốc</span>
          </Space>
        }
        open={isChiDinhThuocModalVisible}
        onOk={() => chiDinhThuocForm.submit()}
        onCancel={handleCancelChiDinhThuoc}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={chiDinhThuocLoading}
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
                    <Text type="secondary">
                      <InfoCircleOutlined /> {selectedAppointment.trieu_chung}
                    </Text>
                    <Text type="secondary">
                      <FileTextOutlined /> Kết luận: {selectedAppointment.ket_qua_kham}
                    </Text>
                  </Space>
                </div>
              </Space>
            </Card>
          </>
        )}
        <Form
          form={chiDinhThuocForm}
          layout="vertical"
          onFinish={handleChiDinhThuoc}
          onFinishFailed={(errorInfo) => {
            console.log('Form validation failed:', errorInfo);
          }}
        >
          <Form.Item
            name="kho_id"
            label="Chọn thuốc"
            rules={[{ required: true, message: 'Vui lòng chọn thuốc!' }]}
          >
            <Select placeholder="Chọn thuốc từ kho" size="large">
              {khoList.map((kho) => (
                <Option key={kho.kho_id} value={kho.kho_id}>
                  {kho.ten_san_pham} ({kho.don_vi_tinh})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="so_luong"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng!' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' },
            ]}
            normalize={(value) => (value ? Number(value) : value)}
          >
            <Input type="number" placeholder="Nhập số lượng" size="large" />
          </Form.Item>
          <Form.Item
            name="lieu_luong"
            label="Liều lượng"
            rules={[{ required: true, message: 'Vui lòng nhập liều lượng!' }]}
          >
            <Input placeholder="Nhập liều lượng (ví dụ: 1 viên/lần)" size="large" />
          </Form.Item>
          <Form.Item
            name="tan_suat"
            label="Tần suất"
            rules={[{ required: true, message: 'Vui lòng nhập tần suất!' }]}
          >
            <Input placeholder="Nhập tần suất (ví dụ: 2 lần/ngày)" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {DonThuocModal}
    </div>
  );
};

export default KhamLamSan;