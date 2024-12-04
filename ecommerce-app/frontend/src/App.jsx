import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";        
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import ChangePassword from "./pages/ChangePassword"; // Import thêm ChangePassword
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ResetPassword from './pages/ResetPassword';  // Nếu bạn muốn tạo trang reset mật khẩu
import ForgotPassword from './pages/ForgotPassword';  // Thêm import ForgotPassword
import Verify from './pages/Verify';


const App = () => {
  return (
    <div className='px-4 sm:px-[-5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      <Navbar />
      <SearchBar />
      <Routes>
        <Route path='/' element={<Home />} />                 
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} /> 
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<Login />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/verify' element={<Verify />} />
        <Route path='/change-password' element={<ChangePassword />} /> {/* Route mới */}
        <Route path='/forgot-password' element={<ForgotPassword />} />  {/* Route cho quên mật khẩu */}
        <Route path='/reset-password/:token' element={<ResetPassword />} />  {/* Route cho đặt lại mật khẩu */}
      </Routes>
      <Footer/>
    </div>
  );
};

export default App;
