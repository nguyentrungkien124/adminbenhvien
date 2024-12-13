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

const EditTTB: React.FC = () => {
  const [form] = Form.useForm();
  const [ttb, setTtb] = useState<TrangThietBi>();
  const navigate = useNavigate();
  const { id } = useParams()

  interface TrangThietBi {
    id?: number;
    files?: any;
    ten_thiet_bi?: string;
    ma_thiet_bi?: string;
    so_luong?: string;
    khoa_id?: string;
    trang_thai?: string;
    nhom_id?: string;
  }

  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get(`http://localhost:9999/api/trangthietbi/getTrangThietBi/${id}`);
        setTtb(res.data);
        form.setFieldsValue(res.data[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    loadData();
  }, [id, form]);

  const Update = async (trangthietbi: TrangThietBi) => {
    const fromData = new FormData();
    fromData.append('id', trangthietbi.id ? trangthietbi.id.toString() : '');
    fromData.append('ten_thiet_bi', trangthietbi.ten_thiet_bi || '');
    fromData.append('ma_thiet_bi', trangthietbi.ma_thiet_bi || '');
    fromData.append('so_luong', trangthietbi.so_luong || '');
    fromData.append('khoa_id', trangthietbi.khoa_id || '');
    fromData.append('trang_thai', trangthietbi.trang_thai || '');
    fromData.append('nhom_id', trangthietbi.nhom_id || '');
    if (trangthietbi.files) {
      fromData.append('files', trangthietbi.files[0].originFileObj);
    }

    try {
      const response = await axios.put("http://localhost:9999/api/trangthietbi/suatrangthietbi", fromData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response) {
        notification.success({
          message: 'Thành công',
          description: 'Đã sửa slide thành công',
          placement: 'top',
          duration: 2
        });
        // navigate('/indexSL');

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



  return (
    <>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Sửa trang thiết bị</h2>
      <Form
        form={form}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        style={{ maxWidth: 600 }}
        onFinish={Update}
      >
        <Form.Item label="Mã trang thiết bị" name='id'>
          <Input disabled />
        </Form.Item>

        <Form.Item label="Tên thiết bị" name='ten_thiet_bi'>
          <Input />
        </Form.Item>

        <Form.Item label="Mã thiết bị" name='ma_thiet_bi'>
        <Input />
        </Form.Item>

        <Form.Item label="Số lượng" name='so_luong'>
        <Input />
        </Form.Item>

        <Form.Item label="Khoa" name='khoa_id'>
        <Input />
        </Form.Item>

        <Form.Item label="Trạng thái" name='trang_thai'>
        <Input />
        </Form.Item>

        <Form.Item label="Nhóm trang thiết bị" name='nhom_id'>
        <Input />
        </Form.Item>
        
        <Form.Item name="files" label="Ảnh Sản Phẩm" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
            <button style={{ border: 0, background: 'none' }} type="button">
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </button>
          </Upload>
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

export default EditTTB;
