import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CommentSection({
  comments = [],
  onAddComment,
  onEditComment,
  onDeleteComment,
  postId,
  currentUserId,
  postOwnerId
}) {
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // { id, authorName }
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setCommentError('');
    try {
      await onAddComment(postId, content.trim(), replyingTo ? replyingTo.id : null);
      setContent('');
      setReplyingTo(null);
    } catch {
      setCommentError('Unable to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim() || submitting) return;
    setSubmitting(true);
    setCommentError('');
    try {
      if (onEditComment) {
        await onEditComment(commentId, editContent.trim());
      }
      setEditingCommentId(null);
      setEditContent('');
    } catch {
      setCommentError('Unable to update comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setCommentError('');
      try {
        if (onDeleteComment) {
          await onDeleteComment(commentId);
        }
      } catch {
        setCommentError('Unable to delete comment. Please try again.');
      }
    }
  };

  const formatCommentDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  // Group comments: Top level vs Replies
  const topLevelComments = comments.filter(
    (c) => !c.parent_id && !c.parentId
  );

  const getRepliesFor = (parentId) =>
    comments.filter(
      (c) => (c.parent_id && c.parent_id === parentId) || (c.parentId && c.parentId === parentId)
    );

  const renderSingleComment = (c, isReply = false) => {
    const cUserId = c.userId || c.user_id;
    const isCommentOwner = currentUserId && cUserId === currentUserId;
    const isPostOwner = currentUserId && postOwnerId === currentUserId;
    const canDelete = isCommentOwner || isPostOwner;
    const isEditing = editingCommentId === c.id;

    return (
      <div key={c.id} className={`d-flex align-items-start gap-2 mb-2 ${isReply ? 'mt-2' : ''}`}>
        <Link to={`/profile/${cUserId}`} className="text-decoration-none flex-shrink-0">
          {c.author?.avatarUrl ? (
            <img
              src={c.author.avatarUrl}
              alt={c.author?.fullName || 'Traveler'}
              className="rounded-circle object-fit-cover shadow-sm"
              style={{ width: isReply ? '24px' : '30px', height: isReply ? '24px' : '30px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div
              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{
                width: isReply ? '24px' : '30px',
                height: isReply ? '24px' : '30px',
                fontSize: isReply ? '0.65rem' : '0.75rem'
              }}
            >
              {c.author?.fullName ? c.author.fullName.charAt(0).toUpperCase() : 'T'}
            </div>
          )}
        </Link>

        <div className="flex-grow-1 overflow-hidden">
          {isEditing ? (
            <div className="mb-2">
              <input
                type="text"
                className="form-control form-control-sm rounded-3 mb-1"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={submitting}
              />
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveEdit(c.id)}
                  disabled={!editContent.trim() || submitting}
                  className="btn btn-primary btn-sm py-0 px-2 extra-small rounded-pill"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCommentId(null)}
                  className="btn btn-outline-secondary btn-sm py-0 px-2 extra-small rounded-pill"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="small">
                <Link to={`/profile/${cUserId}`} className="fw-bold text-dark text-decoration-none me-2">
                  {c.author?.fullName || 'Traveler'}
                </Link>
                <span className="text-body">{c.content}</span>
              </div>

              {/* Action Toolbar under comment */}
              <div className="d-flex align-items-center gap-3 extra-small text-muted mt-1">
                <span>{formatCommentDate(c.created_at)}</span>

                {!isReply && (
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo({
                        id: c.id,
                        authorName: c.author?.fullName || 'Traveler'
                      });
                    }}
                    className="btn btn-link p-0 text-decoration-none extra-small text-primary fw-semibold"
                  >
                    Reply
                  </button>
                )}

                {isCommentOwner && onEditComment && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCommentId(c.id);
                      setEditContent(c.content);
                    }}
                    className="btn btn-link p-0 text-decoration-none extra-small text-secondary"
                  >
                    <i className="bi bi-pencil me-1"></i>Edit
                  </button>
                )}

                {canDelete && onDeleteComment && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="btn btn-link p-0 text-decoration-none extra-small text-danger ms-auto"
                    title="Delete comment"
                  >
                    <i className="bi bi-trash3 me-1"></i>Delete
                  </button>
                )}
              </div>
            </>
          )}

          {/* Render Nested Replies */}
          {!isReply && getRepliesFor(c.id).length > 0 && (
            <div className="ms-3 ps-2 border-start border-2 border-primary border-opacity-25 mt-2">
              {getRepliesFor(c.id).map((reply) => renderSingleComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-3 pt-3 border-top">
      {/* Comments List Container */}
      <div className="comments-list mb-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
        {comments.length === 0 ? (
          <p className="text-muted extra-small mb-2">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          topLevelComments.map((c) => renderSingleComment(c, false))
        )}
      </div>

      {commentError && (
        <div className="alert alert-danger p-2 extra-small rounded-3 mb-2">{commentError}</div>
      )}

      {/* Replying Banner */}
      {replyingTo && (
        <div className="bg-light p-2 rounded-3 mb-2 d-flex align-items-center justify-content-between border">
          <span className="extra-small text-primary fw-semibold">
            <i className="bi bi-reply-fill me-1"></i>Replying to @{replyingTo.authorName}
          </span>
          <button
            type="button"
            className="btn-close btn-close-sm p-1"
            onClick={() => setReplyingTo(null)}
            aria-label="Cancel reply"
          ></button>
        </div>
      )}

      {/* Add Comment Input */}
      <form onSubmit={handleSubmit} className="d-flex align-items-center gap-2">
        <input
          type="text"
          className="form-control form-control-sm rounded-pill px-3 bg-light border-0"
          placeholder={replyingTo ? `Reply to @${replyingTo.authorName}...` : "Add a travel comment..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold flex-shrink-0 shadow-none"
        >
          {submitting ? (
            <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }}></span>
          ) : (
            replyingTo ? 'Reply' : 'Post'
          )}
        </button>
      </form>
    </div>
  );
}
