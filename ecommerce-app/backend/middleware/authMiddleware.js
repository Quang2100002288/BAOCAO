import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const protect = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
        ? req.headers.authorization.split(' ')[1] 
        : null;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token không được cung cấp, vui lòng đăng nhập' });
    }

    try {
        // Kiểm tra tính hợp lệ của token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Lấy người dùng từ database, bỏ qua mật khẩu
        req.user = await userModel.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng với token này' });
        }

        // Tiếp tục middleware
        next();
    } catch (error) {
        console.error('Token verification failed:', error);

        // Xử lý các lỗi từ jwt.verify()
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token đã hết hạn, vui lòng đăng nhập lại' });
        }

        // Lỗi không xác định
        return res.status(500).json({ success: false, message: 'Lỗi không xác định trong khi xử lý token' });
    }
};
export const adminProtect = (req, res, next) => {
    if (req.user.role !== 'admin') {  // Kiểm tra quyền của người dùng
      return res.status(403).json({ message: 'Not authorized as an admin' });
    }
    next();
  };

export { protect };
