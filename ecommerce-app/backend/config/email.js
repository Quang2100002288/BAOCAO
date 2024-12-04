import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config(); // Tải các biến môi trường từ tệp .env

const transporter = nodemailer.createTransport({
    service: 'gmail', // Sử dụng Gmail làm dịch vụ gửi email
    auth: {
        user: process.env.EMAIL_USER, // Email người gửi từ .env
        pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng từ .env
    },
    tls: {
        rejectUnauthorized: false // Giúp tránh lỗi khi kết nối không được chứng thực
    }
});

export default transporter;
