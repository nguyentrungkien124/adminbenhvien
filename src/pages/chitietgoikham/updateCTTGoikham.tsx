import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { DatePicker, Form, Input, Upload, Button, notification, Select } from 'antd';
import axios from 'axios';
import { useForm } from 'antd/es/form/Form';
import { useNavigate, useParams } from 'react-router-dom';
const { Option } = Select; 
const { TextArea } = Input;

const normFile = (e: any) => {
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
};

const EditCTTGoikham: React.FC = () => {
    const [form] = Form.useForm();
    const [ctgoikham, setCTGoiKham] = useState<ChiTietGoiKham>();
    const navigate = useNavigate();
    const [goikham, setGoiKham] = useState<any[]>([]);
    const { id } = useParams()

    interface ChiTietGoiKham {
        id?: number;
        goi_kham_id?: string;
        ten_chi_tiet?: string;
        mo_ta?: string;
        gia?: string;
        gia_giam?: string;
        files?: any;
    }

    useEffect(() => {
        async function loadData() {
            try {
                const res = await axios.get(`http://localhost:9999/api/chitietgoikham/chitietgoikhambyid/${id}`);
                setCTGoiKham(res.data[0]);
                form.setFieldsValue(res.data[0]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        loadData();
    }, [id, form]);

    const loadData1 = async () => {
        try {
            const response = await axios.get("http://localhost:9999/api/goikham/getall");
            if (response) setGoiKham(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    useEffect(() => {

        loadData1();
    }, []);


    const Update = async (chitietgoikham: ChiTietGoiKham) => {
        const fromData = new FormData();
        fromData.append('id', chitietgoikham.id ? chitietgoikham.id.toString() : '');
        fromData.append('goi_kham_id', chitietgoikham.goi_kham_id || '');
        fromData.append('ten_chi_tiet', chitietgoikham.ten_chi_tiet || '');
        fromData.append('mo_ta', chitietgoikham.mo_ta || '');
        fromData.append('gia', chitietgoikham.gia || '');
        fromData.append('gia_giam', chitietgoikham.gia_giam || '');
        console.log("Updating with data:", fromData);
        if (chitietgoikham.files) {
            fromData.append('files', chitietgoikham.files[0].originFileObj);
        }

        try {
            const response = await axios.put("http://localhost:9999/api/chitietgoikham/suachitietgoikham", fromData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response) {
                notification.success({
                    message: 'Thành công',
                    description: 'Đã sửa chi tiết gói khám thành công',
                    placement: 'top',
                    duration: 2
                });
                // navigate('/indexSL');

            }
        } catch (error) {
            console.error("Error updating slide:", error);
            notification.error({
                message: 'Thất bại',
                description: 'Sửa chi tiết gói khám thất bại',
                placement: 'top',
                duration: 2
            });
        }
    };



    return (
        <>
            <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Sửa chi tiết gói khám</h2>
            <Form
                form={form}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                style={{ maxWidth: 600 }}
                onFinish={Update}
            >
                <Form.Item label="Mã chi tiết " name='id'>
                    <Input disabled />
                </Form.Item>

        
                <Form.Item label="Gói khám" name='goi_kham_id'>
          <Select placeholder="Chọn gói khám">
            {goikham.map((value: any) => (
              <Option key={value.id} value={value.id}>{value.ten_goi}</Option>
            ))}
          </Select>
        </Form.Item>
           

                <Form.Item label="Tên chi tiết" name='ten_chi_tiet'>
                    <Input />
                </Form.Item>

                <Form.Item label="Mô tả" name='mo_ta'>
                    <Input />
                </Form.Item>

                <Form.Item label="Giá" name='gia'>
                    <Input />
                </Form.Item>

                <Form.Item label="Giá giảm" name='gia_giam'>
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

export default EditCTTGoikham;
