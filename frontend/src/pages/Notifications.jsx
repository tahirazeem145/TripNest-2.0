import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import NotificationItem from '../components/social/NotificationItem';
import LoadingSpinner from '../components/social/LoadingSpinner';

export default function Notifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await socialService.getNotifications(token);
      setNotifications(data || []);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await socialService.markNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.warn('Failed to mark read:', err);
    }
  };

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8" style={{ maxWidth: '640px' }}>
          <div className="d-flex align-items-center justify-content-between mb-4 pb-2">
            <div>
              <h2 className="fw-bold text-dark mb-0">Notifications</h2>
              <span className="text-secondary small">Activity alerts & interactions from other travelers</span>
            </div>
            {notifications.length > 0 && (
              <button onClick={handleMarkAllRead} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                Mark all as read
              </button>
            )}
          </div>

          {loading && <LoadingSpinner text="Retrieving latest activity..." />}

          {!loading && notifications.length === 0 && (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
              <div className="mb-3">
                <i className="bi bi-bell display-3 text-secondary opacity-50"></i>
              </div>
              <h4 className="fw-bold text-dark mb-1">You're all caught up!</h4>
              <p className="text-secondary small mb-0">When travelers like, comment or follow you, updates will show here.</p>
            </div>
          )}

          {!loading && notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      </div>
    </SocialLayout>
  );
}
