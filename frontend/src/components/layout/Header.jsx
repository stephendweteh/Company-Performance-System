import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AppLogo from './AppLogo';
import axios from '../../services/api';

const notificationTypeMeta = {
  task_assigned: {
    label: 'Task',
    tone: 'bg-primary/10 text-primary',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7l2 2 4-4" />
    ),
  },
  task_due: {
    label: 'Due',
    tone: 'bg-warning/10 text-warning',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  task_completed: {
    label: 'Done',
    tone: 'bg-success/10 text-success',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  report_submitted: {
    label: 'Report',
    tone: 'bg-primary/10 text-primary',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  report_comment: {
    label: 'Comment',
    tone: 'bg-warning/10 text-warning',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
    ),
  },
  win_recorded: {
    label: 'Win',
    tone: 'bg-success/10 text-success',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 9.101c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    ),
  },
  membership_approved: {
    label: 'Approved',
    tone: 'bg-success/10 text-success',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m-6 8h6a2 2 0 002-2V8l-5-3-5 3v8a2 2 0 002 2z" />
    ),
  },
  membership_rejected: {
    label: 'Rejected',
    tone: 'bg-danger/10 text-danger',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  default: {
    label: 'Alert',
    tone: 'bg-gray-2 text-sidebar',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 100-18 9 9 0 000 18z" />
    ),
  },
};

const getNotificationMeta = (type) => notificationTypeMeta[type] || notificationTypeMeta.default;

const hasDirectNotificationTarget = (notification) => (
  Boolean(notification?.related_id)
  && ['task_assigned', 'task_due', 'task_completed', 'report_comment', 'report_submitted', 'win_recorded'].includes(notification?.type)
);

const tabLabels = {
  calendar:      'Dashboard',
  tasks:         'Tasks',
  reports:       'Reports & Responses',
  wins:          'Achievements',
  companies:     'Companies',
  performance:   'Performance',
  notifications: 'Notifications',
  profile:       'Profile',
  admin:         'Admin Panel',
};

const Header = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, branding }) => {
  const { user, logout } = useContext(AuthContext);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    const savedPreference = window.localStorage.getItem('notification-sound-enabled');
    return savedPreference !== 'false';
  });
  const audioContextRef = useRef(null);
  const hasPrimedAudioRef = useRef(false);
  const hasInitializedNotificationsRef = useRef(false);
  const previousUnreadCountRef = useRef(0);

  const getAudioContext = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    return audioContextRef.current;
  };

  const primeNotificationAudio = async () => {
    const audioContext = getAudioContext();
    if (!audioContext || audioContext.state === 'running') {
      return;
    }

    try {
      await audioContext.resume();
    } catch (error) {
      // Ignore browsers that block audio until a later interaction.
    }
  };

  const playNotificationSound = async () => {
    if (!soundEnabled) {
      return;
    }

    const audioContext = getAudioContext();
    if (!audioContext) {
      return;
    }

    if (audioContext.state !== 'running') {
      try {
        await audioContext.resume();
      } catch (error) {
        return;
      }
    }

    const now = audioContext.currentTime;
    const gainNode = audioContext.createGain();
    const oscillatorA = audioContext.createOscillator();
    const oscillatorB = audioContext.createOscillator();

    oscillatorA.type = 'sine';
    oscillatorA.frequency.setValueAtTime(880, now);
    oscillatorA.frequency.exponentialRampToValueAtTime(660, now + 0.18);

    oscillatorB.type = 'triangle';
    oscillatorB.frequency.setValueAtTime(1320, now + 0.05);
    oscillatorB.frequency.exponentialRampToValueAtTime(990, now + 0.2);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.04, now + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    oscillatorA.connect(gainNode);
    oscillatorB.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillatorA.start(now);
    oscillatorB.start(now + 0.03);
    oscillatorA.stop(now + 0.32);
    oscillatorB.stop(now + 0.28);
  };

  const toggleNotificationSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('notification-sound-enabled', String(next));
      }
      return next;
    });
  };

  const updateNotificationState = (items) => {
    setNotifications(items);

    const unread = Array.isArray(items)
      ? items.filter((notification) => notification.status === 'unread').length
      : 0;

    if (hasInitializedNotificationsRef.current && unread > previousUnreadCountRef.current) {
      playNotificationSound();
    }

    hasInitializedNotificationsRef.current = true;
    previousUnreadCountRef.current = unread;

    setUnreadCount(unread);
    window.dispatchEvent(new CustomEvent('notifications-updated', {
      detail: { unreadCount: unread, items },
    }));
  };

  useEffect(() => {
    const unlockAudio = () => {
      if (!hasPrimedAudioRef.current) {
        hasPrimedAudioRef.current = true;
        primeNotificationAudio();
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      if (active) {
        setLoadingNotifications(true);
      }

      try {
        const response = await axios.get('/api/notifications');
        if (!active) {
          return;
        }

        updateNotificationState(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (active) {
          setNotifications([]);
          setUnreadCount(0);
        }
      } finally {
        if (active) {
          setLoadingNotifications(false);
        }
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);

    const handleNotificationsUpdated = (event) => {
      if (active) {
        if (Array.isArray(event.detail?.items)) {
          setNotifications(event.detail.items);
        }
        setUnreadCount(event.detail?.unreadCount || 0);
      }
    };

    window.addEventListener('notifications-updated', handleNotificationsUpdated);

    return () => {
      active = false;
      clearInterval(intervalId);
      window.removeEventListener('notifications-updated', handleNotificationsUpdated);
    };
  }, []);

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);

      const nextNotifications = notifications.map((notification) => (
        notification.id === notificationId
          ? { ...notification, status: 'read' }
          : notification
      ));

      updateNotificationState(
        nextNotifications
      );

      if (!nextNotifications.some((notification) => notification.status === 'unread')) {
        setNotificationsOpen(false);
      }
    } catch (error) {
      // ignore quick action failures silently in the header dropdown
    }
  };

  const openNotificationTarget = async (notification) => {
    if (!notification) {
      return;
    }

    if (notification.status === 'unread') {
      try {
        await axios.put(`/api/notifications/${notification.id}/read`);

        updateNotificationState(
          notifications.map((item) => (
            item.id === notification.id
              ? { ...item, status: 'read' }
              : item
          ))
        );
      } catch (error) {
        // ignore read-state errors and still allow navigation
      }
    }

    setNotificationsOpen(false);
    window.dispatchEvent(new CustomEvent('notification-navigate', {
      detail: { notification },
    }));
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');

      const nextNotifications = notifications.map((notification) => ({ ...notification, status: 'read' }));

      updateNotificationState(
        nextNotifications
      );
      setNotificationsOpen(false);
    } catch (error) {
      // ignore quick action failures silently in the header dropdown
    }
  };

  const isNotificationsActive = activeTab === 'notifications';
  const previewNotifications = notifications.slice(0, 5);

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
          <AppLogo
            branding={branding}
            containerClassName="flex items-center gap-2"
            textClassName="font-medium text-gray-500"
            fallbackMarkClassName="flex h-7 w-7 items-center justify-center rounded-full bg-primary"
            imageWrapperClassName="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-white p-1 ring-1 ring-stroke"
            imageClassName="h-full w-full object-contain"
          />
          <span>/</span>
          <span className="font-semibold text-sidebar">{tabLabels[activeTab] || 'Dashboard'}</span>
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen((prev) => !prev);
              setUserMenuOpen(false);
            }}
            className={`relative rounded-full p-2 transition ${
              notificationsOpen || isNotificationsActive
                ? 'bg-primary/10 text-primary'
                : 'text-sidebar hover:bg-gray-2'
            }`}
            aria-label="Open notifications"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-[22rem] rounded-sm border border-stroke bg-white shadow-tailadmin">
                <div className="flex items-center justify-between border-b border-stroke px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-sidebar">Notifications</p>
                    <p className="text-xs text-gray-500">{unreadCount} unread</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleNotificationSound}
                      className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition hover:text-primary"
                      title={soundEnabled ? 'Mute notification sounds' : 'Unmute notification sounds'}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {soundEnabled ? (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H3v6h3l5 4V5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728" />
                          </>
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5L6 9H3v6h3l5 4V5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M23 9l-6 6M17 9l6 6" />
                          </>
                        )}
                      </svg>
                      {soundEnabled ? 'Sound on' : 'Sound off'}
                    </button>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">Loading notifications...</div>
                  ) : previewNotifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500">You're all caught up.</div>
                  ) : (
                    <div className="divide-y divide-stroke">
                      {previewNotifications.map((notification) => (
                        <div key={notification.id} className="px-4 py-3">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getNotificationMeta(notification.type).tone}`}>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {getNotificationMeta(notification.type).icon}
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  {getNotificationMeta(notification.type).label}
                                </span>
                                {notification.status === 'unread' && (
                                  <span className="h-2 w-2 rounded-full bg-primary" />
                                )}
                              </div>
                              {hasDirectNotificationTarget(notification) ? (
                                <button
                                  type="button"
                                  onClick={() => openNotificationTarget(notification)}
                                  className={`mt-0.5 text-left text-sm hover:text-primary ${notification.status === 'unread' ? 'font-medium text-sidebar' : 'text-gray-500'}`}
                                >
                                  {notification.message}
                                </button>
                              ) : (
                                <p className={`mt-0.5 text-sm ${notification.status === 'unread' ? 'font-medium text-sidebar' : 'text-gray-500'}`}>
                                  {notification.message}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-gray-400">{new Date(notification.created_at).toLocaleString()}</p>
                            </div>
                            {hasDirectNotificationTarget(notification) ? (
                              <button
                                onClick={() => openNotificationTarget(notification)}
                                className="shrink-0 rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                              >
                                Open
                              </button>
                            ) : notification.status === 'unread' && (
                              <button
                                onClick={() => markNotificationAsRead(notification.id)}
                                className="shrink-0 rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-stroke px-4 py-3">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      setActiveTab('notifications');
                    }}
                    className="w-full rounded-sm border border-stroke px-3 py-2 text-sm font-medium text-sidebar transition hover:bg-gray-2"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-full border border-stroke py-1.5 px-3 hover:bg-gray-2 transition"
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-white text-sm font-bold">
              {user?.profile_photo_url ? (
                <img src={user.profile_photo_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
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
                    onClick={() => { setUserMenuOpen(false); setActiveTab('profile'); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-sidebar hover:bg-gray-2 transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1118.878 17.8M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Profile
                  </button>
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
