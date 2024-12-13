import React from 'react';
import { Button, Form, Input, notification } from 'antd';
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

const CreateNTTB: React.FC = () => {
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        try {
            // Gửi dữ liệu trực tiếp dưới dạng JSON
            const response = await axios.post(
                "http://localhost:9999/api/nhomthietbi/themnhomthietbi",
                {
                    ten_nhom: values.NhomTTB.ten_nhom,
                    trang_thai: values.NhomTTB.trang_thai,
                },
                {
                    headers: {
                        'Content-Type': 'application/json' // Đặt Content-Type là application/json
                    }
                }
            );

            if (response) {
                notification.success({
                    message: 'Thành công',
                    description: 'Đã thêm nhóm trang thiết bị thành công',
                    placement: 'top',
                    duration: 2,
                });
                navigate('/indexNTTB'); // Điều hướng sau khi thành công
            }

        } catch (error) {
            console.error("Lỗi data:", error);
        }
    };

    return (
        <div>
            <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>Thêm Nhóm Thiết Bị</h2>
            <Form
                {...layout}
                name="nest-messages"
                onFinish={onFinish}
                style={{ maxWidth: 600, marginRight: 700, marginTop: 50 }}
                validateMessages={validateMessages}
            >
                <Form.Item name={['NhomTTB', 'ten_nhom']} label="Tên nhóm" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name={['NhomTTB', 'trang_thai']} label="Trạng thái" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                    <Button type="primary" htmlType="submit">
                        Thêm
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default CreateNTTB;
