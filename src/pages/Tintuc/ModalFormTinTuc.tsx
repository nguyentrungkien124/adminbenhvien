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

const ModalTinTuc: React.FC<ModalTinTucProps> = ({ visible, onCancel, onSave, currentRecord }) => {
    const [form] = useForm();

    useEffect(() => {
        if (currentRecord) {
            form.setFieldsValue({
                tieu_de: currentRecord.tieu_de,
                noi_dung: currentRecord.noi_dung,
                loai_bai_viet: currentRecord.loai_bai_viet,
                trang_thai: currentRecord.trang_thai,
                ngay_dang: currentRecord.ngay_dang ? moment(currentRecord.ngay_dang) : null,
                hinh_anh: currentRecord.hinh_anh
                    ? [{ uid: '-1', name: currentRecord.hinh_anh, status: 'done', url: currentRecord.hinh_anh }]
                    : [],
            });
        } else {
            form.resetFields();
        }
    }, [currentRecord, form]);
    
    // form.setFieldsValue({
    //     noi_dung: currentRecord.noi_dung || "",
    // });


    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Prepare FormData
            const formData = new FormData();
            formData.append("tieu_de", values.tieu_de);
            formData.append("noi_dung", values.noi_dung);
            formData.append("loai_bai_viet", values.loai_bai_viet);
            formData.append("trang_thai", values.trang_thai);
            formData.append("ngay_dang", values.ngay_dang.format("YYYY-MM-DD"));

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
            title={currentRecord ? "Chỉnh sửa tin tức" : "Thêm tin tức"}
            visible={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Tiêu đề" name="tieu_de" rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Nội dung" name="noi_dung" rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}>
                    <CKEditor
                        editor={ClassicEditor}
                        config={{
                            licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3MzQ0Nzk5OTksImp0aSI6IjBmYjQ5N2VmLWZiZGMtNGM1Ni05MjY4LThjYjZkNzMxNTFhZiIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6ImM5ZmI4Y2VlIn0.zm0uQVrERULxw9lAREythInLlah4AeasICgTmxnLvbffhaIFYbCUy34IaSZcaNOMpbNWoWrY1rHhSgk4osUVnQ' // Để trống hoặc sử dụng 'free' nếu CKEditor yêu cầu // Use 'free' license if applicable, remove or adjust based on your license
                        }}
                        data={form.getFieldValue("noi_dung") || ""} // Lấy giá trị từ Form
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            form.setFieldsValue({ noi_dung: data }); // Cập nhật Form khi chỉnh sửa nội dung
                        }}
                    />
                </Form.Item>


                <Form.Item label="Loại bài viết" name="loai_bai_viet" rules={[{ required: true, message: "Vui lòng chọn loại bài viết!" }]}>
                    <Select>
                        <Option value="10">10</Option>
                        <Option value="11">11</Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Trạng thái" name="trang_thai" rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}>
                    <Select>
                        <Option value="1">Hoạt động</Option>
                        <Option value="0">Không hoạt động</Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Ngày đăng" name="ngay_dang" rules={[{ required: true, message: "Vui lòng chọn ngày đăng!" }]}>
                    <DatePicker />
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

export default ModalTinTuc;
