import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import travelBg from '../assets/travel_bg.jpg';

function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    
    if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match';
    }
    
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setApiError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await signup(fullName, email, password);
      setSuccessMsg(res.message || 'Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 p-0 overflow-hidden d-flex" style={{ backgroundColor: 'var(--tn-bg-deep)' }}>
      <div className="row g-0 w-100 min-vh-100">
        
        {/* Left Visual Column */}
        <div className="col-lg-6 d-none d-lg-block position-relative">
          <div 
            className="h-100 w-100 d-flex flex-column justify-content-between p-5 text-white position-relative"
            style={{ 
              backgroundImage: `linear-gradient(180deg, rgba(8, 12, 20, 0.4) 0%, rgba(8, 12, 20, 0.85) 100%), url(${travelBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="d-flex align-items-center">
              <img src="/logo.png" alt="TripNest" style={{ height: '48px', objectFit: 'contain' }} className="me-2 filter-drop-shadow" />
              <span className="brand-logo fs-2 fw-bold text-white">TripNest</span>
              <span className="fs-2 fw-bold gradient-text ms-1">2.0</span>
            </div>

            <div className="my-auto py-5">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(0, 166, 251, 0.15)', border: '1px solid rgba(0, 166, 251, 0.3)' }}>
                <i className="bi bi-compass text-info"></i>
                <span className="extra-small fw-bold text-info" style={{ fontSize: '0.8rem' }}>Create Your Traveler Passport</span>
              </div>

              <h1 className="display-4 fw-bold leading-tight mb-3 font-heading">
                Begin Your Journey.<br />
                <span className="gradient-text">Explore The Globe.</span><br />
                Connect Together.
              </h1>
              <p className="lead text-muted fs-5" style={{ maxWidth: '480px' }}>
                Join thousands of travelers sharing photo albums, itineraries, hidden spots, and local recommendations.
              </p>

              {/* Feature Highlights */}
              <div className="d-flex flex-column gap-2 mt-4 text-muted small">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span>Uncompressed multi-photo album carousels</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span>Interactive destination discovery and travel maps</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span>Verified adventurer milestones and badges</span>
                </div>
              </div>
            </div>

            <div className="small text-muted d-flex justify-content-between">
              <span>Positano, Italy &copy; TripNest 2.0</span>
              <span className="text-info">Start Free Exploration</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center py-5 px-3 px-sm-5 scrollable-y">
          <div className="glass-card w-100 p-4 p-sm-5 shadow-lg" style={{ maxWidth: '520px' }}>
            
            {/* Mobile Branding */}
            <div className="d-lg-none text-center mb-4">
              <img src="/logo.png" alt="TripNest" style={{ height: '48px', objectFit: 'contain' }} className="mb-2 d-block mx-auto" />
              <span className="brand-logo fs-2 fw-bold text-white">TripNest</span>
              <span className="fs-2 fw-bold gradient-text ms-1">2.0</span>
            </div>

            <div className="mb-4 text-center text-lg-start">
              <h2 className="fw-bold text-white mb-1 font-heading">Create Explorer Account</h2>
              <p className="text-muted small">Join the TripNest 2.0 social travel community</p>
            </div>

            {/* Success and Error Alerts */}
            {successMsg && (
              <div className="alert alert-success border-0 rounded-3 mb-4 bg-success bg-opacity-10 text-success" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>{successMsg}
              </div>
            )}

            {apiError && (
              <div className="alert alert-danger border-0 rounded-3 mb-4 bg-danger bg-opacity-10 text-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>{apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-0 text-muted">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control ${errors.fullName ? 'is-invalid border-danger' : ''}`}
                    placeholder="Kenji Sato"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                {errors.fullName && <div className="invalid-feedback d-block">{errors.fullName}</div>}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-0 text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid border-danger' : ''}`}
                    placeholder="kenji@wanderlust.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Password (min 6 chars)</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-0 text-muted">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${errors.password ? 'is-invalid border-danger' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-dark border-0 text-muted"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-0 text-muted">
                    <i className="bi bi-shield-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${errors.confirmPassword ? 'is-invalid border-danger' : ''}`}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="gradient-btn w-100 p-3 fw-bold d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating Passport...
                  </>
                ) : (
                  <>
                    <span>Create Passport & Join</span>
                    <i className="bi bi-arrow-right ms-2"></i>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <span className="text-muted small">Already have an account? </span>
              <Link to="/login" className="small text-decoration-none fw-bold text-info">
                Sign in
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Signup;
