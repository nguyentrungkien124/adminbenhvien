import React, { useEffect, useState } from 'react';
import {
    Button,
    DatePicker,
    Form,
    Mentions,
    notification,
} from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { error } from 'console';

const { RangePicker } = DatePicker;

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
    },
};


const EditNTTB: React.FC = () => {

    const { id } = useParams()
    const [form] = Form.useForm()
    const [nttb, setNttb] = useState<NTTB>();
    const navigate = useNavigate();

    interface NTTB {
        id: number; // Mã khách hàng là một số nguyên
        ten_nhom: string; // Tên khách hàng là một chuỗi
        trang_thai: string;


    }


    useEffect(() => {
        async function loadData() {
            const res = await axios.get(`http://localhost:9999/api/nhomthietbi/getthietbibyid/${id}`)
            setNttb(res.data);

            form.setFieldsValue(res.data[0]);
        }

        loadData();
    }, [id, form]);

    form.setFieldsValue({ ...nttb })

    const Update = async (nttb: NTTB) => {
        let NhomTrangThietBi = {
            "id": nttb.id,
            "ten_nhom": nttb.ten_nhom,
            "trang_thai": nttb.trang_thai

        };
        console.log();
        try {
            const response = await axios.put(
                "http://localhost:9999/api/nhomthietbi/suanhomthietbi", NhomTrangThietBi
            );
            if (response) {
                // Hiển thị thông báo thành công
                notification.success({
                    message: 'Thành công',
                    description: 'Đã sửa chuyên môn thành công',
                    placement: 'top',
                    duration: 2 // Thông báo tự động biến mất sau 3 giây
                });
                navigate('/indexNTTB');
            }
        } catch (error) {
            console.error("Lỗi data:", error);
            alert("Sửa thất bại")

        }
    }
    return (
        <div>
            <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Sửa nhóm trang thiết bị</h2>
            <Form {...formItemLayout}
                form={form}
                onFinish={Update}
                variant="filled" style={{ maxWidth: 600, marginTop: 20 }}>
                <Form.Item
                    label="Mã nhóm trang thiết bị"style={{width:700}}
                    name='id'
                    rules={[{ required: true, message: 'Please input!' }]}
                >
                    <Mentions />
                </Form.Item>
                <Form.Item
                    label="Tên nhóm trang thiết bị" style={{width:700}}
                    name='ten_nhom'
                    rules={[{ required: true, message: 'Please input!' }]}
                >
                    <Mentions style={{marginLeft:0}}/>
                </Form.Item>
                <Form.Item
                    label="Trạng thái"  style={{width:700}}
                    name='trang_thai'
                    rules={[{ required: true, message: 'Please input!' }]}
                >
                    <Mentions />
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

export default () => <EditNTTB />;