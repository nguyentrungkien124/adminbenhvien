import React, { useEffect, useState } from 'react';
import { Space, Table, Input, Button, Switch, notification, Checkbox } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import numeral from 'numeral';
import { useParams } from 'react-router-dom';
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
  kinh_nghiem:string;
}


const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [pagedb] = useState<number>(1);
  const [pageSizedb] = useState<number>(1000);
  const formatCurrency = (value: number) => numeral(value).format('0,0 VNĐ');
  const { maSanPham } = useParams();
  const [khoa, setKhoa] = useState<any[]>([]);
  const [chuyenmon, setChuyenmon] = useState<any[]>([]);
  const [query, setQuery] = useState(''); // Lưu trữ truy vấn tìm kiếm
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); // Lưu trữ các khóa hàng đã chọn

  const ten = khoa.reduce((acc, khoa) => {
    acc[khoa.id] = khoa.ten;
    return acc;
  }, {});

  const ten_chuyen_mon = chuyenmon.reduce((acc, chuyenmon) => {
    acc[chuyenmon.id] = chuyenmon.ten_chuyen_mon;
    return acc;
  }, {});

  const loadData = async () => {
    try {
      const response = await axios.get("http://localhost:9999/api/bacsi/getall");
      const modifiedData = response.data.map((item: any, index: any) => ({
        ...item,
        index: index + 1 + (pagedb - 1) * pageSizedb // Chỉnh sửa chỉ số STT
      }));

      // Lọc dữ liệu theo tên bác sĩ nếu có truy vấn tìm kiếm
      const filteredData = query
        ? modifiedData.filter((item:any) => item.ho_ten.toLowerCase().includes(query.toLowerCase()))
        : modifiedData;

      setData(filteredData); // Gán dữ liệu đã lọc vào data
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const loadData1 = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9999/api/khoa/getall",
      );
      if (response) setKhoa(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const loadData2 = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9999/api/chuyenmon/getall",
      );
      if (response) setChuyenmon(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDelete = async (record: any) => {
    const shouldDelete = window.confirm('Có chắc chắn muốn xóa không');
    if (shouldDelete) {
      const id = record.id;
      try {
        await axios.delete('http://localhost:9999/api/bacsi/xoabacsi/' + id);
        alert("Xóa thành công");
        loadData(); // Gọi hàm loadData sau khi xóa thành công

      } catch (error) {
        console.error("Lỗi data:", error);
      }
    }
  };

  const handleToggle = async (checked: boolean, id: string) => {
    try {
      await axios.put(`http://localhost:9999/api/bacsi/updateKhambenhVideo/${id}`, {
        khambenh_qua_video: checked, // Gửi trạng thái mới
      });
      loadData(); // Cập nhật lại dữ liệu sau khi thay đổi
      notification.success({
        message: 'Thành công',
        description: 'Đã sửa bác sĩ khám bệnh qua video thành công',
        placement: 'topRight',
        duration: 3 // Thông báo tự động biến mất sau 3 giây
      });
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleDeleteMultiple = async () => {
    const shouldDelete = window.confirm('Có chắc chắn muốn xóa các bác sĩ đã chọn không?');
    if (shouldDelete) {
      try {
        await Promise.all(selectedRowKeys.map(id => axios.delete(`http://localhost:9999/api/bacsi/xoabacsi/${id}`)));
        alert("Xóa thành công");
        loadData(); // Gọi hàm loadData sau khi xóa thành công
        setSelectedRowKeys([]); // Reset danh sách đã chọn
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
      }
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys); // Cập nhật danh sách đã chọn
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  useEffect(() => {
    loadData();
    loadData1();
    loadData2();
  }, [pagedb, pageSizedb]);

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
            onClick={() => navigate('/createBS')} // Điều hướng tới trang thêm mới
          >
            Thêm bác sĩ
          </Button>

          <Button
            // type="danger"
            onClick={handleDeleteMultiple} // Gọi hàm xóa nhiều
            disabled={selectedRowKeys.length === 0} // Vô hiệu hóa nếu không có hàng nào được chọn
            style={{ backgroundColor: selectedRowKeys.length > 0 ? 'rgb(255 0 3)' : undefined , marginRight:10}}
          >
            Xóa nhiều
          </Button>

          {/* Nút tìm kiếm */}
          <Input.Search
            value={query}
            onChange={(e) => setQuery(e.target.value)} // Cập nhật truy vấn tìm kiếm
            onSearch={() => loadData()} // Gọi loadData khi tìm kiếm
            placeholder="Tìm kiếm bác sĩ..."
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
        </div>
      </div>

      <Table rowSelection={rowSelection} dataSource={data}>
        <Column
          title="STT"
          dataIndex="index"
          key="index"
        />
        <Column title="Tên bác sĩ" dataIndex="ho_ten" key="ho_ten" />
        <Column
          title="Khoa"
          dataIndex="khoa_id"
          key="khoa_id"
          render={(khoa_id) => ten[khoa_id] || 'Không xác định'}
        />
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
          render={(ngay_sinh) => {
            const date = new Date(ngay_sinh);
            const formattedDate = date.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            return formattedDate || 'Không xác định';
          }}
        />
        <Column title="Giới tính" dataIndex="gioi_tinh" key="gioi_tinh" />
        <Column title="Địa chỉ" dataIndex="dia_chi" key="dia_chi" />
        <Column
          title="Ảnh"
          dataIndex="hinh_anh"
          key="hinh_anh"
          render={(anh: string) => (
            <img
              src={anh}
              alt="Ảnh"
              style={{ width: 50, height: "auto" }}
            />
          )}
        />
        {/* <Column title="Mật khẩu" dataIndex="mat_khau" key="mat_khau" /> */}
        <Column
          title="Giá khám"
          dataIndex="gia"
          key="gia"
          render={(gia: number) =>
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia)
          }
        />
        <Column
          title="Khám bệnh qua video"
          key="khambenh_qua_video"
          render={(_, record: BacSi) => (
            <Switch
              checked={record.khambenh_qua_video}
              onChange={(checked) => handleToggle(checked, record.id)}
            />
          )}
        />
       {/* <Column title="Kinh nghiệm" dataIndex="kinh_nghiem" key="kinh_nghiem" /> */}
        <Column
          title="Action"
          key="action"
          render={(_: any, record: any) => (
            <Space size="middle">
              <Link style={{ fontSize: '25px' }} to={'/editBS/' + record.id}><EditOutlined /></Link>
              <a style={{ fontSize: '25px',color:'red' }} onClick={() => handleDelete(record)}><DeleteOutlined /></a>
            </Space>
          )}
        />
      </Table>
    </>
  );
};

export default App;
