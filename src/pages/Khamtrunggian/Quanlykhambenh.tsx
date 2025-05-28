import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
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
  // Thêm các trường khác nếu cần, dựa trên cấu trúc dữ liệu từ API
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
  const [activeTabKey, setActiveTabKey] = useState<string>('all');
  const [donThuocData, setDonThuocData] = useState<ChiDinhThuoc[]>([]);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [phiKham, setPhiKham] = useState<number | null>(null);
  const [khoaName, setKhoaName] = useState<string>('Không có khoa');
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
          console.error('Error fetching khoa name:', error);
          setKhoaName('Không có khoa');
          message.error('Không thể lấy thông tin khoa. Vui lòng thử lại sau.');
        }
      } else {
        setKhoaName('Không có khoa');
      }
    };

    fetchKhoaName();
  }, [khoaId]);

  const checkHasPrescription = async (appointmentId: number): Promise<boolean> => {
    try {
      const response = await axios.get(`http://localhost:9999/api/noitru/chi-dinh-thuoc/null?appointment_id=${appointmentId}`);
      const data = response.data.data;
      return Array.isArray(data) ? data.length > 0 : !!data;
    } catch (error) {
      console.error(`Error checking prescription for appointment ${appointmentId}:`, error);
      return false;
    }
  };

  const fetchData = async (date: dayjs.Dayjs | null) => {
    try {
      setLoading(true);
      const currentDate = date ? date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      const [appointmentsRes, departmentsRes, roomsRes, bedsRes, khoRes] = await Promise.all([
        axios.get(`http://localhost:9999/api/letan/appointments?khoa_id=${khoaId}&date=${currentDate}`),
        axios.get('http://localhost:9999/api/khoa/getall'),
        axios.get(`http://localhost:9999/api/phongbenh/rooms?khoa_id=${khoaId}`),
        axios.get(`http://localhost:9999/api/phongbenh/beds?khoa_id=${khoaId}&trang_thai=trong`),
        axios.get(`http://localhost:9999/api/noitru/kho`),
      ]);

      const appointmentsData = appointmentsRes.data.data || [];
      console.log(`Appointments data from /api/letan/appointments for ${currentDate}:`, appointmentsData);

      const uniqueAppointmentsData = Array.from(
        new Map(appointmentsData.map((appt: Appointment) => [appt.id, appt])).values()
      );

      const prescriptionChecks = await Promise.all(
        uniqueAppointmentsData.map((appt: any) => checkHasPrescription(appt.id).catch(() => false))
      );

      const data = uniqueAppointmentsData.map((appt: any, index: number) => ({
        ...appt,
        bac_si_id: appt.bac_si_id === null ? null : appt.bac_si_id,
        status: Number(appt.status),
        ket_qua_kham: appt.ket_qua_kham || null,
        chuyen_khoa_ghi_chu: appt.chuyen_khoa_ghi_chu || null,
        loai_dieu_tri: appt.loai_dieu_tri || 'chua_quyet_dinh',
        is_admitted: !!appt.is_admitted,
        hasPrescription: prescriptionChecks[index] ?? false,
        da_thanh_toan: appt.da_thanh_toan !== undefined ? Number(appt.da_thanh_toan) : 0,
        so_thu_tu: appt.so_thu_tu || null,
      }));

      const filteredData = data.filter((appt) =>
        dayjs(appt.created_at).format('YYYY-MM-DD') === currentDate
      );
      console.log(`Appointments with payment status after fetchData for ${currentDate}:`, filteredData);

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

      if (filteredData.length === 0) {
        message.info('Không có lịch hẹn nào trong khoa cho ngày hiện tại');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
        const isMatch = apptDate === dateStr;
        if (!isMatch) {
          console.log(`Filtered out appointment ID ${appt.id} with date ${apptDate}, does not match selected date ${dateStr}`);
        }
        return isMatch;
      });
    }

    const uniqueFiltered = Array.from(
      new Map(filtered.map((appt) => [appt.id, appt])).values()
    );

    console.log(`Final filtered appointments for date ${selectedDate?.format('YYYY-MM-DD')}:`, uniqueFiltered);
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
      console.error('Error accepting appointment:', error);
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
      console.error('Error transferring department:', error);
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
      console.error('Error saving conclusion:', error);
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
      console.error('Error classifying treatment:', error);
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
      console.error('Error assigning bed or recording bed cost:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi xếp giường hoặc ghi nhận chi phí giường. Vui lòng thử lại.');
    } finally {
      setXepGiuongLoading(false);
    }
  };

  const handleChiDinhThuoc = async (values: any) => {
    console.log('handleChiDinhThuoc triggered with values:', values);
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
      console.log('Calling API /api/noitru/chi-dinh-thuoc with data:', { prescriptions });
      const response = await axios.post('http://localhost:9999/api/noitru/chi-dinh-thuoc', { prescriptions });
      console.log('API response:', response.data);

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
      console.error('Error prescribing medicine:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi kê đơn thuốc. Vui lòng thử lại.');
    } finally {
      setChiDinhThuocLoading(false);
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


const showDonThuocModal = async (appointmentId: number) => {
  try {
    setLoading(true);
    console.log('Appointments list:', appointments);
    console.log('Selected appointment ID:', appointmentId);

    const appt = appointments.find((a) => a.id === appointmentId) || null;
    if (!appt) {
      message.error('Không tìm thấy lịch hẹn với ID: ' + appointmentId);
      return;
    }

    // Lấy thông tin khách hàng từ API
    let khachHangData: KhachHang = {};
    try {
      const khachHangResponse = await axios.get(`http://localhost:9999/api/user/getthongtinbyId/${appt.khach_hang_id}`);
      // Dữ liệu trả về là một mảng, lấy phần tử đầu tiên nếu tồn tại
      const khachHangArray = khachHangResponse.data.data || khachHangResponse.data || [];
      khachHangData = Array.isArray(khachHangArray) && khachHangArray.length > 0 ? khachHangArray[0] : {};
      console.log('Khach hang data from /api/user/getthongtinbyId:', khachHangData);
    } catch (error) {
      console.error('Error fetching khach hang data:', error);
      message.warning('Không thể lấy thông tin khách hàng. Một số thông tin có thể không hiển thị.');
    }

    // Kết hợp thông tin từ Appointment và thông tin khách hàng
    const updatedAppt = {
      ...appt,
      // Chỉ lấy thông tin từ khachHangData, không cần fallback về appt vì appt không có các trường này
      gioi_tinh: khachHangData.gioi_tinh || 'N/A',
      ngay_sinh: khachHangData.ngay_sinh || undefined,
      dia_chi: khachHangData.dia_chi || 'N/A',
    };
    console.log('Updated appointment with khach hang data:', updatedAppt);
    setSelectedAppointment(updatedAppt);
    setSelectedAppointmentId(appointmentId);
    console.log('Selected appointment with khach hang data:', updatedAppt);

    // Gọi API lấy đơn thuốc song song với việc lấy chi phí để tối ưu performance
    const [donThuocResponse, costResponse] = await Promise.all([
      axios.get(`http://localhost:9999/api/noitru/chi-dinh-thuoc/null?appointment_id=${appointmentId}`),
      axios.get(`http://localhost:9999/api/noitru/chi-phi-ngoai-tru/${appointmentId}`)
    ]);

    // Xử lý dữ liệu đơn thuốc
    const donThuocData = donThuocResponse.data.data
      ? Array.isArray(donThuocResponse.data.data)
        ? donThuocResponse.data.data
        : [donThuocResponse.data.data]
      : [];
    setDonThuocData(donThuocData);

    // Xử lý dữ liệu chi phí
    const { total_cost: totalCostValue, phi_kham: phiKhamValue } = costResponse.data.data || {};
    setTotalCost(totalCostValue !== undefined ? totalCostValue : 0);
    setPhiKham(phiKhamValue !== undefined ? phiKhamValue : 0);
    
    setIsDonThuocModalVisible(true);
  } catch (error: any) {
    console.error('Error fetching don thuoc or total cost:', error);
    message.error(error.response?.data?.message || 'Có lỗi khi lấy danh sách đơn thuốc hoặc tổng tiền. Vui lòng thử lại.');
    setTotalCost(null);
    setPhiKham(null);
  } finally {
    setLoading(false);
  }
};

// Hàm helper để format thông tin khách hàng một cách an toàn
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
  console.log('selectedAppointment:', selectedAppointment);
  console.log('donThuocData:', donThuocData);
  console.log('totalCost:', totalCost);
  console.log('phiKham:', phiKham);

  if (!selectedAppointment || !donThuocData.length || totalCost === null || phiKham === null) {
    message.error('Không thể tạo PDF - Thiếu thông tin cần thiết');
    return;
  }

  try {
    setPdfGenerating(true);

    // Format thông tin khách hàng
    const khachHangInfo = formatKhachHangInfo(selectedAppointment);

    // Tạo phần tử HTML tạm thời với thiết kế phù hợp A5
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
      <!-- Header bệnh viện -->
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

      <!-- Thông tin bệnh nhân -->
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

      <!-- Danh sách thuốc -->
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

      <!-- Chi phí -->
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

      <!-- Hướng dẫn và ký tên -->
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

      <!-- Footer -->
      <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
        <div>BỆNH VIỆN ĐA KHOA TỈNH - Địa chỉ: Số 123, Đường ABC, Thành phố XYZ</div>
        <div>Điện thoại: 0123.456.789 - Email: info@benhvienexample.com</div>
        <div style="font-style: italic;">"Chất lượng phục vụ - Tận tâm chăm sóc"</div>
      </div>
    `;
    
    document.body.appendChild(element);

    // Chụp ảnh bằng html2canvas với cấu hình phù hợp A5
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 148 * 3.779527559, // Convert mm to pixels (148mm)
      height: 210 * 3.779527559, // Convert mm to pixels (210mm)
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = 148; // Chiều rộng hình ảnh trong PDF (mm)
      const imgHeight = canvas.height * imgWidth / canvas.width; // Tính chiều cao tự động

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
        console.log(`Rendering payment status for appointment ${record.id}:`, record.da_thanh_toan);
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
      width: 350,
      render: (_: any, record: Appointment) => (
        <Space>
          {record.status === 0 && record.bac_si_id === null && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              size="middle"
              onClick={() => handleNhanLich(record.id)}
            >
              Nhận lịch
            </Button>
          )}
          {record.status === 1 && record.bac_si_id === bacSiId && (
            <>
              {!record.ket_qua_kham && (
                <Button
                  type="default"
                  icon={<FileTextOutlined />}
                  size="middle"
                  onClick={() => showKetLuanModal(record.id, record.ket_qua_kham)}
                >
                  Kết luận
                </Button>
              )}
              {record.ket_qua_kham && record.loai_dieu_tri === 'chua_quyet_dinh' && (
                <Button
                  type="default"
                  icon={<SolutionOutlined />}
                  size="middle"
                  onClick={() => showPhanLoaiModal(record.id)}
                >
                  Phân loại
                </Button>
              )}
              {record.loai_dieu_tri === 'ngoai_tru' && !record.hasPrescription && (
                <Button
                  type="default"
                  icon={<PlusCircleOutlined />}
                  size="middle"
                  onClick={() => showChiDinhThuocModal(record.id)}
                >
                  Kê đơn thuốc
                </Button>
              )}
              {record.loai_dieu_tri === 'ngoai_tru' && record.hasPrescription && (
                <Button
                  type="default"
                  icon={<FileSearchOutlined />}
                  size="middle"
                  onClick={() => showDonThuocModal(record.id)}
                >
                  Xem các thuốc đã kê
                </Button>
              )}
              {record.loai_dieu_tri === 'noi_tru' && !record.is_admitted && (
                <Button
                  type="default"
                  icon={<MedicineBoxOutlined />}
                  size="middle"
                  onClick={() => showXepGiuongModal(record.id)}
                >
                  Xếp giường
                </Button>
              )}
              <Button
                type="default"
                icon={<SwapOutlined />}
                size="middle"
                onClick={() => showChuyenKhoaModal(record.id)}
              >
                Chuyển khoa
              </Button>
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
                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  <Option value="pending">Chưa nhận</Option>
                  <Option value="received">Đã nhận</Option>
                </Select>
              </Col>
              <Col span={8}>
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  placeholder="Chọn ngày"
                  size="large"
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                />
              </Col>
            </Row>

            <Tabs activeKey={activeTabKey} onChange={handleTabChange} size="large">
              <TabPane
                tab={
                  <span>
                    <FileSearchOutlined /> Tất cả ({stats.total})
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

            <Spin spinning={loading}>
              {filteredAppointments.length === 0 ? (
                <Empty
                  description="Không có lịch hẹn nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: '40px 0' }}
                />
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredAppointments}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng cộng ${total} lịch hẹn`,
                    showQuickJumper: true,
                  }}
                  bordered
                  size="middle"
                  style={{ marginTop: 16 }}
                />
              )}
            </Spin>
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <Space>
            <SwapOutlined style={{ color: '#1890ff' }} />
            <span>Chuyển khoa cho bệnh nhân</span>
          </Space>
        }
        open={isModalVisible}
        onOk={handleChuyenKhoa}
        onCancel={handleCancel}
        okText="Xác nhận chuyển"
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
                    {selectedAppointment.bao_hiem_y_te !== null && (
                      <Text type="secondary">
                        <InsuranceOutlined /> {selectedAppointment.bao_hiem_y_te ? 'Có BHYT' : 'Không có BHYT'}
                        {selectedAppointment.so_bao_hiem_y_te && ` - ${selectedAppointment.so_bao_hiem_y_te}`}
                      </Text>
                    )}
                  </Space>
                </div>
              </Space>
            </Card>

            <Card
              title={
                <Space>
                  <InfoCircleOutlined style={{ color: '#fa8c16' }} />
                  <span>Triệu chứng</span>
                </Space>
              }
              bordered={false}
              style={{ marginBottom: 16 }}
            >
              <Paragraph>{selectedAppointment.trieu_chung}</Paragraph>
            </Card>

            {selectedAppointment.ket_qua_kham && (
              <Card
                title={
                  <Space>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <span>Kết luận khám</span>
                  </Space>
                }
                bordered={false}
                style={{ marginBottom: 16 }}
              >
                <Paragraph>{selectedAppointment.ket_qua_kham}</Paragraph>
              </Card>
            )}
          </>
        )}

        <Form layout="vertical">
          <Form.Item
            label={
              <Space>
                <MedicineBoxOutlined />
                <span>Chọn khoa chuyển đến</span>
              </Space>
            }
            required
            validateStatus={!selectedKhoaId && selectedAppointmentId ? 'error' : ''}
            help={!selectedKhoaId && selectedAppointmentId ? 'Vui lòng chọn khoa' : ''}
          >
            <Select
              placeholder="Chọn khoa chuyển đến"
              value={selectedKhoaId}
              onChange={(value) => setSelectedKhoaId(value)}
              style={{ width: '100%' }}
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
          <Form.Item label="Ghi chú chuyển khoa">
            <TextArea
              rows={3}
              value={chuyenKhoaGhiChu}
              onChange={(e) => setChuyenKhoaGhiChu(e.target.value)}
              placeholder="Nhập lý do chuyển khoa (ví dụ: Nghi ngờ nhồi máu cơ tim, cần khám chuyên sâu)"
            />
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16 }}>
          <Tag color="orange" icon={<BellOutlined />}>
            Lưu ý: Sau khi chuyển khoa, lịch hẹn sẽ được chuyển sang danh sách của khoa mới
          </Tag>
        </div>
      </Modal>

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
                    {selectedAppointment.chuyen_khoa_ghi_chu && (
                      <Text type="secondary">
                        <SwapOutlined /> Lý do chuyển khoa: {selectedAppointment.chuyen_khoa_ghi_chu}
                      </Text>
                    )}
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
            validateStatus={!ketQuaKham.trim() && isKetLuanModalVisible ? 'error' : ''}
            help={!ketQuaKham.trim() && isKetLuanModalVisible ? 'Vui lòng nhập kết luận' : ''}
          >
            <TextArea
              rows={4}
              value={ketQuaKham}
              onChange={(e) => setKetQuaKham(e.target.value)}
              placeholder="Nhập kết luận khám (ví dụ: Nghi ngờ nhồi máu cơ tim, cần nhập viện)"
            />
          </Form.Item>
        </Form>
      </Modal>

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
            <Radio.Group value={loaiDieuTri} onChange={(e) => setLoaiDieuTri(e.target.value)}>
              <Radio value="noi_tru">Nội trú (Nhập viện)</Radio>
              <Radio value="ngoai_tru">Ngoại trú (Về nhà)</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

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
            label="Chọn phòng bệnh"
            required
            validateStatus={!selectedRoomId && isXepGiuongModalVisible ? 'error' : ''}
            help={!selectedRoomId && isXepGiuongModalVisible ? 'Vui lòng chọn phòng' : ''}
          >
            <Select
              placeholder="Chọn phòng bệnh"
              value={selectedRoomId}
              onChange={(value) => {
                setSelectedRoomId(value);
                setSelectedBedId(null);
              }}
              style={{ width: '100%' }}
              size="large"
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
              placeholder="Chọn giường trống"
              value={selectedBedId}
              onChange={(value) => setSelectedBedId(value)}
              style={{ width: '100%' }}
              size="large"
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
        <div style={{ marginTop: 16 }}>
          <Tag color="orange" icon={<BellOutlined />}>
            Lưu ý: Giường sẽ được đánh dấu là đã sử dụng sau khi xác nhận
          </Tag>
        </div>
      </Modal>

      <Modal
        title={
          <Space>
            <PlusCircleOutlined style={{ color: '#1890ff' }} />
            <span>Kê đơn thuốc</span>
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
            console.log('Form validation failed:', errorInfo);
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
                          label="Chọn thuốc"
                          rules={[{ required: true, message: 'Vui lòng chọn thuốc!' }]}
                          style={{ marginBottom: 0, marginRight: '16px' }}
                        >
                          <Select placeholder="Chọn thuốc từ kho" size="large">
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
                          normalize={(value) => (value ? Number(value) : value)}
                          style={{ marginBottom: 0, marginRight: '16px' }}
                        >
                          <Input type="number" placeholder="Nhập số lượng" size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'lieu_luong']}
                          fieldKey={[field.fieldKey || 0, 'lieu_luong']}
                          label="Liều lượng"
                          rules={[{ required: true, message: 'Vui lòng nhập liều lượng!' }]}
                          style={{ marginBottom: 0, marginRight: '16px' }}
                        >
                          <Input placeholder="Nhập liều lượng" size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'tan_suat']}
                          fieldKey={[field.fieldKey || 0, 'tan_suat']}
                          label="Tần suất"
                          rules={[{ required: true, message: 'Vui lòng nhập tần suất!' }]}
                          style={{ marginBottom: 0, marginRight: '16px' }}
                        >
                          <Input placeholder="Nhập tần suất" size="large" />
                        </Form.Item>
                      </Col>
                      <Col span={4} style={{ textAlign: 'center' }}>
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

      {DonThuocModal}
    </div>
  );
};

export default Quanlykhambenh;