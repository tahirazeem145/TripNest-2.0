import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per image
const MAX_IMAGES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function Create() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Mode: 'file' | 'url'
  const [uploadMode, setUploadMode] = useState('file');

  // Multi-image file state: Array of { file, previewUrl, id }
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Single / Direct URL fallback
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [urlPreview, setUrlPreview] = useState('');

  // Post Metadata
  const [destination, setDestination] = useState('');
  const [caption, setCaption] = useState('');

  // Processing state
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Revoke object URLs on unmount to prevent leaks
  useEffect(() => {
    return () => {
      selectedFiles.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
      if (urlPreview) URL.revokeObjectURL(urlPreview);
    };
  }, []);

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedFiles.length + files.length > MAX_IMAGES) {
      setError(`You can upload a maximum of ${MAX_IMAGES} images per post.`);
      return;
    }

    const newSelected = [];
    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type.toLowerCase())) {
        setError('Unsupported format. Please select JPG, PNG, or WEBP images.');
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        setError(`Image ${f.name} exceeds the 10 MB limit.`);
        return;
      }
      newSelected.push({
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        previewUrl: URL.createObjectURL(f)
      });
    }

    setError('');
    setSelectedFiles((prev) => [...prev, ...newSelected]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setSelectedFiles((prev) => {
      const target = prev[indexToRemove];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (activePreviewIndex >= updated.length) {
        setActivePreviewIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleMoveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= selectedFiles.length) return;
    setSelectedFiles((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
    setActivePreviewIndex(toIndex);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrlInput(url);
    if (url.trim().startsWith('http://') || url.trim().startsWith('https://')) {
      setUrlPreview(url.trim());
      setError('');
    } else {
      setUrlPreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploadMode === 'file' && selectedFiles.length === 0) {
      setError('Please select at least 1 image to upload.');
      return;
    }

    if (uploadMode === 'url' && !imageUrlInput.trim()) {
      setError('Please enter a valid image URL.');
      return;
    }

    if (!destination.trim()) {
      setError('Destination or location is required.');
      return;
    }

    if (!caption.trim()) {
      setError('A caption or story is required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let mediaItems = [];
      let primaryImageUrl = '';

      if (uploadMode === 'file') {
        setUploadProgressText(`Uploading 1 of ${selectedFiles.length} images...`);
        
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgressText(`Uploading ${i + 1} of ${selectedFiles.length} images to Supabase Storage...`);
          const uploadRes = await socialService.uploadMedia(token, selectedFiles[i].file, 'post');
          mediaItems.push({
            media_url: uploadRes.imageUrl || uploadRes.url,
            display_order: i,
            media_type: 'image'
          });
        }
        primaryImageUrl = mediaItems[0].media_url;
      } else {
        primaryImageUrl = imageUrlInput.trim();
        mediaItems.push({
          media_url: primaryImageUrl,
          display_order: 0,
          media_type: 'image'
        });
      }

      setUploadProgressText('Publishing travel moment to TripNest...');
      await socialService.createPost(token, {
        imageUrl: primaryImageUrl,
        destination: destination.trim(),
        caption: caption.trim(),
        media: mediaItems
      });

      setSuccess('Travel moment published successfully! Redirecting to feed...');
      setTimeout(() => {
        navigate('/home');
      }, 700);
    } catch (err) {
      if (err.message && err.message.includes('401')) {
        logout();
        navigate('/login');
      } else {
        setError(err.message || 'Unable to publish post. Please check connection.');
      }
    } finally {
      setLoading(false);
      setUploadProgressText('');
    }
  };

  const isFormValid =
    (uploadMode === 'file' ? selectedFiles.length > 0 : !!imageUrlInput.trim()) &&
    !!destination.trim() &&
    !!caption.trim();

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8" style={{ maxWidth: '680px' }}>
          <div className="bg-white rounded-4 shadow-sm p-4 p-sm-5 border">
            <div className="mb-4 pb-2 border-bottom d-flex align-items-center justify-content-between">
              <div>
                <h3 className="fw-bold text-dark mb-1">Create Travel Post</h3>
                <span className="text-secondary small">Share your travel memories & multi-image captures</span>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger border-0 rounded-3 mb-4 d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div className="small">{error}</div>
              </div>
            )}

            {success && (
              <div className="alert alert-success border-0 rounded-3 mb-4 d-flex align-items-center" role="alert">
                <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                <div className="small">{success}</div>
              </div>
            )}

            {/* Upload Mode Selector */}
            <div className="d-flex rounded-3 bg-light p-1 mb-4 border">
              <button
                type="button"
                className={`btn btn-sm flex-fill rounded-3 fw-semibold py-2 transition-all ${
                  uploadMode === 'file' ? 'bg-white shadow-sm text-primary' : 'text-secondary'
                }`}
                onClick={() => {
                  setUploadMode('file');
                  setError('');
                }}
              >
                <i className="bi bi-images me-1"></i> Multi-Image Upload (Up to 10)
              </button>
              <button
                type="button"
                className={`btn btn-sm flex-fill rounded-3 fw-semibold py-2 transition-all ${
                  uploadMode === 'url' ? 'bg-white shadow-sm text-primary' : 'text-secondary'
                }`}
                onClick={() => {
                  setUploadMode('url');
                  setError('');
                }}
              >
                <i className="bi bi-link-45deg me-1"></i> Direct Image URL
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Photo Input Area */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-secondary mb-0">
                    Travel Photos <span className="text-danger">*</span>
                  </label>
                  {uploadMode === 'file' && (
                    <span className="text-muted extra-small">
                      {selectedFiles.length}/{MAX_IMAGES} images selected
                    </span>
                  )}
                </div>

                {uploadMode === 'file' ? (
                  selectedFiles.length === 0 ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-2 border-dashed rounded-4 p-5 text-center cursor-pointer hover-bg-light transition-all d-flex flex-column align-items-center justify-content-center"
                      style={{ minHeight: '240px', borderColor: '#cbd5e1', cursor: 'pointer' }}
                    >
                      <div
                        className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3"
                        style={{ width: '64px', height: '64px' }}
                      >
                        <i className="bi bi-images fs-2"></i>
                      </div>
                      <h6 className="fw-bold text-dark mb-1">Click to select travel photos</h6>
                      <p className="text-muted extra-small mb-3">Select up to 10 JPG, PNG, or WEBP photos (max 10 MB each)</p>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-semibold shadow-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <i className="bi bi-plus-lg me-1"></i> Choose Photos
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* Main Preview Container */}
                      <div
                        className="position-relative rounded-4 overflow-hidden shadow-sm mb-3 d-flex align-items-center justify-content-center"
                        style={{ minHeight: '280px', maxHeight: '600px', backgroundColor: '#090d16' }}
                      >
                        {/* Ambient Backdrop */}
                        <div
                          className="position-absolute top-0 start-0 w-100 h-100 opacity-25"
                          style={{
                            backgroundImage: `url(${selectedFiles[activePreviewIndex]?.previewUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(24px)',
                            transform: 'scale(1.15)'
                          }}
                        ></div>

                        <img
                          src={selectedFiles[activePreviewIndex]?.previewUrl}
                          alt="Main preview"
                          className="w-100 d-block position-relative"
                          style={{
                            maxHeight: '600px',
                            objectFit: 'contain',
                            width: '100%',
                            height: 'auto',
                            zIndex: 1
                          }}
                        />
                        <div className="position-absolute top-0 start-0 m-3 badge bg-dark bg-opacity-75 rounded-pill px-3 py-2" style={{ zIndex: 5 }}>
                          Image {activePreviewIndex + 1} of {selectedFiles.length}
                        </div>
                        <div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 5 }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(activePreviewIndex)}
                            className="btn btn-danger btn-sm rounded-circle shadow p-2"
                            title="Remove this photo"
                          >
                            <i className="bi bi-trash3 text-white"></i>
                          </button>
                        </div>
                      </div>

                      {/* Thumbnail Strip with Reorder Controls */}
                      <div className="d-flex align-items-center gap-2 overflow-auto pb-2 mb-2">
                        {selectedFiles.map((item, idx) => (
                          <div
                            key={item.id}
                            className={`position-relative rounded-3 overflow-hidden flex-shrink-0 cursor-pointer border ${
                              activePreviewIndex === idx ? 'border-primary border-3 shadow' : 'border-light'
                            }`}
                            style={{ width: '64px', height: '64px', cursor: 'pointer' }}
                            onClick={() => setActivePreviewIndex(idx)}
                          >
                            <img src={item.previewUrl} alt={`Thumb ${idx}`} className="w-100 h-100 object-fit-cover" />
                            {activePreviewIndex === idx && (
                              <div className="position-absolute bottom-0 start-0 end-0 bg-primary text-white text-center extra-small py-0" style={{ fontSize: '0.6rem' }}>
                                Active
                              </div>
                            )}
                          </div>
                        ))}

                        {selectedFiles.length < MAX_IMAGES && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-outline-secondary rounded-3 d-flex flex-column align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '64px', height: '64px', borderStyle: 'dashed' }}
                            title="Add more photos"
                          >
                            <i className="bi bi-plus fs-4"></i>
                            <span style={{ fontSize: '0.65rem' }}>Add</span>
                          </button>
                        )}
                      </div>

                      {/* Reorder Buttons for Active Photo */}
                      {selectedFiles.length > 1 && (
                        <div className="d-flex gap-2 justify-content-center mb-3">
                          <button
                            type="button"
                            onClick={() => handleMoveImage(activePreviewIndex, activePreviewIndex - 1)}
                            disabled={activePreviewIndex === 0}
                            className="btn btn-light btn-sm rounded-pill px-3 extra-small shadow-none"
                          >
                            <i className="bi bi-arrow-left me-1"></i> Move Left
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(activePreviewIndex, activePreviewIndex + 1)}
                            disabled={activePreviewIndex === selectedFiles.length - 1}
                            className="btn btn-light btn-sm rounded-pill px-3 extra-small shadow-none"
                          >
                            Move Right <i className="bi bi-arrow-right ms-1"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div>
                    <input
                      type="url"
                      className="form-control rounded-3 p-3 mb-2"
                      placeholder="https://example.com/photo.jpg"
                      value={imageUrlInput}
                      onChange={handleUrlChange}
                      disabled={loading}
                    />
                    {urlPreview && (
                      <div
                        className="position-relative rounded-4 overflow-hidden shadow-sm mt-3 d-flex align-items-center justify-content-center"
                        style={{ minHeight: '260px', maxHeight: '500px', backgroundColor: '#090d16' }}
                      >
                        <div
                          className="position-absolute top-0 start-0 w-100 h-100 opacity-25"
                          style={{
                            backgroundImage: `url(${urlPreview})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(24px)',
                            transform: 'scale(1.15)'
                          }}
                        ></div>
                        <img
                          src={urlPreview}
                          alt="Preview"
                          className="w-100 d-block position-relative"
                          style={{
                            maxHeight: '500px',
                            objectFit: 'contain',
                            width: '100%',
                            height: 'auto',
                            zIndex: 1
                          }}
                          onError={() => {
                            setError('Unable to load image from URL. Please check link.');
                            setUrlPreview('');
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFilesSelect}
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="d-none"
                  disabled={loading}
                />
              </div>

              {/* Destination Input */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">
                  Destination / Location <span className="text-danger">*</span>
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control rounded-3 p-3 ps-5"
                    placeholder="Where was this photo taken? (e.g. Kyoto, Japan)"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    maxLength={150}
                    disabled={loading}
                    required
                  />
                  <i className="bi bi-geo-alt-fill position-absolute top-50 start-0 translate-middle-y ms-3 text-teal"></i>
                </div>
              </div>

              {/* Caption Input */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-secondary mb-0">
                    Caption / Story <span className="text-danger">*</span>
                  </label>
                  <span className="text-muted extra-small">{caption.length}/2000</span>
                </div>
                <textarea
                  className="form-control rounded-3 p-3"
                  rows="4"
                  placeholder="Share details about this place, travel advice, or highlights..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={2000}
                  disabled={loading}
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 rounded-3 p-3 fw-semibold d-flex align-items-center justify-content-center shadow-sm"
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {uploadProgressText || 'Publishing Moment...'}
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill me-2"></i> Publish Moment
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
