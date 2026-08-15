import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import ProfileHeader from '../components/social/ProfileHeader';
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

  const fetchTravelerData = async () => {
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
  };

  useEffect(() => {
    if (isSelf) {
      navigate('/profile', { replace: true });
      return;
    }
    fetchTravelerData();
  }, [token, userId]);

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

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12" style={{ maxWidth: '820px' }}>
          {loading && <LoadingSpinner text="Loading traveler profile..." />}

          {!loading && error && (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
              <i className="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
              <h4 className="fw-bold text-dark">{error}</h4>
              <p className="text-secondary small mb-4">This profile may not exist or is currently unavailable.</p>
              <Link to="/travelers" className="btn btn-primary rounded-pill px-4">
                Explore Other Travelers
              </Link>
            </div>
          )}

          {!loading && !error && profile && (
            <>
              {/* Profile Card Header */}
              <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 mb-4 bg-white">
                <div className="row align-items-center">
                  <div className="col-12 col-sm-auto text-center mb-3 mb-sm-0">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || 'Traveler'}
                        className="rounded-circle object-fit-cover shadow-sm mx-auto d-block"
                        style={{ width: '96px', height: '96px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div
                        className="bg-teal text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm mx-auto"
                        style={{ width: '96px', height: '96px', fontSize: '2.5rem' }}
                      >
                        {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'T'}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-sm text-center text-sm-start ms-sm-3">
                    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mb-2">
                      <div>
                        <h3 className="fw-bold text-dark mb-0">{profile.full_name || 'Traveler'}</h3>
                        <span className="text-muted small">{profile.email}</span>
                      </div>
                      <div>
                        <button
                          onClick={handleFollowToggle}
                          className={`btn btn-sm rounded-pill px-4 fw-semibold shadow-none ${
                            profile.is_following ? 'btn-outline-secondary' : 'btn-primary'
                          }`}
                        >
                          {profile.is_following ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </div>

                    <p className={`small mb-3 ${profile.bio ? 'text-secondary' : 'text-muted fst-italic'}`}>
                      {profile.bio || 'No bio added yet.'}
                    </p>

                    <div className="d-flex justify-content-center justify-content-sm-start gap-4 pt-2 border-top">
                      <div>
                        <strong className="text-dark fs-5">{profile.posts_count || 0}</strong>
                        <span className="text-muted small ms-1">Posts</span>
                      </div>
                      <div>
                        <strong className="text-dark fs-5">{profile.followers_count || 0}</strong>
                        <span className="text-muted small ms-1">Followers</span>
                      </div>
                      <div>
                        <strong className="text-dark fs-5">{profile.following_count || 0}</strong>
                        <span className="text-muted small ms-1">Following</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shared Moments Grid */}
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="bi bi-grid-3x3 me-2"></i>Shared Travel Moments
                  </h5>
                  <span className="badge bg-light text-secondary rounded-pill px-3 py-2">
                    {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
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
