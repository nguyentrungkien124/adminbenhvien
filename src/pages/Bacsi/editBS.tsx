import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, notification, Button, Form, Input, Select, Upload } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Option } = Select;

interface bacsi {
  id?: number;
  ho_ten?: string;
  chuyen_mon?: string;
  khoa_id?: string;
  so_dien_thoai?: string;
  email?: string;
  ngay_sinh?: string;
  gioi_tinh?: string;
  dia_chi?: string;
  gia?: string;
  mat_khau: string;
  files?: any;
  khambenh_qua_video: boolean;
  chuc_danh: string;
  kinh_nghiem: string;
  gioi_thieu: string;
  chuyen_tri: string;
}

const App: React.FC = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [bacsi, setBacsi] = useState<bacsi>();
  const [khoa, setKhoa] = useState<any[]>([]);
  const [chuyenmon, setChuyenmon] = useState<any[]>([]);
  const navigate = useNavigate();

  // Khi form nhận dữ liệu từ API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await axios.get(`http://localhost:9999/api/bacsi/getbacsibyID/${id}`);
        console.log('Data received from API:', res.data);
        setBacsi(res.data);
        form.setFieldsValue(res.data[0]); // Ensure this includes the id
        console.log('Form values set:', res.data[0]);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    }
    loadData();
  }, [id, form]);

  const handleUpdate = async (values: bacsi) => {
    const formData = new FormData();
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });

    const ngaySinh = values.ngay_sinh || ''; // Lấy giá trị ngày sinh
    const ngaySinhFormatted = ngaySinh.substring(0, 10); // Lấy 10 ký tự đầu tiên (YYYY-MM-DD)

    formData.append('id', values.id ? values.id.toString() : '');

    console.log('test', id)
    formData.append('ho_ten', values.ho_ten || '');
    formData.append('chuyen_mon', values.chuyen_mon || '');
    formData.append('khoa_id', values.khoa_id || '');
    formData.append('so_dien_thoai', values.so_dien_thoai || '');
    formData.append('email', values.email || '');
    formData.append('ngay_sinh', ngaySinhFormatted);
    formData.append('gioi_tinh', values.gioi_tinh || '');
    formData.append('dia_chi', values.dia_chi || '');
    formData.append('mat_khau', values.mat_khau || '');
    formData.append('gia', values.gia || '');
    formData.append('khambenh_qua_video', values.khambenh_qua_video ? values.khambenh_qua_video.toString() : '0');
    formData.append('chuc_danh', values.chuc_danh || '');
    formData.append('kinh_nghiem', values.kinh_nghiem || '');
    formData.append('gioi_thieu', values.gioi_thieu || '');
    formData.append('chuyen_tri', values.chuyen_tri || '');

    if (values.files) {
      formData.append('files', values.files[0].originFileObj);
    }

    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });

    try {
      const response = await axios.put('http://localhost:9999/api/bacsi/suabacsi', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 200) {
        notification.success({ message: 'Cập nhật thành công' });
        // Optionally, you can refresh the data or navigate away
      }
    } catch (error) {
      console.error('Error updating data:', error);
      notification.error({
        message: 'Cập nhật thất bại',
        description: 'Đã xảy ra lỗi khi cập nhật thông tin bác sĩ.',
      });
    }
  };

  const loadData = async () => {
    try {
      const response = await axios.get("http://localhost:9999/api/khoa/getall");
      if (response) setKhoa(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const loadData1 = async () => {
    try {
      const response = await axios.get("http://localhost:9999/api/chuyenmon/getall");
      if (response) setChuyenmon(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    loadData();
    loadData1();
  }, []);

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '20px' }}>
        Sửa bác sĩ
      </h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdate}
        style={{ maxWidth: 800 }}
      >
        <Row gutter={[32, 16]}>
          <Col span={12}>
            <Form.Item name="id" hidden>
              <Input type="hidden" />
            </Form.Item>
            
            <Form.Item label="Tên bác sĩ" name="ho_ten">
              <Input placeholder="Nhập tên bác sĩ" />
            </Form.Item>
            <Form.Item label="Chuyên môn" name="chuyen_mon">
              <Select placeholder="Chọn chuyên môn">
                {chuyenmon.map((value: any, index: number) => (
                  <Option key={index + ""} value={value.id}>{value.ten_chuyen_mon}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Khoa" name="khoa_id">
              <Select placeholder="Chọn khoa">
                {khoa.map((value: any, index: number) => (
                  <Option key={index + ""} value={value.id}>{value.ten}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Số điện thoại" name="so_dien_thoai">
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input placeholder="Nhập email" />
            </Form.Item>
            <Form.Item label="Ngày sinh" name="ngay_sinh">
              <Input placeholder="Nhập ngày sinh" />
            </Form.Item>
            <Form.Item label="Giới tính" name="gioi_tinh">
              <Input placeholder="Nhập giới tính" />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="dia_chi">
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>
            <Form.Item label="Mật khẩu" name="mat_khau">
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
            <Form.Item label="Giá" name="gia">
              <Input placeholder="Nhập giá" />
            </Form.Item>
            <Form.Item label="Bác sĩ qua video" name="khambenh_qua_video">
              <Input placeholder="Nhập thông tin" />
            </Form.Item>
            <Form.Item label="Chức danh" name="chuc_danh">
              <Input placeholder="Nhập chức danh" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Chuyên trị" name="chuyen_tri">
              <ReactQuill
                value={form.getFieldValue("chuyen_tri") || ""}
                onChange={(content) => {
                  form.setFieldsValue({ chuyen_tri: content });
                }}
              />
            </Form.Item>
            <Form.Item label="Kinh nghiệm" name="kinh_nghiem">
              <ReactQuill
                value={form.getFieldValue("kinh_nghiem") || ""}
                onChange={(content) => {
                  form.setFieldsValue({ kinh_nghiem: content });
                }}
              />
            </Form.Item>
            <Form.Item label="Giới thiệu" name="gioi_thieu">
              <ReactQuill
                value={form.getFieldValue("gioi_thieu") || ""}
                onChange={(content) => {
                  form.setFieldsValue({ gioi_thieu: content });
                }}
              />
            </Form.Item>
            <Form.Item name="files" label="Ảnh Sản Phẩm" valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
                <button style={{ border: 0, background: 'none' }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default App;
