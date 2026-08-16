import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';

export default function SocialLayout({ children }) {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Periodic lightweight check for unread notifications (every 30 seconds)
  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      if (!token) return;
      try {
        const list = await socialService.getNotifications(token);
        if (isMounted && Array.isArray(list)) {
          const unread = list.filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch {
        // Non-fatal
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/home', icon: 'bi-house-door', activeIcon: 'bi-house-door-fill', label: 'Home' },
    { to: '/following', icon: 'bi-people', activeIcon: 'bi-people-fill', label: 'Following' },
    { to: '/travelers', icon: 'bi-compass', activeIcon: 'bi-compass-fill', label: 'Explore' },
    { 
      to: '/notifications', 
      icon: 'bi-heart', 
      activeIcon: 'bi-heart-fill', 
      label: 'Notifications',
      badge: unreadCount 
    },
    { to: '/create', icon: 'bi-plus-square', activeIcon: 'bi-plus-square-fill', label: 'Create' },
    { to: '/saved', icon: 'bi-bookmark', activeIcon: 'bi-bookmark-fill', label: 'Saved' },
    { to: '/profile', icon: 'bi-person', activeIcon: 'bi-person-fill', label: 'Profile' },
    { to: '/settings', icon: 'bi-gear', activeIcon: 'bi-gear-fill', label: 'Settings' },
  ];

  return (
    <div className="min-vh-100 bg-light-gray d-flex flex-column">
      
      {/* Mobile Top Header */}
      <header className="d-lg-none navbar navbar-white bg-white border-bottom px-3 py-2 sticky-top shadow-sm">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <Link to="/home" className="d-flex align-items-center text-decoration-none">
            <img src="/logo.png" alt="TripNest" style={{ height: '34px', objectFit: 'contain' }} className="me-2" />
            <span className="brand-logo fs-3 fw-bold text-primary">TripNest</span>
            <span className="fs-3 fw-bold text-dark ms-1">2.0</span>
          </Link>
          
          <div className="d-flex align-items-center gap-2">
            <Link to="/notifications" className="btn btn-light rounded-circle p-2 position-relative" aria-label="Notifications">
              <i className="bi bi-heart fs-5 text-dark"></i>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link to="/settings" className="btn btn-light rounded-circle p-2" aria-label="Settings">
              <i className="bi bi-gear fs-5 text-dark"></i>
            </Link>
            <Link to="/profile" className="d-flex align-items-center text-decoration-none">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main App Grid Layout */}
      <div className="container-fluid flex-grow-1 p-0">
        <div className="row g-0">
          
          {/* Desktop Left Sidebar (Fixed / Sticky) */}
          <aside className="col-lg-3 col-xl-2 d-none d-lg-flex flex-column justify-content-between bg-white border-end vh-100 sticky-top p-4">
            <div>
              {/* Brand Logo */}
              <Link to="/home" className="d-flex align-items-center text-decoration-none mb-4 pb-2 px-2">
                <img src="/logo.png" alt="TripNest" style={{ height: '40px', objectFit: 'contain' }} className="me-2" />
                <span className="brand-logo fs-3 fw-bold text-primary">TripNest</span>
                <span className="fs-3 fw-bold text-dark ms-1">2.0</span>
              </Link>

              {/* Navigation Links */}
              <nav className="nav flex-column gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center justify-content-between px-3 py-2 rounded-4 fw-medium text-dark transition-all ${
                        isActive ? 'bg-primary text-white shadow-sm fw-bold' : 'hover-bg-light text-secondary'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="d-flex align-items-center gap-3">
                          <i className={`bi ${isActive ? item.activeIcon : item.icon} fs-5`}></i>
                          <span className="fs-6">{item.label}</span>
                        </div>
                        {item.badge > 0 && (
                          <span className={`badge rounded-pill ${isActive ? 'bg-white text-primary' : 'bg-danger text-white'}`} style={{ fontSize: '0.7rem' }}>
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Bottom User Profile Card & Sign Out */}
            <div className="pt-3 border-top">
              <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                <Link to="/profile" className="d-flex align-items-center text-decoration-none text-dark flex-grow-1 overflow-hidden me-2">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-2 flex-shrink-0" style={{ width: '38px', height: '38px' }}>
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="fw-bold small text-truncate">{user?.fullName || 'Traveler'}</div>
                    <div className="text-muted extra-small text-truncate">{user?.email}</div>
                  </div>
                </Link>
                
                <button onClick={handleLogout} className="btn btn-light btn-sm rounded-circle p-2" title="Sign Out">
                  <i className="bi bi-box-arrow-right text-danger"></i>
                </button>
              </div>
            </div>
          </aside>

          {/* Center Main Content Area */}
          <main className="col-12 col-lg-9 col-xl-10 p-3 p-sm-4 p-md-5 pb-5 mb-5 mb-lg-0">
            <div className="container" style={{ maxWidth: '960px' }}>
              {children}
            </div>
          </main>

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="d-lg-none fixed-bottom bg-white border-top py-2 px-3 shadow-lg z-3">
        <div className="d-flex justify-content-around align-items-center">
          <NavLink to="/home" className={({ isActive }) => `text-decoration-none p-2 ${isActive ? 'text-primary' : 'text-secondary'}`}>
            <i className="bi bi-house-door fs-4"></i>
          </NavLink>
          
          <NavLink to="/following" className={({ isActive }) => `text-decoration-none p-2 ${isActive ? 'text-primary' : 'text-secondary'}`}>
            <i className="bi bi-people fs-4"></i>
          </NavLink>

          <NavLink to="/create" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '48px', height: '48px', marginTop: '-15px' }}>
            <i className="bi bi-plus-lg fs-4 text-white"></i>
          </NavLink>

          <NavLink to="/travelers" className={({ isActive }) => `text-decoration-none p-2 ${isActive ? 'text-primary' : 'text-secondary'}`}>
            <i className="bi bi-compass fs-4"></i>
          </NavLink>

          <NavLink to="/profile" className={({ isActive }) => `text-decoration-none p-2 ${isActive ? 'text-primary' : 'text-secondary'}`}>
            <i className="bi bi-person fs-4"></i>
          </NavLink>
        </div>
      </nav>

    </div>
  );
}
