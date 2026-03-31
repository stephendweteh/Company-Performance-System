import React, { useState, useEffect, useContext } from 'react';
import axios from '../services/api';
import AuthContext from '../context/AuthContext';

export const EmployerGroupsManagement = () => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedEmployers, setSelectedEmployers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroups();
    fetchEmployers();
  }, []);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/employer-groups', {
        headers: getAuthHeader(),
      });
      setGroups(response.data);
    } catch (err) {
      console.error('Error fetching employer groups:', err);
      setError('Failed to load employer groups');
    }
  };

  const fetchEmployers = async () => {
    try {
      // Fetch only employers for manager selection
      const response = await axios.get('/api/users?role=employer', {
        headers: getAuthHeader(),
      });
      setEmployers(response.data);
    } catch (err) {
      console.error('Error fetching employers:', err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(
        '/api/employer-groups',
        {
          group_name: groupName,
        },
        { headers: getAuthHeader() }
      );
      setGroupName('');
      setShowCreateForm(false);
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employer group');
    }
    setLoading(false);
  };

  const handleAddEmployersToGroup = async (groupId) => {
    if (selectedEmployers.length === 0) {
      setError('Please select at least one employer');
      return;
    }

    setLoading(true);
    setError('');

    try {
      for (const employerId of selectedEmployers) {
        await axios.put(
          `/api/employer-groups/${groupId}/add-employer/${employerId}`,
          {},
          { headers: getAuthHeader() }
        );
      }
      setSelectedEmployers([]);
      setSelectedGroup(null);
      fetchGroups();
      fetchEmployers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employers to group');
    }
    setLoading(false);
  };

  const handleRemoveEmployerFromGroup = async (groupId, employerId) => {
    if (!confirm('Remove this employer from the group?')) return;

    try {
      await axios.put(
        `/api/employer-groups/${groupId}/remove-employer/${employerId}`,
        {},
        { headers: getAuthHeader() }
      );
      fetchGroups();
      fetchEmployers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove employer from group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Are you sure you want to delete this employer group?')) return;

    try {
      await axios.delete(`/api/employer-groups/${groupId}`, {
        headers: getAuthHeader(),
      });
      fetchGroups();
      setSelectedGroup(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employer group');
    }
  };

  const getGroupEmployers = (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    return group?.employers || [];
  };

  const getAvailableEmployers = () => {
    const groupEmployerIds = selectedGroup
      ? getGroupEmployers(selectedGroup).map((e) => e.id)
      : [];
    return employers.filter((e) => !groupEmployerIds.includes(e.id));
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-sm border border-danger bg-danger/10 p-4 text-sm text-danger">
          {error}
          <button
            onClick={() => setError('')}
            className="float-right font-bold hover:text-danger/80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Create Group Form */}
      <div className="ta-card">
        <div className="ta-card-header flex items-center justify-between">
          <h2 className="font-semibold text-sidebar">Employer Groups</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={showCreateForm ? 'ta-btn-secondary' : 'ta-btn-primary'}
          >
            {showCreateForm ? 'Cancel' : '+ Create Employer Group'}
          </button>
        </div>

        {showCreateForm && (
          <div className="ta-card-body border-b border-stroke pb-6">
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="ta-label">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Sales Managers, Regional Leads"
                  required
                  className="ta-input"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="ta-btn-primary disabled:opacity-60"
                >
                  {loading ? 'Creating…' : 'Create Employer Group'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setGroupName('');
                  }}
                  className="ta-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Employer Groups List */}
      <div className="ta-card">
        <div className="ta-card-body">
          {groups.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No employer groups yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => {
                const groupEmployers = getGroupEmployers(group.id);
                const isSelected = selectedGroup === group.id;

                return (
                  <div
                    key={group.id}
                    className={`rounded-sm border ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-stroke'
                    } p-4 transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sidebar">{group.group_name}</h3>
                        <p className="text-sm text-gray-500">
                          {groupEmployers.length} employer
                          {groupEmployers.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setSelectedGroup(isSelected ? null : group.id)
                          }
                          className="ta-btn-secondary text-xs"
                        >
                          {isSelected ? 'Hide' : 'Manage'}
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="rounded-sm bg-danger/10 px-3 py-1 text-xs font-semibold text-danger hover:bg-danger/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Group Details - Show when selected */}
                    {isSelected && (
                      <div className="mt-4 space-y-4 border-t border-stroke pt-4">
                        {/* Add Employers Section */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-sidebar">
                            Add Employers to Group
                          </label>
                          <div className="max-h-48 space-y-2 overflow-y-auto rounded-sm bg-whiten p-3">
                            {getAvailableEmployers().length === 0 ? (
                              <p className="text-sm text-gray-400">
                                All employers are in this group or no employers available
                              </p>
                            ) : (
                              getAvailableEmployers().map((emp) => (
                                <label
                                  key={emp.id}
                                  className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-white/50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedEmployers.includes(emp.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedEmployers([
                                          ...selectedEmployers,
                                          emp.id,
                                        ]);
                                      } else {
                                        setSelectedEmployers(
                                          selectedEmployers.filter(
                                            (id) => id !== emp.id
                                          )
                                        );
                                      }
                                    }}
                                    className="h-4 w-4 cursor-pointer"
                                  />
                                  <span className="text-sm font-medium text-sidebar">
                                    {emp.name}
                                  </span>
                                  <span className="ml-auto text-xs text-gray-400">
                                    {emp.email}
                                  </span>
                                </label>
                              ))
                            )}
                          </div>
                          {selectedEmployers.length > 0 && (
                            <button
                              onClick={() => handleAddEmployersToGroup(group.id)}
                              disabled={loading}
                              className="ta-btn-primary w-full text-sm disabled:opacity-60"
                            >
                              {loading
                                ? 'Adding…'
                                : `Add ${selectedEmployers.length} Employer${
                                    selectedEmployers.length !== 1 ? 's' : ''
                                  }`}
                            </button>
                          )}
                        </div>

                        {/* Group Members Section */}
                        {groupEmployers.length > 0 && (
                          <div className="space-y-3 border-t border-stroke pt-4">
                            <label className="block text-sm font-semibold text-sidebar">
                              Group Members
                            </label>
                            <div className="space-y-2">
                              {groupEmployers.map((emp) => (
                                <div
                                  key={emp.id}
                                  className="flex items-center justify-between rounded-sm bg-whiten p-3"
                                >
                                  <div>
                                    <p className="font-medium text-sidebar">
                                      {emp.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {emp.email}
                                    </p>
                                    {emp.company && (
                                      <p className="text-xs text-gray-400">
                                        {emp.company.company_name}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleRemoveEmployerFromGroup(group.id, emp.id)
                                    }
                                    className="rounded-sm bg-danger/10 px-3 py-1 text-xs font-semibold text-danger hover:bg-danger/20 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerGroupsManagement;
