import React, { useState } from 'react';
import axios from '../services/api';

export const WinsRecorder = ({ selectedDate, onWinRecorded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

      setMessage('Win recorded successfully!');
      setFormData({ title: '', description: '', task_id: '' });
      onWinRecorded && onWinRecorded();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error recording win');
    }
    setLoading(false);
  };

  return (
    <div className="ta-card">
      <div className="ta-card-header">
        <h2 className="font-semibold text-sidebar">Record Achievement — {selectedDate?.toDateString()}</h2>
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
            <label className="ta-label">Achievement Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange}
              required className="ta-input" placeholder="e.g., Completed critical module ahead of schedule" />
          </div>
          <div>
            <label className="ta-label">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange}
              required rows={4} className="ta-input resize-none"
              placeholder="Describe the achievement and its impact…" />
          </div>
          <div>
            <label className="ta-label">Related Task ID <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="number" name="task_id" value={formData.task_id} onChange={handleInputChange}
              className="ta-input" placeholder="Leave blank if not task-specific" />
          </div>
          <button type="submit" disabled={loading} className="ta-btn-primary w-full py-3 disabled:opacity-60">
            {loading ? 'Recording…' : 'Save Achievement'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WinsRecorder;
