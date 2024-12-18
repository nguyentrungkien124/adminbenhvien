import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, Button, Upload } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { useForm } from "antd/es/form/Form";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import moment from "moment";

interface ModalTinTucProps {
    visible: boolean;
    onCancel: () => void;
    onSave: (data: any) => void;
    currentRecord: any;
}

const { Option } = Select;

const ModalFormKhachHang: React.FC<ModalTinTucProps> = ({ visible, onCancel, onSave, currentRecord }) => {
    const [form] = useForm();

    useEffect(() => {
        if (currentRecord) {
            form.setFieldsValue({
                ho_ten: currentRecord.ho_ten,
                email: currentRecord.email,
                mat_khau: currentRecord.mat_khau,
                so_dien_thoai: currentRecord.so_dien_thoai,
                ngay_sinh: currentRecord.ngay_sinh ? moment(currentRecord.ngay_sinh) : null,
                gioi_tinh: currentRecord.gioi_tinh,
                dia_chi: currentRecord.dia_chi,
                dan_toc: currentRecord.dan_toc,
                CMND: currentRecord.CMND,
                nghe_nghiep: currentRecord.nghe_nghiep,
                hinh_anh: currentRecord.hinh_anh
                    ? [{ uid: '-1', name: currentRecord.hinh_anh, status: 'done', url: currentRecord.hinh_anh }]
                    : [],
            });
        } else {
            form.resetFields();
        }
    }, [currentRecord, form]);
    
    // form.setFieldsValue({
    //     email: currentRecord.email || "",
    // });


    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Prepare FormData
            const formData = new FormData();
            formData.append("ho_ten", values.ho_ten);
            formData.append("email", values.email);
            formData.append("mat_khau", values.mat_khau);
            formData.append("so_dien_thoai", values.so_dien_thoai);
            formData.append("ngay_sinh", values.ngay_sinh);
            formData.append("gioi_tinh", values.gioi_tinh);
            formData.append("dia_chi", values.dia_chi);
            formData.append("dan_toc", values.dan_toc);
            formData.append("CMND", values.CMND);
            formData.append("nghe_nghiep", values.nghe_nghiep);

            // Check and add file upload (if any)
            if (values.hinh_anh && values.hinh_anh[0]?.originFileObj) {
                formData.append("files", values.hinh_anh[0].originFileObj);
            }

            // Call the onSave function and pass FormData
            onSave(formData);
        } catch (error) {
            console.error("Error processing form:", error);
        }
    };

    return (
        <Modal
            title={currentRecord ? "Chỉnh sửa khách hàng" : "Thêm khách hàng"}
            visible={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Họ tên " name="ho_ten" rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}>
                <Input />
                </Form.Item>

                <Form.Item label="Mật khẩu" name="mat_khau" rules={[{ required: true, message: "Vui lòng chọn loại bài viết!" }]}>
                <Input />
                </Form.Item>

                <Form.Item label="Số điện thoại" name="so_dien_thoai" rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}>
                <Input />
                </Form.Item>

                <Form.Item label="Ngày sinh" name="ngay_sinh" rules={[{ required: true, message: "Vui lòng chọn ngày đăng!" }]}>
                <Input />
                </Form.Item>

                <Form.Item label="Giới tính" name="gioi_tinh" rules={[{ required: true, message: "Vui lòng chọn ngày đăng!" }]}>
                <Input />
                </Form.Item>

                <Form.Item label="Địa chỉ" name="dia_chi" rules={[{ required: true, message: "Vui lòng chọn ngày đăng!" }]}>
                <Input />
                </Form.Item>
                <Form.Item label="Dân tộc" name="dan_toc" rules={[{ required: true, message: "Vui lòng chọn ngày đăng!" }]}>
                <Input />
                </Form.Item>
                <Form.Item label="CMND" name="CMND" rules={[{ required: true, message: "Vui lòng chọn ngày đăng!" }]}>
                <Input />
                </Form.Item>
                <Form.Item label="Nghề nghiệp" name="nghe_nghiep" rules={[{ required: true, message: "Vui lòng chọn ngày đăng!" }]}>
                <Input />
                </Form.Item>
                <Form.Item
                    label="Hình ảnh"
                    name="hinh_anh"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                    rules={[{ required: false, message: "Vui lòng upload hình ảnh!" }]}
                >
                    <Upload
                        listType="picture-card"
                        maxCount={1}
                        beforeUpload={() => false} // Prevent automatic upload
                    >
                        <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalFormKhachHang;
