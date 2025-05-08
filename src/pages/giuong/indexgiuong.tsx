import React, { useState } from "react";
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
  tenGiuong: string;
  phong: string;
  trangThai: "trong" | "da_su_dung";
}

const dsGiuongBanDau: Giuong[] = [
    { id: "1", tenGiuong: "G1", phong: "201A", trangThai: "trong" },
    { id: "2", tenGiuong: "G2", phong: "201A", trangThai: "da_su_dung" },
    { id: "3", tenGiuong: "G3", phong: "201B", trangThai: "trong" },
    { id: "4", tenGiuong: "G4", phong: "201B", trangThai: "da_su_dung" },
    { id: "5", tenGiuong: "G5", phong: "202A", trangThai: "trong" },
    { id: "6", tenGiuong: "G6", phong: "202A", trangThai: "trong" },
    { id: "7", tenGiuong: "G7", phong: "202B", trangThai: "da_su_dung" },
    { id: "8", tenGiuong: "G8", phong: "202B", trangThai: "trong" },
    { id: "9", tenGiuong: "G9", phong: "203A", trangThai: "trong" },
    { id: "10", tenGiuong: "G10", phong: "203A", trangThai: "da_su_dung" },
    { id: "11", tenGiuong: "G11", phong: "203B", trangThai: "trong" },
    { id: "12", tenGiuong: "G12", phong: "203B", trangThai: "trong" },
    { id: "13", tenGiuong: "G13", phong: "204A", trangThai: "da_su_dung" },
    { id: "14", tenGiuong: "G14", phong: "204A", trangThai: "trong" },
    { id: "15", tenGiuong: "G15", phong: "204B", trangThai: "trong" },
    { id: "16", tenGiuong: "G16", phong: "204B", trangThai: "da_su_dung" },
  ];
  

const IndexGiuong: React.FC = () => {
  const [dsGiuong, setDsGiuong] = useState<Giuong[]>(dsGiuongBanDau);
  const [phongDangChon, setPhongDangChon] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [giuongDangChon, setGiuongDangChon] = useState<Giuong | null>(null);
  const [trangThaiMoi, setTrangThaiMoi] = useState<"trong" | "da_su_dung">();

  // Lấy danh sách các phòng duy nhất
  const dsPhong = Array.from(new Set(dsGiuong.map((g) => g.phong)));

  // Giường hiển thị: theo phòng đang chọn và trạng thái còn trống
  const giuongTheoPhong = dsGiuong.filter(
    (g) => g.phong === phongDangChon && g.trangThai === "trong"
  );

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
  };

  const renderTag = (trangThai: Giuong["trangThai"]) => {
    return trangThai === "trong" ? (
      <Tag color="green">Còn trống</Tag>
    ) : (
      <Tag color="red">Đã sử dụng</Tag>
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
          >
            {dsPhong.map((phong) => (
              <Option key={phong} value={phong}>
                {phong}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      {phongDangChon && (
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
                    >
                      Cập nhật
                    </Button>,
                  ]}
                >
                  {renderTag(giuong.trangThai)}
                </Card>
              </Col>
            ))
          ) : (
            <p>Không có giường trống trong phòng này.</p>
          )}
        </Row>
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
