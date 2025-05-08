import React, { useEffect, useState } from 'react';
import { Space, Table, Input, Button, Switch, notification } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';

const { Column } = Table;

interface BacSi {
  id: string;
  ho_ten: string;
  khoa_id: number;
  chuyen_mon: string;
  so_dien_thoai: string;
  email: string;
  ngay_sinh: string;
  gioi_tinh: string;
  dia_chi: string;
  hinh_anh: string;
  mat_khau: string;
  gia: number;
  khambenh_qua_video: boolean;
  kinh_nghiem: string;
}

interface User {
  id: number;
  email: string;
  khoa_id: number | null;
  role: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<BacSi[]>([]);
  const [pagedb] = useState<number>(1);
  const [pageSizedb] = useState<number>(1000);
  const [khoa, setKhoa] = useState<any[]>([]);
  const [chuyenmon, setChuyenmon] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Lấy thông tin user từ sessionStorage khi component mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user from sessionStorage:', error);
        sessionStorage.removeItem('user'); // Xóa nếu dữ liệu không hợp lệ
      }
    }
  }, []);

  // Tạo object để ánh xạ tên khoa và chuyên môn
  const ten = khoa.reduce((acc, khoa) => {
    acc[khoa.id] = khoa.ten;
    return acc;
  }, {} as Record<number, string>);

  const ten_chuyen_mon = chuyenmon.reduce((acc, chuyenmon) => {
    acc[chuyenmon.id] = chuyenmon.ten_chuyen_mon;
    return acc;
  }, {} as Record<string, string>);

  // Tải dữ liệu bác sĩ
  // Tải dữ liệu bác sĩ
const loadData = async () => {
  try {
    const url =
      user && user.khoa_id !== null
        ? `http://localhost:9999/api/bacsi/getall?khoa_id=${user.khoa_id}`
        : 'http://localhost:9999/api/bacsi/getall';

    console.log('Calling API:', url);

    const response = await axios.get<BacSi[]>(url); // Chỉ định kiểu dữ liệu trả về từ API
    const modifiedData = response.data.map((item: BacSi, index: number) => ({
      ...item,
      index: index + 1 + (pagedb - 1) * pageSizedb,
    }));

    // Lọc dữ liệu theo tên bác sĩ
    const filteredData = query
      ? modifiedData.filter((item: BacSi) => item.ho_ten.toLowerCase().includes(query.toLowerCase()))
      : modifiedData;

    setData(filteredData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
  // Tải danh sách khoa
  const loadData1 = async () => {
    try {
      const response = await axios.get('http://localhost:9999/api/khoa/getall');
      setKhoa(response.data);
    } catch (error) {
      console.error('Error fetching khoa:', error);
    }
  };

  // Tải danh sách chuyên môn
  const loadData2 = async () => {
    try {
      const response = await axios.get('http://localhost:9999/api/chuyenmon/getall');
      setChuyenmon(response.data);
    } catch (error) {
      console.error('Error fetching chuyenmon:', error);
    }
  };

  // Xóa bác sĩ
  const handleDelete = async (record: BacSi) => {
    const shouldDelete = window.confirm('Có chắc chắn muốn xóa không?');
    if (shouldDelete) {
      try {
        await axios.delete(`http://localhost:9999/api/bacsi/xoabacsi/${record.id}`);
        notification.success({
          message: 'Thành công',
          description: 'Xóa bác sĩ thành công',
          placement: 'topRight',
          duration: 3,
        });
        loadData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  // Cập nhật trạng thái khám qua video
  const handleToggle = async (checked: boolean, id: string) => {
    try {
      await axios.put(`http://localhost:9999/api/bacsi/updateKhambenhVideo/${id}`, {
        khambenh_qua_video: checked,
      });
      loadData();
      notification.success({
        message: 'Thành công',
        description: 'Cập nhật trạng thái khám qua video thành công',
        placement: 'topRight',
        duration: 3,
      });
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  // Xóa nhiều bác sĩ
  const handleDeleteMultiple = async () => {
    const shouldDelete = window.confirm('Có chắc chắn muốn xóa các bác sĩ đã chọn không?');
    if (shouldDelete) {
      try {
        await Promise.all(
          selectedRowKeys.map((id) => axios.delete(`http://localhost:9999/api/bacsi/xoabacsi/${id}`))
        );
        notification.success({
          message: 'Thành công',
          description: 'Xóa các bác sĩ thành công',
          placement: 'topRight',
          duration: 3,
        });
        loadData();
        setSelectedRowKeys([]);
      } catch (error) {
        console.error('Error deleting multiple:', error);
      }
    }
  };

  // Cập nhật danh sách hàng được chọn
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Tải dữ liệu khi user, query, hoặc các tham số thay đổi
  useEffect(() => {
    if (user) {
      loadData();
    }
    loadData1();
    loadData2();
  }, [user, query]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '0' }}>
          Danh sách bác sĩ trong bệnh viện
        </h2>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ marginRight: '10px' }}
            onClick={() => navigate('/createBS')}
          >
            Thêm bác sĩ
          </Button>

          <Button
            onClick={handleDeleteMultiple}
            disabled={selectedRowKeys.length === 0}
            style={{ backgroundColor: selectedRowKeys.length > 0 ? '#ff0003' : undefined, marginRight: 10 }}
          >
            Xóa nhiều
          </Button>

          <Input.Search
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onSearch={loadData}
            placeholder="Tìm kiếm bác sĩ..."
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
        </div>
      </div>

      <Table rowSelection={rowSelection} dataSource={data} rowKey="id">
        <Column title="STT" dataIndex="index" key="index" />
        <Column title="Tên bác sĩ" dataIndex="ho_ten" key="ho_ten" />
        <Column title="Khoa" dataIndex="khoa_id" key="khoa_id" render={(khoa_id) => ten[khoa_id] || 'Không xác định'} />
        <Column
          title="Chuyên môn"
          dataIndex="chuyen_mon"
          key="chuyen_mon"
          render={(chuyen_mon) => ten_chuyen_mon[chuyen_mon] || 'Không xác định'}
        />
        <Column title="Số điện thoại" dataIndex="so_dien_thoai" key="so_dien_thoai" />
        <Column title="Email" dataIndex="email" key="email" />
        <Column
          title="Ngày sinh"
          dataIndex="ngay_sinh"
          key="ngay_sinh"
          render={(ngay_sinh) =>
            ngay_sinh
              ? new Date(ngay_sinh).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : 'Không xác định'
          }
        />
        <Column title="Giới tính" dataIndex="gioi_tinh" key="gioi_tinh" />
        <Column title="Địa chỉ" dataIndex="dia_chi" key="dia_chi" />
        <Column
          title="Ảnh"
          dataIndex="hinh_anh"
          key="hinh_anh"
          render={(anh: string) => <img src={anh} alt="Ảnh" style={{ width: 50, height: 'auto' }} />}
        />
        <Column
          title="Giá khám"
          dataIndex="gia"
          key="gia"
          render={(gia: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia)}
        />
        <Column
          title="Khám qua video"
          key="khambenh_qua_video"
          render={(_, record: BacSi) => (
            <Switch checked={record.khambenh_qua_video} onChange={(checked) => handleToggle(checked, record.id)} />
          )}
        />
        <Column
          title="Action"
          key="action"
          render={(_, record: BacSi) => (
            <Space size="middle">
              <Link style={{ fontSize: '25px' }} to={`/editBS/${record.id}`}>
                <EditOutlined />
              </Link>
              <a style={{ fontSize: '25px', color: 'red' }} onClick={() => handleDelete(record)}>
                <DeleteOutlined />
              </a>
            </Space>
          )}
        />
      </Table>
    </>
  );
};

export default App;