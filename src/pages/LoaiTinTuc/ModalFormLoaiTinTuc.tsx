import React from "react";
import { Modal, Form, Input, Select, Button } from "antd";

const { Option } = Select;

interface ModalFormProps {
  visible: boolean; // Modal mở hay đóng
  onClose: () => void; // Đóng Modal
  onSubmit: (values: any) => void; // Xử lý khi form submit
  initialValues?: any; // Giá trị ban đầu cho form (dành cho chỉnh sửa)
}

const ModalFormLoaiTinTuc: React.FC<ModalFormProps> = ({
  visible,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues); // Set giá trị ban đầu khi chỉnh sửa
    } else {
      form.resetFields(); // Reset form khi thêm mới
    }
  }, [initialValues, form]);

  return (
    <Modal
      title={initialValues ? "Chỉnh sửa loại tin tức" : "Thêm mới loại tin tức"}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          {initialValues ? "Cập nhật" : "Lưu"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Form.Item
          label="Người thêm"
          name="id_admin"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input placeholder="Nhập tiêu đề" />
        </Form.Item>
        <Form.Item
          label="Tiêu đề"
          name="tieu_de"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input placeholder="Nhập tiêu đề" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="mo_ta"
          rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
        >
          <Input.TextArea rows={3} placeholder="Nhập mô tả" />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="trang_thai"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="0">Ngừng hoạt động</Option>
            <Option value="1">Đang hoạt động    </Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalFormLoaiTinTuc;
