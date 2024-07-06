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


const EditKH: React.FC = () => {

  const { maKH } = useParams()
  const [form] = Form.useForm()
  const [khachhang, setKhachHang] = useState<MaKH>();
  const navigate = useNavigate();

  interface MaKH {
    maKH: number; // Mã khách hàng là một số nguyên
    tenKH: string; // Tên khách hàng là một chuỗi
    diaChi: string; // Địa chỉ là một chuỗi
    sdt: string; // Số điện thoại là một chuỗi
  }


  useEffect(() => {
    async function loadData() {
      const res = await axios.get(`https://localhost:44381/api/Khach/get_by_id?id=${maKH}`)
      setKhachHang(res.data);
    }

    loadData();
  }, [maKH]);

  form.setFieldsValue({ ...khachhang })

  const Update = async (MaKH: MaKH) => {
    let khachhang = {
      "maKH": MaKH.maKH,
      "tenKH": MaKH.tenKH,
      "diaChi": MaKH.diaChi,
      "sdt": MaKH.sdt
    };
    console.log(khachhang);
    try {
      const response = await axios.post(
        "https://localhost:44381/api/Khach/Update_KH", khachhang
      );
      if (response) {
        // Hiển thị thông báo thành công
        notification.success({
          message: 'Thành công',
          description: 'Đã sửa nhà phân phối thành công',
          placement: 'top',
          duration: 2 // Thông báo tự động biến mất sau 3 giây
        });
        navigate('/indexKH');
      }
    } catch (error) {
      console.error("Lỗi data:", error);
      alert("Sửa thất bại")

    }
  }
  return (
    <div>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Sửa khách hàng</h2>
      <Form {...formItemLayout}
      form={form}
      onFinish={Update}
      variant="filled" style={{ maxWidth: 600 ,marginTop:20 }}>
          <Form.Item
        label="Mã khách hàng"
        name='maKH'
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>
      <Form.Item
        label="Tên khách hàng"
        name='tenKH'
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
        name='sdt'
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

export default () => <EditKH />;