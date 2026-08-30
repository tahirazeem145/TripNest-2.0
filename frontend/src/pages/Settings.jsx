import React, { useState, useEffect } from 'react';
import SocialLayout from '../layouts/SocialLayout';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();

  // Theme & Appearance (Loaded from localStorage)
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('tripnest_theme') || 'light');
  const [compactFeed, setCompactFeed] = useState(() => localStorage.getItem('tripnest_compact') === 'true');

  // Real-time Theme Application Effect
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light');
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('tripnest_theme', themeMode);
  }, [themeMode]);

  // Real-time Compact Feed Mode Effect
  useEffect(() => {
    if (compactFeed) {
      document.body.classList.add('compact-feed');
    } else {
      document.body.classList.remove('compact-feed');
    }
    localStorage.setItem('tripnest_compact', compactFeed ? 'true' : 'false');
  }, [compactFeed]);

  return (
    <SocialLayout>
      <div className="py-2 justify-content-center row">
        <div className="col-12 col-md-10 col-lg-8" style={{ maxWidth: '680px' }}>
          
          {/* Page Header */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold text-dark mb-1">
                <i className="bi bi-palette-fill text-primary me-2"></i>Appearance & Theme
              </h2>
              <p className="text-secondary mb-0">Customize how TripNest looks and displays on your device.</p>
            </div>
          </div>

          <div className="bg-white rounded-4 shadow-sm p-4 p-sm-5 border">
            
            {/* Theme Mode Selection */}
            <div className="mb-4">
              <label className="form-label fw-bold text-dark d-block mb-3">Color Theme</label>
              <div className="row g-3">
                <div className="col-6">
                  <div 
                    className={`card rounded-4 p-4 text-center cursor-pointer transition-all ${themeMode === 'dark' ? 'border-primary bg-dark text-white shadow-sm' : 'border-secondary'}`}
                    onClick={() => setThemeMode('dark')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-moon-stars-fill display-5 text-primary mb-2"></i>
                    <div className="fw-bold text-white fs-5">Black & Blue</div>
                    <div className="extra-small text-secondary mt-1">Obsidian & electric sapphire</div>
                  </div>
                </div>

                <div className="col-6">
                  <div 
                    className={`card rounded-4 p-4 text-center cursor-pointer transition-all ${themeMode === 'light' ? 'border-primary bg-primary-subtle shadow-sm' : 'border-secondary'}`}
                    onClick={() => setThemeMode('light')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-sun-fill display-5 text-warning mb-2"></i>
                    <div className="fw-bold text-dark fs-5">Light Minimal</div>
                    <div className="extra-small text-muted mt-1">Clean, bright interface</div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4 text-muted opacity-25" />

            {/* Compact Feed Mode Toggle */}
            <div className="d-flex align-items-center justify-content-between py-2">
              <div>
                <div className="fw-bold text-dark fs-6">Compact Feed Mode</div>
                <div className="text-muted small">Display more travel posts at once with reduced padding and compact cards.</div>
              </div>
              <div className="form-check form-switch fs-3 mb-0">
                <input
                  className="form-check-input cursor-pointer"
                  type="checkbox"
                  checked={compactFeed}
                  onChange={(e) => setCompactFeed(e.target.checked)}
                />
              </div>
            </div>

            <hr className="my-4 text-muted opacity-25" />

            {/* Signed In User Card & Sign Out */}
            <div className="p-3 bg-light rounded-4 d-flex align-items-center justify-content-between">
              <div>
                <div className="extra-small text-uppercase text-muted fw-bold">Signed In Account</div>
                <div className="fw-bold text-dark">{user?.fullName || 'Traveler'}</div>
                <div className="text-secondary extra-small">{user?.email}</div>
              </div>
              <button 
                onClick={logout}
                className="btn btn-outline-danger btn-sm rounded-3 px-3 fw-semibold"
              >
                <i className="bi bi-box-arrow-right me-1"></i>Sign Out
              </button>
            </div>

          </div>

        </div>
      </div>
    </SocialLayout>
  );
}

