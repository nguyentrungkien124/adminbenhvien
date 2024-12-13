import React, { useEffect, useState } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Mentions,
  notification,
  Upload,
} from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { error } from 'console';
import { PlusOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

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


const EditPP: React.FC = () => {

  const { id } = useParams()
  const [form] = Form.useForm()
  const [nhaphanphoi, setNhaPhanPhoi] = useState<NhaPhanPhoi>();
  const navigate = useNavigate();

  interface NhaPhanPhoi {
    id?: number;
    ten_nha_phan_phoi?: string;
    dia_chi?: string;
    so_dien_thoai?: string;
    email?: string;
    ghi_chu?: string
    files?: any;
    hinh_anh: string;

  }

  useEffect(() => {
    async function loadData() {
      const res = await axios.get(`http://localhost:9999/api/nhaphanphoi/getnhaphanphoibyid/${id}`);
      setNhaPhanPhoi(res.data[0]); // Cập nhật để lấy đối tượng đầu tiên
      form.setFieldsValue(res.data[0]);
    }

    loadData();
  }, [id, form]);



  const Update = async (NhaPhanPhoi: NhaPhanPhoi) => {
    const fromData = new FormData();
    fromData.append('id', NhaPhanPhoi.id ? NhaPhanPhoi.id.toString() : '');
    fromData.append('ten_nha_phan_phoi', NhaPhanPhoi.ten_nha_phan_phoi || '');
    fromData.append('dia_chi', NhaPhanPhoi.dia_chi || '');
    fromData.append('so_dien_thoai', NhaPhanPhoi.so_dien_thoai || '');
    fromData.append('email', NhaPhanPhoi.email || '');
    fromData.append('ghi_chu', NhaPhanPhoi.ghi_chu || '');
    if (NhaPhanPhoi.files) {
      fromData.append('files', NhaPhanPhoi.files[0].originFileObj);
    }
    // let nhaphanphoi = {
    //   "MaNPP": NhaPhanPhoi.maNhaPhanPhoi,
    //   "TenNPP": NhaPhanPhoi.tenNhaPhanPhoi,
    //   "DiaChi": NhaPhanPhoi.diaChi,
    //   Email
    //   "SoDienThoai": NhaPhanPhoi.soDienThoai
    //   files
    // };
    console.log(NhaPhanPhoi);
    try {
      const response = await axios.put(
        "http://localhost:9999/api/nhaphanphoi/suanhaphanphoi", fromData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },

      });


      if (response) {
        // Hiển thị thông báo thành công
        notification.success({
          message: 'Thành công',
          description: 'Đã sửa nhà phân phối thành công',
          placement: 'top',
          duration: 2 // Thông báo tự động biến mất sau 3 giây
        });
        // navigate('/indexPP')
      }
    } catch (error) {
      console.error("Lỗi data:", error);
      alert("Sửa thất bại")

    }
  }
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  return (
    <div>
      <h2 style={{ color: '#4a90e2', borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px' }}>Sửa nhà phân phối</h2>
      <Form {...formItemLayout}
        form={form}
        onFinish={Update}
        variant="filled" style={{ maxWidth: 600, marginTop: 20 }}>
        <Form.Item
          label="Mã nhà phân phối"
          name='id'
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Mentions />
        </Form.Item>
        <Form.Item
          label="Tên nhà phân phối"
          name='ten_nha_phan_phoi'
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Mentions />
        </Form.Item>


        <Form.Item
          label="Địa chỉ"
          name='dia_chi'
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Mentions />
        </Form.Item>


        <Form.Item
          label="Email"
          name='email'
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Mentions />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name='so_dien_thoai'
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Mentions />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name='ghi_chu'
          rules={[{ required: true, message: 'Please input!' }]}
        >
          <Mentions />
        </Form.Item>
        <Form.Item
          label="Ảnh"
          name="hinh_anh" // Giữ lại tên field
        >
          {nhaphanphoi?.hinh_anh ? (
            <img
              src={nhaphanphoi.hinh_anh} // Sử dụng giá trị ảnh từ nhaphanphoi
              alt="Ảnh"
              style={{ width: 100, height: "auto" }}
            />
          ) : (
            <span>Không có ảnh</span> // Hiển thị thông báo nếu không có ảnh
          )}
        </Form.Item>



        <Form.Item name="files" label="Ảnh Sản Phẩm" valuePropName="fileList" getValueFromEvent={normFile}>
          <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
            <button style={{ border: 0, background: 'none' }} type="button">
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </button>
          </Upload>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>

  );


};

export default () => <EditPP />;