import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon = 'bi-compass', title, message, actionText, actionLink }) {
  return (
    <div className="glass-card p-5 text-center my-4">
      <div className="mb-3">
        <i className={`bi ${icon} display-2 text-info opacity-75`}></i>
      </div>
      <h4 className="fw-bold text-white mb-2 font-heading">{title}</h4>
      <p className="text-muted small mb-4" style={{ maxWidth: '440px', margin: '0 auto' }}>
        {message}
      </p>
      {actionText && actionLink && (
        <div>
          <Link to={actionLink} className="gradient-btn text-decoration-none d-inline-block">
            {actionText}
          </Link>
        </div>
      )}
    </div>
  );
}
