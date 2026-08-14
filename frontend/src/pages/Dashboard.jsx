import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-vh-100 bg-light-gray d-flex flex-column">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-white bg-white border-bottom px-4 py-3">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <span className="brand-logo fs-3 fw-bold text-primary">TripNest</span>
            <span className="fs-3 fw-bold text-dark ms-1">2.0</span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center me-2">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="d-none d-md-block text-end">
                <div className="fw-bold small text-dark">{user?.fullName || 'Traveler'}</div>
                <div className="text-muted extra-small">{user?.email}</div>
              </div>
            </div>

            <button onClick={logout} className="btn btn-outline-danger btn-sm rounded-3 px-3">
              <i className="bi bi-box-arrow-right me-1"></i> Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="container py-5 flex-grow-1">
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <div className="mb-3">
            <i className="bi bi-compass-fill display-1 text-primary"></i>
          </div>
          <h1 className="fw-bold text-dark mb-2">Welcome to TripNest 2.0</h1>
          <p className="lead text-secondary mb-4">
            Hello, <strong>{user?.fullName || user?.email}</strong>! Real authentication & Journey management active.
          </p>

          {/* Dashboard Navigation Actions */}
          <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 mb-4">
            <Link to="/my-journeys" className="btn btn-primary rounded-3 px-4 py-3 fw-semibold">
              <i className="bi bi-journal-text me-2"></i> My Journeys
            </Link>
            <Link to="/create-journey" className="btn btn-outline-secondary rounded-3 px-4 py-3 fw-semibold">
              <i className="bi bi-plus-circle me-2"></i> Create Journey
            </Link>
          </div>

          <div className="row g-3 justify-content-center text-start mt-2" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="col-12">
              <div className="p-3 rounded-3 bg-light border">
                <h6 className="fw-bold text-dark mb-1"><i className="bi bi-person-badge-fill me-2 text-primary"></i>User Profile Info</h6>
                <div className="small text-secondary">
                  <strong>ID:</strong> {user?.id || 'N/A'}<br />
                  <strong>Email:</strong> {user?.email}<br />
                  <strong>Full Name:</strong> {user?.fullName || 'Not provided'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
