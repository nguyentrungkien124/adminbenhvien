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
      const response = await axios.get(
        "http://localhost:9999/api/nhaphanphoi/getall",
        {
          // page: "1",
          // pageSize: "10",
        }
      );
      const modifiedData = response.data.map((item: any, index: any) => ({
        ...item,
        index: index + 1
      }));
      setData(modifiedData);
      
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      
    }
  };

  const handleDelete = async (record: any) => {
    const shouldDelete = window.confirm('Có chắc chắn muốn xóa không');
    if (shouldDelete) {
      const MaNPP = record.MaNPP;
      try {
        const response = await axios.delete(
          'http://localhost:9999/api/nhaphanphoi/xoanpp/' + MaNPP,
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
          <Column title="Tên nhà phân phối" dataIndex="ten_nha_phan_phoi" key="ten_nha_phan_phoi" />
          <Column title="Địa chỉ" dataIndex="dia_chi" key="dia_chi" />
          <Column title="Email" dataIndex="email" key="email" />
          <Column title="Ghi chú" dataIndex="ghi_chu" key="ghi_chu" />
          <Column title="Số điện thoại" dataIndex="so_dien_thoai" key="so_dien_thoai" />
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
                <Link  style={{fontSize:'25px'}} to={'/editPP/'+record.id}><EditOutlined /></Link> 
                <a   style={{fontSize:'25px'}}onClick={() => handleDelete(record)}><DeleteOutlined /></a>
              </Space>
            )}
          />
        </Table>
   
    </div>
  );
};

export default IndexPP;
