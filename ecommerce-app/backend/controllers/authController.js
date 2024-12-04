const { sendEmail } = require('../services/emailService'); // Import dịch vụ email
const VerificationCodeModel = require('../models/VerificationCodeModel'); // Import mô hình cơ sở dữ liệu nếu cần

// Hàm tạo mã xác thực ngẫu nhiên 6 chữ số
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Tạo mã 6 chữ số
};

// Controller gửi email xác thực
const sendVerificationEmail = async (req, res) => {
    const { email } = req.body; // Lấy email từ yêu cầu client

    // Kiểm tra tính hợp lệ của email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    const verificationCode = generateVerificationCode(); // Tạo mã xác thực ngẫu nhiên

    try {
        // Gửi email xác thực
        await sendEmail(
            email, 
            'Email Verification', 
            `Your verification code is: ${verificationCode}`
        );

        // Lưu mã xác thực vào cơ sở dữ liệu (nếu cần thiết)
        // Lưu mã vào bảng "VerificationCodes" với thời gian hết hạn
        await VerificationCodeModel.create({
            email,
            code: verificationCode,
            expiresAt: Date.now() + 10 * 60 * 1000 // Mã sẽ hết hạn sau 10 phút
        });

        res.status(200).json({ message: 'Verification email sent successfully!' });
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).json({ message: 'Failed to send email.' });
    }
};

module.exports = { sendVerificationEmail };
