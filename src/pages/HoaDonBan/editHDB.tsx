import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, notification, Table, InputNumber, DatePicker } from 'antd';
import moment from 'moment';


import {
  Button,
  Form,
  Input,
  Select,
  Upload,
} from 'antd';


const { Option } = Select;

const App: React.FC = () => {
  // hook

  const { maHoaDon } = useParams()
  const [form] = Form.useForm()
  const [hoadonban, setHoaDonBan] = useState<HoaDonBan>();
  const navigate = useNavigate();
  const [chitietHDB,setChitietHDB] = useState<HoaDonBan>();
  
  const updatechitiet = (updatedProduct: any) => {
    // Kiểm tra nếu chitietHDB hoặc list_json_ChiTietHD là undefined hoặc null
    if (!chitietHDB || !chitietHDB.list_json_ChiTietHD) {
        console.error('ChitietHDB hoặc danh sách chi tiết hóa đơn là undefined hoặc null.');
        return; // Thoát hàm nếu không có dữ liệu để cập nhật
    }
    

    // Sử dụng map để cập nhật danh sách chi tiết hóa đơn với sản phẩm đã được cập nhật
    const updatedList = chitietHDB.list_json_ChiTietHD.map(product => {
        if (product.maChiTietHoaDon === updatedProduct.maChiTietHoaDon) {
            // Cập nhật sản phẩm hiện tại với dữ liệu mới
            return { ...product, ...updatedProduct };
        }
        return product;
    });

    // Cập nhật danh sách chi tiết hóa đơn bằng cách sử dụng setChitietHDB
    setChitietHDB({ ...chitietHDB, list_json_ChiTietHD: updatedList });
};

  interface HoaDonBan {
    maHoaDon?: number; // Mã hóa đơn, số nguyên
    trangThai?: boolean; // Trạng thái, kiểu boolean
    ngayTao?: string; // Ngày tạo hóa đơn, định dạng chuỗi ISO (ngày giờ)
    diaChiGiaoHang?: string; // Địa chỉ giao hàng, kiểu chuỗi
    tongGia?: number; // Tổng giá của hóa đơn, số nguyên
    maKH?: number; // Mã khách hàng, số nguyên
    cachThucThanhToan?: string; // Cách thức thanh toán, kiểu chuỗi
    list_json_ChiTietHD?: any[]; // Danh sách chi tiết hóa đơn, kiểu mảng (chưa biết loại dữ liệu chính xác, có thể sử dụng any[])
}



useEffect(() => {
  async function loadData() {
      try {
          const res = await axios.get(`https://localhost:44381/api/HoaDonBan/get_by_id?id=${maHoaDon}`);
          const resq = await axios.get(`https://localhost:44381/api/HoaDonBan/List_CTHD_Getbyid?id=${maHoaDon}`);
          
          if (res && res.data) {
              setHoaDonBan(res.data);
              setChitietHDB({ ...resq.data, list_json_ChiTietHD: resq.data });
              // Cập nhật form với dữ liệu đã tải về
              form.setFieldsValue(res.data);
          } else {
              console.error("Không có dữ liệu trả về từ API");
          }
      } catch (error) {
          console.error("Lỗi khi lấy dữ liệu từ API:", error);
      }
  }
  loadData();
}, [maHoaDon]);
useEffect(() => {
    if (hoadonban && chitietHDB) {
        // Cập nhật form với dữ liệu từ hoadonban và chi tiết hóa đơn
        form.setFieldsValue({
            ...hoadonban,
            // Lấy chi tiết hóa đơn đầu tiên từ list_json_ChiTietHD (nếu có)
            ...(chitietHDB.list_json_ChiTietHD && chitietHDB.list_json_ChiTietHD[0]),
        });
    }
}, [hoadonban, chitietHDB, form]);

  const Update = async (HoaDonBan: HoaDonBan) => {
    
    let hoadonban = {
      "maHoaDon":HoaDonBan.maHoaDon,
      "trangThai": HoaDonBan.trangThai,
      "ngayTao": HoaDonBan.ngayTao,
      "diaChiGiaoHang": HoaDonBan.diaChiGiaoHang,
      "tongGia": HoaDonBan.tongGia,
      "maKH": HoaDonBan.maKH,
      "cachThucThanhToan": HoaDonBan.cachThucThanhToan,
      "list_json_ChiTietHD":chitietHDB
    };
    console.log(hoadonban);
    try {
      const response = await axios.post(
        "https://localhost:44381/api/HoaDonBan/Update_Hoadon", hoadonban

      );
      console.log(response)
      if (response) {
        // Hiển thị thông báo thành công
        notification.success({
          message: 'Thành công',
          description: 'Đã sửa sản phẩm thành công',
          placement: 'top',
          duration: 2 // Thông báo tự động biến mất sau 3 giây
        });
      }
      // navigate('/indexSP'); 
    } catch (error) {
      console.error("Error fetching data:", error);
      alert('lỗi')
      
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
                    onFinish={Update}
                    style={{ maxWidth: 800 }} // Đặt maxWidth rộng hơn cho phù hợp với việc chia đôi
                >
                     <Form.Item label="Mã hóa đơn" name='maHoaDon' labelCol={{ span: 8 }}>
                        <Input></Input>
                    </Form.Item>
                    <Form.Item label="Trạng thái" name='trangThai' labelCol={{ span: 8 }}>
                        <Input></Input>
                    </Form.Item>
                    <Form.Item label="Ngày tạo" name='ngayTao' rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                    <Input />
                    </Form.Item>
                    <Form.Item label="Địa chỉ giao hàng" name='diaChiGiaoHang' rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Tổng giá " name='tongGia' rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                        <Input  />
                    </Form.Item>
                    <Form.Item label="Cách thức thanh toán" name='cachThucThanhToan' rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mã KH" name='maKH' rules={[{ required: true, message: "Không được để trống" }]}  labelCol={{ span: 8 }}>
                        <Input />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 6, span: 16 }} >
                        <Button type="primary" htmlType="submit">
                            Sửa hóa đơn bán
                        </Button>
                    </Form.Item>
                </Form>
            </Col>

            <Col span={12}>
                <Form
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    layout="horizontal"
                    form={form}
                    onFinish={Update}
                    style={{ maxWidth: 800 }} // Đặt maxWidth rộng hơn cho phù hợp với việc chia đôi
                >
                    {/* Các form item liên quan đến hình ảnh */}
                    <Form.Item label="Mã chi tiết hóa đơn " name='maChiTietHoaDon'  labelCol={{ span: 8 }}>
                        <Input  />
                    </Form.Item>
                    <Form.Item label="Mã hóa đơn " name='maHoaDon'  labelCol={{ span: 8 }}>
                        <Input  />
                    </Form.Item>
                    <Form.Item label="Mã sản phẩm" name='maSanPham' rules={[{ required: true, message: "Không được để trống" }]} labelCol={{ span: 8 }}>
                    <Input>
                           
                        </Input>
                    </Form.Item>
                    <Form.Item label="Số lượng " name='soLuong' rules={[{ required: true, message: "Không được để trống" }]} labelCol={{ span: 8 }}>
                        <InputNumber min={1} />
                    </Form.Item>
                    <Form.Item label="Tổng giá " name='tongGia'  labelCol={{ span: 8 }}>
                        <Input  />
                    </Form.Item>
                    <Form.Item label="Tên sản phẩm " name='tenSanPham'  labelCol={{ span: 8 }}>
                        <Input  />
                    </Form.Item>
                    <Form.Item label="Ảnh đại diện " name='anhDaiDien'  labelCol={{ span: 8 }}>
                        <Input  />
                    </Form.Item>
                    <Form.Item label="Giá" name='gia'  labelCol={{ span: 8 }}>
                        <Input  />
                    </Form.Item>
                  
                    <Form.Item wrapperCol={{ offset: 6, span: 16 }} >
                        <Button type="primary" htmlType="submit">
                         sửa
                        </Button>
                    </Form.Item>
                </Form>

                
            </Col >
            
            {/* <Table rowKey="maSanPham"   style={{ marginTop: 10 ,marginLeft:300}}>
                    <Table.Column title="Mã sản phẩm" dataIndex="maSanPham" key="maSanPham" />
                    <Table.Column title="Số lượng" dataIndex="soLuong" key="soLuong" />
                    <Table.Column title="Đơn vị tính" dataIndex="donViTinh" key="donViTinh" />
                    <Table.Column title="Giá nhập" dataIndex="giaNhap" key="giaNhap" />
                    <Table.Column title="Tổng tiền" dataIndex="tongTien" key="tongTien" />
                </Table> */}
        </Row >
    </>
);
};


export default () => <App />;


