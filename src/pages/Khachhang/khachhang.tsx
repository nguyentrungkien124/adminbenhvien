// Tintuc.tsx
import React, { useEffect, useState } from "react";
import { Button, Space, Table, Input } from "antd";
import axios from "axios";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ModalFormKhachHang from "../Khachhang/ModalFormKhachHang"; // Import modal mới tạo
import dayjs from 'dayjs';
const { Column } = Table;
const { Search } = Input;

const Khachhang: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<any>(null); // Lưu thông tin record đang sửa 
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]); // Lưu các id của các bản ghi được chọn
    const [searchText, setSearchText] = useState<string>(""); // Thêm trạng thái để lưu giá trị tìm kiếm

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await axios.get("http://localhost:9999/api/user/getall");
            console.log(response.data); // Kiểm tra dữ liệu trả về
            if (Array.isArray(response.data)) {
                const modifiedData = response.data.map((item: any, index: any) => ({ ...item, index: index + 1 }));
                setData(modifiedData);
                console.log("Data saved to state:", modifiedData); // Kiểm tra dữ liệu đã lưu
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // In search text and filtered data
    // console.log("Search Text:", searchText);
    // console.log("Filtered Data:", filteredData);

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

                await axios.put("http://localhost:9999/api/user/update", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("Chỉnh sửa thành công!");
            } else {
                // Nếu thêm mới
                await axios.post("http://localhost:9999/api/user/create", formData, {
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
    const filteredData = data.filter(item =>
        !searchText || (item.ho_ten && item.ho_ten.toLowerCase().includes(searchText.toLowerCase()))
    );
    console.log("Search Text:", searchText);
    console.log("Filtered Data:", filteredData);

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div style={{ padding: "20px", borderRadius: "8px" }}>
            <h2 style={{ borderBottom: "2px solid #000", paddingBottom: "5px", marginBottom: "20px" }}>
                Danh sách khách hàng
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
                    Thêm khách hàng
                </Button>
                <Search
                    placeholder="Tìm kiếm..."
                    enterButton="Tìm"
                    size="middle"
                    onSearch={handleSearch} // Sử dụng hàm handleSearch
                    style={{ width: 200, marginLeft: 690 }}
                />
            </Space>
            <Table
                rowSelection={{
                    selectedRowKeys,
                    onChange: handleSelectChange,
                }}
                dataSource={filteredData}
                rowKey="id"
                bordered
                pagination={false}
                scroll={{ x: true }}
            >
                <Column
                    title="Họ tên"
                    dataIndex="ho_ten"
                    key="ho_ten"
                />
                <Column title="Email" dataIndex="email" key="email" ellipsis />
                {/* <Column title="Mật khẩu" dataIndex="mat_khau" key="mat_khau" ellipsis /> */}
                <Column title="Số điện thoại" dataIndex="so_dien_thoai" key="so_dien_thoai" ellipsis />
               
                <Column
                    title="Ngày sinh"
                    dataIndex="ngay_sinh"
                    key="ngay_sinh"
                    ellipsis
                    render={(text) => text ? dayjs(text).format('DD/MM/YYYY') : ''}
                />
                <Column title="Giới tính" dataIndex="gioi_tinh" key="gioi_tinh" render={(text: string) => text.split('T')[0]} ellipsis />
                <Column title="Địa chỉ" dataIndex="dia_chi" key="dia_chi" render={(text: string) => text.split('T')[0]} ellipsis />
                <Column title="Dân tộc" dataIndex="dan_toc" key="dan_toc" ellipsis />
                <Column title="Nghề nghiệp" dataIndex="nghe_nghiep" key="nghe_nghiep" ellipsis />
                <Column title="CMND" dataIndex="CMND" key="CMND" ellipsis />
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

            <ModalFormKhachHang
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSave={handleSave}
                currentRecord={currentRecord}
            />
        </div>
    );
};

export default Khachhang;
