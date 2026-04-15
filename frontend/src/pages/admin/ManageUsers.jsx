import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiShield, FiUser, FiSlash, FiCheck, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:9999/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, updateData) => {
    // Safety check confirmation for banning/promoting
    if (updateData.isBanned && !window.confirm("Are you sure you want to BAN this user? They will not be able to log in.")) return;
    if (updateData.role === 'admin' && !window.confirm("Promote this user to Admin? They will have full access.")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:9999/api/admin/users/${userId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state without refreshing
      setUsers(users.map(u => u._id === userId ? { ...u, ...updateData } : u));
      toast.success('User updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  // Filter users based on the search bar
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-white text-center font-mono">Loading Users...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-2">
              <FiUser /> Community Oversight
            </h1>
            <p className="text-gray-400 mt-1">Manage platform users, roles, and access.</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text"
              placeholder="Search username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-700 text-gray-300 border-b border-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4">Developer</th>
                <th className="p-4 text-center">Elo Rating</th>
                <th className="p-4 text-center">Role</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-750 transition">
                  
                  {/* User Info */}
                  <td className="p-4">
                    <div className="font-bold text-lg">{user.username}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>

                  {/* Elo Stats */}
                  <td className="p-4 text-center">
                    <span className="font-mono font-bold text-yellow-400">{user.statistics?.eloRating || 1200}</span>
                  </td>

                  {/* Role Badge */}
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1 w-max mx-auto
                      ${user.role === 'admin' ? 'bg-purple-900/50 text-purple-400 border border-purple-500/30' : 'bg-blue-900/50 text-blue-400 border border-blue-500/30'}`}>
                      {user.role === 'admin' ? <FiShield size={12}/> : <FiUser size={12}/>}
                      {user.role}
                    </span>
                  </td>

                  {/* Ban Status */}
                  <td className="p-4 text-center">
                    {user.isBanned ? (
                      <span className="text-xs font-bold text-red-400 bg-red-900/30 px-2 py-1 rounded">SUSPENDED</span>
                    ) : (
                      <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded">ACTIVE</span>
                    )}
                  </td>

                  {/* Quick Actions */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      
                      {/* Toggle Role */}
                      <button 
                        onClick={() => handleUpdateUser(user._id, { role: user.role === 'admin' ? 'learner' : 'admin' })}
                        className="text-gray-400 hover:text-purple-400 transition hover:scale-110"
                        title={user.role === 'admin' ? "Demote to Learner" : "Promote to Admin"}
                      >
                        <FiShield size={18} />
                      </button>

                      {/* Toggle Ban */}
                      <button 
                        onClick={() => handleUpdateUser(user._id, { isBanned: !user.isBanned })}
                        className={`transition hover:scale-110 ${user.isBanned ? 'text-green-500 hover:text-green-400' : 'text-gray-400 hover:text-red-500'}`}
                        title={user.isBanned ? "Unban User" : "Ban User"}
                      >
                        {user.isBanned ? <FiCheck size={18} /> : <FiSlash size={18} />}
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500">No users found matching "{searchTerm}".</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ManageUsers;