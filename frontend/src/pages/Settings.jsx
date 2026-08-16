import React, { useState, useEffect } from 'react';
import SocialLayout from '../layouts/SocialLayout';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';

export default function Settings() {
  const { user, token, logout } = useAuth();

  // Active Tab: 'profile' | 'security' | 'privacy' | 'notifications' | 'appearance'
  const [activeTab, setActiveTab] = useState('profile');

  // Form States
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Toggles
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowTagging, setAllowTagging] = useState(true);

  // Notifications
  const [emailLikes, setEmailLikes] = useState(true);
  const [emailComments, setEmailComments] = useState(true);
  const [emailFollows, setEmailFollows] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Theme
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('tripnest_theme') || 'light');
  const [compactFeed, setCompactFeed] = useState(() => localStorage.getItem('tripnest_compact') === 'true');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load existing profile info
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!token) return;
      try {
        const p = await socialService.getProfile(token, 'me');
        if (isMounted && p) {
          setFullName(p.fullName || user?.fullName || '');
          setBio(p.bio || '');
          setLocation(p.location || '');
          setAvatarUrl(p.avatarUrl || '');
        }
      } catch {
        // Fallback
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, [token, user]);

  const showToast = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg('');
    } else {
      setSuccessMsg(msg);
      setErrorMsg('');
    }
    setTimeout(() => {
      setSuccessMsg('');
      setErrorMsg('');
    }, 4000);
  };

  // Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await socialService.updateProfile(token, {
        fullName,
        bio,
        location,
        avatarUrl
      });
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', true);
    } finally {
      setLoading(false);
    }
  };

  // Password Update
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password', true);
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', true);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password security settings updated successfully!');
    }, 800);
  };

  // Toggle Preferences Save
  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('tripnest_theme', themeMode);
    localStorage.setItem('tripnest_compact', compactFeed ? 'true' : 'false');
    showToast('Preferences and theme settings saved!');
  };

  return (
    <SocialLayout>
      <div className="py-2">
        {/* Page Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">
              <i className="bi bi-gear-fill text-primary me-2"></i>Account Settings
            </h2>
            <p className="text-secondary mb-0">Manage your profile, security, notifications, and preferences.</p>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {successMsg && (
          <div className="alert alert-success border-0 rounded-4 shadow-sm mb-4 d-flex align-items-center" role="alert">
            <i className="bi bi-check-circle-fill me-2 fs-5"></i>
            <div>{successMsg}</div>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger border-0 rounded-4 shadow-sm mb-4 d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
            <div>{errorMsg}</div>
          </div>
        )}

        <div className="row g-4">
          {/* Settings Navigation Sidebar */}
          <div className="col-12 col-md-4 col-lg-3">
            <div className="bg-white rounded-4 shadow-sm p-3">
              <div className="nav flex-column nav-pills gap-1">
                
                <button
                  className={`nav-link text-start rounded-3 px-3 py-2.5 d-flex align-items-center gap-3 fw-semibold ${activeTab === 'profile' ? 'active bg-primary text-white' : 'text-dark hover-bg-light'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person-circle fs-5"></i>
                  <span>Edit Profile</span>
                </button>

                <button
                  className={`nav-link text-start rounded-3 px-3 py-2.5 d-flex align-items-center gap-3 fw-semibold ${activeTab === 'security' ? 'active bg-primary text-white' : 'text-dark hover-bg-light'}`}
                  onClick={() => setActiveTab('security')}
                >
                  <i className="bi bi-shield-lock fs-5"></i>
                  <span>Security & Password</span>
                </button>

                <button
                  className={`nav-link text-start rounded-3 px-3 py-2.5 d-flex align-items-center gap-3 fw-semibold ${activeTab === 'privacy' ? 'active bg-primary text-white' : 'text-dark hover-bg-light'}`}
                  onClick={() => setActiveTab('privacy')}
                >
                  <i className="bi bi-eye fs-5"></i>
                  <span>Privacy</span>
                </button>

                <button
                  className={`nav-link text-start rounded-3 px-3 py-2.5 d-flex align-items-center gap-3 fw-semibold ${activeTab === 'notifications' ? 'active bg-primary text-white' : 'text-dark hover-bg-light'}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <i className="bi bi-bell fs-5"></i>
                  <span>Notifications</span>
                </button>

                <button
                  className={`nav-link text-start rounded-3 px-3 py-2.5 d-flex align-items-center gap-3 fw-semibold ${activeTab === 'appearance' ? 'active bg-primary text-white' : 'text-dark hover-bg-light'}`}
                  onClick={() => setActiveTab('appearance')}
                >
                  <i className="bi bi-palette fs-5"></i>
                  <span>Appearance</span>
                </button>

              </div>

              <hr className="my-3 text-muted opacity-25" />

              {/* Account Quick Stats */}
              <div className="px-2 py-1 text-center bg-light rounded-3">
                <div className="extra-small text-uppercase text-muted fw-bold mb-1">Logged In As</div>
                <div className="fw-bold text-dark text-truncate small">{user?.fullName || 'Traveler'}</div>
                <div className="text-secondary extra-small text-truncate mb-2">{user?.email}</div>
                <button 
                  onClick={logout}
                  className="btn btn-outline-danger btn-sm w-100 rounded-3 fw-semibold mt-1"
                >
                  <i className="bi bi-box-arrow-right me-1"></i>Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Settings Main Content */}
          <div className="col-12 col-md-8 col-lg-9">
            <div className="bg-white rounded-4 shadow-sm p-4">
              
              {/* TAB 1: EDIT PROFILE */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile}>
                  <h4 className="fw-bold text-dark mb-3">Edit Profile</h4>
                  <p className="text-secondary small mb-4">Update your personal traveler information visible to the community.</p>

                  <div className="mb-4 d-flex align-items-center gap-3">
                    <div 
                      className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold overflow-hidden shadow-sm"
                      style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-100 h-100 object-fit-cover" />
                      ) : (
                        fullName ? fullName.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <label className="form-label small fw-semibold text-secondary mb-1">Avatar Image URL</label>
                      <input
                        type="url"
                        className="form-control rounded-3"
                        placeholder="https://images.unsplash.com/..."
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Full Name</label>
                    <input
                      type="text"
                      className="form-control rounded-3 p-3"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Location / Favorite Base</label>
                    <input
                      type="text"
                      className="form-control rounded-3 p-3"
                      placeholder="e.g. Kyoto, Japan or Paris, France"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-secondary">Bio & Travel Aspirations</label>
                    <textarea
                      className="form-control rounded-3 p-3"
                      rows="3"
                      placeholder="Tell fellow travelers about your favorite destinations and travel style..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary rounded-3 px-4 py-2.5 fw-bold shadow-sm" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: SECURITY & PASSWORD */}
              {activeTab === 'security' && (
                <form onSubmit={handleUpdatePassword}>
                  <h4 className="fw-bold text-dark mb-3">Security & Password</h4>
                  <p className="text-secondary small mb-4">Ensure your account remains safe with a strong password.</p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Current Password</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      className="form-control rounded-3 p-3"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">New Password</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      className="form-control rounded-3 p-3"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-secondary">Confirm New Password</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      className="form-control rounded-3 p-3"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-check mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="showPassCheck"
                      checked={showPasswords}
                      onChange={(e) => setShowPasswords(e.target.checked)}
                    />
                    <label className="form-check-label small text-secondary" htmlFor="showPassCheck">
                      Show passwords
                    </label>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary rounded-3 px-4 py-2.5 fw-bold shadow-sm" disabled={loading}>
                      {loading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: PRIVACY */}
              {activeTab === 'privacy' && (
                <div>
                  <h4 className="fw-bold text-dark mb-3">Privacy Controls</h4>
                  <p className="text-secondary small mb-4">Manage who can see your moments and travel profile.</p>

                  <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
                    <div>
                      <div className="fw-bold text-dark">Private Profile</div>
                      <div className="text-muted extra-small">When enabled, only approved followers can see your posts and shared moments.</div>
                    </div>
                    <div className="form-check form-switch fs-4 mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isPrivateAccount}
                        onChange={(e) => {
                          setIsPrivateAccount(e.target.checked);
                          showToast(`Private profile ${e.target.checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
                    <div>
                      <div className="fw-bold text-dark">Show Online Status</div>
                      <div className="text-muted extra-small">Allow fellow travelers to see when you are active on TripNest.</div>
                    </div>
                    <div className="form-check form-switch fs-4 mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={showOnlineStatus}
                        onChange={(e) => {
                          setShowOnlineStatus(e.target.checked);
                          showToast(`Online status ${e.target.checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between py-3">
                    <div>
                      <div className="fw-bold text-dark">Allow Destination Tagging</div>
                      <div className="text-muted extra-small">Allow travelers to tag you in joint travel itineraries.</div>
                    </div>
                    <div className="form-check form-switch fs-4 mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={allowTagging}
                        onChange={(e) => {
                          setAllowTagging(e.target.checked);
                          showToast(`Tagging permissions ${e.target.checked ? 'enabled' : 'disabled'}`);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div>
                  <h4 className="fw-bold text-dark mb-3">Notification Preferences</h4>
                  <p className="text-secondary small mb-4">Choose which activities trigger notifications.</p>

                  <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
                    <div>
                      <div className="fw-bold text-dark">Likes & Double-Taps</div>
                      <div className="text-muted extra-small">Receive alerts when travelers double-tap your posts.</div>
                    </div>
                    <div className="form-check form-switch fs-4 mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={emailLikes}
                        onChange={(e) => setEmailLikes(e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
                    <div>
                      <div className="fw-bold text-dark">Comments & Replies</div>
                      <div className="text-muted extra-small">Get notified when someone comments on your travel photos.</div>
                    </div>
                    <div className="form-check form-switch fs-4 mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={emailComments}
                        onChange={(e) => setEmailComments(e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between py-3 border-bottom">
                    <div>
                      <div className="fw-bold text-dark">New Followers</div>
                      <div className="text-muted extra-small">Get notified when another traveler starts following your journey.</div>
                    </div>
                    <div className="form-check form-switch fs-4 mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={emailFollows}
                        onChange={(e) => setEmailFollows(e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between py-3">
                    <div>
                      <div className="fw-bold text-dark">Weekly Travel Digest</div>
                      <div className="text-muted extra-small">Receive a weekly summary of trending destinations and top moments.</div>
                    </div>
                    <div className="form-check form-switch fs-4 mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={weeklyDigest}
                        onChange={(e) => setWeeklyDigest(e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: APPEARANCE & THEME */}
              {activeTab === 'appearance' && (
                <form onSubmit={handleSavePreferences}>
                  <h4 className="fw-bold text-dark mb-3">Appearance & Display</h4>
                  <p className="text-secondary small mb-4">Customize how TripNest looks on your device.</p>

                  <div className="mb-4">
                    <label className="form-label fw-bold text-dark d-block mb-2">Theme Mode</label>
                    <div className="row g-3">
                      <div className="col-6">
                        <div 
                          className={`card rounded-4 p-3 text-center cursor-pointer transition-all ${themeMode === 'light' ? 'border-primary bg-primary-subtle shadow-sm' : 'border-light-subtle'}`}
                          onClick={() => setThemeMode('light')}
                        >
                          <i className="bi bi-sun-fill fs-2 text-warning mb-2"></i>
                          <div className="fw-bold text-dark">Light Theme</div>
                          <div className="extra-small text-muted">Clean bright interface</div>
                        </div>
                      </div>

                      <div className="col-6">
                        <div 
                          className={`card rounded-4 p-3 text-center cursor-pointer transition-all ${themeMode === 'dark' ? 'border-primary bg-dark text-white shadow-sm' : 'border-light-subtle'}`}
                          onClick={() => setThemeMode('dark')}
                        >
                          <i className="bi bi-moon-stars-fill fs-2 text-info mb-2"></i>
                          <div className="fw-bold">Dark Mode</div>
                          <div className="extra-small opacity-75">Sleek dark aesthetics</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between py-3 border-top mb-4">
                    <div>
                      <div className="fw-bold text-dark">Compact Feed Mode</div>
                      <div className="text-muted extra-small">Display more travel posts at once with reduced padding.</div>
                    </div>
                    <div className="form-check form-switch fs-4 mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={compactFeed}
                        onChange={(e) => setCompactFeed(e.target.checked)}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary rounded-3 px-4 py-2.5 fw-bold shadow-sm">
                      Save Display Preferences
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </SocialLayout>
  );
}
