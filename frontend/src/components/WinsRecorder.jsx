import React, { useEffect, useState } from 'react';
import axios from '../services/api';
import { downloadSimplePdf } from '../utils/pdfExport';

export const WinsRecorder = ({ selectedDate, userRole, focusedWinId = null, onWinRecorded }) => {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('');
  const [isAchievementsFullscreen, setIsAchievementsFullscreen] = useState(false);

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

  useEffect(() => {
    fetchWins();
  }, [userRole, focusedWinId]);

  useEffect(() => {
    if (!focusedWinId) {
      return;
    }

    setSearchTerm('');
    setFilterStatus('');
    setSortBy('date');
    setSortDir('desc');
  }, [focusedWinId]);

  useEffect(() => {
    if (!focusedWinId || !wins.some((win) => win.id === focusedWinId)) {
      return;
    }

    requestAnimationFrame(() => {
      const card = document.querySelector(`[data-win-id="${focusedWinId}"]`);
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [focusedWinId, wins]);

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

  const filterAndSortWins = () => {
    let filtered = wins.filter((win) => {
      const matchesSearch =
        win.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        win.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (win.employee?.name && win.employee.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = !filterStatus || win.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'date') {
        aVal = new Date(a.date || 0);
        bVal = new Date(b.date || 0);
      } else if (sortBy === 'status') {
        aVal = a.status || '';
        bVal = b.status || '';
      } else if (sortBy === 'score') {
        aVal = Number(a.score) || 0;
        bVal = Number(b.score) || 0;
      } else if (sortBy === 'title') {
        aVal = a.title || '';
        bVal = b.title || '';
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  };

  const exportWinsPDF = () => {
    const achievements = filterAndSortWins();
    if (achievements.length === 0) {
      alert('No achievements to export');
      return;
    }

    const blocks = achievements.flatMap((win, index) => ([
      { text: `${index + 1}. ${win.title}`, fontSize: 12, bold: true, gapAfter: 4 },
      {
        text: `Employee: ${win.employee?.name || 'N/A'} | Date: ${win.date ? new Date(win.date).toLocaleDateString() : 'N/A'} | Status: ${win.status?.replace('_', ' ') || 'N/A'} | Rating: ${typeof win.score === 'number' ? `${win.score}/5` : 'N/A'}`,
        fontSize: 10,
        gapAfter: 4,
      },
      { text: win.description || 'No description provided.', fontSize: 10, gapAfter: win.response_comment ? 4 : 10 },
      ...(win.response_comment ? [{ text: `Reviewer Comment: ${win.response_comment}`, fontSize: 10, gapAfter: 10 }] : []),
    ]));

    downloadSimplePdf({
      filename: `achievements-${new Date().toISOString().split('T')[0]}.pdf`,
      title: 'Achievements Export',
      blocks,
    });
  };

  const exportWinsCSV = () => {
    const filtered = filterAndSortWins();
    const headers = ['Title', 'Description', 'Employee', 'Date', 'Status', 'Score', 'Reviewer Comment'];
    const rows = filtered.map((win) => [
      win.title,
      win.description,
      win.employee?.name || 'N/A',
      new Date(win.date).toLocaleDateString(),
      win.status?.replace('_', ' ') || 'N/A',
      win.score ? `${win.score}/5` : 'N/A',
      win.response_comment || '',
    ]);

    const csv = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `achievements-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

      <div className={isAchievementsFullscreen ? 'fixed inset-0 z-50 flex flex-col bg-white dark:bg-boxdark overflow-auto p-6 shadow-2xl' : 'ta-card'}>
        <div className="ta-card-header flex items-center justify-between">
          <h3 className="font-semibold text-sidebar">Achievements</h3>
          <div className="flex gap-2">
            <button
              className="ta-btn-secondary"
              title={isAchievementsFullscreen ? 'Collapse' : 'Expand to full screen'}
              onClick={() => setIsAchievementsFullscreen((prev) => !prev)}
            >
              {isAchievementsFullscreen ? '⊠ Collapse' : '⛶ Expand'}
            </button>
            <button className="ta-btn-secondary" onClick={exportWinsCSV}>
              📥 Export CSV
            </button>
            <button className="ta-btn-secondary" onClick={exportWinsPDF}>
              📄 Export PDF
            </button>
            <button className="ta-btn-secondary" onClick={fetchWins}>
              {loadingWins ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
        <div className="ta-card-body space-y-4">
          {/* Search, Sort, Filter Controls */}
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="ta-label !mb-1">Search</label>
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ta-input"
              />
            </div>
            <div className="w-full md:w-40">
              <label className="ta-label !mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="ta-input"
              >
                <option value="date">Date</option>
                <option value="status">Status</option>
                <option value="score">Rating</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div className="w-full md:w-24">
              <label className="ta-label !mb-1">Order</label>
              <select
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value)}
                className="ta-input"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div className="w-full md:w-40">
              <label className="ta-label !mb-1">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="ta-input"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="needs_revision">Needs Revision</option>
              </select>
            </div>
          </div>

          {filterAndSortWins().length === 0 ? (
            <p className="text-sm text-gray-400">
              {wins.length === 0 ? 'No achievements available.' : 'No achievements match your filters.'}
            </p>
          ) : (
            filterAndSortWins().map((win) => (
              <div
                key={win.id}
                data-win-id={win.id}
                className={`rounded-sm border p-4 ${focusedWinId === win.id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-stroke'}`}
              >
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
                  <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
                    <div className="ta-input flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`text-lg leading-none ${Number(reviewByWin[win.id]?.score || 0) >= star ? 'text-warning' : 'text-gray-300'}`}
                          onClick={() => handleReviewField(win.id, 'score', star)}
                          aria-label={`Set ${star} star rating`}
                          title={`${star} star${star > 1 ? 's' : ''}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
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
