import React from 'react';
import travelBg from '../../assets/travel_bg.jpg';

export default function PostGrid({ posts = [], onPostClick }) {
  if (posts.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
        <i className="bi bi-camera display-3 text-secondary opacity-50 mb-2"></i>
        <h5 className="fw-bold text-dark">No moments posted</h5>
        <p className="text-secondary small mb-0">Travel posts and captured destinations will appear in this gallery.</p>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {posts.map((post) => (
        <div key={post.id} className="col-4">
          <div
            onClick={() => onPostClick && onPostClick(post)}
            className="rounded-3 overflow-hidden position-relative ratio ratio-1x1 shadow-sm style-card cursor-pointer"
            style={{ backgroundColor: '#0f172a', cursor: onPostClick ? 'pointer' : 'default' }}
          >
            <img
              src={post.image_url || travelBg}
              alt={post.caption || 'Travel moment'}
              onError={(e) => { e.target.src = travelBg; }}
              className="w-100 h-100 object-fit-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
