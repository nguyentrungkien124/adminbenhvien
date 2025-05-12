import React, { useState } from 'react';
import axios from 'axios';
import '../Login/login.css'; // Nhập file CSS
import { notification } from 'antd';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
    onLoginSuccess: () => void; // Khai báo prop onLoginSuccess
}

function Login({ onLoginSuccess }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:9999/api/admin/loginadmin', {
                email,
                password
            });

            if (response.status === 200) {
                // Đăng nhập thành công
                console.log('Đăng nhập thành công:', response.data);

                // Giả sử response.data chứa thông tin người dùng như id, name, email
                const userData = {
                    id: response.data.id, // ID người dùng
                    name: response.data.name, // Tên người dùng
                    email: response.data.email,
                    khoa_id: response.data.khoa_id,
                    role:response.data.role,
                     bac_si_id:response.data.bac_si_id 
                     // Email người dùng
                };

                // Lưu thông tin người dùng vào sessionStorage
                sessionStorage.setItem('user', JSON.stringify(userData));

                notification.success({
                    message: 'Đăng nhập thành công',
                    description: `Xin chào ${userData.name}`,
                    placement: 'top',
                    duration: 2 // Thông báo tự động biến mất sau 2 giây
                });

                // Gọi onLoginSuccess khi đăng nhập thành công
                onLoginSuccess();
                navigate('/');
            } else {
                setError('Thông tin đăng nhập không chính xác');
            }
        } catch (error) {
            setError('Đã xảy ra lỗi khi đăng nhập');
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2 className="login-title">Admin Login</h2>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
                {error && <p className="login-error">{error}</p>}
            </form>
        </div>
    );
}

export default Login;
