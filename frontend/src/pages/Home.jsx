import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import PostCard from '../components/social/PostCard';
import LoadingSpinner from '../components/social/LoadingSpinner';
import EmptyState from '../components/social/EmptyState';

export default function Home() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeed = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const data = await socialService.getHomeFeed(token);
      setPosts(data || []);
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
  };

  useEffect(() => {
    fetchFeed();
  }, [token]);

  const handleLike = async (postId, isLiked) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          is_liked: !isLiked,
          likes_count: isLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1
        };
      }
      return p;
    }));

    try {
      if (isLiked) {
        await socialService.unlikePost(token, postId);
      } else {
        await socialService.likePost(token, postId);
      }
    } catch {
      fetchFeed();
    }
  };

  const handleSave = async (postId, isSaved) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, is_saved: !isSaved };
      }
      return p;
    }));

    try {
      if (isSaved) {
        await socialService.unsavePost(token, postId);
      } else {
        await socialService.savePost(token, postId);
      }
    } catch {
      fetchFeed();
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this travel post?')) return;
    setPosts(prev => prev.filter(p => p.id !== postId));
    try {
      await socialService.deletePost(token, postId);
    } catch {
      fetchFeed();
    }
  };

  const handleLoadComments = async (postId) => {
    return await socialService.getComments(token, postId);
  };

  const handleAddComment = async (postId, content) => {
    try {
      const comment = await socialService.addComment(token, postId, content);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
      return comment;
    } catch {
      alert('Failed to post comment');
      return null;
    }
  };

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8" style={{ maxWidth: '640px' }}>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-2">
            <div>
              <h2 className="fw-bold text-dark mb-0">Discover Journeys</h2>
              <span className="text-secondary small">Trending stories & captures from global travelers</span>
            </div>
            <Link to="/create" className="btn btn-primary btn-sm rounded-pill px-3 py-1 fw-semibold d-none d-sm-flex align-items-center gap-1">
              <i className="bi bi-plus-lg"></i> Share
            </Link>
          </div>

          {loading && <LoadingSpinner text="Curating travel inspirations for you..." />}

          {!loading && error && (
            <div className="alert alert-danger border-0 rounded-4 p-4 shadow-sm" role="alert">
              <p className="mb-0 text-secondary">{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <EmptyState
              icon="bi-compass"
              title="No travel posts yet"
              message="Be the first traveler to post a moment, or follow others to build your discovery timeline."
              actionText="Create First Post"
              actionLink="/create"
            />
          )}

          {!loading && !error && posts.map((post) => (
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
        </div>
      </div>
    </SocialLayout>
  );
}
