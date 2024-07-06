import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Form, Input } from 'antd';
import axios from 'axios';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const validateMessages = {
  required: '${label} is required!',
};
 
const Edit: React.FC = () => {
  const [form] = Form.useForm(); // Sử dụng Form.useForm() để tạo form instance
  const [chuyenmucEdit,setChuyenmuc]=useState(JSON.parse(localStorage.getItem('chuyenmucEdit')!)||undefined)
  const{tenChuyenMuc,maChuyenMuc}=chuyenmucEdit
 
  async function handleSubmit(data:any) {
    console.log(data)
    try{

      let res =await axios.post("https://localhost:44381/api/ChuyenMuc/ChuyenMuc_Update",data.Chuyenmuc)
    
      res.data&&alert("Sửa thành công")
    }
    catch{
      alert("Sửa thất bại")
    }
  }
  return (
   <div>
     <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>Sửa chuyên mục sản phẩm</h2>

     <Form
      form={form} // Truyền form instance vào Form
      {...layout}
      onFinish={handleSubmit}
      name="nest-messages"
      style={{ maxWidth: 600 , marginTop:50}}
      validateMessages={validateMessages}
      initialValues={{ Chuyenmuc: { maChuyenMuc:maChuyenMuc,tenChuyenMuc: tenChuyenMuc } }} // Thiết lập giá trị mặc định cho form
    >
      <Form.Item name={['Chuyenmuc', 'maChuyenMuc']} label="Mã chuyên mục" rules={[{ required: true }]}>
        <Input disabled  /> 
      </Form.Item> 
      <Form.Item name={['Chuyenmuc', 'tenChuyenMuc']} label="Tên chuyên mục" rules={[{ required: true }]}>
        <Input  /> 
      </Form.Item>  

      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
        <Button type="primary" htmlType="submit">
          Sửa
        </Button>
      </Form.Item>
    </Form>
   </div>
  );
};

export default Edit;
