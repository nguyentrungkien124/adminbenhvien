import React, { useEffect, useState } from "react";
import { Button, Space, Table, Checkbox } from "antd";
import axios from "axios";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ModalForm from "../LoaiTinTuc/ModalFormLoaiTinTuc"; // Import ModalForm

const { Column } = Table;

const IndexLoaiTinTuc: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<any>(null); // Lưu thông tin record đang sửa
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); // Lưu các id của các bản ghi được chọn

    const loadData = async () => {
        try {
            const response = await axios.get(
                "http://localhost:9999/api/nhombaiviet/getall"
            );
            console.log("Dữ liệu trả về từ API:", response.data);

            // Kiểm tra nếu response.data không phải là mảng
            if (!Array.isArray(response.data)) {
                throw new Error("API không trả về mảng");
            }

            const modifiedData = response.data.map((item: any, index: any) => ({
                ...item,
                index: index + 1,
            }));
            setData(modifiedData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleDelete = async (record: any) => {
        const shouldDelete = window.confirm("Có chắc chắn muốn xóa không");
        if (shouldDelete) {
            const id = record.id;
            try {
                const response = await axios.delete(
                    "http://localhost:9999/api/nhombaiviet/xoanhombaiviet/" +
                        id
                );
                response && alert("Xóa thành công");
                loadData();
            } catch (error) {
                console.error("Lỗi data:", error);
            }
        }
    };

    const handleBulkDelete = async () => {
        const shouldDelete = window.confirm("Có chắc chắn muốn xóa các mục đã chọn?");
        if (shouldDelete && selectedRowKeys.length > 0) {
            try {
                await axios.delete(
                    "http://localhost:9999/api/nhombaiviet/xoanhombaiviet",
                    { data: { ids: selectedRowKeys } }  // Gửi mảng ID
                );
                alert("Xóa thành công");
                loadData();  // Cập nhật lại dữ liệu sau khi xóa
                setSelectedRowKeys([]);  // Xóa các mục đã chọn
            } catch (error) {
                console.error("Lỗi khi xóa nhiều:", error);
            }
        }
    };
    

    const handleAdd = () => {
        setCurrentRecord(null); // Reset record hiện tại
        setIsModalOpen(true); // Mở Modal
    };

    const handleEdit = (record: any) => {
        setCurrentRecord(record); // Gán record đang chỉnh sửa
        setIsModalOpen(true); // Mở Modal
    };

    const handleModalClose = () => {
        setIsModalOpen(false); // Đóng Modal
    };

    const handleModalSubmit = async (values: any) => {
        const payload = {
            id: currentRecord?.id, // Gửi ID trong body nếu đang sửay
            id_admin: values.id_admin || "1", // Hoặc lấy giá trị từ form
            tieu_de: values.tieu_de,
            mo_ta: values.mo_ta,
            trang_thai: values.trang_thai,
        };

        try {
            if (currentRecord) {
                // Gửi yêu cầu PUT để sửa bản ghi
                await axios.put(
                    "http://localhost:9999/api/nhombaiviet/suanhombaiviet/",
                    payload
                );
                alert("Cập nhật thành công");
            } else {
                // Nếu không có currentRecord, gửi yêu cầu POST để thêm mới
                await axios.post(
                    "http://localhost:9999/api/nhombaiviet/themnhombaiviet",
                    payload
                );
                alert("Thêm mới thành công");
            }

            loadData(); // Cập nhật lại dữ liệu sau khi thêm/sửa
            handleModalClose(); // Đóng Modal
        } catch (error) {
            console.error("Lỗi khi thêm/sửa:", error);
        }
    };

    useEffect(() => {
        loadData(); // Gọi hàm loadData khi component được render
    }, []);

    const handleSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys); // Cập nhật danh sách các ID đã chọn
    };

    return (
        <div>
            <h2
                style={{
                    borderBottom: "2px solid #000",
                    paddingBottom: "5px",
                    marginBottom: "10px",
                }}
            >
                Danh sách loại tin tức
            </h2>

            {/* Nút Xóa nhiều chỉ hiển thị khi có ít nhất 1 mục được chọn */}
            <Button
                type="primary"
                danger
                onClick={handleBulkDelete}
                style={{ marginBottom: "16px", marginLeft: "10px" }}
                disabled={selectedRowKeys.length === 0} // Vô hiệu hóa nếu không có mục nào được chọn
            >
                Xóa nhiều
            </Button>

            {/* Nút Thêm loại tin tức */}
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                style={{ marginBottom: "16px", marginLeft: "10px" }}
            >
                Thêm loại tin tức
            </Button>

            <Table
                rowSelection={{
                    selectedRowKeys,
                    onChange: handleSelectChange,
                }}
                dataSource={data}
                rowKey="id"
            >
                <Column title="STT" dataIndex="index" key="index" />
                <Column title="Người thêm" dataIndex="id_admin" key="id_admin" />
                <Column title="Tiêu đề" dataIndex="tieu_de" key="tieu_de" />
                <Column title="Mô tả" dataIndex="mo_ta" key="mo_ta" />
                <Column title="Trạng thái" dataIndex="trang_thai" key="trang_thai" />
                <Column
                    title="Ngày thêm"
                    dataIndex="created_at"
                    key="created_at"
                    render={(text: string) => text.split('T')[0]} // Cắt lấy phần ngày
                />

                <Column
                    title="Chức năng"
                    key="action"
                    render={(_: any, record: any) => (
                        <Space size="middle">
                            <a
                                style={{ fontSize: "25px" }}
                                onClick={() => handleEdit(record)}
                            >
                                <EditOutlined />
                            </a>
                            <a
                                style={{ fontSize: "25px", color: "red" }}
                                onClick={() => handleDelete(record)}
                            >
                                <DeleteOutlined />
                            </a>
                        </Space>
                    )}
                />
            </Table>

            {/* Gọi ModalForm */}
            <ModalForm
                visible={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleModalSubmit}
                initialValues={currentRecord} // Gửi dữ liệu hiện tại nếu sửa
            />
        </div>
    );
};

export default IndexLoaiTinTuc;
