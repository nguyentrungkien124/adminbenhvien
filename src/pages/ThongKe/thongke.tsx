import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, DatePicker, Button, Table } from 'antd';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const { RangePicker } = DatePicker;
const { Column } = Table;

interface ThongKeResponse {
  bac_si_id: number;
  ten_bac_si: string;
  so_luong_lich_hen: number;
  so_luong_lich_da_kham: string;
  so_luong_lich_da_thanh_toan: string;
}

const ThongKeBacSi: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [data, setData] = useState<ThongKeResponse[]>([]);
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Số lượng lịch hẹn',
        data: [] as number[],
        backgroundColor: '#FF6384',
      },
    ],
  });

  const [totalDoctors, setTotalDoctors] = useState<number>(0);
  const [totalAppointments, setTotalAppointments] = useState<number>(0);
  const [totalEquipment, setTotalEquipment] = useState<number>(0);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);

  const fetchData = async () => {
    if (!dateRange) return;
  
    const [fromDate, toDate] = dateRange;
    const fromDateFormatted = fromDate ? fromDate.format('YYYY-MM-DD') : '';
    const toDateFormatted = toDate ? toDate.format('YYYY-MM-DD') : '';
  
    try {
      // Lấy dữ liệu bác sĩ
      const response = await axios.get('http://localhost:9999/api/thongke/ThongKeSoLuongLichHenCuaTatCaBacSi', {
        params: {
          fromDate: fromDateFormatted,
          toDate: toDateFormatted,
        },
      });
  
      const bacSiData: ThongKeResponse[] = response.data;
      setData(bacSiData);
  
      // Cập nhật dữ liệu cho biểu đồ
      setChartData({
        labels: bacSiData.map((item) => item.ten_bac_si),
        datasets: [
          {
            label: 'Số lượng lịch hẹn',
            data: bacSiData.map((item) => item.so_luong_lich_hen),
            backgroundColor: '#FF6384',
          },
        ],
      });
  
      const statsResponse = await axios.all([
        axios.get('http://localhost:9999/api/thongke/ThongKeTongSoBacSi'),
        axios.get('http://localhost:9999/api/thongke/ThongKeTongLichHen'),
        axios.get('http://localhost:9999/api/thongke/ThongKeTrangThietBi'),
        axios.get('http://localhost:9999/api/thongke/ThongKeTongKhachHang'),
        axios.post('http://localhost:9999/api/thongke/ThongKeDoanhThuTheoKhoangThoiGian', {
          NgayBatDau: fromDateFormatted,
          NgayKetThuc: toDateFormatted,
        }),
      ]);
  
      console.log("Dữ liệu doanh thu:", statsResponse[4]?.data);
  
      setTotalDoctors(statsResponse[0]?.data[0]?.tong_so_bac_si || 0); // Dùng `tong_so_bac_si` thay vì `total`
      setTotalAppointments(statsResponse[1]?.data[0]?.tong_so_lich_hen || 0);
      setTotalEquipment(statsResponse[2]?.data[0]?.tong_so_trang_thiet_bi || 0);
      setTotalCustomers(statsResponse[3]?.data[0]?.tong_so_khach_hang || 0);
  
      // Kiểm tra dữ liệu doanh thu
      const rawRevenue = statsResponse[4]?.data[0]?.tong_doanh_thu;
      console.log("Raw doanh thu:", rawRevenue); // Kiểm tra giá trị raw
  
      // Chuyển đổi doanh thu, loại bỏ dấu phẩy nếu có
      const revenueValue = parseFloat(rawRevenue.replace(',', '') || '0');
      console.log("Doanh thu sau khi parse:", revenueValue); // Kiểm tra giá trị sau khi parse
  
      setRevenue(revenueValue);
  
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    }
  };
  
  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
  };
  const formattedRevenue = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(revenue);
  
  return (
    <div>
      <h2>Thống kê tổng số bác sĩ và doanh thu khách hàng</h2>

      <Row gutter={16}>
        <Col span={12}>
          <RangePicker onChange={handleDateChange} />
        </Col>
        <Col span={12}>
          <Button type="primary" onClick={fetchData}>Lấy dữ liệu thống kê</Button>
        </Col>
      </Row>

      {/* Thẻ thống kê tổng số bác sĩ, lịch hẹn, trang thiết bị, khách hàng và doanh thu */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng số bác sĩ" value={totalDoctors} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng số lịch hẹn" value={totalAppointments} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng số trang thiết bị" value={totalEquipment} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng số khách hàng" value={totalCustomers} />
          </Card>
        </Col>
        <Col span={8}>
        <Card>
  <Statistic title="Doanh thu" value={formattedRevenue} />
</Card>

        </Col>
      </Row>

      {/* Biểu đồ và bảng bác sĩ */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Biểu đồ bác sĩ có lượt khám">
            {data.length > 0 ? (
              <Bar data={chartData} />
            ) : (
              <p>Chưa có dữ liệu</p>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Danh sách bác sĩ có lượt khám nhiều">
            <Table dataSource={data} rowKey="bac_si_id">
              <Column title="Tên bác sĩ" dataIndex="ten_bac_si" key="ten_bac_si" />
              <Column title="Số lượng lịch hẹn" dataIndex="so_luong_lich_hen" key="so_luong_lich_hen" />
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ThongKeBacSi;