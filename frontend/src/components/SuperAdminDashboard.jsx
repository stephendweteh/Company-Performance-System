import React, { useEffect, useMemo, useState } from 'react';
import axios from '../services/api';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'employee',
  company_id: '',
  team_id: '',
};

export const SuperAdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const authConfig = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  };

  const isEditMode = useMemo(() => editingUserId !== null, [editingUserId]);

  const fetchOverview = async () => {
    const response = await axios.get('/api/admin/overview', authConfig);
    setOverview(response.data.stats);
  };

  const fetchCompaniesAndTeams = async () => {
    const [companiesResponse, teamsResponse] = await Promise.all([
      axios.get('/api/companies', authConfig),
      axios.get('/api/teams', authConfig),
    ]);

    setCompanies(companiesResponse.data || []);
    setTeams(teamsResponse.data || []);
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
      await Promise.all([fetchOverview(), fetchUsers(), fetchCompaniesAndTeams()]);
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

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingUserId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setFormData(emptyForm);
    setEditingUserId(null);
    setShowForm(true);
    setMessage('');
  };

  const openEditForm = (user) => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'employee',
      company_id: user.company_id ? String(user.company_id) : '',
      team_id: user.team_id ? String(user.team_id) : '',
    });
    setEditingUserId(user.id);
    setShowForm(true);
    setMessage('');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        company_id: formData.company_id || null,
        team_id: formData.team_id || null,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      if (!isEditMode && !payload.password) {
        setMessage('Password is required when creating a user.');
        setSaving(false);
        return;
      }

      if (isEditMode) {
        await axios.put(`/api/admin/users/${editingUserId}`, payload, authConfig);
        setMessage('User updated successfully.');
      } else {
        await axios.post('/api/admin/users', payload, authConfig);
        setMessage('User created successfully.');
      }

      resetForm();
      await Promise.all([fetchOverview(), fetchUsers()]);
    } catch (error) {
      const validationMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : null;
      setMessage(validationMessage || error.response?.data?.message || 'Failed to save user.');
    }

    setSaving(false);
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete user ${user.name}? This cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${user.id}`, authConfig);
      setMessage('User deleted successfully.');
      await Promise.all([fetchOverview(), fetchUsers()]);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete user.');
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
    { label: 'Total Users', value: overview?.users ?? '-', color: 'text-primary' },
    { label: 'Super Admins', value: overview?.super_admins ?? '-', color: 'text-danger' },
    { label: 'Employers', value: overview?.employers ?? '-', color: 'text-warning' },
    { label: 'Employees', value: overview?.employees ?? '-', color: 'text-success' },
    { label: 'Companies', value: overview?.companies ?? '-', color: 'text-primary' },
    { label: 'Teams', value: overview?.teams ?? '-', color: 'text-primary' },
    { label: 'Tasks', value: overview?.tasks ?? '-', color: 'text-warning' },
    { label: 'Reports', value: overview?.reports ?? '-', color: 'text-success' },
  ];

  const roleBadge = (role) =>
    ({
      super_admin: 'ta-badge-danger',
      employer: 'ta-badge-warning',
      employee: 'ta-badge-primary',
    }[role] || 'ta-badge-primary');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-sidebar">Super Admin Dashboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">Full user management CRUD and system overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreateForm} className="ta-btn-primary">Create User</button>
          <button onClick={loadDashboard} className="ta-btn-secondary">Refresh</button>
        </div>
      </div>

      {message && (
        <div className="rounded border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {message}
        </div>
      )}

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

      {showForm && (
        <div className="ta-card">
          <div className="ta-card-header flex items-center justify-between">
            <h3 className="font-semibold text-sidebar">{isEditMode ? 'Edit User' : 'Create User'}</h3>
            <button onClick={resetForm} className="ta-btn-secondary">Cancel</button>
          </div>
          <div className="ta-card-body">
            <form onSubmit={handleSaveUser} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="ta-label">Name</label>
                <input name="name" value={formData.name} onChange={handleFormChange} required className="ta-input" />
              </div>
              <div>
                <label className="ta-label">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} required className="ta-input" />
              </div>
              <div>
                <label className="ta-label">Password {isEditMode ? '(optional)' : ''}</label>
                <input type="password" name="password" value={formData.password} onChange={handleFormChange} className="ta-input" />
              </div>
              <div>
                <label className="ta-label">Role</label>
                <select name="role" value={formData.role} onChange={handleFormChange} className="ta-input">
                  <option value="super_admin">Super Admin</option>
                  <option value="employer">Employer</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div>
                <label className="ta-label">Company</label>
                <select name="company_id" value={formData.company_id} onChange={handleFormChange} className="ta-input">
                  <option value="">No company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>{company.company_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ta-label">Team</label>
                <select name="team_id" value={formData.team_id} onChange={handleFormChange} className="ta-input">
                  <option value="">No team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.team_name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={saving} className="ta-btn-primary w-full md:w-auto disabled:opacity-60">
                  {saving ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="ta-card">
        <div className="ta-card-header">
          <h3 className="font-semibold text-sidebar">User Management</h3>
        </div>
        <div className="ta-card-body">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="ta-input flex-1"
              />
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
                  <th className="pb-3 text-left font-semibold text-gray-500">Role Quick Change</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-whiten transition-colors">
                    <td className="py-4 pr-4 font-medium text-sidebar">{user.name}</td>
                    <td className="py-4 pr-4 text-gray-500">{user.email}</td>
                    <td className="py-4 pr-4">
                      <span className={roleBadge(user.role)}>{user.role?.replace('_', ' ')}</span>
                    </td>
                    <td className="py-4 pr-4 text-gray-500">{user.company?.company_name || '-'}</td>
                    <td className="py-4 pr-4 text-gray-500">{user.team?.team_name || '-'}</td>
                    <td className="py-4 pr-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="ta-input !py-1 !text-xs"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="employer">Employer</option>
                        <option value="employee">Employee</option>
                      </select>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditForm(user)} className="ta-btn-secondary !px-3 !py-1.5 !text-xs">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="rounded bg-danger px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                        >
                          Delete
                        </button>
                      </div>
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
