import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/admindashboard.css';
import ManageFeedback from '../Organizer/ManageFeedback';

const AdminHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isEventSubMenuOpen, setIsEventSubMenuOpen] = useState(false);
  const [isBirthdaySubMenuOpen, setIsBirthdaySubMenuOpen] = useState(false);
  const [isSettingsSubMenuOpen, setIsSettingsSubMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleEventSubMenu = () => setIsEventSubMenuOpen(!isEventSubMenuOpen);
  const toggleBirthdaySubMenu = () => setIsBirthdaySubMenuOpen(!isBirthdaySubMenuOpen);
  const toggleSettingsSubMenu = () => setIsSettingsSubMenuOpen(!isSettingsSubMenuOpen);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    setIsSidebarOpen(false);
  };

  return (
    <div className="d-flex">
      <button
        className="btn btn-dark d-md-none position-fixed m-3"
        onClick={toggleSidebar}
        style={{ top: '10px', left: '10px', zIndex: 1050 }}
      >
        <i className="fas fa-bars"></i>
      </button>

      <div
        className={`sidebar bg-dark text-white p-3 ${isSidebarOpen ? 'active' : ''}`}
        style={{
          width: '250px',
          height: '100vh',
          position: 'fixed',
          transition: 'transform 0.3s ease-in-out',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          zIndex: 1040,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>
          {`
            .sidebar::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <h3 className="text-center mb-4">Admin Panel</h3>
        <ul className="nav flex-column">
          <li className={`nav-item mb-2 ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
            <Link
              className="nav-link text-white"
              to="/admin/dashboard"
              target="sidebar"
              onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            >
              <i className="fas fa-tachometer-alt me-2"></i>Dashboard
            </Link>
          </li>

          <li className="nav-item mb-2">
            <div
              className="nav-link text-white d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={toggleEventSubMenu}
            >
              <div>
                <i className="fas fa-calendar-alt me-2"></i>Manage Event
              </div>
              <i className={`fas ${isEventSubMenuOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </div>
            <ul className={`nav flex-column ps-3 ${isEventSubMenuOpen ? 'd-block' : 'd-none'}`}>
              {[
                { path: '/admin/events/all', label: 'All Events' },
                { path: '/admin/events/add', label: 'Add Event' },
              ].map((item, index) => (
                <li key={index} className={`nav-item mb-1 ${location.pathname === item.path ? 'active' : ''}`}>
                  <Link
                    className="nav-link text-white"
                    to={item.path}
                    target="sidebar"
                    onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="nav-item mb-2">
                <div
                  className="nav-link text-white d-flex justify-content-between align-items-center"
                  style={{ cursor: 'pointer' }}
                  onClick={toggleBirthdaySubMenu}
                >
                  <div>
                    <i className="fas fa-birthday-cake me-2"></i>Birthday Event
                  </div>
                  <i className={`fas ${isBirthdaySubMenuOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </div>
                <ul className={`nav flex-column ps-3 ${isBirthdaySubMenuOpen ? 'd-block' : 'd-none'}`}>
                  {[
                    { path: '/admin/birthdayinfo', label: 'All Birthday Events' },
                    { path: '/admin/birthday-payments', label: 'Birthday Payment' }, // Added Birthday Payment
                    { path: '/admin/add-service', label: 'Add Services' },
                    { path: '/admin/add-venue', label: 'Add Venues' },
                  ].map((item, index) => (
                    <li key={index} className={`nav-item mb-1 ${location.pathname === item.path ? 'active' : ''}`}>
                      <Link
                        className="nav-link text-white"
                        to={item.path}
                        target="sidebar"
                        onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </li>

          {[
            { path: '/admin/manageorgnizer', icon: 'fas fa-user-cog', label: 'Manage Organizer' },
            { path: '/admin/users', icon: 'fas fa-users', label: 'Manage Attendee' },
            { path: '/admin/payments', icon: 'fas fa-credit-card', label: 'Payment Details' },
            { path: '/admin/contacts', icon: 'fas fa-envelope', label: 'Contact Us' },
            { path: '/admin/feedback', icon: 'fas fa-comment', label: 'Feedback' },
          ].map((item, index) => (
            <li key={index} className={`nav-item mb-2 ${location.pathname === item.path ? 'active' : ''}`}>
              <Link
                className="nav-link text-white"
                to={item.path}
                target="sidebar"
                onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
              >
                <i className={`${item.icon} me-2`}></i>{item.label}
              </Link>
            </li>
          ))}

          <li className="nav-item mb-2">
            <div
              className="nav-link text-white d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={toggleSettingsSubMenu}
            >
              <div>
                <i className="fas fa-cog me-2"></i>Settings
              </div>
              <i className={`fas ${isSettingsSubMenuOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </div>
            <ul className={`nav flex-column ps-3 ${isSettingsSubMenuOpen ? 'd-block' : 'd-none'}`}>
              <li className={`nav-item mb-1 ${location.pathname === '/admin/settings/manage-profile' ? 'active' : ''}`}>
                <Link
                  className="nav-link text-white"
                  to="/admin/settings/manage-profile"
                  target="sidebar"
                  onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                >
                  Manage Profile
                </Link>
              </li>
              <li className={`nav-item mb-1 ${location.pathname === '/admin/settings/manage-team' ? 'active' : ''}`}>
                <Link
                  className="nav-link text-white"
                  to="/admin/settings/manage-team"
                  target="sidebar"
                  onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                >
                  Manage Team
                </Link>
              </li>
              <li className={`nav-item mb-1 ${location.pathname === '/admin/settings/about' ? 'active' : ''}`}>
                <Link
                  className="nav-link text-white"
                  to="/admin/settings/about"
                  target="sidebar"
                  onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                >
                  Manage About
                </Link>
              </li>
              <li className={`nav-item mb-1 ${location.pathname === '/admin/settings/manage-carousel' ? 'active' : ''}`}>
                <Link
                  className="nav-link text-white"
                  to="/admin/settings/manage-carousel"
                  target="sidebar"
                  onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                >
                  Manage Carousel
                </Link>
              </li>
            </ul>
            <li className="nav-item mb-1">
              <span
                className="nav-link text-white"
                style={{ cursor: 'pointer' }}
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt me-2"></i>Logout
              </span>
            </li>
          </li>
        </ul>
      </div>

      <iframe
        name="sidebar"
        src="/admin/dashboard"
        className="flex-grow-1 p-3"
        style={{
          marginLeft: isSidebarOpen ? '250px' : '0',
          width: '100%',
          height: '100vh',
          border: 'none',
          transition: 'margin-left 0.3s ease-in-out',
        }}
      />
    </div>
  );
};

export default AdminHeader;