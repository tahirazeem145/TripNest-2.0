import React from 'react';
import { Link } from 'react-router-dom';

function Signup() {
  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="card shadow-sm border-0 rounded-4 p-5 text-center style-card" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="mb-4">
          <span className="brand-logo fs-3 fw-bold text-primary">TripNest</span>
          <span className="fs-3 fw-bold text-dark"> 2.0</span>
        </div>
        <h2 className="fw-bold mb-3 text-dark">Create an Account</h2>
        <p className="text-secondary mb-4">
          Join TripNest to start planning your next adventure, discovering hidden gems, and sharing memories.
        </p>
        
        <div className="alert alert-info border-0 rounded-3 text-start mb-4" role="alert">
          <i className="bi bi-info-circle-fill me-2 text-info"></i>
          <strong>Phase 1 Preview:</strong> The Signup registration form is currently under construction. Please use the Login page to preview the authentication interface.
        </div>

        <Link to="/login" className="btn btn-primary btn-lg w-100 rounded-3 mb-3 hover-effect">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default Signup;
