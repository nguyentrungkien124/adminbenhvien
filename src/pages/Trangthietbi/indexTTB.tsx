import React, { useEffect, useState } from 'react';
import { Button, Space, Table } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';


const { Column } = Table;

const IndexTTB: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [nhomtrangthietbi, setNTTB] = useState<any[]>([]);
  const [khoa, setKhoa] = useState<any[]>([]);
  const navigate = useNavigate()

  const ten = khoa.reduce((acc, khoa) => {
    acc[khoa.id] = khoa.ten;
    return acc;
  }, {});

  const ten_nhom = nhomtrangthietbi.reduce((acc, nhomtrangthietbi) => {
    acc[nhomtrangthietbi.id] = nhomtrangthietbi.ten_nhom;
    return acc;
  }, {});
  const loadData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9999/api/trangthietbi/getall",
        {

        }
      );
      const modifiedData = response.data.map((item: any, index: any) => (
        {
          ...item,
          index: index + 1
        }
      ));
      setData(modifiedData);
      console.log(modifiedData)

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const handleDelete = async (record: any) => {
    const shouldDelete = window.confirm('Bạn có chắc chắn muốn xóa không?');
    if (shouldDelete) {
      const maSlide = record.maSlide;
      try {
        await axios.delete(
          'http://localhost:9999/api/banner/deletebanner/' + maSlide,

        );
        alert("Xóa thành công");
        loadData();
      } catch (error) {
        console.error("Lỗi data", error);
      }
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
        "http://localhost:9999/api/nhomthietbi/getall",
      );
      if (response) setNTTB(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    loadData();
    loadData1();
    loadData2();
  }, []);




  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px',color: '#4a90e2' }}>Danh sách các trang thiết bị</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: '16px' }}
        onClick={() => navigate('/createTTB')} // Điều hướng tới trang thêm mới
      >
        Thêm trang thiết bị
      </Button>
      <Table dataSource={data} >
        <Column title="STT" dataIndex="index" key="index" />
        <Column title="Tên thiết bị" dataIndex="ten_thiet_bi" key="ten_thiet_bi" />
        <Column title="Mã thiết bị" dataIndex="ma_thiet_bi" key="ma_thiet_bi" />
        <Column title="Số lượng" dataIndex="so_luong" key="so_luong" />
        <Column
          title="Khoa"
          dataIndex="khoa_id"
          key="khoa_id"
          render={(khoa_id) => ten[khoa_id] || 'Không xác định'}
        />

        <Column
          title="Trạng thái"
          dataIndex="trang_thai"
          key="trang_thai"
          render={(trang_thai) => (
            trang_thai === "1" ? "Đang sử dụng" :
              trang_thai === "2" ? "Ngưng sử dụng" :
                "Không xác định"
          )}
        />
        <Column title="Nhóm" dataIndex="nhom_id" key="nhom_id"
          render={(nhom_id) => ten_nhom[nhom_id] || 'Không xác định'} />
        <Column
          title="Ảnh"
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
          title="Action"
          key="action"
          render={(_: any, record: any) => (
            <Space size="middle">
              <Link style={{ fontSize: '25px' }} to={'/editTTB/' + record.id}><EditOutlined /></Link>
              <a style={{ fontSize: '25px' }} onClick={() => handleDelete(record)}><DeleteOutlined /></a>
            </Space>
          )}
        />
      </Table>
    </div>
  );
};

export default IndexTTB;
