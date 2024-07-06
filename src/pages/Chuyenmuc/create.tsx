import React from 'react';
import { Button, Form, Input } from 'antd'; // Loại bỏ InputNumber vì không được sử dụng trong mã này
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

/* eslint-disable no-template-curly-in-string */
const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} is not a valid number!',
  },
  number: {
    range: '${label} must be between ${min} and ${max}',
  },
};

const App: React.FC = () => {
  // hook
  const navigate = useNavigate();
  const onFinish = async (values: any) => {
    console.log(values.Chuyenmuc.tenChuyenMuc);
    try {
      const response = await axios.post(
        "https://localhost:44381/api/ChuyenMuc/ChuyenMuc_Create",
        {
          tenChuyenMuc: values.Chuyenmuc.tenChuyenMuc,
          noidung: "",
        }
      );
      if (response) {
        alert("Thêm thành công");
        navigate('/Index'); // Điều hướng người dùng đến trang index sau khi thêm thành công
      }
    } catch (error) {
      console.error("Lỗi data:", error);
    }
  };

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>Thêm chuyên mục sản phẩm</h2>
      <Form
      {...layout}
      name="nest-messages"
      onFinish={onFinish}
      style={{ maxWidth: 600, marginRight: 700, marginTop:50 }}
      validateMessages={validateMessages}
    >
      <Form.Item name={['Chuyenmuc', 'tenChuyenMuc']} label="Tên Chuyên mục " rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      {/* <Form.Item name={['user', 'introduction']} label="Ghi chú">
        <Input.TextArea />
      </Form.Item> */}
      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
        <Button type="primary" htmlType="submit">
          Thêm
        </Button>
      </Form.Item>
    </Form>
    </div>
  
  );
};

export default App;
