import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import travelBg from '../assets/travel_bg.jpg';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [apiError, setApiError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleBlur = (field, value) => {
    if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (field === 'password') {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    
    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      return;
    }
    
    setErrors({ email: '', password: '' });
    setApiError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setApiError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 p-0 overflow-hidden d-flex" style={{ backgroundColor: 'var(--tn-bg-deep)' }}>
      <div className="row g-0 w-100 min-vh-100">
        
        {/* Left column: Atmospheric Visual Travel Section */}
        <div className="col-lg-6 d-none d-lg-block position-relative">
          <div 
            className="h-100 w-100 d-flex flex-column justify-content-between p-5 text-white position-relative"
            style={{ 
              backgroundImage: `linear-gradient(180deg, rgba(8, 12, 20, 0.4) 0%, rgba(8, 12, 20, 0.85) 100%), url(${travelBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Branding logo overlay */}
            <div className="d-flex align-items-center">
              <img src="/logo.png" alt="TripNest" style={{ height: '48px', objectFit: 'contain' }} className="me-2 filter-drop-shadow" />
              <span className="brand-logo fs-2 fw-bold text-white">TripNest</span>
              <span className="fs-2 fw-bold gradient-text ms-1">2.0</span>
            </div>

            {/* Travel Tagline & Social Proof */}
            <div className="my-auto py-5">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(6, 214, 160, 0.15)', border: '1px solid rgba(6, 214, 160, 0.3)' }}>
                <i className="bi bi-shield-check text-success"></i>
                <span className="extra-small fw-bold" style={{ color: '#06d6a0', fontSize: '0.8rem' }}>120,000+ verified adventurers worldwide</span>
              </div>
              
              <h1 className="display-4 fw-bold leading-tight mb-3 font-heading">
                Discover Places.<br />
                <span className="gradient-text">Create Journeys.</span><br />
                Share Memories.
              </h1>
              <p className="lead text-muted fs-5" style={{ maxWidth: '480px' }}>
                Join an elite community of wanderers, photographers, and explorers chronicling breathtaking moments across the globe.
              </p>

              {/* Destination Badges */}
              <div className="d-flex flex-wrap gap-2 mt-4">
                <span className="destination-pill">🏝️ Santorini</span>
                <span className="destination-pill">🏔️ Swiss Alps</span>
                <span className="destination-pill">🌸 Kyoto</span>
                <span className="destination-pill">🍋 Amalfi Coast</span>
              </div>
            </div>

            {/* Photo credit */}
            <div className="small text-muted d-flex justify-content-between">
              <span>Amalfi Coast, Italy &copy; TripNest 2.0</span>
              <span className="text-info"><i className="bi bi-geo-alt-fill me-1"></i>Explore 84 Countries</span>
            </div>
          </div>
        </div>

        {/* Right column: Glassmorphic Auth Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center py-5 px-3 px-sm-5 scrollable-y">
          <div className="glass-card w-100 p-4 p-sm-5 shadow-lg" style={{ maxWidth: '490px' }}>
            
            {/* Mobile Branding */}
            <div className="d-lg-none text-center mb-4">
              <img src="/logo.png" alt="TripNest" style={{ height: '48px', objectFit: 'contain' }} className="mb-2 d-block mx-auto" />
              <span className="brand-logo fs-2 fw-bold text-white">TripNest</span>
              <span className="fs-2 fw-bold gradient-text ms-1">2.0</span>
            </div>

            {/* Header info */}
            <div className="mb-4 text-center text-lg-start">
              <h2 className="fw-bold text-white mb-1 font-heading">Welcome Back</h2>
              <p className="text-muted small">Sign in to continue exploring global journeys</p>
            </div>

            {/* Error Feedback Alert */}
            {apiError && (
              <div className="alert alert-danger border-0 rounded-3 mb-4 bg-danger bg-opacity-10 text-danger" role="alert">
                <div className="d-flex align-items-start">
                  <i className="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
                  <div>
                    <h6 className="fw-bold mb-1">Authentication Error</h6>
                    <p className="mb-0 small">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              
              {/* Email Input */}
              <div className="mb-3">
                <label htmlFor="emailInput" className="form-label small fw-semibold text-muted">
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-0 text-muted" style={{ borderColor: 'var(--tn-border)' }}>
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    id="emailInput"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid border-danger' : ''}`}
                    placeholder="explorer@wanderlust.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                {errors.email && (
                  <div className="invalid-feedback text-start mt-1 d-block">
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label htmlFor="passwordInput" className="form-label small fw-semibold text-muted mb-0">
                    Password
                  </label>
                  <a href="#forgot" className="small text-decoration-none text-info fw-medium" onClick={(e) => e.preventDefault()}>
                    Forgot password?
                  </a>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-0 text-muted">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="passwordInput"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid border-danger' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    onBlur={(e) => handleBlur('password', e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-dark border-0 text-muted"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <div className="invalid-feedback text-start mt-1 d-block">
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="gradient-btn w-100 p-3 mt-3 fw-bold d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating Journey...
                  </>
                ) : (
                  <>
                    <span>Sign In to Journey</span>
                    <i className="bi bi-arrow-right ms-2"></i>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="d-flex align-items-center my-4">
              <hr className="flex-grow-1 text-muted opacity-25" />
              <span className="mx-3 text-muted extra-small fw-bold">OR</span>
              <hr className="flex-grow-1 text-muted opacity-25" />
            </div>

            {/* Google OAuth UI button */}
            <button
              type="button"
              className="btn btn-dark w-100 rounded-3 p-3 d-flex align-items-center justify-content-center border"
              style={{ borderColor: 'var(--tn-border)' }}
              onClick={() => alert("Google OAuth authentication will be enabled with your Google Cloud Client ID in production.")}
            >
              <i className="bi bi-google me-2 text-danger fs-5"></i>
              <span className="text-light small fw-semibold">Continue with Google</span>
            </button>

            {/* Link to Signup */}
            <div className="mt-4 text-center">
              <span className="text-muted small">Ready to start your adventure? </span>
              <Link to="/signup" className="small text-decoration-none fw-bold text-info">
                Create an account
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
