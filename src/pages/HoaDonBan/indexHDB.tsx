import React, { useEffect, useState } from 'react';
import { Button, Space, Table } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import numeral from 'numeral';

const { Column } = Table;

interface Invoice {
  maHoaDon: number;
  maKH: number;
  trangThai: number;
  ngayTao: string;
  tongGia: number;
  diaChiGiaoHang: string;
  tenKH: string;
  cachThucThanhToan: string;
  list_json_ChiTietHD: any; // bạn có thể cụ thể hơn nếu biết cấu trúc của chi tiết hóa đơn
}

const IndexHDB: React.FC = () => {
  const [data, setData] = useState<Invoice[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pagedb] = useState<number>(1);
  const [pageSizedb] = useState<number>(1000);
  const [trangthai, setTrangThai] = useState(0);
  const formatCurrency = (value: number) => numeral(value).format('0,0 VNĐ');

  const loadData = async () => {
    try {
      const response = await axios.post(
        'https://localhost:44381/api/HoaDonBan/HoaDon_Search',
        {
          page: pagedb,
          pageSize: pageSizedb,
          trangthai: trangthai.toString()
        }
      );
      console.log(response.data);
      const modifiedData = response.data.data.map((item: any, index: any) => ({
        ...item,
        index: index + 1 + (pagedb - 1) * pageSizedb // Chỉnh sửa chỉ số STT
      }));
        // Sắp xếp dữ liệu theo ngày tạo giảm dần
      modifiedData.sort((a: Invoice, b: Invoice) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime());

      setData(modifiedData);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDelete = async (record: Invoice) => {
    const shouldDelete = window.confirm('Bạn có chắc chắn muốn xóa?');
    if (shouldDelete) {
      const maHoaDon = record.maHoaDon;
      try {
        await axios.delete('https://localhost:44381/api/HoaDonBan/HoaDon_Delete?id=' + maHoaDon);
        alert('Xóa thành công');
        loadData();
      } catch (error) {
        console.error('Lỗi data:', error);
        alert('Lỗi');
      }
    }
  };

  const handleUpdateTrangThai = async (id: number, currentTrangThai: number) => {
    let newTrangThai;
    switch (currentTrangThai) {
      case 1:
        newTrangThai = 0; // Chờ xác nhận -> Đã xác nhận
        break;
      case 0:
        newTrangThai = 3; // Đã xác nhận -> Đang giao hàng
        break;
      case 3:
        newTrangThai = 4; // Đang giao hàng -> Đã giao hàng
        break;
      case 4:
        newTrangThai = 4; // Đã giao hàng -> Giữ nguyên
        break;
      default:
        return; // Không làm gì nếu trạng thái không hợp lệ
    }
  
    try {
      await axios.put(`https://localhost:44381/api/HoaDonBan/UpdateTrangThai?id=${id}&updateTT=${newTrangThai}`);
      alert('Cập nhật trạng thái thành công');
      loadData();
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      alert('Lỗi khi cập nhật trạng thái');
    }
  };
  
  useEffect(() => {
    loadData();
  }, [pagedb, pageSizedb, trangthai]);

  // const handleTableChange = (pagination: any) => {
  //   setPage(pagination.current);
  //   setPageSize(pagination.pageSize);
  // };

  return (
    <>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>
        Danh sách hóa đơn bán
      </h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button type="primary" onClick={() => setTrangThai(1)} style={{ marginRight: '10px' }}>
          Chờ xác nhận
        </Button>
        <Button type="primary" onClick={() => setTrangThai(0)} style={{ marginRight: '10px' }}>
          Đã xác nhận
        </Button>
        <Button type="primary" onClick={() => setTrangThai(3)} style={{ marginRight: '10px' }}>
          Đang giao hàng
        </Button>
        <Button type="primary" onClick={() => setTrangThai(4)} style={{background:'red'}}>
          Đã giao hàng
        </Button>
      </div>
      <Table
        dataSource={data}
        // pagination={{ current: page, pageSize, total: totalItems }}
       
        rowKey="maHoaDon"
      >
        <Column title="STT" dataIndex="index" key="index" />
        <Column title="Mã DH" dataIndex="maHoaDon" key="maHoaDon" />
        <Column title="Mã khách hàng" dataIndex="maKH" key="maKH" />
        <Column title="Ngày tạo đơn hàng" dataIndex="ngayTao" key="ngayTao" />
        <Column title="Tổng tiền" dataIndex="tongGia" key="tongGia"  render={(tongGia: number) => <span>{formatCurrency(tongGia)}VNĐ</span>} />
        <Column title="Địa chỉ giao hàng" dataIndex="diaChiGiaoHang" key="diaChiGiaoHang" />
        <Column title="Cách thức nhận hàng" dataIndex="cachThucThanhToan" key="cachThucThanhToan" />
        <Column title="Tên khách hàng" dataIndex="tenKH" key="tenKH" />
        <Column
          title="Trạng thái"
          dataIndex="trangThai"
          key="trangThai"
          render={(text) => {
            switch (text) {
              case 1:
                return 'Chờ xác nhận';
              case 0:
                return 'Đã xác nhận';
              case 3:
                return 'Đang giao hàng';
              case 4:
                return 'Đã giao hàng';
              default:
                return 'Không xác định';
            }
          }}
        />
        <Column
          title="Action"
          key="action"
          render={(_, record: Invoice) => (
            <Space size="middle">
              <Link style={{ fontSize: '25px', color: 'red' }} to={'/detailHDB/' + record.maHoaDon}>
                <EditOutlined />
              </Link>
              <Link style={{ fontSize: '25px' }} to={'/editHDB/' + record.maHoaDon}>
                <EditOutlined />
              </Link>
              <a style={{ fontSize: '25px' }} onClick={() => handleDelete(record)}>
                <DeleteOutlined />
              </a>
            </Space>
          )}
        />
        <Column
          title="Xác nhận đơn"
          key="confirm"
          render={(_, record: Invoice) => (
            <Button
              type="primary"
              onClick={() => handleUpdateTrangThai(record.maHoaDon, record.trangThai)}
              disabled={record.trangThai === 4}
            >
              Xác nhận
            </Button>
          )}
        />
      </Table>
    </>
  );
};

export default IndexHDB;
