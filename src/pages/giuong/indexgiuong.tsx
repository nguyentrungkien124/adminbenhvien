import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Button,
  Modal,
  Select,
  Space,
  message,
} from "antd";
import { EditOutlined } from "@ant-design/icons";

const { Option } = Select;

interface Giuong {
  id: string;
  tenGiuong: string; // Tương ứng với bed_code
  phong: string; // Tương ứng với room_name
  trangThai: "trong" | "da_su_dung";
  patientName?: string; // Tên bệnh nhân, optional
  roomId: string; // Thêm room_id để quản lý
  bedId: string; // Thêm bed_id để quản lý
  bedPrice: number; // Thêm giá giường
}

const IndexGiuong: React.FC = () => {
  const [dsGiuong, setDsGiuong] = useState<Giuong[]>([]);
  const [phongDangChon, setPhongDangChon] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [giuongDangChon, setGiuongDangChon] = useState<Giuong | null>(null);
  const [trangThaiMoi, setTrangThaiMoi] = useState<"trong" | "da_su_dung">();
  const [loading, setLoading] = useState(true);

  // Lấy danh sách các phòng duy nhất từ dữ liệu
  const dsPhong = Array.from(new Set(dsGiuong.map((g) => g.phong)));

  // Giường hiển thị: tất cả giường theo phòng đang chọn (bao gồm cả trống và đã sử dụng)
  const giuongTheoPhong = dsGiuong.filter((g) => g.phong === phongDangChon);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchBeds = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:9999/api/phongbenh/beds-with-patients?khoa_id=15");
        if (!response.ok) throw new Error("Failed to fetch beds");
        const data = await response.json();
        console.log("API response:", data);

        // Chuyển đổi dữ liệu từ API sang định dạng Giuong
        const formattedBeds: Giuong[] = data.map((item: any) => ({
          id: item.bed_id,
          tenGiuong: item.bed_code,
          phong: item.room_name,
          trangThai: item.bed_status === "trong" ? "trong" : "da_su_dung",
          patientName: item.patient_name === "Trống" ? undefined : item.patient_name,
          roomId: item.room_id,
          bedId: item.bed_id,
          bedPrice: item.bed_price,
        }));
        setDsGiuong(formattedBeds);
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu giường bệnh");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBeds();
  }, []);

  const moModalCapNhat = (giuong: Giuong) => {
    setGiuongDangChon(giuong);
    setTrangThaiMoi(giuong.trangThai);
    setModalVisible(true);
  };

  const capNhatTrangThai = () => {
    if (!giuongDangChon || !trangThaiMoi) return;
    const capNhat = dsGiuong.map((g) =>
      g.id === giuongDangChon.id ? { ...g, trangThai: trangThaiMoi } : g
    );
    setDsGiuong(capNhat);
    setModalVisible(false);
    message.success("Cập nhật trạng thái thành công");
    // Gửi request cập nhật lên server nếu cần (tạm thời chưa có API cập nhật)
  };

  const renderTagAndPatient = (giuong: Giuong) => {
    return (
      <>
        {giuong.trangThai === "trong" ? (
          <Tag color="green">Còn trống</Tag>
        ) : (
          <Tag color="red">Đã sử dụng</Tag>
        )}
        {giuong.patientName && <p>Tên bệnh nhân: {giuong.patientName}</p>}
        <p>Giá: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(giuong.bedPrice)}</p>
      </>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý giường bệnh</h2>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <strong>Chọn phòng:</strong>
          <Select
            placeholder="Chọn phòng"
            style={{ width: 200 }}
            onChange={(val) => setPhongDangChon(val)}
            value={phongDangChon || undefined}
            allowClear
            loading={loading}
          >
            {dsPhong.map((phong) => (
              <Option key={phong} value={phong}>
                {phong}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : phongDangChon ? (
        <Row gutter={[16, 16]}>
          {giuongTheoPhong.length > 0 ? (
            giuongTheoPhong.map((giuong) => (
              <Col xs={24} sm={12} md={8} lg={6} key={giuong.id}>
                <Card
                  title={`Giường: ${giuong.tenGiuong}`}
                  extra={<strong>Phòng: {giuong.phong}</strong>}
                  actions={[
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => moModalCapNhat(giuong)}
                      disabled={giuong.trangThai === "da_su_dung"} // Chỉ cho phép cập nhật giường trống
                    >
                      Cập nhật
                    </Button>,
                  ]}
                >
                  {renderTagAndPatient(giuong)}
                </Card>
              </Col>
            ))
          ) : (
            <p>Không có giường nào trong phòng này.</p>
          )}
        </Row>
      ) : (
        <p>Vui lòng chọn phòng để xem giường.</p>
      )}

      <Modal
        title="Cập nhật trạng thái giường"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={capNhatTrangThai}
        okText="Lưu"
      >
        <p>
          <strong>Giường:</strong> {giuongDangChon?.tenGiuong} –{" "}
          <strong>Phòng:</strong> {giuongDangChon?.phong}
        </p>
        <p>Giá: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(giuongDangChon?.bedPrice || 0)}</p>
        <Select
          style={{ width: "100%" }}
          value={trangThaiMoi}
          onChange={(val) => setTrangThaiMoi(val)}
        >
          <Option value="trong">Còn trống</Option>
          <Option value="da_su_dung">Đã sử dụng</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default IndexGiuong;