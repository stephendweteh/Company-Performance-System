import React, { useEffect, useState } from 'react';
import axios from '../services/api';

const PendingMembershipRequests = ({ title = 'Pending Membership Requests', description = 'Review and approve new employee registrations.', onMembershipUpdated }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const authConfig = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  };

  const loadRequests = async () => {
    setLoading(true);

    try {
      const response = await axios.get('/api/pending-memberships', authConfig);
      setRequests(response.data || []);
      setSelectedIds([]);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load pending memberships.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRespond = async (userId, action) => {
    setActioningId(userId);
    setMessage('');

    try {
      const response = await axios.put(`/api/memberships/${userId}/respond`, { action }, authConfig);
      setMessage(response.data?.message || `Membership ${action}ed successfully.`);
      setRequests((prev) => prev.filter((request) => request.id !== userId));
      setSelectedIds((prev) => prev.filter((id) => id !== userId));
      await onMembershipUpdated?.();
    } catch (error) {
      setMessage(error.response?.data?.message || `Failed to ${action} membership request.`);
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleSelection = (userId) => {
    setSelectedIds((prev) => (
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    ));
  };

  const handleToggleAll = () => {
    if (selectedIds.length === requests.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(requests.map((request) => request.id));
  };

  const handleBulkRespond = async (action) => {
    if (selectedIds.length === 0) {
      setMessage('Select at least one request first.');
      return;
    }

    setActioningId('bulk');
    setMessage('');

    try {
      const response = await axios.put('/api/memberships/respond-bulk', {
        action,
        user_ids: selectedIds,
      }, authConfig);

      const updatedIds = (response.data?.users || []).map((user) => user.id);
      setRequests((prev) => prev.filter((request) => !updatedIds.includes(request.id)));
      setSelectedIds([]);
      setMessage(response.data?.message || `Memberships ${action}ed successfully.`);
      await onMembershipUpdated?.();
    } catch (error) {
      setMessage(error.response?.data?.message || `Failed to ${action} selected memberships.`);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="ta-card">
      <div className="ta-card-header flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sidebar">{title}</h3>
          <p className="mt-0.5 text-sm text-gray-400">{description}</p>
        </div>
        <button onClick={loadRequests} className="ta-btn-secondary" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="ta-card-body">
        {requests.length > 0 && !loading && (
          <div className="mb-4 flex flex-col gap-3 rounded-sm border border-stroke bg-whiten p-4 md:flex-row md:items-center md:justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={requests.length > 0 && selectedIds.length === requests.length}
                onChange={handleToggleAll}
              />
              Select all
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
              <button
                onClick={() => handleBulkRespond('accept')}
                disabled={actioningId !== null || selectedIds.length === 0}
                className="rounded bg-success px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {actioningId === 'bulk' ? 'Working...' : 'Accept Selected'}
              </button>
              <button
                onClick={() => handleBulkRespond('reject')}
                disabled={actioningId !== null || selectedIds.length === 0}
                className="rounded bg-danger px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                Reject Selected
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="mb-4 rounded border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-stroke border-t-primary" />
          </div>
        ) : requests.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No pending membership requests right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke">
                  <th className="pb-3 text-left font-semibold text-gray-500">Select</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Name</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Email</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Company</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Role</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Status</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-whiten transition-colors">
                    <td className="py-4 pr-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(request.id)}
                        onChange={() => handleToggleSelection(request.id)}
                        disabled={actioningId !== null}
                      />
                    </td>
                    <td className="py-4 pr-4 font-medium text-sidebar">{request.name}</td>
                    <td className="py-4 pr-4 text-gray-500">{request.email}</td>
                    <td className="py-4 pr-4 text-gray-500">{request.company?.company_name || '-'}</td>
                    <td className="py-4 pr-4 text-gray-500 capitalize">{request.role?.replace('_', ' ')}</td>
                    <td className="py-4 pr-4">
                      <span className="ta-badge-warning">Pending</span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespond(request.id, 'accept')}
                          disabled={actioningId !== null}
                          className="rounded bg-success px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                        >
                          {actioningId === request.id ? 'Working...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleRespond(request.id, 'reject')}
                          disabled={actioningId !== null}
                          className="rounded bg-danger px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingMembershipRequests;