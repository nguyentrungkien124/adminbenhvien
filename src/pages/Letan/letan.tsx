import React, { useState, useEffect, useRef } from 'react';
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
  Spin,
  Modal,
  List,
  Tag,
  Typography,
} from 'antd';
import { UploadOutlined, SearchOutlined, CheckCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface FormData {
  [key: string]: any;
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
  source?: string;
}

interface Department {
  id: string;
  name: string;
  mo_ta?: string;
  hinh_anh?: string;
}

interface User {
  id: number;
  ho_ten: string;
  so_dien_thoai: string;
  CMND: string;
  ngay_sinh: string;
  gioi_tinh: string;
  dia_chi: string;
  dan_toc: string;
  nghe_nghiep: string;
  email: string;
  so_bao_hiem_y_te: string;
  updated_at?: string;
}

interface Appointment {
  id: number;
  khach_hang_id: number;
  khoa_id: number;
  bac_si_id: number | null;
  trieu_chung: string;
  ngay_kham: string;
  status: number;
  source: string;
  source_id: number;
  created_at: string;
  ket_qua_kham?: string | null;
  loai_dieu_tri?: string;
}

const Letan: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [existingUser, setExistingUser] = useState<User | null>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [soThuTu, setSoThuTu] = useState<string | null>(null);
  const [isSoThuTuModalVisible, setIsSoThuTuModalVisible] = useState(false);

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

  const searchPatient = async () => {
    if (!searchQuery) {
      message.error('Vui lòng nhập số điện thoại hoặc CMND/CCCD để tìm kiếm!');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:9999/api/user/search', {
        params: {
          so_dien_thoai: searchQuery,
          CMND: searchQuery,
        },
      });

      const users = response.data.data || [];
      if (users.length === 0) {
        setExistingUser(null);
        setSearchResults([]);
        setAppointment(null);
        message.info('Không tìm thấy bệnh nhân. Vui lòng nhập thông tin để tạo mới.');
        form.resetFields([
          'ho_ten',
          'so_dien_thoai',
          'CMND',
          'ngay_sinh',
          'gioi_tinh',
          'dia_chi',
          'dan_toc',
          'nghe_nghiep',
          'email',
          'so_bao_hiem_y_te',
        ]);
      } else if (users.length === 1) {
        const user = users[0];
        setExistingUser(user);
        setCreatedUserId(user.id);
        const userData = {
          ho_ten: user.ho_ten,
          so_dien_thoai: user.so_dien_thoai,
          CMND: user.CMND,
          ngay_sinh: user.ngay_sinh ? dayjs(user.ngay_sinh) : null,
          gioi_tinh: user.gioi_tinh,
          dia_chi: user.dia_chi,
          dan_toc: user.dan_toc,
          nghe_nghiep: user.nghe_nghiep,
          email: user.email,
          so_bao_hiem_y_te: user.so_bao_hiem_y_te,
        };
        setFormData(userData);
        form.setFieldsValue(userData);

        const ngay_kham = dayjs().format('YYYY-MM-DD');
        const appointmentResponse = await axios.get('http://localhost:9999/api/user/check-appointment', {
          params: {
            so_dien_thoai: user.so_dien_thoai,
            ngay_kham: ngay_kham,
            source: 'online',
          },
        });

        if (appointmentResponse.data.appointment) {
          const appt = appointmentResponse.data.appointment;
          const isToday = dayjs(appt.ngay_kham).isSame(dayjs(), 'day');
          // Chấp nhận status: 0 (chưa khám) hoặc 1 (đã xác nhận nhưng chưa khám, ket_qua_kham: null)
          const isPending = appt.status === 0 || (appt.status === 1 && !appt.ket_qua_kham);

          setFormData((prev) => ({ ...prev, source: appt.source }));
          if (isToday && isPending && appt.source === 'online') {
            setAppointment(appt);
            if (appt.source === 'online') {
              setIsConfirming(true);
            }
            message.success('Đã tìm thấy bệnh nhân và lịch hẹn trực tuyến. Vui lòng kiểm tra thông tin.');
            const appointmentData = {
              khoa_id: appt.khoa_id.toString(),
              trieu_chung: appt.trieu_chung,
            };
            setFormData((prev) => ({ ...prev, ...appointmentData }));
            form.setFieldsValue(appointmentData);
          } else {
            setAppointment(null);
            message.success('Đã tìm thấy bệnh nhân, nhưng không có lịch hẹn trực tuyến hợp lệ hôm nay.');
          }
        } else {
          setAppointment(null);
          message.success('Đã tìm thấy bệnh nhân, nhưng không có lịch hẹn trực tuyến hôm nay.');
        }
      } else {
        setSearchResults(users);
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm bệnh nhân:', error);
      message.error('Có lỗi khi tìm kiếm bệnh nhân hoặc lịch hẹn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user: User) => {
    setExistingUser(user);
    setCreatedUserId(user.id);
    const userData = {
      ho_ten: user.ho_ten,
      so_dien_thoai: user.so_dien_thoai,
      CMND: user.CMND,
      ngay_sinh: user.ngay_sinh ? dayjs(user.ngay_sinh) : null,
      gioi_tinh: user.gioi_tinh,
      dia_chi: user.dia_chi,
      dan_toc: user.dan_toc,
      nghe_nghiep: user.nghe_nghiep,
      email: user.email,
      so_bao_hiem_y_te: user.so_bao_hiem_y_te,
    };
    setFormData(userData);
    form.setFieldsValue(userData);

    try {
      const ngay_kham = dayjs().format('YYYY-MM-DD');
      const appointmentResponse = await axios.get('http://localhost:9999/api/user/check-appointment', {
        params: {
          so_dien_thoai: user.so_dien_thoai,
          ngay_kham: ngay_kham,
          source: 'online',
        },
      });

      if (appointmentResponse.data.appointment) {
        const appt = appointmentResponse.data.appointment;
        const isToday = dayjs(appt.ngay_kham).isSame(dayjs(), 'day');
        // Chấp nhận status: 0 (chưa khám) hoặc 1 (đã xác nhận nhưng chưa khám, ket_qua_kham: null)
        const isPending = appt.status === 0 || (appt.status === 1 && !appt.ket_qua_kham);

        setFormData((prev) => ({ ...prev, source: appt.source }));
        if (isToday && isPending && appt.source === 'online') {
          setAppointment(appt);
          if (appt.source === 'online') {
            setIsConfirming(true);
          }
          message.success('Đã chọn bệnh nhân và tìm thấy lịch hẹn trực tuyến. Vui lòng kiểm tra thông tin.');
          const appointmentData = {
            khoa_id: appt.khoa_id.toString(),
            trieu_chung: appt.trieu_chung,
          };
          setFormData((prev) => ({ ...prev, ...appointmentData }));
          form.setFieldsValue(appointmentData);
        } else {
          setAppointment(null);
          message.success('Đã chọn bệnh nhân, nhưng không có lịch hẹn trực tuyến hợp lệ hôm nay.');
        }
      } else {
        setAppointment(null);
        message.success('Đã chọn bệnh nhân, nhưng không có lịch hẹn trực tuyến hôm nay.');
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra lịch hẹn:', error);
      message.error('Có lỗi khi kiểm tra lịch hẹn. Vui lòng thử lại.');
    }

    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSearchResults([]);
  };

  const createUser = async (userData: any) => {
    try {
      console.log('Sending user data to create:', userData);
      const response = await axios.post('http://localhost:9999/api/user/create', userData);
      console.log('Create user response:', response.data);

      if (response.data) {
        console.log('Response data type:', typeof response.data);
        console.log('Response data keys:', Object.keys(response.data));

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
      if (!patientData.khach_hang_id) {
        throw new Error('Thiếu ID khách hàng');
      }
      if (!patientData.khoa_id) {
        throw new Error('Thiếu ID khoa');
      }

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
          headers: error.response?.headers,
        });
        throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi tiếp nhận bệnh nhân');
      }
      throw error;
    }
  };

  const generateSoThuTu = async (hinh_thuc: string, khach_hang_id: number, khoa_id: number, bac_si_id: number | null) => {
    try {
      const response = await axios.post('http://localhost:9999/api/user/generate-stt', {
        hinh_thuc,
        khach_hang_id,
        khoa_id,
        bac_si_id,
      });
      return response.data.so_thu_tu;
    } catch (error) {
      console.error('Lỗi khi sinh số thứ tự:', error);
      throw new Error('Không thể sinh số thứ tự. Vui lòng thử lại.');
    }
  };

  const generatePDF = () => {
    const requiredFields = [
      { key: 'ho_ten', label: 'Họ tên' },
      { key: 'so_dien_thoai', label: 'Số điện thoại' },
      { key: 'khoa_id', label: 'Khoa tiếp nhận' },
      { key: 'trieu_chung', label: 'Triệu chứng' },
    ];

    const missingFields = requiredFields.filter(field => !formData[field.key]);
    if (!soThuTu || missingFields.length > 0) {
      const missingLabels = missingFields.map(field => field.label).join(', ');
      message.error(`Không thể tạo PDF - Thiếu thông tin: ${missingLabels}`);
      return;
    }

    try {
      setPdfGenerating(true);
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5',
      });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PHIẾU SỐ THỨ TỰ KHÁM BỆNH', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('BỆNH VIỆN XYZ', 105, 30, { align: 'center' });
      doc.text('----------------------------------------', 105, 35, { align: 'center' });

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`SỐ: ${soThuTu}`, 105, 50, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const patientInfo = [
        { label: 'Họ tên:', value: formData.ho_ten || 'N/A' },
        { label: 'Số điện thoại:', value: formData.so_dien_thoai || 'N/A' },
        { label: 'Khoa tiếp nhận:', value: departments.find((d) => d.id === formData.khoa_id)?.name || 'Chưa xác định' },
        { label: 'Triệu chứng:', value: formData.trieu_chung || 'Không có' },
        { label: 'Ngày khám:', value: dayjs().format('DD/MM/YYYY HH:mm') },
        { label: 'Hình thức:', value: formData.source === 'online' ? 'Trực tuyến' : 'Trực tiếp' },
      ];

      let yPos = 65;
      patientInfo.forEach(item => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${item.label}`, 20, yPos);
        doc.setFont('helvetica', 'normal');
        const valueText = item.value.length > 40 ? item.value.substring(0, 40) + '...' : item.value;
        doc.text(valueText, 60, yPos);
        yPos += 10;
      });

      doc.setFontSize(10);
      doc.text('Vui lòng giữ phiếu này và đến đúng giờ khám.', 105, 130, { align: 'center' });
      doc.text('Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!', 105, 140, { align: 'center' });

      const filename = `SoThuTu_${soThuTu}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
      
      doc.save(filename);
      
      message.success('Tải phiếu số thứ tự thành công!');
    } catch (error) {
      console.error('Lỗi khi tạo PDF:', error);
      message.error('Không thể tạo PDF. Vui lòng thử lại.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!appointment || !createdUserId) return;

    setLoading(true);
    try {
      const so_thu_tu = await generateSoThuTu('tructuyen', createdUserId, appointment.khoa_id, null);
      setSoThuTu(so_thu_tu);
      setIsSoThuTuModalVisible(true);
      setIsConfirming(false);

      const updatedFormData = {
        ...formData,
        khoa_id: appointment.khoa_id.toString(),
        trieu_chung: appointment.trieu_chung,
      };
      setFormData(updatedFormData);
      form.setFieldsValue(updatedFormData);
      setCurrentStep(1);
    } catch (error) {
      console.error('Lỗi khi xác nhận lịch hẹn:', error);
      message.error('Có lỗi khi xác nhận lịch hẹn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    form.validateFields()
      .then((values) => {
        console.log('Step values before save:', values);
        setFormData((prev) => {
          const newData = { ...prev, ...values };
          console.log('Updated form data:', newData);
          return newData;
        });
        setCurrentStep(currentStep + 1);
      })
      .catch((error) => {
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
      setFormData(finalValues);

      if (!finalValues.ho_ten || !finalValues.so_dien_thoai || !finalValues.ngay_sinh || !finalValues.gioi_tinh || !finalValues.dia_chi) {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
        setLoading(false);
        return;
      }

      const birthDateStr = finalValues.ngay_sinh.format('YYYY-MM-DD');

      const userData = {
        ho_ten: finalValues.ho_ten,
        email: finalValues.email || 'undefined@hospital.com',
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

      let userId = createdUserId;

      if (!existingUser) {
        userId = await createUser(userData);
        console.log('Created user ID:', userId);

        if (!userId) {
          message.error('Không thể tạo người dùng mới');
          setLoading(false);
          return;
        }
      }

      const patientData = {
        khach_hang_id: userId,
        khoa_id: parseInt(finalValues.khoa_id) || 20,
        bac_si_id: parseInt(finalValues.bac_si_id || ''),
        trieu_chung: finalValues.trieu_chung,
        tien_su_benh: finalValues.tien_su_benh || '',
        bao_hiem_y_te: finalValues.bao_hiem_y_te,
      };
      console.log('Patient data to send:', patientData);

      await tiepNhanBenhNhan(patientData);

      const hinh_thuc = (appointment && isConfirming) ? 'tructuyen' : 'tructiep';
      const so_thu_tu = await generateSoThuTu(hinh_thuc, userId!, parseInt(finalValues.khoa_id), null);
      setSoThuTu(so_thu_tu);
      setIsSoThuTuModalVisible(true);

      form.resetFields();
      setFormData({});
      setCreatedUserId(null);
      setExistingUser(null);
      setAppointment(null);
      setSearchQuery('');
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
        const mappedDepartments = khoaResponse.data.map((dept: any) => ({
          id: dept.id.toString(),
          name: dept.ten,
          mo_ta: dept.mo_ta,
          hinh_anh: dept.hinh_anh,
        }));
        setDepartments(mappedDepartments);
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
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Input
                      placeholder="Nhập số điện thoại hoặc CMND/CCCD"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      prefix={<SearchOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Button type="primary" onClick={searchPatient} icon={<SearchOutlined />}>
                      Tìm kiếm bệnh nhân
                    </Button>
                  </Col>
                </Row>

                {appointment && (
                  <div style={{ marginBottom: 16 }}>
                    <Divider orientation="left">Thông tin lịch hẹn</Divider>
                    <p>
                      <strong>ID Lịch hẹn:</strong> {appointment.id}
                    </p>
                    <p>
                      <strong>Khoa:</strong>{' '}
                      {departments.find((d) => d.id === appointment.khoa_id.toString())?.name || 'Chưa xác định'}
                    </p>
                    <p>
                      <strong>Triệu chứng:</strong> {appointment.trieu_chung}
                    </p>
                    <p>
                      <strong>Ngày khám:</strong> {dayjs(appointment.ngay_kham).format('DD/MM/YYYY HH:mm')}
                    </p>
                    <p>
                      <strong>Hình thức:</strong>{' '}
                      <Tag color={appointment.source === 'online' ? 'blue' : 'green'}>
                        {appointment.source === 'online' ? 'Trực tuyến' : 'Trực tiếp'}
                      </Tag>
                    </p>
                    {appointment.source === 'online' && isConfirming && (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={handleConfirmAppointment}
                        style={{ marginTop: 8 }}
                      >
                        Xác nhận
                      </Button>
                    )}
                  </div>
                )}

                <Divider>Thông tin bệnh nhân</Divider>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="ho_ten"
                      label="Họ và tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                      <Input placeholder="Nhập họ và tên" disabled={!!existingUser} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="so_dien_thoai"
                      label="Số điện thoại"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]+$/, message: 'Số điện thoại không hợp lệ!' },
                      ]}
                    >
                      <Input placeholder="Nhập số điện thoại" disabled={!!existingUser} />
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
                      <Radio.Group disabled={!!existingUser}>
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
                        disabled={!!existingUser}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="CMND" label="Số CMND/CCCD">
                      <Input placeholder="Nhập số CMND/CCCD" disabled={!!existingUser} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="dan_toc" label="Dân tộc">
                      <Input placeholder="Nhập dân tộc" disabled={!!existingUser} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="nghe_nghiep" label="Nghề nghiệp">
                      <Input placeholder="Nhập nghề nghiệp" disabled={!!existingUser} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
                    >
                      <Input placeholder="Nhập email (nếu có)" disabled={!!existingUser} />
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
                      <Input placeholder="Nhập địa chỉ" disabled={!!existingUser} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="so_bao_hiem_y_te" label="Số bảo hiểm y tế">
                      <Input placeholder="Nhập số bảo hiểm y tế" disabled={!!existingUser} />
                    </Form.Item>
                  </Col>
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
                      rules={[{ required: true, message: 'Vui lòng chọn khoa!' }]}
                    >
                      <Select placeholder="Chọn khoa" disabled={!!appointment}>
                        {departments.map((dept) => (
                          <Option key={dept.id} value={dept.id}>
                            {dept.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="trieu_chung"
                  label="Triệu chứng/Tình trạng"
                  rules={[{ required: true, message: 'Vui lòng mô tả triệu chứng!' }]}
                >
                  <TextArea rows={4} placeholder="Mô tả triệu chứng/tình trạng bệnh nhân" />
                </Form.Item>

                <Form.Item name="tien_su_benh" label="Tiền sử bệnh">
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
                  <p>
                    <strong>Họ tên:</strong> {formData.ho_ten || 'N/A'}
                  </p>
                  <p>
                    <strong>SĐT:</strong> {formData.so_dien_thoai || 'N/A'}
                  </p>
                  <p>
                    <strong>Ngày sinh:</strong> {formData.ngay_sinh?.format('DD/MM/YYYY') || 'N/A'}
                  </p>
                  <p>
                    <strong>Khoa tiếp nhận:</strong>{' '}
                    {departments.find((d) => d.id === formData.khoa_id)?.name || 'N/A'}
                  </p>
                  <p>
                    <strong>Triệu chứng:</strong> {formData.trieu_chung || 'N/A'}
                  </p>
                  <p>
                    <strong>Bảo hiểm y tế:</strong> {formData.bao_hiem_y_te ? 'Có' : 'Không'}
                  </p>
                </div>
                <Divider />
                <Form.Item name="notes" label="Ghi chú thêm">
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

          <Modal
            title="Chọn bệnh nhân"
            open={isModalVisible}
            onCancel={handleModalCancel}
            footer={null}
          >
            <List
              dataSource={searchResults}
              renderItem={(user) => (
                <List.Item
                  actions={[
                    <Button type="primary" onClick={() => handleSelectUser(user)}>
                      Chọn
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={user.ho_ten}
                    description={`SĐT: ${user.so_dien_thoai} | CMND: ${user.CMND} | Ngày sinh: ${user.ngay_sinh} | Cập nhật: ${user.updated_at || 'Không rõ'}`}
                  />
                </List.Item>
              )}
            />
          </Modal>

          <Modal
            title="Số thứ tự khám bệnh"
            open={isSoThuTuModalVisible}
            onOk={() => setIsSoThuTuModalVisible(false)}
            onCancel={() => setIsSoThuTuModalVisible(false)}
            footer={[
              <Button
                key="download"
                type="primary"
                icon={<DownloadOutlined />}
                onClick={generatePDF}
                loading={pdfGenerating}
              >
                Tải PDF
              </Button>,
              <Button key="close" onClick={() => setIsSoThuTuModalVisible(false)}>
                Đóng
              </Button>,
            ]}
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Title level={2} style={{ color: '#1890ff' }}>{soThuTu}</Title>
              <Text strong>Họ tên: {formData.ho_ten || 'N/A'}</Text><br />
              <Text>Khoa tiếp nhận: {departments.find((d) => d.id === formData.khoa_id)?.name || 'N/A'}</Text><br />
              <Text>Ngày khám: {dayjs().format('DD/MM/YYYY HH:mm')}</Text>
            </div>
          </Modal>
        </Card>
      </Spin>
    </div>
  );
};

export default Letan;