import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';
import SocialLayout from '../layouts/SocialLayout';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per image
const MAX_IMAGES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const POPULAR_DESTINATIONS = [
  'Santorini, Greece',
  'Amalfi Coast, Italy',
  'Kyoto, Japan',
  'Swiss Alps, Switzerland',
  'Bali, Indonesia',
  'Reykjavik, Iceland',
  'Paris, France',
  'Maui, Hawaii'
];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (uploadMode === 'file' && selectedFiles.length === 0) {
      setError('Please select at least one travel photo to publish.');
      return;
    }

    if (uploadMode === 'url' && !imageUrlInput.trim()) {
      setError('Please provide an image URL.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let finalMediaUrls = [];

      if (uploadMode === 'file') {
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgressText(`Uploading photo ${i + 1} of ${selectedFiles.length}...`);
          const res = await socialService.uploadMedia(token, selectedFiles[i].file, 'post');
          if (res && res.imageUrl) {
            finalMediaUrls.push(res.imageUrl);
          } else {
            throw new Error(`Failed to upload photo ${i + 1}`);
          }
        }
      } else {
        finalMediaUrls = [imageUrlInput.trim()];
      }

      setUploadProgressText('Publishing travel moment to the community...');
      await socialService.createPost(token, {
        caption: caption.trim(),
        destination: destination.trim(),
        imageUrls: finalMediaUrls
      });

      setSuccess('Travel moment published successfully!');
      setTimeout(() => {
        navigate('/home');
      }, 1200);
    } catch (err) {
      if (err.message && err.message.includes('401')) {
        logout();
        navigate('/login');
      } else {
        setError(err.message || 'Failed to publish post. Please try again.');
      }
    } finally {
      setLoading(false);
      setUploadProgressText('');
    }
  };

  return (
    <SocialLayout>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10" style={{ maxWidth: '840px' }}>
          <div className="glass-card p-4 p-sm-5 shadow-lg">
            
            {/* Header */}
            <div className="mb-4 pb-3 d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid var(--tn-border)' }}>
              <div>
                <h3 className="fw-bold text-white mb-1 font-heading">
                  Share Your <span className="gradient-text">Journey</span>
                </h3>
                <span className="text-muted small">Upload high-resolution multi-photo albums & tag destinations</span>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger border-0 rounded-3 mb-4 bg-danger bg-opacity-10 text-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <span className="small">{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success border-0 rounded-3 mb-4 bg-success bg-opacity-10 text-success" role="alert">
                <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                <span className="small">{success}</span>
              </div>
            )}

            {/* Mode Switcher */}
            <div className="d-flex rounded-3 p-1 mb-4" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--tn-border)' }}>
              <button
                type="button"
                className={`btn btn-sm flex-fill rounded-3 fw-semibold py-2 transition-all ${
                  uploadMode === 'file' ? 'gradient-btn text-white' : 'text-muted border-0 bg-transparent'
                }`}
                onClick={() => {
                  setUploadMode('file');
                  setError('');
                }}
              >
                <i className="bi bi-images me-1"></i> Multi-Photo Album (Up to 10)
              </button>
              <button
                type="button"
                className={`btn btn-sm flex-fill rounded-3 fw-semibold py-2 transition-all ${
                  uploadMode === 'url' ? 'gradient-btn text-white' : 'text-muted border-0 bg-transparent'
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
              
              {/* Photo Upload Canvas */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label small fw-semibold text-muted mb-0">
                    Travel Photos <span className="text-danger">*</span>
                  </label>
                  {uploadMode === 'file' && (
                    <span className="text-info extra-small">
                      {selectedFiles.length}/{MAX_IMAGES} photos selected
                    </span>
                  )}
                </div>

                {uploadMode === 'file' ? (
                  selectedFiles.length === 0 ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-2 border-dashed rounded-4 p-5 text-center cursor-pointer transition-all d-flex flex-column align-items-center justify-content-center"
                      style={{ minHeight: '260px', borderColor: 'var(--tn-border)', backgroundColor: 'rgba(15, 23, 42, 0.4)', cursor: 'pointer' }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center mb-3 shadow"
                        style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, rgba(0, 166, 251, 0.2), rgba(6, 214, 160, 0.2))', border: '1px solid var(--tn-border)' }}
                      >
                        <i className="bi bi-cloud-arrow-up fs-2 text-info"></i>
                      </div>
                      <h6 className="fw-bold text-white mb-1 font-heading">Click or drag photos to upload</h6>
                      <p className="text-muted extra-small mb-3">Upload up to 10 JPG, PNG, or WEBP photos (max 10 MB each)</p>
                      <button
                        type="button"
                        className="gradient-btn btn-sm rounded-pill px-4 fw-semibold"
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
                      {/* Live Canvas Preview */}
                      <div
                        className="position-relative rounded-4 overflow-hidden shadow-lg mb-3 d-flex align-items-center justify-content-center"
                        style={{ minHeight: '300px', maxHeight: '600px', backgroundColor: '#050811', border: '1px solid var(--tn-border)' }}
                      >
                        {/* Ambient Backdrop */}
                        <div
                          className="position-absolute top-0 start-0 w-100 h-100 opacity-25"
                          style={{
                            backgroundImage: `url(${selectedFiles[activePreviewIndex]?.previewUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(28px)',
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

                        <div className="position-absolute top-0 start-0 m-3 badge bg-dark bg-opacity-75 rounded-pill px-3 py-2 text-white" style={{ zIndex: 5 }}>
                          Photo {activePreviewIndex + 1} of {selectedFiles.length}
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

                      {/* Thumbnail Strip */}
                      <div className="d-flex align-items-center gap-2 overflow-auto pb-2 mb-2" style={{ scrollbarWidth: 'none' }}>
                        {selectedFiles.map((item, idx) => (
                          <div
                            key={item.id}
                            className={`position-relative rounded-3 overflow-hidden flex-shrink-0 cursor-pointer ${
                              activePreviewIndex === idx ? 'border border-2 border-info shadow' : 'border border-dark'
                            }`}
                            style={{ width: '68px', height: '68px', cursor: 'pointer' }}
                            onClick={() => setActivePreviewIndex(idx)}
                          >
                            <img src={item.previewUrl} alt={`Thumb ${idx}`} className="w-100 h-100 object-fit-cover" />
                          </div>
                        ))}

                        {selectedFiles.length < MAX_IMAGES && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-dark rounded-3 d-flex flex-column align-items-center justify-content-center flex-shrink-0 border"
                            style={{ width: '68px', height: '68px', borderColor: 'var(--tn-border)', borderStyle: 'dashed' }}
                            title="Add more photos"
                          >
                            <i className="bi bi-plus fs-4 text-info"></i>
                            <span className="extra-small text-muted" style={{ fontSize: '0.65rem' }}>Add</span>
                          </button>
                        )}
                      </div>

                      {/* Reorder Buttons */}
                      {selectedFiles.length > 1 && (
                        <div className="d-flex gap-2 justify-content-center mb-3">
                          <button
                            type="button"
                            onClick={() => handleMoveImage(activePreviewIndex, activePreviewIndex - 1)}
                            disabled={activePreviewIndex === 0}
                            className="btn btn-dark btn-sm rounded-pill px-3 extra-small border"
                            style={{ borderColor: 'var(--tn-border)' }}
                          >
                            <i className="bi bi-arrow-left me-1"></i> Move Left
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(activePreviewIndex, activePreviewIndex + 1)}
                            disabled={activePreviewIndex === selectedFiles.length - 1}
                            className="btn btn-dark btn-sm rounded-pill px-3 extra-small border"
                            style={{ borderColor: 'var(--tn-border)' }}
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
                      className="form-control mb-2"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrlInput}
                      onChange={(e) => {
                        setImageUrlInput(e.target.value);
                        setUrlPreview(e.target.value);
                      }}
                    />
                    {urlPreview && (
                      <div className="rounded-4 overflow-hidden mt-3 text-center" style={{ maxHeight: '400px', backgroundColor: '#090d16' }}>
                        <img
                          src={urlPreview}
                          alt="URL preview"
                          className="w-100 object-fit-contain"
                          style={{ maxHeight: '400px' }}
                          onError={() => setError('Invalid image URL or resource not accessible.')}
                        />
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFilesSelect}
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="d-none"
                />
              </div>

              {/* Destination Tag */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Destination Location</label>
                <div className="input-group mb-2">
                  <span className="input-group-text bg-dark border-0 text-info">
                    <i className="bi bi-geo-alt-fill"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Positano, Amalfi Coast, Italy"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                {/* Popular Destination Suggestions */}
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {POPULAR_DESTINATIONS.map((dest, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDestination(dest)}
                      className="destination-pill border-0 extra-small"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Journey Caption & Travel Story</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Tell fellow explorers about the hidden coves, local cafes, and stunning vistas..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                className="gradient-btn w-100 p-3 fw-bold d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    <span>{uploadProgressText || 'Publishing Journey...'}</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill me-2"></i>
                    <span>Publish Travel Moment</span>
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
