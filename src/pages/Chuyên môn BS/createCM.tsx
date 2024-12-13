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

const CreateCM: React.FC = () => {
   const CreateCM = async (values: any) => {
    let chuyenmon ={
      "id": values.id,
      "ten_chuyen_mon": values.ten_chuyen_mon

    }
    try{
      const response = await axios.post(
        "http://localhost:9999/api/chuyenmon/themchuyenmon",chuyenmon
      );
      if (response) {
        // Hiển thị thông báo thành công
        notification.success({
          message: 'Thành công',
          description: 'Đã thêm chuyên môn thành công',
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
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Thêm chuyên môn bác sĩ</h2>
      <Form {...formItemLayout} variant="filled"
    onFinish={CreateCM}
     style={{ maxWidth: 600,marginTop:20}}
     >

      <Form.Item
        label="Tên chuyên môn"
        name={['ten_chuyen_mon']}
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



export default () => <CreateCM />;