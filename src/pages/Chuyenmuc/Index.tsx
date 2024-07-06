import React, { useEffect, useState } from 'react';
import { Button, Space, Table } from 'antd';
import axios from 'axios';
import {Link, useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Column } = Table;

const AdminCategory: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
 const navigate=useNavigate()

  const loadData = async () => {
    try {
      const response = await axios.post(
        "https://localhost:44381/api/ChuyenMuc/ChuyenMuc_Search",
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
      const maChuyenMuc = record.maChuyenMuc;
      try {
        const response = await axios.delete(
          'https://localhost:44381/api/ChuyenMuc/ChuyenMuc_Delete?id=' + maChuyenMuc,
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
      <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>Danh sách chuyên mục sản phẩm</h2>

    <Table dataSource={data} >
      <Column title="STT" dataIndex="index" key="index"  />
      <Column title="Tên chuyên mục" dataIndex="tenChuyenMuc" key="tenChuyenMuc" />
      <Column
        title="Action"
        key="action"
        render={(_: any, record: any) => (
          <Space size="middle">
          <Button style={{backgroundColor:'aqua'}} onClick={()=>{
            localStorage.setItem("chuyenmucEdit",JSON.stringify(record))
            navigate("/editCM")
            
          }}><EditOutlined /></Button> {/* Sử dụng Link để điều hướng đến trang sửa */}
            <Button style={{backgroundColor:'red'}} onClick={() => handleDelete(record)}><DeleteOutlined /></Button>
          </Space>
        )}
      />
    </Table>
    </div>
  );
};

export default AdminCategory;
