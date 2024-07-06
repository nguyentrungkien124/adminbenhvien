import React, { useEffect, useMemo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Button,
    Form,
    Input,
    Select,
    Upload,
    notification,
    Row, Col,
    DatePicker,
    InputNumber,
    Table
} from 'antd';
import { Option } from 'antd/es/mentions';


const App: React.FC = () => {
    // hook
    const [sanpham, setSanPham] = useState([])
    const [nhaphanphoi, setNhaPhanPhoi] = useState([])
    const [loading, setLoading] = useState(true);
    const loadData = async () => {
        try {
          
            const response = await axios.post(
                "https://localhost:44381/api/NhaPhanPhoi/NhaPhanPhoi_Search",
                {
                    page: "1",
                    pageSize: "100",
                }

            );
            const res = await axios.post(
                "https://localhost:44381/api/SanPham/search",
                {
                    page: "1",
                    pageSize: "1000",
                }

            );
            response && setNhaPhanPhoi(response.data.data)
           res && setSanPham (res.data.data)
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        loadData()
    })
    const navigate = useNavigate();
    const [chitietHDN, setChitietHDN] = useState<any[]>([])
    const [form] = Form.useForm()

    const addProductNhap = (product: any) => {
        let sanphamNhap = { ...product, tongTien: product.giaNhap * product.soLuong }
        setChitietHDN([...chitietHDN, sanphamNhap])
    }

    const tinhTongTien = useMemo(() => {
        let tongtien = chitietHDN.reduce((sum, sp) => sum + sp.tongTien, 0);
        form.setFieldValue("tongTien", tongtien + " VNĐ")
        return tongtien
    }, [chitietHDN]);

  

    const CreateHDN = async (values: any) => {
        try {

            const hoadonnhap = {
                maHoaDon: 0,
                maNhaPhanPhoi: values.maNhaPhanPhoi,
                kieuThanhToan: values.kieuThanhToan,
                maTaiKhoan: values.maTaiKhoan,
                tongTien: tinhTongTien,
                list_js_ChitietHDN: chitietHDN
            };

            console.log(hoadonnhap)
            const response = await axios.post(
                "https://localhost:44381/api/HoaDonNhap/HoaDonNhap_Create",
                hoadonnhap
            );

            if (response) {
                // Hiển thị thông báo thành công
                notification.success({
                    message: 'Thành công',
                    description: 'Đã thêm hóa đơn nhập và chi tiết hóa đơn nhập thành công',
                    placement: 'top',
                    duration: 2
                });

                navigate('/indexHDN');
            }
        } catch (error) {
            // Xử lý lỗi
            console.error("Lỗi data:", error);
            notification.error({
                message: 'Lỗi',
                description: 'Đã xảy ra lỗi khi thêm hóa đơn nhập hoặc chi tiết hóa đơn nhập',
                placement: 'top',
                duration: 2
            });
        }
    };
    return (
        <>
            <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Thêm hóa đơn nhập</h2>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Form
                        form={form}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        layout="horizontal"
                        onFinish={CreateHDN}
                        style={{ maxWidth: 800 }} // Đặt maxWidth rộng hơn cho phù hợp với việc chia đôi
                    >
                        {/* Các form item không liên quan đến hình ảnh */}
                        <Form.Item label="Mã nhà phân phối" name={['maNhaPhanPhoi']} rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                            <Select>
                                {
                                    nhaphanphoi.map((value: any, index: number) => {
                                        return <>
                                            <Option key={index + ""} value={value.maNhaPhanPhoi}>{value.tenNhaPhanPhoi}</Option>
                                        </>
                                    })
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item label="Ngày tạo" name={['ngayTao']} labelCol={{ span: 8 }}>
                            <DatePicker />
                        </Form.Item>
                        <Form.Item label="Kiểu thanh toán" name={['kieuThanhToan']} rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                            <Input>
                            </Input>
                        </Form.Item>
                        <Form.Item label="Tài khoản nhập" name={['maTaiKhoan']} rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Tổng tiền" name={['tongTien']} rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                            <Input value={tinhTongTien} />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 6, span: 16 }} >
                            <Button type="primary" htmlType="submit">
                                Thêm mới hóa đơn nhập
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>

                <Col span={12}>
                    <Form
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        layout="horizontal"
                        onFinish={addProductNhap}
                        style={{ maxWidth: 800 }} // Đặt maxWidth rộng hơn cho phù hợp với việc chia đôi
                    >
                        {/* Các form item liên quan đến hình ảnh */}
                        <Form.Item label="Tìm kiếm " name={['ok']}  labelCol={{ span: 8 }}>
                            <Input  />
                        </Form.Item>
                        <Form.Item label="Mã sản phẩm" name={['maSanPham']} rules={[{ required: true, message: "Không được để trống" }]} labelCol={{ span: 8 }}>
                        <Select>
                                {
                                    sanpham.map((value: any, index: number) => {
                                        return <>
                                            <Option key={index + ""} value={value.maSanPham}>{value.maSanPham}|{value.tenSanPham}|SL:{value.soLuong}|tênCM:{value.tenChuyenMuc}</Option>
                                        </>
                                    })
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item label="Số lượng " name={['soLuong']} rules={[{ required: true, message: "Không được để trống" }]} labelCol={{ span: 8 }}>
                            <InputNumber min={1} />
                        </Form.Item>
                        <Form.Item label="Đơn vị tính" name={['donViTinh']} rules={[{ required: true, message: "Không được để trống" }]} labelCol={{ span: 8 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Giá nhập" name={['giaNhap']} rules={[{ required: true, message: "Không được để trống" }]} labelCol={{ span: 8 }}>
                            <InputNumber min={1} />
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 6, span: 16 }} >
                            <Button type="primary" htmlType="submit">
                                Thêm mới sản phẩm
                            </Button>
                        </Form.Item>
                    </Form>

                    
                </Col >
                
                <Table dataSource={chitietHDN} rowKey="maSanPham"   style={{ marginTop: 10 ,marginLeft:300}}>
                        <Table.Column title="Mã sản phẩm" dataIndex="maSanPham" key="maSanPham" />
                        <Table.Column title="Số lượng" dataIndex="soLuong" key="soLuong" />
                        <Table.Column title="Đơn vị tính" dataIndex="donViTinh" key="donViTinh" />
                        <Table.Column title="Giá nhập" dataIndex="giaNhap" key="giaNhap" />
                        <Table.Column title="Tổng tiền" dataIndex="tongTien" key="tongTien" />
                    </Table>
            </Row >
        </>
    );
};

export default () => <App />;


