import React from 'react';
import { Link } from 'react-router-dom';
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
    <div className="row g-2 g-sm-3">
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
              className="rounded-3 overflow-hidden position-relative ratio ratio-1x1 shadow-sm style-card d-block"
              style={{ backgroundColor: '#0f172a' }}
            >
              <img
                src={thumbnail}
                alt={post.caption || 'Travel moment'}
                loading="lazy"
                onError={(e) => { e.target.src = travelBg; }}
                className="w-100 h-100 object-fit-cover"
              />

              {/* Multi-Image Indicator Icon */}
              {isMulti && (
                <div className="position-absolute top-0 end-0 m-2 text-white drop-shadow" title="Multiple photos">
                  <i className="bi bi-images fs-6"></i>
                </div>
              )}

              {/* Destination Tag */}
              {post.destination && (
                <div
                  className="position-absolute bottom-0 start-0 end-0 p-1 p-sm-2 text-white extra-small text-truncate"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
                >
                  <i className="bi bi-geo-alt-fill me-1"></i>
                  {post.destination}
                </div>
              )}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
