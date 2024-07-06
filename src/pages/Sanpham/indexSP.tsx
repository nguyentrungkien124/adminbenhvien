import React, { useEffect, useState } from 'react';
import { Space, Table, Pagination, Button, Input } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import { useParams } from "react-router-dom";
import { EditOutlined, DeleteOutlined,SearchOutlined } from '@ant-design/icons';

const { Column } = Table;

const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  // const [totalProductsdb, setTotalProductsdb] = useState<number>(0);
  const [pagedb] = useState<number>(1);
  const [pageSizedb] = useState<number>(1000);
  const formatCurrency = (value: number) => numeral(value).format('0,0 VNĐ');
  const { maSanPham } = useParams()
  const [query, setQuery] = useState(''); // Lưu trữ truy vấn tìm kiếm

  
  const loadData = async () => {
    try {
      const response = await axios.post(
        "https://localhost:44381/api/SanPham/search",
        {
          page: pagedb.toString(),
          pageSize: pageSizedb
        }
      );
      
      const modifiedData = response.data.data.map((item: any, index: any) => ({
        ...item,
        index: index + 1 + (pagedb - 1) * pageSizedb // Chỉnh sửa chỉ số STT
      }));
      setData(modifiedData); // Gán dữ liệu đã chỉnh sửa vào data
      // setTotalProductsdb(response.data.total); 
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  
  const handleDelete = async (record: any) => {
    const shouldDelete = window.confirm('Có chắc chắn muốn xóa không');
    if (shouldDelete) {
      const maSanPham = record.maSanPham;
      try {
        await axios.delete(
          'https://localhost:44381/api/SanPham/San_Pham_Delete?id=' + maSanPham,
        );
        alert("Xóa thành công");
        loadData(); // Gọi hàm loadData sau khi xóa thành công
      } catch (error) {
        console.error("Lỗi data:", error);
      }
    }
  };
  

  useEffect(() => {
    loadData();
  }, [pagedb, pageSizedb]);


  // const handlePageChange = (currentPage: number) => {
  //   setPagedb(currentPage);
  // };

  return (
    <>  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Danh sách sản phẩm</h2>
    {/* Nút tìm kiếm */}
    <Input.Search
      // value={query}
      // onChange={(e) => setQuery(e.target.value)} // Cập nhật truy vấn tìm kiếm
      // onSearch={loadData} // Gọi loadData khi tìm kiếm
      placeholder="Tìm kiếm sản phẩm..."
      style={{ width: 300 }}
      enterButton={<SearchOutlined />}
    />
  </div>
      <Table dataSource={data}>
        <Column
          title="STT"
          dataIndex="index"
          key="index"
      
        />
        <Column title="Tên sản phẩm" dataIndex="tenSanPham" key="tenSanPham" />
        <Column title="Chuyên mục SP" dataIndex="tenChuyenMuc" key="tenChuyenMuc" />

        <Column title="Giá" dataIndex="gia" key="gia"  render={(gia: number) => <span>{formatCurrency(gia)}VNĐ</span>}  />
        <Column title="Giá KM" dataIndex="giaGiam" key="giaGiam" render={(giaGiam: number) => <span>{formatCurrency(giaGiam)}VNĐ</span>} />
        <Column
          title="Ảnh"
          dataIndex="anhDaiDien"
          key="anhDaiDien"
          render={(anhDaiDien: string) => (
            <img
              src={"./../upload/" + anhDaiDien}
              alt="Ảnh"
              style={{ width: 50, height: "auto" }}
            />
          )}
        />
        <Column title="Số lượng" dataIndex="soLuong" key="soLuong" />
        <Column
          title="Action"
          key="action"
          render={(_: any, record: any) => (
            <Space size="middle">
              <Link  style={{fontSize:'25px'}} to={'/editSP/'+record.maSanPham}><EditOutlined /></Link>
              <a style={{fontSize:'25px'}} onClick={() => handleDelete(record)}><DeleteOutlined /></a>
            </Space>
          )}
        />
      </Table>

    
    </>
  );
};

export default App;


