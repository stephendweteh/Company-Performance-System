import React, { useState, useContext } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CalendarDashboard from './components/CalendarDashboard';
import TaskList from './components/TaskList';
import TaskCreator from './components/TaskCreator';
import ReportSubmission from './components/ReportSubmission';
import WinsRecorder from './components/WinsRecorder';
import Notifications from './components/Notifications';
import CompanyManagement from './components/CompanyManagement';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import AuthContext from './context/AuthContext';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const canManageOrganizations = user?.role === 'employer' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  if (!user) return <LoginPage />;

  /* ── date-required prompt ── */
  const DatePrompt = ({ label }) => (
    <div className="ta-card">
      <div className="ta-card-body flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-sidebar mb-1">Select a Date First</h3>
        <p className="text-sm text-gray-500 max-w-xs">Click a date on the Calendar to {label}.</p>
        <button
          onClick={() => setActiveTab('calendar')}
          className="ta-btn-primary mt-5"
        >
          Go to Calendar
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-whiten">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Content area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
        />

        <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 md:px-6 2xl:px-10">

          {/* ── Calendar Dashboard ── */}
          {activeTab === 'calendar' && (
            <div className="flex flex-col gap-6 xl:flex-row">
              <div className="flex-1 min-w-0">
                <CalendarDashboard onDateSelect={setSelectedDate} />
              </div>
              {selectedDate && (
                <div className="xl:w-72">
                  <div className="ta-card">
                    <div className="ta-card-header">
                      <h3 className="font-semibold text-sidebar">Selected Date</h3>
                    </div>
                    <div className="ta-card-body space-y-4">
                      <p className="text-2xl font-bold text-primary">{selectedDate.toDateString()}</p>
                      <div className="rounded-sm bg-whiten p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Role</span>
                          <span className="font-medium text-sidebar capitalize">{user?.role?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Company</span>
                          <span className="font-medium text-sidebar">{user?.company?.company_name || '—'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => setActiveTab('tasks')}    className="ta-btn-primary text-xs">View Tasks</button>
                        <button onClick={() => setActiveTab('reports')}  className="ta-btn-secondary text-xs">Submit Report</button>
                        <button onClick={() => setActiveTab('wins')}     className="ta-btn-secondary text-xs">Log Achievement</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tasks ── */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {canManageOrganizations && <TaskCreator onTaskCreated={() => {}} />}
              {selectedDate
                ? <TaskList selectedDate={selectedDate} userRole={user?.role} />
                : <DatePrompt label="view and manage tasks" />
              }
            </div>
          )}

          {/* ── Reports ── */}
          {activeTab === 'reports' && (
            selectedDate
              ? <ReportSubmission selectedDate={selectedDate} onReportSubmitted={() => {}} />
              : <DatePrompt label="submit a daily report" />
          )}

          {/* ── Wins ── */}
          {activeTab === 'wins' && (
            selectedDate
              ? <WinsRecorder selectedDate={selectedDate} onWinRecorded={() => {}} />
              : <DatePrompt label="record an achievement" />
          )}

          {/* ── Companies ── */}
          {activeTab === 'companies' && <CompanyManagement />}

          {/* ── Admin ── */}
          {activeTab === 'admin' && isSuperAdmin && <SuperAdminDashboard />}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && <Notifications />}

        </main>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LOGIN / REGISTER PAGE  — TailAdmin split-screen auth style
════════════════════════════════════════════════════════════ */
function LoginPage() {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', password_confirmation: '', role: 'employee',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.password_confirmation) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const { default: api } = await import('./services/api');
        await api.post('/api/register', formData);
        await login(formData.email, formData.password);
      }
    } catch (err) {
      const msg = err.response?.data?.message
        || (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' · ')
          : 'An error occurred. Please try again.');
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-sidebar px-12">
        <div className="flex items-center gap-3 mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white text-2xl font-bold">PerformTrack</span>
        </div>
        <h2 className="text-3xl font-bold text-white text-center leading-snug mb-4">
          Employee Performance<br />Tracker
        </h2>
        <p className="text-bodydark text-center max-w-sm text-sm leading-relaxed">
          Manage tasks, submit daily reports, track wins, and monitor team performance — all in one place.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
          {[
            ['Tasks', 'Assign & track'],
            ['Reports', 'Daily submissions'],
            ['Achievements', 'Record wins'],
            ['Analytics', 'Performance data'],
          ].map(([title, sub]) => (
            <div key={title} className="rounded-lg bg-sidebar-hover p-4">
              <p className="text-white font-semibold text-sm">{title}</p>
              <p className="text-bodydark text-xs mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sidebar text-xl font-bold">PerformTrack</span>
          </div>

          <h1 className="text-2xl font-bold text-sidebar mb-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {mode === 'login'
              ? 'Enter your credentials to access the dashboard.'
              : 'Fill in the details below to get started.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="ta-label">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  required className="ta-input" placeholder="John Doe" />
              </div>
            )}

            <div>
              <label className="ta-label">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                required className="ta-input" placeholder="you@example.com" />
            </div>

            <div>
              <label className="ta-label">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                required className="ta-input" placeholder="••••••••" />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="ta-label">Confirm Password</label>
                  <input type="password" name="password_confirmation" value={formData.password_confirmation}
                    onChange={handleChange} required className="ta-input" placeholder="••••••••" />
                </div>
                <div>
                  <label className="ta-label">I am registering as</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="ta-input">
                    <option value="employee">Employee</option>
                    <option value="employer">Employer</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="rounded border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="ta-btn-primary w-full py-3 disabled:opacity-60">
              {loading
                ? 'Please wait…'
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => { setMode('register'); setError(''); }}
                  className="font-semibold text-primary hover:underline">Register
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); }}
                  className="font-semibold text-primary hover:underline">Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}


export default App;
