import validator from "validator";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";
import crypto from 'crypto'; // Để tạo mã token cho reset mật khẩu
import nodemailer from 'nodemailer'; // Để gửi email
import User from '../models/userModel.js';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Checking if user already exists
        const exists = await userModel.findOne({ email });

        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }

        // Validating email format & password strength
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        // Hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        });

        const user = await newUser.save();

        const token = createToken(user._id);

        // Gửi email xác minh sau khi đăng ký
        sendVerificationEmail(user.email);

        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Hàm gửi email xác minh
const sendVerificationEmail = async (email) => {
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            console.log('User not found');
            return;
        }

        const verificationToken = crypto.randomBytes(20).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationTokenExpire = Date.now() + 3600000; // Token hết hạn sau 1 giờ

        await user.save();

        // Gửi email xác minh
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
        const mailOptions = {
            to: email,
            subject: 'Email Verification',
            text: `Please verify your email by clicking the following link: ${verificationUrl}`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error(error);
    }
};

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Find user by ID from the protect middleware
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Old password is incorrect" });
        }

        // Check if the new password is different from the old one
        if (oldPassword === newPassword) {
            return res.status(400).json({ success: false, message: "New password cannot be the same as old password" });
        }

        // Validate the strength of the new password (optional)
        const passwordStrength = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordStrength.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long, include a letter, a number, and a special character"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Save the updated user
        await user.save();
        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Route for forgot password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000; // Token expires in 1 hour

        await user.save();

        // Send reset email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            to: email,
            subject: 'Password Reset Request',
            text: `You requested to reset your password. Please click the following link to reset your password: ${resetUrl}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Route for reset password
const resetPassword = async (req, res) => {
    const { token } = req.params;  // Lấy token từ URL
    const { newPassword } = req.body;
    try {
        // Kiểm tra xem token có hợp lệ và chưa hết hạn không
        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now() },  // Kiểm tra hết hạn token
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Kiểm tra mật khẩu mới có hợp lệ không (ví dụ: ít nhất 8 ký tự, có số và chữ)
        const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        if (!newPassword || !passwordPattern.test(newPassword)) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, and one number' });
        }

        // Kiểm tra xem mật khẩu mới có trùng với mật khẩu cũ không
        if (await bcrypt.compare(newPassword, user.password)) {
            return res.status(400).json({ success: false, message: 'New password cannot be the same as the old password' });
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear token và thời gian hết hạn
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // Lưu người dùng đã cập nhật mật khẩu
        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


////
// Lấy danh sách người dùng
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}); // Truy xuất tất cả người dùng
        if (!users) {
          return res.status(404).json({ success: false, message: "No users found" });
        }
        res.status(200).json({ success: true, users });
      } catch (error) {
        console.error("Error fetching users:", error); // Thêm log chi tiết
        res.status(500).json({ success: false, message: "Error fetching users" });
      }
    };
  
  
  // Cập nhật thông tin người dùng
  export const updateUser = async (req, res) => {
    try {
      const { id } = req.params; // Lấy ID từ URL
      const { name, email } = req.body; // Dữ liệu cần cập nhật từ body
  
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Cập nhật thông tin
      user.name = name || user.name;
      user.email = email || user.email;
  
      // Lưu lại thay đổi
      const updatedUser = await user.save();
  
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message,
      });
    }
  };
  
  
  // Xóa người dùng
  export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params; // Lấy userId từ params
  
      // Tìm người dùng trong DB và xóa
      const user = await userModel.findByIdAndDelete(id);
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
  };
  

export { loginUser, registerUser, adminLogin, changePassword, forgotPassword, resetPassword, sendVerificationEmail };
