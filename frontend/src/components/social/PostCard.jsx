import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from './CommentSection';
import { useAuth } from '../../context/AuthContext';
import { socialService } from '../../services/socialService';
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
  const { token } = useAuth();

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  // Carousel index for multi-image posts
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Touch & Mouse Drag Swipe State
  const [touchStart, setTouchStart] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const mediaList = React.useMemo(() => {
    let list = [];
    if (post.media && Array.isArray(post.media) && post.media.length > 0) {
      list = post.media.map(m => (typeof m === 'string' ? { media_url: m } : { media_url: m.media_url || m.url || m.imageUrl }));
    } else if (post.images && Array.isArray(post.images) && post.images.length > 0) {
      list = post.images.map(img => (typeof img === 'string' ? { media_url: img } : { media_url: img.media_url || img.url }));
    } else if (post.image_urls && Array.isArray(post.image_urls) && post.image_urls.length > 0) {
      list = post.image_urls.map(img => (typeof img === 'string' ? { media_url: img } : { media_url: img.media_url || img.url }));
    } else if (post.image_url) {
      const str = post.image_url.trim();
      if (str.startsWith('[') && str.endsWith(']')) {
        try {
          const parsed = JSON.parse(str);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed.map(url => ({ media_url: typeof url === 'string' ? url : (url.media_url || url.url) }));
          }
        } catch {
          list = [{ media_url: str }];
        }
      } else if (str.includes(',')) {
        list = str.split(',').map(url => ({ media_url: url.trim() })).filter(u => u.media_url);
      } else {
        list = [{ media_url: str }];
      }
    }
    return list.length > 0 ? list : [{ media_url: travelBg }];
  }, [post]);

  const totalImages = mediaList.length;

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    if (activeMediaIndex < totalImages - 1) {
      setActiveMediaIndex((prev) => prev + 1);
    }
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    if (activeMediaIndex > 0) {
      setActiveMediaIndex((prev) => prev - 1);
    }
  };

  // Touch Swipe Handlers (Using changedTouches)
  const handleTouchStart = (e) => {
    if (totalImages <= 1) return;
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (totalImages <= 1 || touchStart === null) return;
    const touchEndPos = e.changedTouches[0].clientX;
    const distance = touchStart - touchEndPos;
    if (distance > 30 && activeMediaIndex < totalImages - 1) {
      setActiveMediaIndex((prev) => prev + 1);
    } else if (distance < -30 && activeMediaIndex > 0) {
      setActiveMediaIndex((prev) => prev - 1);
    }
    setTouchStart(null);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (totalImages <= 1) return;
    setIsMouseDown(true);
    setDragStartX(e.clientX);
  };

  const handleMouseUp = (e) => {
    if (!isMouseDown || totalImages <= 1) return;
    setIsMouseDown(false);
    const distance = dragStartX - e.clientX;
    if (distance > 30 && activeMediaIndex < totalImages - 1) {
      setActiveMediaIndex((prev) => prev + 1);
    } else if (distance < -30 && activeMediaIndex > 0) {
      setActiveMediaIndex((prev) => prev - 1);
    }
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
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

  const handleAddCommentLocal = async (postId, content, parentId) => {
    if (onAddComment) {
      const newComment = await onAddComment(postId, content, parentId);
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
      }
    }
  };

  const handleEditCommentLocal = async (commentId, content) => {
    if (token) {
      const updated = await socialService.editComment(token, commentId, content);
      if (updated) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, content: updated.content } : c))
        );
      }
    }
  };

  const handleDeleteCommentLocal = async (commentId) => {
    if (token) {
      await socialService.deleteComment(token, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
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

  const postUserId = post.userId || post.user_id;
  const isOwner = currentUserId && postUserId === currentUserId;

  return (
    <article className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-white style-card">
      {/* Post Header: Author & Location */}
      <div className="card-header bg-white border-0 p-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <Link
            to={isOwner ? '/profile' : `/profile/${postUserId}`}
            className="d-flex align-items-center text-decoration-none text-body me-2"
          >
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3 flex-shrink-0"
              style={{ width: '42px', height: '42px' }}
            >
              {post.author?.fullName ? post.author.fullName.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <h6 className="fw-bold mb-0 text-body">{post.author?.fullName || 'Traveler'}</h6>
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
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this post?')) {
                  onDelete(post.id);
                }
              }}
              className="btn btn-sm btn-link text-danger p-0 ms-2"
              aria-label="Delete post"
              title="Delete post"
            >
              <i className="bi bi-trash3 fs-5"></i>
            </button>
          )}
        </div>
      </div>

      {/* Post Image Container with Touch Swipe & Mouse Drag Carousel */}
      <div
        className="w-100 position-relative user-select-none overflow-hidden d-flex align-items-center justify-content-center"
        style={{
          minHeight: '280px',
          maxHeight: '750px',
          backgroundColor: '#090d16',
          cursor: totalImages > 1 ? 'grab' : 'pointer'
        }}
        onDoubleClick={handleDoubleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Ambient Blur Backdrop */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 opacity-25"
          style={{
            backgroundImage: `url(${mediaList[activeMediaIndex]?.media_url || travelBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(24px)',
            transform: 'scale(1.15)',
            pointerEvents: 'none'
          }}
        ></div>

        <img
          src={mediaList[activeMediaIndex]?.media_url || travelBg}
          alt={post.caption ? `${post.caption} - ${post.destination || 'Travel Post'}` : 'Travel Moment'}
          loading="lazy"
          onError={(e) => { e.target.src = travelBg; }}
          className="w-100 d-block position-relative"
          style={{
            maxHeight: '750px',
            objectFit: 'contain',
            width: '100%',
            height: 'auto',
            zIndex: 1,
            transition: 'transform 0.3s ease'
          }}
        />

        {/* Multi-Image Counter Badge */}
        {totalImages > 1 && (
          <div
            className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 rounded-pill px-3 py-2 text-white shadow-sm"
            style={{ fontSize: '0.75rem', zIndex: 5 }}
          >
            <i className="bi bi-images me-1"></i>
            {activeMediaIndex + 1} / {totalImages}
          </div>
        )}

        {/* Swipe Hint Indicator on Mobile */}
        {totalImages > 1 && (
          <div
            className="position-absolute top-0 start-0 m-3 badge bg-dark bg-opacity-50 text-white extra-small rounded-pill px-2 py-1 d-sm-none"
            style={{ zIndex: 5, fontSize: '0.65rem' }}
          >
            <i className="bi bi-hand-index-thumb me-1"></i>Swipe
          </div>
        )}

        {/* Carousel Previous Button */}
        {totalImages > 1 && activeMediaIndex > 0 && (
          <button
            type="button"
            onClick={handlePrevImage}
            className="btn btn-dark btn-sm bg-opacity-50 text-white rounded-circle position-absolute top-50 start-0 translate-middle-y ms-2 p-2 border-0 shadow"
            style={{ width: '36px', height: '36px', zIndex: 6 }}
            aria-label="Previous photo"
          >
            <i className="bi bi-chevron-left fs-6"></i>
          </button>
        )}

        {/* Carousel Next Button */}
        {totalImages > 1 && activeMediaIndex < totalImages - 1 && (
          <button
            type="button"
            onClick={handleNextImage}
            className="btn btn-dark btn-sm bg-opacity-50 text-white rounded-circle position-absolute top-50 end-0 translate-middle-y me-2 p-2 border-0 shadow"
            style={{ width: '36px', height: '36px', zIndex: 6 }}
            aria-label="Next photo"
          >
            <i className="bi bi-chevron-right fs-6"></i>
          </button>
        )}

        {/* Carousel Dot Indicators */}
        {totalImages > 1 && (
          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1" style={{ zIndex: 5 }}>
            {mediaList.map((_, i) => (
              <span
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaIndex(i);
                }}
                className={`rounded-circle d-inline-block transition-all cursor-pointer ${
                  activeMediaIndex === i ? 'bg-white shadow' : 'bg-white bg-opacity-50'
                }`}
                style={{
                  width: activeMediaIndex === i ? '8px' : '6px',
                  height: activeMediaIndex === i ? '8px' : '6px',
                  cursor: 'pointer'
                }}
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
              <i className={`bi ${post.is_liked ? 'bi-heart-fill text-danger' : 'bi-heart theme-icon'} fs-4 transition-transform`}></i>
              <span className="fw-bold small text-body">{post.likes_count || 0}</span>
            </button>

            {/* Comment Toggle */}
            <button
              onClick={handleToggleComments}
              className="btn border-0 p-0 text-decoration-none d-flex align-items-center gap-1 focus-ring-none"
              aria-label="Open comments"
            >
              <i className="bi bi-chat theme-icon fs-4"></i>
              <span className="fw-bold small text-body">{post.comments_count || 0}</span>
            </button>
          </div>

          {/* Save / Bookmark */}
          <button
            onClick={() => onSave(post.id, post.is_saved)}
            className="btn border-0 p-0 text-decoration-none focus-ring-none"
            aria-label={post.is_saved ? "Unsave post" : "Save post"}
          >
            <i className={`bi ${post.is_saved ? 'bi-bookmark-fill text-primary' : 'bi-bookmark theme-icon'} fs-4`}></i>
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="card-text mb-2 text-body">
            <strong className="me-2 text-body">{post.author?.fullName || 'Traveler'}</strong>
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
              currentUserId={currentUserId}
              postOwnerId={postUserId}
              onAddComment={handleAddCommentLocal}
              onEditComment={handleEditCommentLocal}
              onDeleteComment={handleDeleteCommentLocal}
            />
          </div>
        )}
      </div>
    </article>
  );
}
