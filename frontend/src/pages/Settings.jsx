import React, { useState, useEffect } from 'react';
import SocialLayout from '../layouts/SocialLayout';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, logout } = useAuth();

  // Theme & Appearance (Loaded from localStorage)
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('tripnest_theme') || 'dark');
  const [compactFeed, setCompactFeed] = useState(() => localStorage.getItem('tripnest_compact') === 'true');

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
        <div className="col-12 col-md-10 col-lg-8" style={{ maxWidth: '720px' }}>
          
          {/* Page Header */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="fw-bold text-white mb-1 font-heading">
                Settings & <span className="gradient-text">Preferences</span>
              </h2>
              <p className="text-muted small mb-0">Configure appearance, account controls, and feed layout.</p>
            </div>
          </div>

          <div className="glass-card p-4 p-sm-5 shadow-lg">
            
            {/* Theme Mode Selection */}
            <div className="mb-4">
              <label className="form-label fw-bold text-white d-block mb-3 font-heading">Interface Color Theme</label>
              <div className="row g-3">
                <div className="col-6">
                  <div 
                    className={`glass-card p-4 text-center cursor-pointer transition-all ${themeMode === 'dark' ? 'border-info shadow' : ''}`}
                    onClick={() => setThemeMode('dark')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-moon-stars-fill display-5 text-info mb-2"></i>
                    <div className="fw-bold text-white fs-6 font-heading">Midnight Horizon</div>
                    <div className="extra-small text-muted mt-1" style={{ fontSize: '0.75rem' }}>Default dark travel theme</div>
                  </div>
                </div>

                <div className="col-6">
                  <div 
                    className={`glass-card p-4 text-center cursor-pointer transition-all ${themeMode === 'light' ? 'border-info shadow' : ''}`}
                    onClick={() => setThemeMode('light')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-sun-fill display-5 text-warning mb-2"></i>
                    <div className="fw-bold text-white fs-6 font-heading">Daylight Explorer</div>
                    <div className="extra-small text-muted mt-1" style={{ fontSize: '0.75rem' }}>Bright sunshine theme</div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4" style={{ borderColor: 'var(--tn-border)' }} />

            {/* Compact Feed Mode Toggle */}
            <div className="d-flex align-items-center justify-content-between py-2">
              <div>
                <div className="fw-bold text-white fs-6 font-heading">Compact Feed Mode</div>
                <div className="text-muted small">Display higher density cards for rapid destination browsing.</div>
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

            <hr className="my-4" style={{ borderColor: 'var(--tn-border)' }} />

            {/* Signed In User Card & Sign Out */}
            <div className="p-3 glass-card rounded-4 d-flex align-items-center justify-content-between">
              <div>
                <div className="extra-small text-uppercase text-info fw-bold" style={{ fontSize: '0.7rem' }}>Signed In Explorer</div>
                <div className="fw-bold text-white">{user?.fullName || 'Traveler'}</div>
                <div className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
              </div>
              <button 
                onClick={logout}
                className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
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
