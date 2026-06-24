import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AppContext } from '../context/AppContext';
import { Settings, Shield, Trash2, Mail, Loader2, Compass } from 'lucide-react';

const AdminPanel = () => {
  const { showToast } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      showToast('Error loading administrative users list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, role: nextRole } : u))
      );
      showToast('User role updated successfully', 'success');
    } catch (err) {
      showToast('Failed to modify user role', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently wipe this user and all associated syllabus, notes, planner, and analytics data? This action is irreversible.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      showToast('User account successfully deleted', 'success');
    } catch (err) {
      showToast('Failed to delete user', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Admin header */}
      <div className="bg-white border border-customBorder rounded-xl p-6 shadow-sm flex items-center space-x-3.5">
        <div className="bg-blue-50 p-2.5 rounded-lg text-primary">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-customText">System Administration Panel</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage user permissions and review active user stats</p>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-customBorder rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-customBorder text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Name / Target Role</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Level / XP</th>
                <th className="px-6 py-4">System Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-customText">{u.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{u.profile?.targetRole || 'Not onboarded'}</div>
                  </td>
                  <td className="px-6 py-4 font-mono">{u.email}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-customText">LVL {u.level}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{u.xp} XP total</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                      u.role === 'admin' ? 'bg-red-50 text-error' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Shield className="w-3 h-3" />
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleUpdateRole(u._id, u.role)}
                      className="px-2.5 py-1 border hover:border-primary hover:text-primary transition-colors rounded text-[10px] font-bold"
                    >
                      Toggle Role
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-1 text-gray-400 hover:text-error transition-colors inline-block align-middle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default AdminPanel;
