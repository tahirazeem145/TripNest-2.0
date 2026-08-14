import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import travelBg from '../assets/travel_bg.jpg';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Validation and API error states
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [apiResponse, setApiResponse] = useState(null);
  
  const navigate = useNavigate();

  // Basic email pattern regex
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
    
    // Validate both fields on submit
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    
    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      return;
    }
    
    setErrors({ email: '', password: '' });
    setLoading(true);
    setApiResponse(null);
    
    try {
      const response = await authService.login(email, password);
      setApiResponse(response);
    } catch (err) {
      setApiResponse({
        success: false,
        message: 'An unexpected error occurred. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = (e) => {
    e.preventDefault();
    setApiResponse({
      success: true,
      message: 'Google login simulation triggered. Google OAuth will be configured in a later phase.'
    });
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

            {/* Photo credit / subtle footer */}
            <div className="small opacity-75">
              <span>Amalfi Coast, Italy &copy; TripNest</span>
            </div>
          </div>
        </div>

        {/* Right column: Form section */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light-gray py-5 px-3 px-sm-5 scrollable-y">
          <div className="login-card w-100 p-4 p-sm-5 bg-white rounded-4 shadow-sm" style={{ maxWidth: '490px' }}>
            
            {/* Mobile Branding (only displays below desktop view) */}
            <div className="d-lg-none text-center mb-4">
              <span className="brand-logo fs-2 fw-bold text-primary">TripNest</span>
              <span className="fs-2 fw-bold text-dark"> 2.0</span>
            </div>

            {/* Header info */}
            <div className="mb-4 text-center text-lg-start">
              <h2 className="fw-bold text-dark mb-1">Welcome back</h2>
              <p className="text-secondary">Sign in to continue your journey.</p>
            </div>

            {/* Simulation feedback messages */}
            {apiResponse && (
              <div 
                className={`alert ${apiResponse.success ? 'alert-success' : 'alert-danger'} border-0 rounded-3 mb-4`} 
                role="alert"
              >
                <div className="d-flex align-items-start">
                  <i className={`bi ${apiResponse.success ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2 mt-1`}></i>
                  <div>
                    <h6 className="fw-bold mb-1">{apiResponse.success ? 'Mock auth response' : 'Verification failed'}</h6>
                    <p className="mb-0 small">{apiResponse.message}</p>
                    {apiResponse.user && (
                      <p className="mb-0 mt-1 small">
                        <strong>Simulated Session User:</strong> {apiResponse.user.email} ({apiResponse.user.role})
                      </p>
                    )}
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
                <div className="input-group-custom">
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
                    aria-describedby={errors.email ? "emailError" : undefined}
                  />
                  {errors.email && (
                    <div id="emailError" className="invalid-feedback text-start mt-1 d-block">
                      {errors.email}
                    </div>
                  )}
                </div>
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
                    aria-describedby={errors.password ? "passwordError" : undefined}
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
                  <div id="passwordError" className="invalid-feedback text-start mt-1 d-block">
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="btn btn-primary w-100 rounded-3 p-3 mt-3 fw-semibold hover-effect position-relative d-flex align-items-center justify-content-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Connecting...
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

            {/* Google OAuth placeholder button */}
            <button
              type="button"
              className="btn btn-outline-secondary w-100 rounded-3 p-3 d-flex align-items-center justify-content-center bg-white hover-effect-light"
              onClick={handleGoogleLogin}
              disabled={loading}
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
    </div>
  );
}

export default Login;
