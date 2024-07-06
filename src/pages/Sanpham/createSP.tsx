import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  Form,
  Input,
  Select,
  Upload,
  notification,
} from 'antd';
import { Option } from 'antd/es/mentions';



const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const App: React.FC = () => {
  // hook
  const [chuyenmuc,setChuyenmuc]=useState([])
  const loadData = async () => {
    try {
      const response = await axios.post(
        "https://localhost:44381/api/ChuyenMuc/ChuyenMuc_Search",
        {
          page: "1",
          pageSize: "100",
        }
        
      );
      response&&setChuyenmuc(response.data.data)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  useEffect(()=>{
    loadData()
  })
  const navigate = useNavigate();
  async function uploadImage(anhdaidien: any) {
    // Lấy đối tượng file từ danh sách anhdaidien[0] là phần tử đầu tiên của danh sách và originFileObj là đối tượng file thực tế được chọn.
    const image = anhdaidien[0].originFileObj
    const formData = new FormData()
    formData.append("file", image)
    let res = await axios.post("https://localhost:44381/api/UpLoad_/upload", formData, { headers: { "Custom-Header": "value" } })

    return res.data.filePath

  }
  const onFinish = async (values: any) => {
    let sanpham = {
      "maSanPham": 0,
      "maChuyenMuc": values.Sanpham.maChuyenMuc,
      "tenSanPham": values.Sanpham.tenSanPham,
      "anhDaiDien": await uploadImage(values.Sanpham.anhDaiDien),
      "gia": values.Sanpham.gia,
      "giaGiam":values.Sanpham.giaGiam,
      "soLuong": values.Sanpham.soLuong,
      "trangThai": true,
      "luotXem": 0
    }
    console.log(sanpham)
    try {
      const response = await axios.post(
        "https://localhost:44381/api/SanPham/San_Pham_Create",sanpham
       
      );
      if (response) {
        // Hiển thị thông báo thành công
        notification.success({
          message: 'Thành công',
          description: 'Đã thêm sản phẩm thành công',
          placement: 'top',
          duration: 2 // Thông báo tự động biến mất sau 3 giây
        });
      }
      navigate('/indexSP'); 

    } catch (error) {
      console.error("Lỗi data:", error);
    }
  };


  return (
    <>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Thêm sản phẩm</h2>
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        onFinish={onFinish}
        style={{ maxWidth: 600, marginTop:30 }}
      >

        <Form.Item label="Tên Sản Phẩm" name={['Sanpham', 'tenSanPham']} >
          <Input />
        </Form.Item>

        <Form.Item label="Mã CM" name={['Sanpham', 'maChuyenMuc']} rules={[{ required:true,message: 'Please input!' }]}>
        <Select>
          {
            chuyenmuc.map((value:any,index:number)=>{
              return <>
              <Option key={index+""} value={value.maChuyenMuc}>{value.tenChuyenMuc}</Option>
              </>
            })
          }
        </Select>
        </Form.Item>

        <Form.Item label="Giá" name={['Sanpham', 'gia']}>
          <Input />
        </Form.Item>

        <Form.Item label="Giá KM" name={['Sanpham', 'giaGiam']}>
          <Input />
        </Form.Item>

        <Form.Item label="Số lượng " name={['Sanpham', 'soLuong']}>
          <Input />
        </Form.Item>

        <Form.Item label="Upload" valuePropName="fileList" getValueFromEvent={normFile} name={['Sanpham', 'anhDaiDien']}>
          <Upload listType="picture-card">
            <button style={{ border: 0, background: 'none' }} type="button">
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </button>
          </Upload>
        </Form.Item>


        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Thêm
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default () => <App />;


