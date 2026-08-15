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
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  // Carousel index for multi-image posts
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const mediaList =
    post.media && post.media.length > 0
      ? post.media
      : post.image_url
      ? [{ media_url: post.image_url }]
      : [{ media_url: travelBg }];

  const totalImages = mediaList.length;

  const handleNextImage = (e) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev + 1) % totalImages);
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setActiveMediaIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

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

  const handleDoubleTap = () => {
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 900);
    if (!post.is_liked) {
      onLike(post.id, false);
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
        <div className="d-flex align-items-center">
          <Link
            to={isOwner ? '/profile' : `/profile/${post.userId}`}
            className="d-flex align-items-center text-decoration-none text-dark me-2"
          >
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 flex-shrink-0"
              style={{ width: '42px', height: '42px' }}
            >
              {post.author?.fullName ? post.author.fullName.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <h6 className="fw-bold mb-0 text-dark">{post.author?.fullName || 'Traveler'}</h6>
            </div>
          </Link>

          {post.destination && (
            <Link
              to={`/explore/destination/${encodeURIComponent(post.destination)}`}
              className="text-teal small fw-medium text-decoration-none ms-1"
            >
              <i className="bi bi-geo-alt-fill me-1"></i>{post.destination}
            </Link>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted extra-small">{formatDate(post.created_at)}</span>
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="btn btn-sm btn-link text-danger p-0 ms-2"
              aria-label="Delete post"
              title="Delete post"
            >
              <i className="bi bi-trash3"></i>
            </button>
          )}
        </div>
      </div>

      {/* Post Image Container with Multi-Image Carousel & Double-Tap Like */}
      <div
        className="w-100 position-relative user-select-none overflow-hidden"
        style={{ minHeight: '340px', maxHeight: '560px', backgroundColor: '#0f172a', cursor: 'pointer' }}
        onDoubleClick={handleDoubleTap}
      >
        <img
          src={mediaList[activeMediaIndex]?.media_url || travelBg}
          alt={post.caption ? `${post.caption} - ${post.destination || 'Travel Post'}` : 'Travel Moment'}
          loading="lazy"
          onError={(e) => { e.target.src = travelBg; }}
          className="w-100 h-100 object-fit-cover d-block"
          style={{ maxHeight: '560px', transition: 'transform 0.3s ease' }}
        />

        {/* Multi-Image Counter Badge */}
        {totalImages > 1 && (
          <div
            className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 rounded-pill px-3 py-2 text-white"
            style={{ fontSize: '0.75rem', zIndex: 5 }}
          >
            {activeMediaIndex + 1} / {totalImages}
          </div>
        )}

        {/* Carousel Previous Button */}
        {totalImages > 1 && activeMediaIndex > 0 && (
          <button
            type="button"
            onClick={handlePrevImage}
            className="btn btn-dark btn-sm bg-opacity-50 text-white rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2 p-2 border-0"
            style={{ width: '32px', height: '32px', zIndex: 6 }}
            aria-label="Previous photo"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
        )}

        {/* Carousel Next Button */}
        {totalImages > 1 && activeMediaIndex < totalImages - 1 && (
          <button
            type="button"
            onClick={handleNextImage}
            className="btn btn-dark btn-sm bg-opacity-50 text-white rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 p-2 border-0"
            style={{ width: '32px', height: '32px', zIndex: 6 }}
            aria-label="Next photo"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        )}

        {/* Carousel Dot Indicators */}
        {totalImages > 1 && (
          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1" style={{ zIndex: 5 }}>
            {mediaList.map((_, i) => (
              <span
                key={i}
                className={`rounded-circle d-inline-block transition-all ${
                  activeMediaIndex === i ? 'bg-white shadow' : 'bg-white bg-opacity-50'
                }`}
                style={{ width: activeMediaIndex === i ? '8px' : '6px', height: activeMediaIndex === i ? '8px' : '6px' }}
              ></span>
            ))}
          </div>
        )}

        {/* Floating Heart Pop Animation on Double-Tap */}
        {showHeartAnim && (
          <div
            className="position-absolute top-50 start-50 translate-middle text-white pointer-events-none d-flex align-items-center justify-content-center"
            style={{
              animation: 'heartPop 0.85s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              zIndex: 10
            }}
          >
            <i className="bi bi-heart-fill text-danger drop-shadow" style={{ fontSize: '5.5rem' }}></i>
          </div>
        )}
      </div>

      {/* Post Actions & Details */}
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-3">
            {/* Like */}
            <button
              onClick={() => onLike(post.id, post.is_liked)}
              className="btn border-0 p-0 text-decoration-none d-flex align-items-center gap-1 focus-ring-none"
              aria-label={post.is_liked ? "Unlike post" : "Like post"}
            >
              <i className={`bi ${post.is_liked ? 'bi-heart-fill text-danger' : 'bi-heart text-dark'} fs-4 transition-transform`}></i>
              <span className="fw-bold small text-dark">{post.likes_count || 0}</span>
            </button>

            {/* Comment Toggle */}
            <button
              onClick={handleToggleComments}
              className="btn border-0 p-0 text-decoration-none d-flex align-items-center gap-1 focus-ring-none"
              aria-label="Open comments"
            >
              <i className="bi bi-chat fs-4 text-dark"></i>
              <span className="fw-bold small text-dark">{post.comments_count || 0}</span>
            </button>
          </div>

          {/* Save / Bookmark */}
          <button
            onClick={() => onSave(post.id, post.is_saved)}
            className="btn border-0 p-0 text-decoration-none focus-ring-none"
            aria-label={post.is_saved ? "Unsave post" : "Save post"}
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
            aria-label="View all comments"
          >
            View all {post.comments_count} comments
          </button>
        )}

        {/* Expanded Comments */}
        {showComments && (
          <div className="mt-2 pt-2 border-top">
            <CommentSection
              comments={comments}
              postId={post.id}
              loading={loadingComments}
              onAddComment={handleAddCommentLocal}
            />
          </div>
        )}
      </div>
    </article>
  );
}
