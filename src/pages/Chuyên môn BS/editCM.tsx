import React, { useEffect, useState } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Mentions,
  notification,
} from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { error } from 'console';

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


const EditCM: React.FC = () => {

  const { id } = useParams()
  const [form] = Form.useForm()
  const [chuyenmon, setchuyenmon] = useState<chuyenmon>();
  const navigate = useNavigate();

  interface chuyenmon {
    id: number; // Mã khách hàng là một số nguyên
    ten_chuyen_mon: string; // Tên khách hàng là một chuỗi
  
  }


  useEffect(() => {
    async function loadData() {
      const res = await axios.get(`http://localhost:9999/api/chuyenmon/getchuyenmonbyid/${id}`)
      setchuyenmon(res.data);
      
      form.setFieldsValue(res.data[0]);
    }

    loadData();
  }, [id,form]);

  form.setFieldsValue({ ...chuyenmon })

  const Update = async (MaCM: chuyenmon) => {
    let chuyenmon = {
      "id": MaCM.id,
      "ten_chuyen_mon": MaCM.ten_chuyen_mon
    };
    console.log(chuyenmon);
    try {
      const response = await axios.put(
        "http://localhost:9999/api/chuyenmon/suachuyenmon", chuyenmon
      );
      if (response) {
        // Hiển thị thông báo thành công
        notification.success({
          message: 'Thành công',
          description: 'Đã sửa chuyên môn thành công',
          placement: 'top',
          duration: 2 // Thông báo tự động biến mất sau 3 giây
        });
        navigate('/indexCM');
      }
    } catch (error) {
      console.error("Lỗi data:", error);
      alert("Sửa thất bại")

    }
  }
  return (
    <div>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Sửa chuyên môn</h2>
      <Form {...formItemLayout}
      form={form}
      onFinish={Update}
      variant="filled" style={{ maxWidth: 600 ,marginTop:20 }}>
          <Form.Item
        label="Mã chuyên môn"
        name='id'
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>
      <Form.Item
        label="Tên khách hàng"
        name='ten_chuyen_mon'
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
    </div>
    
  );


};

export default () => <EditCM />;