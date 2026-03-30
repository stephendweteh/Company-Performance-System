import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

const tabLabels = {
  calendar:      'Dashboard',
  tasks:         'Tasks',
  reports:       'Reports',
  wins:          'Achievements',
  companies:     'Companies',
  notifications: 'Notifications',
  admin:         'Admin Panel',
};

const Header = ({ sidebarOpen, setSidebarOpen, activeTab }) => {
  const { user, logout } = useContext(AuthContext);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-white px-4 py-3 shadow-card md:px-6">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-sm border border-stroke p-1.5 text-sidebar hover:bg-gray-2 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
          <span>PerformTrack</span>
          <span>/</span>
          <span className="font-semibold text-sidebar">{tabLabels[activeTab] || 'Dashboard'}</span>
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative rounded-full p-2 text-sidebar hover:bg-gray-2 transition">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-full border border-stroke py-1.5 px-3 hover:bg-gray-2 transition"
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-sidebar leading-none">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize mt-0.5">{user?.role?.replace('_', ' ')}</p>
            </div>
            <svg className="h-4 w-4 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-20 w-52 rounded-sm border border-stroke bg-white shadow-tailadmin">
                <div className="border-b border-stroke px-4 py-3">
                  <p className="text-sm font-semibold text-sidebar">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-gray-2 transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
