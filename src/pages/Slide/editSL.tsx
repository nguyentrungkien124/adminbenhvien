import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { DatePicker, Form, Input, Upload, Button, notification } from 'antd';
import axios from 'axios';
import { useForm } from 'antd/es/form/Form';
import { useNavigate, useParams } from 'react-router-dom';

const { TextArea } = Input;

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const EditSL: React.FC = () => {
  const [form] = Form.useForm();
  const [slide, setSlide] = useState<Slide>();
  const navigate = useNavigate();
  const { maSlide } = useParams()

  interface Slide {
    maSlide?: number;
    hinhAnh?: string;
    moTa?: string;
    maTaiKhoan?: number;
  }

  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get(`https://localhost:44381/api/Slide/get_by_id?id=${maSlide}`);
        setSlide(res.data);
        form.setFieldsValue({ ...res.data, hinhAnh: undefined });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    loadData();
  }, [maSlide, form]);

  const Update = async (slideData: Slide) => {
    try {
      let image = await uploadImage22(slideData.hinhAnh);
      let slide = {
        ...slideData,
        hinhAnh: image
      };
      const response = await axios.put("https://localhost:44381/api/Slide/Slide_Update", slide);
      if (response) {
        notification.success({
          message: 'Thành công',
          description: 'Đã sửa slide thành công',
          placement: 'top',
          duration: 2
        });
        navigate('/indexSL');
      }
    } catch (error) {
      console.error("Error updating slide:", error);
      notification.error({
        message: 'Thất bại',
        description: 'Sửa slide thất bại',
        placement: 'top',
        duration: 2
      });
    }
  };

  async function uploadImage22(hinhAnh: any) {
    if (!hinhAnh || hinhAnh.length === 0) return '';

    const image = hinhAnh[0].originFileObj;
    const formData = new FormData();
    formData.append("file", image);

    try {
      let res = await axios.post("https://localhost:44381/api/UpLoad_/upload", formData, { headers: { "Custom-Header": "value" } });
      return res.data.filePath;
    } catch (error) {
      console.error("Error uploading image:", error);
      return '';
    }
  }

  return (
    <>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Sửa slide</h2>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
        onFinish={Update}
      >
        <Form.Item label="Mã slide" name='maSlide'>
          <Input disabled />
        </Form.Item>
        <Form.Item label="Mã tài khoản" name='maTaiKhoan'>
          <Input />
        </Form.Item>
        <Form.Item label="Mô tả" name='moTa'>
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item name="hinhAnh" label="Ảnh Đại Diện" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
            <button style={{ border: 0, background: 'none' }} type="button">
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </button>
          </Upload>
        </Form.Item>

        <Form.Item label="Ảnh cũ SP">
          {slide?.hinhAnh && (
            <img
              src={`./../upload/${slide.hinhAnh}`}
              alt="Ảnh"
              style={{ width: '100px', height: 'auto', marginLeft: '20px' }}
            />
          )}
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 14 }}>
          <Button type="primary" htmlType="submit">
            Lưu
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default EditSL;
