import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Modal, message, Spin } from 'antd';
import axios from 'axios';
import { SearchOutlined } from '@ant-design/icons';

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
}

interface Department {
  id: string;
  name: string;
}

const KhamLamsan: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [selectedKhoaId, setSelectedKhoaId] = useState<string>('');

  const khoaId = 20; // Khoa Lâm Sàng
  const bacSiId = 1; // Giả định bác sĩ đã đăng nhập

  // Lấy dữ liệu lịch hẹn và khoa
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appointmentsRes, departmentsRes] = await Promise.all([
          axios.get(`http://localhost:9999/api/letan/appointments?khoa_id=${khoaId}`),
          axios.get('http://localhost:9999/api/khoa/getall'),
        ]);

        setAppointments(appointmentsRes.data.data);
        setFilteredAppointments(appointmentsRes.data.data);
        setDepartments(
          departmentsRes.data.map((d: any) => ({
            id: d.id.toString(),
            name: d.ten,
          }))
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tìm kiếm và lọc
  useEffect(() => {
    let filtered = appointments;

    if (searchText) {
      filtered = filtered.filter(
        (appt) =>
          appt.ho_ten.toLowerCase().includes(searchText.toLowerCase()) ||
          appt.so_dien_thoai.includes(searchText)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((appt) =>
        statusFilter === 'pending' ? appt.status === 0 : appt.status === 1
      );
    }

    setFilteredAppointments(filtered);
  }, [searchText, statusFilter, appointments]);

  // Nhận lịch
  const handleNhanLich = async (appointmentId: number) => {
    try {
      await axios.put(`http://localhost:9999/api/doctor/nhan-lich/${appointmentId}/${bacSiId}`);
      message.success('Nhận lịch thành công');
      setAppointments(
        appointments.map((appt) =>
          appt.id === appointmentId ? { ...appt, bac_si_id: bacSiId, status: 1 } : appt
        )
      );
    } catch (error) {
      console.error('Error nhan lich:', error);
      message.error('Có lỗi khi nhận lịch');
    }
  };

  // Chuyển khoa
  const handleChuyenKhoa = async () => {
    if (!selectedAppointmentId || !selectedKhoaId) {
      message.error('Vui lòng chọn khoa để chuyển');
      return;
    }

    try {
      await axios.put(`http://localhost:9999/api/doctor/chuyen-khoa/${selectedAppointmentId}`, {
        khoa_id: parseInt(selectedKhoaId),
      });
      message.success('Chuyển khoa thành công');
      setAppointments(
        appointments.filter((appt) => appt.id !== selectedAppointmentId) // Xóa khỏi danh sách
      );
      setIsModalVisible(false);
      setSelectedKhoaId('');
      setSelectedAppointmentId(null);
    } catch (error) {
      console.error('Error chuyen khoa:', error);
      message.error('Có lỗi khi chuyển khoa');
    }
  };

  // Mở modal chuyển khoa
  const showChuyenKhoaModal = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setIsModalVisible(true);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedKhoaId('');
    setSelectedAppointmentId(null);
  };

  // Cột bảng
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên bệnh nhân',
      dataIndex: 'ho_ten',
      key: 'ho_ten',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'so_dien_thoai',
      key: 'so_dien_thoai',
    },
    {
      title: 'Triệu chứng',
      dataIndex: 'trieu_chung',
      key: 'trieu_chung',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (status === 0 ? 'Chưa nhận' : 'Đã nhận'),
    },
    {
      title: 'Khoa',
      dataIndex: 'khoa_name',
      key: 'khoa_name',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Appointment) => (
        <>
          {record.status === 0 && record.bac_si_id === null && (
            <Button
              type="primary"
              onClick={() => handleNhanLich(record.id)}
              style={{ marginRight: 8 }}
            >
              Nhận lịch
            </Button>
          )}
          <Button type="default" onClick={() => showChuyenKhoaModal(record.id)}>
            Chuyển khoa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Danh sách lịch hẹn - Khoa Lâm Sàng</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên hoặc số điện thoại"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          style={{ width: 150 }}
        >
          <Select.Option value="all">Tất cả</Select.Option>
          <Select.Option value="pending">Chưa nhận</Select.Option>
          <Select.Option value="received">Đã nhận</Select.Option>
        </Select>
      </div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={filteredAppointments}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
      <Modal
        title="Chuyển khoa"
        visible={isModalVisible}
        onOk={handleChuyenKhoa}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Select
          placeholder="Chọn khoa"
          value={selectedKhoaId}
          onChange={(value) => setSelectedKhoaId(value)}
          style={{ width: '100%' }}
        >
          {departments.map((dept) => (
            <Select.Option key={dept.id} value={dept.id}>
              {dept.name}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default KhamLamsan