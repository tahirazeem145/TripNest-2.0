import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import PostCard from '../components/social/PostCard';
import LoadingSpinner from '../components/social/LoadingSpinner';
import EmptyState from '../components/social/EmptyState';

const PAGE_SIZE = 10;

const FEATURED_STORIES = [
  { name: 'Sofia Chen', location: 'Santorini, Greece', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', active: true },
  { name: 'Kenji Sato', location: 'Kyoto, Japan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', active: true },
  { name: 'Elena Rossi', location: 'Amalfi, Italy', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', active: true },
  { name: 'Liam Walker', location: 'Swiss Alps', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', active: true },
  { name: 'Maya Patel', location: 'Bali, Indonesia', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', active: true },
  { name: 'Lucas Silva', location: 'Reykjavik, Iceland', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', active: false }
];

const DESTINATION_PILLS = [
  { name: 'All Destinations', filter: null },
  { name: '🏝️ Santorini, Greece', filter: 'Santorini' },
  { name: '🍋 Amalfi Coast, Italy', filter: 'Amalfi' },
  { name: '🌸 Kyoto, Japan', filter: 'Kyoto' },
  { name: '🏔️ Swiss Alps', filter: 'Swiss Alps' },
  { name: '🌴 Bali, Indonesia', filter: 'Bali' },
  { name: '🌋 Iceland', filter: 'Iceland' }
];

export default function Home() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Real-time "New posts available" indicator
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const latestPostIdRef = useRef(null);

  const fetchInitialFeed = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      setHasNewPosts(false);
      const data = await socialService.getHomeFeed(token, PAGE_SIZE, 0);
      setPosts(data || []);
      setOffset(data ? data.length : 0);
      setHasMore(data && data.length === PAGE_SIZE);
      if (data && data.length > 0) {
        latestPostIdRef.current = data[0].id;
      }
    } catch (err) {
      if (err.message && err.message.includes('401')) {
        logout();
        navigate('/login');
      } else {
        setError(err.message || 'Unable to load discovery feed.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore || !token) return;
    try {
      setLoadingMore(true);
      const data = await socialService.getHomeFeed(token, PAGE_SIZE, offset);
      if (data && data.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = data.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
        setOffset((prev) => prev + data.length);
        setHasMore(data.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more posts', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, token, offset]);

  // Check for new posts periodically without disturbing scroll position (every 40s)
  useEffect(() => {
    if (!token) return;
    const checkNewPosts = async () => {
      try {
        const latest = await socialService.getHomeFeed(token, 1, 0);
        if (latest && latest.length > 0 && latestPostIdRef.current) {
          if (latest[0].id !== latestPostIdRef.current) {
            setHasNewPosts(true);
          }
        }
      } catch {
        // Non-fatal
      }
    };

    const interval = setInterval(checkNewPosts, 40000);
    return () => clearInterval(interval);
  }, [token]);

  // Scroll listener for Infinite Pagination
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 400) {
      if (!loading && !loadingMore && hasMore) {
        loadMorePosts();
      }
    }
  }, [loading, loadingMore, hasMore, loadMorePosts]);

  useEffect(() => {
    fetchInitialFeed();
  }, [fetchInitialFeed]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Optimistic Like with rollback
  const handleLike = async (postId, isLiked) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            is_liked: !isLiked,
            likes_count: isLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1
          };
        }
        return p;
      })
    );

    try {
      if (isLiked) {
        await socialService.unlikePost(token, postId);
      } else {
        await socialService.likePost(token, postId);
      }
    } catch {
      // Rollback optimistic state
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              is_liked: isLiked,
              likes_count: isLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1)
            };
          }
          return p;
        })
      );
    }
  };

  // Optimistic Save with rollback
  const handleSave = async (postId, isSaved) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, is_saved: !isSaved };
        }
        return p;
      })
    );

    try {
      if (isSaved) {
        await socialService.unsavePost(token, postId);
      } else {
        await socialService.savePost(token, postId);
      }
    } catch {
      // Rollback
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return { ...p, is_saved: isSaved };
          }
          return p;
        })
      );
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this travel post? This action cannot be undone.')) return;
    const previousPosts = [...posts];
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await socialService.deletePost(token, postId);
    } catch {
      alert('Unable to delete post. Please try again.');
      setPosts(previousPosts);
    }
  };

  const handleLoadComments = async (postId) => {
    return await socialService.getComments(token, postId);
  };

  const handleAddComment = async (postId, content, parentId = null) => {
    try {
      const comment = await socialService.addComment(token, postId, content, parentId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
      );
      return comment;
    } catch {
      alert('Failed to post comment. Please try again.');
      return null;
    }
  };

  const handleRefreshNewPosts = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchInitialFeed();
  };

  const filteredPosts = selectedDestination
    ? posts.filter(p => p.destination && p.destination.toLowerCase().includes(selectedDestination.toLowerCase()))
    : posts;

  return (
    <SocialLayout>
      <div className="row g-4">
        
        {/* Main Feed Column */}
        <div className="col-12 col-xl-8">
          
          {/* Header Banner */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-2">
            <div>
              <h2 className="fw-bold text-white mb-1 font-heading">
                Discover <span className="gradient-text">Moments</span>
              </h2>
              <span className="text-muted small">Live wanderlust stories & captures from global travelers</span>
            </div>
            <Link
              to="/create"
              className="gradient-btn d-none d-sm-flex align-items-center gap-2 text-decoration-none shadow-sm"
            >
              <i className="bi bi-plus-circle-fill fs-5"></i>
              <span>Share Journey</span>
            </Link>
          </div>

          {/* Active Traveler Stories Strip */}
          <div className="glass-card p-3 mb-4 overflow-hidden">
            <div className="d-flex align-items-center justify-content-between mb-2 px-1">
              <span className="extra-small fw-bold text-uppercase tracking-wider" style={{ color: 'var(--tn-secondary)', fontSize: '0.75rem' }}>
                <i className="bi bi-lightning-charge-fill me-1"></i>Active Traveler Stories
              </span>
              <span className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>Updated live</span>
            </div>
            <div className="d-flex align-items-center gap-3 overflow-x-auto pb-2 pt-1 px-1" style={{ scrollbarWidth: 'none' }}>
              {FEATURED_STORIES.map((story, idx) => (
                <div key={idx} className="d-flex flex-column align-items-center flex-shrink-0 cursor-pointer" style={{ width: '72px' }}>
                  <div className={story.active ? 'story-ring-wrapper' : 'p-1 rounded-circle bg-secondary bg-opacity-25'}>
                    <img
                      src={story.avatar}
                      alt={story.name}
                      className="rounded-circle object-fit-cover"
                      style={{ width: '56px', height: '56px', border: '2px solid var(--tn-bg-deep)' }}
                    />
                  </div>
                  <span className="text-white extra-small text-truncate mt-1 w-100 text-center" style={{ fontSize: '0.7rem' }}>
                    {story.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Destination Filter Pills */}
          <div className="d-flex align-items-center gap-2 overflow-x-auto pb-3 mb-3" style={{ scrollbarWidth: 'none' }}>
            {DESTINATION_PILLS.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDestination(pill.filter)}
                className={`destination-pill border-0 ${selectedDestination === pill.filter ? 'active' : ''}`}
              >
                {pill.name}
              </button>
            ))}
          </div>

          {/* Floating 'New Posts Available' Banner */}
          {hasNewPosts && (
            <div className="text-center mb-3 sticky-top" style={{ top: '80px', zIndex: 10 }}>
              <button
                onClick={handleRefreshNewPosts}
                className="gradient-btn btn-sm rounded-pill px-4 py-2 shadow-lg fw-semibold"
              >
                <i className="bi bi-arrow-up-circle me-2"></i>New moments available • Refresh feed
              </button>
            </div>
          )}

          {loading && <LoadingSpinner text="Curating immersive travel inspirations..." />}

          {!loading && error && (
            <div className="alert alert-danger border-0 rounded-4 p-4 shadow-sm" role="alert">
              <p className="mb-0 text-secondary">{error}</p>
            </div>
          )}

          {!loading && !error && filteredPosts.length === 0 && (
            <EmptyState
              icon="bi-compass"
              title="No travel posts found"
              message={selectedDestination ? `No moments shared for ${selectedDestination} yet. Be the first explorer to share!` : "Be the first traveler to post a moment, or follow others to build your discovery timeline."}
              actionText="Share First Journey"
              actionLink="/create"
            />
          )}

          {!loading &&
            !error &&
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onLike={handleLike}
                onSave={handleSave}
                onDelete={handleDeletePost}
                onAddComment={handleAddComment}
                onLoadComments={handleLoadComments}
              />
            ))}

          {/* Infinite Scroll Indicator & Caught Up Message */}
          {loadingMore && (
            <div className="py-4 text-center">
              <span className="spinner-border spinner-border-sm text-info me-2"></span>
              <span className="text-muted small">Loading more travel moments...</span>
            </div>
          )}

          {!loading && !error && filteredPosts.length > 0 && !hasMore && (
            <div className="py-4 text-center border-top my-3" style={{ borderColor: 'var(--tn-border)' }}>
              <div className="mb-2">
                <i className="bi bi-check2-circle text-info fs-3"></i>
              </div>
              <h6 className="fw-bold text-white mb-1">You're all caught up</h6>
              <p className="text-muted extra-small mb-0">You've explored all the latest wanderlust stories</p>
            </div>
          )}
        </div>

        {/* Desktop Right Discovery Sidebar */}
        <div className="d-none d-xl-block col-xl-4">
          <div className="sticky-top" style={{ top: '24px' }}>
            
            {/* Trending Destinations Card */}
            <div className="glass-card p-4 mb-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold text-white mb-0 font-heading">
                  <i className="bi bi-fire text-warning me-2"></i>Trending Destinations
                </h6>
                <Link to="/travelers" className="extra-small text-info text-decoration-none" style={{ fontSize: '0.75rem' }}>View Map</Link>
              </div>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-3 p-2 rounded-3 hover-bg" style={{ transition: 'background 0.2s ease' }}>
                  <img
                    src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=120&auto=format&fit=crop&q=80"
                    alt="Santorini"
                    className="rounded-3 object-fit-cover flex-shrink-0"
                    style={{ width: '56px', height: '56px' }}
                  />
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="fw-bold small text-white text-truncate">Santorini, Greece</div>
                    <div className="text-muted extra-small">1,420 travelers shared</div>
                  </div>
                  <span className="badge bg-primary bg-opacity-25 text-info rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>+28%</span>
                </div>

                <div className="d-flex align-items-center gap-3 p-2 rounded-3 hover-bg">
                  <img
                    src="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=120&auto=format&fit=crop&q=80"
                    alt="Amalfi Coast"
                    className="rounded-3 object-fit-cover flex-shrink-0"
                    style={{ width: '56px', height: '56px' }}
                  />
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="fw-bold small text-white text-truncate">Amalfi Coast, Italy</div>
                    <div className="text-muted extra-small">980 travelers shared</div>
                  </div>
                  <span className="badge bg-primary bg-opacity-25 text-info rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>+19%</span>
                </div>

                <div className="d-flex align-items-center gap-3 p-2 rounded-3 hover-bg">
                  <img
                    src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=120&auto=format&fit=crop&q=80"
                    alt="Kyoto"
                    className="rounded-3 object-fit-cover flex-shrink-0"
                    style={{ width: '56px', height: '56px' }}
                  />
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="fw-bold small text-white text-truncate">Kyoto, Japan</div>
                    <div className="text-muted extra-small">850 travelers shared</div>
                  </div>
                  <span className="badge bg-primary bg-opacity-25 text-info rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>+15%</span>
                </div>
              </div>
            </div>

            {/* Top Explorers Widget */}
            <div className="glass-card p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold text-white mb-0 font-heading">
                  <i className="bi bi-compass text-info me-2"></i>Top Explorers
                </h6>
                <Link to="/travelers" className="extra-small text-info text-decoration-none" style={{ fontSize: '0.75rem' }}>See All</Link>
              </div>

              <div className="d-flex flex-column gap-3">
                {FEATURED_STORIES.slice(0, 3).map((explorer, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                      <img
                        src={explorer.avatar}
                        alt={explorer.name}
                        className="rounded-circle object-fit-cover flex-shrink-0"
                        style={{ width: '40px', height: '40px' }}
                      />
                      <div className="overflow-hidden">
                        <div className="fw-bold small text-white text-truncate">{explorer.name}</div>
                        <div className="text-muted extra-small text-truncate" style={{ fontSize: '0.7rem' }}>{explorer.location}</div>
                      </div>
                    </div>
                    <button className="btn btn-sm btn-outline-info rounded-pill px-3 py-1 extra-small fw-semibold" style={{ fontSize: '0.75rem' }}>
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </SocialLayout>
  );
}
