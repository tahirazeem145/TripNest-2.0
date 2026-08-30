import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { socialService } from '../../services/socialService';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ProfileHeader({ profile, isCurrentUser, onUpdateProfile }) {
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.full_name || '');
  const [bioInput, setBioInput] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setError('Avatar must be JPG, PNG, or WEBP.');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError('Avatar size must be less than 5 MB.');
      return;
    }

    setError('');
    setUploadingAvatar(true);

    try {
      const res = await socialService.uploadMedia(token, file, 'avatar');
      if (res && res.imageUrl) {
        setAvatarUrl(res.imageUrl);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError('Full name is required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (onUpdateProfile) {
        await onUpdateProfile({
          fullName: nameInput.trim(),
          bio: bioInput.trim(),
          avatarUrl: avatarUrl.trim() || null
        });
        setEditing(false);
      }
    } catch {
      setError('Unable to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getInitial = () => {
    if (profile.full_name) return profile.full_name.charAt(0).toUpperCase();
    if (profile.email) return profile.email.charAt(0).toUpperCase();
    return 'T';
  };

  return (
    <div className="glass-card overflow-hidden mb-4 position-relative">
      
      {/* Cinematic Banner Background */}
      <div 
        className="w-100 position-relative" 
        style={{ 
          height: '160px', 
          background: 'linear-gradient(135deg, rgba(0, 166, 251, 0.4) 0%, rgba(6, 214, 160, 0.3) 100%), url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="position-absolute bottom-0 start-0 end-0 p-3" style={{ background: 'linear-gradient(to top, var(--tn-bg-deep), transparent)' }}></div>
      </div>

      <div className="p-4 p-sm-5 pt-0 position-relative" style={{ marginTop: '-50px' }}>
        <div className="row align-items-end">
          
          {/* Avatar with Verified Ring */}
          <div className="col-12 col-sm-auto text-center text-sm-start mb-3 mb-sm-0">
            <div className="position-relative d-inline-block">
              {avatarUrl || profile.avatar_url ? (
                <img
                  src={avatarUrl || profile.avatar_url}
                  alt={profile.full_name || 'Profile'}
                  className="rounded-circle object-fit-cover shadow-lg mx-auto d-block"
                  style={{ width: '100px', height: '100px', border: '3px solid var(--tn-bg-deep)' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-lg mx-auto"
                  style={{ width: '100px', height: '100px', fontSize: '2.5rem', background: 'linear-gradient(135deg, var(--tn-primary), var(--tn-secondary))', color: '#fff', border: '3px solid var(--tn-bg-deep)' }}
                >
                  {getInitial()}
                </div>
              )}

              {/* Verified Adventurer Badge */}
              <span className="position-absolute bottom-0 end-0 badge rounded-pill bg-success p-1 shadow" title="Verified Adventurer">
                <i className="bi bi-patch-check-fill text-white fs-6"></i>
              </span>
            </div>
          </div>

          {/* User Bio & Header Info */}
          <div className="col-12 col-sm text-center text-sm-start">
            <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
              <div>
                <h3 className="fw-bold text-white mb-0 font-heading">
                  {profile.full_name || 'Traveler'}
                </h3>
                <span className="text-muted small">@{profile.username || (profile.email ? profile.email.split('@')[0] : 'explorer')}</span>
              </div>

              {isCurrentUser && (
                <button
                  onClick={() => setEditing(!editing)}
                  className="btn btn-sm btn-outline-info rounded-pill px-3 py-1 fw-semibold"
                >
                  <i className="bi bi-pencil-square me-1"></i> {editing ? 'Cancel' : 'Edit Passport'}
                </button>
              )}
            </div>

            {profile.bio && (
              <p className="text-light mt-2 mb-3 small" style={{ maxWidth: '520px' }}>
                {profile.bio}
              </p>
            )}

            {/* Travel Stats Row */}
            <div className="d-flex align-items-center justify-content-center justify-content-sm-start gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--tn-border)' }}>
              <div className="text-center text-sm-start">
                <div className="fw-bold text-white fs-5">{profile.posts_count || 0}</div>
                <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>Moments</div>
              </div>
              <div className="text-center text-sm-start">
                <div className="fw-bold text-white fs-5">{profile.followers_count || 0}</div>
                <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>Followers</div>
              </div>
              <div className="text-center text-sm-start">
                <div className="fw-bold text-white fs-5">{profile.following_count || 0}</div>
                <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>Following</div>
              </div>
            </div>
          </div>

        </div>

        {/* Edit Form Modal/Drawer in View */}
        {editing && (
          <form onSubmit={handleSave} className="mt-4 pt-4" style={{ borderTop: '1px solid var(--tn-border)' }}>
            {error && <div className="alert alert-danger p-2 small">{error}</div>}
            
            <div className="mb-3">
              <label className="form-label text-muted small">Full Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-muted small">Traveler Bio</label>
              <textarea
                className="form-control form-control-sm"
                rows="2"
                placeholder="Where are you wandering next?"
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-muted small">Avatar Photo</label>
              <input
                type="file"
                ref={fileInputRef}
                className="form-control form-control-sm"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarFileChange}
              />
              {uploadingAvatar && <span className="extra-small text-info">Uploading avatar...</span>}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" onClick={() => setEditing(false)} className="btn btn-sm btn-dark">Cancel</button>
              <button type="submit" className="gradient-btn btn-sm" disabled={saving}>
                {saving ? 'Saving...' : 'Save Passport'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
