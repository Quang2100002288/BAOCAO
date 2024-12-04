import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";  // Import ShopContext

const ResetPassword = () => {
  const { token } = useParams();  // Lấy token từ URL
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { backendUrl } = useContext(ShopContext);  // Lấy backendUrl từ context

  // Kiểm tra mật khẩu mạnh
  const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (!validatePassword(newPassword)) {
      return toast.error("Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, and a number.");
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${backendUrl}/api/user/reset-password/${token}`,
        { newPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      // Kiểm tra nếu phản hồi từ server trả về thành công
      if (response.data.success) {
        toast.success("Password reset successfully");
        navigate('/login');  // Redirect to login page after success
      } else {
        toast.error(response.data.message || "Unknown error occurred.");
      }
    } catch (error) {
      console.error(error);
      // Hiển thị thông báo lỗi chi tiết từ API
      if (error.response) {
        // Lỗi từ server, hiển thị chi tiết
        toast.error(error.response.data.message || "Something went wrong. Please try again.");
      } else {
        // Lỗi mạng hoặc không thể kết nối
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra nếu token không tồn tại trong URL
  if (!token) {
    return <div>Error: Invalid or missing reset token. Please check the link you received.</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:w-96 p-8 bg-white border shadow-lg rounded-lg"
      >
        <h2 className="text-2xl mb-6 text-center">Reset Password</h2>

        {/* Mật khẩu mới */}
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
          required
        />

        {/* Xác nhận mật khẩu */}
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded mb-6"
          required
        />

        {/* Nút gửi */}
        <button
          type="submit"
          className="w-full py-2 bg-black text-white rounded"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
