import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import EventView from '../Organizer/EventView';
import UserView from '../Organizer/UserView';
import BookedEventsView from '../Organizer/BookedEventsView';
import EventCategory from '../Organizer/EventCategories';
import ReportSettings from '../Organizer/ReportSettings';
import AdminAllViewEvent from '../Admin/AdminAllViewEvent';
import BirthdayInfo from '../Admin/BirthdayInfo';
import AddService from '../Admin/Addservices';
import AddVenue from '../Admin/AddVenueForBirthday';
import ManageFeedback from '../Organizer/ManageFeedback';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [feedbackData, setFeedbackData] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [manageDropdown, setManageDropdown] = useState(false);
  const [birthdayDropdown, setBirthdayDropdown] = useState(false);
  const [settingsDropdown, setSettingsDropdown] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Organizer');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName && storedName !== userName) {
      setUserName(storedName);
    }
    fetchEvents();
    fetchFeedbackData();
  }, [userName]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://advanced-event-management.onrender.com/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchFeedbackData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://advanced-event-management.onrender.com/api/feedback/event/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const feedbackMap = data.feedback.reduce((acc, fb) => {
          if (!acc[fb.eventId]) {
            acc[fb.eventId] = { ratings: [], totalReviews: 0, averageRating: 0 };
          }
          acc[fb.eventId].ratings.push(fb.rating);
          acc[fb.eventId].totalReviews = acc[fb.eventId].ratings.length;
          acc[fb.eventId].averageRating = (
            acc[fb.eventId].ratings.reduce((sum, r) => sum + r, 0) / acc[fb.eventId].ratings.length
          ).toFixed(1);
          return acc;
        }, {});
        setFeedbackData(feedbackMap);
      }
    } catch (error) {
      console.error('Error fetching feedback data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserName('');
    navigate('/');
  };

  return (
    <div className="d-flex">
      {/* Left Sidebar Navigation with Hidden Scrollbar */}
      <Navbar
        bg="dark"
        variant="dark"
        className="flex-column p-3"
        style={{
          width: '250px',
          height: '100vh',
          overflowY: 'auto',
          position: 'fixed',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        <style>
          {`
            .flex-column::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Opera */
            }
          `}
        </style>
        <div className="d-flex align-items-center mb-4 text-white">
          <FaUserCircle className="me-2" style={{ fontSize: '24px' }} />
          <div>
            <span className="d-block">Welcome, {userName}</span>
          </div>
        </div>

        <Navbar.Brand className="mb-3">Organizer Panel</Navbar.Brand>

        <Nav className="flex-column w-100">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="btn btn-dark text-start text-white w-100 mb-2"
          >
            Dashboard
          </button>

          <button
            onClick={() => setManageDropdown(!manageDropdown)}
            className="btn btn-dark text-start text-white w-100 mb-2 d-flex justify-content-between align-items-center"
          >
            Manage Events
            <i className={`bi ${manageDropdown ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          </button>
          {manageDropdown && (
            <div className="ps-3">
              <button
                onClick={() => setActiveTab('events')}
                className="btn btn-dark text-start text-white w-100 mb-2"
              >
                All Events
              </button>
              <button
                onClick={() => setActiveTab('addEvent')}
                className="btn btn-dark text-start text-white w-100 mb-2"
              >
                Add Event
              </button>
              <button
                onClick={() => setBirthdayDropdown(!birthdayDropdown)}
                className="btn btn-dark text-start text-white w-100 mb-2 d-flex justify-content-between align-items-center"
              >
                Birthday
                <i className={`bi ${birthdayDropdown ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
              </button>
              {birthdayDropdown && (
                <div className="ps-3">
                  <button
                    onClick={() => setActiveTab('birthdayInfo')}
                    className="btn btn-dark text-start text-white w-100 mb-2"
                  >
                    Birthday Info
                  </button>
                  <button
                    onClick={() => setActiveTab('addService')}
                    className="btn btn-dark text-start text-white w-100 mb-2"
                  >
                    Add Service
                  </button>
                  <button
                    onClick={() => setActiveTab('venue')}
                    className="btn btn-dark text-start text-white w-100 mb-2"
                  >
                    Add Venues
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setActiveTab('manageFeedback')}
            className="btn btn-dark text-start text-white w-100 mb-2"
          >
            Feedback
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className="btn btn-dark text-start text-white w-100 mb-2"
          >
            Registrations
          </button>
          <button
            onClick={() => setActiveTab('bookedEvents')}
            className="btn btn-dark text-start text-white w-100 mb-2"
          >
            Booked Events
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className="btn btn-dark text-start text-white w-100 mb-2"
          >
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="btn btn-dark text-start text-white w-100 mb-2 mt-4"
          >
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </Nav>
      </Navbar>

      {/* Main Content */}
      <main className="flex-grow-1" style={{ marginLeft: '250px' }}>
        <Container className="mt-4">
          {activeTab === 'dashboard' && <EventView events={events} feedbackData={feedbackData} />}
          {activeTab === 'events' && <AdminAllViewEvent events={events} />}
          {activeTab === 'addEvent' && <EventCategory />}
          {activeTab === 'manageFeedback' && <ManageFeedback events={events} />}
          {activeTab === 'birthdayInfo' && <BirthdayInfo />}
          {activeTab === 'addService' && <AddService />}
          {activeTab === 'venue' && <AddVenue />}
          {activeTab === 'report' && <ReportSettings />}
          {activeTab === 'registrations' && <UserView />}
          {activeTab === 'bookedEvents' && <BookedEventsView />}
        </Container>
      </main>
    </div>
  );
};

export default OrganizerDashboard;