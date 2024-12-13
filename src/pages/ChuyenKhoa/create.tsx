import React from 'react';
import { Button, Form, Input, notification, Upload } from 'antd'; // Loại bỏ InputNumber vì không được sử dụng trong mã này
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';

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
  const formData = new FormData();
  formData.append('ten', values.Khoa.ten);
  formData.append('mo_ta', values.Khoa.mo_ta);

  // Kiểm tra xem ảnh có tồn tại và là một mảng không
  if (values.Khoa.anh && values.Khoa.anh.length > 0) {
    formData.append('files', values.Khoa.anh[0].originFileObj); // File ảnh đại diện
  } else {
    notification.error({
      message: 'Lỗi',
      description: 'Vui lòng tải lên hình ảnh.',
      placement: 'top',
      duration: 2
    });
    return; // Ngừng thực hiện nếu không có ảnh
  }

  try {
    const response = await axios.post(
      "http://localhost:9999/api/khoa/themkhoa",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response) {
      notification.success({
        message: 'Thành công',
        description: 'Đã thêm sản phẩm thành công',
        placement: 'top',
        duration: 2
      });
    }

    navigate('/index');

  } catch (error) {
    console.error("Lỗi data:", error);
  }
};

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>Thêm Khoa</h2>
      <Form
      {...layout}
      name="nest-messages"
      onFinish={onFinish}
      style={{ maxWidth: 600, marginRight: 700, marginTop:50 }}
      validateMessages={validateMessages}
    >
    <Form.Item name={['Khoa', 'ten']} label="Tên Khoa" rules={[{ required: true }]}>
  <Input />
</Form.Item>
<Form.Item name={['Khoa', 'mo_ta']} label="Mô tả" rules={[{ required: true }]}>
  <Input />
</Form.Item>
      <Form.Item label="Upload" valuePropName="fileList" getValueFromEvent={normFile} name={['Khoa', 'anh']} rules={[{ required: true, message: 'Please upload an image!' }]}>
          <Upload listType="picture-card">
            <button style={{ border: 0, background: 'none' }} type="button">
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </button>
          </Upload>
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
