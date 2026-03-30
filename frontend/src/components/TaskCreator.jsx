import React, { useState, useEffect } from 'react';
import axios from '../services/api';

export const TaskCreator = ({ onTaskCreated }) => {
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    team_id: '',
    start_date: '',
    due_date: '',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchTeams();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/users?role=employee', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEmployees(response.data);
    } catch {
      // Silently ignore if the endpoint isn't ready
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTeams(response.data);
    } catch {
      // Silently ignore
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/tasks', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Task assigned successfully!');
      setFormData({
        title: '', description: '', assigned_to: '', team_id: '',
        start_date: '', due_date: '', priority: 'medium',
      });
      setShowForm(false);
      onTaskCreated && onTaskCreated();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const err = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : error.response?.data?.message || 'Error creating task';
      setMessage(err);
    }
    setLoading(false);
  };

  return (
    <div className="ta-card mb-6">
      <div className="ta-card-header flex items-center justify-between">
        <h3 className="font-semibold text-sidebar">Assign Task</h3>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'ta-btn-secondary' : 'ta-btn-primary'}>
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>
      <div className="ta-card-body">
        {message && (
          <div className={`mb-4 rounded border px-4 py-3 text-sm ${
            message.toLowerCase().includes('successfully')
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-danger/30 bg-danger/10 text-danger'
          }`}>
            {message}
          </div>
        )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="ta-label">Task Title *</label>
              <input
                type="text" name="title" value={formData.title} onChange={handleChange} required
                className="ta-input"
                placeholder="e.g., Complete Q1 Report"
              />
            </div>

            <div className="col-span-2">
              <label className="ta-label">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                required rows={3} className="ta-input resize-none"
                placeholder="Describe the task requirements…" />
            </div>

            <div>
              <label className="ta-label">Assign To *</label>
              {employees.length > 0 ? (
                <select name="assigned_to" value={formData.assigned_to} onChange={handleChange}
                  required className="ta-input">
                  <option value="">— Select Employee —</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                  ))}
                </select>
              ) : (
                <input type="number" name="assigned_to" value={formData.assigned_to}
                  onChange={handleChange} required className="ta-input" placeholder="Employee ID" />
              )}
            </div>

            <div>
              <label className="ta-label">Team <span className="font-normal text-gray-400">(optional)</span></label>
              {teams.length > 0 ? (
                <select name="team_id" value={formData.team_id} onChange={handleChange} className="ta-input">
                  <option value="">— No Team —</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.team_name}</option>
                  ))}
                </select>
              ) : (
                <input type="number" name="team_id" value={formData.team_id}
                  onChange={handleChange} className="ta-input" placeholder="Team ID (optional)" />
              )}
            </div>

            <div>
              <label className="ta-label">Start Date *</label>
              <input type="date" name="start_date" value={formData.start_date}
                onChange={handleChange} required className="ta-input" />
            </div>

            <div>
              <label className="ta-label">Due Date *</label>
              <input type="date" name="due_date" value={formData.due_date}
                onChange={handleChange} required className="ta-input" />
            </div>

            <div>
              <label className="ta-label">Priority *</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="ta-input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="ta-btn-primary w-full py-3 disabled:opacity-60">
            {loading ? 'Assigning…' : 'Assign Task'}
          </button>
        </form>
      )}
      </div>
    </div>
  );
};

export default TaskCreator;
