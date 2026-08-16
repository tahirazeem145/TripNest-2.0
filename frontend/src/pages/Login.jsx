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
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
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
              <img src="/logo.png" alt="TripNest" style={{ height: '44px', objectFit: 'contain' }} className="me-2 filter-drop-shadow" />
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
              <img src="/logo.png" alt="TripNest" style={{ height: '48px', objectFit: 'contain' }} className="mb-2 d-block mx-auto" />
              <span className="brand-logo fs-2 fw-bold text-primary">TripNest</span>
              <span className="fs-2 fw-bold text-dark"> 2.0</span>
            </div>

            {/* Header info */}
            <div className="mb-4 text-center text-lg-start">
              <h2 className="fw-bold text-dark mb-1">Welcome back</h2>
              <p className="text-secondary">Sign in to continue your journey.</p>
            </div>

            {/* Error Feedback Alert */}
            {apiError && (
              <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
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
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  onBlur={(e) => handleBlur('email', e.target.value)}
                  disabled={loading}
                  required
                />
                {errors.email && (
                  <div className="invalid-feedback text-start mt-1 d-block">
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
                  <a href="#forgot" className="small text-decoration-none text-primary fw-medium" onClick={(e) => e.preventDefault()}>
                    Forgot password?
                  </a>
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
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    onBlur={(e) => handleBlur('password', e.target.value)}
                    disabled={loading}
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
                  <div className="invalid-feedback text-start mt-1 d-block">
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="btn btn-primary w-100 rounded-3 p-3 mt-3 fw-semibold hover-effect d-flex align-items-center justify-content-center"
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
              onClick={() => alert("Google OAuth authentication will be enabled with your Google Cloud Client ID in production.")}
            >
              <i className="bi bi-google me-2 text-danger fs-5"></i>
              <span>Continue with Google</span>
            </button>

            {/* Quick Demo Accounts */}
            <div className="mt-4 pt-3 border-top text-center">
              <span className="text-secondary extra-small fw-semibold d-block mb-2 text-uppercase tracking-wider">Quick Fill Demo Accounts</span>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('test@gmail.com');
                    setPassword('123456');
                    setErrors({ email: '', password: '' });
                    setApiError('');
                  }}
                  className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 extra-small fw-semibold"
                >
                  <i className="bi bi-person-fill me-1"></i>test@gmail.com
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('yuva@gmail.com');
                    setPassword('123456');
                    setErrors({ email: '', password: '' });
                    setApiError('');
                  }}
                  className="btn btn-outline-info btn-sm rounded-pill px-3 py-1 extra-small fw-semibold"
                >
                  <i className="bi bi-person-fill me-1"></i>yuva@gmail.com
                </button>
              </div>
            </div>

            {/* Link to Signup */}
            <div className="mt-3 text-center">
              <span className="text-secondary small">Don't have an account? </span>
              <Link to="/signup" className="small text-decoration-none fw-semibold text-primary">
                Sign up
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
