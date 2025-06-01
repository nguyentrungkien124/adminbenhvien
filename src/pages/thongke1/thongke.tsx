import React, { useState, useEffect } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  DatePicker, 
  Space, 
  message, 
  Spin, 
  Typography,
  Layout,
  ConfigProvider,
  theme
} from "antd";
import { RangePickerProps } from "antd/es/date-picker";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { 
  TeamOutlined, 
  UserOutlined, 
  MedicineBoxOutlined, 
  CalendarOutlined,
  HomeOutlined,
  LineChartOutlined,
  PieChartOutlined,
  BarChartOutlined
} from '@ant-design/icons';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Định nghĩa kiểu dữ liệu
interface Inpatient {
  admission_id: number;
  appointment_id: number;
  khach_hang_id: number;
  ho_ten: string;
  so_dien_thoai: string;
  trieu_chung: string;
  ket_qua_kham: string;
  khoa_name: string;
  bac_si_name: string;
  room_name: string;
  bed_code: string;
  ngay_nhap_vien: string;
}

interface PatientStats {
  stat_type: string;
  value: number | null;
  detail: string | null;
}

interface InpatientStats {
  stat_type: string;
  value: number | null;
  detail: string | null;
}

interface OnlineAppointmentStats {
  stat_type: string;
  value: number | null;
  detail: string | null;
}

interface BedStats {
  stat_type: string;
  value: number | null;
  detail: string | null;
}

interface SessionUser {
  id: number;
  name: string;
  email: string;
  khoa_id: number;
  role: string;
  bac_si_id: number;
}

const { RangePicker } = DatePicker;
const { Title: AntTitle, Text } = Typography;
const { Content } = Layout;

const StatisticsPage: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(1, 'month'),
    dayjs().endOf("day"),
  ]);
  const [khoaId, setKhoaId] = useState<number | null>(null);
  const [inpatients, setInpatients] = useState<Inpatient[]>([]);
  const [patientStats, setPatientStats] = useState<PatientStats[]>([]);
  const [inpatientStats, setInpatientStats] = useState<InpatientStats[]>([]);
  const [onlineStats, setOnlineStats] = useState<OnlineAppointmentStats[]>([]);
  const [bedStats, setBedStats] = useState<BedStats[]>([]);
  const [loading, setLoading] = useState(false);
   const [khoaName, setKhoaName] = useState<string>('Không có khoa'); // State để lưu tên khoa
  
    // Lấy thông tin từ session
    const storedUser = sessionStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : {};
    const khoaId1 = user.khoa_id;
  
    console.log('User Info:', khoaId);
    useEffect(() => {
    const fetchKhoaName = async () => {
      if (khoaId) {
        try {
          const response = await axios.get(`http://localhost:9999/api/khoa/getkhoabyid/${khoaId}`);
          const khoaData = response.data; // Giả sử API trả về dạng { id: number, ten: string }
          console.log('Khoa Data:', khoaData);
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


  // Helper function to safely process API response
  const processApiResponse = <T,>(response: any): T[] => {
    try {
      if (!response || !response.data) {
        console.warn('Empty response received');
        return [];
      }

      let data = response.data;
      
      // If data is an array and has elements
      if (Array.isArray(data)) {
        // If the first element is also an array, use it
        if (data.length > 0 && Array.isArray(data[0])) {
          data = data[0];
        }
        // If data is already a flat array of the expected format, use it directly
        return Array.isArray(data) ? data : [];
      }
      
      // If data is not an array, wrap it in an array
      return [data];
    } catch (error) {
      console.error('Error processing API response:', error);
      return [];
    }
  };

  // Lấy khoa_id từ session user khi component mount
  useEffect(() => {
    const fetchSessionUser = () => {
      try {
        const sessionUser = sessionStorage.getItem('user');
        if (sessionUser) {
          const user: SessionUser = JSON.parse(sessionUser);
          setKhoaId(user.khoa_id);
        } else {
          message.error("Không tìm thấy thông tin người dùng trong session!");
        }
      } catch (error) {
        message.error("Lỗi khi lấy thông tin người dùng từ session!");
      }
    };

    fetchSessionUser();
  }, []);

  // Hàm lấy dữ liệu từ API
  const fetchData = async () => {
    if (khoaId === null) {
      return;
    }

    setLoading(true);
    try {
      const startDate = dateRange[0].format("YYYY-MM-DD");
      const endDate = dateRange[1].format("YYYY-MM-DD");

      // Lấy danh sách bệnh nhân nội trú
      try {
        const inpatientsResponse = await axios.post(
          "http://localhost:9999/api/thongke/GetInpatients",
          { khoa_id: khoaId }
        );
        const inpatientsData = processApiResponse<Inpatient>(inpatientsResponse);
        setInpatients(inpatientsData);
      } catch (error) {
        console.error('Error fetching inpatients:', error);
        setInpatients([]);
      }

      // Lấy thống kê bệnh nhân
      try {
        const patientStatsResponse = await axios.post(
          "http://localhost:9999/api/thongke/GetPatientStats",
          { start_date: startDate, end_date: endDate, period: "monthly", khoa_id: khoaId }
        );
        const patientStatsData = processApiResponse<PatientStats>(patientStatsResponse);
        setPatientStats(patientStatsData);
      } catch (error) {
        console.error('Error fetching patient stats:', error);
        setPatientStats([]);
      }

      // Lấy thống kê bệnh nhân nội trú
      try {
        const inpatientStatsResponse = await axios.post(
          "http://localhost:9999/api/thongke/GetInpatientStats",
          { start_date: startDate, end_date: endDate, khoa_id: khoaId }
        );
        const inpatientStatsData = processApiResponse<InpatientStats>(inpatientStatsResponse);
        setInpatientStats(inpatientStatsData);
      } catch (error) {
        console.error('Error fetching inpatient stats:', error);
        setInpatientStats([]);
      }

      // Lấy thống kê lịch hẹn online
      try {
        const onlineStatsResponse = await axios.post(
          "http://localhost:9999/api/thongke/GetOnlineAppointmentStats",
          { start_date: startDate, end_date: endDate, khoa_id: khoaId }
        );
        const onlineStatsData = processApiResponse<OnlineAppointmentStats>(onlineStatsResponse);
        setOnlineStats(onlineStatsData);
      } catch (error) {
        console.error('Error fetching online stats:', error);
        setOnlineStats([]);
      }

      // Lấy thống kê giường bệnh
      try {
        const bedStatsResponse = await axios.post(
          "http://localhost:9999/api/thongke/GetBedStats",
          { khoa_id: khoaId }
        );
        const bedStatsData = processApiResponse<BedStats>(bedStatsResponse);
        setBedStats(bedStatsData);
      } catch (error) {
        console.error('Error fetching bed stats:', error);
        setBedStats([]);
      }
    } catch (error) {
      console.error('General error in fetchData:', error);
      message.error("Không thể tải dữ liệu thống kê!");
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetchData khi khoaId hoặc dateRange thay đổi
  useEffect(() => {
    if (khoaId !== null) {
      fetchData();
    }
  }, [dateRange, khoaId]);

  // Xử lý thay đổi khoảng thời gian
  const onDateRangeChange: RangePickerProps["onChange"] = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  // Helper function to safely find stats
// Helper function to safely find stats and convert to integer
const findStat = (stats: any[], statType: string): number => {
  if (!Array.isArray(stats)) {
    console.warn(`Stats is not an array:`, stats);
    return 0;
  }
  const stat = stats.find((stat) => stat?.stat_type === statType);
  const value = stat?.value || 0;
  return parseInt(value.toString(), 10); // Chuyển đổi thành số nguyên
};

  // Tìm số liệu tổng quan từ các API
  const totalPatients = findStat(patientStats, "total_patients");
  const ngoaiTru = findStat(patientStats, "ngoai_tru");
  const noiTru = findStat(patientStats, "noi_tru");
  const currentInpatients = findStat(inpatientStats, "current_inpatients");
  const discharged = findStat(inpatientStats, "discharged");
  const tinhTrangOnDinh = findStat(inpatientStats, "tinh_trang_on_dinh");
  const tinhTrangNghiemTrong = findStat(inpatientStats, "tinh_trang_nghiem_trong");

  // Thống kê từ GetOnlineAppointmentStats
  const totalAppointments = findStat(onlineStats, "total_appointments");
  const confirmedAppointments = findStat(onlineStats, "confirmed");
  const confirmedPercentage = findStat(onlineStats, "confirmed_percentage");
  const cancelledPercentage = findStat(onlineStats, "cancelled_percentage");

  // Thống kê từ GetBedStats
  const totalBeds = findStat(bedStats, "total_beds");
  const occupiedBeds = findStat(bedStats, "occupied");
  const vacantBeds = findStat(bedStats, "vacant");

  // Dữ liệu cho biểu đồ Pie (Tình trạng bệnh nhân từ GetInpatientStats)
  const pieData = {
    labels: ["Ổn định", "Nghiêm trọng"],
    datasets: [
      {
        data: [tinhTrangOnDinh || 0, tinhTrangNghiemTrong || 0],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverOffset: 4,
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Tình trạng bệnh nhân" },
    },
  };

  // Dữ liệu cho biểu đồ Bar (Số lượng bệnh nhân từ GetPatientStats)
  const barData = {
    labels: ["Tổng bệnh nhân", "Ngoại trú", "Nội trú"],
    datasets: [
      {
        label: "Số lượng",
        data: [totalPatients, ngoaiTru, noiTru],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        borderColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        borderWidth: 1,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Thống kê bệnh nhân" },
    },
  };

  // Dữ liệu cho biểu đồ Pie (Tỷ lệ xác nhận lịch hẹn từ GetOnlineAppointmentStats)
  const onlinePieData = {
    labels: ["Xác nhận", "Hủy"],
    datasets: [
      {
        data: [confirmedPercentage || 0, cancelledPercentage || 0],
        backgroundColor: ["#4CAF50", "#FF5733"],
        hoverOffset: 4,
      },
    ],
  };
  const onlinePieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Tỷ lệ lịch hẹn online" },
    },
  };

  // Dữ liệu cho biểu đồ Bar (Số giường trống theo phòng từ GetBedStats)
  const vacantBedsByRoom = Array.isArray(bedStats) 
    ? bedStats.filter((stat) => stat?.stat_type?.startsWith("vacant_in_room_"))
    : [];
  const roomLabels = vacantBedsByRoom.map((stat) => stat.stat_type.replace("vacant_in_room_", ""));
  const roomVacantData = vacantBedsByRoom.map((stat) => stat.value || 0);

  const bedBarData = {
    labels: roomLabels,
    datasets: [
      {
        label: "Số giường trống",
        data: roomVacantData,
        backgroundColor: "#42A5F5",
        borderColor: "#1E88E5",
        borderWidth: 1,
      },
    ],
  };
  const bedBarOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Số giường trống theo phòng" },
    },
  };

  // Cột cho bảng bệnh nhân nội trú
//   const inpatientColumns = [
//     { 
//       title: "Mã nhập viện", 
//       dataIndex: "admission_id", 
//       key: "admission_id",
//       render: (text: string) => <Text strong>{text}</Text>
//     },
//     { 
//       title: "Tên bệnh nhân", 
//       dataIndex: "ho_ten", 
//       key: "ho_ten",
//       render: (text: string) => <Text>{text}</Text>
//     },
//     { 
//       title: "Số điện thoại", 
//       dataIndex: "so_dien_thoai", 
//       key: "so_dien_thoai" 
//     },
//     { 
//       title: "Triệu chứng", 
//       dataIndex: "trieu_chung", 
//       key: "trieu_chung",
//       ellipsis: true
//     },
//     { 
//       title: "Kết quả khám", 
//       dataIndex: "ket_qua_kham", 
//       key: "ket_qua_kham",
//       ellipsis: true
//     },
//     { 
//       title: "Phòng", 
//       dataIndex: "room_name", 
//       key: "room_name" 
//     },
//     { 
//       title: "Mã giường", 
//       dataIndex: "bed_code", 
//       key: "bed_code" 
//     },
//     { 
//       title: "Ngày nhập viện", 
//       dataIndex: "ngay_nhap_vien", 
//       key: "ngay_nhap_vien",
//       render: (text: string) => dayjs(text).format('DD/MM/YYYY')
//     },
//   ];

  return (
    <Layout style={{ padding: '24px', background: colorBgContainer }}>
      <Content style={{ padding: '24px', background: colorBgContainer, borderRadius: borderRadiusLG }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <AntTitle level={3} style={{ margin: 0 }}>
            <LineChartOutlined /> Thống kê {khoaName ? `khoa ${khoaName}` : ' - Tất cả khoa'}
          </AntTitle>
          
          {/* Bộ lọc thời gian */}
          <Space>
            <RangePicker
              value={dateRange}
              onChange={onDateRangeChange}
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current > dayjs().endOf("day")}
              style={{ width: 250 }}
            />
          </Space>
        </div>

        {/* Hiển thị loading */}
        {loading && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        )}

        {/* Thẻ thống kê hàng 1 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} hoverable>
              <Statistic 
                title="Tổng bệnh nhân" 
                value={totalPatients} 
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#3f8600' }}
                loading={loading} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} hoverable>
              <Statistic 
                title="Bệnh nhân nội trú" 
                value={noiTru} 
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#1890ff' }}
                loading={loading} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} hoverable>
              <Statistic 
                title="Bệnh nhân ngoại trú" 
                value={ngoaiTru} 
                prefix={<UserOutlined />}
                valueStyle={{ color: '#faad14' }}
                loading={loading} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} hoverable>
              <Statistic 
                title="Bệnh nhân hiện tại" 
                value={currentInpatients} 
                prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
                loading={loading} 
              />
            </Card>
          </Col>
        </Row>

        {/* Thẻ thống kê hàng 2 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} hoverable>
              <Statistic 
                title="Tổng lịch hẹn online" 
                value={totalAppointments} 
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#13c2c2' }}
                loading={loading} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} hoverable>
              <Statistic 
                title="Lịch hẹn xác nhận" 
                value={confirmedAppointments} 
                prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
                loading={loading} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} hoverable>
              <Statistic 
                title="Tổng số giường" 
                value={totalBeds} 
                prefix={<HomeOutlined />}
                valueStyle={{ color: '#fa8c16' }}
                loading={loading} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} hoverable>
              <Statistic 
                title="Giường trống" 
                value={vacantBeds} 
                prefix={<HomeOutlined style={{ color: '#389e0d' }} />}
                valueStyle={{ color: '#389e0d' }}
                loading={loading} 
              />
            </Card>
          </Col>
        </Row>

        {/* Biểu đồ hàng 1 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} md={12}>
            <Card 
              title={
                <span>
                  <BarChartOutlined /> Thống kê bệnh nhân
                </span>
              }
              bordered={false}
              hoverable
            >
              <Bar data={barData} options={barOptions} height={250} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card 
              title={
                <span>
                  <PieChartOutlined /> Tình trạng bệnh nhân
                </span>
              }
              bordered={false}
              hoverable
            >
              <Pie data={pieData} options={pieOptions} height={250} />
            </Card>
          </Col>
        </Row>

        {/* Biểu đồ hàng 2 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} md={12}>
            <Card 
              title={
                <span>
                  <PieChartOutlined /> Tỷ lệ lịch hẹn online
                </span>
              }
              bordered={false}
              hoverable
            >
              <Pie data={onlinePieData} options={onlinePieOptions} height={250} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card 
              title={
                <span>
                  <BarChartOutlined /> Số giường trống theo phòng
                </span>
              }
              bordered={false}
              hoverable
            >
              <Bar data={bedBarData} options={bedBarOptions} height={250} />
            </Card>
          </Col>
        </Row>

        {/* Bảng bệnh nhân nội trú */}
        {/* <Card
          title={
            <span>
              <TeamOutlined /> Danh Sách Bệnh Nhân Nội Trú
            </span>
          }
          bordered={false}
          hoverable
        >
          <Table
            // columns={inpatientColumns}
            dataSource={inpatients}
            rowKey="admission_id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} bệnh nhân`
            }}
            scroll={{ x: true }}
          />
        </Card> */}
      </Content>
    </Layout>
  );
};

export default StatisticsPage;