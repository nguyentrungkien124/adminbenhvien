import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Mentions, notification,Upload } from 'antd';
import axios from 'axios';


const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const validateMessages = {
  required: '${label} is required!',
};

const Edit: React.FC = () => {
  interface khoa {
    id?: number;
    ten?: string;
    mo_ta?: string;
    files?: any;
  }

  const { id } = useParams();
  const [form] = Form.useForm();
  const [khoaEdit, setKhoa] = useState<khoa>();

  useEffect(() => {
    async function loadData() {
      const res = await axios.get(`http://localhost:9999/api/khoa/getkhoabyid/${id}`);
      setKhoa(res.data);
      form.setFieldsValue(res.data[0]);
    }

    loadData();
  }, [id, form]);

  const Update = async (values: khoa) => {
    const formData = new FormData();
    formData.append('ten', values.ten || '');  // Cung cấp giá trị mặc định nếu undefined
    formData.append('mo_ta', values.mo_ta || ''); 
    
    formData.append('id', values.id ? values.id.toString() : '');
  
    if (values.files) {
      formData.append('files', values.files[0].originFileObj);
    }
    
    try {
      const response = await axios.put('http://localhost:9999/api/khoa/suakhoa', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        
      });
      
      if (response.status === 200) {
        notification.success({
          message: 'Thành công',
          description: 'Đã sửa sản phẩm thành công',
          placement: 'top',
          duration: 2,
        });
        // Navigate('/index');
      }
    } catch (error) {
      console.error('Error updating product:', error);
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
      <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>Sửa chuyên khoa</h2>

      <Form
        form={form}
        {...layout}
        onFinish={Update}
        name="nest-messages"
        style={{ maxWidth: 600, marginTop: 50 }}
        validateMessages={validateMessages}
      >
        <Form.Item
          label="Mã danh mục"
          name='id'
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Mentions />
        </Form.Item>
        <Form.Item
          label="Tên danh mục"
          name='ten'
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Mentions />
        </Form.Item>
        <Form.Item
          label="Ghi chú"
          name='mo_ta'
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Mentions />
        </Form.Item>

          <Form.Item name="files" label="Ảnh Sản Phẩm" valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
                <button style={{ border: 0, background: 'none' }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              </Upload>
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

export default Edit;
