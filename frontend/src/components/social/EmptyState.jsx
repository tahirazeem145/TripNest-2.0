import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon = 'bi-compass', title, message, actionText, actionLink }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
      <div className="mb-3">
        <i className={`bi ${icon} display-2 text-primary opacity-75`}></i>
      </div>
      <h4 className="fw-bold text-dark mb-2">{title}</h4>
      <p className="text-secondary small mb-4" style={{ maxWidth: '440px', margin: '0 auto' }}>
        {message}
      </p>
      {actionText && actionLink && (
        <div>
          <Link to={actionLink} className="btn btn-primary rounded-pill px-4 py-2 fw-semibold">
            {actionText}
          </Link>
        </div>
      )}
    </div>
  );
}
