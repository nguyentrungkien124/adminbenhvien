import React, { useEffect, useState } from 'react';
import { Space, Table, Pagination, Button } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import numeral from 'numeral';
import { useParams } from "react-router-dom";
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Column } = Table;

const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [totalProductsdb, setTotalProductsdb] = useState<number>(0);
  const [pagedb] = useState<number>(1);
  const [pageSizedb] = useState<number>(100);
  const navigate = useNavigate();
  const { maKH } = useParams()

  
  const loadData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9999/api/chuyenmon/getall",
        {
          // page: pagedb.toString(),
          // pageSize: pageSizedb
        }
      );
      const modifiedData = response.data.map((item: any, index: any) => ({
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
    <><h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Danh sách chuyên môn bác sĩ</h2>
    <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: '16px' }}
        onClick={() => navigate('/createCM')} // Điều hướng tới trang thêm mới
      >
        Thêm chuyên môn
      </Button>

      <Table dataSource={data}>
        <Column
          title="STT"
          dataIndex="index"
          key="index"
      
        />
        <Column title="Tên chuyên môn" dataIndex="ten_chuyen_mon" key="ten_chuyen_mon" />
        
        <Column
          title="Action"
          key="action"
          render={(_: any, record: any) => (
            <Space size="middle">
              <Link to="/createCM" style={{ fontSize: '25px', color: 'green' }}>
                <PlusOutlined style={{ fontSize: '25px', color: 'green', transition: 'color 0.3s' }} />
              </Link>
              <Link  style={{fontSize:'25px'}} to={'/editCM/'+record.id}><EditOutlined /></Link>
              <a onClick={() => handleDelete(record)} style={{ fontSize: '25px', color: 'red', transition: 'color 0.3s' }}>
                <DeleteOutlined style={{ fontSize: '25px', color: 'red' }} />
              </a>
              
            </Space>
          )}
        />
      </Table>

    
    </>
  );
};

export default App;


