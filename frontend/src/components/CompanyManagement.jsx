import React, { useState, useEffect } from 'react';
import axios from '../services/api';

export const CompanyManagement = ({ canManage = true }) => {
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        '/api/companies',
        { company_name: companyName },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setCompanyName('');
      setShowForm(false);
      fetchCompanies();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating company');
    }
    setLoading(false);
  };

  const handleDeleteCompany = async (companyId) => {
    if (confirm('Are you sure?')) {
      try {
        await axios.delete(`/api/companies/${companyId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchCompanies();
      } catch (error) {
        alert('Error deleting company');
      }
    }
  };

  return (
    <div className="ta-card">
      <div className="ta-card-header flex items-center justify-between">
        <h2 className="font-semibold text-sidebar">Company and Team Directory</h2>
        {canManage && (
          <button onClick={() => setShowForm(!showForm)} className={showForm ? 'ta-btn-secondary' : 'ta-btn-primary'}>
            {showForm ? 'Cancel' : '+ New Company'}
          </button>
        )}
      </div>
      <div className="ta-card-body">
        {canManage && showForm && (
          <form onSubmit={handleCreateCompany} className="mb-6 rounded-sm border border-stroke bg-whiten p-5">
            <label className="ta-label">Company Name</label>
            <div className="flex gap-3">
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Acme Corporation" required className="ta-input flex-1" />
              <button type="submit" disabled={loading} className="ta-btn-primary disabled:opacity-60">
                {loading ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        )}
        {companies.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No companies yet. Create one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke">
                  <th className="pb-3 text-left font-semibold text-gray-500">Company</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Teams</th>
                  <th className="pb-3 text-left font-semibold text-gray-500">Employees</th>
                  {canManage && <th className="pb-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-whiten transition-colors">
                    <td className="py-4 pr-4 font-medium text-sidebar">{c.company_name}</td>
                    <td className="py-4 pr-4 text-gray-500">
                      {c.teams?.length || 0}
                      {c.teams?.length > 0 && (
                        <p className="mt-1 text-xs text-gray-400">{c.teams.map((t) => t.team_name).join(', ')}</p>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-gray-500">{c.employees?.length || 0}</td>
                    {canManage && (
                      <td className="py-4 text-right">
                        <button onClick={() => handleDeleteCompany(c.id)}
                          className="rounded px-3 py-1 text-xs font-semibold text-danger hover:bg-danger/10 transition-colors">
                          Delete
                        </button>
                      </td>
                    )}
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

export default CompanyManagement;
