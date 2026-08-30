import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import LoadingSpinner from '../components/social/LoadingSpinner';
import EmptyState from '../components/social/EmptyState';
import travelBg from '../assets/travel_bg.jpg';

export default function Saved() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSaved = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const data = await socialService.getSavedPosts(token);
      setPosts(data || []);
    } catch (err) {
      if (err.message && err.message.includes('401')) {
        logout();
        navigate('/login');
      } else {
        setError(err.message || 'Unable to load saved moments.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleUnsave = async (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await socialService.unsavePost(token, postId);
    } catch {
      fetchSaved();
    }
  };

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12" style={{ maxWidth: '960px' }}>
          
          <div className="d-flex align-items-center justify-content-between mb-4 pb-2">
            <div>
              <h2 className="fw-bold text-white mb-1 font-heading">
                Saved <span className="gradient-text">Moments</span>
              </h2>
              <span className="text-muted small">Your personal bucket list & bookmarked inspirations</span>
            </div>
            <Link to="/home" className="btn btn-sm btn-outline-info rounded-pill px-3 py-1 fw-semibold">
              <i className="bi bi-compass me-1"></i>Discover More
            </Link>
          </div>

          {loading && <LoadingSpinner text="Retrieving your bookmarked wanderlust moments..." />}

          {!loading && error && (
            <div className="alert alert-danger border-0 rounded-4 p-4 shadow-sm" role="alert">
              <p className="mb-0 text-secondary">{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <EmptyState
              icon="bi-bookmark-heart"
              title="Your bucket list is empty"
              message="Bookmark captivating destinations, itineraries, and photo captures to reference whenever you travel."
              actionText="Explore Feed"
              actionLink="/home"
            />
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="row g-4">
              {posts.map((post) => (
                <div key={post.id} className="col-12 col-md-6 col-lg-4">
                  <div className="glass-card h-100 overflow-hidden d-flex flex-column">
                    <div className="position-relative" style={{ height: '220px', backgroundColor: '#050811' }}>
                      <img
                        src={post.image_url || travelBg}
                        alt={post.caption || 'Saved moment'}
                        onError={(e) => { e.target.src = travelBg; }}
                        className="w-100 h-100 object-fit-cover"
                      />
                      <button
                        onClick={() => handleUnsave(post.id)}
                        className="btn btn-dark rounded-circle position-absolute top-0 end-0 m-2 p-2 shadow border"
                        style={{ borderColor: 'var(--tn-border)' }}
                        title="Remove bookmark"
                      >
                        <i className="bi bi-bookmark-fill text-info"></i>
                      </button>
                    </div>
                    <div className="p-3 d-flex flex-column justify-content-between flex-grow-1">
                      <div>
                        {post.destination && (
                          <div className="small fw-semibold mb-1 text-info">
                            <i className="bi bi-geo-alt-fill me-1"></i> {post.destination}
                          </div>
                        )}
                        {post.caption && (
                          <p className="small text-light text-opacity-75 mb-2 text-truncate">
                            {post.caption}
                          </p>
                        )}
                      </div>
                      <div className="extra-small text-muted pt-2 d-flex align-items-center justify-content-between" style={{ borderTop: '1px solid var(--tn-border)', fontSize: '0.75rem' }}>
                        <span>Captured by {post.author?.fullName || 'Traveler'}</span>
                        <Link to={`/post/${post.id}`} className="text-info text-decoration-none fw-semibold">View</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SocialLayout>
  );
}
