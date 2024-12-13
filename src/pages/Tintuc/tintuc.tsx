// Tintuc.tsx
import React, { useEffect, useState } from "react";
import { Button, Space, Table, Input } from "antd";
import axios from "axios";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ModalTinTuc from "../Tintuc/ModalFormTinTuc"; // Import modal mới tạo

const { Column } = Table;
const { Search } = Input;

const Tintuc: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<any>(null); // Lưu thông tin record đang sửa 
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); // Lưu các id của các bản ghi được chọn
    const [searchText, setSearchText] = useState<string>(""); // Thêm trạng thái để lưu giá trị tìm kiếm

    const loadData = async () => {
        try {
            const response = await axios.get("http://localhost:9999/api/baiviet/get-all");
            if (Array.isArray(response.data)) {
                const modifiedData = response.data.map((item: any, index: any) => ({ ...item, index: index + 1 }));
                setData(modifiedData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleDelete = async (record: any) => {
        const shouldDelete = window.confirm("Có chắc chắn muốn xóa không?");
        if (shouldDelete) {
            const id = record.id;
            try {
                await axios.delete("http://localhost:9999/api/baiviet/xoabaiviet/" + id);
                alert("Xóa thành công");
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
                await axios.delete("http://localhost:9999/api/tintuc/xoatintuc", { data: { ids: selectedRowKeys } });
                alert("Xóa thành công");
                loadData();
                setSelectedRowKeys([]);
            } catch (error) {
                console.error("Lỗi khi xóa nhiều:", error);
            }
        }
    };

    const handleAdd = () => {
        setCurrentRecord(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record: any) => {
        console.log("Record được chỉnh sửa:", record); // Debug giá trị record
        setCurrentRecord(record);
        setIsModalOpen(true);
    };
    
    const handleSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const handleSave = async (formData: FormData) => {
        try {
            if (currentRecord) {
                // Nếu đang chỉnh sửa
                formData.append("id", currentRecord.id); // Thêm ID vào FormData
                
                // Kiểm tra nếu không có ảnh mới được tải lên
                if (!formData.has("files")) {
                    if (currentRecord.hinh_anh) {
                        // Nếu có ảnh cũ -> giữ nguyên
                        formData.append("hinh_anh", currentRecord.hinh_anh);
                    } else {
                        // Nếu không có ảnh cũ -> để rỗng
                        formData.append("hinh_anh", "");
                    }
                }
    
                await axios.put("http://localhost:9999/api/baiviet/suabaiviet", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("Chỉnh sửa thành công!");
            } else {
                // Nếu thêm mới
                await axios.post("http://localhost:9999/api/baiviet/thembaiviet", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("Thêm mới thành công!");
            }
            loadData();
            setIsModalOpen(false); // Đóng modal
        } catch (error: any) {
            console.error("Lỗi khi lưu dữ liệu:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
            }
        }
    };
    
    const handleSearch = (value: string) => {
        setSearchText(value); // Cập nhật giá trị tìm kiếm
    };

    // Lọc dữ liệu dựa trên giá trị tìm kiếm
    const filteredData = data.filter(item => 
        item.tieu_de.toLowerCase().includes(searchText.toLowerCase())
    );

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div style={{ padding: "20px", borderRadius: "8px" }}>
            <h2 style={{ borderBottom: "2px solid #000", paddingBottom: "5px", marginBottom: "20px" }}>
                Danh sách tin tức
            </h2>

            <Space style={{ marginBottom: "16px" }}>
                <Button
                    type="primary"
                    danger
                    onClick={handleBulkDelete}
                    disabled={selectedRowKeys.length === 0}
                    icon={<DeleteOutlined />}
                >
                    Xóa nhiều
                </Button>
                <Button
                    type="primary"
                    onClick={handleAdd}
                    icon={<PlusOutlined />}
                >
                    Thêm tin tức
                </Button>
            </Space>

            <Search
                placeholder="Tìm kiếm..."
                enterButton="Tìm"
                size="middle"
                onSearch={handleSearch} // Sử dụng hàm handleSearch
                style={{ width: 200, marginLeft: 725 }}
            />

            <Table
                rowSelection={{
                    selectedRowKeys,
                    onChange: handleSelectChange,
                }}
                dataSource={filteredData} // Sử dụng dữ liệu đã lọc
                rowKey="id"
                bordered
                pagination={false}
                scroll={{ x: true }}
            >
                <Column title="Tiêu đề" dataIndex="tieu_de" key="tieu_de" ellipsis />
                <Column
                    title="Nội dung"
                    dataIndex="noi_dung"
                    key="noi_dung"
                    render={(text) => {
                        return text ? text.slice(0, 50) + '...' : ''; // Cắt bớt nếu quá dài
                    }}
                />
                <Column title="Loại bài viết" dataIndex="loai_bai_viet" key="loai_bai_viet" ellipsis />
                <Column title="Trạng thái" dataIndex="trang_thai" key="trang_thai" ellipsis />
                <Column
                    title="Ảnh"
                    dataIndex="hinh_anh"
                    key="hinh_anh"
                    render={(anh: string) => (
                        <img
                            src={anh} // Đảm bảo rằng `${anh}` chứa tên file chính xác
                            alt="Ảnh"
                            style={{ width: 50, height: "auto" }}
                        />
                    )}
                    ellipsis />
                <Column title="Lượt xem" dataIndex="luot_xem" key="luot_xem" ellipsis />
                <Column title="Ngày đăng" dataIndex="ngay_dang" key="ngay_dang" render={(text: string) => text.split('T')[0]} ellipsis />
                <Column title="Ngày tạo" dataIndex="created_at" key="created_at" render={(text: string) => text.split('T')[0]} ellipsis />

                <Column
                    title="Chức năng"
                    key="action"
                    render={(_: any, record: any) => (
                        <Space size="middle">
                            <a onClick={() => handleEdit(record)}>
                                <EditOutlined style={{ fontSize: "20px" }} />
                            </a>
                            <a onClick={() => handleDelete(record)}>
                                <DeleteOutlined style={{ fontSize: "20px", color: "red" }} />
                            </a>
                        </Space>
                    )}
                />
            </Table>

            <ModalTinTuc
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSave={handleSave}
                currentRecord={currentRecord}
            />
        </div>
    );
};

export default Tintuc;
