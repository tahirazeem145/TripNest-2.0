import React from 'react';
import { Link } from 'react-router-dom';
import travelBg from '../../assets/travel_bg.jpg';

export default function PostGrid({ posts = [], onPostClick }) {
  if (posts.length === 0) {
    return (
      <div className="glass-card p-5 text-center">
        <i className="bi bi-camera display-4 text-info opacity-50 mb-2"></i>
        <h5 className="fw-bold text-white font-heading">No moments posted</h5>
        <p className="text-muted small mb-0">Captured destinations and travel memories will appear in this passport gallery.</p>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {posts.map((post) => {
        const isMulti = post.media && post.media.length > 1;
        const thumbnail =
          post.media && post.media.length > 0
            ? post.media[0].media_url
            : post.image_url || travelBg;

        return (
          <div key={post.id} className="col-4">
            <Link
              to={`/post/${post.id}`}
              onClick={(e) => {
                if (onPostClick) {
                  e.preventDefault();
                  onPostClick(post);
                }
              }}
              className="rounded-4 overflow-hidden position-relative ratio ratio-1x1 glass-card d-block shadow"
              style={{ backgroundColor: '#060a12', border: '1px solid var(--tn-border)' }}
            >
              <img
                src={thumbnail}
                alt={post.caption || 'Travel moment'}
                loading="lazy"
                onError={(e) => { e.target.src = travelBg; }}
                className="w-100 h-100 object-fit-cover"
                style={{ transition: 'transform 0.3s ease' }}
              />

              {/* Multi-Image Indicator Icon */}
              {isMulti && (
                <div className="position-absolute top-0 end-0 m-2 text-white badge bg-dark bg-opacity-75 rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>
                  <i className="bi bi-images me-1"></i>Album
                </div>
              )}

              {/* Destination Tag & Overlay */}
              <div
                className="position-absolute bottom-0 start-0 end-0 p-2 text-white extra-small text-truncate d-flex align-items-center justify-content-between"
                style={{ background: 'linear-gradient(to top, rgba(6,10,18,0.9), transparent)', fontSize: '0.75rem' }}
              >
                {post.destination ? (
                  <span className="text-truncate">
                    <i className="bi bi-geo-alt-fill text-info me-1"></i>{post.destination}
                  </span>
                ) : (
                  <span>Moment</span>
                )}
                {post.likes_count > 0 && (
                  <span className="ms-1 text-danger">
                    <i className="bi bi-heart-fill me-1"></i>{post.likes_count}
                  </span>
                )}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
