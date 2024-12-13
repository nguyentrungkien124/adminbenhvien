import React, { useEffect, useState } from 'react';
import { Space, Table } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import numeral from 'numeral';
import { EyeOutlined } from '@ant-design/icons';

const { Column } = Table;

const IndexKho: React.FC = () => {
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
      const response = await axios.get(
        "http://localhost:9999/api/kho/getall",
        // {
        //   page: "1",
        //   pageSize: "10",
        // }
      );
      const modifiedData = response.data.map((item: any, index: any) => ({
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
      const kho_id = record.kho_id;
      try {
        await axios.delete(
          'http://localhost:9999/api/kho/xoakho/' + kho_id,
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
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Danh sách kho nhập</h2>
      <Table dataSource={data}>
        <Column title="STT" dataIndex="index" key="index" />
        <Column title="Tên sản phẩm" dataIndex="ten_san_pham" key="ten_san_pham" />
        {/* Hiển thị tên nhà phân phối thay vì mã nhà phân phối */}
        <Column
          title="Loại sản phẩm"
          dataIndex="loai_san_pham"
          key="loai_san_pham"
          // render={(maNhaPhanPhoi) => maNhaPhanPhoiToTen[maNhaPhanPhoi] || 'Không xác định'}
        />
        <Column title="Số lượng tổng" dataIndex="so_luong_tong" key="so_luong_tong" />
        <Column title="Đơn vị tính" dataIndex="don_vi_tinh" key="don_vi_tinh" />
        <Column title="Trạng thái" dataIndex="trang_thai" key="trang_thai" />
        <Column title="Mô tả" dataIndex="mo_ta" key="mo_ta"   />
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
              {/* <Link  style={{fontSize:'25px'}} to={'/editPP/'+record.id}><EyeOutlined /></Link>  */}
              <Link style={{ fontSize: '25px'}} to={'/chitietKho/' + record.kho_id}>
                <EyeOutlined />
              </Link>
               <a style={{ fontSize: '25px', color:'red' }} onClick={() => handleDelete(record)} ><DeleteOutlined /></a>
            </Space>
          )}
        />
      </Table>
    </>
  );
};

export default IndexKho;
