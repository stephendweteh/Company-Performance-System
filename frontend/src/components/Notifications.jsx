import React, { useState, useEffect } from 'react';
import axios from '../services/api';

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

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    const savedPreference = window.localStorage.getItem('notification-sound-enabled');
    return savedPreference !== 'false';
  });

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

    const unread = items.filter((notification) => notification.status === 'unread').length;
    window.dispatchEvent(new CustomEvent('notifications-updated', {
      detail: { unreadCount: unread, items },
    }));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      updateNotificationState(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      updateNotificationState(
        notifications.map((notification) => (
          notification.id === notificationId
            ? { ...notification, status: 'read' }
            : notification
        ))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');
      updateNotificationState(
        notifications.map((notification) => ({ ...notification, status: 'read' }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const openNotificationTarget = async (notification) => {
    try {
      if (notification.status === 'unread') {
        await axios.put(`/api/notifications/${notification.id}/read`);
      }

      const nextNotifications = notifications.map((item) => (
        item.id === notification.id
          ? { ...item, status: 'read' }
          : item
      ));

      updateNotificationState(nextNotifications);
      window.dispatchEvent(new CustomEvent('notification-navigate', {
        detail: { notification },
      }));
    } catch (error) {
      console.error('Error opening notification target:', error);
    }
  };

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  return (
    <div className="ta-card">
      <div className="ta-card-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-sidebar">Notifications</h2>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleNotificationSound}
            className="inline-flex items-center gap-1 rounded-sm border border-stroke px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-2 hover:text-primary"
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
            <button onClick={markAllAsRead} className="ta-btn-secondary text-xs">
              Mark all read
            </button>
          )}
        </div>
      </div>
      <div className="ta-card-body">
        {notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">You're all caught up — no notifications.</p>
        ) : (
          <ul className="divide-y divide-stroke">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-4 py-4 transition-colors ${
                  n.status === 'unread' ? 'bg-primary/5 -mx-5 px-5 rounded-sm' : ''
                }`}
              >
                <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${getNotificationMeta(n.type).tone}`}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {getNotificationMeta(n.type).icon}
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {getNotificationMeta(n.type).label}
                    </span>
                    {n.status === 'unread' && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  {hasDirectNotificationTarget(n) ? (
                    <button
                      type="button"
                      onClick={() => openNotificationTarget(n)}
                      className={`mt-1 text-left text-sm hover:text-primary ${n.status === 'unread' ? 'font-medium text-sidebar' : 'text-gray-500'}`}
                    >
                      {n.message}
                    </button>
                  ) : (
                    <p className={`mt-1 text-sm ${ n.status === 'unread' ? 'font-medium text-sidebar' : 'text-gray-500' }`}>
                      {n.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {hasDirectNotificationTarget(n) ? (
                  <button
                    onClick={() => openNotificationTarget(n)}
                    className="flex-shrink-0 rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    Open
                  </button>
                ) : n.status === 'unread' && (
                  <button onClick={() => markAsRead(n.id)}
                    className="flex-shrink-0 rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors">
                    Dismiss
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
