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

const CreateTTB: React.FC = () => {
  const [khoa, setKhoa] = useState<any[]>([]);
  const [nhomtrangthietbi, setNTTB] = useState<any[]>([]);
  const navigate = useNavigate()
  const { Option } = Select;

  const loadData = async () => {
    try {
      const response = await axios.get("http://localhost:9999/api/khoa/getall");
      if (response) setKhoa(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const loadData1 = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9999/api/nhomthietbi/getall",
      );
      if (response) setNTTB(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const onFinish = async (values: any) => {
    const fromData = new FormData();
    fromData.append('ten_thiet_bi', values.ten_thiet_bi);
    fromData.append('files', values.Trangthietbi.anh[0].originFileObj); // File ảnh đại diện
    fromData.append('ma_thiet_bi', values.ma_thiet_bi);
    fromData.append('so_luong', values.so_luong);
    fromData.append('khoa_id', values.khoa_id);
    fromData.append('trang_thai', values.trang_thai);
    fromData.append('nhom_id', values.nhom_id);
    try {
      const response = await axios.post(
        "http://localhost:9999/api/trangthietbi/themtrangthietbi", fromData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      );
      if (response) {
        notification.success({
          message: "Thành công",
          description: "Dã thêm slide thành công",
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
    loadData1();
  }, []);

  return (
    <>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Thêm trang thiết bị</h2>

      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
      >

        <Form.Item label="Tên thiết bị" name={['ten_thiet_bi']}>
          <Input></Input>
        </Form.Item>

        <Form.Item label="Mã thiết bị" name={['ma_thiet_bi']}>
          <Input></Input>
        </Form.Item>

        <Form.Item label="Số lượng" name={['so_luong']}>
          <Input></Input>
        </Form.Item>

        <Form.Item label="Khoa" name={['khoa_id']} rules={[{ required: true, message: 'Vui lòng chọn khoa!' }]}>
              <Select>
                {khoa.map((value: any, index: number) => (
                  <Option key={index + ""} value={value.id}>{value.ten}</Option>
                ))}
              </Select>
            </Form.Item>


        <Form.Item label="Trạng thái" name={['trang_thai']}>
          <Input></Input>
        </Form.Item>

        <Form.Item label="Nhóm" name={['nhom_id']} rules={[{ required: true, message: 'Vui lòng chọn nhóm thiết bị!' }]}>
              <Select>
                {nhomtrangthietbi.map((value: any, index: number) => (
                  <Option key={index + ""} value={value.id}>{value.ten_nhom}</Option>
                ))}
              </Select>
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

export default () => <CreateTTB />;