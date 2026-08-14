import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';

export default function Create() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    imageUrl: '',
    destination: '',
    caption: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      setError('Please provide a travel photo URL.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await socialService.createPost(token, {
        imageUrl: formData.imageUrl.trim(),
        destination: formData.destination.trim() || null,
        caption: formData.caption.trim() || null
      });
      navigate('/home');
    } catch (err) {
      if (err.message && err.message.includes('401')) {
        logout();
        navigate('/login');
      } else {
        setError(err.message || 'Failed to publish post.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8" style={{ maxWidth: '640px' }}>
          <div className="bg-white rounded-4 shadow-sm p-4 p-sm-5 border">
            <div className="mb-4 pb-2 border-bottom">
              <h3 className="fw-bold text-dark mb-1">Create Travel Post</h3>
              <span className="text-secondary small">Share your travel moment with the TripNest community</span>
            </div>

            {error && (
              <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Photo URL <span className="text-danger">*</span>
                </label>
                <input
                  type="url"
                  className="form-control rounded-3 p-3"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                  disabled={loading}
                />
                <div className="form-text extra-small text-muted">Paste a high-quality travel image link</div>
              </div>

              {formData.imageUrl && (
                <div className="mb-3 rounded-4 overflow-hidden shadow-sm" style={{ maxHeight: '300px', backgroundColor: '#0f172a' }}>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-100 h-100 object-fit-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Destination / Location</label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control rounded-3 p-3 ps-5"
                    placeholder="e.g. Kyoto, Japan"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    disabled={loading}
                  />
                  <i className="bi bi-geo-alt-fill position-absolute top-50 start-0 translate-middle-y ms-3 text-teal"></i>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Caption / Story</label>
                <textarea
                  className="form-control rounded-3 p-3"
                  rows="4"
                  placeholder="Tell other travelers about this moment, travel tip, or highlight..."
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  disabled={loading}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 rounded-3 p-3 fw-semibold d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Publishing Post...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill me-2"></i> Publish Post
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </SocialLayout>
  );
}
