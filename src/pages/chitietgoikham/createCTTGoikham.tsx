import React, { useEffect, useState } from 'react';
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

const CreateCTTGoikham: React.FC = () => {
  const [goikham, setGoiKham] = useState<any[]>([]);

  const navigate = useNavigate()
  const { Option } = Select;

  const loadData = async () => {
    try {
        const response = await axios.get(
            "http://localhost:9999/api/goikham/getall",
        );
        if (response) setGoiKham(response.data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};
  

  const onFinish = async (values: any) => {
    const fromData = new FormData();
    fromData.append('goi_kham_id', values.goi_kham_id);
    fromData.append('files', values.Trangthietbi.anh[0].originFileObj); // File ảnh đại diện
    fromData.append('ten_chi_tiet', values.ten_chi_tiet);
    fromData.append('mo_ta', values.mo_ta);
    fromData.append('gia', values.gia);
    fromData.append('gia_giam', values.gia_giam);
   
    try {
      const response = await axios.post(
        "http://localhost:9999/api/chitietgoikham/themchitietgoikham", fromData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      );
      if (response) {
        notification.success({
          message: "Thành công",
          description: "Dã thêm chi tiết gói khám thành công",
          placement: 'top',
          duration: 2
        });
        // navigate('/indexTTB')

      }
    } catch (error) {
      console.error("Lỗi data:", error);
    }
  }
useEffect(() => {
    loadData();
 
  }, []);

  return (
    <>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Thêm chi tiết gói khám</h2>

      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
      >


        <Form.Item label="Tên chi tiết gói khám" name={['ten_chi_tiet']}>
          <Input></Input>
        </Form.Item>

        <Form.Item label="Mô tả" name={['mo_ta']}>
          <Input></Input>
        </Form.Item>

        <Form.Item label="Gói khám" name={['goi_kham_id']} rules={[{ required: true, message: 'Vui lòng chọn khoa!' }]}>
              <Select>
                {goikham.map((value: any, index: number) => (
                  <Option key={index + ""} value={value.id}>{value.ten_goi}</Option>
                ))}
              </Select>
            </Form.Item>


        <Form.Item label="Giá" name={['gia']}>
          <Input></Input>
        </Form.Item>
                
        <Form.Item label="Giá giảm" name={['gia_giam']}>
          <Input></Input>
        </Form.Item>

        <Form.Item label="Upload" valuePropName="fileList" getValueFromEvent={normFile} name={['Trangthietbi', 'anh']} rules={[{ required: true, message: 'Please upload an image!' }]}>
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

export default () => <CreateCTTGoikham />;