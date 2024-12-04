import express from 'express';
import {
    loginUser,
    registerUser,
    adminLogin,
    changePassword,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    getUsers, // Lấy danh sách người dùng
    updateUser, // Cập nhật thông tin người dùng
    deleteUser // Xóa người dùng
  } from '../controllers/userController.js';  // Import đầy đủ các hàm
  import { protect, adminProtect } from '../middleware/authMiddleware.js';  // Middleware bảo vệ route

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);

// Thêm route cho chức năng đổi mật khẩu
userRouter.put('/change-password', protect, changePassword);  // Route PUT cho đổi mật khẩu

userRouter.post('/forgot-password', forgotPassword);  // Route cho quên mật khẩu
userRouter.put('/reset-password/:token', resetPassword);

// Định nghĩa endpoint gửi email xác minh
userRouter.post('/send-verification-email', sendVerificationEmail);  // Thêm route gửi email xác minh

// Route bảo vệ để lấy danh sách người dùng
userRouter.get('/users', getUsers);

// Route cập nhật thông tin người dùng
userRouter.put('/update/:id', updateUser); 

// Route xóa người dùng, chỉ admin có thể thực hiện
userRouter.delete('/delete/:id', deleteUser);  // Xóa người dùng


export default userRouter;
