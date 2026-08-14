import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';
import travelBg from '../../assets/travel_bg.jpg';

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onSave,
  onDelete,
  onAddComment,
  onLoadComments
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const handleToggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const list = await onLoadComments(post.id);
        setComments(list || []);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddCommentLocal = async (postId, content) => {
    const newComment = await onAddComment(postId, content);
    if (newComment) {
      setComments((prev) => [...prev, newComment]);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isOwner = currentUserId && post.userId === currentUserId;

  return (
    <article className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-white style-card">
      {/* Post Header: Author & Location */}
      <div className="card-header bg-white border-0 p-3 d-flex align-items-center justify-content-between">
        <Link to="/travelers" className="d-flex align-items-center text-decoration-none text-dark">
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 flex-shrink-0"
            style={{ width: '42px', height: '42px' }}
          >
            {post.author?.fullName ? post.author.fullName.charAt(0).toUpperCase() : 'T'}
          </div>
          <div>
            <h6 className="fw-bold mb-0 text-dark">{post.author?.fullName || 'Traveler'}</h6>
            {post.destination ? (
              <span className="text-teal small fw-medium">
                <i className="bi bi-geo-alt-fill me-1"></i> {post.destination}
              </span>
            ) : (
              <span className="text-muted extra-small">{formatDate(post.created_at)}</span>
            )}
          </div>
        </Link>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted extra-small">{formatDate(post.created_at)}</span>
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="btn btn-sm btn-link text-danger p-0 ms-2"
              title="Delete post"
            >
              <i className="bi bi-trash3"></i>
            </button>
          )}
        </div>
      </div>

      {/* Post Image with fallback */}
      <div
        className="w-100 position-relative"
        style={{ minHeight: '340px', maxHeight: '520px', backgroundColor: '#0f172a' }}
      >
        <img
          src={post.image_url || travelBg}
          alt={post.caption || 'Travel Moment'}
          onError={(e) => { e.target.src = travelBg; }}
          className="w-100 h-100 object-fit-cover d-block"
          style={{ maxHeight: '520px' }}
        />
      </div>

      {/* Post Actions & Details */}
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-3">
            {/* Like */}
            <button
              onClick={() => onLike(post.id, post.is_liked)}
              className="btn border-0 p-0 text-decoration-none d-flex align-items-center gap-1 focus-ring-none"
            >
              <i className={`bi ${post.is_liked ? 'bi-heart-fill text-danger' : 'bi-heart text-dark'} fs-4`}></i>
              <span className="fw-bold small text-dark">{post.likes_count || 0}</span>
            </button>

            {/* Comment Toggle */}
            <button
              onClick={handleToggleComments}
              className="btn border-0 p-0 text-decoration-none d-flex align-items-center gap-1 focus-ring-none"
            >
              <i className="bi bi-chat fs-4 text-dark"></i>
              <span className="fw-bold small text-dark">{post.comments_count || 0}</span>
            </button>
          </div>

          {/* Save / Bookmark */}
          <button
            onClick={() => onSave(post.id, post.is_saved)}
            className="btn border-0 p-0 text-decoration-none focus-ring-none"
          >
            <i className={`bi ${post.is_saved ? 'bi-bookmark-fill text-primary' : 'bi-bookmark text-dark'} fs-4`}></i>
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="card-text mb-2 text-dark">
            <strong className="me-2">{post.author?.fullName || 'Traveler'}</strong>
            {post.caption}
          </p>
        )}

        {/* Comments Counter Toggle */}
        {post.comments_count > 0 && !showComments && (
          <button
            onClick={handleToggleComments}
            className="btn border-0 p-0 text-muted extra-small mb-1 text-decoration-none"
          >
            View all {post.comments_count} comments
          </button>
        )}

        {/* Expanded Comments */}
        {showComments && (
          <CommentSection
            comments={comments}
            postId={post.id}
            onAddComment={handleAddCommentLocal}
          />
        )}
      </div>
    </article>
  );
}
