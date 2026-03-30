import React, { useState } from 'react';
import axios from '../services/api';

export const ReportSubmission = ({ selectedDate, userRole, onReportSubmitted }) => {
  const [formData, setFormData] = useState({
    title: '',
    work_done: '',
    challenges: '',
    wins: '',
    attachments: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [responseByReport, setResponseByReport] = useState({});

  const canSubmit = ['employee', 'employer'].includes(userRole);
  const canRespond = ['manager', 'employer', 'super_admin'].includes(userRole);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const response = await axios.get('/api/reports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setReports(response.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load reports');
    }
    setLoadingReports(false);
  };

  React.useEffect(() => {
    fetchReports();
  }, [userRole]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, attachments: e.target.files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('report_date', selectedDate.toISOString().split('T')[0]);
      data.append('title', formData.title);
      data.append('work_done', formData.work_done);
      data.append('challenges', formData.challenges);
      data.append('wins', formData.wins);

      for (let file of formData.attachments) {
        data.append('attachments[]', file);
      }

      await axios.post('/api/reports', data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Report submitted successfully!');
      setFormData({ title: '', work_done: '', challenges: '', wins: '', attachments: [] });
      onReportSubmitted && onReportSubmitted();
      fetchReports();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error submitting report');
    }
    setLoading(false);
  };

  const handleRespond = async (report) => {
    const response = responseByReport[report.id] || {};
    if (!response.status) {
      setMessage('Please choose a status before responding.');
      return;
    }

    try {
      await axios.put(
        `/api/reports/${report.id}/status`,
        { status: response.status, comment: response.comment || '' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage('Report response saved.');
      fetchReports();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to respond to report');
    }
  };

  const handleResponseField = (reportId, field, value) => {
    setResponseByReport((prev) => ({
      ...prev,
      [reportId]: {
        ...(prev[reportId] || {}),
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="ta-card">
        <div className="ta-card-header">
          <h2 className="font-semibold text-sidebar">
            {canSubmit ? `Daily Report — ${selectedDate?.toDateString() || 'No date selected'}` : 'Report Inbox'}
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
        <form onSubmit={handleSubmit} className="space-y-5 mb-4">
          <div>
            <label className="ta-label">Report Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange}
              required className="ta-input" placeholder="e.g., Daily Progress - Sprint 3" />
          </div>
          <div>
            <label className="ta-label">Work Done</label>
            <textarea name="work_done" value={formData.work_done} onChange={handleInputChange}
              required rows={4} className="ta-input resize-none" placeholder="Describe what you completed today…" />
          </div>
          <div>
            <label className="ta-label">Challenges Faced</label>
            <textarea name="challenges" value={formData.challenges} onChange={handleInputChange}
              rows={3} className="ta-input resize-none" placeholder="Any blockers or difficulties?" />
          </div>
          <div>
            <label className="ta-label">Wins &amp; Achievements</label>
            <textarea name="wins" value={formData.wins} onChange={handleInputChange}
              rows={3} className="ta-input resize-none" placeholder="Highlight any wins from today" />
          </div>
          <div>
            <label className="ta-label">Attachments <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="file" multiple onChange={handleFileChange}
              className="ta-input file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary" />
          </div>
          <button type="submit" disabled={loading} className="ta-btn-primary w-full py-3 disabled:opacity-60">
            {loading ? 'Submitting…' : 'Submit Daily Report'}
          </button>
        </form>
        )}

        {canSubmit && !selectedDate && (
          <p className="text-sm text-gray-500">Select a date first to submit your report.</p>
        )}
        </div>
      </div>

      <div className="ta-card">
        <div className="ta-card-header flex items-center justify-between">
          <h3 className="font-semibold text-sidebar">Submitted Reports</h3>
          <button className="ta-btn-secondary" onClick={fetchReports}>
            {loadingReports ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <div className="ta-card-body space-y-4">
          {reports.length === 0 ? (
            <p className="text-sm text-gray-400">No reports available.</p>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="rounded-sm border border-stroke p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-sidebar">{report.title}</h4>
                  <span className="ta-badge-primary">{report.status?.replace('_', ' ')}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  By: {report.employee?.name} | Date: {new Date(report.report_date).toLocaleDateString()}
                </p>
                <p className="mt-3 text-sm text-gray-700">{report.work_done}</p>
                {report.response_comment && (
                  <div className="mt-3 rounded bg-whiten p-3 text-sm text-gray-700">
                    <span className="font-semibold">Response:</span> {report.response_comment}
                  </div>
                )}

                {canRespond && (
                  <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-4">
                    <select
                      className="ta-input md:col-span-1"
                      value={responseByReport[report.id]?.status || ''}
                      onChange={(e) => handleResponseField(report.id, 'status', e.target.value)}
                    >
                      <option value="">Select status</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="approved">Approved</option>
                      <option value="needs_revision">Needs revision</option>
                    </select>
                    <input
                      className="ta-input md:col-span-2"
                      placeholder="Write response..."
                      value={responseByReport[report.id]?.comment || ''}
                      onChange={(e) => handleResponseField(report.id, 'comment', e.target.value)}
                    />
                    <button className="ta-btn-primary" onClick={() => handleRespond(report)}>
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

export default ReportSubmission;
