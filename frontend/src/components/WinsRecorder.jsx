import React, { useState } from 'react';
import axios from '../services/api';

export const WinsRecorder = ({ selectedDate, userRole, onWinRecorded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [wins, setWins] = useState([]);
  const [loadingWins, setLoadingWins] = useState(false);
  const [reviewByWin, setReviewByWin] = useState({});

  const canSubmit = ['employee', 'employer'].includes(userRole);
  const renderStars = (score) => {
    const safeScore = Math.max(0, Math.min(5, Number(score) || 0));
    return '★'.repeat(safeScore) + '☆'.repeat(5 - safeScore);
  };
  const canRespondToWin = (win) => {
    if (userRole === 'super_admin') return true;
    if (userRole === 'manager') return win.employee?.role === 'employer';
    if (userRole === 'employer') return win.employee?.role === 'employee';
    return false;
  };

  const fetchWins = async () => {
    setLoadingWins(true);
    try {
      const response = await axios.get('/api/wins', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setWins(response.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load achievements');
    }
    setLoadingWins(false);
  };

  React.useEffect(() => {
    fetchWins();
  }, [userRole]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        '/api/wins',
        {
          ...formData,
          date: selectedDate.toISOString().split('T')[0],
          task_id: formData.task_id || null,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setMessage(userRole === 'employer' ? 'Achievement submitted to manager successfully!' : 'Achievement submitted successfully!');
      setFormData({ title: '', description: '', task_id: '' });
      onWinRecorded && onWinRecorded();
      fetchWins();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error recording win');
    }
    setLoading(false);
  };

  const handleReviewField = (winId, field, value) => {
    setReviewByWin((prev) => ({
      ...prev,
      [winId]: {
        ...(prev[winId] || {}),
        [field]: value,
      },
    }));
  };

  const handleRespond = async (win) => {
    const payload = reviewByWin[win.id] || {};
    if (!payload.status && !payload.score && !payload.response_comment) {
      setMessage('Provide status, score, or comment before responding.');
      return;
    }

    try {
      await axios.put(`/api/wins/${win.id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Achievement response saved.');
      fetchWins();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to respond to achievement');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="ta-card">
        <div className="ta-card-header">
          <h2 className="font-semibold text-sidebar">
            {canSubmit ? `Record Achievement` : 'Achievements Inbox'}
          </h2>
        </div>
        <div className="ta-card-body">
          {message && (
            <div className={`mb-5 rounded border px-4 py-3 text-sm ${
              message.toLowerCase().includes('success')
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-danger/30 bg-danger/10 text-danger'
            }`}>
              {message}
            </div>
          )}

          {canSubmit && selectedDate && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {userRole === 'employer' && (
                <div className="rounded border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                  This achievement will be submitted to the manager for review and a 5-star score.
                </div>
              )}
              <div>
                <label className="ta-label">Achievement Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="ta-input"
                  placeholder="e.g., Completed critical module ahead of schedule"
                />
              </div>
              <div>
                <label className="ta-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="ta-input resize-none"
                  placeholder="Describe the achievement and its impact..."
                />
              </div>
              <div>
                <label className="ta-label">Related Task ID <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="number"
                  name="task_id"
                  value={formData.task_id}
                  onChange={handleInputChange}
                  className="ta-input"
                  placeholder="Leave blank if not task-specific"
                />
              </div>
              <button type="submit" disabled={loading} className="ta-btn-primary w-full py-3 disabled:opacity-60">
                {loading ? 'Recording...' : 'Save Achievement'}
              </button>
            </form>
          )}

          {canSubmit && !selectedDate && (
            <p className="text-sm text-gray-500">Select a date first to log an achievement.</p>
          )}
        </div>
      </div>

      <div className="ta-card">
        <div className="ta-card-header flex items-center justify-between">
          <h3 className="font-semibold text-sidebar">Achievements</h3>
          <button className="ta-btn-secondary" onClick={fetchWins}>
            {loadingWins ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <div className="ta-card-body space-y-4">
          {wins.length === 0 ? (
            <p className="text-sm text-gray-400">No achievements available.</p>
          ) : (
            wins.map((win) => (
              <div key={win.id} className="rounded-sm border border-stroke p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-sidebar">{win.title}</h4>
                  <span className="ta-badge-primary">{win.status?.replace('_', ' ') || 'submitted'}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  By: {win.employee?.name} | Date: {new Date(win.date).toLocaleDateString()}
                </p>
                {win.reviewer?.name && (
                  <p className="mt-1 text-xs text-gray-500">
                    Reviewer: {win.reviewer.name}
                  </p>
                )}
                {typeof win.score === 'number' && (
                  <p className="mt-1 text-sm font-medium text-warning" title={`${win.score}/5 stars`}>
                    Rating: {renderStars(win.score)}
                  </p>
                )}
                <p className="mt-3 text-sm text-gray-700">{win.description}</p>
                {win.response_comment && (
                  <div className="mt-3 rounded bg-whiten p-3 text-sm text-gray-700">
                    <span className="font-semibold">Response:</span> {win.response_comment}
                  </div>
                )}

                {canRespondToWin(win) && (
                  <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-4">
                    <select
                      className="ta-input"
                      value={reviewByWin[win.id]?.status || ''}
                      onChange={(e) => handleReviewField(win.id, 'status', e.target.value)}
                    >
                      <option value="">Set status</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="approved">Approved</option>
                      <option value="needs_revision">Needs revision</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      className="ta-input"
                      placeholder="Stars 1-5"
                      value={reviewByWin[win.id]?.score ?? ''}
                      onChange={(e) => handleReviewField(win.id, 'score', e.target.value ? Number(e.target.value) : null)}
                    />
                    <input
                      className="ta-input"
                      placeholder="Response"
                      value={reviewByWin[win.id]?.response_comment || ''}
                      onChange={(e) => handleReviewField(win.id, 'response_comment', e.target.value)}
                    />
                    <button className="ta-btn-primary" onClick={() => handleRespond(win)}>
                      Respond
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WinsRecorder;
