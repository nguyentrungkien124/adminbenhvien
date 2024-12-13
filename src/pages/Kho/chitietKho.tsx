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

const ChitietKho: React.FC = () => {
  const { kho_id } = useParams(); // Lấy kho_id từ tham số URL
  const [form] = Form.useForm();
  const [chiTietHoaDonList, setChiTietHoaDonList] = useState<any[]>([]); // Lưu trữ một mảng của các sản phẩm

  useEffect(() => {
    async function fetchData() {    
      if (!kho_id) {
        console.error('ID không hợp lệ hoặc không được cung cấp');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:9999/api/kho/getKhoByID/${kho_id}`);
        const data = response.data;

        console.log('Dữ liệu từ API:', data);

        if (data && data.length > 0 && data[0].list_json_chi_tiet_kho) {
          // Truy cập vào list_json_chi_tiet_kho bên trong đối tượng đầu tiên
          setChiTietHoaDonList(data[0].list_json_chi_tiet_kho);
        }
      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
      }
    }

    fetchData();
  }, [kho_id]);

  return (
    <div>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Chi tiết hóa đơn hh   </h2>
      <Form
        {...formItemLayout}
        form={form}
        style={{ maxWidth: 600 }}
      >
        {chiTietHoaDonList.map((chiTietHoaDon, index) => (
          <div key={index} style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
            <Form.Item
              label="Mã sản phẩm"
              name={`so_luong_${index}`}
              initialValue={chiTietHoaDon.so_luong}
              rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm!' }]}
            >
              <InputNumber readOnly />
            </Form.Item>

            <Form.Item
              label="Tên sản phẩm"
              name={`ngay_nhap_${index}`}
              initialValue={chiTietHoaDon.ngay_nhap}
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
              name={`han_su_dung_${index}`}
              initialValue={chiTietHoaDon.han_su_dung}
              rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
            >
              <InputNumber readOnly />
            </Form.Item>

            <Form.Item
              label="Giá sản phẩm"
              name={`nha_phan_phoi_id_${index}`}
              initialValue={chiTietHoaDon.nha_phan_phoi_id}
              rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm!' }]}
            >
              <InputNumber readOnly />
            </Form.Item>

            <Form.Item
              label="Tổng giá"
              name={`trang_thai_${index}`}
              initialValue={chiTietHoaDon.trang_thai}
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

export default ChitietKho;
