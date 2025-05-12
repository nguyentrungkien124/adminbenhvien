import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Row,
  Col,
  Divider,
  message,
  Steps,
  DatePicker,
  Radio,
  Upload,
  Spin
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface'; // ✅ Sửa đúng import kiểu
import axios, { AxiosError } from 'axios';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

interface FormData {
  ho_ten?: string;
  email?: string;
  mat_khau?: string;
  so_dien_thoai?: string;
  ngay_sinh?: any;
  gioi_tinh?: string;
  dia_chi?: string;
  hinh_anh?: any;
  dan_toc?: string;
  CMND?: string;
  nghe_nghiep?: string;
  khoa_id?: string;
  bac_si_id?: string;
  trieu_chung?: string;
  tien_su_benh?: string;
  bao_hiem_y_te?: boolean;
  khach_hang_id?: number;
  so_bao_hiem_y_te?: string;
}
interface Department {
  id: string;
  name: string; // Tương ứng với cột `ten` trong bảng khoa
  mo_ta?: string;
  hinh_anh?: string;
}

const Letan: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);

  const props: UploadProps = {
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Chỉ chấp nhận file JPG/PNG!');
      }
      return isJpgOrPng || Upload.LIST_IGNORE;
    },
    maxCount: 1,
  };

  const createUser = async (userData: any) => {
    try {
      console.log('Sending user data to create:', userData);
      const response = await axios.post('http://localhost:9999/api/user/create', userData);
      console.log('Create user response:', response.data);
      
      // Kiểm tra chi tiết response
      if (response.data) {
        console.log('Response data type:', typeof response.data);
        console.log('Response data keys:', Object.keys(response.data));
        
        // Nếu response.data là string, thử parse JSON
        if (typeof response.data === 'string') {
          try {
            const parsedData = JSON.parse(response.data);
            console.log('Parsed response data:', parsedData);
            if (parsedData.id) {
              setCreatedUserId(parsedData.id);
              return parsedData.id;
            }
          } catch (e) {
            console.error('Error parsing response data:', e);
          }
        }
        
        // Nếu response.data là object
        if (response.data.id) {
          setCreatedUserId(response.data.id);
          return response.data.id;
        }
      }
      
      console.error('Invalid response format:', response.data);
      throw new Error('Không nhận được ID người dùng từ server');
    } catch (error) {
      console.error('Lỗi khi tạo người dùng:', error);
      throw error;
    }
  };

  const tiepNhanBenhNhan = async (patientData: any) => {
    try {
      // Kiểm tra dữ liệu trước khi gửi
      if (!patientData.khach_hang_id) {
        throw new Error('Thiếu ID khách hàng');
      }
      if (!patientData.khoa_id) {
        throw new Error('Thiếu ID khoa');
      }
      // if (!patientData.bac_si_id) {
      //   throw new Error('Thiếu ID bác sĩ');
      // }

      console.log('Sending patient data to tiepnhan:', patientData);
      const response = await axios.post('http://localhost:9999/api/letan/tiepnhan', patientData);
      console.log('Tiepnhan response:', response.data);
      
      if (!response.data) {
        throw new Error('Không nhận được phản hồi từ server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tiếp nhận bệnh nhân:', error);
      if (error instanceof AxiosError) {
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi tiếp nhận bệnh nhân');
      }
      throw error;
    }
  };

  const nextStep = () => {
    form.validateFields().then(values => {
      console.log('Step values before save:', values);
      setFormData(prev => {
        const newData = { ...prev, ...values };
        console.log('Updated form data:', newData);
        return newData;
      });
      setCurrentStep(currentStep + 1);
    }).catch(error => {
      console.log('Validation failed:', error);
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const finalValues = { ...formData, ...values };
      
      if (!finalValues.ho_ten || !finalValues.so_dien_thoai || !finalValues.ngay_sinh || !finalValues.gioi_tinh || !finalValues.dia_chi) {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
        setLoading(false);
        return;
      }
  
      const birthDateStr = finalValues.ngay_sinh.format('YYYY-MM-DD');
  
      const userData = {
        ho_ten: finalValues.ho_ten,
        email: finalValues.email || "undefined@hospital.com",
        mat_khau: 'defaultPassword',
        so_dien_thoai: finalValues.so_dien_thoai,
        ngay_sinh: birthDateStr,
        gioi_tinh: finalValues.gioi_tinh,
        dia_chi: finalValues.dia_chi,
        hinh_anh: finalValues.hinh_anh?.[0]?.name || '',
        dan_toc: finalValues.dan_toc || '',
        CMND: finalValues.CMND || '',
        nghe_nghiep: finalValues.nghe_nghiep || '',
        so_bao_hiem_y_te: finalValues.so_bao_hiem_y_te || '',
      };
  
      const userId = await createUser(userData);
      console.log('Created user ID:', userId);
  
      if (!userId) {
        message.error('Không thể tạo người dùng mới');
        setLoading(false);
        return;
      }
  
      const patientData = {
        khach_hang_id: userId, 
        khoa_id: parseInt(finalValues.khoa_id) || 20,
        bac_si_id: parseInt(finalValues.bac_si_id || ''),
        trieu_chung: finalValues.trieu_chung,
        tien_su_benh: finalValues.tien_su_benh || '',
        bao_hiem_y_te: finalValues.bao_hiem_y_te
      };
      console.log('Patient data to send:', patientData);
  
      await tiepNhanBenhNhan(patientData);
  
      message.success('Tiếp nhận bệnh nhân thành công!');
      form.resetFields();
      setFormData({});
      setCreatedUserId(null);
      setCurrentStep(0);
    } catch (error) {
      console.error('Error in onFinish:', error);
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error('Có lỗi xảy ra khi tiếp nhận bệnh nhân');
      }
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const khoaResponse = await axios.get('http://localhost:9999/api/khoa/getall');
        // Đảm bảo ánh xạ đúng với cột `ten` trong bảng khoa
        const mappedDepartments = khoaResponse.data.map((dept: any) => ({
          id: dept.id.toString(),
          name: dept.ten,
          mo_ta: dept.mo_ta,
          hinh_anh: dept.hinh_anh
        }));
        setDepartments(mappedDepartments);

        // const doctorResponse = await axios.get('http://localhost:9999/api/doctors');
        // setDoctors(doctorResponse.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        message.error('Không thể tải danh sách khoa hoặc bác sĩ');
      }
    };

    fetchData();
  }, []);
  return (
    <div style={{ padding: '24px' }}>
      <Spin spinning={loading}>
        <Card title="HỆ THỐNG TIẾP NHẬN BỆNH NHÂN" bordered={false}>
          <Steps current={currentStep} style={{ marginBottom: '24px' }}>
            <Step title="Thông tin cá nhân" />
            <Step title="Thông tin khám bệnh" />
            <Step title="Xác nhận" />
          </Steps>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            scrollToFirstError
            initialValues={formData}
            preserve={false}
          >
            {currentStep === 0 && (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="ho_ten"
                      label="Họ và tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                      <Input placeholder="Nhập họ và tên" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="so_dien_thoai"
                      label="Số điện thoại"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]+$/, message: 'Số điện thoại không hợp lệ!' }
                      ]}
                    >
                      <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="gioi_tinh"
                      label="Giới tính"
                      rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                    >
                      <Radio.Group>
                        <Radio value="male">Nam</Radio>
                        <Radio value="female">Nữ</Radio>
                        <Radio value="other">Khác</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="ngay_sinh"
                      label="Ngày sinh"
                      rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }} 
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày sinh"
                        allowClear={false}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="CMND"
                      label="Số CMND/CCCD"
                    >
                      <Input placeholder="Nhập số CMND/CCCD" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="dan_toc"
                      label="Dân tộc"
                    >
                      <Input placeholder="Nhập dân tộc" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="nghe_nghiep"
                      label="Nghề nghiệp"
                    >
                      <Input placeholder="Nhập nghề nghiệp" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { type: 'email', message: 'Email không hợp lệ!' }
                      ]}
                    >
                      <Input placeholder="Nhập email (nếu có)" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="dia_chi"
                      label="Địa chỉ"
                      rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    >
                      <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="so_bao_hiem_y_te"
                      label="Số bảo hiểm y tế"
                      rules={[{ message: 'Vui lòng nhập số bảo hiểm y tế!' }]}
                    >
                      <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>
                  </Col>
                  {/* <Col span={12}>
                    <Form.Item
                      name="hinh_anh"
                      label="Ảnh đại diện"
                    >
                      <Upload {...props} maxCount={1}>
                        <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
                      </Upload>
                    </Form.Item>
                  </Col> */}
                </Row>
              </>
            )}

            {currentStep === 1 && (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="khoa_id"
                      label="Khoa tiếp nhận"
                      rules={[{  message: 'Vui lòng chọn khoa!' }]}
                    >
                      <Select placeholder="Chọn khoa">
                        {departments.map(dept => (
                          <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  {/* <Col span={12}>
                    <Form.Item
                      name="bac_si_id"
                      label="Bác sĩ phụ trách"
                      rules={[{  message: 'Vui lòng chọn bác sĩ!' }]}
                    >
                      <Select placeholder="Chọn bác sĩ">
                        {doctors.map(doc => (
                          <Option key={doc.id} value={doc.id}>{doc.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col> */}
                </Row>

                <Form.Item
                  name="trieu_chung"
                  label="Triệu chứng/Tình trạng"
                  rules={[{ required: true, message: 'Vui lòng mô tả triệu chứng!' }]}
                >
                  <TextArea rows={4} placeholder="Mô tả triệu chứng/tình trạng bệnh nhân" />
                </Form.Item>

                <Form.Item
                  name="tien_su_benh"
                  label="Tiền sử bệnh"
                >
                  <TextArea rows={2} placeholder="Nhập tiền sử bệnh (nếu có)" />
                </Form.Item>

                <Form.Item
                  name="bao_hiem_y_te"
                  label="Bảo hiểm y tế"
                  rules={[{ required: true, message: 'Vui lòng chọn tình trạng bảo hiểm!' }]}
                >
                  <Radio.Group>
                    <Radio value={true}>Có</Radio>
                    <Radio value={false}>Không</Radio>
                  </Radio.Group>
                </Form.Item>
              </>
            )}

            {currentStep === 2 && (
              <>
                <Divider orientation="left">Thông tin bệnh nhân</Divider>
                <div style={{ marginBottom: '24px' }}>
                  <p><strong>Họ tên:</strong> {form.getFieldValue('ho_ten')}</p>
                  <p><strong>SĐT:</strong> {form.getFieldValue('so_dien_thoai')}</p>
                  <p><strong>Ngày sinh:</strong> {form.getFieldValue('ngay_sinh')?.format('DD/MM/YYYY')}</p>
                  <p><strong>Khoa tiếp nhận:</strong> {
                    departments.find(d => d.id === form.getFieldValue('khoa_id'))?.name
                  }</p>
                  {/* <p><strong>Bác sĩ phụ trách:</strong> {
                    doctors.find(d => d.id === form.getFieldValue('bac_si_id'))?.name
                  }</p> */}
                  <p><strong>Triệu chứng:</strong> {form.getFieldValue('trieu_chung')}</p>
                  <p><strong>Bảo hiểm y tế:</strong> {form.getFieldValue('bao_hiem_y_te') ? 'Có' : 'Không'}</p>
                </div>
                <Divider />
                <Form.Item
                  name="notes"
                  label="Ghi chú thêm"
                >
                  <TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
                </Form.Item>
              </>
            )}

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              {currentStep > 0 && (
                <Button style={{ marginRight: '8px' }} onClick={prevStep}>
                  Quay lại
                </Button>
              )}
              {currentStep < 2 && (
                <Button type="primary" onClick={nextStep}>
                  Tiếp theo
                </Button>
              )}
              {currentStep === 2 && (
                <Button type="primary" htmlType="submit">
                  Ghi nhận thông tin
                </Button>
              )}
            </div>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default Letan;