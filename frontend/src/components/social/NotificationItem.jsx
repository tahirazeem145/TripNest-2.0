import React from 'react';
import { Link } from 'react-router-dom';

export default function NotificationItem({ notification }) {
  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <i className="bi bi-heart-fill text-danger fs-5"></i>;
      case 'comment':
        return <i className="bi bi-chat-fill text-info fs-5"></i>;
      case 'follow':
        return <i className="bi bi-person-plus-fill text-success fs-5"></i>;
      case 'save':
        return <i className="bi bi-bookmark-fill text-warning fs-5"></i>;
      default:
        return <i className="bi bi-bell-fill text-info fs-5"></i>;
    }
  };

  const getMessage = (n) => {
    const name = n.actor?.fullName || 'A traveler';
    switch (n.type) {
      case 'like':
        return <span><strong className="text-white">{name}</strong> liked your travel post</span>;
      case 'comment':
        return <span><strong className="text-white">{name}</strong> commented on your post</span>;
      case 'follow':
        return <span><strong className="text-white">{name}</strong> started following your journeys</span>;
      case 'save':
        return <span><strong className="text-white">{name}</strong> bookmarked your moment</span>;
      default:
        return <span><strong className="text-white">{name}</strong> interacted with your profile</span>;
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

  const targetLink = notification.post_id
    ? `/post/${notification.post_id}`
    : notification.actor_id
    ? `/profile/${notification.actor_id}`
    : null;

  const content = (
    <div
      className={`glass-card p-3 mb-3 d-flex flex-row align-items-center justify-content-between transition-all ${
        notification.is_read ? '' : 'border-start border-info border-3'
      }`}
    >
      <div className="d-flex align-items-center me-3">
        <div className="me-3 flex-shrink-0">{getIcon(notification.type)}</div>
        <div className="small text-light">{getMessage(notification)}</div>
      </div>
      <div className="extra-small text-muted flex-shrink-0" style={{ fontSize: '0.75rem' }}>{formatDate(notification.created_at)}</div>
    </div>
  );

  if (targetLink) {
    return (
      <Link to={targetLink} className="text-decoration-none d-block">
        {content}
      </Link>
    );
  }

  return content;
}
