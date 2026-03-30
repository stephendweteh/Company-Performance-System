import React, { useState } from 'react';
import axios from '../services/api';

export const ReportSubmission = ({ selectedDate, onReportSubmitted }) => {
  const [formData, setFormData] = useState({
    title: '',
    work_done: '',
    challenges: '',
    wins: '',
    attachments: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error submitting report');
    }
    setLoading(false);
  };

  return (
    <div className="ta-card">
      <div className="ta-card-header">
        <h2 className="font-semibold text-sidebar">Daily Report — {selectedDate?.toDateString()}</h2>
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
        <form onSubmit={handleSubmit} className="space-y-5">
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
      </div>
    </div>
  );
};

export default ReportSubmission;
