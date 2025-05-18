import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, message, TimePicker, List, Pagination } from 'antd';
import { format } from 'date-fns';
import { SmileOutlined, ClockCircleOutlined } from '@ant-design/icons'; // Icon thêm sinh động
import axios from 'axios';

const statusOptions = [
  { label: 'Đang làm', value: 1 },
  { label: 'Hủy', value: 0 },
];

interface Shift {
  id: string;
  bac_si_id: any;
  ngay_lam_viec: any;
  gio_bat_dau: any;
  gio_ket_thuc: any;
  trang_thai: any;
  ghi_chu: string;
}

const Lichlamviec = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [scheduledShifts, setScheduledShifts] = useState<Shift[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 5;

  // const doctorId = sessionStorage.getItem('id');
   const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const khoaId = user.khoa_id;
  const doctorId = user.bac_si_id;
  const khoaName = user.khoa_name || 'Tim mạch';
  useEffect(() => {
    if (doctorId) {
      fetchShifts(doctorId);
    }
  }, [doctorId]);

  const fetchShifts = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:9999/api/lichlamviec/getlichlamviecbyidbs/${id}`);
      setScheduledShifts(response.data);
      setFilteredShifts(response.data);
    } catch (error) {
      message.error('Lỗi khi lấy lịch làm việc!');
      console.error(error);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const { ngay_lam_viec, gio_bat_dau, gio_ket_thuc, trang_thai } = values;
    
    // Định dạng giờ
    const startTime = gio_bat_dau.format('HH:mm');
    const endTime = gio_ket_thuc.format('HH:mm');

    // Kiểm tra xem có lịch nào đã tồn tại với cùng ngày và giờ không
    const isOverlapping = scheduledShifts.some(shift => 
      shift.ngay_lam_viec === ngay_lam_viec.format('YYYY-MM-DD') &&
      ((startTime < shift.gio_ket_thuc && endTime > shift.gio_bat_dau))
    );

    if (isOverlapping) {
      message.error('Lịch làm việc này bị trùng với lịch khác!');
      setLoading(false);
      return;
    }

    const newShift: Shift = {
      id: '', // ID sẽ được tạo từ server
      bac_si_id: doctorId,
      ngay_lam_viec: ngay_lam_viec.format('YYYY-MM-DD'),
      gio_bat_dau: startTime,
      gio_ket_thuc: endTime,
      trang_thai,
      ghi_chu: values.ghi_chu || '',
    };

    try {
      await axios.post('http://localhost:9999/api/lichlamviec/themlichlamviec', newShift);
      message.success('Lịch làm việc đã được thêm thành công!');
      
      // Cập nhật danh sách lịch làm việc
      setScheduledShifts([...scheduledShifts, newShift]);
      filterShifts(searchTerm);
      form.resetFields();
    } catch (error) {
      message.error('Lỗi khi thêm lịch làm việc!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    filterShifts(value);
  };

  const filterShifts = (term: string) => {
    const lowerTerm = term.toLowerCase();
    const filtered = scheduledShifts.filter(shift =>
      shift.bac_si_id.toString().includes(lowerTerm) ||
      shift.ngay_lam_viec.includes(lowerTerm) ||
      shift.trang_thai.toString().includes(lowerTerm)
    );
    setFilteredShifts(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedShifts = filteredShifts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ background: 'linear-gradient(to right, #e3f2fd, #ffebee)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, marginRight: '20px', background: '#ffffff', padding: '20px', borderRadius: '10px' }}>
          <h2 style={{ textAlign: 'center', color: '#1976d2' }}>
             Thêm Lịch Làm Việc
          </h2>
          <Form form={form} name="add_schedule" onFinish={handleSubmit} layout="vertical" style={{ marginTop: '20px' }}>
            <Form.Item label="Ngày làm việc" name="ngay_lam_viec" rules={[{ required: true, message: 'Vui lòng chọn ngày làm việc!' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Giờ bắt đầu" name="gio_bat_dau" rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}>
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
            <Form.Item label="Giờ kết thúc" name="gio_ket_thuc" rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}>
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
            <Form.Item label="Trạng thái" name="trang_thai">
              <Select>
                {statusOptions.map(option => (
                  <Select.Option value={option.value} key={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Ghi chú" name="ghi_chu">
              <Input.TextArea rows={4} placeholder="Nhập ghi chú" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                Thêm lịch
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div style={{ flex: 1, marginLeft: '20px', background: '#ffffff', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ textAlign: 'center', color: '#43a047', marginBottom: '20px' }}>
            <ClockCircleOutlined /> Danh Sách Lịch Làm Việc
          </h3>
          <Input.Search placeholder="Tìm kiếm" onSearch={handleSearch} style={{ marginBottom: '20px' }} />
          <List
            dataSource={paginatedShifts}
            renderItem={(shift, index) => (
              <List.Item style={{ background: '#e3f2fd', marginBottom: '10px', borderRadius: '10px', padding: '10px' }}>
                <List.Item.Meta
                  title={<strong>STT: {((currentPage - 1) * pageSize) + index + 1}</strong>}
                  description={
                    <div>
                      <p>Ngày: {format(new Date(shift.ngay_lam_viec), 'dd/MM/yyyy')}</p>
                      <p>Giờ bắt đầu: {shift.gio_bat_dau}</p>
                      <p>Giờ kết thúc: {shift.gio_ket_thuc}</p>
                      <p>Trạng thái: {shift.trang_thai === 1 ? 'Đang làm' : 'Hủy'}</p>
                      <p>Trạng thái: {shift.ghi_chu}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          <Pagination current={currentPage} pageSize={pageSize} total={filteredShifts.length} onChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
};

export default Lichlamviec;