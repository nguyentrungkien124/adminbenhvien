import React, { useEffect, useState } from 'react';
import { Space, Table, Pagination, Button } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import numeral from 'numeral';
import { useParams } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Column } = Table;

const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [totalProductsdb, setTotalProductsdb] = useState<number>(0);
  const [pagedb] = useState<number>(1);
  const [pageSizedb] = useState<number>(100);
  
  const { maKH } = useParams()

  
  const loadData = async () => {
    try {
      const response = await axios.post(
        "https://localhost:44381/api/Khach/search",
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
      setTotalProductsdb(response.data.total); 
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  const handleDelete = async (record: any) => {
    const shouldDelete = window.confirm('Có chắc chắn muốn xóa không');
    if (shouldDelete) {
      const maKH = record.maKH;
      try {
        await axios.delete(
          'https://localhost:44381/api/Khach/Delete_KH?id=' + maKH,
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




  return (
    <><h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Danh sách khách hàng</h2>

      <Table dataSource={data}>
        <Column
          title="STT"
          dataIndex="index"
          key="index"
      
        />
        <Column title="Tên khách hàng" dataIndex="tenKH" key="tenKH" />
        <Column title="Địa chỉ " dataIndex="diaChi" key="diaChi" /> 
        <Column title="Số điện thoại" dataIndex="sdt" key="sdt" />
        <Column
          title="Action"
          key="action"
          render={(_: any, record: any) => (
            <Space size="middle">
              <Link  style={{fontSize:'25px'}} to={'/editKH/'+record.maKH}><EditOutlined /></Link>
              <a style={{fontSize:'25px'}} onClick={() => handleDelete(record)}><DeleteOutlined /></a>
            </Space>
          )}
        />
      </Table>

    
    </>
  );
};

export default App;


