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
    const [chitietHDB, setChitietHDB] = useState<any[]>([])
    const [form] = Form.useForm()

    const addProductBan = (product: any, ) => {
        
        let sanphamBan = { ...product, tongGia:product.maSanPham* product.soLuong}
        setChitietHDB([...chitietHDB, sanphamBan])
    }

    const tinhTongTien = useMemo(() => {
        let tonggia = chitietHDB.reduce((sum, sp) => sum + sp.tongGia, 0);
        form.setFieldValue("tongGia", tonggia + " VNĐ")
        return tonggia
    }, [chitietHDB]);

  
    

    const CreateHDB = async (values: any) => {
        try {

            const hoadonban = {
                maHoaDon: 0,
                trangThai:values.trangThai,
                ngayTao:values.ngayTao,
                diaChiGiaoHang:values.diaChiGiaoHang,
                maKH:0,
                cachThucThanhToan: values.cachThucThanhToan,
                tongGia: tinhTongTien,
                list_json_ChiTietHD: chitietHDB
            };

            

            console.log(hoadonban)
            const response = await axios.post(
                "https://localhost:44381/api/HoaDonBan/Create_HoaDon",
                hoadonban
            );

            if (response) {
                // Hiển thị thông báo thành công
                notification.success({
                    message: 'Thành công',
                    description: 'Đã thêm hóa đơn nhập và chi tiết hóa đơn nhập thành công',
                    placement: 'top',
                    duration: 2
                });

                navigate('/indexHDB');
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

            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Form
                        form={form}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        layout="horizontal"
                        onFinish={CreateHDB}
                        style={{ maxWidth: 800 }} // Đặt maxWidth rộng hơn cho phù hợp với việc chia đôi
                    >
                        
                        <Form.Item label="Trạng thái" name={['trangThai']} labelCol={{ span: 8 }}>
                            <Input></Input>
                        </Form.Item>
                        <Form.Item label="Ngày tạo" name={['ngayTao']} rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                        <DatePicker />
                        </Form.Item>
                        <Form.Item label="Địa chỉ giao hàng" name={['diaChiGiaoHang']} rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Tổng giá " name={['tongGia']} rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                            <Input value={tinhTongTien} />
                        </Form.Item>
                        <Form.Item label="Cách thức thanh toán" name={['cachThucThanhToan']} rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                            <Input />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 6, span: 16 }} >
                            <Button type="primary" htmlType="submit">
                                Thêm mới hóa đơn bán
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>

                <Col span={12}>
                    <Form
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        layout="horizontal"
                        onFinish={addProductBan}
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
                                            <Option key={index + ""} value={value.maSanPham}>{value.maSanPham}|{value.tenSanPham}|SL:{value.soLuong}|tênCM:{value.tenChuyenMuc}|{value.gia}</Option>
                                        </>
                                    })
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item label="Số lượng " name={['soLuong']} rules={[{ required: true, message: "Không được để trống" }]} labelCol={{ span: 8 }}>
                            <InputNumber min={1} />
                        </Form.Item>
                      
                        <Form.Item wrapperCol={{ offset: 6, span: 16 }} >
                            <Button type="primary" htmlType="submit">
                                Thêm mới sản phẩm
                            </Button>
                        </Form.Item>
                    </Form>

                    
                </Col >
                
                <Table dataSource={chitietHDB} rowKey="maSanPham"   style={{ marginTop: 10 ,marginLeft:300}}>
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


