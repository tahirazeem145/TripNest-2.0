import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import TravelerCard from '../components/social/TravelerCard';
import PostGrid from '../components/social/PostGrid';
import LoadingSpinner from '../components/social/LoadingSpinner';

export default function Travelers() {
  const { token, user } = useAuth();

  const [activeTab, setActiveTab] = useState('all'); // all, traveler, destination, post
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Results
  const [travelers, setTravelers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [suggestedTravelers, setSuggestedTravelers] = useState([]);
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounce search term by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Initial Discover Data (Trending & Suggested)
  useEffect(() => {
    const loadInitialDiscovery = async () => {
      if (!token) return;
      try {
        setInitialLoading(true);
        const [suggested, tDests, tPosts] = await Promise.all([
          socialService.getSuggestedTravelers(token, 6).catch(() => []),
          socialService.getTrendingDestinations(token, 8).catch(() => []),
          socialService.getTrendingPosts(token, 12).catch(() => [])
        ]);
        setSuggestedTravelers(suggested || []);
        setTrendingDestinations(tDests || []);
        setTrendingPosts(tPosts || []);
      } catch (err) {
        console.warn('Failed to load initial discovery data:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialDiscovery();
  }, [token]);

  // Perform Real Search
  useEffect(() => {
    const executeSearch = async () => {
      if (!token) return;
      if (!debouncedQuery) {
        setTravelers([]);
        setPosts([]);
        setDestinations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await socialService.searchGlobal(token, debouncedQuery, activeTab, 15, 0);
        setTravelers(res.travelers || []);
        setPosts(res.posts || []);
        setDestinations(res.destinations || []);
      } catch {
        setError('Unable to perform search. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    executeSearch();
  }, [token, debouncedQuery, activeTab]);

  const handleFollowToggle = async (tId, isFollowing) => {
    const updater = (list) =>
      list.map((t) => (t.id === tId ? { ...t, is_following: !isFollowing } : t));

    setTravelers(updater);
    setSuggestedTravelers(updater);

    try {
      if (isFollowing) {
        await socialService.unfollowUser(token, tId);
      } else {
        await socialService.followUser(token, tId);
      }
    } catch {
      if (debouncedQuery) {
        const res = await socialService.searchGlobal(token, debouncedQuery, activeTab);
        setTravelers(res.travelers || []);
      }
    }
  };

  const isSearching = Boolean(debouncedQuery);

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12" style={{ maxWidth: '900px' }}>
          
          {/* Header & Global Search Bar */}
          <div className="mb-4">
            <h2 className="fw-bold text-white mb-1 font-heading">
              Explore & <span className="gradient-text">Discover</span>
            </h2>
            <span className="text-muted small">Find global adventurers, stunning destinations, and trending moments</span>
          </div>

          <div className="mb-4 position-relative">
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-info"></i>
            <input
              type="text"
              className="form-control rounded-pill py-3 ps-5 pe-5 shadow-sm"
              placeholder="Search explorers, destinations, scenic spots, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-muted shadow-none"
              >
                <i className="bi bi-x-circle-fill text-muted"></i>
              </button>
            )}
          </div>

          {/* Search Filters / Tabs */}
          {isSearching && (
            <div className="d-flex gap-2 overflow-auto pb-3 mb-4" style={{ scrollbarWidth: 'none' }}>
              {[
                { id: 'all', label: 'All Results', icon: 'bi-grid' },
                { id: 'traveler', label: 'Travelers', icon: 'bi-people' },
                { id: 'destination', label: 'Destinations', icon: 'bi-geo-alt' },
                { id: 'post', label: 'Moments', icon: 'bi-camera' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold text-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'gradient-btn'
                      : 'btn-dark bg-dark text-muted border'
                  }`}
                  style={{ borderColor: 'var(--tn-border)' }}
                >
                  <i className={`bi ${tab.icon} me-1`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Loading States */}
          {loading && <LoadingSpinner text="Searching TripNest wanderlust index..." />}

          {/* Error State */}
          {!loading && error && (
            <div className="alert alert-danger border-0 rounded-4 p-4 shadow-sm" role="alert">
              <p className="mb-0 text-secondary">{error}</p>
            </div>
          )}

          {/* SEARCH RESULTS VIEW */}
          {isSearching && !loading && (
            <div>
              {travelers.length === 0 && posts.length === 0 && destinations.length === 0 && (
                <div className="glass-card p-5 text-center my-3">
                  <i className="bi bi-search display-4 text-info opacity-50 mb-3"></i>
                  <h5 className="fw-bold text-white mb-1 font-heading">No matches found for "{debouncedQuery}"</h5>
                  <p className="text-muted small mb-0">Try searching for a different explorer name, island, or country.</p>
                </div>
              )}

              {/* Travelers Section */}
              {(activeTab === 'all' || activeTab === 'traveler') && travelers.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold text-white mb-0 font-heading">
                      <i className="bi bi-people-fill text-info me-2"></i>Travelers
                    </h5>
                    <span className="badge bg-dark text-muted rounded-pill px-3 py-2 border" style={{ borderColor: 'var(--tn-border)' }}>
                      {travelers.length} {travelers.length === 1 ? 'explorer' : 'explorers'}
                    </span>
                  </div>
                  {travelers.map((t) => (
                    <TravelerCard
                      key={t.id}
                      traveler={t}
                      isSelf={user?.id === t.id}
                      onFollowToggle={handleFollowToggle}
                    />
                  ))}
                </div>
              )}

              {/* Destinations Section */}
              {(activeTab === 'all' || activeTab === 'destination') && destinations.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold text-white mb-0 font-heading">
                      <i className="bi bi-geo-alt-fill text-success me-2"></i>Destinations
                    </h5>
                    <span className="badge bg-dark text-muted rounded-pill px-3 py-2 border" style={{ borderColor: 'var(--tn-border)' }}>
                      {destinations.length} {destinations.length === 1 ? 'place' : 'places'}
                    </span>
                  </div>
                  <div className="row g-3">
                    {destinations.map((dest) => (
                      <div key={dest.name} className="col-12 col-sm-6 col-md-4">
                        <Link
                          to={`/explore/destination/${encodeURIComponent(dest.name)}`}
                          className="glass-card overflow-hidden text-decoration-none d-block h-100"
                        >
                          <div style={{ height: '130px', backgroundColor: '#050811' }}>
                            {dest.sampleImageUrl ? (
                              <img
                                src={dest.sampleImageUrl}
                                alt={dest.name}
                                className="w-100 h-100 object-fit-cover opacity-75"
                              />
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                                <i className="bi bi-compass fs-1 text-info opacity-50"></i>
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <h6 className="fw-bold text-white mb-1 text-truncate font-heading">{dest.name}</h6>
                            <span className="extra-small text-muted" style={{ fontSize: '0.75rem' }}>
                              {dest.postCount} {dest.postCount === 1 ? 'Moment' : 'Moments'} Shared
                            </span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Moments Section */}
              {(activeTab === 'all' || activeTab === 'post') && posts.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold text-white mb-0 font-heading">
                      <i className="bi bi-camera-fill text-warning me-2"></i>Travel Moments
                    </h5>
                    <span className="badge bg-dark text-muted rounded-pill px-3 py-2 border" style={{ borderColor: 'var(--tn-border)' }}>
                      {posts.length} {posts.length === 1 ? 'capture' : 'captures'}
                    </span>
                  </div>
                  <PostGrid posts={posts} />
                </div>
              )}
            </div>
          )}

          {/* DEFAULT DISCOVERY VIEW */}
          {!isSearching && !initialLoading && (
            <div>
              {/* Suggested Travelers */}
              {suggestedTravelers.length > 0 && (
                <div className="mb-5">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold text-white mb-0 font-heading">
                      <i className="bi bi-person-plus-fill text-info me-2"></i>Suggested Explorers
                    </h5>
                  </div>
                  <div className="row g-3">
                    {suggestedTravelers.map((t) => (
                      <div key={t.id} className="col-12 col-sm-6">
                        <TravelerCard
                          traveler={t}
                          isSelf={user?.id === t.id}
                          onFollowToggle={handleFollowToggle}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Destinations Grid */}
              {trendingDestinations.length > 0 && (
                <div className="mb-5">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold text-white mb-0 font-heading">
                      <i className="bi bi-fire text-warning me-2"></i>Trending Destinations
                    </h5>
                  </div>
                  <div className="row g-3">
                    {trendingDestinations.map((dest) => (
                      <div key={dest.name} className="col-6 col-md-3">
                        <Link
                          to={`/explore/destination/${encodeURIComponent(dest.name)}`}
                          className="glass-card overflow-hidden text-decoration-none d-block h-100"
                        >
                          <div style={{ height: '120px', backgroundColor: '#050811' }}>
                            {dest.sampleImageUrl ? (
                              <img
                                src={dest.sampleImageUrl}
                                alt={dest.name}
                                className="w-100 h-100 object-fit-cover"
                              />
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                                <i className="bi bi-compass fs-2 text-info opacity-50"></i>
                              </div>
                            )}
                          </div>
                          <div className="p-2 text-center">
                            <h6 className="fw-bold text-white mb-0 text-truncate small font-heading">{dest.name}</h6>
                            <span className="extra-small text-muted" style={{ fontSize: '0.75rem' }}>{dest.postCount} Moments</span>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Moments Grid */}
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="fw-bold text-white mb-0 font-heading">
                      <i className="bi bi-compass-fill text-info me-2"></i>Explore Moments
                    </h5>
                    <span className="text-muted small">Real moments shared by the global community</span>
                  </div>
                  <Link to="/create" className="gradient-btn btn-sm text-decoration-none">
                    <i className="bi bi-plus-lg me-1"></i> Share Moment
                  </Link>
                </div>

                {trendingPosts.length === 0 ? (
                  <div className="glass-card p-5 text-center my-3">
                    <i className="bi bi-camera display-4 text-info opacity-50 mb-3"></i>
                    <h5 className="fw-bold text-white mb-1 font-heading">No moments shared yet</h5>
                    <p className="text-muted small mb-3">Be the first to share your journey on TripNest!</p>
                    <Link to="/create" className="gradient-btn btn-sm text-decoration-none">
                      Share Journey
                    </Link>
                  </div>
                ) : (
                  <PostGrid posts={trendingPosts} />
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </SocialLayout>
  );
}
