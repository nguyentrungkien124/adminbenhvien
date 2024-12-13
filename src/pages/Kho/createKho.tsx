import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
    Button,
    Form,
    Input,
    Select,
    notification,
    Row, Col,
    DatePicker,
    InputNumber,
    Table,
    Upload
} from 'antd';
import { Option } from 'antd/es/mentions';
const normFile = (e: any) => {
    if (Array.isArray(e)) {
        return e;
    }
    return e?.fileList;
};
const CreateKho: React.FC = () => {
    const [sanpham, setSanPham] = useState([]);
    const [nhaphanphoi, setNhaPhanPhoi] = useState([]);
    const [chitietKho, setChiTietKho] = useState<any[]>([]);
    const [form] = Form.useForm();

    // Load dữ liệu nhà phân phối và sản phẩm từ API
    const loadData = async () => {
        try {
            const response = await axios.get("http://localhost:9999/api/nhaphanphoi/getall");

            if (response) setNhaPhanPhoi(response.data);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const navigate = useNavigate();

    // Thêm chi tiết kho
    const addChiTietKho = (product: any) => {
        const newProduct = {
            ...product,
            ngay_nhap: product.ngay_nhap ? product.ngay_nhap.format('YYYY-MM-DD') : undefined,
            han_su_dung: product.han_su_dung ? product.han_su_dung.format('YYYY-MM-DD') : undefined,
        };
        setChiTietKho([...chitietKho, newProduct]);
    };


    // Tạo sản phẩm mới với thông tin kho
    const createProduct = async (values: any) => {
        const payload = {
            ten_san_pham: values.ten_san_pham,
            loai_san_pham: values.loai_san_pham,
            so_luong_tong: values.so_luong_tong,
            don_vi_tinh: values.don_vi_tinh,
            trang_thai: values.trang_thai,
            mo_ta: values.mo_ta,
            files: values.Sanpham.anh[0].originFileObj,
            list_json_chi_tiet_kho: chitietKho
        };
    
        try {
            const response = await axios.post("http://localhost:9999/api/kho/themkho", payload, {
                headers: {'Content-Type': 'multipart/form-data' }
            });
    
            
            console.log("Chi tiết kho gửi đến server:", JSON.stringify(chitietKho));
            // console.log("Dữ liệu nhận:", req.body.list_json_chi_tiet_kho);

            console.log(FormData)

            if (response) {
                notification.success({
                    message: 'Thành công',
                    description: 'Đã thêm sản phẩm và chi tiết kho thành công',
                    placement: 'top',
                    duration: 2
                });
                // navigate('/indexSP');
            }
        } catch (error) {
            console.error("Lỗi:", error);
            notification.error({
                message: 'Lỗi',
                description: 'Đã xảy ra lỗi khi thêm sản phẩm và chi tiết kho',
                placement: 'top',
                duration: 2
            });
        }
    };

    return (
        <>
            <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Thêm kho nhập</h2>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Form
                        form={form}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        layout="horizontal"
                        onFinish={createProduct}
                        style={{ maxWidth: 800 }}
                    >
                        <Form.Item label="Tên sản phẩm" name="ten_san_pham" rules={[{ required: true, message: "Không được để trống" }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Loại sản phẩm" name="loai_san_pham" rules={[{ required: true, message: "Không được để trống" }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Số lượng tổng" name="so_luong_tong" >
                            <InputNumber min={1} />
                        </Form.Item>
                        <Form.Item label="Đơn vị tính" name="don_vi_tinh" rules={[{ required: true, message: "Không được để trống" }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Trạng thái" name="trang_thai" rules={[{ required: true, message: "Không được để trống" }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Mô tả" name="mo_ta">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item label="Upload" valuePropName="fileList" getValueFromEvent={normFile} name={['Sanpham', 'anh']} rules={[{ required: true, message: 'Please upload an image!' }]}>
                            <Upload listType="picture-card">
                                <button style={{ border: 0, background: 'none' }} type="button">
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </button>
                            </Upload>
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">Thêm sản phẩm</Button>
                        </Form.Item>
                    </Form>
                </Col>

                <Col span={12}>
                    <Form
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        layout="horizontal"
                        onFinish={addChiTietKho}
                        style={{ maxWidth: 800 }}
                    >
                        <Form.Item label="Số lượng" name="so_luong" rules={[{ required: true, message: "Không được để trống" }]}>
                            <InputNumber min={1} />
                        </Form.Item>
                        <Form.Item label="Ngày nhập" name="ngay_nhap" rules={[{ required: true, message: "Không được để trống" }]}>
                            <DatePicker />
                        </Form.Item>
                        <Form.Item label="Hạn sử dụng" name="han_su_dung" rules={[{ required: true, message: "Không được để trống" }]}>
                            <DatePicker />
                        </Form.Item>
                        <Form.Item label="Nhà phân phối" name="nha_phan_phoi_id" rules={[{ required: true, message: "Không được để trống" }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Trạng thái" name="trang_thai" rules={[{ required: true, message: "Không được để trống" }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Mô tả" name="mo_ta">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">Thêm chi tiết kho</Button>
                        </Form.Item>
                    </Form>

                    <Table dataSource={chitietKho} rowKey="so_luong" style={{ marginTop: 200, marginLeft: '-300px' }}>
                        <Table.Column title="Số lượng" dataIndex="so_luong" key="so_luong" />
                        <Table.Column
                            title="Ngày nhập"
                            dataIndex="ngay_nhap"
                            key="ngay_nhap"
                            render={(text) => text ? moment(text).format('YYYY-MM-DD') : ''}
                        />
                        <Table.Column
                            title="Hạn sử dụng"
                            dataIndex="han_su_dung"
                            key="han_su_dung"
                            render={(text) => text ? moment(text).format('YYYY-MM-DD') : ''}
                        />

                        <Table.Column title="Nhà phân phối" dataIndex="nha_phan_phoi_id" key="nha_phan_phoi_id" />
                        <Table.Column title="Trạng thái" dataIndex="trang_thai" key="trang_thai" />
                        <Table.Column title="Mô tả" dataIndex="mo_ta" key="mo_ta" />
                    </Table>
                </Col>
            </Row>
        </>
    );
};

export default CreateKho;
