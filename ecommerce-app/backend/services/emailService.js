const transporter = require('../config/email'); // Import cấu hình Nodemailer

// Hàm gửi email
const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Email người gửi
        to,                          // Email người nhận
        subject,                     // Tiêu đề email
        text,                        // Nội dung email
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response); // Log thông tin gửi email thành công
    } catch (error) {
        console.error('Error sending email:', error.message); // Log lỗi với thông tin chi tiết
        throw new Error('Error sending email');
    }
};

module.exports = { sendEmail }; // Xuất hàm ra để sử dụng ở nơi khác
