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
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState({ loading: false, message: '', isSuccess: false });

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (value) => {
    if (!value || !value.trim()) return 'Email address is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleBlur = (field, value) => {
    if (field === 'email') {
      const err = validateEmail(value);
      setErrors((prev) => ({ ...prev, email: err }));
    } else if (field === 'password') {
      const err = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: err }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
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
      await login(email.trim(), password);
      navigate('/home');
    } catch (err) {
      const rawMessage = err.message || 'Authentication failed. Please verify your credentials.';
      setApiError(rawMessage);

      // Explicitly mark relevant form field based on error classification
      if (err.field === 'password' || /password|credentials|invalid_grant|incorrect/i.test(rawMessage)) {
        setErrors((prev) => ({
          ...prev,
          password: 'Invalid password. Please check your password and try again.'
        }));
      } else if (err.field === 'email' || /user not found|account found|unregistered/i.test(rawMessage)) {
        setErrors((prev) => ({
          ...prev,
          email: 'No account registered with this email address.'
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    const err = validateEmail(forgotEmail);
    if (err) {
      setForgotStatus({ loading: false, message: err, isSuccess: false });
      return;
    }
    setForgotStatus({ loading: true, message: '', isSuccess: false });
    setTimeout(() => {
      setForgotStatus({
        loading: false,
        message: `If an account exists for ${forgotEmail}, password recovery instructions have been dispatched.`,
        isSuccess: true
      });
    }, 1000);
  };

  return (
    <div className="container-fluid min-vh-100 p-0 overflow-hidden d-flex">
      <div className="row g-0 w-100">
        
        {/* Left column: Visual Travel section (desktop only) */}
        <div className="col-lg-6 d-none d-lg-block relative-container">
          <div 
            className="h-100 w-100 visual-side d-flex flex-column justify-content-between p-5 text-white"
            style={{ 
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45)), url(${travelBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Branding logo overlay */}
            <div className="d-flex align-items-center">
              <img src="/logo.svg" alt="TripNest" style={{ height: '46px', width: '46px', objectFit: 'contain' }} className="me-2 filter-drop-shadow" />
              <span className="brand-logo-light fs-2 fw-bold">TripNest</span>
              <span className="fs-2 fw-bold text-teal ms-1">2.0</span>
            </div>

            {/* Travel tagline */}
            <div className="mb-4">
              <h1 className="display-5 fw-bold leading-tight mb-3">
                Discover places.<br />
                Create journeys.<br />
                Share memories.
              </h1>
              <p className="lead text-light-teal opacity-90 fs-5">
                Start your next adventure with the ultimate travel companion app.
              </p>
            </div>

            {/* Photo credit */}
            <div className="small opacity-75">
              <span>Amalfi Coast, Italy &copy; TripNest</span>
            </div>
          </div>
        </div>

        {/* Right column: Form section */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light-gray py-5 px-3 px-sm-5 scrollable-y">
          <div className="login-card w-100 p-4 p-sm-5 bg-white rounded-4 shadow-sm" style={{ maxWidth: '490px' }}>
            
            {/* Mobile Branding */}
            <div className="d-lg-none text-center mb-4">
              <img src="/logo.svg" alt="TripNest" style={{ height: '48px', width: '48px', objectFit: 'contain' }} className="mb-2 d-block mx-auto filter-drop-shadow" />
              <span className="brand-logo fs-2 fw-bold text-primary">TripNest</span>
              <span className="fs-2 fw-bold text-dark"> 2.0</span>
            </div>

            {/* Header info */}
            <div className="mb-4 text-center text-lg-start">
              <h2 className="fw-bold text-dark mb-1">Welcome back</h2>
              <p className="text-secondary">Sign in to continue your journey.</p>
            </div>

            {/* Error Feedback Alert Banner */}
            {apiError && (
              <div className="alert alert-danger border-0 rounded-3 mb-4 shadow-sm" role="alert">
                <div className="d-flex align-items-start">
                  <i className="bi bi-exclamation-triangle-fill me-2 mt-1 text-danger fs-5"></i>
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">Unable to Sign In</h6>
                    <p className="mb-0 small">{apiError}</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn-close ms-2 small" 
                    aria-label="Close" 
                    onClick={() => setApiError('')}
                  ></button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              
              {/* Email Input */}
              <div className="mb-3">
                <label htmlFor="emailInput" className="form-label small fw-semibold text-secondary">
                  Email
                </label>
                <input
                  type="email"
                  id="emailInput"
                  name="email"
                  className={`form-control rounded-3 p-3 ${errors.email ? 'is-invalid border-danger' : ''}`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    if (apiError) setApiError('');
                  }}
                  onBlur={(e) => handleBlur('email', e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
                {errors.email && (
                  <div className="invalid-feedback text-start mt-1 d-block fw-medium">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label htmlFor="passwordInput" className="form-label small fw-semibold text-secondary mb-0">
                    Password
                  </label>
                  <button
                    type="button"
                    className="btn btn-link p-0 small text-decoration-none text-primary fw-medium"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="position-relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="passwordInput"
                    name="password"
                    className={`form-control rounded-3 p-3 pe-5 ${errors.password ? 'is-invalid border-danger' : ''}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      if (apiError) setApiError('');
                    }}
                    onBlur={(e) => handleBlur('password', e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-2 p-2 text-secondary focus-ring-none"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} fs-5`}></i>
                  </button>
                </div>
                {errors.password && (
                  <div className="invalid-feedback text-start mt-1 d-block fw-medium">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="btn btn-primary w-100 rounded-3 p-3 mt-3 fw-semibold hover-effect d-flex align-items-center justify-content-center shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="d-flex align-items-center my-4">
              <hr className="flex-grow-1 text-muted opacity-25" />
              <span className="mx-3 text-secondary small fw-bold">OR</span>
              <hr className="flex-grow-1 text-muted opacity-25" />
            </div>

            {/* Google OAuth UI button */}
            <button
              type="button"
              className="btn btn-outline-secondary w-100 rounded-3 p-3 d-flex align-items-center justify-content-center bg-white opacity-75"
              onClick={() => alert("Google OAuth authentication is enabled with your Google Cloud Client ID in production.")}
            >
              <i className="bi bi-google me-2 text-danger fs-5"></i>
              <span>Continue with Google</span>
            </button>

            {/* Link to Signup */}
            <div className="mt-4 text-center">
              <span className="text-secondary small">Don't have an account? </span>
              <Link to="/signup" className="small text-decoration-none fw-semibold text-primary">
                Sign up
              </Link>
            </div>

          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg p-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Reset Your Password</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStatus({ loading: false, message: '', isSuccess: false });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-secondary small mb-3">
                  Enter the email associated with your TripNest account and we'll send you a link to reset your password.
                </p>
                {forgotStatus.message && (
                  <div className={`alert ${forgotStatus.isSuccess ? 'alert-success' : 'alert-danger'} border-0 rounded-3 small mb-3`}>
                    {forgotStatus.message}
                  </div>
                )}
                {!forgotStatus.isSuccess && (
                  <form onSubmit={handleForgotPasswordSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">Email Address</label>
                      <input
                        type="email"
                        className="form-control rounded-3 p-3"
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        disabled={forgotStatus.loading}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 rounded-3 p-3 fw-semibold d-flex align-items-center justify-content-center"
                      disabled={forgotStatus.loading}
                    >
                      {forgotStatus.loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Sending Reset Instructions...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Login;
