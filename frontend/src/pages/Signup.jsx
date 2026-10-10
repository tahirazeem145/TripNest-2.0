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

  const validateField = (field, value) => {
    switch (field) {
      case 'fullName':
        if (!value || !value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        return '';
      case 'email':
        if (!value || !value.trim()) return 'Email address is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const validateAll = () => {
    const errs = {};
    const nameErr = validateField('fullName', fullName);
    if (nameErr) errs.fullName = nameErr;

    const emailErr = validateField('email', email);
    if (emailErr) errs.email = emailErr;

    const passErr = validateField('password', password);
    if (passErr) errs.password = passErr;

    const confirmErr = validateField('confirmPassword', confirmPassword);
    if (confirmErr) errs.confirmPassword = confirmErr;

    return errs;
  };

  const handleBlur = (field, value) => {
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const validationErrors = validateAll();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setApiError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await signup(fullName.trim(), email.trim(), password);
      setSuccessMsg(res.message || 'Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const rawMessage = err.message || 'Registration failed. Please try again.';
      setApiError(rawMessage);

      if (err.field === 'email' || /already exists|already registered|in use/i.test(rawMessage)) {
        setErrors((prev) => ({
          ...prev,
          email: 'An account with this email already exists. Please sign in.'
        }));
      } else if (err.field === 'password') {
        setErrors((prev) => ({
          ...prev,
          password: rawMessage
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 p-0 overflow-hidden d-flex">
      <div className="row g-0 w-100">
        
        {/* Left Visual Column */}
        <div className="col-lg-6 d-none d-lg-block relative-container">
          <div 
            className="h-100 w-100 visual-side d-flex flex-column justify-content-between p-5 text-white"
            style={{ 
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45)), url(${travelBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="d-flex align-items-center">
              <img src="/logo.svg" alt="TripNest" style={{ height: '46px', width: '46px', objectFit: 'contain' }} className="me-2 filter-drop-shadow" />
              <span className="brand-logo-light fs-2 fw-bold">TripNest</span>
              <span className="fs-2 fw-bold text-teal ms-1">2.0</span>
            </div>

            <div className="mb-4">
              <h1 className="display-5 fw-bold leading-tight mb-3">
                Begin your journey.<br />
                Explore the world.<br />
                Connect together.
              </h1>
              <p className="lead text-light-teal opacity-90 fs-5">
                Join thousands of travelers planning unforgettable experiences.
              </p>
            </div>

            <div className="small opacity-75">
              <span>Amalfi Coast, Italy &copy; TripNest</span>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light-gray py-5 px-3 px-sm-5 scrollable-y">
          <div className="login-card w-100 p-4 p-sm-5 bg-white rounded-4 shadow-sm" style={{ maxWidth: '490px' }}>
            
            <div className="d-lg-none text-center mb-4">
              <img src="/logo.svg" alt="TripNest" style={{ height: '48px', width: '48px', objectFit: 'contain' }} className="mb-2 d-block mx-auto filter-drop-shadow" />
              <span className="brand-logo fs-2 fw-bold text-primary">TripNest</span>
              <span className="fs-2 fw-bold text-dark"> 2.0</span>
            </div>

            <div className="mb-4 text-center text-lg-start">
              <h2 className="fw-bold text-dark mb-1">Create an Account</h2>
              <p className="text-secondary">Sign up to start planning your next journey.</p>
            </div>

            {/* Success Feedback */}
            {successMsg && (
              <div className="alert alert-success border-0 rounded-3 mb-4 shadow-sm d-flex align-items-center" role="alert">
                <i className="bi bi-check-circle-fill me-2 fs-5 text-success"></i>
                <div className="small">{successMsg}</div>
              </div>
            )}

            {/* Error Feedback Banner */}
            {apiError && (
              <div className="alert alert-danger border-0 rounded-3 mb-4 shadow-sm" role="alert">
                <div className="d-flex align-items-start">
                  <i className="bi bi-exclamation-triangle-fill me-2 mt-1 text-danger fs-5"></i>
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">Registration Issue</h6>
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

            <form onSubmit={handleSubmit} noValidate>
              
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Full Name</label>
                <input
                  type="text"
                  className={`form-control rounded-3 p-3 ${errors.fullName ? 'is-invalid border-danger' : ''}`}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    if (apiError) setApiError('');
                  }}
                  onBlur={(e) => handleBlur('fullName', e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                  required
                />
                {errors.fullName && (
                  <div className="invalid-feedback d-block fw-medium mt-1">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.fullName}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email</label>
                <input
                  type="email"
                  className={`form-control rounded-3 p-3 ${errors.email ? 'is-invalid border-danger' : ''}`}
                  placeholder="name@example.com"
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
                  <div className="invalid-feedback d-block fw-medium mt-1">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <div className="position-relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control rounded-3 p-3 pe-5 ${errors.password ? 'is-invalid border-danger' : ''}`}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      if (apiError) setApiError('');
                    }}
                    onBlur={(e) => handleBlur('password', e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
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
                  <div className="invalid-feedback d-block fw-medium mt-1">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control rounded-3 p-3 ${errors.confirmPassword ? 'is-invalid border-danger' : ''}`}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    if (apiError) setApiError('');
                  }}
                  onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback d-block fw-medium mt-1">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-100 rounded-3 p-3 fw-semibold hover-effect d-flex align-items-center justify-content-center shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

            </form>

            <div className="mt-4 text-center">
              <span className="text-secondary small">Already have an account? </span>
              <Link to="/login" className="small text-decoration-none fw-semibold text-primary">
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
