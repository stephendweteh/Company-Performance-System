import React, { useEffect, useMemo, useState } from 'react';
import axios from '../services/api';
import PendingMembershipRequests from './PendingMembershipRequests';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'employee',
  phone: '',
  bio: '',
  company_id: '',
  team_id: '',
  membership_status: 'accepted',
};

const emptyChannelSettings = {
  smtp_host: '',
  smtp_port: '',
  smtp_encryption: '',
  smtp_username: '',
  smtp_password: '',
  smtp_from_email: '',
  smtp_from_name: '',
  has_smtp_password: false,
  arkesel_api_key: '',
  arkesel_sender_id: '',
  arkesel_api_url: 'https://sms.arkesel.com/sms/api',
  has_arkesel_api_key: false,
};

export const SuperAdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [deliveryChannelFilter, setDeliveryChannelFilter] = useState('all');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all');
  const [deliveryPagination, setDeliveryPagination] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [channelSettings, setChannelSettings] = useState(emptyChannelSettings);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smsTesting, setSmsTesting] = useState(false);
  const [smtpTestEmail, setSmtpTestEmail] = useState('');
  const [smsTestPhone, setSmsTestPhone] = useState('');
  const [smsTestMessage, setSmsTestMessage] = useState('PerformTrack SMS test message from Admin settings.');
  const [clearSmtpPassword, setClearSmtpPassword] = useState(false);
  const [clearArkeselApiKey, setClearArkeselApiKey] = useState(false);

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

  const fetchNotificationChannels = async () => {
    const response = await axios.get('/api/admin/notification-channels', authConfig);
    const data = response.data || {};

    setChannelSettings((prev) => ({
      ...prev,
      smtp_host: data.smtp_host || '',
      smtp_port: data.smtp_port ? String(data.smtp_port) : '',
      smtp_encryption: data.smtp_encryption || '',
      smtp_username: data.smtp_username || '',
      smtp_from_email: data.smtp_from_email || '',
      smtp_from_name: data.smtp_from_name || '',
      has_smtp_password: !!data.has_smtp_password,
      arkesel_sender_id: data.arkesel_sender_id || '',
      arkesel_api_url: data.arkesel_api_url || 'https://sms.arkesel.com/sms/api',
      has_arkesel_api_key: !!data.has_arkesel_api_key,
      smtp_password: '',
      arkesel_api_key: '',
    }));
  };

  const fetchUsers = async () => {
    const params = {};

    if (roleFilter !== 'all') {
      params.role = roleFilter;
    }

    if (membershipFilter !== 'all') {
      params.membership_status = membershipFilter;
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

  const fetchNotificationDeliveries = async (page = deliveryPagination.current_page || 1) => {
    const params = {
      page,
      per_page: deliveryPagination.per_page,
    };

    if (deliveryChannelFilter !== 'all') {
      params.channel = deliveryChannelFilter;
    }

    if (deliveryStatusFilter !== 'all') {
      params.status = deliveryStatusFilter;
    }

    const response = await axios.get('/api/admin/notification-deliveries', {
      ...authConfig,
      params,
    });
    setDeliveryLogs(response.data?.data || []);
    setDeliveryPagination({
      current_page: response.data?.current_page || 1,
      last_page: response.data?.last_page || 1,
      per_page: response.data?.per_page || 10,
      total: response.data?.total || 0,
    });
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOverview(),
        fetchUsers(),
        fetchNotificationDeliveries(),
        fetchCompaniesAndTeams(),
        fetchNotificationChannels(),
      ]);
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
  }, [roleFilter, membershipFilter]);

  useEffect(() => {
    fetchNotificationDeliveries(1).catch((error) => {
      setMessage(error.response?.data?.message || 'Failed to load notification deliveries.');
    });
  }, [deliveryChannelFilter, deliveryStatusFilter]);

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
      phone: user.phone || '',
      bio: user.bio || '',
      company_id: user.company_id ? String(user.company_id) : '',
      team_id: user.team_id ? String(user.team_id) : '',
      membership_status: user.membership_status || 'accepted',
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
        phone: formData.phone || null,
        bio: formData.bio || null,
        company_id: formData.company_id || null,
        team_id: formData.team_id || null,
        membership_status: formData.membership_status || 'accepted',
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

  const handleChannelChange = (event) => {
    const { name, value } = event.target;
    setChannelSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChannels = async (event) => {
    event.preventDefault();
    setSettingsSaving(true);

    try {
      await axios.put('/api/admin/notification-channels', {
        smtp_host: channelSettings.smtp_host || null,
        smtp_port: channelSettings.smtp_port ? Number(channelSettings.smtp_port) : null,
        smtp_encryption: channelSettings.smtp_encryption || null,
        smtp_username: channelSettings.smtp_username || null,
        smtp_password: channelSettings.smtp_password || null,
        smtp_from_email: channelSettings.smtp_from_email || null,
        smtp_from_name: channelSettings.smtp_from_name || null,
        clear_smtp_password: clearSmtpPassword,
        arkesel_api_key: channelSettings.arkesel_api_key || null,
        arkesel_sender_id: channelSettings.arkesel_sender_id || null,
        arkesel_api_url: channelSettings.arkesel_api_url || null,
        clear_arkesel_api_key: clearArkeselApiKey,
      }, authConfig);

      setMessage('Notification channel settings saved successfully.');
      setClearSmtpPassword(false);
      setClearArkeselApiKey(false);
      await fetchNotificationChannels();
    } catch (error) {
      const validationMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : null;
      setMessage(validationMessage || error.response?.data?.message || 'Failed to save notification settings.');
    }

    setSettingsSaving(false);
  };

  const handleTestSmtp = async () => {
    setSmtpTesting(true);

    try {
      const response = await axios.post('/api/admin/notification-channels/test-smtp', {
        test_email: smtpTestEmail,
      }, authConfig);
      setMessage(response.data?.message || 'SMTP test succeeded.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'SMTP test failed.');
    }

    setSmtpTesting(false);
  };

  const handleTestSms = async () => {
    setSmsTesting(true);

    try {
      const response = await axios.post('/api/admin/notification-channels/test-arkesel', {
        test_phone: smsTestPhone,
        test_message: smsTestMessage,
      }, authConfig);
      setMessage(response.data?.message || 'Arkesel SMS test succeeded.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Arkesel SMS test failed.');
    }

    setSmsTesting(false);
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
    { label: 'Managers', value: overview?.managers ?? '-', color: 'text-warning' },
    { label: 'Employees', value: overview?.employees ?? '-', color: 'text-success' },
    { label: 'Pending Memberships', value: overview?.memberships_pending ?? '-', color: 'text-warning' },
    { label: 'Accepted Memberships', value: overview?.memberships_accepted ?? '-', color: 'text-success' },
    { label: 'Rejected Memberships', value: overview?.memberships_rejected ?? '-', color: 'text-danger' },
    { label: 'Companies', value: overview?.companies ?? '-', color: 'text-primary' },
    { label: 'Teams', value: overview?.teams ?? '-', color: 'text-primary' },
    { label: 'Tasks', value: overview?.tasks ?? '-', color: 'text-warning' },
    { label: 'Reports', value: overview?.reports ?? '-', color: 'text-success' },
  ];

  const roleBadge = (role) =>
    ({
      super_admin: 'ta-badge-danger',
      employer: 'ta-badge-warning',
      manager: 'ta-badge-warning',
      employee: 'ta-badge-primary',
    }[role] || 'ta-badge-primary');

  const membershipBadge = (status) => {
    if (status === 'rejected') return 'ta-badge-danger';
    if (status === 'pending') return 'ta-badge-warning';

    return 'ta-badge-success';
  };

  const deliveryStatusBadge = (status) => {
    if (status === 'failed') return 'ta-badge-danger';
    if (status === 'skipped') return 'ta-badge-warning';

    return 'ta-badge-success';
  };

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

      <PendingMembershipRequests
        title="Pending Membership Approvals"
        description="Accept or reject new employee registrations across all companies."
        onMembershipUpdated={loadDashboard}
      />

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
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div>
                <label className="ta-label">Phone</label>
                <input name="phone" value={formData.phone} onChange={handleFormChange} className="ta-input" />
              </div>
              <div>
                <label className="ta-label">Membership Status</label>
                <select name="membership_status" value={formData.membership_status} onChange={handleFormChange} className="ta-input">
                  <option value="accepted">Accepted</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
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
                <label className="ta-label">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleFormChange} className="ta-input resize-none" rows={3} />
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
          <h3 className="font-semibold text-sidebar">Email and SMS Gateway Connections</h3>
        </div>
        <div className="ta-card-body">
          <form onSubmit={handleSaveChannels} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-sm border border-stroke p-4">
                <h4 className="text-sm font-semibold text-sidebar">SMTP Configuration</h4>
                <p className="mb-4 mt-1 text-xs text-gray-400">Configure outgoing email delivery.</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="ta-label">Host</label>
                    <input name="smtp_host" value={channelSettings.smtp_host} onChange={handleChannelChange} className="ta-input" />
                  </div>
                  <div>
                    <label className="ta-label">Port</label>
                    <input type="number" name="smtp_port" value={channelSettings.smtp_port} onChange={handleChannelChange} className="ta-input" />
                  </div>
                  <div>
                    <label className="ta-label">Encryption</label>
                    <select name="smtp_encryption" value={channelSettings.smtp_encryption} onChange={handleChannelChange} className="ta-input">
                      <option value="">None</option>
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                    </select>
                  </div>
                  <div>
                    <label className="ta-label">Username</label>
                    <input name="smtp_username" value={channelSettings.smtp_username} onChange={handleChannelChange} className="ta-input" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="ta-label">Password</label>
                    <input type="password" name="smtp_password" value={channelSettings.smtp_password} onChange={handleChannelChange} className="ta-input" placeholder={channelSettings.has_smtp_password ? 'Saved password exists. Enter to replace.' : ''} />
                    <label className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <input type="checkbox" checked={clearSmtpPassword} onChange={(e) => setClearSmtpPassword(e.target.checked)} />
                      Clear saved SMTP password
                    </label>
                  </div>
                  <div>
                    <label className="ta-label">From Email</label>
                    <input type="email" name="smtp_from_email" value={channelSettings.smtp_from_email} onChange={handleChannelChange} className="ta-input" />
                  </div>
                  <div>
                    <label className="ta-label">From Name</label>
                    <input name="smtp_from_name" value={channelSettings.smtp_from_name} onChange={handleChannelChange} className="ta-input" />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 md:flex-row">
                  <input type="email" value={smtpTestEmail} onChange={(e) => setSmtpTestEmail(e.target.value)} placeholder="test@example.com" className="ta-input flex-1" required />
                  <button type="button" onClick={handleTestSmtp} disabled={smtpTesting || !smtpTestEmail} className="ta-btn-secondary whitespace-nowrap disabled:opacity-60">
                    {smtpTesting ? 'Testing...' : 'Send SMTP Test'}
                  </button>
                </div>
              </div>

              <div className="rounded-sm border border-stroke p-4">
                <h4 className="text-sm font-semibold text-sidebar">Arkesel SMS Configuration</h4>
                <p className="mb-4 mt-1 text-xs text-gray-400">Configure SMS delivery through Arkesel API.</p>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="ta-label">API URL</label>
                    <input name="arkesel_api_url" value={channelSettings.arkesel_api_url} onChange={handleChannelChange} className="ta-input" />
                  </div>
                  <div>
                    <label className="ta-label">Sender ID</label>
                    <input name="arkesel_sender_id" value={channelSettings.arkesel_sender_id} onChange={handleChannelChange} className="ta-input" />
                  </div>
                  <div>
                    <label className="ta-label">API Key</label>
                    <input type="password" name="arkesel_api_key" value={channelSettings.arkesel_api_key} onChange={handleChannelChange} className="ta-input" placeholder={channelSettings.has_arkesel_api_key ? 'Saved key exists. Enter to replace.' : ''} />
                    <label className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <input type="checkbox" checked={clearArkeselApiKey} onChange={(e) => setClearArkeselApiKey(e.target.checked)} />
                      Clear saved Arkesel API key
                    </label>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <input value={smsTestPhone} onChange={(e) => setSmsTestPhone(e.target.value)} placeholder="Recipient phone number" className="ta-input" required />
                  <textarea value={smsTestMessage} onChange={(e) => setSmsTestMessage(e.target.value)} className="ta-input resize-none" rows={2} />
                  <button type="button" onClick={handleTestSms} disabled={smsTesting || !smsTestPhone} className="ta-btn-secondary disabled:opacity-60">
                    {smsTesting ? 'Testing...' : 'Send SMS Test'}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={settingsSaving} className="ta-btn-primary disabled:opacity-60">
              {settingsSaving ? 'Saving...' : 'Save Gateway Settings'}
            </button>
          </form>
        </div>
      </div>

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
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div>
              <label className="ta-label">Membership</label>
              <select value={membershipFilter} onChange={(e) => setMembershipFilter(e.target.value)} className="ta-input">
                <option value="all">All statuses</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
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
                  <th className="pb-3 text-left font-semibold text-gray-500">Membership</th>
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
                    <td className="py-4 pr-4">
                      <span className={membershipBadge(user.membership_status)}>
                        {(user.membership_status || 'accepted').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-gray-500">{user.company?.company_name || '-'}</td>
                    <td className="py-4 pr-4 text-gray-500">{user.team?.team_name || '-'}</td>
                    <td className="py-4 pr-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="ta-input !py-1 !text-xs"
                        disabled={(user.membership_status || 'accepted') !== 'accepted'}
                        title={(user.membership_status || 'accepted') !== 'accepted' ? 'Quick role change is only available for accepted users.' : ''}
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="employer">Employer</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                      </select>
                      {(user.membership_status || 'accepted') !== 'accepted' && (
                        <p className="mt-1 text-xs text-gray-400">Use Edit to change pending or rejected users.</p>
                      )}
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

      <div className="ta-card">
        <div className="ta-card-header flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sidebar">Membership Notification History</h3>
            <p className="mt-0.5 text-sm text-gray-400">Recent email and SMS delivery status for membership decisions.</p>
          </div>
          <button onClick={() => fetchNotificationDeliveries()} className="ta-btn-secondary">Refresh</button>
        </div>
        <div className="ta-card-body">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div>
              <label className="ta-label">Channel</label>
              <select value={deliveryChannelFilter} onChange={(e) => setDeliveryChannelFilter(e.target.value)} className="ta-input">
                <option value="all">All channels</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div>
              <label className="ta-label">Delivery Status</label>
              <select value={deliveryStatusFilter} onChange={(e) => setDeliveryStatusFilter(e.target.value)} className="ta-input">
                <option value="all">All statuses</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>
          </div>

          {deliveryLogs.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No membership notification delivery history yet.</p>
          ) : (
            <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke">
                    <th className="pb-3 text-left font-semibold text-gray-500">User</th>
                    <th className="pb-3 text-left font-semibold text-gray-500">Company</th>
                    <th className="pb-3 text-left font-semibold text-gray-500">Channel</th>
                    <th className="pb-3 text-left font-semibold text-gray-500">Recipient</th>
                    <th className="pb-3 text-left font-semibold text-gray-500">Status</th>
                    <th className="pb-3 text-left font-semibold text-gray-500">Provider</th>
                    <th className="pb-3 text-left font-semibold text-gray-500">Actor</th>
                    <th className="pb-3 text-left font-semibold text-gray-500">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke">
                  {deliveryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-whiten transition-colors align-top">
                      <td className="py-4 pr-4">
                        <div className="font-medium text-sidebar">{log.user?.name || '-'}</div>
                        <div className="text-xs text-gray-400">{log.user?.email || '-'}</div>
                        {log.error_message && <div className="mt-1 text-xs text-danger">{log.error_message}</div>}
                      </td>
                      <td className="py-4 pr-4 text-gray-500">{log.user?.company?.company_name || log.meta?.company_name || '-'}</td>
                      <td className="py-4 pr-4 text-gray-500 uppercase">{log.channel}</td>
                      <td className="py-4 pr-4 text-gray-500">{log.recipient || '-'}</td>
                      <td className="py-4 pr-4">
                        <span className={deliveryStatusBadge(log.status)}>{log.status}</span>
                      </td>
                      <td className="py-4 pr-4 text-gray-500">{log.provider || '-'}</td>
                      <td className="py-4 pr-4 text-gray-500">{log.actor?.name || '-'}</td>
                      <td className="py-4 pr-4 text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-stroke pt-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
              <p>
                Showing page {deliveryPagination.current_page} of {deliveryPagination.last_page} · {deliveryPagination.total} log(s)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchNotificationDeliveries(deliveryPagination.current_page - 1)}
                  disabled={loading || deliveryPagination.current_page <= 1}
                  className="ta-btn-secondary disabled:opacity-60"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchNotificationDeliveries(deliveryPagination.current_page + 1)}
                  disabled={loading || deliveryPagination.current_page >= deliveryPagination.last_page}
                  className="ta-btn-secondary disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
