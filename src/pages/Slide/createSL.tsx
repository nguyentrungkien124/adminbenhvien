import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Input,
  Select,
  Upload,
  notification,
} from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const CreateSL: React.FC = () => {
  const navigate = useNavigate()
  async function uploadImage(hinhanh: any) {
    const image = hinhanh[0].originFileObj
    const formData = new FormData()
    formData.append("file", image)
    let res = await axios.post("https://localhost:44381/api/UpLoad_/upload", formData, { headers: { "Custom-Header": "value" } })
    return res.data.filePath
  }

  const onFinish = async (values: any) => {
    let slide = {
      "maSlide": 0,
      "hinhAnh": await uploadImage(values.hinhAnh),
      "moTa": values.moTa,
      "maTaiKhoan": values.maTaiKhoan
    }
    try {
      const response = await axios.post(
        "https://localhost:44381/api/Slide/Slide_Create", slide
      );
      if (response) {
        notification.success({
          message: "Thành công",
          description: "Dã thêm slide thành công",
          placement: 'top',
          duration: 2
        });
        navigate('/indexSL')

      }
    } catch (error) {
      console.error("Lỗi data:", error);
    }
  }


  return (
    <>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Thêm slide</h2>

      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
      >

        <Form.Item label="Mã tài khoản " name={['maTaiKhoan']}>
          <Input></Input>
        </Form.Item>

        <Form.Item label="Mô tả" name={['moTa']}>
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item label="Hình ảnh" valuePropName="fileList" getValueFromEvent={normFile} name={['hinhAnh']}>
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
    </>
  );
};

export default () => <CreateSL />;