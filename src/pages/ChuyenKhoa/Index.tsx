import React, { useEffect, useState } from 'react';
import { Button, Space, Table } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Column } = Table;

const AdminCategory: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const response = await axios.get("http://localhost:9999/api/khoa/getall");
      const modifiedData = response.data.map((item: any, index: any) => ({
        ...item,
        index: index + 1
      }));
      setData(modifiedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDelete = async (record: any) => {
    const shouldDelete = window.confirm('Có chắc chắn muốn xóa không');
    if (shouldDelete) {
      const danh_muc_id = record.danh_muc_id;
      try {
        const response = await axios.delete('http://localhost:9999/api/loaisp/delete/' + danh_muc_id);
        response && alert("Xóa thành công");
        loadData(); // Gọi hàm loadData sau khi xóa thành công
      } catch (error) {
        console.error("Lỗi data:", error);
      }
    }
  };

  useEffect(() => {
    loadData(); // Gọi hàm loadData khi component được render
  }, []); // Thực hiện một lần duy nhất khi component được render

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>
        Danh sách Khoa Bệnh Viện
      </h2>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: '16px' }}
        onClick={() => navigate('/create')} // Điều hướng tới trang thêm mới
      >
        Thêm Khoa
      </Button>

      <Table dataSource={data}>
        <Column title="STT" dataIndex="index" key="index" />
        <Column title="Tên Khoa" dataIndex="ten" key="ten" />
        <Column title="Mô tả" dataIndex="mo_ta" key="mo_ta" />
        <Column
          title="Ảnh Khoa"
          dataIndex="hinh_anh"
          key="hinh_anh"
          render={(anh: string) => (
            <img
              src={anh} // Đảm bảo rằng `${anh}` chứa tên file chính xác
              alt="Ảnh"
              style={{ width: 50, height: "auto" }}
            />
          )}
        />
         <Column

          title="Chức năng"
          key="action"
          render={(_: any, record: any) => (
            <Space size="middle">
              <Link to={'/editKhoa/' + record.id} style={{ fontSize: '25px', color: '#1890ff' }}>
                <EditOutlined style={{ fontSize: '25px', color: '#1890ff', transition: 'color 0.3s' }} />
              </Link>
              <a onClick={() => handleDelete(record)} style={{ fontSize: '25px', color: 'red', transition: 'color 0.3s' }}>
                <DeleteOutlined style={{ fontSize: '25px', color: 'red' }} />
              </a>
              <Link to="/create" style={{ fontSize: '25px', color: 'green' }}>
                <PlusOutlined style={{ fontSize: '25px', color: 'green', transition: 'color 0.3s' }} />
              </Link>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};

export default AdminCategory;
