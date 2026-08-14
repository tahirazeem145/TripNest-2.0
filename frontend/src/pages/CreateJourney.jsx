import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { journeyService } from '../services/journeyService';

function CreateJourney() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    description: '',
    startDate: '',
    endDate: '',
    coverImageUrl: '',
    travelType: 'Solo',
    budget: '',
    travelers: 1
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.title || !formData.title.trim()) {
      errs.title = 'Title is required';
    }
    if (!formData.destination || !formData.destination.trim()) {
      errs.destination = 'Destination is required';
    }
    if (!formData.startDate) {
      errs.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      errs.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errs.endDate = 'End date cannot be before start date';
    }
    if (formData.travelers < 1) {
      errs.travelers = 'Travelers count must be at least 1';
    }
    if (formData.budget !== '' && parseFloat(formData.budget) < 0) {
      errs.budget = 'Budget must be greater than or equal to 0';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        destination: formData.destination.trim(),
        description: formData.description.trim() || null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        coverImageUrl: formData.coverImageUrl.trim() || null,
        travelType: formData.travelType,
        budget: formData.budget !== '' ? parseFloat(formData.budget) : null,
        travelers: parseInt(formData.travelers, 10) || 1
      };

      await journeyService.createJourney(token, payload);
      navigate('/my-journeys');
    } catch (err) {
      if (err.message && err.message.includes('401')) {
        logout();
        navigate('/login');
      } else {
        setApiError(err.message || 'Failed to create journey. Please check your inputs.');
      }
    } finally {
      setLoading(false);
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
            <Link to="/my-journeys" className="btn btn-outline-secondary btn-sm rounded-3 px-3">
              <i className="bi bi-compass me-1"></i> My Journeys
            </Link>
            <Link to="/dashboard" className="btn btn-outline-secondary btn-sm rounded-3 px-3">
              <i className="bi bi-house me-1"></i> Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="container py-5 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10 col-12">
            
            {/* Card Container */}
            <div className="bg-white rounded-4 shadow-sm p-4 p-sm-5 border">
              <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div>
                  <h2 className="fw-bold text-dark mb-1">Create New Journey</h2>
                  <p className="text-secondary small mb-0">Plan your next adventure with TripNest 2.0</p>
                </div>
                <div className="bg-teal-light p-3 rounded-circle d-none d-sm-block">
                  <i className="bi bi-journal-plus fs-3 text-teal"></i>
                </div>
              </div>

              {/* Alert Feedback */}
              {apiError && (
                <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-exclamation-triangle-fill me-2 mt-1"></i>
                    <div>
                      <h6 className="fw-bold mb-1">Submission Error</h6>
                      <p className="mb-0 small">{apiError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  
                  {/* Title */}
                  <div className="col-12">
                    <label htmlFor="title" className="form-label small fw-semibold text-secondary">
                      Journey Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className={`form-control rounded-3 p-3 ${errors.title ? 'is-invalid' : ''}`}
                      placeholder="e.g. Summer Vacation in Amalfi Coast"
                      value={formData.title}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                  </div>

                  {/* Destination */}
                  <div className="col-12">
                    <label htmlFor="destination" className="form-label small fw-semibold text-secondary">
                      Destination <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="destination"
                      name="destination"
                      className={`form-control rounded-3 p-3 ${errors.destination ? 'is-invalid' : ''}`}
                      placeholder="e.g. Positano, Amalfi Coast, Italy"
                      value={formData.destination}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.destination && <div className="invalid-feedback">{errors.destination}</div>}
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label htmlFor="description" className="form-label small fw-semibold text-secondary">
                      Description / Itinerary Notes
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      className="form-control rounded-3 p-3"
                      placeholder="Share details about your trip plans, highlights, or itinerary..."
                      value={formData.description}
                      onChange={handleChange}
                      disabled={loading}
                    ></textarea>
                  </div>

                  {/* Start Date */}
                  <div className="col-md-6 col-12">
                    <label htmlFor="startDate" className="form-label small fw-semibold text-secondary">
                      Start Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      className={`form-control rounded-3 p-3 ${errors.startDate ? 'is-invalid' : ''}`}
                      value={formData.startDate}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
                  </div>

                  {/* End Date */}
                  <div className="col-md-6 col-12">
                    <label htmlFor="endDate" className="form-label small fw-semibold text-secondary">
                      End Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      className={`form-control rounded-3 p-3 ${errors.endDate ? 'is-invalid' : ''}`}
                      value={formData.endDate}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
                  </div>

                  {/* Cover Image URL */}
                  <div className="col-12">
                    <label htmlFor="coverImageUrl" className="form-label small fw-semibold text-secondary">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      id="coverImageUrl"
                      name="coverImageUrl"
                      className="form-control rounded-3 p-3"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.coverImageUrl}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <div className="form-text extra-small text-muted">Provide a direct image URL or leave blank for default travel cover.</div>
                  </div>

                  {/* Travel Type */}
                  <div className="col-md-4 col-12">
                    <label htmlFor="travelType" className="form-label small fw-semibold text-secondary">
                      Travel Type
                    </label>
                    <select
                      id="travelType"
                      name="travelType"
                      className="form-select form-control rounded-3 p-3"
                      value={formData.travelType}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="Solo">Solo</option>
                      <option value="Couple">Couple</option>
                      <option value="Family">Family</option>
                      <option value="Friends">Friends</option>
                      <option value="Group">Group</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div className="col-md-4 col-12">
                    <label htmlFor="budget" className="form-label small fw-semibold text-secondary">
                      Budget ($)
                    </label>
                    <input
                      type="number"
                      id="budget"
                      name="budget"
                      step="0.01"
                      min="0"
                      className={`form-control rounded-3 p-3 ${errors.budget ? 'is-invalid' : ''}`}
                      placeholder="0.00"
                      value={formData.budget}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.budget && <div className="invalid-feedback">{errors.budget}</div>}
                  </div>

                  {/* Travelers */}
                  <div className="col-md-4 col-12">
                    <label htmlFor="travelers" className="form-label small fw-semibold text-secondary">
                      Travelers Count
                    </label>
                    <input
                      type="number"
                      id="travelers"
                      name="travelers"
                      min="1"
                      className={`form-control rounded-3 p-3 ${errors.travelers ? 'is-invalid' : ''}`}
                      value={formData.travelers}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.travelers && <div className="invalid-feedback">{errors.travelers}</div>}
                  </div>

                </div>

                {/* Submit Action */}
                <div className="d-flex align-items-center justify-content-end gap-3 mt-4 pt-3 border-top">
                  <Link to="/my-journeys" className="btn btn-outline-secondary rounded-3 px-4 py-2">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-3 px-4 py-2 fw-semibold d-flex align-items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving Journey...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1"></i> Save Journey
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateJourney;
