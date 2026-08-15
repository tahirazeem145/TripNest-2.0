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
    <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 mb-4 bg-white">
      <div className="row align-items-center">
        {/* Large Avatar */}
        <div className="col-12 col-sm-auto text-center mb-3 mb-sm-0">
          <div className="position-relative d-inline-block">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Profile'}
                className="rounded-circle object-fit-cover shadow-sm mx-auto d-block"
                style={{ width: '96px', height: '96px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm mx-auto"
                style={{ width: '96px', height: '96px', fontSize: '2.5rem' }}
              >
                {getInitial()}
              </div>
            )}

            {isCurrentUser && editing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 p-1 shadow"
                style={{ width: '32px', height: '32px' }}
                title="Change Avatar"
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }}></span>
                ) : (
                  <i className="bi bi-camera-fill text-white extra-small"></i>
                )}
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="d-none"
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="col-12 col-sm text-center text-sm-start ms-sm-3">
          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mb-2">
            <div>
              <h3 className="fw-bold text-dark mb-0">{profile.full_name || 'Traveler'}</h3>
              <span className="text-muted small">{profile.email}</span>
            </div>
            {isCurrentUser && (
              <div>
                <button
                  onClick={() => {
                    setEditing(!editing);
                    setError('');
                  }}
                  className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-semibold shadow-none"
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            )}
          </div>

          {/* Error Feedback */}
          {error && <div className="alert alert-danger p-2 small rounded-3 mb-2">{error}</div>}

          {/* Bio Form or Text */}
          {editing ? (
            <form onSubmit={handleSave} className="mt-3">
              <div className="mb-2">
                <label className="form-label extra-small text-muted mb-1">Display Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm rounded-3"
                  placeholder="Full Name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label extra-small text-muted mb-1">Avatar Image URL (or use camera icon above)</label>
                <input
                  type="url"
                  className="form-control form-control-sm rounded-3"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>

              <div className="mb-2">
                <label className="form-label extra-small text-muted mb-1">Travel Bio</label>
                <textarea
                  className="form-control form-control-sm rounded-3"
                  rows="2"
                  placeholder="Write a short travel bio..."
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm rounded-pill px-4 fw-semibold"
                disabled={saving || uploadingAvatar}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <p className={`small mb-3 ${profile.bio ? 'text-secondary' : 'text-muted fst-italic'}`}>
              {profile.bio || 'No bio added yet.'}
            </p>
          )}

          {/* Social Stats */}
          <div className="d-flex justify-content-center justify-content-sm-start gap-4 pt-2 border-top">
            <div>
              <strong className="text-dark fs-5">{profile.posts_count || 0}</strong>
              <span className="text-muted small ms-1">Posts</span>
            </div>
            <div>
              <strong className="text-dark fs-5">{profile.followers_count || 0}</strong>
              <span className="text-muted small ms-1">Followers</span>
            </div>
            <div>
              <strong className="text-dark fs-5">{profile.following_count || 0}</strong>
              <span className="text-muted small ms-1">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
