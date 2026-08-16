import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function CommentSection({ comments = [], onAddComment, postId }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setCommentError('');
    try {
      await onAddComment(postId, content.trim());
      setContent('');
    } catch {
      setCommentError('Unable to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCommentDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mt-3 pt-3 border-top">
      {/* Comments List */}
      <div className="comments-list mb-3" style={{ maxHeight: '220px', overflowY: 'auto' }}>
        {comments.length === 0 ? (
          <p className="text-muted extra-small mb-2">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="d-flex align-items-start gap-2 mb-2">
              <Link
                to={`/profile/${c.userId}`}
                className="text-decoration-none flex-shrink-0"
              >
                {c.author?.avatarUrl ? (
                  <img
                    src={c.author.avatarUrl}
                    alt={c.author?.fullName || 'Traveler'}
                    className="rounded-circle object-fit-cover"
                    style={{ width: '28px', height: '28px' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}
                  >
                    {c.author?.fullName ? c.author.fullName.charAt(0).toUpperCase() : 'T'}
                  </div>
                )}
              </Link>
              <div className="flex-grow-1">
                <div className="small">
                  <Link
                    to={`/profile/${c.userId}`}
                    className="fw-bold text-dark text-decoration-none me-2"
                  >
                    {c.author?.fullName || 'Traveler'}
                  </Link>
                  <span className="text-secondary">{c.content}</span>
                </div>
                <div className="extra-small text-muted">{formatCommentDate(c.created_at)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {commentError && (
        <div className="alert alert-danger p-2 extra-small rounded-3 mb-2">{commentError}</div>
      )}

      {/* Add Comment Input */}
      <form onSubmit={handleSubmit} className="d-flex align-items-center gap-2">
        <input
          type="text"
          className="form-control form-control-sm rounded-pill px-3 bg-light border-0"
          placeholder="Add a travel comment..."
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
            'Post'
          )}
        </button>
      </form>
    </div>
  );
}
