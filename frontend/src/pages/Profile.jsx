import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import ProfileHeader from '../components/social/ProfileHeader';
import PostGrid from '../components/social/PostGrid';
import LoadingSpinner from '../components/social/LoadingSpinner';

export default function Profile() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const prof = await socialService.getProfile(token, 'me');
      setProfile(prof);

      const userPosts = await socialService.getUserPosts(token, user?.id || prof.id);
      setPosts(userPosts || []);
    } catch (err) {
      console.warn('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [token]);

  const handleUpdateProfile = async (updates) => {
    try {
      const updated = await socialService.updateProfile(token, updates);
      setProfile(updated);
    } catch {
      alert('Failed to update profile');
    }
  };

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12" style={{ maxWidth: '820px' }}>
          {loading && <LoadingSpinner text="Loading profile..." />}

          {!loading && profile && (
            <>
              {/* Profile Header */}
              <ProfileHeader
                profile={profile}
                isCurrentUser={true}
                onUpdateProfile={handleUpdateProfile}
              />

              {/* Photo Gallery Grid */}
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="bi bi-grid-3x3 me-2"></i>My Shared Moments
                  </h5>
                  <Link to="/create" className="btn btn-primary btn-sm rounded-pill px-3">
                    <i className="bi bi-plus-lg me-1"></i> New Post
                  </Link>
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
