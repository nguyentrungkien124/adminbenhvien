import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, DatePicker, Button, Table } from 'antd';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const { RangePicker } = DatePicker;
const { Column } = Table;

// Định nghĩa kiểu dữ liệu cho sản phẩm bán chạy
interface Product {
  maSanPham: number;
  tenSanPham: string;
  anhDaiDien: string;
  tongSoLuong: number;
  gia: number;
  tenSize: string | null;
}

// Định nghĩa kiểu dữ liệu cho phản hồi API về sản phẩm bán chạy
interface ThongKeSPBanChayResponse {
  totalItems: number;
  data: Product[];
  page: number;
  pageSize: number;
}

const Thongke: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [thongKeData, setThongKeData] = useState({
    soDonHang: 0,
    doanhThu: 0,
    soLuongSP: 0,
  });
  const [soLuongKhach, setSoLuongKhach] = useState(0);
  const [sanPhamBanChay, setSanPhamBanChay] = useState<Product[]>([]);

  useEffect(() => {
    if (!dateRange) {
      return;
    }

    const [fromDate, toDate] = dateRange;
    const fromDateFormatted = fromDate ? fromDate.format('YYYY-MM-DD') : '';
    const toDateFormatted = toDate ? toDate.format('YYYY-MM-DD') : '';

    // Lấy dữ liệu thống kê doanh thu
    axios
      .get(`https://localhost:44381/api/ThongKe/ThongKeDoanhThu?fr_NgayTao=${fromDateFormatted}&to_NgayTao=${toDateFormatted}`)
      .then((response) => {
        setThongKeData(response.data);
      })
      .catch((error) => {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
      });

    // Lấy dữ liệu khách hàng
    axios
      .post('https://localhost:44381/api/ThongKe/ThongKeKhach', {
        page: 1,
        pageSize: 10,
        fr_NgayTao: fromDateFormatted,
        to_NgayTao: toDateFormatted,
      })
      .then((response) => {
        setSoLuongKhach(response.data.totalItems);
      })
      .catch((error) => {
        console.error('Lỗi khi lấy dữ liệu khách hàng:', error);
      });

    // Lấy dữ liệu sản phẩm bán chạy
    axios
      .post(`https://localhost:44381/api/ThongKe/ThongKe_SP_BanChay`, {
        page: 1,
        pageSize: 10,
      })
      .then((response) => {
        const { data }: ThongKeSPBanChayResponse = response.data;
        setSanPhamBanChay(data);
      })
      .catch((error) => {
        console.error('Lỗi khi lấy dữ liệu sản phẩm bán chạy:', error);
      });
  }, [dateRange]);

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
  };



  // Chuyển đổi dữ liệu cho biểu đồ tròn
  const labels = sanPhamBanChay.map(product => product.tenSanPham);
  const dataSet = sanPhamBanChay.map(product => product.tongSoLuong);

  // Cập nhật dữ liệu biểu đồ tròn cho thống kê sản phẩm bán chạy
  const pieDataSPBanChay = {
    labels,
    datasets: [
      {
        data: dataSet,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FFCD56', '#FF6384'], // Thêm màu sắc đa dạng
      },
    ],
  };


  return (
    <div>
      <h2>Thống kê</h2>

      <Row gutter={16}>
        <Col span={12}>
          <RangePicker onChange={handleDateChange} />
        </Col>
        <Col span={12}>
          <Button
            type="primary"
            onClick={() => {
              if (dateRange) {
                const [fromDate, toDate] = dateRange;
                const fromDateFormatted = fromDate ? fromDate.format('YYYY-MM-DD') : '';
                const toDateFormatted = toDate ? toDate.format('YYYY-MM-DD') : '';

                // Lấy dữ liệu thống kê doanh thu
                axios
                  .get(`https://localhost:44381/api/ThongKe/ThongKeDoanhThu?fr_NgayTao=${fromDateFormatted}&to_NgayTao=${toDateFormatted}`)
                  .then((response) => {
                    setThongKeData(response.data);
                  })
                  .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
                  });

                // Lấy dữ liệu khách hàng
                axios
                  .post('https://localhost:44381/api/ThongKe/ThongKeKhach', {
                    page: 1,
                    pageSize: 10,
                    fr_NgayTao: fromDateFormatted,
                    to_NgayTao: toDateFormatted,
                  })
                  .then((response) => {
                    setSoLuongKhach(response.data.totalItems);
                  })
                  .catch((error) => {
                    console.error('Lỗi khi lấy dữ liệu khách hàng:', error);
                  });
              }
            }}
          >
            Lấy dữ liệu thống kê
          </Button>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card style={{ backgroundColor: '#FF6384' }}>
            <Statistic title="Số đơn hàng" value={thongKeData.soDonHang} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ backgroundColor: '#36A2EB' }}>
            <Statistic
              title="Doanh thu"
              value={thongKeData.doanhThu}
              suffix=" VNĐ"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card style={{ backgroundColor: '#FFCE56' }}>
            <Statistic title="Số lượng sản phẩm bán" value={thongKeData.soLuongSP} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ backgroundColor: '#4BC0C0' }}>
            <Statistic title="Khách hàng mới" value={soLuongKhach} />
          </Card>
        </Col>

      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        {/* Thay thế biểu đồ cột bằng biểu đồ tròn cho sản phẩm bán chạy */}
        <Col span={13}>
          <Card title="Biểu đồ tròn sản phẩm bán chạy">
            <Pie data={pieDataSPBanChay} />
          </Card>
        </Col>

        {/* Thêm phần hiển thị danh sách sản phẩm bán chạy */}
        <Col span={11} >
          <Card title="Sản phẩm bán chạy">
            <Table dataSource={sanPhamBanChay} rowKey="maSanPham">
              <Column title="Tên sản phẩm" dataIndex="tenSanPham" key="tenSanPham" />
              <Column title="Số lượng bán" dataIndex="tongSoLuong" key="tongSoLuong" />
              <Column title="Giá" dataIndex="gia" key="gia" />
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Thongke;
