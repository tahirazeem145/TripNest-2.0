import React from 'react';
import { Link } from 'react-router-dom';

export default function TravelerCard({ traveler, isSelf, onFollowToggle }) {
  const initial = traveler.full_name
    ? traveler.full_name.charAt(0).toUpperCase()
    : traveler.email
    ? traveler.email.charAt(0).toUpperCase()
    : 'T';

  return (
    <div className="glass-card p-3 mb-3 d-flex flex-row align-items-center justify-content-between">
      <Link to={`/profile/${traveler.id}`} className="text-decoration-none d-flex align-items-center me-3 flex-grow-1 overflow-hidden">
        {traveler.avatar_url ? (
          <img
            src={traveler.avatar_url}
            alt={traveler.full_name || 'Traveler'}
            className="rounded-circle object-fit-cover me-3 flex-shrink-0"
            style={{ width: '52px', height: '52px', border: '2px solid var(--tn-primary)' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 flex-shrink-0 text-white"
            style={{ width: '52px', height: '52px', fontSize: '1.2rem', background: 'linear-gradient(135deg, var(--tn-primary), var(--tn-secondary))' }}
          >
            {initial}
          </div>
        )}

        <div className="text-truncate">
          <div className="d-flex align-items-center gap-1">
            <h6 className="fw-bold text-white mb-0 text-truncate font-heading">{traveler.full_name || 'Traveler'}</h6>
            <i className="bi bi-patch-check-fill text-success extra-small" title="Verified Adventurer"></i>
          </div>
          <div className="text-muted extra-small text-truncate" style={{ fontSize: '0.75rem' }}>@{traveler.username || (traveler.email ? traveler.email.split('@')[0] : 'explorer')}</div>
          {traveler.bio && <p className="small text-light text-opacity-75 mb-0 mt-1 text-truncate" style={{ fontSize: '0.8rem' }}>{traveler.bio}</p>}
        </div>
      </Link>

      {!isSelf && (
        <button
          onClick={() => onFollowToggle(traveler.id, traveler.is_following)}
          className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold transition-all flex-shrink-0 ${
            traveler.is_following ? 'btn-outline-secondary text-light' : 'gradient-btn'
          }`}
          style={{ fontSize: '0.85rem' }}
        >
          {traveler.is_following ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
}
