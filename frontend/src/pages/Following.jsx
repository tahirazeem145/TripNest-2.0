import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import PostCard from '../components/social/PostCard';
import LoadingSpinner from '../components/social/LoadingSpinner';
import EmptyState from '../components/social/EmptyState';

const PAGE_SIZE = 10;

export default function Following() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);

  // Real-time "New posts available" indicator
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const latestPostIdRef = useRef(null);

  const fetchInitialFollowing = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      setHasNewPosts(false);
      const data = await socialService.getFollowingFeed(token, PAGE_SIZE, 0);
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
        setError(err.message || 'Unable to load following feed.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  const loadMoreFollowing = useCallback(async () => {
    if (loadingMore || !hasMore || !token) return;
    try {
      setLoadingMore(true);
      const data = await socialService.getFollowingFeed(token, PAGE_SIZE, offset);
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

  // Check for new followed-user posts periodically without disturbing scroll position (every 40s)
  useEffect(() => {
    if (!token) return;
    const checkNewPosts = async () => {
      try {
        const latest = await socialService.getFollowingFeed(token, 1, 0);
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

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 400) {
      if (!loading && !loadingMore && hasMore) {
        loadMoreFollowing();
      }
    }
  }, [loading, loadingMore, hasMore, loadMoreFollowing]);

  useEffect(() => {
    fetchInitialFollowing();
  }, [fetchInitialFollowing]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
    fetchInitialFollowing();
  };

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8" style={{ maxWidth: '640px' }}>
          <div className="mb-4 pb-2">
            <h2 className="fw-bold text-dark mb-0">Following Feed</h2>
            <span className="text-secondary small">Latest stories from travelers you follow</span>
          </div>

          {/* Floating 'New Posts Available' Banner */}
          {hasNewPosts && (
            <div className="text-center mb-3 sticky-top" style={{ top: '80px', zIndex: 10 }}>
              <button
                onClick={handleRefreshNewPosts}
                className="btn btn-primary btn-sm rounded-pill px-4 py-2 shadow-lg fw-semibold animate-bounce"
              >
                <i className="bi bi-arrow-up-circle me-2"></i>New moments available • Click to refresh
              </button>
            </div>
          )}

          {loading && <LoadingSpinner text="Loading stories from your travel network..." />}

          {!loading && error && (
            <div className="alert alert-danger border-0 rounded-4 p-4 shadow-sm" role="alert">
              <p className="mb-0 text-secondary">{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <EmptyState
              icon="bi-people"
              title="Your following feed is empty"
              message="Follow travelers to build your personal travel stream."
              actionText="Discover Travelers"
              actionLink="/travelers"
            />
          )}

          {!loading &&
            !error &&
            posts.map((post) => (
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

          {loadingMore && (
            <div className="py-4 text-center">
              <span className="spinner-border spinner-border-sm text-primary me-2"></span>
              <span className="text-secondary small">Loading more stories...</span>
            </div>
          )}

          {!loading && !error && posts.length > 0 && !hasMore && (
            <div className="py-4 text-center border-top my-3">
              <div className="mb-2">
                <i className="bi bi-check2-circle text-primary fs-3"></i>
              </div>
              <h6 className="fw-bold text-dark mb-1">You're all caught up</h6>
              <p className="text-muted extra-small mb-0">You've seen all posts from travelers you follow</p>
            </div>
          )}
        </div>
      </div>
    </SocialLayout>
  );
}
