import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  InputNumber,
  Select,
  Modal,
  message,
  Spin,
  Empty,
  Card,
  Typography,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Breadcrumb,
  Form,
  Tooltip,
  Avatar,
  Tabs,
  Input as AntInput,
  Radio,
  DatePicker,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MedicineBoxOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  InsuranceOutlined,
  FileSearchOutlined,
  InfoCircleOutlined,
  BellOutlined,
  CalendarOutlined,
  HomeOutlined,
  FileTextOutlined,
  SolutionOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { FormInstance } from 'antd/es/form';
import axios from 'axios';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = AntInput;
const { RangePicker } = DatePicker;

interface Appointment {
  id: number;
  khach_hang_id: number;
  ho_ten: string;
  so_dien_thoai: string;
  trieu_chung: string;
  khoa_id: number;
  khoa_name: string;
  bac_si_id: number | null;
  status: number;
  source: string;
  so_bao_hiem_y_te: string;
  bao_hiem_y_te: boolean | null;
  created_at: string;
  ket_qua_kham: string | null;
  chuyen_khoa_ghi_chu: string | null;
  loai_dieu_tri: 'noi_tru' | 'ngoai_tru' | 'chua_quyet_dinh' | null;
  is_admitted: boolean;
  hasPrescription?: boolean;
  hasTestRequest?: boolean;
  so_thu_tu?: string;
  da_thanh_toan?: number;
  gioi_tinh?: string;
  ngay_sinh?: string;
  dia_chi?: string;
}

interface KhachHang {
  gioi_tinh?: string;
  ngay_sinh?: string;
  dia_chi?: string;
}

interface Department {
  id: string;
  name: string;
}

interface Room {
  id: number;
  ten_phong: string;
}

interface Bed {
  id: number;
  room_id: number;
  ma_giuong: string;
}

interface Kho {
  kho_id: number;
  ten_san_pham: string;
  don_vi_tinh: string;
}

interface Service {
  id: number;
  ten: string;
}

interface AppointmentStats {
  total: number;
  pending: number;
  received: number;
}

interface ChiDinhThuoc {
  id: number;
  kho_id: number;
  ten_thuoc: string;
  don_vi: string;
  so_luong: number;
  lieu_luong: string;
  tan_suat: string;
  ngay_chi_dinh: string;
  nguoi_chi_dinh: string;
}

const Quanlykhambenh: React.FC = () => {
  const [form] = Form.useForm<FormInstance>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [khoList, setKhoList] = useState<Kho[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isKetLuanModalVisible, setIsKetLuanModalVisible] = useState<boolean>(false);
  const [isPhanLoaiModalVisible, setIsPhanLoaiModalVisible] = useState<boolean>(false);
  const [isXepGiuongModalVisible, setIsXepGiuongModalVisible] = useState<boolean>(false);
  const [isChiDinhThuocModalVisible, setIsChiDinhThuocModalVisible] = useState<boolean>(false);
  const [isDonThuocModalVisible, setIsDonThuocModalVisible] = useState<boolean>(false);
  const [isChiDinhXetNghiemModalVisible, setIsChiDinhXetNghiemModalVisible] = useState<boolean>(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [selectedKhoaId, setSelectedKhoaId] = useState<string>('');
  const [chuyenKhoaGhiChu, setChuyenKhoaGhiChu] = useState<string>('');
  const [ketQuaKham, setKetQuaKham] = useState<string>('');
  const [loaiDieuTri, setLoaiDieuTri] = useState<'noi_tru' | 'ngoai_tru' | 'chua_quyet_dinh' | null>(null);
  const [selectedBedId, setSelectedBedId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [stats, setStats] = useState<AppointmentStats>({ total: 0, pending: 0, received: 0 });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [transferLoading, setTransferLoading] = useState<boolean>(false);
  const [ketLuanLoading, setKetLuanLoading] = useState<boolean>(false);
  const [phanLoaiLoading, setPhanLoaiLoading] = useState<boolean>(false);
  const [xepGiuongLoading, setXepGiuongLoading] = useState<boolean>(false);
  const [chiDinhThuocLoading, setChiDinhThuocLoading] = useState<boolean>(false);
  const [chiDinhXetNghiemLoading, setChiDinhXetNghiemLoading] = useState<boolean>(false);
  const [activeTabKey, setActiveTabKey] = useState<string>('all');
  const [donThuocData, setDonThuocData] = useState<ChiDinhThuoc[]>([]);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [phiKham, setPhiKham] = useState<number | null>(null);
  const [khoaName, setKhoaName] = useState<string>('Không có khoa');
  const [testRequests, setTestRequests] = useState<any[]>([]);
  const [isTestRequestsModalVisible, setIsTestRequestsModalVisible] = useState<boolean>(false);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const khoaId = user.khoa_id;
  const bacSiId = user.bac_si_id;

  useEffect(() => {
    const fetchKhoaName = async () => {
      if (khoaId) {
        try {
          const response = await axios.get(`http://localhost:9999/api/khoa/getkhoabyid/${khoaId}`);
          const khoaData = response.data;
          setKhoaName(khoaData[0]?.ten || 'Không có khoa');
        } catch (error) {
          console.error('Lỗi khi lấy tên khoa:', error);
          setKhoaName('Không có khoa');
          message.error('Không thể lấy thông tin khoa. Vui lòng thử lại sau.');
        }
      } else {
        setKhoaName('Không có khoa');
      }
    };

    fetchKhoaName();
  }, [khoaId]);

const fetchTestRequests = async (appointmentId: number) => {
  try {
    setLoading(true);
    const [testRequestsResponse, khachHangResponse] = await Promise.all([
      axios.get(`http://localhost:9999/api/dichvu/service-requests/by-appointment?appointment_id=${appointmentId}`),
      axios.get(`http://localhost:9999/api/user/getthongtinbyId/${appointments.find((a) => a.id === appointmentId)?.khach_hang_id || 0}`),
    ]);

    const testData = testRequestsResponse.data || [];
    setTestRequests(Array.isArray(testData) ? testData : [testData]);

    const khachHangArray = khachHangResponse.data.data || khachHangResponse.data || [];
    const khachHangData = Array.isArray(khachHangArray) && khachHangArray.length > 0 ? khachHangArray[0] : {};

    const appt = appointments.find((a) => a.id === appointmentId) || null;
    const updatedAppointment: Appointment = {
      id: appt?.id || 0, // Đảm bảo id là number, mặc định 0 nếu không có
      khach_hang_id: appt?.khach_hang_id || 0,
      ho_ten: appt?.ho_ten || 'N/A',
      so_dien_thoai: appt?.so_dien_thoai || 'N/A',
      trieu_chung: appt?.trieu_chung || 'N/A',
      khoa_id: appt?.khoa_id || 0,
      khoa_name: appt?.khoa_name || 'N/A',
      bac_si_id: appt?.bac_si_id || null,
      status: appt?.status || 0,
      source: appt?.source || 'N/A',
      so_bao_hiem_y_te: appt?.so_bao_hiem_y_te || 'N/A',
      bao_hiem_y_te: appt?.bao_hiem_y_te || null,
      created_at: appt?.created_at || dayjs().format('YYYY-MM-DD'),
      ket_qua_kham: appt?.ket_qua_kham || 'Chưa xác định',
      chuyen_khoa_ghi_chu: appt?.chuyen_khoa_ghi_chu || null,
      loai_dieu_tri: appt?.loai_dieu_tri || 'chua_quyet_dinh',
      is_admitted: appt?.is_admitted || false,
      hasPrescription: appt?.hasPrescription || false,
      hasTestRequest: appt?.hasTestRequest || false,
     
      da_thanh_toan: appt?.da_thanh_toan || 0,
      gioi_tinh: khachHangData.gioi_tinh || 'N/A',
      ngay_sinh: khachHangData.ngay_sinh || undefined,
      dia_chi: khachHangData.dia_chi || 'N/A',
    };
    setSelectedAppointment(updatedAppointment);

    setIsTestRequestsModalVisible(true); // Đảm bảo modal được hiển thị
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách xét nghiệm hoặc thông tin bệnh nhân:', error);
    message.error(error.response?.data?.message || 'Có lỗi khi tải danh sách xét nghiệm hoặc thông tin bệnh nhân. Vui lòng thử lại.');
  } finally {
    setLoading(false);
  }
};
  const checkHasPrescription = async (appointmentId: number): Promise<boolean> => {
    try {
      const response = await axios.get(`http://localhost:9999/api/noitru/chi-dinh-thuoc/null?appointment_id=${appointmentId}`);
      const data = response.data.data;
      return Array.isArray(data) ? data.length > 0 : !!data;
    } catch (error) {
      console.error(`Lỗi khi kiểm tra đơn thuốc cho lịch hẹn ${appointmentId}:`, error);
      return false;
    }
  };

  const checkHasTestRequest = async (appointmentId: number): Promise<boolean> => {
    try {
      const response = await axios.get(`http://localhost:9999/api/dichvu/service-requests/by-appointment?appointment_id=${appointmentId}`);
      const data = response.data;
      return Array.isArray(data) ? data.length > 0 : !!data;
    } catch (error) {
      console.error(`Lỗi khi kiểm tra yêu cầu xét nghiệm cho lịch hẹn ${appointmentId}:`, error);
      return false;
    }
  };

  const fetchData = async (date: dayjs.Dayjs | null) => {
    try {
      setLoading(true);
      const currentDate = date ? date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      const [appointmentsRes, departmentsRes, roomsRes, bedsRes, khoRes, servicesRes] = await Promise.all([
        axios.get(`http://localhost:9999/api/letan/appointments?khoa_id=${khoaId}&date=${currentDate}`),
        axios.get('http://localhost:9999/api/khoa/getall'),
        axios.get(`http://localhost:9999/api/phongbenh/rooms?khoa_id=${khoaId}`),
        axios.get(`http://localhost:9999/api/phongbenh/beds?khoa_id=${khoaId}&trang_thai=trong`),
        axios.get(`http://localhost:9999/api/noitru/kho`),
        axios.get('http://localhost:9999/api/dichvu/services/all'),
      ]);
      console.log('Dữ liệu đã lấy:', servicesRes.data);
      const appointmentsData = appointmentsRes.data.data || [];
      const uniqueAppointmentsData = Array.from(
        new Map(appointmentsData.map((appt: Appointment) => [appt.id, appt])).values()
      );

      const [prescriptionChecks, testRequestChecks] = await Promise.all([
        Promise.all(uniqueAppointmentsData.map((appt: any) => checkHasPrescription(appt.id).catch(() => false))),
        Promise.all(uniqueAppointmentsData.map((appt: any) => checkHasTestRequest(appt.id).catch(() => false))),
      ]);

      const data = uniqueAppointmentsData.map((appt: any, index: number) => ({
        ...appt,
        bac_si_id: appt.bac_si_id === null ? null : appt.bac_si_id,
        status: Number(appt.status),
        ket_qua_kham: appt.ket_qua_kham || null,
        chuyen_khoa_ghi_chu: appt.chuyen_khoa_ghi_chu || null,
        loai_dieu_tri: appt.loai_dieu_tri || 'chua_quyet_dinh',
        is_admitted: !!appt.is_admitted,
        hasPrescription: prescriptionChecks[index] ?? false,
        hasTestRequest: testRequestChecks[index] ?? false,
        da_thanh_toan: appt.da_thanh_toan !== undefined ? Number(appt.da_thanh_toan) : 0,
        so_thu_tu: appt.so_thu_tu || null,
      }));

      const filteredData = data.filter((appt) =>
        dayjs(appt.created_at).format('YYYY-MM-DD') === currentDate
      );

      setAppointments(filteredData);
      setFilteredAppointments(filteredData);

      const total = filteredData.length;
      const pending = filteredData.filter((app: Appointment) => app.status === 0).length;
      const received = filteredData.filter((app: Appointment) => app.status === 1).length;
      setStats({ total, pending, received });

      setDepartments(
        departmentsRes.data
          .filter((d: any) => d.id !== khoaId)
          .map((d: any) => ({ id: d.id.toString(), name: d.ten }))
      );

      setRooms(roomsRes.data.map((room: any) => ({ id: room.id, ten_phong: room.ten_phong })));
      setBeds(bedsRes.data.map((bed: any) => ({ id: bed.id, room_id: bed.room_id, ma_giuong: bed.ma_giuong })));

      const khoData = khoRes.data.data || khoRes.data;
      const fetchedKho = Array.isArray(khoData)
        ? khoData.map((item: any) => ({
          kho_id: item.kho_id,
          ten_san_pham: item.ten_san_pham,
          don_vi_tinh: item.don_vi_tinh || 'Không có đơn vị tính',
        }))
        : khoData
          ? [{ kho_id: khoData.kho_id, ten_san_pham: khoData.ten_san_pham, don_vi_tinh: khoData.don_vi_tinh || 'Không có đơn vị tính' }]
          : [];
      setKhoList(fetchedKho);

      const servicesData = servicesRes.data || [];
      const fetchedServices = Array.isArray(servicesData)
        ? servicesData.map((item: any) => ({
          id: item.id,
          ten: item.ten,
        }))
        : servicesData
          ? [{ id: servicesData.id, ten: servicesData.ten }]
          : [];
      setServices(fetchedServices);

      if (filteredData.length === 0) {
        message.info('Không có lịch hẹn nào trong khoa cho ngày hiện tại');
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (khoaId) {
      fetchData(selectedDate);
    } else {
      message.error('Không tìm thấy thông tin khoa. Vui lòng đăng nhập lại.');
    }
  }, [khoaId, selectedDate]);

  useEffect(() => {
    let filtered = [...appointments];

    if (searchText) {
      filtered = filtered.filter(
        (appt) =>
          appt.ho_ten.toLowerCase().includes(searchText.toLowerCase()) ||
          appt.so_dien_thoai.includes(searchText)
      );
    }

    if (activeTabKey !== 'all') {
      if (activeTabKey === 'pending') {
        filtered = filtered.filter((appt) => appt.status === 0);
      } else if (activeTabKey === 'received') {
        filtered = filtered.filter((appt) => appt.status === 1);
      }
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((appt) =>
        statusFilter === 'pending' ? appt.status === 0 : appt.status === 1
      );
    }

    if (selectedDate) {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      filtered = filtered.filter((appt) => {
        const apptDate = dayjs(appt.created_at).format('YYYY-MM-DD');
        return apptDate === dateStr;
      });
    }

    const uniqueFiltered = Array.from(
      new Map(filtered.map((appt) => [appt.id, appt])).values()
    );

    setFilteredAppointments(uniqueFiltered);
  }, [searchText, statusFilter, appointments, activeTabKey, selectedDate]);

  const handleNhanLich = async (appointmentId: number) => {
    if (!bacSiId) {
      message.error('Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setLoading(true);
      await axios.put(`http://localhost:9999/api/letan/nhan-lich/${appointmentId}/${bacSiId}`);

      const updatedAppointments = appointments.map((appt) =>
        appt.id === appointmentId ? { ...appt, bac_si_id: bacSiId, status: 1 } : appt
      );
      setAppointments(updatedAppointments);

      const pending = updatedAppointments.filter((app: Appointment) => app.status === 0).length;
      const received = updatedAppointments.filter((app: Appointment) => app.status === 1).length;
      setStats({ ...stats, pending, received });

      message.success('Nhận lịch khám thành công!');
    } catch (error: any) {
      console.error('Lỗi khi nhận lịch:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi nhận lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChuyenKhoa = async () => {
    if (!selectedAppointmentId || !selectedKhoaId) {
      message.error('Vui lòng chọn khoa để chuyển');
      return;
    }

    try {
      setTransferLoading(true);
      await axios.put(`http://localhost:9999/api/letan/chuyen-khoa/${selectedAppointmentId}`, {
        khoa_id: parseInt(selectedKhoaId),
        ghi_chu: chuyenKhoaGhiChu,
      });

      const updatedAppointments = appointments.filter((appt) => appt.id !== selectedAppointmentId);
      setAppointments(updatedAppointments);

      const total = updatedAppointments.length;
      const pending = updatedAppointments.filter((app: Appointment) => app.status === 0).length;
      const received = updatedAppointments.filter((app: Appointment) => app.status === 1).length;
      setStats({ total, pending, received });

      message.success('Chuyển khoa thành công');
      setIsModalVisible(false);
      setSelectedKhoaId('');
      setChuyenKhoaGhiChu('');
      setSelectedAppointmentId(null);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Lỗi khi chuyển khoa:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi chuyển khoa. Vui lòng thử lại.');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleLuuKetLuan = async () => {
    if (!selectedAppointmentId || !ketQuaKham.trim()) {
      message.error('Vui lòng nhập kết luận khám');
      return;
    }

    try {
      setKetLuanLoading(true);
      await axios.put(`http://localhost:9999/api/letan/ket-luan/${selectedAppointmentId}`, {
        ket_qua_kham: ketQuaKham,
        bac_si_id: bacSiId,
      });

      const updatedAppointments = appointments.map((appt) =>
        appt.id === selectedAppointmentId ? { ...appt, ket_qua_kham: ketQuaKham } : appt
      );
      setAppointments(updatedAppointments);

      message.success('Lưu kết luận thành công');
      setIsKetLuanModalVisible(false);
      setKetQuaKham('');
      setSelectedAppointmentId(null);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Lỗi khi lưu kết luận:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi lưu kết luận. Vui lòng thử lại.');
    } finally {
      setKetLuanLoading(false);
    }
  };

  const handlePhanLoaiDieuTri = async () => {
    if (!selectedAppointmentId || !loaiDieuTri) {
      message.error('Vui lòng chọn loại điều trị');
      return;
    }

    try {
      setPhanLoaiLoading(true);
      await axios.put(`http://localhost:9999/api/letan/phan-loai-dieu-tri/${selectedAppointmentId}`, {
        loai_dieu_tri: loaiDieuTri,
        bac_si_id: bacSiId,
      });

      const updatedAppointments = appointments.map((appt) =>
        appt.id === selectedAppointmentId
          ? { ...appt, loai_dieu_tri: loaiDieuTri, is_admitted: false }
          : appt
      );
      setAppointments(updatedAppointments);

      message.success('Phân loại điều trị thành công');
      setIsPhanLoaiModalVisible(false);
      setLoaiDieuTri(null);
      setSelectedAppointmentId(null);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Lỗi khi phân loại điều trị:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi phân loại điều trị. Vui lòng thử lại.');
    } finally {
      setPhanLoaiLoading(false);
    }
  };

  const handleXepGiuong = async () => {
    if (!selectedAppointmentId || !selectedBedId) {
      message.error('Vui lòng chọn giường');
      return;
    }

    try {
      setXepGiuongLoading(true);
      const admissionResponse = await axios.post(`http://localhost:9999/api/letan/admissions`, {
        appointment_id: selectedAppointmentId,
        khach_hang_id: selectedAppointment?.khach_hang_id,
        bac_si_id: bacSiId,
        bed_id: selectedBedId,
      });
      const admissionId = admissionResponse.data.data?.id;

      if (!admissionId) {
        throw new Error('Không nhận được admission_id từ API admissions');
      }

      await axios.post(`http://localhost:9999/api/noitru/chi-phi-giuong`, {
        admission_id: admissionId,
        bed_id: selectedBedId,
        ngay: dayjs().format('YYYY-MM-DD'),
      });

      const updatedAppointments = appointments.map((appt) =>
        appt.id === selectedAppointmentId ? { ...appt, is_admitted: true } : appt
      );
      setAppointments(updatedAppointments);

      message.success('Xếp giường và ghi nhận chi phí giường thành công');
      setIsXepGiuongModalVisible(false);
      setSelectedBedId(null);
      setSelectedRoomId(null);
      setSelectedAppointmentId(null);
      setSelectedAppointment(null);

      const [roomsRes, bedsRes] = await Promise.all([
        axios.get(`http://localhost:9999/api/phongbenh/rooms?khoa_id=${khoaId}`),
        axios.get(`http://localhost:9999/api/phongbenh/beds?khoa_id=${khoaId}&trang_thai=trong`),
      ]);
      setRooms(roomsRes.data.map((room: any) => ({ id: room.id, ten_phong: room.ten_phong })));
      setBeds(bedsRes.data.map((bed: any) => ({ id: bed.id, room_id: bed.room_id, ma_giuong: bed.ma_giuong })));
    } catch (error: any) {
      console.error('Lỗi khi xếp giường hoặc ghi nhận chi phí giường:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi xếp giường hoặc ghi nhận chi phí giường. Vui lòng thử lại.');
    } finally {
      setXepGiuongLoading(false);
    }
  };

  const handleChiDinhThuoc = async (values: any) => {
    if (!selectedAppointmentId) {
      message.error('Không tìm thấy thông tin lịch hẹn. Vui lòng thử lại.');
      return;
    }

    try {
      setChiDinhThuocLoading(true);
      const prescriptions = values.prescriptions.map((prescription: any) => ({
        admission_id: null,
        appointment_id: selectedAppointmentId,
        kho_id: prescription.kho_id,
        so_luong: Number(prescription.so_luong),
        lieu_luong: prescription.lieu_luong,
        tan_suat: prescription.tan_suat,
        nguoi_chi_dinh_id: bacSiId,
      }));
      const response = await axios.post('http://localhost:9999/api/noitru/chi-dinh-thuoc', { prescriptions });
      console.log('Phản hồi API:', response.data);
      const updatedAppointments = appointments.map((appt) =>
        appt.id === selectedAppointmentId ? { ...appt, hasPrescription: true } : appt
      );
      setAppointments(updatedAppointments);
      setFilteredAppointments(updatedAppointments);

      message.success(response.data.message || 'Chỉ định thuốc thành công');
      setIsChiDinhThuocModalVisible(false);
      form.resetFields();

      setSelectedAppointmentId(null);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Lỗi đầy đủ:', error.response?.data || error.message);
      message.error(error.response?.data?.message || 'Có lỗi khi kê đơn thuốc. Vui lòng thử lại.');
    } finally {
      setChiDinhThuocLoading(false);
    }
  };

  const handleChiDinhXetNghiem = async (values: any) => {
    if (!selectedAppointmentId) {
      message.error('Không tìm thấy thông tin lịch hẹn. Vui lòng thử lại.');
      return;
    }

    try {
      setChiDinhXetNghiemLoading(true);
      const serviceRequests = values.tests.map((test: any) => ({
        appointment_id: selectedAppointmentId,
        service_id: test.service_id,
        khoa_id: khoaId,
        bac_si_id: bacSiId,
      }));

      await Promise.all(
        serviceRequests.map((request: any) =>
          axios.post('http://localhost:9999/api/dichvu/service-requests/create', request)
        )
      );

      const updatedAppointments = appointments.map((appt) =>
        appt.id === selectedAppointmentId ? { ...appt, hasTestRequest: true } : appt
      );
      setAppointments(updatedAppointments);
      setFilteredAppointments(updatedAppointments);

      message.success('Chỉ định xét nghiệm/thăm dò thành công');
      setIsChiDinhXetNghiemModalVisible(false);
      form.resetFields();
      setSelectedAppointmentId(null);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error('Lỗi khi yêu cầu xét nghiệm:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi chỉ định xét nghiệm/thăm dò. Vui lòng thử lại.');
    } finally {
      setChiDinhXetNghiemLoading(false);
    }
  };

  const showChuyenKhoaModal = (appointmentId: number) => {
    const appt = appointments.find((a) => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setIsModalVisible(true);
  };

  const showKetLuanModal = (appointmentId: number, currentKetQua: string | null) => {
    const appt = appointments.find((a) => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setKetQuaKham(currentKetQua || '');
    setIsKetLuanModalVisible(true);
  };

  const showPhanLoaiModal = (appointmentId: number) => {
    const appt = appointments.find((a) => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setLoaiDieuTri(appt?.loai_dieu_tri || null);
    setIsPhanLoaiModalVisible(true);
  };

  const showXepGiuongModal = (appointmentId: number) => {
    const appt = appointments.find((a) => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setIsXepGiuongModalVisible(true);
  };

  const showChiDinhThuocModal = (appointmentId: number) => {
    const appt = appointments.find((a) => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setIsChiDinhThuocModalVisible(true);
  };

  const showChiDinhXetNghiemModal = (appointmentId: number) => {
    const appt = appointments.find((a) => a.id === appointmentId) || null;
    setSelectedAppointment(appt);
    setSelectedAppointmentId(appointmentId);
    setIsChiDinhXetNghiemModalVisible(true);
  };

  const showDonThuocModal = async (appointmentId: number) => {
    try {
      setLoading(true);
      const appt = appointments.find((a) => a.id === appointmentId) || null;
      if (!appt) {
        message.error('Không tìm thấy lịch hẹn với ID: ' + appointmentId);
        return;
      }

      let khachHangData: KhachHang = {};
      try {
        const khachHangResponse = await axios.get(`http://localhost:9999/api/user/getthongtinbyId/${appt.khach_hang_id}`);
        const khachHangArray = khachHangResponse.data.data || khachHangResponse.data || [];
        khachHangData = Array.isArray(khachHangArray) && khachHangArray.length > 0 ? khachHangArray[0] : {};
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu khách hàng:', error);
        message.warning('Không thể lấy thông tin khách hàng. Một số thông tin có thể không hiển thị.');
      }

      const updatedAppt = {
        ...appt,
        gioi_tinh: khachHangData.gioi_tinh || 'N/A',
        ngay_sinh: khachHangData.ngay_sinh || undefined,
        dia_chi: khachHangData.dia_chi || 'N/A',
      };
      setSelectedAppointment(updatedAppt);
      setSelectedAppointmentId(appointmentId);

      const [donThuocResponse, costResponse] = await Promise.all([
        axios.get(`http://localhost:9999/api/noitru/chi-dinh-thuoc/null?appointment_id=${appointmentId}`),
        axios.get(`http://localhost:9999/api/noitru/chi-phi-ngoai-tru/${appointmentId}`)
      ]);

      const donThuocData = donThuocResponse.data.data
        ? Array.isArray(donThuocResponse.data.data)
          ? donThuocResponse.data.data
          : [donThuocResponse.data.data]
        : [];
      setDonThuocData(donThuocData);

      const { total_cost: totalCostValue, phi_kham: phiKhamValue } = costResponse.data.data || {};
      setTotalCost(totalCostValue !== undefined ? totalCostValue : 0);
      setPhiKham(phiKhamValue !== undefined ? phiKhamValue : 0);

      setIsDonThuocModalVisible(true);
    } catch (error: any) {
      console.error('Lỗi khi lấy đơn thuốc hoặc tổng chi phí:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi lấy danh sách đơn thuốc hoặc tổng tiền. Vui lòng thử lại.');
      setTotalCost(null);
      setPhiKham(null);
    } finally {
      setLoading(false);
    }
  };

  const formatKhachHangInfo = (selectedAppointment: any) => {
    const gioiTinh = selectedAppointment?.gioi_tinh
      ? selectedAppointment.gioi_tinh === 'male' ? 'nam' : selectedAppointment.gioi_tinh === 'female' ? 'nữ' : selectedAppointment.gioi_tinh
      : 'N/A';
    return {
      hoTen: selectedAppointment?.ho_ten || 'N/A',
      gioiTinh: gioiTinh,
      namSinh: selectedAppointment?.ngay_sinh
        ? dayjs(selectedAppointment.ngay_sinh).format('YYYY')
        : 'N/A',
      soDienThoai: selectedAppointment?.so_dien_thoai || 'N/A',
      diaChi: selectedAppointment?.dia_chi || 'N/A',
      ket_qua_kham: selectedAppointment?.ket_qua_kham || 'Chưa xác định',
    };
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedKhoaId('');
    setChuyenKhoaGhiChu('');
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const handleCancelKetLuan = () => {
    setIsKetLuanModalVisible(false);
    setKetQuaKham('');
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const handleCancelPhanLoai = () => {
    setIsPhanLoaiModalVisible(false);
    setLoaiDieuTri(null);
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const handleCancelXepGiuong = () => {
    setIsXepGiuongModalVisible(false);
    setSelectedBedId(null);
    setSelectedRoomId(null);
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const handleCancelChiDinhThuoc = () => {
    setIsChiDinhThuocModalVisible(false);
    form.resetFields();
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const handleCancelChiDinhXetNghiem = () => {
    setIsChiDinhXetNghiemModalVisible(false);
    form.resetFields();
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const getStatusTag = (status: number) => {
    if (status === 0) {
      return <Tag color="orange" icon={<ClockCircleOutlined />}>Chưa nhận</Tag>;
    }
    return <Tag color="green" icon={<CheckCircleOutlined />}>Đã nhận</Tag>;
  };

  const getInsuranceTag = (hasInsurance: boolean | null, insuranceNumber: string) => {
    if (hasInsurance) {
      return (
        <Tooltip title={insuranceNumber}>
          <Tag color="blue" icon={<InsuranceOutlined />}>
            {insuranceNumber || 'Có BHYT'}
          </Tag>
        </Tooltip>
      );
    }
    return <Tag color="default">Không có BHYT</Tag>;
  };

  const getLoaiDieuTriTag = (loai_dieu_tri: string | null) => {
    if (loai_dieu_tri === 'noi_tru') {
      return <Tag color="purple">Nội trú</Tag>;
    } else if (loai_dieu_tri === 'ngoai_tru') {
      return <Tag color="cyan">Ngoại trú</Tag>;
    }
    return <Tag color="default">Chưa quyết định</Tag>;
  };

  const generatePDF = () => {
    if (!selectedAppointment || !donThuocData.length || totalCost === null || phiKham === null) {
      message.error('Không thể tạo PDF - Thiếu thông tin cần thiết');
      return;
    }

    try {
      setPdfGenerating(true);
      const khachHangInfo = formatKhachHangInfo(selectedAppointment);
      const element = document.createElement('div');
      element.style.cssText = `
        width: 148mm;
        min-height: 210mm;
        padding: 15mm 10mm;
        font-family: 'Times New Roman', serif;
        background: white;
        margin: 0 auto;
        box-sizing: border-box;
        line-height: 1.5;
      `;

      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
            <div style="text-align: center;">
              <div style="font-size: 14px; font-weight: bold; text-transform: uppercase;">BỆNH VIỆN KHOÁI CHÂU</div>
              <div style="font-size: 16px; font-weight: bold; color: #0066cc; margin: 3px 0;">KHOA ${khoaName}</div>
            </div>
          </div>
          <div style="font-size: 18px; font-weight: bold; text-transform: uppercase; color: #cc0033;">ĐƠN THUỐC</div>
          <div style="font-size: 12px; font-style: italic;">(Kèm theo phiếu khám bệnh số: ${selectedAppointment.id || ''})</div>
        </div>
        <div style="margin-bottom: 15px; border: 1px solid #ddd; padding: 10px; font-size: 13px;">
          <div style="text-align: center; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; font-size: 14px;">Thông tin bệnh nhân</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; width: 50%;"><strong>Họ và tên:</strong> ${khachHangInfo.hoTen}</td>
              <td style="padding: 5px 0;"><strong>Giới tính:</strong> ${khachHangInfo.gioiTinh}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Năm sinh:</strong> ${khachHangInfo.namSinh}</td>
              <td style="padding: 5px 0;"><strong>SĐT:</strong> ${khachHangInfo.soDienThoai}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Địa chỉ:</strong> ${khachHangInfo.diaChi}</td>
              <td style="padding: 5px 0;"><strong>Ngày khám:</strong> ${dayjs().format('DD/MM/YYYY')}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 5px 0;"><strong>Chẩn đoán:</strong> ${khachHangInfo.ket_qua_kham}</td>
            </tr>
          </table>
        </div>
        <div style="margin-bottom: 15px;">
          <div style="text-align: center; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; font-size: 14px;">Đơn thuốc điều trị</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #ddd;">
            <thead>
              <tr style="background: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 8%;">STT</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 32%;">Tên thuốc</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 10%;">Đơn vị</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 10%;">Số lượng</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 40%;">Hướng dẫn sử dụng</th>
              </tr>
            </thead>
            <tbody>
              ${donThuocData.map((thuoc, index) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${thuoc.ten_thuoc}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${thuoc.don_vi}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${thuoc.so_luong}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">
                    <div><strong>Liều dùng:</strong> ${thuoc.lieu_luong}</div>
                    <div><strong>Cách dùng:</strong> ${thuoc.tan_suat}</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-bottom: 15px; font-size: 13px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; width: 70%; text-align: right;"><strong>Phí khám bệnh:</strong></td>
              <td style="padding: 5px 0; text-align: right;">${phiKham?.toLocaleString('vi-VN')} VNĐ</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; text-align: right;"><strong>Tiền thuốc:</strong></td>
              <td style="padding: 5px 0; text-align: right;">${(totalCost - phiKham)?.toLocaleString('vi-VN')} VNĐ</td>
            </tr>
            <tr style="font-weight: bold;">
              <td style="padding: 5px 0; text-align: right;"><strong>Tổng cộng:</strong></td>
              <td style="padding: 5px 0; text-align: right;">${totalCost?.toLocaleString('vi-VN')} VNĐ</td>
            </tr>
          </table>
        </div>
        <div style="margin-top: 20px;">
          <div style="margin-bottom: 15px; font-size: 12px; border: 1px solid #ddd; padding: 10px;">
            <div style="font-weight: bold; margin-bottom: 5px;">HƯỚNG DẪN SỬ DỤNG THUỐC:</div>
            <div>- Uống thuốc đúng liều lượng, đúng giờ theo chỉ định của bác sĩ</div>
            <div>- Không tự ý ngưng thuốc khi chưa hết liệu trình</div>
            <div>- Tái khám đúng hẹn hoặc khi có dấu hiệu bất thường</div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 30px;">
            <div style="text-align: center; width: 40%;">
              <div style="font-style: italic; margin-bottom: 30px;">Ngày ${dayjs().format('DD')} tháng ${dayjs().format('MM')} năm ${dayjs().format('YYYY')}</div>
              <div style="font-weight: bold;">BỆNH NHÂN/KHÁCH HÀNG</div>
              <div style="font-style: italic;">(Ký, ghi rõ họ tên)</div>
            </div>
            <div style="text-align: center; width: 40%;">
              <div style="font-style: italic; margin-bottom: 30px;">Ngày ${dayjs().format('DD')} tháng ${dayjs().format('MM')} năm ${dayjs().format('YYYY')}</div>
              <div style="font-weight: bold;">BÁC SĨ ĐIỀU TRỊ</div>
              <div style="font-style: italic;">(Ký, ghi rõ họ tên)</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
          <div>BỆNH VIỆN ĐA KHOA TỈNH - Địa chỉ: Số 123, Đường ABC, Thành phố XYZ</div>
          <div>Điện thoại: 0123.456.789 - Email: info@benhvienexample.com</div>
          <div style="font-style: italic;">"Chất lượng phục vụ - Tận tâm chăm sóc"</div>
        </div>
      `;

      document.body.appendChild(element);

      html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 148 * 3.779527559,
        height: 210 * 3.779527559,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const imgWidth = 148;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a5'
        });

        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

        const filename = `DonThuoc_${selectedAppointment.id}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
        doc.save(filename);

        message.success('Đơn thuốc đã được tải xuống thành công');
        document.body.removeChild(element);
      }).catch((error) => {
        console.error('Lỗi khi chụp canvas:', error);
        message.error('Không thể tạo hình ảnh. Vui lòng thử lại.');
        document.body.removeChild(element);
      });
    } catch (error) {
      console.error('Lỗi khi tạo PDF:', error);
      message.error('Không thể tạo PDF. Vui lòng thử lại.');
    } finally {
      setPdfGenerating(false);
    }
  };
  const generateTestRequestPDF = () => {
    if (!testRequests.length) {
      message.error('Không có dữ liệu xét nghiệm/thăm dò để in');
      return;
    }

    try {
      setPdfGenerating(true);
      const element = document.createElement('div');
      element.style.cssText = `
      width: 148mm;
      min-height: 210mm;
      padding: 15mm 10mm;
      font-family: 'Times New Roman', serif;
      background: white;
      margin: 0 auto;
      box-sizing: border-box;
      line-height: 1.5;
    `;

      element.innerHTML = `
      <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 5px;">
          <div style="text-align: center;">
            <div style="font-size: 14px; font-weight: bold; text-transform: uppercase;">BỆNH VIỆN KHOÁI CHÂU</div>
            <div style="font-size: 16px; font-weight: bold; color: #0066cc; margin: 3px 0;">KHOA ${khoaName}</div>
          </div>
        </div>
        <div style="font-size: 18px; font-weight: bold; text-transform: uppercase; color: #cc0033;">PHIẾU CHỈ ĐỊNH XÉT NGHIỆM/THĂM DÒ</div>
        <div style="font-size: 12px; font-style: italic;">(Kèm theo phiếu khám bệnh số: ${testRequests[0]?.appointment_id || ''})</div>
      </div>
      <div style="margin-bottom: 15px; border: 1px solid #ddd; padding: 10px; font-size: 13px;">
        <div style="text-align: center; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; font-size: 14px;">Thông tin bệnh nhân</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; width: 50%;"><strong>Họ và tên:</strong> ${selectedAppointment?.ho_ten || 'N/A'}</td>
            <td style="padding: 5px 0;"><strong>Giới tính:</strong> ${selectedAppointment?.gioi_tinh || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Năm sinh:</strong> ${selectedAppointment?.ngay_sinh ? dayjs(selectedAppointment.ngay_sinh).format('YYYY') : 'N/A'}</td>
            <td style="padding: 5px 0;"><strong>SĐT:</strong> ${selectedAppointment?.so_dien_thoai || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Địa chỉ:</strong> ${selectedAppointment?.dia_chi || 'N/A'}</td>
            <td style="padding: 5px 0;"><strong>Ngày chỉ định:</strong> ${dayjs().format('DD/MM/YYYY')}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 5px 0;"><strong>Chẩn đoán:</strong> ${selectedAppointment?.ket_qua_kham || 'Chưa xác định'}</td>
          </tr>
        </table>
      </div>
      <div style="margin-bottom: 15px;">
        <div style="text-align: center; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; font-size: 14px;">Danh sách xét nghiệm/thăm dò</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #ddd;">
          <thead>
            <tr style="background: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 8%;">STT</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 32%;">Tên xét nghiệm</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 10%;">Loại</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center; width: 15%;">Ngày chỉ định</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 20%;">Khoa</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 15%;">Người chỉ định</th>
            </tr>
          </thead>
          <tbody>
            ${testRequests.map((request, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${request.service_name || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${request.service_type || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${formatDate(request.created_at) || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${request.khoa_name || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${request.bac_si_name || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div style="margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; margin-top: 30px;">
          <div style="text-align: center; width: 40%;">
            <div style="font-style: italic; margin-bottom: 30px;">Ngày ${dayjs().format('DD')} tháng ${dayjs().format('MM')} năm ${dayjs().format('YYYY')}</div>
            <div style="font-weight: bold;">BỆNH NHÂN/KHÁCH HÀNG</div>
            <div style="font-style: italic;">(Ký, ghi rõ họ tên)</div>
          </div>
          <div style="text-align: center; width: 40%;">
            <div style="font-style: italic; margin-bottom: 30px;">Ngày ${dayjs().format('DD')} tháng ${dayjs().format('MM')} năm ${dayjs().format('YYYY')}</div>
            <div style="font-weight: bold;">BÁC SĨ ĐIỀU TRỊ</div>
            <div style="font-style: italic;">(Ký, ghi rõ họ tên)</div>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
        <div>BỆNH VIỆN ĐA KHOA TỈNH - Địa chỉ: Số 123, Đường ABC, Thành phố XYZ</div>
        <div>Điện thoại: 0123.456.789 - Email: info@benhvienexample.com</div>
        <div style="font-style: italic;">"Chất lượng phục vụ - Tận tâm chăm sóc"</div>
      </div>
    `;

      document.body.appendChild(element);

      html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 148 * 3.779527559,
        height: 210 * 3.779527559,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const imgWidth = 148;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a5'
        });

        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

        const filename = `PhieuChiDinhXetNghiem_${testRequests[0]?.appointment_id}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
        doc.save(filename);

        message.success('Phiếu chỉ định đã được tải xuống thành công');
        document.body.removeChild(element);
      }).catch((error) => {
        console.error('Lỗi khi chụp canvas:', error);
        message.error('Không thể tạo hình ảnh. Vui lòng thử lại.');
        document.body.removeChild(element);
      });
    } catch (error) {
      console.error('Lỗi khi tạo PDF:', error);
      message.error('Không thể tạo PDF. Vui lòng thử lại.');
    } finally {
      setPdfGenerating(false);
    }
  };
  const columns = [
    { title: 'Mã', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: 'Số thứ tự',
      dataIndex: 'so_thu_tu',
      key: 'so_thu_tu',
      width: 150,
      render: (so_thu_tu: string | null, record: Appointment) =>
        <Text>{so_thu_tu ? `${so_thu_tu.substring(0, 5)} (${so_thu_tu.substring(5)} - ${record.ho_ten})` : 'Chưa có'}</Text>,
    },
    {
      title: 'Thông tin bệnh nhân',
      key: 'patient',
      width: 250,
      render: (_: any, record: Appointment) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <Text strong>{record.ho_ten}</Text>
          </Space>
          <Space align="center">
            <PhoneOutlined style={{ color: '#1890ff' }} />
            <Text>{record.so_dien_thoai}</Text>
          </Space>
          {record.bao_hiem_y_te !== null && (
            <div style={{ marginTop: 4 }}>
              {getInsuranceTag(record.bao_hiem_y_te, record.so_bao_hiem_y_te)}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Triệu chứng',
      dataIndex: 'trieu_chung',
      key: 'trieu_chung',
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <Paragraph ellipsis={{ rows: 2 }}>{text}</Paragraph>
        </Tooltip>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {formatDate(date)}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: 'Kết luận',
      dataIndex: 'ket_qua_kham',
      key: 'ket_qua_kham',
      ellipsis: { showTitle: false },
      render: (ket_qua_kham: string | null) => (
        <Tooltip title={ket_qua_kham} placement="topLeft">
          <Paragraph ellipsis={{ rows: 2 }}>{ket_qua_kham || 'Chưa có'}</Paragraph>
        </Tooltip>
      ),
    },
    {
      title: 'Loại điều trị',
      dataIndex: 'loai_dieu_tri',
      key: 'loai_dieu_tri',
      width: 120,
      render: (loai_dieu_tri: string | null) => getLoaiDieuTriTag(loai_dieu_tri),
    },
    {
      title: 'Thanh toán',
      key: 'da_thanh_toan',
      width: 120,
      render: (_: any, record: Appointment) => {
        return record.da_thanh_toan === 1 ? (
          <Tag color="green">Đã thanh toán</Tag>
        ) : (
          <Tag color="red">Chưa thanh toán</Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 220,
      render: (_: any, record: Appointment) => (
        <Space size="small" wrap style={{ margin: 0, padding: 2 }}>
          {record.status === 0 && record.bac_si_id === null && (
            <Tooltip title="Nhận lịch">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                style={{ padding: 4 }}
                onClick={() => handleNhanLich(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 1 && record.bac_si_id === bacSiId && (
            <>
              {!record.ket_qua_kham && (
                <Tooltip title="Kết luận">
                  <Button
                    type="default"
                    icon={<FileTextOutlined />}
                    size="small"
                    style={{ padding: 4 }}
                    onClick={() => showKetLuanModal(record.id, record.ket_qua_kham)}
                  />
                </Tooltip>
              )}
              {record.ket_qua_kham && record.loai_dieu_tri === 'chua_quyet_dinh' && (
                <Tooltip title="Phân loại">
                  <Button
                    type="default"
                    icon={<SolutionOutlined />}
                    size="small"
                    style={{ padding: 4 }}
                    onClick={() => showPhanLoaiModal(record.id)}
                  />
                </Tooltip>
              )}
              {record.ket_qua_kham && !record.hasTestRequest && (
                <Tooltip title="Chỉ định xét nghiệm/thăm dò">
                  <Button
                    type="default"
                    icon={<ExperimentOutlined />}
                    size="small"
                    style={{ padding: 4 }}
                    onClick={() => showChiDinhXetNghiemModal(record.id)}
                  />
                </Tooltip>
              )}
              {record.ket_qua_kham && record.hasTestRequest && (
                <Tooltip title="Xem các xét nghiệm đã chỉ định">
                  <Button
                    type="default"
                    icon={<FileSearchOutlined />}
                    size="small"
                    style={{ padding: 4 }}
                    onClick={() => fetchTestRequests(record.id)}
                  />
                </Tooltip>
              )}
              {record.loai_dieu_tri === 'ngoai_tru' && !record.hasPrescription && (
                <Tooltip title="Kê đơn thuốc">
                  <Button
                    type="default"
                    icon={<PlusCircleOutlined />}
                    size="small"
                    style={{ padding: 4 }}
                    onClick={() => showChiDinhThuocModal(record.id)}
                  />
                </Tooltip>
              )}
              {record.loai_dieu_tri === 'ngoai_tru' && record.hasPrescription && (
                <Tooltip title="Xem các thuốc đã kê">
                  <Button
                    type="default"
                    icon={<FileSearchOutlined />}
                    size="small"
                    style={{ padding: 4 }}
                    onClick={() => showDonThuocModal(record.id)}
                  />
                </Tooltip>
              )}
              {record.loai_dieu_tri === 'noi_tru' && !record.is_admitted && (
                <Tooltip title="Xếp giường">
                  <Button
                    type="default"
                    icon={<MedicineBoxOutlined />}
                    size="small"
                    style={{ padding: 4 }}
                    onClick={() => showXepGiuongModal(record.id)}
                  />
                </Tooltip>
              )}
              <Tooltip title="Chuyển khoa">
                <Button
                  type="default"
                  icon={<SwapOutlined />}
                  size="small"
                  style={{ padding: 4 }}
                  onClick={() => showChuyenKhoaModal(record.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const DonThuocModal = (
    <Modal
      title={
        <Space>
          <FileSearchOutlined style={{ color: '#1890ff' }} />
          <span>Xem các thuốc đã kê + giá tiền</span>
        </Space>
      }
      open={isDonThuocModalVisible}
      onCancel={() => {
        setIsDonThuocModalVisible(false);
        setTotalCost(null);
        setPhiKham(null);
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            setIsDonThuocModalVisible(false);
            setTotalCost(null);
            setPhiKham(null);
          }}
        >
          Đóng
        </Button>,
        <Button
          key="print"
          type="primary"
          onClick={generatePDF}
          loading={pdfGenerating}
        >
          In PDF
        </Button>,
      ]}
      width={800}
    >
      <Spin spinning={loading}>
        {donThuocData.length === 0 ? (
          <Empty description="Không có đơn thuốc nào" />
        ) : (
          <>
            <Table
              columns={[
                { title: 'Tên thuốc', dataIndex: 'ten_thuoc', key: 'ten_thuoc' },
                { title: 'Đơn vị', dataIndex: 'don_vi', key: 'don_vi' },
                { title: 'Số lượng', dataIndex: 'so_luong', key: 'so_luong' },
                { title: 'Liều lượng', dataIndex: 'lieu_luong', key: 'lieu_luong' },
                { title: 'Tần suất', dataIndex: 'tan_suat', key: 'tan_suat' },
                { title: 'Ngày chỉ định', dataIndex: 'ngay_chi_dinh', key: 'ngay_chi_dinh' },
                { title: 'Người chỉ định', dataIndex: 'nguoi_chi_dinh', key: 'nguoi_chi_dinh' },
              ]}
              dataSource={donThuocData}
              rowKey="id"
              pagination={false}
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Row gutter={16} justify="end">
                <Col>
                  {phiKham !== null ? (
                    <Statistic
                      title="Phí khám"
                      value={phiKham}
                      suffix="VNĐ"
                      valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
                    />
                  ) : (
                    <Text type="danger">Không thể tải phí khám. Vui lòng thử lại.</Text>
                  )}
                </Col>
                <Col>
                  {totalCost !== null ? (
                    <Statistic
                      title="Tổng tiền phải trả"
                      value={totalCost}
                      suffix="VNĐ"
                      valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                    />
                  ) : (
                    <Text type="danger">Không thể tải tổng tiền. Vui lòng thử lại.</Text>
                  )}
                </Col>
              </Row>
            </div>
          </>
        )}
      </Spin>
    </Modal>
  );
  const TestRequestsModal = (
    <Modal
      title={
        <Space>
          <FileSearchOutlined style={{ color: '#1890ff' }} />
          <span>Xem các xét nghiệm/thăm dò đã chỉ định</span>
        </Space>
      }
      open={isTestRequestsModalVisible}
      onCancel={() => setIsTestRequestsModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setIsTestRequestsModalVisible(false)}>
          Đóng
        </Button>,
        <Button
          key="print"
          type="primary"
          onClick={generateTestRequestPDF}
          loading={pdfGenerating}
        >
          In PDF
        </Button>,
      ]}
      width={1200}
    >
      <Spin spinning={loading}>
        {testRequests.length === 0 ? (
          <Empty description="Không có xét nghiệm/thăm dò nào" />
        ) : (
          <Table
            columns={[
              {
                title: 'Tên xét nghiệm',
                dataIndex: 'service_name',
                key: 'service_name',
                render: (text: string) => text || 'N/A'
              },
              {
                title: 'Loại',
                dataIndex: 'service_type',
                key: 'service_type',
                render: (text: string) => text || 'N/A'
              },
              {
                title: 'Ngày chỉ định',
                dataIndex: 'created_at',
                key: 'created_at',
                render: (date: string) => formatDate(date) || 'N/A'
              },
              {
                title: 'Khoa',
                dataIndex: 'khoa_name',
                key: 'khoa_name',
                render: (text: string) => text || 'N/A'
              },
              {
                title: 'Người chỉ định',
                dataIndex: 'bac_si_name',
                key: 'bac_si_name',
                render: (text: string) => text || 'N/A'
              },
               {
                title: 'Kết quả',
                dataIndex: 'result_text',
                key: 'result_text',
                render: (text: string) => text || 'N/A'
              },

              {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                  <Tag color={status === 'pending' ? 'orange' : 'green'}>
                    {status === 'pending' ? 'Chờ xử lý' : status}
                  </Tag>
                )
              },
            ]}
            dataSource={testRequests}
            rowKey="id"
            pagination={false}
            bordered
          />
        )}
      </Spin>
    </Modal>
  );


  const ChiDinhXetNghiemModal = (
    <Modal
      title={
        <Space>
          <ExperimentOutlined style={{ color: '#1890ff' }} />
          <span>Chỉ định xét nghiệm/thăm dò</span>
        </Space>
      }
      open={isChiDinhXetNghiemModalVisible}
      onOk={() => form.submit()}
      onCancel={handleCancelChiDinhXetNghiem}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={chiDinhXetNghiemLoading}
      width={1000}
    >
      {selectedAppointment && (
        <>
          <Card bordered={false} style={{ marginBottom: 16 }}>
            <Space align="start">
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div>
                <Title level={4}>{selectedAppointment.ho_ten}</Title>
                <Space direction="vertical" size={2}>
                  <Text type="secondary">
                    <PhoneOutlined /> {selectedAppointment.so_dien_thoai}
                  </Text>
                  <Text type="secondary">
                    <InfoCircleOutlined /> {selectedAppointment.trieu_chung}
                  </Text>
                  <Text type="secondary">
                    <FileTextOutlined /> Kết luận: {selectedAppointment.ket_qua_kham}
                  </Text>
                </Space>
              </div>
            </Space>
          </Card>
        </>
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleChiDinhXetNghiem}
        onFinishFailed={(errorInfo) => {
          console.log('Xác thực biểu mẫu thất bại:', errorInfo);
        }}
      >
        <Form.List name="tests">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <div key={field.key} style={{ marginBottom: 24, padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                  <Row gutter={[24, 16]} align="middle">
                    <Col span={12}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'service_id']}
                        fieldKey={[field.fieldKey || 0, 'service_id']}
                        label="Chọn xét nghiệm/thăm dò"
                        rules={[{ required: true, message: 'Vui lòng chọn xét nghiệm/thăm dò!' }]}
                        style={{ marginBottom: 0, marginRight: '16px' }}
                      >
                        <Select placeholder="Chọn xét nghiệm/thăm dò" size="large">
                          {services.map((service) => (
                            <Option key={service.id} value={service.id}>
                              {service.ten}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12} style={{ textAlign: 'center' }}>
                      <Button
                        type="link"
                        danger
                        onClick={() => remove(field.name)}
                        icon={<DeleteOutlined />}
                        style={{ marginTop: 24 }}
                      >
                        Xóa
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />} size="large">
                  Thêm xét nghiệm/thăm dò
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );

  const ChiDinhThuocModal = (
    <Modal
      title={
        <Space>
          <PlusCircleOutlined style={{ color: '#1890ff' }} />
          <span>Chỉ định thuốc</span>
        </Space>
      }
      open={isChiDinhThuocModalVisible}
      onOk={() => form.submit()}
      onCancel={handleCancelChiDinhThuoc}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={chiDinhThuocLoading}
      width={1000}
    >
      {selectedAppointment && (
        <>
          <Card bordered={false} style={{ marginBottom: 16 }}>
            <Space align="start">
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div>
                <Title level={4}>{selectedAppointment.ho_ten}</Title>
                <Space direction="vertical" size={2}>
                  <Text type="secondary">
                    <PhoneOutlined /> {selectedAppointment.so_dien_thoai}
                  </Text>
                  <Text type="secondary">
                    <InfoCircleOutlined /> {selectedAppointment.trieu_chung}
                  </Text>
                  <Text type="secondary">
                    <FileTextOutlined /> Kết luận: {selectedAppointment.ket_qua_kham}
                  </Text>
                </Space>
              </div>
            </Space>
          </Card>
        </>
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleChiDinhThuoc}
        onFinishFailed={(errorInfo) => {
          console.log('Xác thực biểu mẫu thất bại:', errorInfo);
        }}
      >
        <Form.List name="prescriptions">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <div key={field.key} style={{ marginBottom: 24, padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                  <Row gutter={[24, 16]} align="middle">
                    <Col span={6}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'kho_id']}
                        fieldKey={[field.fieldKey || 0, 'kho_id']}
                        label="Tên thuốc"
                        rules={[{ required: true, message: 'Vui lòng chọn thuốc!' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Select placeholder="Chọn thuốc" size="large">
                          {khoList.map((kho) => (
                            <Option key={kho.kho_id} value={kho.kho_id}>
                              {kho.ten_san_pham} ({kho.don_vi_tinh})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'so_luong']}
                        fieldKey={[field.fieldKey || 0, 'so_luong']}
                        label="Số lượng"
                        rules={[
                          { required: true, message: 'Vui lòng nhập số lượng!' },
                          { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' },
                        ]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber
                          placeholder="Số lượng"
                          size="large"
                          min={1}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'lieu_luong']}
                        fieldKey={[field.fieldKey || 0, 'lieu_luong']}
                        label="Liều lượng"
                        rules={[{ required: true, message: 'Vui lòng nhập liều lượng!' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Ví dụ: 1 viên" size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'tan_suat']}
                        fieldKey={[field.fieldKey || 0, 'tan_suat']}
                        label="Tần suất"
                        rules={[{ required: true, message: 'Vui lòng nhập tần suất!' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Ví dụ: 2 lần/ngày" size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={2} style={{ textAlign: 'center' }}>
                      <Button
                        type="link"
                        danger
                        onClick={() => remove(field.name)}
                        icon={<DeleteOutlined />}
                        style={{ marginTop: 24 }}
                      >
                        Xóa
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />} size="large">
                  Thêm thuốc
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );

  const PhanLoaiModal = (
    <Modal
      title={
        <Space>
          <SolutionOutlined style={{ color: '#1890ff' }} />
          <span>Phân loại điều trị</span>
        </Space>
      }
      open={isPhanLoaiModalVisible}
      onOk={handlePhanLoaiDieuTri}
      onCancel={handleCancelPhanLoai}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={phanLoaiLoading}
      width={600}
    >
      {selectedAppointment && (
        <>
          <Card bordered={false} style={{ marginBottom: 16 }}>
            <Space align="start">
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div>
                <Title level={4}>{selectedAppointment.ho_ten}</Title>
                <Space direction="vertical" size={2}>
                  <Text type="secondary">
                    <PhoneOutlined /> {selectedAppointment.so_dien_thoai}
                  </Text>
                  <Text type="secondary">
                    <InfoCircleOutlined /> {selectedAppointment.trieu_chung}
                  </Text>
                  <Text type="secondary">
                    <FileTextOutlined /> Kết luận: {selectedAppointment.ket_qua_kham}
                  </Text>
                </Space>
              </div>
            </Space>
          </Card>
        </>
      )}
      <Form layout="vertical">
        <Form.Item
          label="Loại điều trị"
          required
          validateStatus={!loaiDieuTri && isPhanLoaiModalVisible ? 'error' : ''}
          help={!loaiDieuTri && isPhanLoaiModalVisible ? 'Vui lòng chọn loại điều trị' : ''}
        >
          <Radio.Group
            value={loaiDieuTri}
            onChange={(e) => setLoaiDieuTri(e.target.value)}
          >
            <Radio value="noi_tru">Nội trú</Radio>
            <Radio value="ngoai_tru">Ngoại trú</Radio>
            <Radio value="chua_quyet_dinh">Chưa quyết định</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );

  const KetLuanModal = (
    <Modal
      title={
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span>Nhập kết luận khám</span>
        </Space>
      }
      open={isKetLuanModalVisible}
      onOk={handleLuuKetLuan}
      onCancel={handleCancelKetLuan}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={ketLuanLoading}
      width={600}
    >
      {selectedAppointment && (
        <>
          <Card bordered={false} style={{ marginBottom: 16 }}>
            <Space align="start">
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div>
                <Title level={4}>{selectedAppointment.ho_ten}</Title>
                <Space direction="vertical" size={2}>
                  <Text type="secondary">
                    <PhoneOutlined /> {selectedAppointment.so_dien_thoai}
                  </Text>
                  <Text type="secondary">
                    <InfoCircleOutlined /> {selectedAppointment.trieu_chung}
                  </Text>
                </Space>
              </div>
            </Space>
          </Card>
        </>
      )}
      <Form layout="vertical">
        <Form.Item
          label="Kết luận khám"
          required
          validateStatus={!ketQuaKham && isKetLuanModalVisible ? 'error' : ''}
          help={!ketQuaKham && isKetLuanModalVisible ? 'Vui lòng nhập kết luận khám' : ''}
        >
          <TextArea
            rows={4}
            value={ketQuaKham}
            onChange={(e) => setKetQuaKham(e.target.value)}
            placeholder="Nhập kết luận khám (ví dụ: Viêm phổi cấp, cần điều trị nội trú)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );

  const XepGiuongModal = (
    <Modal
      title={
        <Space>
          <MedicineBoxOutlined style={{ color: '#1890ff' }} />
          <span>Xếp giường cho bệnh nhân</span>
        </Space>
      }
      open={isXepGiuongModalVisible}
      onOk={handleXepGiuong}
      onCancel={handleCancelXepGiuong}
      okText="Xác nhận"
      cancelText="Hủy"
      confirmLoading={xepGiuongLoading}
      width={600}
    >
      {selectedAppointment && (
        <>
          <Card bordered={false} style={{ marginBottom: 16 }}>
            <Space align="start">
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <div>
                <Title level={4}>{selectedAppointment.ho_ten}</Title>
                <Space direction="vertical" size={2}>
                  <Text type="secondary">
                    <PhoneOutlined /> {selectedAppointment.so_dien_thoai}
                  </Text>
                  <Text type="secondary">
                    <InfoCircleOutlined /> {selectedAppointment.trieu_chung}
                  </Text>
                  <Text type="secondary">
                    <FileTextOutlined /> Kết luận: {selectedAppointment.ket_qua_kham}
                  </Text>
                </Space>
              </div>
            </Space>
          </Card>
        </>
      )}
      <Form layout="vertical">
        <Form.Item
          label="Chọn phòng"
          required
          validateStatus={!selectedRoomId && isXepGiuongModalVisible ? 'error' : ''}
          help={!selectedRoomId && isXepGiuongModalVisible ? 'Vui lòng chọn phòng' : ''}
        >
          <Select
            placeholder="Chọn phòng"
            value={selectedRoomId}
            onChange={(value) => setSelectedRoomId(value)}
            style={{ width: '100%' }}
            size="large"
            showSearch
            optionFilterProp="children"
          >
            {rooms.map((room) => (
              <Option key={room.id} value={room.id}>
                {room.ten_phong}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Chọn giường"
          required
          validateStatus={!selectedBedId && isXepGiuongModalVisible ? 'error' : ''}
          help={!selectedBedId && isXepGiuongModalVisible ? 'Vui lòng chọn giường' : ''}
        >
          <Select
            placeholder="Chọn giường"
            value={selectedBedId}
            onChange={(value) => setSelectedBedId(value)}
            style={{ width: '100%' }}
            size="large"
            showSearch
            optionFilterProp="children"
            disabled={!selectedRoomId}
          >
            {beds
              .filter((bed) => bed.room_id === selectedRoomId)
              .map((bed) => (
                <Option key={bed.id} value={bed.id}>
                  {bed.ma_giuong}
                </Option>
              ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <div className="appointment-manager" style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            <Breadcrumb>
              <Breadcrumb.Item>
                <HomeOutlined />
              </Breadcrumb.Item>
              <Breadcrumb.Item>Quản lý khám bệnh</Breadcrumb.Item>
              <Breadcrumb.Item>{khoaName}</Breadcrumb.Item>
            </Breadcrumb>
            <Title level={2} style={{ margin: '16px 0' }}>
              <MedicineBoxOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Quản lý khám bệnh - Khoa {khoaName}
            </Title>
          </Card>
        </Col>
        <Col span={24}>
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Tổng số lịch hẹn"
                  value={stats.total}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Chưa nhận"
                  value={stats.pending}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Đã nhận"
                  value={stats.received}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Card>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Input
                  placeholder="Tìm kiếm theo tên bệnh nhân hoặc số điện thoại"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                />
              </Col>
              <Col span={8}>
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date || dayjs())}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  size="large"
                  style={{ width: '100%' }}
                  allowClear={false}
                />
              </Col>
              <Col span={8}>
                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  <Option value="pending">Chưa nhận</Option>
                  <Option value="received">Đã nhận</Option>
                </Select>
              </Col>
            </Row>

            <Tabs activeKey={activeTabKey} onChange={handleTabChange} type="card">
              <TabPane
                tab={
                  <span>
                    <BellOutlined /> Tất cả ({stats.total})
                  </span>
                }
                key="all"
              />
              <TabPane
                tab={
                  <span>
                    <ClockCircleOutlined /> Chưa nhận ({stats.pending})
                  </span>
                }
                key="pending"
              />
              <TabPane
                tab={
                  <span>
                    <CheckCircleOutlined /> Đã nhận ({stats.received})
                  </span>
                }
                key="received"
              />
            </Tabs>

            <Table
              columns={columns}
              dataSource={filteredAppointments}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => `Tổng cộng ${total} lịch hẹn`,
              }}
              scroll={{ x: 1500 }}
              locale={{
                emptyText: (
                  <Empty
                    description="Không có lịch hẹn nào trong khoa cho ngày hiện tại"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal Chuyển Khoa */}
      <Modal
        title={
          <Space>
            <SwapOutlined style={{ color: '#1890ff' }} />
            <span>Chuyển khoa</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleChuyenKhoa}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={transferLoading}
        width={600}
      >
        {selectedAppointment && (
          <>
            <Card bordered={false} style={{ marginBottom: 16 }}>
              <Space align="start">
                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <div>
                  <Title level={4}>{selectedAppointment.ho_ten}</Title>
                  <Space direction="vertical" size={2}>
                    <Text type="secondary">
                      <PhoneOutlined /> {selectedAppointment.so_dien_thoai}
                    </Text>
                    <Text type="secondary">
                      <InfoCircleOutlined /> {selectedAppointment.trieu_chung}
                    </Text>
                    <Text type="secondary">
                      <FileTextOutlined /> Kết luận: {selectedAppointment.ket_qua_kham || 'Chưa có'}
                    </Text>
                  </Space>
                </div>
              </Space>
            </Card>
          </>
        )}
        <Form layout="vertical">
          <Form.Item
            label="Chọn khoa để chuyển"
            required
            validateStatus={!selectedKhoaId && isModalVisible ? 'error' : ''}
            help={!selectedKhoaId && isModalVisible ? 'Vui lòng chọn khoa để chuyển' : ''}
          >
            <Select
              value={selectedKhoaId}
              onChange={(value) => setSelectedKhoaId(value)}
              placeholder="Chọn khoa"
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Ghi chú chuyển khoa (nếu có)">
            <TextArea
              rows={3}
              value={chuyenKhoaGhiChu}
              onChange={(e) => setChuyenKhoaGhiChu(e.target.value)}
              placeholder="Nhập ghi chú (nếu có)"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Các modal khác */}
      {KetLuanModal}
      {PhanLoaiModal}
      {XepGiuongModal}
      {ChiDinhThuocModal}
      {ChiDinhXetNghiemModal}
      {DonThuocModal}
      {TestRequestsModal}
    </div>
  );
};

export default Quanlykhambenh;