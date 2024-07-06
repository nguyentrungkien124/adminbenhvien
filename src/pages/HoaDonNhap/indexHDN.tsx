import React, { useEffect, useState } from 'react';
import { Space, Table } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import numeral from 'numeral';

const { Column } = Table;

const IndexHDN: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [nhaPhanPhois, setNhaPhanPhois] = useState<any[]>([]);
  const formatCurrency = (value: number) => numeral(value).format('0,0 VNĐ');

  // Bản đồ để liên kết mã nhà phân phối với tên nhà phân phối
  const maNhaPhanPhoiToTen = nhaPhanPhois.reduce((acc, nhaPhanPhoi) => {
    acc[nhaPhanPhoi.maNhaPhanPhoi] = nhaPhanPhoi.tenNhaPhanPhoi;
    return acc;
  }, {});

  const loadData1 = async () => {
    try {
      const res = await axios.post(
        "https://localhost:44381/api/NhaPhanPhoi/NhaPhanPhoi_Search",
        {
          page: "1",
          pageSize: "100",
        }
      );
      setNhaPhanPhois(res.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const loadData = async () => {
    try {
      const response = await axios.post(
        "https://localhost:44381/api/HoaDonNhap/HoaDonNhap_Search",
        {
          page: "1",
          pageSize: "10",
        }
      );
      const modifiedData = response.data.data.map((item: any, index: any) => ({
        ...item,
        index: index + 1,
      }));
      setData(modifiedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDelete = async (record: any) => {
    const shouldDelete = window.confirm('Bạn có chắc chắn muốn xóa ');
    if (shouldDelete) {
      const maHoaDon = record.maHoaDon;
      try {
        await axios.delete(
          'https://localhost:44381/api/HoaDonNhap/HoaDonNhap_Delete?id=' + maHoaDon,
        );
        alert("Xóa thành công");
        loadData();
      } catch (error) {
        console.error("Lỗi data:", error);
        alert("lỗi")
      }
    }
  };


  useEffect(() => {
    loadData1(); // Gọi hàm loadData1 để tải danh sách nhà phân phối
    loadData();
     // Gọi hàm loadData để tải danh sách hóa đơn nhập
  }, []);

  return (
    <>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Danh sách hóa đơn nhập</h2>
      <Table dataSource={data}>
        <Column title="STT" dataIndex="index" key="index" />
        <Column title="MaHDN" dataIndex="maHoaDon" key="maHoaDon" />
        {/* Hiển thị tên nhà phân phối thay vì mã nhà phân phối */}
        <Column
          title="Tên nhà phân phối"
          dataIndex="maNhaPhanPhoi"
          key="maNhaPhanPhoi"
          render={(maNhaPhanPhoi) => maNhaPhanPhoiToTen[maNhaPhanPhoi] || 'Không xác định'}
        />
        <Column title="Ngày tạo" dataIndex="ngayTao" key="ngayTao" />
        <Column title="Kiểu thanh toán" dataIndex="kieuThanhToan" key="kieuThanhToan" />
        <Column title="Mã tài khoản" dataIndex="maTaiKhoan" key="maTaiKhoan" />
        <Column title="Tổng tiền" dataIndex="tongTien" key="tongTien" render={(tongTien: number) => <span>{formatCurrency(tongTien)}VNĐ</span>}  />
      
        <Column
          title="Action"
          key="action"
          render={(_: any, record: any) => (
            <Space size="middle">
               <a style={{ fontSize: '25px' }} onClick={() => handleDelete(record)} ><DeleteOutlined /></a>
            </Space>
          )}
        />
      </Table>
    </>
  );
};

export default IndexHDN;
