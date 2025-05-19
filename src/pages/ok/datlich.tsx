import { faCalendarAlt, faChevronRight, faCircleLeft, faCircleRight, faHospital, faMedkit, faMoneyBillWave, faStethoscope } from "@fortawesome/free-solid-svg-icons";
import "../ok/datlich.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Form, Input, Select, DatePicker, TimePicker, message, Row, Col, Card } from 'antd';
import moment from 'moment';
import 'antd/dist/reset.css';

interface Shift {
  id: string;
  bac_si_id: number;
  ngay_lam_viec: string;
  gio_bat_dau: string;
  gio_ket_thuc: string;
  trang_thai: number;
  ghi_chu?: string;
  dat_lich_id?: number;
  nguoi_dung_id?: number;
  ten_khach_hang?: string;
  ngay_hen?: string;
  ca_dat?: string;
  trang_thai_dat_lich?: number;
  RowNumber?: number;
  RecordCount?: string;
  PageCount?: number;
  gia?: string;
}

interface DoctorInfo {
  id: number;
  name: string;
  specialty: string;
  gia: string;
}

const { Option } = Select;

const Banglichlamviecbybs = () => {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentDate, setCurrentDate] = useState(new Date().getDate());
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [shiftData, setShiftData] = useState<Shift[]>([]);
  const [paidShifts, setPaidShifts] = useState<number[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [noShiftsMessage, setNoShiftsMessage] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const today = new Date();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const bacSiId = user.bac_si_id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  // Fetch available days
  useEffect(() => {
    const fetchAvailableDays = async () => {
      if (!bacSiId) return;

      try {
        const response = await axios.get(
          `http://localhost:9999/api/lichlamviec/getlichlamviecbyidbs/${bacSiId}`,
          {
            params: { month: month + 1, year },
          }
        );
        console.log("Dữ liệu:", response.data);
        const todayForComparison = new Date();
        todayForComparison.setHours(0, 0, 0, 0);

        const futureAvailableDays = response.data.filter((item: any) => {
          const ngayLamViec = new Date(item.ngay_lam_viec);
          ngayLamViec.setHours(0, 0, 0, 0);
          return ngayLamViec >= todayForComparison;
        });

        const daysInCurrentMonth = futureAvailableDays
          .filter((item: any) => {
            const ngayLamViec = new Date(item.ngay_lam_viec);
            return (
              ngayLamViec.getMonth() === month &&
              ngayLamViec.getFullYear() === year
            );
          })
          .map((item: any) => new Date(item.ngay_lam_viec).getDate());

        setAvailableDays(daysInCurrentMonth);
      } catch (error) {
        console.error("Lỗi khi lấy ngày có lịch:", error);
      }
    };

    fetchAvailableDays();
  }, [bacSiId, month, year]);

  // Fetch shift data using the new API
  const fetchShiftData = async (day: number) => {
    if (!bacSiId) return;

    try {
      // Đặt lại shiftData trước khi lấy dữ liệu mới
      setShiftData([]);
      setNoShiftsMessage(null);

      const formattedMonth = (month + 1).toString().padStart(2, '0');
      const formattedDay = day.toString().padStart(2, '0');
      const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;

      const response = await axios.get(
        `http://localhost:9999/api/lichlamviec/getLichLamViecByBacSiAndDate1/${bacSiId}/${formattedDate}/1/10`
      );

      console.log("Dữ liệu ca làm:", response.data);

      if (Array.isArray(response.data)) {
        const filteredShifts = response.data.filter(
          (shift: Shift) =>  !paidShifts.includes(Number(shift.id))
        );

        console.log("Ca làm đã lọc:", filteredShifts);

        setShiftData(filteredShifts);

        if (filteredShifts.length === 0) {
          setNoShiftsMessage("Ngày làm việc hôm nay đã hết ca làm việc. Vui lòng chọn ngày khác!!");
        } else {
          setNoShiftsMessage(null);
        }
      } else {
        console.error("Lỗi:", response.data.message);
        setShiftData([]);
        setNoShiftsMessage("Ngày làm việc hôm nay đã hết ca làm việc.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu ca làm:", error);
      setNoShiftsMessage("Có lỗi xảy ra khi lấy dữ liệu ca làm.");
    }
  };

  const handleDayClick = (day: number) => {
    setCurrentDate(day);
    setSelectedShift(null); // Đặt lại chi tiết ca làm việc khi chọn ngày mới
    fetchShiftData(day);
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setMonth((prevMonth) => {
      if (direction === "prev") {
        if (prevMonth === 0) {
          setYear((prevYear) => prevYear - 1);
          return 11;
        }
        return prevMonth - 1;
      } else {
        if (prevMonth === 11) {
          setYear((prevYear) => prevYear + 1);
          return 0;
        }
        return prevMonth + 1;
      }
    });
    setShiftData([]); // Đặt lại shiftData khi thay đổi tháng
    setNoShiftsMessage(null);
    setSelectedShift(null);
  };

  const renderDays = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const lastDayOfWeek = new Date(year, month, daysInMonth).getDay();
    const previousMonthDays = new Date(year, month, 0).getDate();
    const nextMonthDays = 6 - lastDayOfWeek;

    const renderPreviousMonthDays = () =>
      Array.from({ length: firstDayOfWeek }, (_, i) => {
        const prevMonthDay = previousMonthDays - firstDayOfWeek + i + 1;
        return (
          <div key={`prev-${prevMonthDay}`} className="styles_dayCell empty">
            <span className="styles_previousMonthDay">{prevMonthDay}</span>
          </div>
        );
      });

    const renderCurrentMonthDays = () =>
      Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const isSelected = day === currentDate;
        const isAvailable = availableDays.includes(day);

        return (
          <div
            key={day}
            className={`styles_dayCell ${isToday ? "styles_NowDay" : ""} ${isSelected ? "styles_SelectedDay" : ""} ${isAvailable ? "styles_availableDay" : ""}`}
            onClick={() => isAvailable && handleDayClick(day)}
          >
            <span>{day}</span>
          </div>
        );
      });

    const renderNextMonthDays = () =>
      Array.from({ length: nextMonthDays }, (_, i) => {
        const nextMonthDay = i + 1;
        return (
          <div key={`next-${nextMonthDay}`} className="styles_dayCell empty">
            <span className="styles_nextMonthDay">{nextMonthDay}</span>
          </div>
        );
      });

    return [
      ...renderPreviousMonthDays(),
      ...renderCurrentMonthDays(),
      ...renderNextMonthDays(),
    ];
  };

  const filterShiftsByTime = (startHour: number, endHour: number) =>
    shiftData.filter((shift) => {
      const hour = parseInt(shift.gio_bat_dau.split(":")[0], 10);
      return hour >= startHour && hour < endHour;
    });

  const morningShifts = filterShiftsByTime(6, 12);
  const afternoonShifts = filterShiftsByTime(12, 18);

  const renderShiftList = (shifts: Shift[]) => (
    <ul className="giokham_listShifts">
      {shifts.map((shift) => {
        const startHour = shift.gio_bat_dau.split(":")[0].padStart(2, "0");
        const startMinute = shift.gio_bat_dau.split(":")[1];
        const endHour = shift.gio_ket_thuc.split(":")[0].padStart(2, "0");
        const endMinute = shift.gio_ket_thuc.split(":")[1];

        return (
          <li key={shift.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <button
              className="giokham_btnTime"
              style={{ background: "#fff", marginRight: '10px' }}
              onClick={() => setSelectedShift(shift)}
            >
              <span>{`${startHour}:${startMinute} - ${endHour}:${endMinute}`}</span>
            </button>
            <span style={{ color: shift.ten_khach_hang ? 'red' : 'green' }}>
              {shift.ten_khach_hang ? `(${shift.ten_khach_hang})` : '(Trống)'}
            </span>
          </li>
        );
      })}
    </ul>
  );

  const renderShiftDetail = () => {
    if (!selectedShift) return null;

    return (
      <Card title="Chi Tiết Ca Làm Việc" style={{ marginTop: 16 }}>
        <p><strong>Thời gian:</strong> {`${selectedShift.gio_bat_dau} - ${selectedShift.gio_ket_thuc}`}</p>
        <p><strong>Ngày làm việc:</strong> {moment(selectedShift.ngay_lam_viec).format('YYYY-MM-DD')}</p>
        <p><strong>Trạng thái:</strong> {selectedShift.ten_khach_hang ? 'Đã đặt' : 'Trống'}</p>
        {selectedShift.ten_khach_hang && (
          <>
            <p><strong>Khách hàng:</strong> {selectedShift.ten_khach_hang}</p>
            <p><strong>Ngày hẹn:</strong> {moment(selectedShift.ngay_hen).format('YYYY-MM-DD')}</p>
            <p><strong>Ca đặt:</strong> {selectedShift.ca_dat}</p>
            <p><strong>Ghi chú:</strong> {selectedShift.ghi_chu || 'Không có'}</p>
          </>
        )}
        <Button onClick={() => setSelectedShift(null)}>Đóng</Button>
      </Card>
    );
  };

  const handleShiftClick = (shift: Shift) => {
    const userLoggedIn = sessionStorage.getItem("ho_ten");

    if (!userLoggedIn) {
      navigate("/Dangnhap");
      return;
    }

    const doctorName = doctorInfo?.name || "Chưa chọn bác sĩ";
    const doctorSpecialty = doctorInfo?.specialty || "Chưa chọn chuyên khoa";
    const gia = doctorInfo?.gia;
    const date = `${year}-${month + 1}-${currentDate}`;

    const selectedDate = new Date(year, month, currentDate);
    const formattedDate = selectedDate.toISOString().split('T')[0];

    sessionStorage.setItem(
      "selectedAppointment",
      JSON.stringify({
        date: formattedDate,
        shift,
        doctorName,
        doctorSpecialty,
        gia,
        bac_si_id: bacSiId,
        appointmentType: 'chuyên khoa'
      })
    );

    navigate(`/Xacnhanthongtin?bac_si_id=${bacSiId}`);
  };

  useEffect(() => {
    const doctorData = sessionStorage.getItem("selectedDoctor");
    if (doctorData) {
      setDoctorInfo(JSON.parse(doctorData));
    }
  }, [currentDate]);

  // Xử lý thêm lịch làm việc
  const onFinish = async (values: any) => {
    const ngay_lam_viec = values.ngay_lam_viec;
    const startTime = values.gio_bat_dau.format('HH:mm');
    const endTime = values.gio_ket_thuc.format('HH:mm');
    const trang_thai = 0;
    const doctorId = bacSiId;

    const newShift: Shift = {
      id: '',
      bac_si_id: doctorId,
      ngay_lam_viec: ngay_lam_viec.format('YYYY-MM-DD'),
      gio_bat_dau: startTime,
      gio_ket_thuc: endTime,
      trang_thai,
      ghi_chu: values.ghi_chu || '',
    };

    try {
      await axios.post('http://localhost:9999/api/lichlamviec/themlichlamviec', newShift);
      message.success('Lịch làm việc đã được thêm thành công!');
      form.resetFields();
      const fetchAvailableDays = async () => {
        const response = await axios.get(
          `http://localhost:9999/api/lichlamviec/getlichlamviecbyidbs/${bacSiId}`,
          {
            params: { month: month + 1, year },
          }
        );
        const futureAvailableDays = response.data.filter((item: any) => {
          const ngayLamViec = new Date(item.ngay_lam_viec);
          ngayLamViec.setHours(0, 0, 0, 0);
          return ngayLamViec >= new Date();
        }).map((item: any) => new Date(item.ngay_lam_viec).getDate());
        setAvailableDays(futureAvailableDays.filter((d: number) => new Date(year, month, d) >= new Date()));
      };
      fetchAvailableDays();
      // Làm mới dữ liệu ca làm nếu ngày vừa thêm là ngày đang chọn
      if (ngay_lam_viec.format('YYYY-MM-DD') === `${year}-${(month + 1).toString().padStart(2, '0')}-${currentDate.toString().padStart(2, '0')}`) {
        fetchShiftData(currentDate);
      }
    } catch (error) {
      console.error("Lỗi khi thêm lịch làm việc:", error);
      message.error('Có lỗi xảy ra khi thêm lịch làm việc. Vui lòng thử lại!');
    }
  };

  return (
     
    <div className="styles_body2">
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Quản lý lịch làm việc</h1>
      <Row gutter={16} style={{ minHeight: '80vh' }}>
        <Col span={8} style={{ marginTop: '-99px' }}>
          <Card title="Thêm Lịch Làm Việc" style={{ marginBottom: 16 }}>
            <Form
              form={form}
              name="addShiftForm"
              onFinish={onFinish}
              layout="vertical"
            >
              <Form.Item
                name="ngay_lam_viec"
                label="Ngày làm việc"
                rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item
                name="gio_bat_dau"
                label="Giờ bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>

              <Form.Item
                name="gio_ket_thuc"
                label="Giờ kết thúc"
                rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>

              <Form.Item
                name="ghi_chu"
                label="Ghi chú"
              >
                <Input.TextArea placeholder="Nhập ghi chú (tùy chọn)" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Thêm Lịch
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={16}>
          <div className="styles_breadcrumb">
            <div className="styles_containerPartner">
                 
            </div>
          </div>
          <div className="styles_container1">
            <div className="ant-row">
              <div className="ant-rows" style={{ paddingLeft: "16px", paddingRight: "16px" }}>
              
              </div>
              <div className="ant_rowsx" style={{ marginLeft: "50px", marginTop: "-100px" }}>
                <div className="styles_chooseBookingInfo">
                  <div className="styles_panelsHeader1">
                    <span>
                      <div className="styles_animationTop styles_infoBookingTitle" style={{ animationFillMode: 'forwards' }}>
                         <span>Lịch làm việc</span>
                      </div>
                    </span>
                  </div>
                  <div className="styles_chooseDate">
                    <div className="styles_dateAndTime">
                      <div className="styles_thoigian">
                        <div className="styles_calendar">
                          <div className="styles_animationTop styles_header">
                            <div className="ant-space-align-center" style={{ gap: '8px' }}>
                              <div className="ant-space-item">
                                <button className="ant-btn-icon-only" style={{ color: 'rgb(149, 165, 166)' }} onClick={() => handleMonthChange('prev')}>
                                  <FontAwesomeIcon icon={faCircleLeft} />
                                </button>
                              </div>
                              <div className="ant-space-item">
                                <div className="styles_datetime">
                                  Tháng {month + 1}-{year}
                                </div>
                              </div>
                              <div className="ant-space-item">
                                <button className="ant-btn-icon-only" style={{ color: 'rgb(0, 181, 241)' }} onClick={() => handleMonthChange('next')}>
                                  <FontAwesomeIcon icon={faCircleRight} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="styles_animationTop styles_weekContainer" style={{ marginTop: '-20px' }}>
                            {['CN', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'].map((day, index) => (
                              <div
                                key={day}
                                className="styles_weekCell"
                                style={index === 6 ? { color: "#faa01f" } : {}}
                              >
                                {day}
                              </div>
                            ))}
                          </div>
                          <div className="styles_animationTop">
                            <div className="styles_dayContainer">
                              {renderDays()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="styles_dateTimeDivider">
                        <div className="styles_divider"></div>
                      </div>
                      <div className="giokham_time">
                        <div className="giokham_shifts">
                          {morningShifts.length > 0 && (
                            <h1 style={{ fontSize: "1.17em" }}>Buổi sáng</h1>
                          )}
                          {renderShiftList(morningShifts)}
                        </div>
                        <div className="giokham_shifts">
                          {afternoonShifts.length > 0 && (
                            <h1 style={{ fontSize: "1.17em" }}>Buổi chiều</h1>
                          )}
                          {renderShiftList(afternoonShifts)}
                        </div>
                        {renderShiftDetail()}
                        {noShiftsMessage && (
                          <div className="no-shifts-message" style={{ color: 'red', marginTop: '10px' }}>
                            {noShiftsMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Banglichlamviecbybs;