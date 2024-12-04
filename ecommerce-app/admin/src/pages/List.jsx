import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    image: '',
  });

  // Fetch product list
  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Remove product
  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Open edit modal
  const openEditModal = (item) => {
    setEditData({
      id: item._id,
      name: item.name,
      category: item.category,
      price: item.price,
      image: item.image[0],
    });
    setEditModalOpen(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  // Update product
  const updateProduct = async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/update',
        {
          id: editData.id,
          name: editData.name,
          category: editData.category,
          price: editData.price,
          image: editData.image,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchList(); // Refresh list
        closeEditModal(); // Close modal
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Filtered list based on search term
  const filteredList = list.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-2xl font-semibold text-gray-800'>All Products List</p>
        <input
          type='text'
          placeholder='Search by name or category...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='border p-2 rounded w-64'
        />
      </div>
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Action</b>
        </div>

        {filteredList.map((item, index) => (
          <div
            className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm'
            key={index}
          >
            <img className='w-12' src={item.image[0]} alt='' />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>
              {currency}
              {item.price}
            </p>
            <div className='flex gap-2'>
              <p
                onClick={() => openEditModal(item)}
                className='cursor-pointer text-sm font-semibold text-blue-600 hover:text-white hover:bg-blue-600 hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 rounded-md px-3 py-1'
              >
                Edit
              </p>
              <p
                onClick={() => removeProduct(item._id)}
                className='cursor-pointer text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600 hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 rounded-md px-3 py-1'
              >
                Delete
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Product Modal */}
      {editModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-6 rounded-md w-96'>
            <h3 className='text-lg font-semibold mb-4'>Edit Product</h3>
            <div className='flex flex-col gap-2'>
              <input
                type='text'
                placeholder='Name'
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className='border p-2 rounded'
              />
              <input
                type='text'
                placeholder='Category'
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                className='border p-2 rounded'
              />
              <input
                type='number'
                placeholder='Price'
                value={editData.price}
                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                className='border p-2 rounded'
              />
              <input
                type='text'
                placeholder='Image URL'
                value={editData.image}
                onChange={(e) => setEditData({ ...editData, image: e.target.value })}
                className='border p-2 rounded'
              />
            </div>
            <div className='flex justify-end gap-2 mt-4'>
              <button onClick={closeEditModal} className='px-4 py-2 bg-gray-200 rounded'>
                Cancel
              </button>
              <button onClick={updateProduct} className='px-4 py-2 bg-blue-600 text-white rounded'>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default List;
