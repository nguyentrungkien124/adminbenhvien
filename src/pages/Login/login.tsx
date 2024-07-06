import React, { useState } from 'react';
import axios from 'axios';
import '../Login/login.css'; // Nhập file CSS
import { notification } from 'antd';

interface LoginProps {
    onLoginSuccess: () => void; // Khai báo prop onLoginSuccess
}

function Login({ onLoginSuccess }: LoginProps) {
    const [username, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://localhost:44381/api/UserControllers/login', {
                username,
                password
            });

            if (response.status === 200) {
                // Đăng nhập thành công
                console.log('Đăng nhập thành công:', response.data);
                notification.success({
                    message: 'Đăng nhập thành công',
                    description: 'Xin chào admin Kiên',
                    placement: 'top',
                    duration: 2 // Thông báo tự động biến mất sau 3 giây
                  });
                // Gọi onLoginSuccess khi đăng nhập thành công
                onLoginSuccess();
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
                    <label>Username:</label>
                    <input
                        type="username"
                        value={username}
                        onChange={(e) => setEmail(e.target.value)}
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
