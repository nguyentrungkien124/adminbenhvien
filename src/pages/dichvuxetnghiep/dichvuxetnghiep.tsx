import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Spin,
  Empty,
  Space,
  Tag,
  Card,
  Typography,
  Form,
  Input,
  message,
  Tooltip,
} from 'antd';
import {
  FileSearchOutlined,
  CheckCircleOutlined,
  UserOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ServiceRequest {
  request_id: number;
  appointment_id: number;
  service_id: number;
  service_name: string;
  service_type: string;
  khoa_id: number;
  khoa_name: string;
  bac_si_id: number;
  bac_si_name: string;
  status: string;
  created_at: string;
  khach_hang_id: number;
  benh_nhan_name: string;
  gioi_tinh: string;
  ngay_sinh: string;
  trieu_chung: string;
  // Thêm các trường kết quả
  result_id?: number;
  result_text?: string;
  result_file_url?: string;
  completed_at?: string;
}

interface ServiceResult {
  id: number;
  request_id: number;
  result_text: string | null;
  result_file_url: string | null;
  nguoi_dung_id: number;
  completed_at: string;
}

const XetNghiemKhoa: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [serviceResult, setServiceResult] = useState<ServiceResult | null>(null);
  const [ketLuan, setKetLuan] = useState<string>('');
  const [viewResultModal, setViewResultModal] = useState<ServiceRequest | null>(null);
  
  const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
  const khoaId = userData.khoa_id || null;
  const userId = userData.id || null;
  const bacSiId = userData.bac_si_id || null;

  const fetchServiceRequests = async () => {
    if (!khoaId) {
      message.error('Không tìm thấy thông tin khoa. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setLoading(true);
      // Lấy tất cả yêu cầu bao gồm cả completed
      const response = await axios.get(`http://localhost:9999/api/dichvu/service-requests/by-khoa?khoa_id=${khoaId}`);
      const requests = response.data || [];
      
      // Lấy kết quả cho từng yêu cầu đã hoàn thành
      const requestsWithResults = await Promise.all(
        requests.map(async (request: ServiceRequest) => {
          if (request.status === 'completed') {
            try {
              const resultResponse = await axios.get(`http://localhost:9999/api/dichvu/service-results/by-request?request_id=${request.request_id}`);
              const results = resultResponse.data || [];
              if (results.length > 0) {
                const result = results[0];
                return {
                  ...request,
                  result_id: result.id,
                  result_text: result.result_text,
                  result_file_url: result.result_file_url,
                  completed_at: result.completed_at,
                };
              }
            } catch (error) {
              console.error(`Không thể lấy kết quả cho request ${request.request_id}:`, error);
            }
          }
          return request;
        })
      );
      
      setServiceRequests(requestsWithResults);
    } catch (error: any) {
      console.error('Lỗi khi lấy danh sách yêu cầu xét nghiệm:', error);
      message.error('Không thể tải danh sách yêu cầu xét nghiệm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, [khoaId]);

  const handleConfirmRequest = async (request: ServiceRequest) => {
    try {
      setLoading(true);
      await axios.put('http://localhost:9999/api/dichvu/service-requests/update-status', {
        request_id: request.request_id,
        status: 'in_progress',
      });
      setServiceRequests((prev) =>
        prev.map((req) =>
          req.request_id === request.request_id ? { ...req, status: 'in_progress' } : req
        )
      );
      message.success('Xác nhận yêu cầu thành công.');
    } catch (error: any) {
      console.error('Lỗi khi xác nhận yêu cầu:', error);
      message.error('Không thể xác nhận yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = async (record: ServiceRequest) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:9999/api/dichvu/service-results/by-request?request_id=${record.request_id}`);
      const results = response.data || [];
      const existingResult = results.length > 0 ? results[0] : null;
      setServiceResult(existingResult);
      setKetLuan(existingResult?.result_text || '');
      setSelectedRequest(record);
    } catch (error: any) {
      console.error('Lỗi khi lấy kết quả xét nghiệm:', error);
      message.error('Không thể tải kết quả xét nghiệm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKetLuan = async () => {
    if (!selectedRequest || !ketLuan.trim()) {
      message.error('Vui lòng nhập kết luận trước khi lưu.');
      return;
    }
    if (!userId) {
      message.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setSaveLoading(true);
      
      const response = await axios.post('http://localhost:9999/api/dichvu/service-results/add', {
        request_id: selectedRequest.request_id,
        result_text: ketLuan,
        result_file_url: null,
        nguoi_dung_id: userId,
      });

      // Cập nhật trạng thái thành completed
      await axios.put('http://localhost:9999/api/dichvu/service-requests/update-status', {
        request_id: selectedRequest.request_id,
        status: 'completed',
      });

      // Cập nhật danh sách với kết quả mới
      setServiceRequests((prev) =>
        prev.map((req) =>
          req.request_id === selectedRequest.request_id 
            ? { 
                ...req, 
                status: 'completed',
                result_id: response.data.id,
                result_text: ketLuan,
                completed_at: new Date().toISOString()
              } 
            : req
        )
      );
      
      setSelectedRequest(null);
      setKetLuan('');
      setServiceResult(null);
      message.success('Kết luận đã được lưu và yêu cầu hoàn thành.');
      
    } catch (error: any) {
      console.error('Lỗi khi lưu kết luận:', error.response?.data || error.message);
      message.error(`Không thể lưu kết luận: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleViewResult = (record: ServiceRequest) => {
    setViewResultModal(record);
  };

  const columns = [
    {
      title: 'Mã YC',
      dataIndex: 'request_id',
      key: 'request_id',
      width: 80,
    },
    {
      title: 'Tên bệnh nhân',
      dataIndex: 'benh_nhan_name',
      key: 'benh_nhan_name',
      width: 150,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'service_name',
      key: 'service_name',
      width: 200,
    },
    {
      title: 'Kết quả',
      key: 'result',
      width: 250,
      render: (_: any, record: ServiceRequest) => {
        if (record.status === 'completed' && record.result_text) {
          return (
            <div>
              <Text 
                style={{ 
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px'
                }}
              >
                {record.result_text}
              </Text>
              <Space size={4} style={{ marginTop: 4 }}>
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EyeOutlined />}
                  onClick={() => handleViewResult(record)}
                >
                  Xem chi tiết
                </Button>
                {record.result_file_url && (
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<FilePdfOutlined />}
                    onClick={() => window.open(record.result_file_url, '_blank')}
                  >
                    Tải file
                  </Button>
                )}
              </Space>
            </div>
          );
        }
        return <Text type="secondary">Chưa có kết quả</Text>;
      },
    },
    {
      title: 'Ngày hoàn thành',
      key: 'completed_date',
      width: 140,
      render: (_: any, record: ServiceRequest) => {
        if (record.completed_at) {
          return dayjs(record.completed_at).format('DD/MM/YYYY HH:mm');
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={
          status === 'pending' ? 'orange' : 
          status === 'in_progress' ? 'blue' : 
          status === 'completed' ? 'green' : 'default'
        }>
          {status === 'pending' ? 'Chờ xử lý' : 
           status === 'in_progress' ? 'Đang xử lý' : 
           status === 'completed' ? 'Hoàn thành' : status}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_: any, record: ServiceRequest) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleConfirmRequest(record)}
            >
              Xác nhận
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleSelectRequest(record)}
            >
              Nhập KQ
            </Button>
          )}
          {record.status === 'completed' && (
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewResult(record)}
            >
              Xem
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={3}>Quản lý Xét nghiệm - Khoa {khoaId || 'Không xác định'}</Title>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={serviceRequests}
          rowKey="request_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: <Empty description="Không có yêu cầu xét nghiệm nào" />,
          }}
        />

        {/* Modal nhập kết quả */}
        {selectedRequest && (
          <Modal
            title={
              <Space>
                <FileSearchOutlined style={{ color: '#1890ff' }} />
                <span>Nhập Kết quả Xét nghiệm - {selectedRequest.benh_nhan_name}</span>
              </Space>
            }
            open={true}
            onCancel={() => {
              setSelectedRequest(null);
              setKetLuan('');
              setServiceResult(null);
            }}
            footer={null}
            width={800}
          >
            <Card>
              <Space direction="vertical" size={12}>
                <Text>
                  <InfoCircleOutlined /> Giới tính: {selectedRequest.gioi_tinh}
                </Text>
                <Text>
                  <FileTextOutlined /> Ngày sinh: {dayjs(selectedRequest.ngay_sinh).format('DD/MM/YYYY') || 'N/A'}
                </Text>
                <Text>
                  <InfoCircleOutlined /> Triệu chứng: {selectedRequest.trieu_chung}
                </Text>
                <Text>
                  <FileTextOutlined /> Dịch vụ: {selectedRequest.service_name} ({selectedRequest.service_type})
                </Text>
              </Space>

              <Form layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item label="Kết luận xét nghiệm">
                  <TextArea
                    rows={4}
                    value={ketLuan}
                    onChange={(e) => setKetLuan(e.target.value)}
                    placeholder="Nhập kết luận (ví dụ: WBC: 9.0 x10^9/L - Bình thường)"
                  />
                </Form.Item>
                <Button
                  type="primary"
                  onClick={handleSaveKetLuan}
                  loading={saveLoading}
                  disabled={!ketLuan.trim()}
                >
                  Lưu kết quả
                </Button>
              </Form>
            </Card>
          </Modal>
        )}

        {/* Modal xem kết quả */}
        {viewResultModal && (
          <Modal
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>Kết quả Xét nghiệm - {viewResultModal.benh_nhan_name}</span>
              </Space>
            }
            open={true}
            onCancel={() => setViewResultModal(null)}
            footer={[
              <Button key="close" onClick={() => setViewResultModal(null)}>
                Đóng
              </Button>,
              ...(viewResultModal.result_file_url ? [
                <Button 
                  key="download" 
                  type="primary" 
                  icon={<FilePdfOutlined />}
                  onClick={() => window.open(viewResultModal.result_file_url, '_blank')}
                >
                  Tải file kết quả
                </Button>
              ] : [])
            ]}
            width={700}
          >
            <Card>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Text>
                  <InfoCircleOutlined /> Mã yêu cầu: {viewResultModal.request_id}
                </Text>
                <Text>
                  <FileTextOutlined /> Dịch vụ: {viewResultModal.service_name} ({viewResultModal.service_type})
                </Text>
                <Text>
                  <InfoCircleOutlined /> Ngày hoàn thành: {dayjs(viewResultModal.completed_at).format('DD/MM/YYYY HH:mm')}
                </Text>
                
                <div style={{ marginTop: 16 }}>
                  <Text strong>Kết quả:</Text>
                  <div style={{ 
                    marginTop: 8, 
                    padding: 12, 
                    background: '#f6f8fa', 
                    borderRadius: 6,
                    border: '1px solid #e1e8ed'
                  }}>
                    <Text>{viewResultModal.result_text}</Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Modal>
        )}
      </Spin>
    </div>
  );
};

export default XetNghiemKhoa;