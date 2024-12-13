import React, { useEffect, useState } from 'react';
import { Button, Space, Table } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';


const { Column } = Table;

const IndexCTTGoikham: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
   
    const [goikham, setGoiKham] = useState<any[]>([]);
    const navigate = useNavigate()

    const ten_goi = goikham.reduce((acc, goikham) => {
        acc[goikham.id] = goikham.ten_goi;
        return acc;
    }, {});

    
    const loadData = async () => {
        try {
            const response = await axios.get(
                "http://localhost:9999/api/chitietgoikham/getall",
                {

                }
            );
            const modifiedData = response.data.map((item: any, index: any) => (
                {
                    ...item,
                    index: index + 1
                }
            ));
            setData(modifiedData);
            console.log(modifiedData)

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const handleDelete = async (record: any) => {
        const shouldDelete = window.confirm('Bạn có chắc chắn muốn xóa không?');
        if (shouldDelete) {
            const maSlide = record.maSlide;
            try {
                await axios.delete(
                    'http://localhost:9999/api/banner/deletebanner/' + maSlide,

                );
                alert("Xóa thành công");
                loadData();
            } catch (error) {
                console.error("Lỗi data", error);
            }
        }

    };
    const loadData1 = async () => {
        try {
            const response = await axios.get(
                "http://localhost:9999/api/goikham/getall",
            );
            if (response) setGoiKham(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

   

    useEffect(() => {
        loadData();
        loadData1();
     
    }, []);




    return (
        <div>
            <h2 style={{ borderBottom: '2px solid #4a90e2', paddingBottom: '5px', marginBottom: '10px', color: '#4a90e2' }}>Danh sách chi tiết các gói khám</h2>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ marginBottom: '16px' }}
                onClick={() => navigate('/createCTTGoikham')} // Điều hướng tới trang thêm mới
            >
                Thêm chiết gói khám
            </Button>
            <Table dataSource={data} >
                <Column title="STT" dataIndex="index" key="index" />
                
                <Column
                    title="Tên nhóm gói khám"
                    dataIndex="goi_kham_id"
                    key="goi_kham_id"
                    render={(goi_kham_id) => ten_goi[goi_kham_id] || 'Không xác định'}
                />
                 <Column title="Tên gói" dataIndex="ten_chi_tiet" key="ten_chi_tiet" />
                <Column title="Mô tả" dataIndex="mo_ta" key="mo_ta" />
                <Column title="Giá" dataIndex="gia" key="gia" render={(gia: number) =>
                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia)
                } />
                <Column title="Giá giảm" dataIndex="gia_giam" key="gia_giam" 
                render={(gia_giam: number) =>
                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gia_giam)
                  }/>

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
                />

                <Column
                    title="Action"
                    key="action"
                    render={(_: any, record: any) => (
                        <Space size="middle">
                            <Link style={{ fontSize: '25px' }} to={'/editCTTGoikham/' + record.id}><EditOutlined /></Link>
                            <a style={{ fontSize: '25px' }} onClick={() => handleDelete(record)}><DeleteOutlined /></a>
                        </Space>
                    )}
                />
            </Table>
        </div>
    );
};

export default IndexCTTGoikham;
