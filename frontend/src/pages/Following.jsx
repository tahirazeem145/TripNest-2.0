import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import PostCard from '../components/social/PostCard';
import LoadingSpinner from '../components/social/LoadingSpinner';
import EmptyState from '../components/social/EmptyState';

export default function Following() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFollowing = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const data = await socialService.getFollowingFeed(token);
      setPosts(data || []);
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
  };

  useEffect(() => {
    fetchFollowing();
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
      fetchFollowing();
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
      fetchFollowing();
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
          <div className="mb-4 pb-2">
            <h2 className="fw-bold text-dark mb-0">Following Feed</h2>
            <span className="text-secondary small">Latest stories from travelers you follow</span>
          </div>

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
              message="Discover passionate globetrotters and journey creators to start building your travel circle."
              actionText="Find Travelers"
              actionLink="/travelers"
            />
          )}

          {!loading && !error && posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onLike={handleLike}
              onSave={handleSave}
              onAddComment={handleAddComment}
              onLoadComments={handleLoadComments}
            />
          ))}
        </div>
      </div>
    </SocialLayout>
  );
}
