import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';
import PostCard from '../components/social/PostCard';
import LoadingSpinner from '../components/social/LoadingSpinner';

export default function PostDetail() {
  const { postId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPost = useCallback(async () => {
    if (!token || !postId) return;
    try {
      setLoading(true);
      setError('');
      const data = await socialService.getPostById(token, postId);
      setPost(data);
    } catch (err) {
      setError(err.message || 'Post not found or unavailable.');
    } finally {
      setLoading(false);
    }
  }, [token, postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async (pId, isLiked) => {
    setPost(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        is_liked: !isLiked,
        likes_count: isLiked ? Math.max(0, (prev.likes_count || 1) - 1) : (prev.likes_count || 0) + 1
      };
    });

    try {
      if (isLiked) {
        await socialService.unlikePost(token, pId);
      } else {
        await socialService.likePost(token, pId);
      }
    } catch {
      fetchPost();
    }
  };

  const handleSave = async (pId, isSaved) => {
    setPost(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        is_saved: !isSaved
      };
    });

    try {
      if (isSaved) {
        await socialService.unsavePost(token, pId);
      } else {
        await socialService.savePost(token, pId);
      }
    } catch {
      fetchPost();
    }
  };

  const handleAddComment = async (pId, content, parentId = null) => {
    const newComment = await socialService.addComment(token, pId, content, parentId);
    if (newComment) {
      setPost(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments_count: (prev.comments_count || 0) + 1
        };
      });
    }
    return newComment;
  };

  const handleDeletePost = async (pId) => {
    if (!window.confirm('Are you sure you want to delete this travel post? This action cannot be undone.')) {
      return;
    }

    try {
      await socialService.deletePost(token, pId);
      navigate('/home', { replace: true });
    } catch {
      alert('Failed to delete post. Please try again.');
    }
  };

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8" style={{ maxWidth: '720px' }}>
          {/* Back Navigation Bar */}
          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-dark btn-sm rounded-pill px-3 border"
              style={{ borderColor: 'var(--tn-border)' }}
            >
              <i className="bi bi-arrow-left me-1"></i> Back to Feed
            </button>
          </div>

          {loading && <LoadingSpinner text="Loading travel post..." />}

          {!loading && error && (
            <div className="glass-card p-5 text-center my-4">
              <i className="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
              <h5 className="fw-bold text-white font-heading">{error}</h5>
              <p className="text-muted small mb-4">The post you are looking for may have been removed or is private.</p>
              <Link to="/home" className="gradient-btn text-decoration-none">
                Explore Feed
              </Link>
            </div>
          )}

          {!loading && !error && post && (
            <PostCard
              post={post}
              currentUserId={user?.id}
              onLike={handleLike}
              onSave={handleSave}
              onAddComment={handleAddComment}
              onDelete={handleDeletePost}
            />
          )}
        </div>
      </div>
    </SocialLayout>
  );
}
