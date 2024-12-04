import React, { useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link, useLocation } from 'react-router-dom';

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);
  const location = useLocation();

  useEffect(() => {
    // Cuộn lên đầu từ từ khi đường dẫn thay đổi (nhấp vào sản phẩm)
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [location]);

  return (
    <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
      <div className='overflow-hidden'>
        <img className='hover:scale-110 transition ease-in-out' src={image[0]} alt={name} />
      </div>
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <p className='text-sm font-medium'>{currency}{price}</p>
    </Link>
  );
};

export default ProductItem;
