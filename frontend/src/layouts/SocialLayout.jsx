import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socialService } from '../services/socialService';

export default function SocialLayout({ children }) {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

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
    { to: '/home', icon: 'bi-house-door', activeIcon: 'bi-house-door-fill', label: 'Discovery Feed' },
    { to: '/following', icon: 'bi-people', activeIcon: 'bi-people-fill', label: 'Following' },
    { to: '/travelers', icon: 'bi-compass', activeIcon: 'bi-compass-fill', label: 'Explore Destinations' },
    { 
      to: '/notifications', 
      icon: 'bi-bell', 
      activeIcon: 'bi-bell-fill', 
      label: 'Notifications',
      badge: unreadCount 
    },
    { to: '/create', icon: 'bi-plus-circle', activeIcon: 'bi-plus-circle-fill', label: 'Share Journey' },
    { to: '/saved', icon: 'bi-bookmark', activeIcon: 'bi-bookmark-fill', label: 'Saved Moments' },
    { to: '/profile', icon: 'bi-person', activeIcon: 'bi-person-fill', label: 'My Passport' },
    { to: '/settings', icon: 'bi-sliders', activeIcon: 'bi-sliders', label: 'Settings' },
  ];

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--tn-bg-deep)' }}>
      
      {/* Mobile Top Header */}
      <header className="d-lg-none glass-navbar px-3 py-2 sticky-top">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <Link to="/home" className="d-flex align-items-center text-decoration-none">
            <img src="/logo.png" alt="TripNest" style={{ height: '32px', objectFit: 'contain' }} className="me-2" />
            <span className="brand-logo fs-4 fw-bold text-white">TripNest</span>
            <span className="fs-4 fw-bold gradient-text ms-1">2.0</span>
          </Link>
          
          <div className="d-flex align-items-center gap-2">
            <Link to="/notifications" className="btn btn-dark rounded-circle p-2 position-relative border" style={{ borderColor: 'var(--tn-border)' }} aria-label="Notifications">
              <i className="bi bi-bell text-light"></i>
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="d-flex align-items-center text-decoration-none ms-1">
              <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, var(--tn-primary), var(--tn-secondary))', color: '#fff', fontSize: '0.85rem' }}>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'T'}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main App Grid Layout */}
      <div className="container-fluid flex-grow-1 p-0">
        <div className="row g-0">
          
          {/* Desktop Left Sidebar (Fixed / Glassmorphic) */}
          <aside className="col-lg-3 col-xl-2 d-none d-lg-flex flex-column justify-content-between vh-100 sticky-top p-4 glass-panel" style={{ borderRight: '1px solid var(--tn-border)' }}>
            <div>
              {/* Brand Logo */}
              <Link to="/home" className="d-flex align-items-center text-decoration-none mb-4 pb-2 px-2">
                <img src="/logo.png" alt="TripNest" style={{ height: '42px', objectFit: 'contain' }} className="me-2" />
                <span className="brand-logo fs-3 fw-bold text-white">TripNest</span>
                <span className="fs-3 fw-bold gradient-text ms-1">2.0</span>
              </Link>

              {/* Navigation Links */}
              <nav className="nav flex-column gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-link-custom ${isActive ? 'active' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <div className="d-flex align-items-center justify-content-between w-100">
                        <div className="d-flex align-items-center gap-3">
                          <i className={`bi ${isActive ? item.activeIcon : item.icon} fs-5`} style={{ color: isActive ? 'var(--tn-primary)' : 'var(--tn-text-muted)' }}></i>
                          <span>{item.label}</span>
                        </div>
                        {item.badge > 0 && (
                          <span className="badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Bottom User Profile Card & Sign Out */}
            <div className="pt-3" style={{ borderTop: '1px solid var(--tn-border)' }}>
              <div className="d-flex align-items-center justify-content-between px-2">
                <Link to="/profile" className="d-flex align-items-center text-decoration-none text-white flex-grow-1 overflow-hidden me-2">
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold me-2 flex-shrink-0" style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, var(--tn-primary), var(--tn-secondary))', color: '#fff' }}>
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div className="overflow-hidden">
                    <div className="fw-bold small text-truncate text-white">{user?.fullName || 'Explorer'}</div>
                    <div className="text-muted extra-small text-truncate" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
                  </div>
                </Link>
                
                <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm rounded-circle p-2 border-0" title="Sign Out" style={{ color: 'var(--tn-text-muted)' }}>
                  <i className="bi bi-box-arrow-right fs-5 text-danger"></i>
                </button>
              </div>
            </div>
          </aside>

          {/* Center Main Content Area */}
          <main className="col-12 col-lg-9 col-xl-10 p-3 p-sm-4 p-md-5 pb-5 mb-5 mb-lg-0">
            <div className="container" style={{ maxWidth: '1040px' }}>
              {children}
            </div>
          </main>

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="d-lg-none fixed-bottom glass-navbar py-2 px-3 shadow-lg z-3">
        <div className="d-flex justify-content-around align-items-center">
          <NavLink to="/home" className={({ isActive }) => `text-decoration-none p-2 ${isActive ? 'text-info fw-bold' : 'text-secondary'}`}>
            <i className="bi bi-house-door fs-4"></i>
          </NavLink>
          
          <NavLink to="/following" className={({ isActive }) => `text-decoration-none p-2 ${isActive ? 'text-info fw-bold' : 'text-secondary'}`}>
            <i className="bi bi-people fs-4"></i>
          </NavLink>

          <NavLink to="/create" className="gradient-btn rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '48px', height: '48px', marginTop: '-15px' }}>
            <i className="bi bi-plus-lg fs-4 text-white"></i>
          </NavLink>

          <NavLink to="/travelers" className={({ isActive }) => `text-decoration-none p-2 ${isActive ? 'text-info fw-bold' : 'text-secondary'}`}>
            <i className="bi bi-compass fs-4"></i>
          </NavLink>

          <NavLink to="/profile" className={({ isActive }) => `text-decoration-none p-2 ${isActive ? 'text-info fw-bold' : 'text-secondary'}`}>
            <i className="bi bi-person fs-4"></i>
          </NavLink>
        </div>
      </nav>

    </div>
  );
}
