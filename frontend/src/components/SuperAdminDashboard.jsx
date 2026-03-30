import React, { useEffect, useState } from 'react';
import axios from '../services/api';

export const SuperAdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const authConfig = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  };

  const fetchOverview = async () => {
    const response = await axios.get('/api/admin/overview', authConfig);
    setOverview(response.data.stats);
  };

  const fetchUsers = async () => {
    const params = {};

    if (roleFilter !== 'all') {
      params.role = roleFilter;
    }

    if (search.trim()) {
      params.search = search.trim();
    }

    const response = await axios.get('/api/admin/users', {
      ...authConfig,
      params,
    });

    setUsers(response.data);
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchOverview(), fetchUsers()]);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    fetchUsers().catch((error) => {
      setMessage(error.response?.data?.message || 'Failed to load users.');
    });
  }, [roleFilter]);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    try {
      await fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to search users.');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole }, authConfig);
      setMessage('User role updated successfully.');
      await Promise.all([fetchOverview(), fetchUsers()]);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update role.');
    }
  };

  if (loading) {
    return (
      <div className="ta-card">
        <div className="ta-card-body flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-stroke border-t-primary" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users',   value: overview?.users        ?? '—', color: 'text-primary' },
    { label: 'Super Admins',  value: overview?.super_admins ?? '—', color: 'text-danger' },
    { label: 'Employers',     value: overview?.employers    ?? '—', color: 'text-warning' },
    { label: 'Employees',     value: overview?.employees    ?? '—', color: 'text-success' },
    { label: 'Companies',     value: overview?.companies    ?? '—', color: 'text-primary' },
    { label: 'Teams',         value: overview?.teams        ?? '—', color: 'text-primary' },
    { label: 'Tasks',         value: overview?.tasks        ?? '—', color: 'text-warning' },
    { label: 'Reports',       value: overview?.reports      ?? '—', color: 'text-success' },
  ];

  const roleBadge = (role) => ({
    super_admin: 'ta-badge-danger',
    employer: 'ta-badge-warning',
    employee: 'ta-badge-primary',
  }[role] || 'ta-badge-primary');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-sidebar">Super Admin Dashboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">Platform overview and user role management</p>
        </div>
        <button onClick={loadDashboard} className="ta-btn-secondary flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {message && (
        <div className="rounded border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {message}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="ta-card !p-0">
            <div className="ta-card-body flex flex-col items-center py-5 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="mt-1 text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User table */}
      <div className="ta-card">
        <div className="ta-card-header">
          <h3 className="font-semibold text-sidebar">User Management</h3>
        </div>
        <div className="ta-card-body">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-3">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…" className="ta-input flex-1" />
              <button type="submit" className="ta-btn-primary">Search</button>
            </form>
            <div>
              <label className="ta-label">Role</label>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="ta-input">
                <option value="all">All roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="employer">Employer</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke">
                  <th className="pb-3 text-left font-semibold text-gray-500">Name</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Email</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Role</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Company</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Team</th>
                  <th className="pb-3 font-semibold text-gray-500">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-whiten transition-colors">
                    <td className="py-4 pr-4 font-medium text-sidebar">{u.name}</td>
                    <td className="py-4 pr-4 text-gray-500">{u.email}</td>
                    <td className="py-4 pr-4">
                      <span className={roleBadge(u.role)}>{u.role?.replace('_', ' ')}</span>
                    </td>
                    <td className="py-4 pr-4 text-gray-500">{u.company?.company_name || '—'}</td>
                    <td className="py-4 pr-4 text-gray-500">{u.team?.team_name || '—'}</td>
                    <td className="py-4">
                      <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="ta-input !py-1 !text-xs">
                        <option value="super_admin">Super Admin</option>
                        <option value="employer">Employer</option>
                        <option value="employee">Employee</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">No users match the current filter.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;