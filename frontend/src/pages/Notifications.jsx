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
        <div className="col-12 col-md-10 col-lg-8" style={{ maxWidth: '680px' }}>
          <div className="d-flex align-items-center justify-content-between mb-4 pb-2">
            <div>
              <h2 className="fw-bold text-white mb-1 font-heading">
                Activity & <span className="gradient-text">Alerts</span>
              </h2>
              <span className="text-muted small">Interactions, likes, and comments from fellow explorers</span>
            </div>
            {notifications.length > 0 && (
              <button onClick={handleMarkAllRead} className="btn btn-dark btn-sm rounded-pill px-3 border" style={{ borderColor: 'var(--tn-border)' }}>
                Mark all as read
              </button>
            )}
          </div>

          {loading && <LoadingSpinner text="Retrieving latest travel activity..." />}

          {!loading && notifications.length === 0 && (
            <div className="glass-card p-5 text-center my-4">
              <div className="mb-3">
                <i className="bi bi-bell display-3 text-info opacity-50"></i>
              </div>
              <h4 className="fw-bold text-white mb-1 font-heading">You're all caught up!</h4>
              <p className="text-muted small mb-0">When travelers like, comment or follow your moments, updates will appear here.</p>
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
