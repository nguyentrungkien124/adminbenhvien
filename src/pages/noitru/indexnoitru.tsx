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
  Descriptions,
  Divider,
  List,
  DatePicker,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  HomeOutlined,
  FileTextOutlined,
  SwapOutlined,
  MonitorOutlined,
  DollarOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface Inpatient {
  admission_id: number;
  appointment_id: number;
  khach_hang_id: number;
  ho_ten: string;
  so_dien_thoai: string;
  trieu_chung: string;
  ket_qua_kham: string | null;
  khoa_name: string;
  bac_si_name: string;
  room_name: string;
  bed_code: string;
  ngay_nhap_vien: string;
  da_thanh_toan: number;
  ngay_xuat_vien: string | null;
  patient_id?: string; // Thêm thuộc tính patient_id
  doctor_name?: string; // Thêm thuộc tính doctor_name
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

interface InpatientStats {
  total_inpatients: number;
  beds_in_use: number;
  beds_available: number;
}

interface DienBien {
  id: number;
  ngay_ghi_nhan: string;
  huyet_ap: string;
  nhip_tim: number;
  nhiet_do: number;
  ghi_chu: string;
  nguoi_ghi_nhan: string;
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
  gia: number;
  ghi_chu?: string; // Thêm thuộc tính ghi_chu
}

interface Kho {
  kho_id: number;
  ten_san_pham: string;
  don_vi_tinh: string;
  don_gia: string;
}

interface ChiPhi {
  id: number;
  admission_id: number;
  loai_chi_phi: 'giuong' | 'thuoc' | 'dich_vu' | 'xet_nghiem';
  so_tien: number;
  ngay_phat_sinh: string;
  ghi_chu: string | null;
}

interface TongChiPhi {
  tong_tien: number;
  co_bao_hiem: boolean;
  gia_kham: number;
  trang_thai_thanh_toan: string;
}

interface KhachHang {
  gioi_tinh?: string;
  ngay_sinh?: string;
  dia_chi?: string;
}

const IndexNoitru: React.FC = () => {
  const [inpatients, setInpatients] = useState<Inpatient[]>([]);
  const [filteredInpatients, setFilteredInpatients] = useState<Inpatient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [stats, setStats] = useState<InpatientStats>({ total_inpatients: 0, beds_in_use: 0, beds_available: 0 });
  const [khoList, setKhoList] = useState<Kho[]>([]);
  const [chiDinhThuocList, setChiDinhThuocList] = useState<ChiDinhThuoc[]>([]);
  const [chiPhiList, setChiPhiList] = useState<ChiPhi[]>([]);
  const [tongChiPhi, setTongChiPhi] = useState<TongChiPhi | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isDischargeModalVisible, setIsDischargeModalVisible] = useState<boolean>(false);
  const [isTransferBedModalVisible, setIsTransferBedModalVisible] = useState<boolean>(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState<boolean>(false);
  const [isDienBienModalVisible, setIsDienBienModalVisible] = useState<boolean>(false);
  const [isChiDinhThuocModalVisible, setIsChiDinhThuocModalVisible] = useState<boolean>(false);
  const [isAddChiPhiModalVisible, setIsAddChiPhiModalVisible] = useState<boolean>(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedBedId, setSelectedBedId] = useState<number | null>(null);
  const [selectedInpatient, setSelectedInpatient] = useState<Inpatient | null>(null);
  const [dienBienList, setDienBienList] = useState<DienBien[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>('all');
  const [dienBienForm] = Form.useForm();
  const [chiDinhThuocForm] = Form.useForm();
  const [chiPhiForm] = Form.useForm();
  const [khoaName, setKhoaName] = useState<string>('Không có khoa');
  const [khachHangData, setKhachHangData] = useState<KhachHang>({});
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [inpatientsRes, statsRes, roomsRes, bedsRes, khoRes] = await Promise.all([
          axios.get(`http://localhost:9999/api/noitru/getdsNoitru?khoa_id=${khoaId}`),
          axios.get(`http://localhost:9999/api/noitru/getThongkenoitru?khoa_id=${khoaId}`),
          axios.get(`http://localhost:9999/api/phongbenh/rooms?khoa_id=${khoaId}`),
          axios.get(`http://localhost:9999/api/phongbenh/beds?khoa_id=${khoaId}&trang_thai=trong`),
          axios.get(`http://localhost:9999/api/noitru/kho`),
        ]);

        setInpatients(inpatientsRes.data.data || []);
        setFilteredInpatients(inpatientsRes.data.data || []);
        setStats(statsRes.data.data || { total_inpatients: 0, beds_in_use: 0, beds_available: 0 });

        const fetchedRooms = roomsRes.data.map((room: any) => ({
          id: room.id,
          ten_phong: room.ten_phong,
        }));
        setRooms(fetchedRooms || []);

        const fetchedBeds = bedsRes.data.map((bed: any) => ({
          id: bed.id,
          room_id: bed.room_id,
          ma_giuong: bed.ma_giuong,
        }));
        setBeds(fetchedBeds || []);

        let khoData: Kho[] = [];
        if (Array.isArray(khoRes.data.data)) {
          khoData = khoRes.data.data;
        } else if (khoRes.data.data && typeof khoRes.data.data === 'object') {
          khoData = [khoRes.data.data];
        }
        setKhoList(khoData);

        if (inpatientsRes.data.data.length === 0) {
          message.info('Không có bệnh nhân nội trú trong khoa');
        }
        if (!khoData.length) {
          message.warning('Không có thuốc khả dụng trong kho');
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        message.error(error.response?.data?.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (khoaId) {
      fetchData();
    } else {
      message.error('Không tìm thấy thông tin khoa. Vui lòng đăng nhập lại.');
    }
  }, [khoaId]);

  useEffect(() => {
    let filtered = inpatients;
    if (searchText) {
      filtered = filtered.filter(
        (patient) =>
          patient.ho_ten.toLowerCase().includes(searchText.toLowerCase()) ||
          patient.so_dien_thoai.includes(searchText),
      );
    }
    setFilteredInpatients(filtered);
  }, [searchText, inpatients, activeTabKey]);

  const handleDischarge = async () => {
    if (!selectedAdmissionId) return;
    try {
      setLoading(true);
      const response = await axios.post(`http://localhost:9999/api/noitru/xuatVien`, { admission_id: selectedAdmissionId });
      setInpatients(inpatients.filter((patient) => patient.admission_id !== selectedAdmissionId));
      setFilteredInpatients(filteredInpatients.filter((patient) => patient.admission_id !== selectedAdmissionId));
      message.success(response.data.message || 'Xuất viện thành công');
      setIsDischargeModalVisible(false);
      setSelectedAdmissionId(null);

      const statsRes = await axios.get(`http://localhost:9999/api/noitru/getThongkenoitru?khoa_id=${khoaId}`);
      setStats(statsRes.data.data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi khi xuất viện. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferBed = async () => {
    if (!selectedAdmissionId || !selectedBedId) {
      message.error('Vui lòng chọn giường mới');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:9999/api/noitru/chuyenGiuong`, {
        admission_id: selectedAdmissionId,
        new_bed_id: selectedBedId,
      });
      message.success(response.data.message || 'Chuyển giường thành công');
      setIsTransferBedModalVisible(false);
      setSelectedAdmissionId(null);
      setSelectedRoomId(null);
      setSelectedBedId(null);

      const [inpatientsRes, bedsRes] = await Promise.all([
        axios.get(`http://localhost:9999/api/noitru/getdsNoitru?khoa_id=${khoaId}`),
        axios.get(`http://localhost:9999/api/phongbenh/beds?khoa_id=${khoaId}&trang_thai=trong`),
      ]);
      setInpatients(inpatientsRes.data.data);
      setFilteredInpatients(inpatientsRes.data.data);
      setBeds(
        bedsRes.data.map((bed: any) => ({
          id: bed.id,
          room_id: bed.room_id,
          ma_giuong: bed.ma_giuong,
        })),
      );
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi khi chuyển giường. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const showDischargeModal = (admissionId: number) => {
    setSelectedAdmissionId(admissionId);
    setIsDischargeModalVisible(true);
  };

  const showTransferBedModal = (admissionId: number) => {
    setSelectedAdmissionId(admissionId);
    setIsTransferBedModalVisible(true);
  };

  const showDetailsModal = async (inpatient: Inpatient) => {
    try {
      setLoading(true);
      const [dienBienResponse, chiDinhThuocResponse, chiPhiResponse, tongChiPhiResponse] = await Promise.all([
        axios.get(`http://localhost:9999/api/noitru/dien-bien/${inpatient.admission_id}`),
        axios.get(`http://localhost:9999/api/noitru/chi-dinh-thuoc/${inpatient.admission_id}?null`),
        axios.get(`http://localhost:9999/api/noitru/chi-phi/${inpatient.admission_id}`),
        axios.get(`http://localhost:9999/api/noitru/tong-chi-phi/${inpatient.admission_id}`),
      ]);

      let khachHangData: KhachHang = {};
      try {
        const khachHangResponse = await axios.get(`http://localhost:9999/api/user/getthongtinbyId/${inpatient.khach_hang_id}`);
        const khachHangArray = khachHangResponse.data.data || khachHangResponse.data || [];
        khachHangData = Array.isArray(khachHangArray) && khachHangArray.length > 0 ? khachHangArray[0] : {};
      } catch (error) {
        console.error('Error fetching khach hang data:', error);
        message.warning('Không thể lấy thông tin khách hàng. Một số thông tin có thể không hiển thị.');
      }

      const updatedChiDinhThuocList = (chiDinhThuocResponse.data.data || []).map((thuoc: ChiDinhThuoc) => {
        const khoItem = khoList.find((kho) => kho.kho_id === thuoc.kho_id);
        return {
          ...thuoc,
          gia: khoItem ? parseFloat(khoItem.don_gia) : 0,
        };
      });

      setSelectedInpatient(inpatient);
      setDienBienList(dienBienResponse.data.data || []);
      setChiDinhThuocList(updatedChiDinhThuocList);
      setChiPhiList(chiPhiResponse.data.data || []);
      setTongChiPhi(tongChiPhiResponse.data.data || null);
      setKhachHangData(khachHangData);
      setIsDetailsModalVisible(true);
    } catch (error: any) {
      console.error('Error fetching details:', error);
      message.error(error.response?.data?.message || 'Không thể tải chi tiết');
    } finally {
      setLoading(false);
    }
  };

  const showDienBienModal = (admissionId: number) => {
    setSelectedAdmissionId(admissionId);
    setIsDienBienModalVisible(true);
  };

  const showChiDinhThuocModal = (admissionId: number) => {
    setSelectedAdmissionId(admissionId);
    setIsChiDinhThuocModalVisible(true);
  };

  const showAddChiPhiModal = (admissionId: number) => {
    setSelectedAdmissionId(admissionId);
    setIsAddChiPhiModalVisible(true);
  };

  const handleAddDienBien = async (values: any) => {
    if (!selectedAdmissionId) {
      message.error('Không tìm thấy thông tin nhập viện');
      return;
    }

    try {
      setLoading(true);
      const data = {
        admission_id: selectedAdmissionId,
        huyet_ap: values.huyet_ap,
        nhip_tim: Number(values.nhip_tim),
        nhiet_do: Number(values.nhiet_do),
        ghi_chu: values.ghi_chu || '',
        nguoi_ghi_nhan_id: bacSiId,
      };
      const response = await axios.post('http://localhost:9999/api/noitru/dien-bien', data);
      message.success(response.data.message || 'Cập nhật diễn biến thành công');
      setIsDienBienModalVisible(false);
      dienBienForm.resetFields();

      if (selectedInpatient && selectedInpatient.admission_id === selectedAdmissionId) {
        const dienBienResponse = await axios.get(`http://localhost:9999/api/noitru/dien-bien/${selectedAdmissionId}`);
        setDienBienList(dienBienResponse.data.data || []);
      }
    } catch (error: any) {
      console.error('Error adding dien bien:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi cập nhật diễn biến');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChiDinhThuoc = async (values: any) => {
    if (!selectedAdmissionId) {
      message.error('Không tìm thấy thông tin nhập viện');
      return;
    }

    try {
      setLoading(true);
      const prescriptions = values.prescriptions.map((prescription: any) => ({
        admission_id: selectedAdmissionId,
        kho_id: prescription.kho_id,
        so_luong: Number(prescription.so_luong),
        lieu_luong: prescription.lieu_luong,
        tan_suat: prescription.tan_suat,
        nguoi_chi_dinh_id: bacSiId,
      }));
      const response = await axios.post('http://localhost:9999/api/noitru/chi-dinh-thuoc', { prescriptions });
      message.success(response.data.message || 'Chỉ định thuốc thành công');
      setIsChiDinhThuocModalVisible(false);
      chiDinhThuocForm.resetFields();

      if (selectedInpatient && selectedInpatient.admission_id === selectedAdmissionId) {
        const chiDinhThuocResponse = await axios.get(`http://localhost:9999/api/noitru/chi-dinh-thuoc/${selectedAdmissionId}?null`);
        const updatedChiDinhThuocList = (chiDinhThuocResponse.data.data || []).map((thuoc: ChiDinhThuoc) => {
          const khoItem = khoList.find((kho) => kho.kho_id === thuoc.kho_id);
          return {
            ...thuoc,
            gia: khoItem ? parseFloat(khoItem.don_gia) : 0,
          };
        });
        setChiDinhThuocList(updatedChiDinhThuocList);
      }
    } catch (error: any) {
      console.error('Error adding chi dinh thuoc:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi chỉ định thuốc');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChiPhi = async (values: any) => {
    if (!selectedAdmissionId) {
      message.error('Không tìm thấy thông tin nhập viện');
      return;
    }

    try {
      setLoading(true);
      let response;
      if (values.loai_chi_phi === 'giuong') {
        const data = {
          admission_id: selectedAdmissionId,
          bed_id: selectedInpatient?.bed_code ? beds.find((b) => b.ma_giuong === selectedInpatient.bed_code)?.id : null,
          ngay: values.ngay_phat_sinh ? dayjs(values.ngay_phat_sinh).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        };
        if (!data.bed_id) {
          message.error('Không tìm thấy giường của bệnh nhân');
          return;
        }
        response = await axios.post('http://localhost:9999/api/noitru/chi-phi-giuong', data);
      } else {
        const data = {
          admission_id: selectedAdmissionId,
          loai_chi_phi: values.loai_chi_phi,
          so_tien: Number(values.so_tien),
          ghi_chu: values.ghi_chu || '',
        };
        response = await axios.post('http://localhost:9999/api/noitru/chi-phi', data);
      }
      message.success(response.data.message || 'Thêm chi phí thành công');
      setIsAddChiPhiModalVisible(false);
      chiPhiForm.resetFields();

      if (selectedInpatient && selectedInpatient.admission_id === selectedAdmissionId) {
        const [chiPhiResponse, tongChiPhiResponse] = await Promise.all([
          axios.get(`http://localhost:9999/api/noitru/chi-phi/${selectedAdmissionId}`),
          axios.get(`http://localhost:9999/api/noitru/tong-chi-phi/${selectedAdmissionId}`),
        ]);
        setChiPhiList(chiPhiResponse.data.data || []);
        setTongChiPhi(tongChiPhiResponse.data.data || null);
      }
    } catch (error: any) {
      console.error('Error adding chi phi:', error);
      message.error(error.response?.data?.message || 'Có lỗi khi thêm chi phí');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatKhachHangInfo = (selectedInpatient: Inpatient | null) => {
    return {
      hoTen: selectedInpatient?.ho_ten || 'N/A',
      gioiTinh: khachHangData.gioi_tinh || 'N/A',
      namSinh: khachHangData.ngay_sinh ? dayjs(khachHangData.ngay_sinh).format('YYYY') : 'N/A',
      soDienThoai: selectedInpatient?.so_dien_thoai || 'N/A',
      diaChi: khachHangData.dia_chi || 'N/A',
      ket_qua_kham: selectedInpatient?.ket_qua_kham || 'Chưa xác định',
    };
  };

  const generatePDF = () => {
    if (!selectedInpatient || !chiDinhThuocList.length || !tongChiPhi || !chiPhiList) {
      message.error('Không thể tạo PDF - Thiếu thông tin cần thiết');
      return;
    }
    
    const totalMedicineCost = chiDinhThuocList.reduce((sum, thuoc) => sum + (thuoc.so_luong * thuoc.gia), 0);
    try {
      setPdfGenerating(true);

      const khachHangInfo = formatKhachHangInfo(selectedInpatient);
      const chiPhiGiuong = chiPhiList.find((chiPhi) => chiPhi.loai_chi_phi === 'giuong');
      const ngayXuatVien = selectedInpatient.ngay_xuat_vien
        ? dayjs(selectedInpatient.ngay_xuat_vien).format('DD/MM/YYYY')
        : 'Chưa xuất viện';
      const currentDate = dayjs().format('DD/MM/YYYY');
      const currentTime = dayjs().format('HH:mm');

      const element = document.createElement('div');
      element.style.cssText = `
        width: 210mm;
        min-height: 297mm;
        padding: 15mm;
        font-family: 'Times New Roman', serif;
        background: white;
        margin: 0 auto;
        box-sizing: border-box;
        line-height: 1.5;
        font-size: 14px;
      `;
      
      element.innerHTML = `
        <!-- Header bệnh viện -->
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px;">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">BỆNH VIỆN ĐA KHOA TỈNH</div>
          <div style="font-size: 16px; margin-bottom: 5px;">Địa chỉ: Số 123, Đường ABC, Thành phố XYZ</div>
          <div style="font-size: 16px; margin-bottom: 5px;">Điện thoại: 0123.456.789 - Fax: 0123.456.789</div>
          <div style="font-size: 20px; font-weight: bold; text-transform: uppercase; margin: 10px 0; color: #1a5276;">
            HÓA ĐƠN THANH TOÁN DỊCH VỤ Y TẾ
          </div>
          <div style="font-size: 14px;">Số hóa đơn: ${selectedInpatient.admission_id || 'N/A'} - Ngày: ${currentDate}</div>
        </div>

        <!-- Thông tin bệnh nhân -->
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
            THÔNG TIN BỆNH NHÂN
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 5px 0; width: 50%;"><strong>Họ và tên:</strong> ${khachHangInfo.hoTen}</td>
              <td style="padding: 5px 0;"><strong>Giới tính:</strong> ${khachHangInfo.gioiTinh}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Năm sinh:</strong> ${khachHangInfo.namSinh}</td>
              <td style="padding: 5px 0;"><strong>Số điện thoại:</strong> ${khachHangInfo.soDienThoai}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Địa chỉ:</strong> ${khachHangInfo.diaChi}</td>
              <td style="padding: 5px 0;"><strong>Mã bệnh nhân:</strong> ${selectedInpatient.patient_id || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Ngày nhập viện:</strong> ${dayjs(selectedInpatient.ngay_nhap_vien).format('DD/MM/YYYY')}</td>
              <td style="padding: 5px 0;"><strong>Ngày xuất viện:</strong> ${ngayXuatVien}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 5px 0;"><strong>Chẩn đoán:</strong> ${khachHangInfo.ket_qua_kham || 'Không có thông tin'}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 5px 0;"><strong>Khoa điều trị:</strong> Nội trú</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Giường:</strong> ${selectedInpatient.bed_code || 'Giường 01'}</td>
              <td style="padding: 5px 0;"><strong>Bác sĩ điều trị:</strong> ${selectedInpatient.doctor_name || 'Không có thông tin'}</td>
            </tr>
          </table>
        </div>

        <!-- Danh sách dịch vụ -->
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
            DANH SÁCH DỊCH VỤ Y TẾ
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #000;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #000; padding: 8px; text-align: center; width: 5%;">STT</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: left; width: 45%;">Tên dịch vụ/Thuốc</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: center; width: 10%;">Đơn vị</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: center; width: 10%;">Số lượng</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: right; width: 15%;">Đơn giá (VNĐ)</th>
                <th style="border: 1px solid #000; padding: 8px; text-align: right; width: 15%;">Thành tiền (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              <!-- Dịch vụ khám -->
              <tr>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">1</td>
                <td style="border: 1px solid #000; padding: 8px;">Phí khám bệnh</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">Lần</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">1</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatCurrency(tongChiPhi.gia_kham)}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatCurrency(tongChiPhi.gia_kham)}</td>
              </tr>
              
              <!-- Dịch vụ giường -->
              ${chiPhiGiuong ? `
              <tr>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">2</td>
                <td style="border: 1px solid #000; padding: 8px;">Phí giường bệnh</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">Ngày</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: center;">${calculateDays(selectedInpatient.ngay_nhap_vien, selectedInpatient.ngay_xuat_vien)}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatCurrency(chiPhiGiuong.so_tien)}</td>
                <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatCurrency(chiPhiGiuong.so_tien * calculateDays(selectedInpatient.ngay_nhap_vien, selectedInpatient.ngay_xuat_vien))}</td>
              </tr>
              ` : ''}
              
              <!-- Danh sách thuốc -->
              ${chiDinhThuocList.map((thuoc, index) => `
                <tr>
                  <td style="border: 1px solid #000; padding: 8px; text-align: center;">${index + 3}</td>
                  <td style="border: 1px solid #000; padding: 8px;">${thuoc.ten_thuoc}</td>
                  <td style="border: 1px solid #000; padding: 8px; text-align: center;">${thuoc.don_vi}</td>
                  <td style="border: 1px solid #000; padding: 8px; text-align: center;">${thuoc.so_luong}</td>
                  <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatCurrency(thuoc.gia)}</td>
                  <td style="border: 1px solid #000; padding: 8px; text-align: right;">${formatCurrency(thuoc.so_luong * thuoc.gia)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Tổng chi phí -->
        <div style="margin-bottom: 20px; font-size: 14px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; width: 80%; text-align: right;"><strong>Tổng cộng:</strong></td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000;">
                ${formatCurrency(tongChiPhi.tong_tien)}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; text-align: right;"><strong>Giảm trừ (nếu có):</strong></td>
              <td style="padding: 8px 0; text-align: right;">${formatCurrency(0)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; text-align: right;"><strong>Phải thanh toán:</strong></td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #c0392b;">
                ${formatCurrency(tongChiPhi.tong_tien)}
              </td>
            </tr>
          </table>
        </div>

        <!-- Hướng dẫn sử dụng thuốc -->
        <div style="margin-bottom: 20px;">
          <div style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
            HƯỚNG DẪN SỬ DỤNG THUỐC
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            ${chiDinhThuocList.map((thuoc, index) => `
              <tr>
                <td style="padding: 5px 0; width: 30%;"><strong>${index + 1}. ${thuoc.ten_thuoc}:</strong></td>
                <td style="padding: 5px 0;">
                  <div><strong>Liều dùng:</strong> ${thuoc.lieu_luong}</div>
                  <div><strong>Cách dùng:</strong> ${thuoc.tan_suat}</div>
                  <div><strong>Ghi chú:</strong> ${thuoc.ghi_chu || 'Không có'}</div>
                </td>
              </tr>
            `).join('')}
          </table>
        </div>

        <!-- Phần chữ ký -->
        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div style="text-align: center; width: 40%;">
            <div style="font-style: italic;">Ngày ${currentDate}</div>
            <div style="margin-top: 50px; font-weight: bold;">BỆNH NHÂN/KHÁCH HÀNG</div>
            <div style="margin-top: 30px;">${khachHangInfo.hoTen}</div>
          </div>
          <div style="text-align: center; width: 40%;">
            <div style="font-style: italic;">Ngày ${currentDate}</div>
            <div style="margin-top: 50px; font-weight: bold;">NGƯỜI LẬP HÓA ĐƠN</div>
            <div style="margin-top: 30px;">${selectedInpatient.doctor_name || 'Bác sĩ điều trị'}</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #555;">
          <div>Hóa đơn điện tử có giá trị thay thế hóa đơn giấy theo Thông tư 68/2019/TT-BTC</div>
          <div>Quý khách vui lòng kiểm tra kỹ hóa đơn trước khi thanh toán</div>
          <div>Mọi thắc mắc xin liên hệ phòng Kế toán - Bệnh viện Đa khoa Tỉnh</div>
        </div>
      `;
      
      document.body.appendChild(element);

      html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 210 * 3.779527559,
        height: element.offsetHeight * 3.779527559,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png', 1.0);
        const imgWidth = 210;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

        const filename = `HoaDon_${selectedInpatient.admission_id}_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
        doc.save(filename);
        
        message.success('Hóa đơn đã được tải xuống thành công');
        
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

  // Hàm hỗ trợ tính số ngày nằm viện
  function calculateDays(ngayNhapVien: string, ngayXuatVien: string | null) {
    if (!ngayXuatVien) return 1;
    const start = dayjs(ngayNhapVien);
    const end = dayjs(ngayXuatVien);
    return end.diff(start, 'day') + 1;
  }

  const columns = [
    {
      title: 'Mã nhập viện',
      dataIndex: 'admission_id',
      key: 'admission_id',
      width: 100,
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      width: 200,
      render: (_: any, record: Inpatient) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <Text strong>{record.ho_ten}</Text>
          </Space>
          <Space>
            <PhoneOutlined style={{ color: '#1890ff' }} />
            <Text>{record.so_dien_thoai}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Triệu chứng',
      dataIndex: 'trieu_chung',
      key: 'trieu_chung',
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip title={text}>
          <Paragraph ellipsis={{ rows: 2 }}>{text}</Paragraph>
        </Tooltip>
      ),
    },
    {
      title: 'Kết luận',
      dataIndex: 'ket_qua_kham',
      key: 'ket_qua_kham',
      ellipsis: { showTitle: false },
      render: (text: string | null) => (
        <Tooltip title={text}>
          <Paragraph ellipsis={{ rows: 2 }}>{text || 'Chưa có'}</Paragraph>
        </Tooltip>
      ),
    },
    {
      title: 'Phòng',
      dataIndex: 'room_name',
      key: 'room_name',
      width: 120,
    },
    {
      title: 'Giường',
      dataIndex: 'bed_code',
      key: 'bed_code',
      width: 100,
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'bac_si_name',
      key: 'bac_si_name',
      width: 150,
    },
    {
      title: 'Ngày nhập viện',
      dataIndex: 'ngay_nhap_vien',
      key: 'ngay_nhap_vien',
      width: 150,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'da_thanh_toan',
      key: 'da_thanh_toan',
      width: 150,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 250,
      render: (_: any, record: Inpatient) => (
        <Space wrap size="small">
          <Button
            type="default"
            icon={<FileTextOutlined />}
            onClick={() => showDetailsModal(record)}
          >
            Chi tiết
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="dienBien"
                  icon={<MonitorOutlined />}
                  onClick={() => showDienBienModal(record.admission_id)}
                >
                  Diễn biến
                </Menu.Item>
                <Menu.Item
                  key="thuoc"
                  icon={<MedicineBoxOutlined />}
                  onClick={() => showChiDinhThuocModal(record.admission_id)}
                >
                  Thuốc
                </Menu.Item>
                <Menu.Item
                  key="chiPhi"
                  icon={<DollarOutlined />}
                  onClick={() => showAddChiPhiModal(record.admission_id)}
                >
                  Chi phí
                </Menu.Item>
                <Menu.Item
                  key="chuyenGiuong"
                  icon={<SwapOutlined />}
                  onClick={() => showTransferBedModal(record.admission_id)}
                >
                  Chuyển giường
                </Menu.Item>
              </Menu>
            }
          >
            <Button type="default">
              Thêm <DownOutlined />
            </Button>
          </Dropdown>
          <Button
            type="primary"
            danger
            icon={<CheckCircleOutlined />}
            onClick={() => showDischargeModal(record.admission_id)}
          >
            Xuất viện
          </Button>
        </Space>
      ),
    },
  ];
  
  const chiPhiColumns = [
    {
      title: 'Loại chi phí',
      dataIndex: 'loai_chi_phi',
      key: 'loai_chi_phi',
      render: (text: string) => {
        const labels: { [key: string]: string } = {
          giuong: 'Giường',
          thuoc: 'Thuốc',
          dich_vu: 'Dịch vụ',
          xet_nghiem: 'Xét nghiệm',
        };
        return labels[text] || text;
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'so_tien',
      key: 'so_tien',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Ngày phát sinh',
      dataIndex: 'ngay_phat_sinh',
      key: 'ngay_phat_sinh',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghi_chu',
      key: 'ghi_chu',
      render: (text: string | null) => text || '—',
    },
  ];

  return (
    <div className="inpatient-manager" style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            <Breadcrumb>
              <Breadcrumb.Item>
                <HomeOutlined />
              </Breadcrumb.Item>
              <Breadcrumb.Item>Quản lý nội trú</Breadcrumb.Item>
              <Breadcrumb.Item>{khoaName}</Breadcrumb.Item>
            </Breadcrumb>
            <Title level={2} style={{ margin: '16px 0' }}>
              <MedicineBoxOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Quản lý nội trú - Khoa {khoaName}
            </Title>
          </Card>
        </Col>

        <Col span={24}>
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Tổng bệnh nhân nội trú"
                  value={stats.total_inpatients}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Giường đang sử dụng"
                  value={stats.beds_in_use}
                  prefix={<MedicineBoxOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Giường trống"
                  value={stats.beds_available}
                  prefix={<MedicineBoxOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Card>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={16}>
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
                <Select defaultValue="all" style={{ width: '100%' }} size="large" disabled>
                  <Option value="all">Tất cả khoa</Option>
                </Select>
              </Col>
            </Row>

            <Tabs activeKey={activeTabKey} onChange={setActiveTabKey} size="large">
              <TabPane tab={<span><TeamOutlined /> Tất cả ({stats.total_inpatients})</span>} key="all" />
            </Tabs>

            <Spin spinning={loading}>
              {filteredInpatients.length === 0 ? (
                <Empty
                  description="Không có bệnh nhân nội trú"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: '40px 0' }}
                />
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredInpatients}
                  rowKey="admission_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng cộng ${total} bệnh nhân`,
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

      {/* Modal xuất viện */}
      <Modal
        title="Xác nhận xuất viện"
        open={isDischargeModalVisible}
        onOk={handleDischarge}
        onCancel={() => {
          setIsDischargeModalVisible(false);
          setSelectedAdmissionId(null);
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <p>Bạn có chắc chắn muốn cho bệnh nhân xuất viện?</p>
      </Modal>

      {/* Modal chuyển giường */}
      <Modal
        title="Chuyển giường"
        open={isTransferBedModalVisible}
        onOk={handleTransferBed}
        onCancel={() => {
          setIsTransferBedModalVisible(false);
          setSelectedAdmissionId(null);
          setSelectedRoomId(null);
          setSelectedBedId(null);
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form layout="vertical">
          <Form.Item
            label="Chọn phòng bệnh"
            required
            validateStatus={!selectedRoomId && isTransferBedModalVisible ? 'error' : ''}
            help={!selectedRoomId && isTransferBedModalVisible ? 'Vui lòng chọn phòng' : ''}
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
            validateStatus={!selectedBedId && isTransferBedModalVisible ? 'error' : ''}
            help={!selectedBedId && isTransferBedModalVisible ? 'Vui lòng chọn giường' : ''}
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
      </Modal>

      {/* Modal chi tiết bệnh nhân */}
      <Modal
        title="Chi tiết bệnh nhân nội trú"
        open={isDetailsModalVisible}
        onCancel={() => {
          setIsDetailsModalVisible(false);
          setSelectedInpatient(null);
          setDienBienList([]);
          setChiDinhThuocList([]);
          setChiPhiList([]);
          setTongChiPhi(null);
          setKhachHangData({});
        }}
        footer={[
          <Button
            key="print"
            type="primary"
            onClick={generatePDF}
            loading={pdfGenerating}
          >
            In PDF
          </Button>,
          <Button
            key="close"
            onClick={() => {
              setIsDetailsModalVisible(false);
              setSelectedInpatient(null);
              setDienBienList([]);
              setChiDinhThuocList([]);
              setChiPhiList([]);
              setTongChiPhi(null);
              setKhachHangData({});
            }}
          >
            Đóng
          </Button>,
        ]}
        width={1000}
      >
        {selectedInpatient && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="Thông tin" key="info">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Họ tên">{selectedInpatient.ho_ten}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{selectedInpatient.so_dien_thoai}</Descriptions.Item>
                <Descriptions.Item label="Giới tính">{khachHangData.gioi_tinh || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Năm sinh">{khachHangData.ngay_sinh ? dayjs(khachHangData.ngay_sinh).format('YYYY') : 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{khachHangData.dia_chi || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Triệu chứng">{selectedInpatient.trieu_chung}</Descriptions.Item>
                <Descriptions.Item label="Kết luận">{selectedInpatient.ket_qua_kham || 'Chưa có'}</Descriptions.Item>
                <Descriptions.Item label="Khoa">{selectedInpatient.khoa_name}</Descriptions.Item>
                <Descriptions.Item label="Bác sĩ">{selectedInpatient.bac_si_name}</Descriptions.Item>
                <Descriptions.Item label="Phòng">{selectedInpatient.room_name}</Descriptions.Item>
                <Descriptions.Item label="Giường">{selectedInpatient.bed_code}</Descriptions.Item>
                <Descriptions.Item label="Ngày nhập viện">
                  {formatDate(selectedInpatient.ngay_nhap_vien)}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>
            <TabPane tab="Diễn biến" key="dienBien">
              <Divider>Lịch sử diễn biến</Divider>
              {dienBienList.length > 0 ? (
                <List
                  dataSource={dienBienList}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        background: item.nhip_tim > 100 || item.nhiet_do > 38 ? '#fff1f0' : 'inherit',
                        padding: '8px 16px',
                      }}
                    >
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="Thời gian">
                          {dayjs(item.ngay_ghi_nhan).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Người ghi">{item.nguoi_ghi_nhan}</Descriptions.Item>
                        <Descriptions.Item label="Huyết áp">{item.huyet_ap} mmHg</Descriptions.Item>
                        <Descriptions.Item label="Nhịp tim">{item.nhip_tim} lần/phút</Descriptions.Item>
                        <Descriptions.Item label="Nhiệt độ">{item.nhiet_do}°C</Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">{item.ghi_chu || 'Không có'}</Descriptions.Item>
                        {(item.nhip_tim > 100 || item.nhiet_do > 38) && (
                          <Descriptions.Item label="Cảnh báo">
                            <Tag color="red">Chỉ số bất thường</Tag>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description="Chưa có diễn biến nào được ghi nhận"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: '20px 0' }}
                />
              )}
            </TabPane>
            <TabPane tab="Chỉ định thuốc" key="chiDinhThuoc">
              <Divider>Lịch sử chỉ định thuốc</Divider>
              {chiDinhThuocList.length > 0 ? (
                <List
                  dataSource={chiDinhThuocList}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '8px 16px' }}>
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="Thời gian">
                          {dayjs(item.ngay_chi_dinh).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Người chỉ định">{item.nguoi_chi_dinh}</Descriptions.Item>
                        <Descriptions.Item label="Thuốc">{item.ten_thuoc}</Descriptions.Item>
                        <Descriptions.Item label="Số lượng">{item.so_luong} {item.don_vi}</Descriptions.Item>
                        <Descriptions.Item label="Liều lượng">{item.lieu_luong}</Descriptions.Item>
                        <Descriptions.Item label="Tần suất">{item.tan_suat}</Descriptions.Item>
                        <Descriptions.Item label="Đơn giá">{formatCurrency(item.gia)}</Descriptions.Item>
                        <Descriptions.Item label="Thành tiền">{formatCurrency(item.so_luong * item.gia)}</Descriptions.Item>
                      </Descriptions>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description="Chưa có chỉ định thuốc nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: '20px 0' }}
                />
              )}
            </TabPane>
            <TabPane tab="Chi phí" key="chiPhi">
              <>
                <Divider>Chi phí điều trị</Divider>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={12} style={{ zIndex: 1 }}>
                    <Statistic
                      title="Tổng chi phí"
                      value={tongChiPhi?.tong_tien || 0}
                      formatter={(value) => formatCurrency(value as number)}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={12} style={{ zIndex: 1 }}>
                    <Statistic
                      title="Giá khám"
                      value={tongChiPhi?.gia_kham || 0}
                      formatter={(value) => formatCurrency(value as number)}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={12} style={{ zIndex: 1 }}>
                    <Statistic
                      title="Bảo hiểm"
                      value={tongChiPhi?.co_bao_hiem ? 'Có (Giảm 30%)' : 'Không'}
                      valueStyle={{ color: tongChiPhi?.co_bao_hiem ? '#52c41a' : '#fa8c16' }}
                    />
                  </Col>
                  <Col span={12} style={{ zIndex: 1 }}>
                    <Statistic
                      title="Trạng thái thanh toán"
                      value={tongChiPhi?.trang_thai_thanh_toan || 'Chưa thanh toán'}
                      valueStyle={{ color: tongChiPhi?.trang_thai_thanh_toan === 'Đã thanh toán' ? '#52c41a' : '#fa8c16' }}
                    />
                  </Col>
                </Row>
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  onClick={() => showAddChiPhiModal(selectedInpatient.admission_id)}
                  style={{ marginBottom: 16 }}
                >
                  Thêm chi phí
                </Button>
                {chiPhiList.length > 0 ? (
                  <Table
                    columns={chiPhiColumns}
                    dataSource={chiPhiList}
                    rowKey="id"
                    pagination={false}
                    bordered
                    size="small"
                  />
                ) : (
                  <Empty
                    description="Chưa có chi phí nào được ghi nhận"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ margin: '20px 0' }}
                  />
                )}
              </>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* Modal cập nhật diễn biến */}
      <Modal
        title="Cập nhật diễn biến bệnh"
        open={isDienBienModalVisible}
        onOk={async () => {
          try {
            await dienBienForm.validateFields();
            dienBienForm.submit();
          } catch (error) {
            console.error('Form validation failed:', error);
            message.error('Vui lòng kiểm tra lại dữ liệu nhập');
          }
        }}
        onCancel={() => {
          setIsDienBienModalVisible(false);
          dienBienForm.resetFields();
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form
          form={dienBienForm}
          onFinish={(values) => {
            handleAddDienBien(values);
          }}
          layout="vertical"
          initialValues={{ huyet_ap: '', nhip_tim: null, nhiet_do: null, ghi_chu: '' }}
        >
          <Form.Item
            name="huyet_ap"
            label="Huyết áp (mmHg)"
            rules={[
              { required: true, message: 'Vui lòng nhập huyết áp' },
              { pattern: /^[0-9]+\/[0-9]+$/, message: 'Huyết áp phải có định dạng VD: 120/80' },
            ]}
          >
            <Input placeholder="VD: 120/80" size="large" />
          </Form.Item>
          <Form.Item
            name="nhip_tim"
            label="Nhịp tim (lần/phút)"
            rules={[
              { required: true, message: 'Vui lòng nhập nhịp tim' },
              { type: 'number', min: 20, max: 200, message: 'Nhịp tim phải từ 20-200' },
            ]}
            normalize={(value) => (value ? Number(value) : null)}
          >
            <Input type="number" placeholder="VD: 80" size="large" />
          </Form.Item>
          <Form.Item
            name="nhiet_do"
            label="Nhiệt độ (°C)"
            rules={[
              { required: true, message: 'Vui lòng nhập nhiệt độ' },
              { type: 'number', min: 34, max: 42, message: 'Nhiệt độ phải từ 34-42' },
            ]}
            normalize={(value) => (value ? Number(value) : null)}
          >
            <Input type="number" step="0.1" placeholder="VD: 36.5" size="large" />
          </Form.Item>
          <Form.Item name="ghi_chu" label="Ghi chú">
            <Input.TextArea rows={4} placeholder="Mô tả tình trạng bệnh nhân" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉ định thuốc */}
      <Modal
        title="Chỉ định thuốc"
        open={isChiDinhThuocModalVisible}
        width="40%"
        onOk={async () => {
          try {
            await chiDinhThuocForm.validateFields();
            chiDinhThuocForm.submit();
          } catch (error) {
            console.error('Form validation failed:', error);
            message.error('Vui lòng kiểm tra lại dữ liệu nhập');
          }
        }}
        onCancel={() => {
          setIsChiDinhThuocModalVisible(false);
          chiDinhThuocForm.resetFields();
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form
          form={chiDinhThuocForm}
          onFinish={(values) => {
            handleAddChiDinhThuoc(values);
          }}
          layout="vertical"
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
                          <Select placeholder="Chọn thuốc từ kho" size="large" disabled={!khoList.length}>
                            {Array.isArray(khoList) && khoList.length > 0 ? (
                              khoList.map((thuoc) => (
                                <Option key={thuoc.kho_id} value={thuoc.kho_id}>
                                  {thuoc.ten_san_pham} ({thuoc.don_vi_tinh}) - {formatCurrency(parseFloat(thuoc.don_gia))}
                                </Option>
                              ))
                            ) : (
                              <Option disabled value={null}>
                                Không có thuốc khả dụng
                              </Option>
                            )}
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
                <Form.Item style={{ width: '100%' }}>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />} size="large">
                    Thêm thuốc
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Modal thêm chi phí */}
      <Modal
        title="Thêm chi phí"
        open={isAddChiPhiModalVisible}
        onOk={async () => {
          try {
            await chiPhiForm.validateFields();
            chiPhiForm.submit();
          } catch (error) {
            console.error('Form validation failed:', error);
            message.error('Vui lòng kiểm tra lại dữ liệu nhập');
          }
        }}
        onCancel={() => {
          setIsAddChiPhiModalVisible(false);
          chiPhiForm.resetFields();
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form
          form={chiPhiForm}
          onFinish={(values) => {
            handleAddChiPhi(values);
          }}
          layout="vertical"
          initialValues={{ loai_chi_phi: 'dich_vu', so_tien: null, ghi_chu: '', ngay_phat_sinh: dayjs() }}
        >
          <Form.Item
            name="loai_chi_phi"
            label="Loại chi phí"
            rules={[{ required: true, message: 'Vui lòng chọn loại chi phí' }]}
          >
            <Select size="large">
              <Option value="giuong">Giường</Option>
              <Option value="dich_vu">Dịch vụ</Option>
              <Option value="xet_nghiem">Xét nghiệm</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="ngay_phat_sinh"
            label="Ngày phát sinh"
            rules={[{ required: true, message: 'Vui lòng chọn ngày phát sinh' }]}
            hidden={chiPhiForm.getFieldValue('loai_chi_phi') !== 'giuong'}
          >
            <DatePicker
              format="DD/MM/YYYY"
              size="large"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
          <Form.Item
            name="so_tien"
            label="Số tiền (VND)"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền' },
              { type: 'number', min: 0, message: 'Số tiền phải lớn hơn hoặc bằng 0' },
            ]}
            normalize={(value) => (value ? Number(value) : null)}
            hidden={chiPhiForm.getFieldValue('loai_chi_phi') === 'giuong'}
          >
            <Input type="number" placeholder="VD: 500000" size="large" />
          </Form.Item>
          <Form.Item name="ghi_chu" label="Ghi chú">
            <Input.TextArea rows={4} placeholder="Mô tả chi phí" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IndexNoitru;