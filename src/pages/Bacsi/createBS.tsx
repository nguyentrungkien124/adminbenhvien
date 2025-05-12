import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Input, Select, Upload, notification, Row, Col } from 'antd';
import { Option } from 'antd/es/mentions';
import { useForm } from "antd/es/form/Form";
import ReactQuill from 'react-quill'; // Thay CKEditor bằng React Quill
import 'react-quill/dist/quill.snow.css'; // Import CSS cho React Quill
const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const App: React.FC = () => {
  const [khoa, setKhoa] = useState<any[]>([]);
  const [chuyenmon, setChuyenmon] = useState<any[]>([]);
  const navigate = useNavigate();
  const [form] = useForm();
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

  const onFinish = async (values: any) => {
    console.log("Values before sending:", values); // Kiểm tra giá trị

    if (!values.Bacsi) {
      console.error("Bacsi data is undefined");
      return;
    }

    const formData = new FormData();
    formData.append('ho_ten', values.Bacsi.ho_ten);
    formData.append('chuyen_mon', values.Bacsi.chuyen_mon);
    formData.append('khoa_id', values.Bacsi.khoa_id);
    formData.append('so_dien_thoai', values.Bacsi.so_dien_thoai);
    formData.append('email', values.Bacsi.email);
    formData.append('ngay_sinh', values.Bacsi.ngay_sinh);
    formData.append('gioi_tinh', values.Bacsi.gioi_tinh);
    formData.append('dia_chi', values.Bacsi.dia_chi);
    formData.append('mat_khau', values.Bacsi.mat_khau);
    formData.append('gia', values.Bacsi.gia);
    formData.append('khambenh_qua_video', values.Bacsi.khambenh_qua_video);
    formData.append('id', '0');
    formData.append('files', values.Bacsi.anh[0].originFileObj);
    formData.append('gioi_thieu', values.Bacsi.gioi_thieu || ""); // Đảm bảo là chuỗi
    formData.append('kinh_nghiem', values.Bacsi.kinh_nghiem || "");
    formData.append('chuyen_tri', values.Bacsi.chuyen_tri || "");
    formData.append('chuc_danh', values.Bacsi.chuc_danh || "");

    try {
      const response = await axios.post("http://localhost:9999/api/bacsi/thembacsi", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("ok", formData);
      if (response) {
        notification.success({
          message: 'Thành công',
          description: 'Đã thêm bác sĩ thành công',
          placement: 'top',
          duration: 2
        });
          //  navigate('/indexBS');
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Thêm bác sĩ</h2>
      <Form
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 800, marginTop: 30 }}
      >
        <Row gutter={[32, 0]}>
          <Col span={12} style={{ paddingRight: '20px', paddingLeft: "50px" }}>
            <Form.Item label="Tên bác sĩ" name={['Bacsi', 'ho_ten']} rules={[{ required: true, message: 'Vui lòng nhập tên bác sĩ!' }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Khoa" name={['Bacsi', 'khoa_id']} rules={[{ required: true, message: 'Vui lòng chọn khoa!' }]}>
              <Select>
                {khoa.map((value: any, index: number) => (
                  <Option key={index + ""} value={value.id}>{value.ten}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Số điện thoại" name={['Bacsi', 'so_dien_thoai']} rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Ngày sinh" name={['Bacsi', 'ngay_sinh']}>
              <Input />
            </Form.Item>

            <Form.Item label="Địa chỉ" name={['Bacsi', 'dia_chi']}>
              <Input />
            </Form.Item>

            <Form.Item label="Bác sĩ qua video" name={['Bacsi', 'khambenh_qua_video']}>
              <Input />
            </Form.Item>

            <Form.Item label="Giới thiệu" name={['Bacsi', 'gioi_thieu']}>
              <ReactQuill
                value={form.getFieldValue(['Bacsi', 'gioi_thieu']) || ""}
                onChange={(content) => {
                  form.setFieldsValue({
                    Bacsi: {
                      ...form.getFieldValue("Bacsi"),
                      gioi_thieu: content, // Gán giá trị HTML vào Form
                    },
                  });
                }}
              />
            </Form.Item>

            <Form.Item label="Kinh nghiệm" name={['Bacsi', 'kinh_nghiem']}>
              <ReactQuill
                value={form.getFieldValue(['Bacsi', 'kinh_nghiem']) || ""}
                onChange={(content) => {
                  form.setFieldsValue({
                    Bacsi: {
                      ...form.getFieldValue("Bacsi"),
                      kinh_nghiem: content, // Gán giá trị HTML vào Form
                    },
                  });
                }}
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: -1, span: 20 }} style={{ marginBottom: 300 }}>
              <Button type="primary" htmlType="submit" style={{ width: '70%' }}>
                Thêm
              </Button>
            </Form.Item>
          </Col>

          <Col span={12} style={{ paddingLeft: '100px' }}>
            <Form.Item label="Chuyên môn" name={['Bacsi', 'chuyen_mon']} rules={[{ required: true, message: 'Vui lòng chọn chuyên môn!' }]}>
              <Select>
                {chuyenmon.map((value: any, index: number) => (
                  <Option key={index + ""} value={value.id}>{value.ten_chuyen_mon}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Email" name={['Bacsi', 'email']}>
              <Input />
            </Form.Item>

            <Form.Item label="Giới tính" name={['Bacsi', 'gioi_tinh']}>
              <Input />
            </Form.Item>

            <Form.Item label="Mật khẩu" name={['Bacsi', 'mat_khau']}>
              <Input.Password />
            </Form.Item>

            <Form.Item label="Giá" name={['Bacsi', 'gia']}>
              <Input />
            </Form.Item>

            <Form.Item label="Chuyên trị" name={['Bacsi', 'chuyen_tri']}>
              <ReactQuill
                value={form.getFieldValue(['Bacsi', 'chuyen_tri']) || ""}
                onChange={(content) => {
                  form.setFieldsValue({
                    Bacsi: {
                      ...form.getFieldValue("Bacsi"),
                      chuyen_tri: content, // Gán giá trị HTML vào Form
                    },
                  });
                }}
              />
            </Form.Item>

            <Form.Item label="Chức danh" name={['Bacsi', 'chuc_danh']}>
              <Input />
            </Form.Item>

            <Form.Item label="Upload" valuePropName="fileList" getValueFromEvent={normFile} name={['Bacsi', 'anh']} rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh!' }]}>
              <Upload listType="picture-card">
                <button style={{ border: 0, background: 'none' }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default () => <App />;
