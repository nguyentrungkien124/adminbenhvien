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
    const [loaiBaiVietList, setLoaiBaiVietList] = useState([]);

    useEffect(() => {
        // Gọi API để lấy danh sách loại bài viết
        const fetchLoaiBaiViet = async () => {
            try {
                const response = await axios.get("http://localhost:9999/api/nhombaiviet/getall");
                setLoaiBaiVietList(response.data); // Giả sử API trả về danh sách các loại bài viết
            } catch (error) {
                console.error("Lỗi khi gọi API loại bài viết:", error);
            }
        };

        fetchLoaiBaiViet();

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
                            licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3MzU5NDg3OTksImp0aSI6ImEwMThlZGU5LWEwYzAtNDkzOS04MjFlLTM4N2E0ZWMxZDkyYyIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjI2YmJkZjkwIn0.RUJVskWIa1bEwGxLnkjzdpCR3lkR7yw0K5KOrKEu75N9ePM9lkTpSAFV233lfO2sjvv9YQ3h7HAUKZ-3nC7CiQ' // Để trống hoặc sử dụng 'free' nếu CKEditor yêu cầu // Use 'free' license if applicable, remove or adjust based on your license
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
                        {loaiBaiVietList.map((item: any) => (
                            <Option key={item.id} value={item.id}>
                                {item.tieu_de} {/* Thay đổi 'ten_loai' theo cấu trúc API của bạn */}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="Trạng thái" name="trang_thai" rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}>
                    <Select>
                        <Option value="1">Đầu</Option>
                        <Option value="0">Các cái sau</Option>
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
