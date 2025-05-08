import React, { useEffect, useState } from "react";
import { Button, Space, Table, Input } from "antd";
import axios from "axios";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ModalTinTuc from "../Tintuc/ModalFormTinTuc";

const { Column } = Table;
const { Search } = Input;

const Tintuc: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<any>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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
        setCurrentRecord(record);
        setIsModalOpen(true);
    };
    
    const handleSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const handleSave = async (formData: FormData) => {
        try {
            if (currentRecord) {
                formData.append("id", currentRecord.id);
                await axios.put("http://localhost:9999/api/baiviet/suabaiviet", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("Chỉnh sửa thành công!");
            } else {
                await axios.post("http://localhost:9999/api/baiviet/thembaiviet", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("Thêm mới thành công!");
            }
            loadData();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Lỗi khi lưu dữ liệu:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
            }
        }
    };
    
    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    const filteredData = data.filter(item => 
        item.tieu_de && item.tieu_de.toLowerCase().includes(searchText.toLowerCase())
    );

    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
                onSearch={handleSearch}
                style={{ width: 200, marginLeft: 725 }}
            />

            <Table
                rowSelection={{
                    selectedRowKeys,
                    onChange: handleSelectChange,
                }}
                dataSource={paginatedData}
                rowKey="id"
                bordered
                pagination={{
                    current: currentPage,
                    pageSize,
                    total: filteredData.length,
                    onChange: (page, pageSize) => {
                        setCurrentPage(page);
                        setPageSize(pageSize);
                    },
                }}
                scroll={{ x: true }}
            >
                <Column title="Tiêu đề" dataIndex="tieu_de" key="tieu_de" ellipsis />
                <Column
                    title="Nội dung"
                    dataIndex="noi_dung"
                    key="noi_dung"
                    render={(text) => text ? text.slice(0, 50) + '...' : ''}
                />
                <Column title="Loại bài viết" dataIndex="loai_bai_viet" key="loai_bai_viet" ellipsis />
                <Column title="Trạng thái" dataIndex="trang_thai" key="trang_thai" ellipsis />
                <Column
                    title="Ảnh"
                    dataIndex="hinh_anh"
                    key="hinh_anh"
                    render={(anh: string) => (
                        <img src={anh} alt="Ảnh" style={{ width: 50, height: "auto" }} />
                    )}
                    ellipsis
                />
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