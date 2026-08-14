import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import TravelerCard from '../components/social/TravelerCard';
import LoadingSpinner from '../components/social/LoadingSpinner';

export default function Travelers() {
  const { token, user } = useAuth();
  const [travelers, setTravelers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTravelers = async (q = '') => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await socialService.getTravelers(token, q);
      setTravelers(data || []);
    } catch (err) {
      console.warn('Failed to load travelers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelers(search);
  }, [token, search]);

  const handleFollowToggle = async (tId, isFollowing) => {
    setTravelers(prev => prev.map(t => {
      if (t.id === tId) {
        return { ...t, is_following: !isFollowing };
      }
      return t;
    }));

    try {
      if (isFollowing) {
        await socialService.unfollowUser(token, tId);
      } else {
        await socialService.followUser(token, tId);
      }
    } catch {
      fetchTravelers(search);
    }
  };

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8" style={{ maxWidth: '680px' }}>
          <div className="mb-4">
            <h2 className="fw-bold text-dark mb-1">Discover Travelers</h2>
            <span className="text-secondary small">Connect with globetrotters and travel enthusiasts</span>
          </div>

          {/* Search Input */}
          <div className="mb-4 position-relative">
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
            <input
              type="text"
              className="form-control rounded-4 py-3 ps-5 bg-white shadow-sm border-0"
              placeholder="Search travelers by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading && <LoadingSpinner text="Searching travelers..." />}

          {!loading && travelers.length === 0 && (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-3">
              <h5 className="fw-bold text-dark">No travelers found</h5>
              <p className="text-secondary small mb-0">Try searching for a different traveler name</p>
            </div>
          )}

          {!loading && travelers.map((t) => (
            <TravelerCard
              key={t.id}
              traveler={t}
              isSelf={user?.id === t.id}
              onFollowToggle={handleFollowToggle}
            />
          ))}
        </div>
      </div>
    </SocialLayout>
  );
}
