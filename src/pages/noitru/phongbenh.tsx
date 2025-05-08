import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

const { Option } = Select;

interface PhongBenh {
  id: string;
  tenPhong: string;
  khoa: string;
  loaiPhong: "thường" | "đặc biệt" | "hồi sức";
}

const danhSachPhongBanDau: PhongBenh[] = [
  { id: "1", tenPhong: "101", khoa: "Nội tổng hợp", loaiPhong: "thường" },
  { id: "2", tenPhong: "201", khoa: "Ngoại", loaiPhong: "đặc biệt" },
];

const QuanLyPhongBenh: React.FC = () => {
  const [dsPhong, setDsPhong] = useState<PhongBenh[]>(danhSachPhongBanDau);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [phongDangSua, setPhongDangSua] = useState<PhongBenh | null>(null);

  const moModal = (phong?: PhongBenh) => {
    setModalVisible(true);
    setPhongDangSua(phong || null);
    form.setFieldsValue(phong || { tenPhong: "", khoa: "", loaiPhong: "thường" });
  };

  const luuPhong = () => {
    form.validateFields().then((values) => {
      if (phongDangSua) {
        // cập nhật
        const capNhat = dsPhong.map((p) =>
          p.id === phongDangSua.id ? { ...p, ...values } : p
        );
        setDsPhong(capNhat);
      } else {
        // thêm mới
        const newPhong: PhongBenh = {
          id: Date.now().toString(),
          ...values,
        };
        setDsPhong([...dsPhong, newPhong]);
      }
      setModalVisible(false);
      form.resetFields();
    });
  };

  const columns = [
    {
      title: "Tên phòng",
      dataIndex: "tenPhong",
    },
    {
      title: "Khoa",
      dataIndex: "khoa",
    },
    {
      title: "Loại phòng",
      dataIndex: "loaiPhong",
      render: (text: string) => {
        const color =
          text === "thường" ? "green" : text === "đặc biệt" ? "blue" : "volcano";
        return <Tag color={color}>{text.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Chức năng",
      render: (_: any, record: PhongBenh) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => moModal(record)}
          type="link"
        >
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý phòng bệnh</h2>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => moModal()}>
          Thêm phòng
        </Button>
      </Space>

      <Table columns={columns} dataSource={dsPhong} rowKey="id" />

      <Modal
        title={phongDangSua ? "Cập nhật phòng" : "Thêm phòng"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={luuPhong}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Tên phòng" name="tenPhong" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Khoa" name="khoa" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Loại phòng" name="loaiPhong" rules={[{ required: true }]}>
            <Select>
              <Option value="thường">Thường</Option>
              <Option value="đặc biệt">Đặc biệt</Option>
              <Option value="hồi sức">Hồi sức</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QuanLyPhongBenh;
