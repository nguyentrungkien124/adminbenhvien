import React, { useEffect, useState } from 'react';
import { Button, Space, Table } from 'antd';
import axios from 'axios';
import {Link, useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';


const { Column } = Table;

const IndexNTTB: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const navigate = useNavigate()
    const loadData = async()=>{
        try{
            const response = await axios.get(
                "http://localhost:9999/api/nhomthietbi/getall",
                {

                }
            );
            const modifiedData = response.data.map((item:any, index:any)=>(
                {
                    ...item,
                    index:index+1
                }
            ));
            setData(modifiedData);
            console.log(modifiedData)

        }catch(error){
            console.error("Error fetching data:", error);
        }
    };
    const handleDelete = async (record: any)=>{
        const shouldDelete = window.confirm('Bạn có chắc chắn muốn xóa không?');
        if(shouldDelete){
            const id = record.id;
            try{
                await axios.delete(
                    'http://localhost:9999/api/nhomthietbi/xoanhomthietbi/' +id,

                );
                alert("Xóa thành công");
                loadData();
            }catch(error){
                console.error("Lỗi data",error);
            }
        }

    };
  
    useEffect(()=>{
        loadData();
    },[]);
   // Hàm để chuyển đổi trạng thái
const getStatusText = (status: string | number): string => {
    // Chuyển đổi thành số nếu cần
    const statusNumber = typeof status === 'string' ? parseInt(status, 10) : status;
    
    switch (statusNumber) {
        case 1:
            return 'Còn sử dụng';
        case 2:
            return 'Đang bảo trì';
        default:
            return 'Không xác định';
    }
};




  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' ,color: '#4a90e2',}}>Danh sách nhóm trang thiết bị</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: '16px' }}
        onClick={() => navigate('/createNTTB')} // Điều hướng tới trang thêm mới
      >
        Thêm nhóm trang thiết bị
      </Button>
    <Table dataSource={data} >
      <Column title="STT" dataIndex="index" key="index"  />
      {/* <Column
          title="Ảnh"
          dataIndex="anh"
          key="anh"
          render={(anh: string) => (
            <img
              src={anh} // Đảm bảo rằng `${anh}` chứa tên file chính xác
              alt="Ảnh"
              style={{ width: 50, height: "auto" }}
            />
          )}
        /> */}
      <Column title="Tên nhóm" dataIndex="ten_nhom" key="ten_nhom" />
      <Column title="Trạng thái" dataIndex="trang_thai" key="trang_thai" 
                    render={(text: number) => getStatusText(text)} // Hiển thị trạng thái
                />
      <Column
                    title="Ngày cập nhật"
                    dataIndex="created_at"
                    key="created_at"
                    render={(text: string) => dayjs(text).format('DD-MM-YYYY')} // Sửa lại phần này
                />
      <Column
          title="Action"
          key="action"
          render={(_: any, record: any) => (
            <Space size="middle">
                <Link to="/createNTTB" style={{ fontSize: '25px', color: 'green' }}>
                <PlusOutlined style={{ fontSize: '25px', color: 'green', transition: 'color 0.3s' }} />
              </Link>
            <Link  style={{fontSize:'25px'}} to={'/editNTTB/'+record.id}><EditOutlined /></Link>
              <a style={{fontSize:'25px',color :'red'}} onClick={() => handleDelete(record)}><DeleteOutlined /></a>
            </Space>
          )}
        />
    </Table>
    </div>
  );
};

export default IndexNTTB;
