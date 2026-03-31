import React, { useState, useEffect, useContext } from 'react';
import axios from '../services/api';
import AuthContext from '../context/AuthContext';

export const TeamsManagement = () => {
  const { user } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
  }, []);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams', {
        headers: getAuthHeader(),
      });
      setTeams(response.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to load teams');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/users', {
        headers: getAuthHeader(),
      });
      // Filter to only show employees from the same company
      const companyEmployees = response.data.filter(
        (u) => u.role === 'employee' && u.company_id === user?.company_id
      );
      setEmployees(companyEmployees);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(
        '/api/teams',
        {
          team_name: teamName,
          company_id: user?.company_id,
        },
        { headers: getAuthHeader() }
      );
      setTeamName('');
      setShowCreateForm(false);
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
    }
    setLoading(false);
  };

  const handleAddEmployeesToTeam = async (teamId) => {
    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    setLoading(true);
    setError('');

    try {
      for (const employeeId of selectedEmployees) {
        await axios.put(
          `/api/teams/${teamId}/add-employee/${employeeId}`,
          {},
          { headers: getAuthHeader() }
        );
      }
      setSelectedEmployees([]);
      setSelectedTeam(null);
      fetchTeams();
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employees to team');
    }
    setLoading(false);
  };

  const handleRemoveEmployeeFromTeam = async (teamId, employeeId) => {
    if (!confirm('Remove this employee from the team?')) return;

    try {
      await axios.put(
        `/api/teams/${teamId}/remove-employee/${employeeId}`,
        {},
        { headers: getAuthHeader() }
      );
      fetchTeams();
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove employee from team');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      await axios.delete(`/api/teams/${teamId}`, {
        headers: getAuthHeader(),
      });
      fetchTeams();
      setSelectedTeam(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete team');
    }
  };

  const getTeamEmployees = (teamId) => {
    return employees.filter((e) => e.team_id === teamId);
  };

  const getAvailableEmployees = () => {
    return employees.filter((e) => !selectedTeam || e.team_id !== selectedTeam);
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

      {/* Create Team Form */}
      <div className="ta-card">
        <div className="ta-card-header flex items-center justify-between">
          <h2 className="font-semibold text-sidebar">Teams</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={showCreateForm ? 'ta-btn-secondary' : 'ta-btn-primary'}
          >
            {showCreateForm ? 'Cancel' : '+ Create Team'}
          </button>
        </div>

        {showCreateForm && (
          <div className="ta-card-body border-b border-stroke pb-6">
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="ta-label">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Sales Team, Engineering Team"
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
                  {loading ? 'Creating…' : 'Create Team'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setTeamName('');
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

      {/* Teams List */}
      <div className="ta-card">
        <div className="ta-card-body">
          {teams.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No teams yet. Create one to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => {
                const teamEmployees = getTeamEmployees(team.id);
                const isSelected = selectedTeam === team.id;

                return (
                  <div
                    key={team.id}
                    className={`rounded-sm border ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-stroke'
                    } p-4 transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sidebar">{team.team_name}</h3>
                        <p className="text-sm text-gray-500">
                          {teamEmployees.length} employee
                          {teamEmployees.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setSelectedTeam(isSelected ? null : team.id)
                          }
                          className="ta-btn-secondary text-xs"
                        >
                          {isSelected ? 'Hide' : 'Manage'}
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="rounded-sm bg-danger/10 px-3 py-1 text-xs font-semibold text-danger hover:bg-danger/20 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Team Details - Show when selected */}
                    {isSelected && (
                      <div className="mt-4 space-y-4 border-t border-stroke pt-4">
                        {/* Add Employees Section */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-sidebar">
                            Add Employees to Team
                          </label>
                          <div className="max-h-48 space-y-2 overflow-y-auto rounded-sm bg-whiten p-3">
                            {getAvailableEmployees().length === 0 ? (
                              <p className="text-sm text-gray-400">
                                All employees are assigned to teams
                              </p>
                            ) : (
                              getAvailableEmployees().map((emp) => (
                                <label
                                  key={emp.id}
                                  className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-white/50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedEmployees.includes(emp.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedEmployees([
                                          ...selectedEmployees,
                                          emp.id,
                                        ]);
                                      } else {
                                        setSelectedEmployees(
                                          selectedEmployees.filter(
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
                          {selectedEmployees.length > 0 && (
                            <button
                              onClick={() => handleAddEmployeesToTeam(team.id)}
                              disabled={loading}
                              className="ta-btn-primary w-full text-sm disabled:opacity-60"
                            >
                              {loading
                                ? 'Adding…'
                                : `Add ${selectedEmployees.length} Employee${
                                    selectedEmployees.length !== 1 ? 's' : ''
                                  }`}
                            </button>
                          )}
                        </div>

                        {/* Team Members Section */}
                        {teamEmployees.length > 0 && (
                          <div className="space-y-3 border-t border-stroke pt-4">
                            <label className="block text-sm font-semibold text-sidebar">
                              Team Members
                            </label>
                            <div className="space-y-2">
                              {teamEmployees.map((emp) => (
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
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleRemoveEmployeeFromTeam(team.id, emp.id)
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

export default TeamsManagement;
