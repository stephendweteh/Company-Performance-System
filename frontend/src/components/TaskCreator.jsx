import React, { useState, useEffect } from 'react';
import axios from '../services/api';

export const TaskCreator = ({ userRole, selectedDate, openFormToken = 0, onTaskCreated, onHideRequested }) => {
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
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const assigneeRole = userRole === 'manager' ? 'employer' : 'employee';

  useEffect(() => {
    fetchEmployees();
    fetchTeams();
  }, [userRole]);

  useEffect(() => {
    if (!selectedDate || !['manager', 'employer'].includes(userRole)) {
      return;
    }

    const dateValue = selectedDate.toISOString().split('T')[0];
    setShowForm(true);
    setFormData((prev) => ({
      ...prev,
      start_date: dateValue,
      due_date: dateValue,
    }));
  }, [selectedDate, userRole]);

  useEffect(() => {
    if (!openFormToken) {
      return;
    }

    setShowForm(true);
  }, [openFormToken]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`/api/users?role=${assigneeRole}`, {
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((file) => ({
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
    }));
    setAttachments((prev) => [...prev, ...newAttachments].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Add file attachments
      attachments.forEach((attachment) => {
        data.append('attachments[]', attachment.file);
      });

      await axios.post('/api/tasks', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMessage('Task assigned successfully!');
      setFormData({
        title: '', description: '', assigned_to: '', team_id: '',
        start_date: '', due_date: '', priority: 'medium',
      });
      setAttachments([]);
      setShowForm(false);
      onHideRequested && onHideRequested();
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
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              onHideRequested && onHideRequested();
              return;
            }

            setShowForm(true);
          }}
          className={showForm ? 'ta-btn-secondary' : 'ta-btn-primary'}
        >
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
              <label className="ta-label">Assign To ({assigneeRole === 'employer' ? 'Employer' : 'Employee'}) *</label>
              {employees.length > 0 ? (
                <select name="assigned_to" value={formData.assigned_to} onChange={handleChange}
                  required className="ta-input">
                  <option value="">— Select {assigneeRole === 'employer' ? 'Employer' : 'Employee'} —</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email}){emp.company?.company_name ? ` - ${emp.company.company_name}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input type="number" name="assigned_to" value={formData.assigned_to}
                  onChange={handleChange} required className="ta-input" placeholder={`${assigneeRole === 'employer' ? 'Employer' : 'Employee'} ID`} />
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

            <div className="col-span-2">
              <label className="ta-label">Attach Files <span className="font-normal text-gray-400">(optional, max 5 files, 10MB each)</span></label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="ta-input"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.zip"
              />
              
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-600">Selected files ({attachments.length}):</p>
                  {attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded bg-gray-50 p-2">
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 16.5a1 1 0 01-1-1V4a1 1 0 011-1h6a1 1 0 011 1v11.5a1 1 0 01-1 1H8zm6-11H9v10h5V5.5z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium text-gray-900 truncate">{att.name}</p>
                          <p className="text-xs text-gray-400">{att.size}MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
