import React, { useEffect, useState } from 'react';
import { Button, Space, Table } from 'antd';
import axios from 'axios';
import {Link, useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';


const { Column } = Table;

const IndexSL: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const navigate = useNavigate()
    const loadData = async()=>{
        try{
            const response = await axios.post(
                "https://localhost:44381/api/Slide/Slide_Search",
                {

                }
            );
            const modifiedData = response.data.data.map((item:any, index:any)=>(
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
            const maSlide = record.maSlide;
            try{
                await axios.delete(
                    'https://localhost:44381/api/Slide/Slide_Delete?id='+maSlide,

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
  



  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>Danh sách các slide</h2>

    <Table dataSource={data} >
      <Column title="STT" dataIndex="index" key="index"  />
      <Column title="Hình ảnh" dataIndex="hinhAnh" key="hinhAnh" render={(hinhAnh:string)=>(
        <img
        src={"./../upload/"+hinhAnh}
        alt="Ảnh"
        style={{width:50,height:"auto"}}/>
      )} />
      <Column title="Mô tả" dataIndex="moTa" key="moTa" />
      <Column title="Mã tài khoản thêm" dataIndex="maTaiKhoan" key="maTaiKhoan" />

      <Column
          title="Action"
          key="action"
          render={(_: any, record: any) => (
            <Space size="middle">
            <Link  style={{fontSize:'25px'}} to={'/editSL/'+record.maSlide}><EditOutlined /></Link>
              <a style={{fontSize:'25px'}} onClick={() => handleDelete(record)}><DeleteOutlined /></a>
            </Space>
          )}
        />
    </Table>
    </div>
  );
};

export default IndexSL;
