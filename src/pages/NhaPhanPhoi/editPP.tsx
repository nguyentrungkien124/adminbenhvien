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


const EditPP: React.FC = () => {

  const { maNhaPhanPhoi } = useParams()
  const [form] = Form.useForm()
  const [nhaphanphoi, setNhaPhanPhoi] = useState<NhaPhanPhoi>();
  const navigate = useNavigate();

  interface NhaPhanPhoi {
    maNhaPhanPhoi?: number;
    tenNhaPhanPhoi?: string;
    diaChi?: string;
    soDienThoai?: string;
  }


  useEffect(() => {
    async function loadData() {
      const res = await axios.get(`https://localhost:44381/api/NhaPhanPhoi/PhaPhanPhoi_GetID?id=${maNhaPhanPhoi}`)
      setNhaPhanPhoi(res.data);
    }

    loadData();
  }, [maNhaPhanPhoi]);

  form.setFieldsValue({ ...nhaphanphoi })

  const Update = async (NhaPhanPhoi: NhaPhanPhoi) => {
    let nhaphanphoi = {
      "maNhaPhanPhoi": NhaPhanPhoi.maNhaPhanPhoi,
      "tenNhaPhanPhoi": NhaPhanPhoi.tenNhaPhanPhoi,
      "diaChi": NhaPhanPhoi.diaChi,
      "soDienThoai": NhaPhanPhoi.soDienThoai
    };
    console.log(nhaphanphoi);
    try {
      const response = await axios.put(
        "https://localhost:44381/api/NhaPhanPhoi/PhaPhanPhoi_Update", nhaphanphoi
      );
      if (response) {
        // Hiển thị thông báo thành công
        notification.success({
          message: 'Thành công',
          description: 'Đã sửa nhà phân phối thành công',
          placement: 'top',
          duration: 2 // Thông báo tự động biến mất sau 3 giây
        });
        navigate('/indexPP')
      }
    } catch (error) {
      console.error("Lỗi data:", error);
      alert("Sửa thất bại")

    }
  }
  return (
    <div>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Sửa nhà phân phối</h2>
      <Form {...formItemLayout}
      form={form}
      onFinish={Update}
      variant="filled" style={{ maxWidth: 600 ,marginTop:20 }}>
          <Form.Item
        label="Mã nhà phân phối"
        name='maNhaPhanPhoi'
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>
      <Form.Item
        label="Tên nhà phân phối"
        name='tenNhaPhanPhoi'
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>


      <Form.Item
        label="Địa chỉ"
        name='diaChi'
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>


      <Form.Item
        label="Số điện thoại"
        name='soDienThoai'
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

export default () => <EditPP />;