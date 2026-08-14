import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const fetchSaved = async () => {
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
  };

  useEffect(() => {
    fetchSaved();
  }, [token]);

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
        <div className="col-12" style={{ maxWidth: '860px' }}>
          <div className="d-flex align-items-center justify-content-between mb-4 pb-2">
            <div>
              <h2 className="fw-bold text-dark mb-0">Saved Moments</h2>
              <span className="text-secondary small">Your bookmarked journeys and travel inspirations</span>
            </div>
          </div>

          {loading && <LoadingSpinner text="Loading your saved travel moments..." />}

          {!loading && error && (
            <div className="alert alert-danger border-0 rounded-4 p-4 shadow-sm" role="alert">
              <p className="mb-0 text-secondary">{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <EmptyState
              icon="bi-bookmark"
              title="No saved travel moments yet"
              message="Bookmark posts from your discovery feed to reference destinations and itineraries later."
              actionText="Explore Travel"
              actionLink="/home"
            />
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="row g-4">
              {posts.map((post) => (
                <div key={post.id} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white style-card">
                    <div className="position-relative" style={{ height: '220px', backgroundColor: '#0f172a' }}>
                      <img
                        src={post.image_url || travelBg}
                        alt={post.caption || 'Saved moment'}
                        onError={(e) => { e.target.src = travelBg; }}
                        className="w-100 h-100 object-fit-cover"
                      />
                      <button
                        onClick={() => handleUnsave(post.id)}
                        className="btn btn-light rounded-circle position-absolute top-0 end-0 m-2 p-2 shadow-sm"
                        title="Remove from saved"
                      >
                        <i className="bi bi-bookmark-fill text-primary"></i>
                      </button>
                    </div>
                    <div className="card-body p-3">
                      {post.destination && (
                        <div className="text-teal small fw-semibold mb-1">
                          <i className="bi bi-geo-alt-fill me-1"></i> {post.destination}
                        </div>
                      )}
                      {post.caption && (
                        <p className="card-text small text-secondary mb-0 text-truncate">
                          {post.caption}
                        </p>
                      )}
                      <div className="extra-small text-muted mt-2 pt-2 border-top">
                        By {post.author?.fullName || 'Traveler'}
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
