import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingUsers, setDeletingUsers] = useState({}); // Track users being deleted
  const [editingUser, setEditingUser] = useState(null); // Track the user being edited

  // Fetch danh sách người dùng
  const fetchUsers = async () => {
    if (!token) {
      toast.error('No token found. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError('Failed to fetch users.');
      }
    } catch (err) {
      setError(err.message || 'Error fetching users.');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật thông tin người dùng
  const updateUserHandler = async (id, updatedData) => {
    try {
      const { data } = await axios.put(`${backendUrl}/api/user/update/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user._id === id ? data.user : user))
        );
        toast.success('User updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update user.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating user.');
    }
  };

  // Xử lý xóa người dùng
  const deleteUserHandler = async (userId) => {
    if (!token) {
      toast.error('No token found. Please log in again.');
      return;
    }

    setDeletingUsers((prev) => ({ ...prev, [userId]: true }));

    try {
      const { data } = await axios.delete(`${backendUrl}/api/user/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        toast.success('User deleted successfully!');
      } else {
        toast.error(data.message || 'Failed to delete user.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting user.');
    } finally {
      setDeletingUsers((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Thử lại khi có lỗi
  const handleRetry = () => {
    setError('');
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button
            className="bg-yellow-500 hover:bg-yellow-400 text-white px-3 py-1 rounded"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center text-lg">Loading...</div>
      ) : (
        <>
          <UserTable
            users={users}
            deleteUserHandler={deleteUserHandler}
            deletingUsers={deletingUsers}
            onEdit={(user) => setEditingUser(user)} // Cập nhật thông tin người dùng
          />
          {editingUser && (
            <EditUserModal
              user={editingUser}
              onSave={updateUserHandler}
              onClose={() => setEditingUser(null)} // Đóng modal
            />
          )}
        </>
      )}
    </div>
  );
};

const UserTable = ({ users, deleteUserHandler, deletingUsers, onEdit }) => (
  <table className="w-full table-auto border-collapse border border-gray-300">
    <thead>
      <tr className="bg-gray-200">
        <th className="border p-2">ID</th>
        <th className="border p-2">Name</th>
        <th className="border p-2">Email</th>
        <th className="border p-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.length > 0 ? (
        users.map((user) => (
          <tr key={user._id}>
            <td className="border p-2">{user._id}</td>
            <td className="border p-2">{user.name}</td>
            <td className="border p-2">{user.email}</td>
            <td className="border p-2 flex space-x-2">
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-400"
                onClick={() => onEdit(user)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400"
                onClick={() => deleteUserHandler(user._id)}
                disabled={deletingUsers[user._id]}
              >
                {deletingUsers[user._id] ? 'Deleting...' : 'Delete'}
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="4" className="text-center p-4">
            No users found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
);

const EditUserModal = ({ user, onSave, onClose }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    onSave(user._id, { name, email });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border mb-4"
          placeholder="Name"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border mb-4"
          placeholder="Email"
        />
        <div className="flex justify-end space-x-2">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
