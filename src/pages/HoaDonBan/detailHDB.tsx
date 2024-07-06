import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
} from 'antd';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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

const DetailHDBForm: React.FC = () => {
  const { maHoaDon } = useParams(); // Lấy maHoaDon từ tham số URL
  const [form] = Form.useForm();
  const [chiTietHoaDonList, setChiTietHoaDonList] = useState<any[]>([]); // Lưu trữ một mảng của các sản phẩm

  useEffect(() => {
    async function fetchData() {
      if (!maHoaDon) {
        console.error('ID không hợp lệ hoặc không được cung cấp');
        return;
      }
      
      try {
        const response = await axios.get(`https://localhost:44381/api/HoaDonBan/List_CTHD_Getbyid?id=${maHoaDon}`);
        const data = response.data;
        console.log('Dữ liệu từ API:', data);
        
        if (data && data.length > 0) {
          setChiTietHoaDonList(data); // Lưu trữ toàn bộ mảng của các sản phẩm
        }
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
      }
    }
  
    fetchData();
  }, [maHoaDon]);

  return (
    <div>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Chi tiết hóa đơn</h2>
      <Form
      {...formItemLayout}
      form={form}
      style={{ maxWidth: 600 }}
    >
      {chiTietHoaDonList.map((chiTietHoaDon, index) => (
        <div key={index}>
          <Form.Item
            label="Mã chi tiết hóa đơn"
            name={`maChiTietHoaDon_${index}`}
            initialValue={chiTietHoaDon.maChiTietHoaDon}
            rules={[{ required: true, message: 'Vui lòng nhập mã chi tiết hóa đơn!' }]}
          >
            <InputNumber readOnly />
          </Form.Item>

          <Form.Item
            label="Mã hóa đơn"
            name={`maHoaDon_${index}`}
            initialValue={chiTietHoaDon.maHoaDon}
            rules={[{ required: true, message: 'Vui lòng nhập mã hóa đơn!' }]}
          >
            <InputNumber readOnly />
          </Form.Item>

          <Form.Item
            label="Mã sản phẩm"
            name={`maSanPham_${index}`}
            initialValue={chiTietHoaDon.maSanPham}
            rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm!' }]}
          >
            <InputNumber readOnly />
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name={`soLuong_${index}`}
            initialValue={chiTietHoaDon.soLuong}
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
          >
            <InputNumber readOnly />
          </Form.Item>

          <Form.Item
            label="Tổng giá"
            name={`tongGia_${index}`}
            initialValue={chiTietHoaDon.tongGia}
            rules={[{ required: true, message: 'Vui lòng nhập tổng giá!' }]}
          >
            <InputNumber readOnly />
          </Form.Item>

          <Form.Item
            label="Tên sản phẩm"
            name={`tenSanPham_${index}`}
            initialValue={chiTietHoaDon.tenSanPham}
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input readOnly />
          </Form.Item>

          <Form.Item name={`anhDaiDien_${index}`} label="Ảnh cũ SP">
            {chiTietHoaDon.anhDaiDien ? (
                <img
                    src={`./../upload/${chiTietHoaDon.anhDaiDien}`}
                    alt="Ảnh"
                    style={{ width: '100px', height: 'auto', marginLeft: '20px' }}
                />
            ) : (
                <span>Không có ảnh</span>
            )}
          </Form.Item>

          <Form.Item
            label="Giá sản phẩm"
            name={`gia_${index}`}
            initialValue={chiTietHoaDon.gia}
            rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm!' }]}
          >
            <InputNumber readOnly />
          </Form.Item>
        </div>
      ))}

      
    </Form>
    </div>
   
  );
};

export default DetailHDBForm;
