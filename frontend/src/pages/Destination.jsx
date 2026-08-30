import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import PostGrid from '../components/social/PostGrid';
import LoadingSpinner from '../components/social/LoadingSpinner';

export default function Destination() {
  const { destination } = useParams();
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDestinationPosts = useCallback(async () => {
    if (!token || !destination) return;
    try {
      setLoading(true);
      setError('');
      const data = await socialService.getPostsByDestination(token, destination);
      setPosts(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load destination posts.');
    } finally {
      setLoading(false);
    }
  }, [token, destination]);

  useEffect(() => {
    fetchDestinationPosts();
  }, [fetchDestinationPosts]);

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12" style={{ maxWidth: '960px' }}>
          
          {/* Destination Hero Banner */}
          <div className="glass-card p-4 p-md-5 mb-4 position-relative overflow-hidden">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge rounded-pill bg-info bg-opacity-25 text-info px-3 py-1">
                    <i className="bi bi-geo-alt-fill me-1"></i>Destination Guide
                  </span>
                  <span className="badge rounded-pill bg-success bg-opacity-25 text-success px-3 py-1">
                    <i className="bi bi-brightness-high-fill me-1"></i>26°C Sunny
                  </span>
                </div>
                <h2 className="fw-bold text-white mb-2 font-heading">{destination}</h2>
                <p className="text-muted small mb-0" style={{ maxWidth: '580px' }}>
                  Explore authentic captures, hidden lookout points, and travel recommendations from the TripNest community in {destination}.
                </p>
              </div>
              
              <div className="d-flex gap-2">
                <Link to="/create" className="gradient-btn btn-sm text-decoration-none">
                  <i className="bi bi-plus-lg me-1"></i> Tag This Place
                </Link>
              </div>
            </div>
          </div>

          {loading && <LoadingSpinner text={`Curating moments from ${destination}...`} />}

          {!loading && error && (
            <div className="glass-card p-5 text-center my-4">
              <h5 className="fw-bold text-white mb-1 font-heading">Unable to load posts</h5>
              <p className="text-muted small mb-3">{error}</p>
              <button onClick={fetchDestinationPosts} className="gradient-btn btn-sm">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="glass-card p-5 text-center my-4">
              <i className="bi bi-camera display-4 text-info opacity-50 mb-3"></i>
              <h5 className="fw-bold text-white mb-1 font-heading">No moments shared from {destination} yet</h5>
              <p className="text-muted small mb-4">Be the first explorer to share a photo and itinerary from {destination}!</p>
              <Link to="/create" className="gradient-btn text-decoration-none">
                <i className="bi bi-plus-lg me-1"></i> Share First Moment
              </Link>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold text-white mb-0 font-heading">
                  <i className="bi bi-grid-3x3 me-2 text-info"></i>Community Captures
                </h5>
                <span className="badge bg-dark text-muted rounded-pill px-3 py-2 border" style={{ borderColor: 'var(--tn-border)' }}>
                  {posts.length} {posts.length === 1 ? 'Moment' : 'Moments'}
                </span>
              </div>

              <PostGrid posts={posts} />
            </div>
          )}
        </div>
      </div>
    </SocialLayout>
  );
}
