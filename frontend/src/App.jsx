import React, { useState, useContext, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CalendarDashboard from './components/CalendarDashboard';
import TaskList from './components/TaskList';
import TaskCreator from './components/TaskCreator';
import ReportSubmission from './components/ReportSubmission';
import WinsRecorder from './components/WinsRecorder';
import Notifications from './components/Notifications';
import CompanyManagement from './components/CompanyManagement';
import TeamsManagement from './components/TeamsManagement';
import EmployerGroupsManagement from './components/EmployerGroupsManagement';
import PerformanceDashboard from './components/PerformanceDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ProfileSettings from './components/ProfileSettings';
import AuthContext from './context/AuthContext';
import axios from './services/api';
import './App.css';

const defaultBranding = {
  app_name: 'PerformTrack',
  app_logo_url: null,
  has_app_logo: false,
};

function App() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [dateSelectionTargetTab, setDateSelectionTargetTab] = useState(null);
  const [employeePendingFocus, setEmployeePendingFocus] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [focusedReportId, setFocusedReportId] = useState(null);
  const [focusedWinId, setFocusedWinId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);
  const [branding, setBranding] = useState(defaultBranding);
  const { user, refreshUser } = useContext(AuthContext);
  const canAssignTasks = ['employer', 'manager', 'super_admin'].includes(user?.role);
  const canAccessCompanies = ['employer', 'manager', 'super_admin'].includes(user?.role);
  const canManageCompanies = ['employer', 'super_admin'].includes(user?.role);
  const isSuperAdmin = user?.role === 'super_admin';

  // Reset to calendar whenever a user signs in
  useEffect(() => {
    if (user) {
      setActiveTab('calendar');
      setSelectedDate(null);
      setDateSelectionTargetTab(null);
      setEmployeePendingFocus(false);
      setFocusedTaskId(null);
      setFocusedReportId(null);
      setFocusedWinId(null);
    }
  }, [user?.id]);

  useEffect(() => {
    const handleNotificationNavigate = (event) => {
      const notification = event.detail?.notification;
      const relatedId = Number(notification?.related_id || 0) || null;

      setEmployeePendingFocus(false);
      setDateSelectionTargetTab(null);

      if (relatedId && ['task_assigned', 'task_due', 'task_completed'].includes(notification?.type)) {
        setActiveTab('tasks');
        setFocusedTaskId(relatedId);
        setFocusedReportId(null);
        setFocusedWinId(null);
        return;
      }

      if (relatedId && ['report_comment', 'report_submitted'].includes(notification?.type)) {
        setActiveTab('reports');
        setFocusedTaskId(null);
        setFocusedReportId(relatedId);
        setFocusedWinId(null);
        return;
      }

      if (relatedId && notification?.type === 'win_recorded') {
        setActiveTab('wins');
        setFocusedTaskId(null);
        setFocusedReportId(null);
        setFocusedWinId(relatedId);
        return;
      }

      setActiveTab('notifications');
      setFocusedTaskId(null);
      setFocusedReportId(null);
      setFocusedWinId(null);
    };

    window.addEventListener('notification-navigate', handleNotificationNavigate);

    return () => {
      window.removeEventListener('notification-navigate', handleNotificationNavigate);
    };
  }, []);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const response = await axios.get('/api/public/branding');
      setBranding({
        ...defaultBranding,
        ...(response.data || {}),
      });
    } catch (error) {
      setBranding(defaultBranding);
    }
  };

  const handleCalendarDateSelect = (date) => {
    setSelectedDate(date);

    if (dateSelectionTargetTab) {
      setEmployeePendingFocus(false);
      setActiveTab(dateSelectionTargetTab);
      setDateSelectionTargetTab(null);
      return;
    }

    if (user?.role === 'employee') {
      setEmployeePendingFocus(true);
      setActiveTab('tasks');
      return;
    }

    if (['manager', 'employer'].includes(user?.role)) {
      setEmployeePendingFocus(false);
      setActiveTab('tasks');
    }
  };

  if (!user) return <LoginPage branding={branding} />;

  /* ── date-required prompt ── */
  const DatePrompt = ({ label, targetTab }) => (
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
          onClick={() => {
            setDateSelectionTargetTab(targetTab || null);
            setActiveTab('calendar');
          }}
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
        branding={branding}
      />

      {/* Content area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          branding={branding}
        />

        <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 md:px-6 2xl:px-10">

          {/* ── Calendar Dashboard ── */}
          {activeTab === 'calendar' && (
            <div className="flex flex-col gap-6 xl:flex-row">
              <div className="flex-1 min-w-0">
                <CalendarDashboard onDateSelect={handleCalendarDateSelect} refreshKey={calendarRefreshKey} />
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
                        <button onClick={() => setActiveTab('reports')}  className="ta-btn-secondary text-xs">
                          {user?.role === 'manager' ? 'View Reports' : 'Submit Report'}
                        </button>
                        <button onClick={() => setActiveTab('wins')}     className="ta-btn-secondary text-xs">
                          {user?.role === 'manager' ? 'View Achievements' : 'Log Achievement'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tasks ── */}
          {activeTab === 'tasks' && (
            <div className={canAssignTasks ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' : 'w-full'}>
              {canAssignTasks && (
                <TaskCreator
                  userRole={user?.role}
                  selectedDate={selectedDate}
                  onTaskCreated={() => { setTaskRefreshKey((prev) => prev + 1); setCalendarRefreshKey((prev) => prev + 1); }}
                />
              )}
              <TaskList
                selectedDate={selectedDate}
                userRole={user?.role}
                currentUserId={user?.id}
                refreshKey={taskRefreshKey}
                focusedTaskId={focusedTaskId}
                onStatusChange={() => setCalendarRefreshKey((prev) => prev + 1)}
                pendingOnly={user?.role === 'employee' && employeePendingFocus}
                onClearPendingOnly={() => setEmployeePendingFocus(false)}
              />
            </div>
          )}

          {/* ── Reports ── */}
          {activeTab === 'reports' && (
            ['manager', 'super_admin'].includes(user?.role) || Boolean(focusedReportId)
              ? <ReportSubmission selectedDate={selectedDate} userRole={user?.role} currentUserId={user?.id} focusedReportId={focusedReportId} onReportSubmitted={() => setCalendarRefreshKey((prev) => prev + 1)} />
              : selectedDate
                ? <ReportSubmission selectedDate={selectedDate} userRole={user?.role} currentUserId={user?.id} focusedReportId={focusedReportId} onReportSubmitted={() => setCalendarRefreshKey((prev) => prev + 1)} />
                : <DatePrompt label="submit a daily report" targetTab="reports" />
          )}

          {/* ── Wins ── */}
          {activeTab === 'wins' && (
            ['manager', 'super_admin'].includes(user?.role) || Boolean(focusedWinId)
              ? <WinsRecorder selectedDate={selectedDate} userRole={user?.role} focusedWinId={focusedWinId} />
              : selectedDate
                ? <WinsRecorder selectedDate={selectedDate} userRole={user?.role} focusedWinId={focusedWinId} onWinRecorded={() => {}} />
                : <DatePrompt label="record an achievement" targetTab="wins" />
          )}

          {/* ── Companies ── */}
          {activeTab === 'companies' && canAccessCompanies && <CompanyManagement canManage={canManageCompanies} />}

          {/* ── Teams ── */}
          {activeTab === 'teams' && canAccessCompanies && <TeamsManagement />}

          {/* ── Employer Groups ── */}
          {activeTab === 'employer_groups' && user?.role === 'manager' && <EmployerGroupsManagement />}

          {/* ── Performance ── */}
          {activeTab === 'performance' && user?.role === 'manager' && <PerformanceDashboard />}

          {/* ── Admin ── */}
          {activeTab === 'admin' && isSuperAdmin && <SuperAdminDashboard onBrandingUpdated={fetchBranding} />}

          {/* ── Notifications ── */}
          {activeTab === 'notifications' && <Notifications />}

          {/* ── Profile ── */}
          {activeTab === 'profile' && <ProfileSettings user={user} onProfileUpdated={refreshUser} />}

        </main>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   LOGIN / REGISTER PAGE  — TailAdmin split-screen auth style
════════════════════════════════════════════════════════════ */
function LoginPage({ branding }) {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '', company_id: '', team_id: '',
  });
  const [companies, setCompanies] = useState([]);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationPending, setRegistrationPending] = useState(false);
  const { login } = useContext(AuthContext);

  // Fetch companies when registration mode is entered
  React.useEffect(() => {
    if (mode === 'register' && companies.length === 0) {
      fetchCompanies();
    }
  }, [mode]);

  React.useEffect(() => {
    if (mode !== 'register') {
      return;
    }

    if (!formData.company_id) {
      setTeams([]);
      return;
    }

    fetchTeams(formData.company_id);
  }, [mode, formData.company_id]);

  const fetchCompanies = async () => {
    try {
      const { default: api } = await import('./services/api');
      const response = await api.get('/api/public/companies');
      setCompanies(response.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setError('Unable to load companies. Please try again.');
    }
  };

  const fetchTeams = async (companyId) => {
    try {
      const { default: api } = await import('./services/api');
      const response = await api.get('/api/public/teams', {
        params: { company_id: companyId },
      });
      setTeams(response.data || []);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      setTeams([]);
    }
  };

  const handleChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      ...(e.target.name === 'company_id' ? { team_id: '' } : {}),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRegistrationPending(false);
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.password_confirmation) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (!formData.company_id) {
          setError('Please select a company');
          setLoading(false);
          return;
        }
        const { default: api } = await import('./services/api');
        await api.post('/api/register', formData);
        setRegistrationPending(true);
        setFormData({ name: '', email: '', phone: '', password: '', password_confirmation: '', company_id: '', team_id: '' });
        setTeams([]);
        setError('');
      }
    } catch (err) {
      // Handle membership pending status
      if (err.response?.status === 403 && err.response?.data?.status === 'pending') {
        setRegistrationPending(true);
        setError(err.response?.data?.message);
      } else {
        const msg = err.response?.data?.message
          || (err.response?.data?.errors
            ? Object.values(err.response.data.errors).flat().join(' · ')
            : 'An error occurred. Please try again.');
        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-sidebar px-12">
        <div className="mb-10">
          <div className="flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-2xl bg-white/95 p-3 shadow-sm">
            {branding?.app_logo_url ? (
              <img src={branding.app_logo_url} alt={`${branding.app_name || 'PerformTrack'} logo`} className="h-full w-full object-contain" />
            ) : (
              <svg className="h-20 w-20 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white text-center leading-snug mb-4">
          Company Performance<br />System
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
          <div className="flex lg:hidden items-center mb-8 justify-center">
            <div className="flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stroke">
              {branding?.app_logo_url ? (
                <img src={branding.app_logo_url} alt={`${branding.app_name || 'PerformTrack'} logo`} className="h-full w-full object-contain" />
              ) : (
                <svg className="h-20 w-20 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-sidebar mb-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {mode === 'login'
              ? 'Enter your credentials to access the dashboard.'
              : 'Fill in the details below to get started.'}
          </p>

          {registrationPending && !mode === 'register' && (
            <div className="mb-6 rounded border border-success/30 bg-success/10 px-4 py-4 text-sm text-success">
              <div className="font-semibold mb-1">Registration Successful</div>
              <p>Your membership is pending approval fom your company employer or super admin. You will receive a notification once your request is approved.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="ta-label">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  required className="ta-input" placeholder="John Doe" />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="ta-label">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                  className="ta-input" placeholder="e.g. 233XXXXXXXXX" />
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
                  <label className="ta-label">Select Your Company</label>
                  <select name="company_id" value={formData.company_id} onChange={handleChange} required className="ta-input">
                    <option value="">Choose a company...</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ta-label">Select Your Team</label>
                  <select
                    name="team_id"
                    value={formData.team_id}
                    onChange={handleChange}
                    className="ta-input"
                    disabled={!formData.company_id || teams.length === 0}
                  >
                    <option value="">{formData.company_id ? (teams.length > 0 ? 'Choose a team...' : 'No teams available') : 'Select a company first'}</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.team_name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className={`rounded border px-4 py-3 text-sm ${registrationPending 
                ? 'border-warning/30 bg-warning/10 text-warning' 
                : 'border-danger/30 bg-danger/10 text-danger'}`}>
                {error}
              </div>
            )}

            {!registrationPending && (
              <button type="submit" disabled={loading} className="ta-btn-primary w-full py-3 disabled:opacity-60">
                {loading
                  ? 'Please wait…'
                  : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            )}
          </form>

          {!registrationPending && (
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
          )}

          {registrationPending && (
            <div className="mt-6 text-center">
              <button onClick={() => { setMode('login'); setError(''); setRegistrationPending(false); }}
                className="font-semibold text-primary hover:underline">
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default App;
