
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
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { Dropdown, Menu } from 'antd'; // Thêm Dropdown và Menu từ Ant Design
import { DownOutlined } from '@ant-design/icons'; // Thêm icon cho Dropdown
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// ... (Interfaces remain unchanged: Inpatient, Room, Bed, InpatientStats, DienBien, ChiDinhThuoc, Kho, ChiPhi, TongChiPhi)
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
}

interface Kho {
  kho_id: number;
  ten_san_pham: string;
  don_vi_tinh: string;
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

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const khoaId = user.khoa_id;
  const khoaName = user.khoa_name || 'Tim mạch';
  const bacSiId = user.bac_si_id;

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

        console.log('API /api/noitru/getdsNoitru response:', inpatientsRes.data);
        console.log('API /api/noitru/kho response:', khoRes.data);
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
        console.log('Processed khoList:', khoData);
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
      const response = await axios.post(`http://localhost:9999/api/noitru/chuyenGiuong`, {
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
        // axios.get(`http://localhost:9999/api/noitru/chi-dinh-thuoc/${inpatient.admission_id}`),
        axios.get(`http://localhost:9999/api/noitru/chi-dinh-thuoc/${inpatient.admission_id}?null`),
        axios.get(`http://localhost:9999/api/noitru/chi-phi/${inpatient.admission_id}`),
        axios.get(`http://localhost:9999/api/noitru/tong-chi-phi/${inpatient.admission_id}`),
      ]);
      console.log('API /api/noitru/dien-bien response:', dienBienResponse.data);
      console.log('API /api/noitru/chi-dinh-thuoc response:', chiDinhThuocResponse.data);
      console.log('API /api/noitru/chi-phi response:', chiPhiResponse.data);
      console.log('API /api/noitru/tong-chi-phi response:', tongChiPhiResponse.data);
      console.log('Setting tongChiPhi for Chi phí tab:', tongChiPhiResponse.data.data);
      setSelectedInpatient(inpatient);
      setDienBienList(dienBienResponse.data.data || []);
      setChiDinhThuocList(chiDinhThuocResponse.data.data || []);
      setChiPhiList(chiPhiResponse.data.data || []);
      setTongChiPhi(tongChiPhiResponse.data.data || null);
      setIsDetailsModalVisible(true);
    } catch (error: any) {
      console.error('Error fetching details:', error);
      message.error(error.response?.data?.message || 'Không thể tải chi tiết');
    } finally {
      setLoading(false);
    }
  };

  const showDienBienModal = (admissionId: number) => {
    console.log('showDienBienModal called with admissionId:', admissionId);
    setSelectedAdmissionId(admissionId);
    setIsDienBienModalVisible(true);
  };

  const showChiDinhThuocModal = (admissionId: number) => {
    console.log('showChiDinhThuocModal called with admissionId:', admissionId);
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
      console.log('Calling API /api/noitru/dien-bien with data:', data);
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
      const data = {
        admission_id: selectedAdmissionId,
        kho_id: values.kho_id,
        so_luong: Number(values.so_luong),
        lieu_luong: values.lieu_luong,
        tan_suat: values.tan_suat,
        nguoi_chi_dinh_id: bacSiId,
      };
      console.log('Calling API /api/noitru/chi-dinh-thuoc with data:', data);
      const response = await axios.post('http://localhost:9999/api/noitru/chi-dinh-thuoc', data);
      message.success(response.data.message || 'Chỉ định thuốc thành công');
      setIsChiDinhThuocModalVisible(false);
      chiDinhThuocForm.resetFields();

      if (selectedInpatient && selectedInpatient.admission_id === selectedAdmissionId) {
        const chiDinhThuocResponse = await axios.get(`http://localhost:9999/api/noitru/chi-dinh-thuoc/${selectedAdmissionId}`);
        setChiDinhThuocList(chiDinhThuocResponse.data.data || []);
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
        console.log('Calling API /api/noitru/chi-phi-giuong with data:', data);
        response = await axios.post('http://localhost:9999/api/noitru/chi-phi-giuong', data);
      } else {
        const data = {
          admission_id: selectedAdmissionId,
          loai_chi_phi: values.loai_chi_phi,
          so_tien: Number(values.so_tien),
          ghi_chu: values.ghi_chu || '',
        };
        console.log('Calling API /api/noitru/chi-phi with data:', data);
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
    title: 'Hành động',
    key: 'action',
    width: 250, // Giảm width vì đã thu gọn bằng Dropdown
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
        }}
        footer={null}
        width={1000}
      >
        {selectedInpatient && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="Thông tin" key="info">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Họ tên">{selectedInpatient.ho_ten}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{selectedInpatient.so_dien_thoai}</Descriptions.Item>
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
          console.log('Modal onOk triggered');
          try {
            await dienBienForm.validateFields();
            dienBienForm.submit();
          } catch (error) {
            console.error('Form validation failed:', error);
            message.error('Vui lòng kiểm tra lại dữ liệu nhập');
          }
        }}
        onCancel={() => {
          console.log('Modal onCancel triggered');
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
            console.log('Form onFinish triggered with values:', values);
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
        onOk={async () => {
          console.log('Modal chiDinhThuoc onOk triggered');
          try {
            await chiDinhThuocForm.validateFields();
            chiDinhThuocForm.submit();
          } catch (error) {
            console.error('Form validation failed:', error);
            message.error('Vui lòng kiểm tra lại dữ liệu nhập');
          }
        }}
        onCancel={() => {
          console.log('Modal chiDinhThuoc onCancel triggered');
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
            console.log('Form chiDinhThuoc onFinish triggered with values:', values);
            handleAddChiDinhThuoc(values);
          }}
          layout="vertical"
          initialValues={{ kho_id: null, so_luong: null, lieu_luong: '', tan_suat: '' }}
        >
          <Form.Item
            name="kho_id"
            label="Chọn thuốc"
            rules={[{ required: true, message: 'Vui lòng chọn thuốc' }]}
          >
            <Select placeholder="Chọn thuốc" size="large" disabled={!khoList.length}>
              {Array.isArray(khoList) && khoList.length > 0 ? (
                khoList.map((thuoc) => (
                  <Option key={thuoc.kho_id} value={thuoc.kho_id}>
                    {thuoc.ten_san_pham} ({thuoc.don_vi_tinh})
                  </Option>
                ))
              ) : (
                <Option disabled value={null}>
                  Không có thuốc khả dụng
                </Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item
            name="so_luong"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' },
            ]}
            normalize={(value) => (value ? Number(value) : null)}
          >
            <Input type="number" placeholder="VD: 10" size="large" />
          </Form.Item>
          <Form.Item
            name="lieu_luong"
            label="Liều lượng"
            rules={[{ required: true, message: 'Vui lòng nhập liều lượng' }]}
          >
            <Input placeholder="VD: 2 viên/ngày" size="large" />
          </Form.Item>
          <Form.Item
            name="tan_suat"
            label="Tần suất"
            rules={[{ required: true, message: 'Vui lòng nhập tần suất' }]}
          >
            <Input placeholder="VD: 2 lần/ngày" size="large" />
          </Form.Item>
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
            console.log('Form chiPhi onFinish triggered with values:', values);
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
