import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, NavDropdown, Card } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { IoNotificationsSharp } from 'react-icons/io5';
import LoginModal from './LoginModal';
import SignUpModal from './SignUpModal';
import logo from './assets/logo2.png';
import './css/Header.css';

const Header = ({ onNotificationUpdate }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationIconRef = useRef(null);
  const [iconPosition, setIconPosition] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();

  const handleEventsClick = (e) => {
    if (!userName) {
      e.preventDefault();
      alert("Please login to view events.");
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName && storedName !== userName) {
      setUserName(storedName);
      fetchNotifications();
    }

    const handleStorageChange = (e) => {
      if (e.key === 'userName') {
        setUserName(e.newValue || '');
        if (e.newValue) fetchNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userName]);

  useEffect(() => {
    const updatePosition = () => {
      if (notificationIconRef.current) {
        const rect = notificationIconRef.current.getBoundingClientRect();
        setIconPosition({
          top: rect.top + rect.height,
          left: rect.left,
        });
      }
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [notifications]);

  const fetchNotifications = async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return;

    try {
      const response = await fetch(`http://localhost:4000/api/notification?email=${userEmail}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const newNotifications = data.notifications || [];
      setNotifications(newNotifications);
      const unreadCount = newNotifications.filter(n => !n.read).length;
      setNotificationCount(unreadCount);
      localStorage.setItem('notificationCount', unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (userName) fetchNotifications();
  }, [userName]);

  const handleNotificationUpdate = (newNotifications) => {
    setNotifications(newNotifications);
    const unreadCount = newNotifications.filter(n => !n.read).length;
    setNotificationCount(unreadCount);
    localStorage.setItem('notificationCount', unreadCount);
  };

  useEffect(() => {
    if (onNotificationUpdate) onNotificationUpdate(handleNotificationUpdate);
  }, [onNotificationUpdate]);

  const handleCloseLogin = () => setShowLogin(false);
  const handleShowLogin = () => {
    setShowLogin(true);
    setShowSignUp(false);
  };

  const handleCloseSignUp = () => setShowSignUp(false);
  const handleShowSignUp = () => {
    setShowSignUp(true);
    setShowLogin(false);
  };

  const handleLoginSuccess = (name) => {
    setUserName(name);
    localStorage.setItem('userName', name);
    fetchNotifications();
  };

  const handleLogout = () => {
    setUserName('');
    localStorage.clear();
    setNotifications([]);
    setNotificationCount(0);
    navigate("/");
  };

  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const handleMarkAsReadAndDelete = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/notification/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`Failed to delete notification. Status: ${response.status}`);
      
      const updatedNotifications = notifications.filter(n => n._id !== notificationId);
      setNotifications(updatedNotifications);
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      setNotificationCount(unreadCount);
      localStorage.setItem('notificationCount', unreadCount);
      setShowNotifications(false);
      
      // Force a full page refresh and navigation
      window.location.href = '/registered-events';
    } catch (error) {
      console.error('Error in handleMarkAsReadAndDelete:', error);
    }
  };

  return (
    <Navbar className="fixed-header shadow" expand="lg">
      <Container className="header-container">
        <div className="header-left">
          <Navbar.Toggle aria-controls="navbar-nav" className="navbar-toggle-left" />
          <Navbar.Brand href="/" className="brand-logo">
            <img src={logo} alt="Logo" className="logo-image" />
            <span>DreamEvent</span>
          </Navbar.Brand>
        </div>

        <Navbar.Collapse id="navbar-nav" className="justify-content-center">
          <Nav>
            <Nav.Link href="/" className="nav-link-custom">Home</Nav.Link>
            <Nav.Link 
              href="/alleventview" 
              className="nav-link-custom" 
              onClick={handleEventsClick}
            >
              Events
            </Nav.Link>
            <Nav.Link href="/about" className="nav-link-custom">About Us</Nav.Link>
            <Nav.Link href="/contact" className="nav-link-custom">Contact</Nav.Link>
          </Nav>
        </Navbar.Collapse>

        <div className="user-actions">
          {userName && (
            <div
              ref={notificationIconRef}
              className="notification-container"
              onClick={toggleNotifications}
            >
              <IoNotificationsSharp className="notification-icon unique-icon" />
              <span className="notification-count">{notificationCount}</span>
            </div>
          )}

          {userName ? (
            <NavDropdown
              title={
                <span className="profile-dropdown">
                  <FaUserCircle className="profile-icon" />
                  <span className="welcome-text">Welcome, {userName}</span>
                </span>
              }
              id="profile-dropdown"
              align="end"
              className="custom-dropdown"
            >
              <NavDropdown.Item href="/profile" className="dropdown-item-custom">Profile</NavDropdown.Item>
              <NavDropdown.Item href="/registered-events" className="dropdown-item-custom">Registered Events</NavDropdown.Item>
              <NavDropdown.Item href="/book-event" className="dropdown-item-custom">Book Event</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="dropdown-item-custom">Logout</NavDropdown.Item>
            </NavDropdown>
          ) : (
            <>
              <Button variant="outline-light" onClick={handleShowLogin} className="action-btn">Login</Button>
              <Button variant="light" onClick={handleShowSignUp} className="action-btn">Sign Up</Button>
            </>
          )}
        </div>
      </Container>

      {showNotifications && (
        <div
          className="notification-card-container"
          style={{ top: `${iconPosition.top + 10}px`, left: `${iconPosition.left}px` }}
        >
          <Card className="notification-card">
            <Card.Body>
              <h5>Notifications</h5>
              {notifications.length > 0 ? (
                notifications.map((note) => (
                  <Card.Text
                    key={note._id}
                    onClick={() => handleMarkAsReadAndDelete(note._id)}
                    className={note.read ? 'read-notification' : 'unread-notification'}
                    style={{ cursor: 'pointer' }}
                  >
                    {note.message}
                  </Card.Text>
                ))
              ) : (
                <Card.Text>No new notifications</Card.Text>
              )}
            </Card.Body>
          </Card>
        </div>
      )}

      <LoginModal
        show={showLogin}
        handleClose={handleCloseLogin}
        handleShowSignUp={handleShowSignUp}
        onLoginSuccess={handleLoginSuccess}
      />
      <SignUpModal
        show={showSignUp}
        handleClose={handleCloseSignUp}
        handleShowLogin={handleShowLogin}
      />
    </Navbar>
  );
};

export default Header;