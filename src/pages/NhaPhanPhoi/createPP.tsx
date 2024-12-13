import React from 'react';
import {
  Button, DatePicker, Form, Mentions,
  Upload,
} from 'antd';
import axios from 'axios';
import { notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
const { RangePicker } = DatePicker;

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

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

const CreatePP: React.FC = () => {
   const CreatePP = async (values: any) => {
    // let nhaphanphoi = {
    //   "MaNPP ": 0,
    //   "TenNPP": values.TenNPP,
    //   "DiaChi": values.DiaChi,
    //   "SoDienThoai": values.SoDienThoai,
    //   "Email": values.Email,
    //   "files": values.anh && values.anh[0] ? values.anh[0].originFileObj : null
    // };
    const formData = new FormData();
    formData.append('id', values.id);
    formData.append('ten_nha_phan_phoi', values.ten_nha_phan_phoi);
    formData.append('dia_chi',  values.dia_chi); // Thêm giá trị tương ứng nếu cần
    formData.append('so_dien_thoai', values.so_dien_thoai); // Thêm giá trị tương ứng nếu cần
    formData.append('email', values.email);
    formData.append('ghi_chu',values.ghi_chu);
    formData.append('files', values.Sanpham.anh[0].originFileObj); // File ảnh đại diện
    try{
      const response = await axios.post(
        "http://localhost:9999/api/nhaphanphoi/themnhaphanphoi",formData
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
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Thêm nhà phân phối</h2>
      <Form {...formItemLayout} variant="filled"
    onFinish={CreatePP}
     style={{ maxWidth: 600,marginTop:20}}
     >

      <Form.Item
        label="Tên nhà phân phối"
        name={['ten_nha_phan_phoi']}
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>


      <Form.Item
        label="Địa chỉ"
        name={['dia_chi']}
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>

      <Form.Item
        label="Email"
        name={['email']}
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>
      <Form.Item
        label="Số điện thoại"
        name={['so_dien_thoai']}
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>
      <Form.Item
        label="Ghi chú"
        name={['ghi_chu']}
        rules={[{ required: true, message: 'Please input!' }]}
      >
        <Mentions />
      </Form.Item>
      <Form.Item label="Upload" valuePropName="fileList" getValueFromEvent={normFile} name={['Sanpham', 'anh']} rules={[{ required: true, message: 'Please upload an image!' }]}>
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
    </div>
    
  );
};



export default () => <CreatePP />;