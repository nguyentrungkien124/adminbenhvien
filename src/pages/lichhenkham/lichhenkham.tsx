import React, { useEffect, useState } from 'react';
import type { TableColumnsType, TableProps } from 'antd';
import { Button, message, Space, Table, Tooltip, Modal, Input, Select } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LinkOutlined } from '@ant-design/icons';

const { Option } = Select;

type OnChange = NonNullable<TableProps<DataType>['onChange']>;
type Filters = Parameters<OnChange>[1];
type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

interface DataType {
  id: string;
  nguoi_dung_id: number;
  bac_si_id: number;
  goi_kham_id: number;
  ngay_hen: string;
  ca_dat: string;
  trang_thai: number;
  ghi_chu: string;
  ngay_tao: string;
  chuyen_khoa: string;
  gia: number;
  ly_do: string;
  da_thanh_toan: number; 
  created_at: string;
}

interface KhachHang {
  id: number;
  ho_ten: string;
}

const Lichhenkham: React.FC = () => {
  const [filteredInfo, setFilteredInfo] = useState<Filters>({});
  const [sortedInfo, setSortedInfo] = useState<Sorts>({});
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DataType[]>([]);
  const [reason, setReason] = useState<string>('');
  const [currentRecord, setCurrentRecord] = useState<DataType | null>(null);
  const [customers, setCustomers] = useState<KhachHang[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [appointmentIdToLink, setAppointmentIdToLink] = useState<string | null>(null);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const bacSiId = user.bac_si_id;
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<number | null>(null);

  const handleChange: OnChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as Sorts);
  };

  const handleStatusChange = (status: number | null) => {
    setStatusFilter(status);
    setPaymentFilter(null);
  };

  const handlePaymentFilterChange = (payment: number | null) => {
    setPaymentFilter(payment);
    setStatusFilter(null);
  };

  const filteredData = data.filter(item => {
    const statusMatch = statusFilter === null || item.trang_thai === statusFilter;
    const paymentMatch = paymentFilter === null || item.da_thanh_toan === paymentFilter;
    return statusMatch && paymentMatch;
  });

  const showRejectModal = (record: DataType) => {
    setCurrentRecord(record);
    setReason('');
    Modal.confirm({
      title: 'Nhập lý do từ chối khám',
      content: (
        <Input
         

 onChange={(e) => setReason(e.target.value)}
        />
      ),
      onOk: async () => {
        if (currentRecord) {
          try {
            const response = await fetch('http://localhost:9999/api/datlich/tuchoikham', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: currentRecord.id, ly_do: reason }),
            });
            if (!response.ok) throw new Error('Failed to reject appointment');
            message.success('Từ chối khám thành công!');
            fetchData();
          } catch (error) {
            message.error('Từ chối khám thất bại');
          }
        }
      },
    });
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:9999/api/user/getall');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const result = await response.json();
      setCustomers(result);
    } catch (error) {
      message.error('Lỗi khi tải danh sách khách hàng');
    }
  };

  const showConfirm = (record: DataType) => {
    const { id, trang_thai } = record;
    const newStatus = trang_thai === 1 ? 0 : null; // Chuyển từ 1 (chưa xác nhận) sang 0 (đã xác nhận)

    if (newStatus !== null) {
      Modal.confirm({
        title: 'Xác nhận hành động',
        content: `Bạn có chắc chắn muốn xác nhận lịch khám này?`,
        onOk: async () => {
          try {
            const response = await fetch('http://localhost:9999/api/datlich/suatrangthailichkham', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            });
            if (!response.ok) throw new Error('Failed to update status');
            message.success('Xác nhận lịch khám thành công!');
            fetchData();
          } catch (error) {
            message.error('Xác nhận lịch khám thất bại');
          }
        },
      });
    }
  };

  const fetchData = async () => {
    if (!bacSiId) {
      message.error('Không tìm thấy ID người dùng trong session');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:9999/api/datlich/getLichKhamByBacSi/${bacSiId}/1/1000`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      const sortedData = result.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setData(sortedData);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchData();
  }, []);

  const showCreateLinkModal = (appointmentId: string) => {
    setAppointmentIdToLink(appointmentId);
    setIsModalVisible(true);
  };

  const handleCreateJitsiLink = async () => {
    if (!appointmentIdToLink) return;
    try {
      const response = await fetch('http://localhost:9999/api/datlich/createphong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentIdToLink }),
      });
      if (!response.ok) throw new Error('Failed to create Jitsi link');
      const result = await response.json();
      message.success(`Liên kết Jitsi Meet đã được tạo: ${result.link}`);
      setIsModalVisible(false);
    } catch (error) {
      message.error('Lỗi khi tạo liên kết Jitsi Meet');
    }
  };

  const columns: TableColumnsType<DataType> = [
    { title: 'ID', key: 'stt', align: 'center', render: (_: any, __: any, index: number) => index + 1, width: 50, ellipsis: true },
    {
      title: 'Khách hàng',
      key: 'khach_hang',
      render: (text: any, record: DataType) => {
        const customer = customers.find(c => c.id === record.nguoi_dung_id);
        return customer ? customer.ho_ten : 'Không xác định';
      },
      sorter: (a, b) => {
        const nameA = customers.find(c => c.id === a.nguoi_dung_id)?.ho_ten || '';
        const nameB = customers.find(c => c.id === b.nguoi_dung_id)?.ho_ten || '';
        return nameA.localeCompare(nameB);
      },
      ellipsis: false,
      width: 200,
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'ngay_hen',
      key: 'ngay_hen',
      sorter: (a, b) => new Date(a.ngay_hen).getTime() - new Date(b.ngay_hen).getTime(),
      ellipsis: true,
      render: (text: string) => new Date(text).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ca đặt',
      dataIndex: 'ca_dat',
      key: 'ca_dat',
      ellipsis: true,
      render: (text: string) => {
        if (!text || typeof text !== 'string') return '';
        const times = text.split('-');
        if (times.length === 2) {
          const formatTime = (time: string) => {
            const [hours, minutes] = time.split(':');
            return `${hours}:${minutes}`;
          };
          return `${formatTime(times[0])}-${formatTime(times[1])}`;
        }
        return text;
      },
    },
    { title: 'Chuyên khoa', dataIndex: 'chuyen_khoa', key: 'chuyen_khoa', ellipsis: true },
    {
      title: 'Giá(VNĐ)',
      dataIndex: 'gia',
      key: 'gia',
      align: 'right',
      sorter: (a, b) => a.gia - b.gia,
      ellipsis: true,
      render: (gia: number) => new Intl.NumberFormat().format(gia),
    },
    { title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu', align: 'center' },
    {
      title: 'Thanh toán',
      key: 'da_thanh_toan',
      dataIndex: 'da_thanh_toan',
      width: 150,
      align: 'center',
      render: (text: number, record: DataType) => (
        <Select
          value={text}
          onChange={(value) => handlePaymentStatusChange(value, record.id)}
          style={{ color: text === 0 ? 'orange' : text === 1 ? 'green' : 'gray', minWidth: '120px' }}
        >
          <Option value={0}><span style={{ color: 'orange' }}>Chưa thanh toán</span></Option>
          <Option value={1}><span style={{ color: 'green' }}>Đã thanh toán</span></Option>
          <Option value={2}><span style={{ color: 'gray' }}>Không xác định</span></Option>
        </Select>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'trang_thai',
      dataIndex: 'trang_thai',
      render: (text: number) => {
        let color = '';
        let label = '';
        switch (text) {
          case 1:
            color = 'blue';
            label = 'Chờ xác nhận';
            break;
          case 0:
            color = 'darkgreen';
            label = 'Đã xác nhận';
            break;
          default:
            color = 'gray';
            label = 'Không xác định';
        }
        return <span style={{ color, fontWeight: 'bold' }}>{label}</span>;
      },
      sorter: (a, b) => a.trang_thai - b.trang_thai,
    },
    {
      title: 'Chức năng',
      key: 'actions',
      align: 'center',
      render: (_, record) => {
        const { trang_thai } = record;
        return (
          <Space size="middle">
            {trang_thai === 1 && (
              <Tooltip title="Xác nhận">
                <CheckCircleOutlined
                  style={{ color: 'green', cursor: 'pointer' }}
                  onClick={() => showConfirm(record)}
                />
              </Tooltip>
            )}
            {trang_thai === 0 && (
              <Tooltip title="Tạo liên kết Jitsi Meet">
                <LinkOutlined
                  style={{ color: 'orange', cursor: 'pointer' }}
                  onClick={() => showCreateLinkModal(record.id)}
                />
              </Tooltip>
            )}
            {(trang_thai === 1 || trang_thai === 0) && (
              <Tooltip title="Từ chối">
                <CloseCircleOutlined
                  style={{ color: 'red', cursor: 'pointer' }}
                  onClick={() => showRejectModal(record)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  const handlePaymentStatusChange = async (value: number, appointmentId: string) => {
    try {
      const response = await fetch('http://localhost:9999/api/datlich/updateDaThanhToan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: appointmentId }),
      });
      if (!response.ok) throw new Error('Failed to update payment status');
      message.success('Cập nhật trạng thái thanh toán thành công!');
      fetchData();
    } catch (error) {
      message.error('Cập nhật trạng thái thanh toán thất bại');
    }
  };

  const getButtonStyle = (status: number | null, isPayment: boolean = false) => {
    const isActive = isPayment ? paymentFilter === status : statusFilter === status;
    return {
      backgroundColor: isActive ? 'blue' : 'white',
      color: isActive ? 'white' : 'black',
    };
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => handleStatusChange(1)} style={getButtonStyle(1)}>
          Chờ xác nhận
        </Button>
        <Button onClick={() => handleStatusChange(0)} style={getButtonStyle(0)}>
          Đã xác nhận
        </Button>
        <Button onClick={() => handleStatusChange(null)} style={getButtonStyle(null)}>
          Tất cả
        </Button>
        <Button onClick={() => handlePaymentFilterChange(0)} style={getButtonStyle(0, true)}>
          Chưa thanh toán
        </Button>
        <Button onClick={() => handlePaymentFilterChange(1)} style={getButtonStyle(1, true)}>
          Đã thanh toán
        </Button>
        <Button onClick={() => handlePaymentFilterChange(null)} style={getButtonStyle(null, true)}>
          Tất cả thanh toán
        </Button>
      </Space>

      <Table<DataType> columns={columns} dataSource={filteredData} onChange={handleChange} loading={loading} />

      <Modal
        title="Xác nhận tạo liên kết phòng họp"
        visible={isModalVisible}
        onOk={handleCreateJitsiLink}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>Bạn có muốn tạo liên kết phòng họp và gửi email không?</p>
      </Modal>
    </>
  );
};

export default Lichhenkham;