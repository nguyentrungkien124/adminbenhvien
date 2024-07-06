import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, notification } from 'antd';

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

  const { maSanPham } = useParams()
  const [form] = Form.useForm()
  const [sanpham, setSanPham] = useState<SanPham>();
  const navigate = useNavigate();

  interface SanPham {
    
    maSanPham?: number;
    maChuyenMuc?: string;
    tenSanPham?: string;
    anhDaiDien?: string;
    gia?: number;
    giaGiam?: number;
    soLuong?: number;
    trangThai?: boolean;
    luotXem?: number;
  }

  useEffect(() => {
    async function loadData() {
      const res = await axios.get(`https://localhost:44395/api/SanPham/get_by_id?id=${maSanPham}`);
      setSanPham(res.data); // Đưa dữ liệu vào một mảng để hiển thị trong bảng

    }
    loadData();
  }, [maSanPham]);

  form.setFieldsValue({ ...sanpham, anhDaidien: undefined })

  const Update = async (SanPham: SanPham) => {
    let image = await uploadImage22(SanPham.anhDaiDien)
    console.log(image)
    let sanpham = {
      "maSanPham": SanPham.maSanPham,
      "maChuyenMuc": SanPham.maChuyenMuc,
      "tenSanPham": SanPham.tenSanPham,
      "anhDaiDien": image,
      "gia": SanPham.gia,
      "giaGiam": SanPham.giaGiam,
      "soLuong": SanPham.soLuong,
      "trangThai": true,
      "luotXem": 0
    };
    console.log(sanpham)
    try {
      const response = await axios.put(
        "https://localhost:44381/api/SanPham/SanPham_Update", sanpham


      );
      if (response) {
        // Hiển thị thông báo thành công
        notification.success({
          message: 'Thành công',
          description: 'Đã sửa sản phẩm thành công',
          placement: 'top',
          duration: 2 // Thông báo tự động biến mất sau 3 giây
        });
      }
      navigate('/indexSP'); 
    } catch (error) {
      console.error("Error fetching data:", error);
    }

  };

  const [chuyenmuc, setChuyenmuc] = useState([])
  const loadData = async () => {
    try {
      const response = await axios.post(
        "https://localhost:44381/api/ChuyenMuc/ChuyenMuc_Search",
        {
          page: "1",
          pageSize: "100",
        }

      );
      response && setChuyenmuc(response.data.data)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  async function uploadImage22(anhdaidien: any) {

    const image = anhdaidien[0].originFileObj
    const formData = new FormData()
    formData.append("file", image)
    let res = await axios.post("https://localhost:44381/api/UpLoad_/upload", formData, { headers: { "Custom-Header": "value" } })
    console.log(res.data.filePath)
    return res.data.filePath

  }
  // Hàm normFile:Chuyển đổi sự kiện tải lên ảnh thành danh sách file.
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  return (
    <div>
    <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Sửa sản phẩm</h2>
    <Form
      form={form}
      layout="horizontal"
      onFinish={Update}
      style={{ maxWidth: 800,marginTop:20}}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          {/* Các form item không liên quan đến hình ảnh */}
          <Form.Item label="Mã Sản Phẩm" name="maSanPham" labelCol={{ span: 7 }} >
            <Input />
          </Form.Item>
          <Form.Item label="Tên Sản Phẩm" name="tenSanPham" labelCol={{ span: 7 }} >
            <Input />
          </Form.Item>
          <Form.Item label="Mã Chuyên Mục" name="maChuyenMuc" labelCol={{ span: 7 }} >
            <Select>
              {chuyenmuc.map((value: any, index: number) => (
                <Option key={index} value={value.maChuyenMuc}>
                  {value.tenChuyenMuc}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Giá" name="gia" labelCol={{ span: 7 }} >
            <Input />
          </Form.Item>

          <Form.Item label="Giá KM" name="giaGiam" labelCol={{ span: 7 }} >
            <Input />
          </Form.Item>
          <Form.Item label="Số Lượng" name="soLuong" labelCol={{ span: 7 }} >
            <Input />
          </Form.Item>
        </Col>

        <Col span={8} style={{ marginLeft: '100px' }}>
          {/* Các form item liên quan đến hình ảnh */}
          <Form.Item name="anhDaiDien" label="Ảnh Đại Diện" getValueFromEvent={normFile}>
            <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
              <button style={{ border: 0, background: 'none' }} type="button">
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </button>
            </Upload>
          </Form.Item>
          <Form.Item name="anhDaiDien" label="Ảnh cũ SP">
            {sanpham?.anhDaiDien && (
              <img
                src={`./../upload/${sanpham?.anhDaiDien}`}
                alt="Ảnh"
                style={{ width: '100px', height: 'auto', marginLeft: '20px' }}
              />
            )}
          </Form.Item>
        </Col>
      </Row>
      <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Cập nhật
        </Button>
      </Form.Item>
    </Form>
    </div>
  );

};

export default () => <App />;


