import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);  // Trạng thái loading
  const { backendUrl } = useContext(ShopContext); // Lấy backendUrl từ context

  // Hàm gửi yêu cầu quên mật khẩu
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra tính hợp lệ của email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true); // Đặt trạng thái loading là true khi gửi yêu cầu

    try {
      // Gửi yêu cầu tới backend API
      const response = await axios.post(`${backendUrl}/api/user/forgot-password`, { email });
      setMessage(response.data.message); // Hiển thị thông báo thành công
      toast.success(response.data.message); // Hiển thị thông báo success
    } catch (error) {
      // Xử lý lỗi
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      setMessage(errorMessage); // Hiển thị thông báo lỗi
      toast.error(errorMessage); // Hiển thị toast lỗi
    } finally {
      setLoading(false); // Đặt trạng thái loading là false khi hoàn thành
    }
  };

  return (
    <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <h2 className='text-3xl mb-6'>Forgot Password</h2>
      <form onSubmit={handleSubmit} className='flex flex-col items-center w-full gap-4'>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full px-3 py-2 border border-gray-800'
          required
        />
        <button
          type="submit"
          className={`bg-black text-white font-light px-8 py-2 mt-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading} // Vô hiệu hóa nút khi đang loading
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {message && <p className='mt-4'>{message}</p>} {/* Hiển thị thông báo */}
    </div>
  );
};

export default ForgotPassword;
