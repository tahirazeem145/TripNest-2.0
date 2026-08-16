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
        <div className="col-12" style={{ maxWidth: '840px' }}>
          {/* Destination Header Banner */}
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-white">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-geo-alt-fill text-teal fs-3"></i>
                  <h2 className="fw-bold text-dark mb-0">{destination}</h2>
                </div>
                <span className="text-secondary small">
                  Explore real moments, itineraries, and photo captures from travelers in {destination}.
                </span>
              </div>
              <Link to="/travelers" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                <i className="bi bi-compass me-1"></i> Discover More
              </Link>
            </div>
          </div>

          {loading && <LoadingSpinner text={`Loading moments from ${destination}...`} />}

          {!loading && error && (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
              <h5 className="fw-bold text-dark mb-1">Unable to load posts</h5>
              <p className="text-secondary small mb-3">{error}</p>
              <button onClick={fetchDestinationPosts} className="btn btn-primary btn-sm rounded-pill px-4">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
              <i className="bi bi-camera display-4 text-secondary opacity-50 mb-3"></i>
              <h5 className="fw-bold text-dark mb-1">No moments shared from {destination} yet</h5>
              <p className="text-secondary small mb-4">Be the first traveler to share a photo and itinerary from {destination}!</p>
              <Link to="/create" className="btn btn-primary rounded-pill px-4">
                <i className="bi bi-plus-lg me-1"></i> Create First Post
              </Link>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold text-dark mb-0">
                  <i className="bi bi-grid-3x3 me-2"></i>Traveler Moments
                </h5>
                <span className="badge bg-light text-secondary rounded-pill px-3 py-2">
                  {posts.length} {posts.length === 1 ? 'Capture' : 'Captures'}
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
