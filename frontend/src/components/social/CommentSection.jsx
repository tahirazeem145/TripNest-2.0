import React, { useState } from 'react';

export default function CommentSection({ comments = [], onAddComment, postId }) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onAddComment(postId, content.trim());
      setContent('');
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
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                {c.author?.fullName ? c.author.fullName.charAt(0).toUpperCase() : 'T'}
              </div>
              <div className="flex-grow-1">
                <div className="small">
                  <strong className="text-dark me-2">{c.author?.fullName || 'Traveler'}</strong>
                  <span className="text-secondary">{c.content}</span>
                </div>
                <div className="extra-small text-muted">{formatCommentDate(c.created_at)}</div>
              </div>
            </div>
          ))
        )}
      </div>

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
          className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold flex-shrink-0"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
