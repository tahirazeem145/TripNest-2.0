import React from 'react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-4">
      <div className="spinner-border text-info mb-3" style={{ width: '2.8rem', height: '2.8rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted small fw-medium">{text}</p>
    </div>
  );
}
