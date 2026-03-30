import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

/* ── inline SVG icons ─────────────────────────────────────── */
const Icon = ({ children, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || 'h-5 w-5'}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    {children}
  </svg>
);

const icons = {
  calendar: (
    <Icon>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </Icon>
  ),
  tasks: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </Icon>
  ),
  reports: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </Icon>
  ),
  wins: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 9.101c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </Icon>
  ),
  companies: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </Icon>
  ),
  notifications: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </Icon>
  ),
  admin: (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </Icon>
  ),
  close: (
    <Icon className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </Icon>
  ),
};

const navLinks = [
  { label: 'Dashboard',     tab: 'calendar',      roles: ['employee', 'employer', 'super_admin'], icon: icons.calendar },
  { label: 'Tasks',         tab: 'tasks',         roles: ['employee', 'employer', 'super_admin'], icon: icons.tasks },
  { label: 'Reports',       tab: 'reports',       roles: ['employee', 'employer', 'super_admin'], icon: icons.reports },
  { label: 'Achievements',  tab: 'wins',          roles: ['employee', 'employer', 'super_admin'], icon: icons.wins },
  { label: 'Companies',     tab: 'companies',     roles: ['employer', 'super_admin'],             icon: icons.companies },
  { label: 'Notifications', tab: 'notifications', roles: ['employee', 'employer', 'super_admin'], icon: icons.notifications },
  { label: 'Admin Panel',   tab: 'admin',         roles: ['super_admin'],                         icon: icons.admin },
];

/* ── role pill ────────────────────────────────────────────── */
const rolePill = {
  super_admin: 'bg-primary/20 text-primary',
  employer:    'bg-success/20 text-success',
  employee:    'bg-warning/20 text-warning',
};

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const { user } = useContext(AuthContext);

  const handleNav = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col overflow-hidden bg-sidebar
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-sidebar-hover">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-bold text-base tracking-wide">PerformTrack</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-bodydark hover:text-white lg:hidden">
            {icons.close}
          </button>
        </div>

        {/* ── Scrollable nav ── */}
        <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto py-5 px-4">
          {/* User card */}
          <div className="mb-6 rounded-lg bg-sidebar-hover px-4 py-3">
            <p className="text-xs text-bodydark uppercase tracking-wider">Signed in as</p>
            <p className="mt-1 text-sm font-semibold text-white">{user?.name}</p>
            <span className={`mt-1.5 inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${rolePill[user?.role] || 'bg-gray-500/20 text-gray-300'}`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>

          <p className="mb-3 pl-3 text-xs font-semibold uppercase tracking-wider text-bodydark">
            Main Menu
          </p>

          <nav className="flex flex-col gap-1">
            {navLinks
              .filter((link) => link.roles.includes(user?.role))
              .map((link) => {
                const isActive = activeTab === link.tab;
                return (
                  <button
                    key={link.tab}
                    onClick={() => handleNav(link.tab)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-primary text-white shadow-card'
                        : 'text-bodydark hover:bg-sidebar-hover hover:text-white'
                      }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-bodydark group-hover:text-white'}>
                      {link.icon}
                    </span>
                    {link.label}
                  </button>
                );
              })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
