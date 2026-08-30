import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import PostGrid from '../components/social/PostGrid';
import LoadingSpinner from '../components/social/LoadingSpinner';

export default function TravelerProfile() {
  const { userId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSelf = user?.id === userId || userId === 'me';

  const fetchTravelerData = useCallback(async () => {
    if (!token || !userId) return;
    try {
      setLoading(true);
      setError('');
      const prof = await socialService.getProfile(token, userId);
      setProfile(prof);

      const userPosts = await socialService.getUserPosts(token, userId);
      setPosts(userPosts || []);
    } catch (err) {
      setError(err.message || 'Unable to load traveler profile.');
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (isSelf) {
      navigate('/profile', { replace: true });
      return;
    }
    fetchTravelerData();
  }, [isSelf, navigate, fetchTravelerData]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    const currentlyFollowing = profile.is_following;
    setProfile(prev => ({
      ...prev,
      is_following: !currentlyFollowing,
      followers_count: currentlyFollowing ? Math.max(0, (prev.followers_count || 1) - 1) : (prev.followers_count || 0) + 1
    }));

    try {
      if (currentlyFollowing) {
        await socialService.unfollowUser(token, profile.id);
      } else {
        await socialService.followUser(token, profile.id);
      }
    } catch {
      fetchTravelerData();
    }
  };

  const getInitial = () => {
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
    if (profile?.email) return profile.email.charAt(0).toUpperCase();
    return 'T';
  };

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12" style={{ maxWidth: '860px' }}>
          {loading && <LoadingSpinner text="Loading traveler passport..." />}

          {!loading && error && (
            <div className="glass-card p-5 text-center my-4">
              <i className="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
              <h4 className="fw-bold text-white font-heading">{error}</h4>
              <p className="text-muted small mb-4">This profile may not exist or is currently unavailable.</p>
              <Link to="/travelers" className="gradient-btn text-decoration-none">
                Explore Other Explorers
              </Link>
            </div>
          )}

          {!loading && !error && profile && (
            <>
              {/* Profile Card Header */}
              <div className="glass-card overflow-hidden mb-4 position-relative">
                
                {/* Banner */}
                <div 
                  className="w-100 position-relative" 
                  style={{ 
                    height: '160px', 
                    background: 'linear-gradient(135deg, rgba(0, 166, 251, 0.4) 0%, rgba(6, 214, 160, 0.3) 100%), url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&auto=format&fit=crop&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="position-absolute bottom-0 start-0 end-0 p-3" style={{ background: 'linear-gradient(to top, var(--tn-bg-deep), transparent)' }}></div>
                </div>

                <div className="p-4 p-sm-5 pt-0 position-relative" style={{ marginTop: '-50px' }}>
                  <div className="row align-items-end">
                    
                    {/* Avatar */}
                    <div className="col-12 col-sm-auto text-center text-sm-start mb-3 mb-sm-0">
                      <div className="position-relative d-inline-block">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name || 'Traveler'}
                            className="rounded-circle object-fit-cover shadow-lg mx-auto d-block"
                            style={{ width: '100px', height: '100px', border: '3px solid var(--tn-bg-deep)' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-lg mx-auto"
                            style={{ width: '100px', height: '100px', fontSize: '2.5rem', background: 'linear-gradient(135deg, var(--tn-primary), var(--tn-secondary))', color: '#fff', border: '3px solid var(--tn-bg-deep)' }}
                          >
                            {getInitial()}
                          </div>
                        )}

                        <span className="position-absolute bottom-0 end-0 badge rounded-pill bg-success p-1 shadow" title="Verified Adventurer">
                          <i className="bi bi-patch-check-fill text-white fs-6"></i>
                        </span>
                      </div>
                    </div>

                    {/* Bio & Details */}
                    <div className="col-12 col-sm text-center text-sm-start">
                      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                        <div>
                          <h3 className="fw-bold text-white mb-0 font-heading">
                            {profile.full_name || 'Traveler'}
                          </h3>
                          <span className="text-muted small">@{profile.username || (profile.email ? profile.email.split('@')[0] : 'explorer')}</span>
                        </div>

                        <button
                          onClick={handleFollowToggle}
                          className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold transition-all ${
                            profile.is_following ? 'btn-outline-secondary text-light' : 'gradient-btn'
                          }`}
                        >
                          {profile.is_following ? (
                            <>
                              <i className="bi bi-check2 me-1"></i> Following
                            </>
                          ) : (
                            <>
                              <i className="bi bi-person-plus-fill me-1"></i> Follow
                            </>
                          )}
                        </button>
                      </div>

                      {profile.bio && (
                        <p className="text-light mt-2 mb-3 small" style={{ maxWidth: '520px' }}>
                          {profile.bio}
                        </p>
                      )}

                      {/* Travel Stats Row */}
                      <div className="d-flex align-items-center justify-content-center justify-content-sm-start gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--tn-border)' }}>
                        <div className="text-center text-sm-start">
                          <div className="fw-bold text-white fs-5">{profile.posts_count || 0}</div>
                          <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>Moments</div>
                        </div>
                        <div className="text-center text-sm-start">
                          <div className="fw-bold text-white fs-5">{profile.followers_count || 0}</div>
                          <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>Followers</div>
                        </div>
                        <div className="text-center text-sm-start">
                          <div className="fw-bold text-white fs-5">{profile.following_count || 0}</div>
                          <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>Following</div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Photo Gallery Grid */}
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold text-white mb-0 font-heading">
                    <i className="bi bi-grid-3x3 me-2 text-info"></i>Shared Moments
                  </h5>
                  <span className="badge bg-dark text-muted rounded-pill px-3 py-2 border" style={{ borderColor: 'var(--tn-border)' }}>
                    {posts.length} {posts.length === 1 ? 'Capture' : 'Captures'}
                  </span>
                </div>

                <PostGrid posts={posts} />
              </div>
            </>
          )}
        </div>
      </div>
    </SocialLayout>
  );
}
