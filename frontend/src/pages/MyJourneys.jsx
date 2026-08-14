import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { journeyService } from '../services/journeyService';
import travelBg from '../assets/travel_bg.jpg';

function MyJourneys() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJourneys = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError('');
        const data = await journeyService.getMyJourneys(token);
        setJourneys(data || []);
      } catch (err) {
        if (err.message && err.message.includes('401')) {
          logout();
          navigate('/login');
        } else {
          setError(err.message || 'Unable to load your journeys. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJourneys();
  }, [token]);

  const handleImageError = (e) => {
    e.target.src = travelBg;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-vh-100 bg-light-gray d-flex flex-column">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-white bg-white border-bottom px-4 py-3">
        <div className="container">
          <Link to="/dashboard" className="d-flex align-items-center text-decoration-none">
            <span className="brand-logo fs-3 fw-bold text-primary">TripNest</span>
            <span className="fs-3 fw-bold text-dark ms-1">2.0</span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            <Link to="/create-journey" className="btn btn-primary btn-sm rounded-3 px-3">
              <i className="bi bi-plus-lg me-1"></i> Create Journey
            </Link>
            <Link to="/dashboard" className="btn btn-outline-secondary btn-sm rounded-3 px-3">
              <i className="bi bi-house me-1"></i> Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="container py-5 flex-grow-1">
        
        {/* Header Title & Create Action */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 pb-2">
          <div>
            <h1 className="fw-bold text-dark mb-1">My Journeys</h1>
            <p className="text-secondary small mb-0">View and manage your saved trip itineraries</p>
          </div>
          <div className="mt-3 mt-sm-0">
            <Link to="/create-journey" className="btn btn-primary rounded-3 px-4 py-2 fw-semibold">
              <i className="bi bi-journal-plus me-2"></i> New Journey
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading journeys...</span>
            </div>
            <p className="text-secondary fw-medium">Retrieving your travel itineraries...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="alert alert-danger border-0 rounded-4 p-4 shadow-sm" role="alert">
            <div className="d-flex align-items-start">
              <i className="bi bi-exclamation-triangle-fill fs-3 me-3 text-danger"></i>
              <div>
                <h5 className="fw-bold mb-1">Unable to Load Journeys</h5>
                <p className="mb-0 text-secondary">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && journeys.length === 0 && (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
            <div className="mb-3">
              <i className="bi bi-compass display-2 text-primary opacity-75"></i>
            </div>
            <h3 className="fw-bold text-dark mb-2">No journeys yet</h3>
            <p className="text-secondary mb-4" style={{ maxWidth: '450px', margin: '0 auto' }}>
              Start planning your next adventure. Create your first journey to keep track of destinations, dates, and trip details.
            </p>
            <div>
              <Link to="/create-journey" className="btn btn-primary rounded-3 px-4 py-3 fw-semibold">
                <i className="bi bi-plus-circle me-2"></i> Create Your First Journey
              </Link>
            </div>
          </div>
        )}

        {/* Journeys Grid */}
        {!loading && !error && journeys.length > 0 && (
          <div className="row g-4">
            {journeys.map((journey) => (
              <div key={journey.id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden style-card bg-white">
                  
                  {/* Card Image */}
                  <div className="position-relative" style={{ height: '200px', backgroundColor: '#e2e8f0' }}>
                    <img
                      src={journey.cover_image_url || travelBg}
                      alt={journey.title}
                      onError={handleImageError}
                      className="w-100 h-100 object-fit-cover"
                    />
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="badge bg-white text-dark shadow-sm px-3 py-2 rounded-pill fw-semibold border">
                        <i className="bi bi-tag-fill me-1 text-primary"></i>
                        {journey.travel_type || 'Solo'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body p-4 d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="fw-bold text-dark mb-2 leading-tight">{journey.title}</h5>
                      <div className="text-primary fw-medium small mb-3">
                        <i className="bi bi-geo-alt-fill me-1"></i> {journey.destination}
                      </div>

                      {journey.description && (
                        <p className="text-secondary small mb-3 text-truncate-2" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {journey.description}
                        </p>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="pt-3 border-top mt-2">
                      <div className="d-flex align-items-center justify-content-between text-secondary extra-small mb-2">
                        <span>
                          <i className="bi bi-calendar-event me-1"></i>
                          {formatDate(journey.start_date)} - {formatDate(journey.end_date)}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between small fw-medium text-dark">
                        <span>
                          <i className="bi bi-people-fill me-1 text-secondary"></i>
                          {journey.travelers} {journey.travelers === 1 ? 'Traveler' : 'Travelers'}
                        </span>
                        {journey.budget !== null && journey.budget !== undefined && (
                          <span className="text-teal fw-bold">
                            ${Number(journey.budget).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyJourneys;
