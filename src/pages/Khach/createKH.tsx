import React from 'react';
import {
  Button, DatePicker, Form, Mentions,
} from 'antd';
import axios from 'axios';
import { notification } from 'antd';
const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const CreateKH: React.FC = () => {
   const CreateKH = async (values: any) => {
    let khachhang ={
      "maKH": 0,
      "tenKH": values.tenKH,
      "diaChi": values.diaChi,
      "sdt": values.sdt

    }
    try{
      const response = await axios.post(
        "https://localhost:44381/api/Khach/Create",khachhang
      );
      if (response) {
        // Hiển thị thông báo thành công
        notification.success({
          message: 'Thành công',
          description: 'Đã thêm nhà phân phối thành công',
          placement: 'topRight',
          duration: 3 // Thông báo tự động biến mất sau 3 giây
        });
      }
    }catch(error){
      console.error("Lỗi data", error);
      alert("Lỗi không thêm được")
    }
   };



  return (
    <div>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Thêm khách hàng</h2>
      <Form {...formItemLayout} variant="filled"
    onFinish={CreateKH}
     style={{ maxWidth: 600,marginTop:20}}
     >

      <Form.Item
        label="Tên khách hàng"
        name={['tenKH']}
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>


      <Form.Item
        label="Địa chỉ"
        name={['diaChi']}
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>


      <Form.Item
        label="Số điện thoại"
        name={['sdt']}
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>


      <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Thêm
        </Button>
      </Form.Item>
    </Form>
    </div>
    
  );
};



export default () => <CreateKH />;