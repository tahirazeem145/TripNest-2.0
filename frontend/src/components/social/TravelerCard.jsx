import React from 'react';

export default function TravelerCard({ traveler, isSelf, onFollowToggle }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white style-card d-flex flex-row align-items-center justify-content-between">
      <div className="d-flex align-items-center me-3">
        <div
          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 flex-shrink-0"
          style={{ width: '48px', height: '48px', fontSize: '1.1rem' }}
        >
          {traveler.full_name ? traveler.full_name.charAt(0).toUpperCase() : 'T'}
        </div>
        <div>
          <h6 className="fw-bold text-dark mb-0">{traveler.full_name || 'Traveler'}</h6>
          <div className="text-muted extra-small">{traveler.email}</div>
          {traveler.bio && <p className="small text-secondary mb-0 mt-1">{traveler.bio}</p>}
        </div>
      </div>

      {!isSelf && (
        <button
          onClick={() => onFollowToggle(traveler.id, traveler.is_following)}
          className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold transition-all flex-shrink-0 ${
            traveler.is_following ? 'btn-outline-secondary' : 'btn-primary'
          }`}
        >
          {traveler.is_following ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
}
