import React, { useEffect, useState } from 'react';
import { Space, Table } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';


const { Column } = Table;

const IndexPP: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  

  const loadData = async () => {
    try {
      const response = await axios.post(
        "https://localhost:44381/api/NhaPhanPhoi/NhaPhanPhoi_Search",
        {
          page: "1",
          pageSize: "10",
        }
      );
      const modifiedData = response.data.data.map((item: any, index: any) => ({
        ...item,
        index: index + 1
      }));
      setData(modifiedData);
      
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      
    }
  };

  const handleDelete = async (record: any) => {
    const shouldDelete = window.confirm('Có chắc chắn muốn xóa không');
    if (shouldDelete) {
      const maNhaPhanPhoi = record.maNhaPhanPhoi;
      try {
        const response = await axios.delete(
          'https://localhost:44381/api/NhaPhanPhoi/PhaPhanPhoi_Delete?id=' + maNhaPhanPhoi,
        );
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
          <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px', color: '#4a90e2' }}>Danh sách nhà phân phối</h2>
        <Table dataSource={data}>
          <Column title="STT" dataIndex="index" key="index" />
          <Column title="Tên nhà phân phối" dataIndex="tenNhaPhanPhoi" key="tenNhaPhanPhoi" />
          <Column title="Địa chỉ" dataIndex="diaChi" key="diaChi" />
          <Column title="Số điện thoại" dataIndex="soDienThoai" key="soDienThoai" />
          
          <Column
            title="Action"
            key="action"
            render={(_: any, record: any) => (
              <Space size="middle">
                <Link  style={{fontSize:'25px'}} to={'/editPP/'+record.maNhaPhanPhoi}><EditOutlined /></Link> 
                <a   style={{fontSize:'25px'}}onClick={() => handleDelete(record)}><DeleteOutlined /></a>
              </Space>
            )}
          />
        </Table>
   
    </div>
  );
};

export default IndexPP;
