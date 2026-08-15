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
      setSuccessMsg(res.message || 'Account created successfully! Redirecting to login...');
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
              <span className="brand-logo fs-2 fw-bold text-primary">TripNest</span>
              <span className="fs-2 fw-bold text-dark"> 2.0</span>
            </div>

            <div className="mb-4 text-center text-lg-start">
              <h2 className="fw-bold text-dark mb-1">Create an Account</h2>
              <p className="text-secondary">Sign up to start planning your next journey.</p>
            </div>

            {/* Success Feedback */}
            {successMsg && (
              <div className="alert alert-success border-0 rounded-3 mb-4" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                {successMsg}
              </div>
            )}

            {/* Error Feedback */}
            {apiError && (
              <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Full Name</label>
                <input
                  type="text"
                  className={`form-control rounded-3 p-3 ${errors.fullName ? 'is-invalid' : ''}`}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
                {errors.fullName && <div className="invalid-feedback d-block">{errors.fullName}</div>}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Email</label>
                <input
                  type="email"
                  className={`form-control rounded-3 p-3 ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Password</label>
                <div className="position-relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control rounded-3 p-3 pe-5 ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn border-0 position-absolute end-0 top-50 translate-middle-y me-2 p-2 text-secondary focus-ring-none"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} fs-5`}></i>
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-secondary">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control rounded-3 p-3 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
                {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-100 rounded-3 p-3 fw-semibold hover-effect d-flex align-items-center justify-content-center"
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
