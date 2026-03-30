import React, { useState, useEffect } from 'react';
import axios from '../services/api';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

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
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(
        '/api/notifications/mark-all-read',
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
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
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="ta-btn-secondary text-xs">
            Mark all read
          </button>
        )}
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
                <span className={`mt-1 flex h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                  n.status === 'unread' ? 'bg-primary' : 'bg-stroke'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${ n.status === 'unread' ? 'font-medium text-sidebar' : 'text-gray-500' }`}>
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {n.status === 'unread' && (
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
