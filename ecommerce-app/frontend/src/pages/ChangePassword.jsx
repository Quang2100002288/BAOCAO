import React, { useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext"; 
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title"

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State xử lý loading
  const [errorMessage, setErrorMessage] = useState(''); // State lưu thông báo lỗi

  const { token, backendUrl, navigate } = useContext(ShopContext); // Lấy token và backend URL từ context

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true); // Bắt đầu xử lý gửi yêu cầu
    setErrorMessage(''); // Reset lỗi

    // Kiểm tra nếu mật khẩu mới và mật khẩu xác nhận không trùng khớp
    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      setIsLoading(false); // Kết thúc xử lý
      return;
    }

    try {
      const response = await axios.put(
        backendUrl + '/api/user/change-password',
        { oldPassword, newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message); // Thông báo thành công
        navigate('/'); // Chuyển hướng về trang chủ
      } else {
        setErrorMessage(response.data.message); // Hiển thị lỗi từ backend
      }
    } catch (error) {
      console.error("Error details: ", error);  // In chi tiết lỗi ra console

      if (error.response) {
        // Nếu có lỗi trả về từ backend (status khác 2xx)
        const backendError = error.response.data; // Lấy thông báo lỗi từ backend
        console.log('Backend Error:', backendError);
        setErrorMessage(backendError.message || "Đã có lỗi xảy ra, vui lòng thử lại.");
      } else {
        // Nếu lỗi không phải do backend (có thể do mạng hoặc server không phản hồi)
        setErrorMessage("Lỗi kết nối mạng hoặc server.");
      }
    } finally {
      setIsLoading(false); // Kết thúc xử lý
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col items-center bg-white shadow-md rounded p-8 mb-4 w-full sm:w-96"
      >
        <div className='text-2xl mb-4'>
        <Title text1={'Change '} text2={'Password'}/>
        </div>
        

        {/* Hiển thị thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="mb-4 text-red-500">{errorMessage}</div>
        )}

        <div className="mb-4">
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Enter old password"
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Enter new password"
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Confirm new password"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white font-light px-8 py-2 mt-4"
          disabled={isLoading} // Disable nút khi đang xử lý
        >
          {isLoading ? "Processing..." : "Confirm"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
