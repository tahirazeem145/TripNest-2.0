import React, { useState } from 'react';

export default function ProfileHeader({ profile, isCurrentUser, onUpdateProfile }) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.full_name || '');
  const [bioInput, setBioInput] = useState(profile.bio || '');

  const handleSave = async (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      await onUpdateProfile({ fullName: nameInput, bio: bioInput });
      setEditing(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 mb-4 bg-white">
      <div className="row align-items-center">
        {/* Large Avatar */}
        <div className="col-12 col-sm-auto text-center mb-3 mb-sm-0">
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm mx-auto"
            style={{ width: '96px', height: '96px', fontSize: '2.5rem' }}
          >
            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'T'}
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
                  onClick={() => setEditing(!editing)}
                  className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-semibold"
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            )}
          </div>

          {/* Bio Form or Text */}
          {editing ? (
            <form onSubmit={handleSave} className="mt-3">
              <input
                type="text"
                className="form-control form-control-sm mb-2 rounded-3"
                placeholder="Full Name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <textarea
                className="form-control form-control-sm mb-2 rounded-3"
                rows="2"
                placeholder="Write a short travel bio..."
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
              ></textarea>
              <button type="submit" className="btn btn-primary btn-sm rounded-pill px-3">
                Save Changes
              </button>
            </form>
          ) : (
            <p className="text-secondary small mb-3">
              {profile.bio || 'Passionate traveler exploring world destinations & creating memories.'}
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
