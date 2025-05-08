import React, { useState } from "react";
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Popconfirm,
  Card,
  Tag,
  Divider,
  Typography,
  Avatar,
  InputNumber,
  message,
  Badge,
  Tabs,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { TabsProps } from "antd";

const { Content, Header } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface BenhNhan {
  key: string;
  hoTen: string;
  phong: string;
  bacSi: string;
  ngayNhapVien: string;
  ngayXuatVien?: string;
  giuongId: string;
  trangThai: "dangDieuTri" | "xuatVien" | "chuyenVien";
  theoDoiDieuTri?: string;
  donThuoc?: string;
  canNang?: number;
  chieuCao?: number;
  nhomMau?: string;
  tienSuBenh?: string;
}

interface Giuong {
  id: string;
  tenGiuong: string;
  phong: string;
  daCoNguoi: boolean;
  loaiGiuong: "thuong" | "vip" | "icu";
}

const IndexNoiTru: React.FC = () => {
  const [form] = Form.useForm();
  const [formTheoDoi] = Form.useForm();
  const [formChuyenKhoa] = Form.useForm();
  const [data, setData] = useState<BenhNhan[]>([
    {
      key: "1",
      hoTen: "Nguyễn Văn A",
      phong: "201A",
      bacSi: "Bs. Trần Văn B",
      ngayNhapVien: "2025-05-01",
      giuongId: "1",
      trangThai: "dangDieuTri",
      theoDoiDieuTri: "Đang theo dõi chỉ số sinh tồn",
      donThuoc: "Paracetamol 500mg, Amoxicillin 500mg",
      canNang: 65,
      chieuCao: 170,
      nhomMau: "A",
      tienSuBenh: "Tiểu đường type 2",
    },
  ]);

  const [giuongData, setGiuongData] = useState<Giuong[]>([
    { id: "1", tenGiuong: "G1", phong: "201A", daCoNguoi: true, loaiGiuong: "thuong" },
    { id: "2", tenGiuong: "G2", phong: "201A", daCoNguoi: false, loaiGiuong: "vip" },
    { id: "3", tenGiuong: "G3", phong: "202B", daCoNguoi: false, loaiGiuong: "icu" },
  ]);

  const [filteredData, setFilteredData] = useState<BenhNhan[]>(data);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BenhNhan | null>(null);
  const [modalDonThuocVisible, setModalDonThuocVisible] = useState(false);
  const [modalTheoDoiVisible, setModalTheoDoiVisible] = useState(false);
  const [modalChuyenKhoaVisible, setModalChuyenKhoaVisible] = useState(false);
  const [selectedDonThuoc, setSelectedDonThuoc] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>("1");

  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = data.filter((item) =>
      item.hoTen.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchText("");
    setFilteredData(data);
  };

  const showEditModal = (record: BenhNhan) => {
    setEditingRecord(record);
    setModalVisible(true);
    form.setFieldsValue({
      ...record,
      ngayNhapVien: dayjs(record.ngayNhapVien),
      ngayXuatVien: record.ngayXuatVien ? dayjs(record.ngayXuatVien) : undefined,
    });
  };

  const showAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showTheoDoiModal = (record: BenhNhan) => {
    setEditingRecord(record);
    formTheoDoi.setFieldsValue({
      theoDoiDieuTri: record.theoDoiDieuTri,
    });
    setModalTheoDoiVisible(true);
  };

  const showChuyenKhoaModal = (record: BenhNhan) => {
    setEditingRecord(record);
    formChuyenKhoa.resetFields();
    setModalChuyenKhoaVisible(true);
  };

  const handleDelete = (key: string) => {
    const deleted = data.find((item) => item.key === key);
    const newData = data.filter((item) => item.key !== key);
    setData(newData);

    if (deleted?.giuongId) {
      setGiuongData((prev) =>
        prev.map((g) => (g.id === deleted.giuongId ? { ...g, daCoNguoi: false } : g))
      );
    }

    handleSearch(searchText);
    message.success("Đã xóa bệnh nhân thành công");
  };

  const onFinish = (values: any) => {
    const record: BenhNhan = {
      key: editingRecord?.key || Date.now().toString(),
      ...values,
      ngayNhapVien: values.ngayNhapVien.format("YYYY-MM-DD"),
      ngayXuatVien: values.ngayXuatVien ? values.ngayXuatVien.format("YYYY-MM-DD") : undefined,
      trangThai: "dangDieuTri",
    };

    let newData = [...data];

    if (editingRecord) {
      if (editingRecord.giuongId && editingRecord.giuongId !== values.giuongId) {
        setGiuongData((prev) =>
          prev.map((g) => (g.id === editingRecord.giuongId ? { ...g, daCoNguoi: false } : g))
        );
      }
      newData = newData.map((item) =>
        item.key === editingRecord.key ? { ...item, ...record } : item
      );
    } else {
      newData.push(record);
    }

    setGiuongData((prev) =>
      prev.map((g) => (g.id === values.giuongId ? { ...g, daCoNguoi: true } : g))
    );

    setData(newData);
    setModalVisible(false);
    handleSearch(searchText);
    message.success(editingRecord ? "Cập nhật thành công" : "Thêm bệnh nhân thành công");
  };

  const handleTheoDoiFinish = (values: any) => {
    const updatedData = data.map((item) =>
      item.key === editingRecord?.key ? { ...item, theoDoiDieuTri: values.theoDoiDieuTri } : item
    );
    setData(updatedData);
    setModalTheoDoiVisible(false);
    message.success("Cập nhật theo dõi điều trị thành công");
  };

  const handleChuyenKhoaFinish = (values: any) => {
    const updatedData = data.map((item) =>
      item.key === editingRecord?.key ? { 
        ...item, 
        phong: values.phongMoi,
        giuongId: values.giuongMoi,
        trangThai: "chuyenVien"
      } : item
    );
    
    // Cập nhật trạng thái giường
    setGiuongData(prev => 
      prev.map(g => 
        g.id === editingRecord?.giuongId ? { ...g, daCoNguoi: false } : 
        g.id === values.giuongMoi ? { ...g, daCoNguoi: true } : g
      )
    );
    
    // setData(updatedData);
    setModalChuyenKhoaVisible(false);
    message.success("Chuyển khoa/phòng thành công");
  };

  const handleXuatVien = (key: string) => {
    const updatedData = data.map(item => 
      item.key === key ? { 
        ...item, 
        ngayXuatVien: dayjs().format("YYYY-MM-DD"),
        trangThai: "xuatVien"
      } : item
    );
    
    // Giải phóng giường
    const benhNhan = data.find(item => item.key === key);
    if (benhNhan?.giuongId) {
      setGiuongData(prev => 
        prev.map(g => g.id === benhNhan.giuongId ? { ...g, daCoNguoi: false } : g)
      );
    }
    
    // setData(updatedData);
    message.success("Đã xuất viện bệnh nhân");
  };

  const renderTrangThai = (trangThai: string) => {
    switch (trangThai) {
      case "dangDieuTri":
        return <Tag color="blue">Đang điều trị</Tag>;
      case "xuatVien":
        return <Tag color="green">Đã xuất viện</Tag>;
      case "chuyenVien":
        return <Tag color="orange">Chuyển viện</Tag>;
      default:
        return <Tag>{trangThai}</Tag>;
    }
  };

  const columns = [
    {
      title: "Thông tin bệnh nhân",
      dataIndex: "hoTen",
      key: "hoTen",
      render: (text: string, record: BenhNhan) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar size="large" icon={<UserOutlined />} style={{ marginRight: 12 }} />
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {record.phong} • {record.bacSi}
            </div>
            {renderTrangThai(record.trangThai)}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày nhập viện",
      dataIndex: "ngayNhapVien",
      key: "ngayNhapVien",
      render: (text: string) => dayjs(text).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày xuất viện",
      dataIndex: "ngayXuatVien",
      key: "ngayXuatVien",
      render: (text: string) => text ? dayjs(text).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Theo dõi",
      dataIndex: "theoDoiDieuTri",
      key: "theoDoiDieuTri",
      render: (text: string) => (
        <Text ellipsis style={{ maxWidth: 200 }}>
          {text || "Chưa có thông tin"}
        </Text>
      ),
    },
    {
      title: "Đơn thuốc",
      dataIndex: "donThuoc",
      key: "donThuoc",
      render: (text: string) => (
        <Button
          type="text"
          icon={<MedicineBoxOutlined />}
          onClick={() => {
            setSelectedDonThuoc(text || "Chưa kê đơn thuốc");
            setModalDonThuocVisible(true);
          }}
        >
          Xem đơn
        </Button>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 220,
      render: (_: any, record: BenhNhan) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
            size="small"
          />
          <Popconfirm
            title="Xóa bệnh nhân này?"
            onConfirm={() => handleDelete(record.key)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
          <Button
            icon={<SwapOutlined />}
            onClick={() => showChuyenKhoaModal(record)}
            size="small"
          />
          <Button
            icon={<HeartOutlined />}
            onClick={() => showTheoDoiModal(record)}
            size="small"
          />
          {record.trangThai === "dangDieuTri" && (
            <Popconfirm
              title="Xác nhận xuất viện?"
              onConfirm={() => handleXuatVien(record.key)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button type="primary" size="small">Xuất viện</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const tabItems: TabsProps['items'] = [
    {
      key: "1",
      label: "Đang điều trị",
      children: (
        <Table 
          columns={columns} 
          dataSource={filteredData.filter(item => item.trangThai === "dangDieuTri")} 
          rowKey="key"
          pagination={{ pageSize: 5 }}
        />
      ),
    },
    {
      key: "2",
      label: "Đã xuất viện",
      children: (
        <Table 
          columns={columns} 
          dataSource={filteredData.filter(item => item.trangThai === "xuatVien")} 
          rowKey="key"
          pagination={{ pageSize: 5 }}
        />
      ),
    },
    {
      key: "3",
      label: "Chuyển viện",
      children: (
        <Table 
          columns={columns} 
          dataSource={filteredData.filter(item => item.trangThai === "chuyenVien")} 
          rowKey="key"
          pagination={{ pageSize: 5 }}
        />
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content style={{ padding: "24px" }}>
        <Card 
          title={<Title level={4} style={{ margin: 0 }}>QUẢN LÝ BỆNH NHÂN NỘI TRÚ</Title>}
          bordered={false}
          extra={
            <Space>
              <Input
                placeholder="Tìm theo họ tên"
                allowClear
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
              />
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showAddModal}
              >
                Thêm bệnh nhân
              </Button>
            </Space>
          }
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={tabItems}
            tabBarStyle={{ marginBottom: 24 }}
          />
        </Card>
      </Content>

      {/* Modal thêm/sửa bệnh nhân */}
      <Modal
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            {editingRecord ? "CẬP NHẬT BỆNH NHÂN" : "THÊM BỆNH NHÂN MỚI"}
          </span>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
        footer={[
          <Button key="back" onClick={() => setModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {editingRecord ? "Cập nhật" : "Thêm mới"}
          </Button>,
        ]}
      >
        <Divider style={{ margin: "16px 0" }} />
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Họ tên" 
                name="hoTen" 
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input placeholder="Nhập họ tên bệnh nhân" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Bác sĩ phụ trách" 
                name="bacSi" 
                rules={[{ required: true, message: "Vui lòng chọn bác sĩ" }]}
              >
                <Select placeholder="Chọn bác sĩ">
                  <Option value="Bs. Trần Văn B">Bs. Trần Văn B</Option>
                  <Option value="Bs. Nguyễn Thị C">Bs. Nguyễn Thị C</Option>
                  <Option value="Bs. Lê Văn D">Bs. Lê Văn D</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                label="Phòng" 
                name="phong" 
                rules={[{ required: true, message: "Vui lòng nhập phòng" }]}
              >
                <Input placeholder="Ví dụ: 201A" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Ngày nhập viện"
                name="ngayNhapVien"
                rules={[{ required: true, message: "Vui lòng chọn ngày nhập viện" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Ngày xuất viện" name="ngayXuatVien">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Cân nặng (kg)" name="canNang">
                <InputNumber min={0} max={200} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Chiều cao (cm)" name="chieuCao">
                <InputNumber min={0} max={250} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Nhóm máu" name="nhomMau">
            <Select placeholder="Chọn nhóm máu">
              <Option value="A">A</Option>
              <Option value="B">B</Option>
              <Option value="AB">AB</Option>
              <Option value="O">O</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Tiền sử bệnh" name="tienSuBenh">
            <TextArea rows={2} placeholder="Nhập tiền sử bệnh nếu có" />
          </Form.Item>

          <Form.Item
            label="Giường bệnh"
            name="giuongId"
            rules={[{ required: true, message: "Chọn giường bệnh" }]}
          >
            <Select placeholder="Chọn giường bệnh">
              {giuongData
                .filter((giuong) => !giuong.daCoNguoi)
                .map((giuong) => (
                  <Option key={giuong.id} value={giuong.id}>
                    {giuong.tenGiuong} ({giuong.phong}) - { 
                      giuong.loaiGiuong === "thuong" ? "Thường" : 
                      giuong.loaiGiuong === "vip" ? "VIP" : "ICU"
                    }
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem đơn thuốc */}
      <Modal
        title={<><MedicineBoxOutlined /> ĐƠN THUỐC BỆNH NHÂN</>}
        open={modalDonThuocVisible}
        onCancel={() => setModalDonThuocVisible(false)}
        footer={null}
        width={600}
      >
        <Card bordered={false}>
          <pre style={{ 
            whiteSpace: "pre-wrap", 
            fontFamily: "inherit",
            background: "#f9f9f9",
            padding: 16,
            borderRadius: 4
          }}>
            {selectedDonThuoc}
          </pre>
        </Card>
      </Modal>

      {/* Modal theo dõi điều trị */}
      <Modal
        title={<><HeartOutlined /> THEO DÕI ĐIỀU TRỊ</>}
        open={modalTheoDoiVisible}
        onCancel={() => setModalTheoDoiVisible(false)}
        onOk={() => formTheoDoi.submit()}
        width={600}
      >
        <Form form={formTheoDoi} layout="vertical" onFinish={handleTheoDoiFinish}>
          <Form.Item
            label="Nội dung theo dõi"
            name="theoDoiDieuTri"
            rules={[{ required: true, message: "Vui lòng nhập nội dung theo dõi" }]}
          >
            <TextArea rows={6} placeholder="Nhập diễn biến, chỉ số, đánh giá tình trạng bệnh nhân..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chuyển khoa/phòng */}
      <Modal
        title={<><SwapOutlined /> CHUYỂN KHOA/PHÒNG</>}
        open={modalChuyenKhoaVisible}
        onCancel={() => setModalChuyenKhoaVisible(false)}
        onOk={() => formChuyenKhoa.submit()}
      >
        <Form form={formChuyenKhoa} layout="vertical" onFinish={handleChuyenKhoaFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Phòng hiện tại"
              >
                <Input value={editingRecord?.phong} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phòng mới"
                name="phongMoi"
                rules={[{ required: true, message: "Vui lòng nhập phòng mới" }]}
              >
                <Input placeholder="Nhập phòng mới" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Giường mới"
            name="giuongMoi"
            rules={[{ required: true, message: "Vui lòng chọn giường mới" }]}
          >
            <Select placeholder="Chọn giường mới">
              {giuongData
                .filter((giuong) => !giuong.daCoNguoi)
                .map((giuong) => (
                  <Option key={giuong.id} value={giuong.id}>
                    {giuong.tenGiuong} ({giuong.phong})
                  </Option>
                ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Lý do chuyển"
            name="lyDo"
            rules={[{ required: true, message: "Vui lòng nhập lý do chuyển" }]}
          >
            <TextArea rows={3} placeholder="Nhập lý do chuyển khoa/phòng" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default IndexNoiTru;