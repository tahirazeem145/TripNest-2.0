import React from 'react';

export default function NotificationItem({ notification }) {
  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <i className="bi bi-heart-fill text-danger fs-5"></i>;
      case 'comment':
        return <i className="bi bi-chat-fill text-primary fs-5"></i>;
      case 'follow':
        return <i className="bi bi-person-plus-fill text-teal fs-5"></i>;
      default:
        return <i className="bi bi-bell-fill text-warning fs-5"></i>;
    }
  };

  const getMessage = (n) => {
    const name = n.actor?.fullName || 'A traveler';
    switch (n.type) {
      case 'like':
        return <span><strong>{name}</strong> liked your travel post</span>;
      case 'comment':
        return <span><strong>{name}</strong> commented on your post</span>;
      case 'follow':
        return <span><strong>{name}</strong> started following you</span>;
      default:
        return <span><strong>{name}</strong> interacted with your profile</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`card border-0 shadow-sm rounded-4 p-3 mb-3 d-flex flex-row align-items-center justify-content-between transition-all ${
        notification.is_read ? 'bg-white' : 'bg-light border-start border-primary border-4'
      }`}
    >
      <div className="d-flex align-items-center">
        <div className="me-3">{getIcon(notification.type)}</div>
        <div className="small text-dark">{getMessage(notification)}</div>
      </div>
      <div className="extra-small text-muted">{formatDate(notification.created_at)}</div>
    </div>
  );
}
