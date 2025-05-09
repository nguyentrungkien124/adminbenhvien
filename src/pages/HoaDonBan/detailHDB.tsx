import React, { useEffect, useState } from 'react';
import { Button, Form, InputNumber, Input } from 'antd';
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
  const { MaHoaDon } = useParams(); // Lấy MaHoaDon từ tham số URL
  const [form] = Form.useForm();
  const [chiTietHoaDonList, setChiTietHoaDonList] = useState<any[]>([]); // Lưu trữ một mảng của các sản phẩm

  useEffect(() => {
    async function fetchData() {
      if (!MaHoaDon) {
        console.error('ID không hợp lệ hoặc không được cung cấp');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:9999/api/donhang/getchitietdh/${MaHoaDon}`);
        const data = response.data;

        console.log('Dữ liệu từ API:', data);

        if (data && data.length > 0 && data[0].list_chitiet_don_hang) {
          // Truy cập vào list_chitiet_don_hang bên trong đối tượng đầu tiên
          setChiTietHoaDonList(data[0].list_chitiet_don_hang);
        }
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
      }
    }

    fetchData();
  }, [MaHoaDon]);

  return (
    <div>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Chi tiết hóa đơn</h2>
      <Form
        {...formItemLayout}
        form={form}
        style={{ maxWidth: 600 }}
      >
        {chiTietHoaDonList.map((chiTietHoaDon, index) => (
          <div key={index} style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
            <Form.Item
              label="Mã sản phẩm"
              name={`MaSanPham_${index}`}
              initialValue={chiTietHoaDon.MaSanPham}
              rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm!' }]}
            >
              <InputNumber readOnly />
            </Form.Item>

            <Form.Item
              label="Tên sản phẩm"
              name={`tenSanPham_${index}`}
              initialValue={chiTietHoaDon.TenSanPham}
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
            >
              <Input readOnly />
            </Form.Item>

            <Form.Item name={`anh_${index}`} label="Ảnh sản phẩm">
              {chiTietHoaDon.AnhDaiDien ? (
                <img
                  src={`${chiTietHoaDon.AnhDaiDien}`} // Đường dẫn ảnh, điều chỉnh nếu cần
                  alt="Ảnh sản phẩm"
                  style={{ width: '100px', height: 'auto', marginLeft: '20px' }}
                />
              ) : (
                <span>Không có ảnh</span>
              )}
            </Form.Item>

            <Form.Item
              label="Số lượng"
              name={`SoLuong_${index}`}
              initialValue={chiTietHoaDon.SoLuong}
              rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
            >
              <InputNumber readOnly />
            </Form.Item>

            <Form.Item
              label="Giá sản phẩm"
              name={`GiaSanPham_${index}`}
              initialValue={chiTietHoaDon.GiaSanPham}
              rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm!' }]}
            >
              <InputNumber readOnly />
            </Form.Item>

            <Form.Item
              label="Tổng giá"
              name={`TongGia_${index}`}
              initialValue={chiTietHoaDon.TongGia}
              rules={[{ required: true, message: 'Vui lòng nhập tổng giá!' }]}
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
