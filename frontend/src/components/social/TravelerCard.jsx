import React from 'react';
import { Link } from 'react-router-dom';

export default function TravelerCard({ traveler, isSelf, onFollowToggle }) {
  const initial = traveler.full_name
    ? traveler.full_name.charAt(0).toUpperCase()
    : traveler.email
    ? traveler.email.charAt(0).toUpperCase()
    : 'T';

  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white style-card d-flex flex-row align-items-center justify-content-between">
      <Link to={`/profile/${traveler.id}`} className="text-decoration-none d-flex align-items-center me-3 flex-grow-1 overflow-hidden">
        {traveler.avatar_url ? (
          <img
            src={traveler.avatar_url}
            alt={traveler.full_name || 'Traveler'}
            className="rounded-circle object-fit-cover me-3 flex-shrink-0"
            style={{ width: '48px', height: '48px' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 flex-shrink-0"
            style={{ width: '48px', height: '48px', fontSize: '1.1rem' }}
          >
            {initial}
          </div>
        )}

        <div className="text-truncate">
          <h6 className="fw-bold text-dark mb-0 text-truncate">{traveler.full_name || 'Traveler'}</h6>
          <div className="text-muted extra-small text-truncate">{traveler.email}</div>
          {traveler.bio && <p className="small text-secondary mb-0 mt-1 text-truncate">{traveler.bio}</p>}
        </div>
      </Link>

      {!isSelf && (
        <button
          onClick={() => onFollowToggle(traveler.id, traveler.is_following)}
          className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold transition-all flex-shrink-0 shadow-none ${
            traveler.is_following ? 'btn-outline-secondary' : 'btn-primary'
          }`}
        >
          {traveler.is_following ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
}
