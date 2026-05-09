import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Card, Button, Modal, Form, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaBirthdayCake } from 'react-icons/fa';
import Header from './Header';
import Footer from './Footer';
import './css/Allevent.css';

const Allevent = () => {
  const [categories, setCategories] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [organizerVenueMap, setOrganizerVenueMap] = useState({});
  const [eventIdMap, setEventIdMap] = useState({});
  const userEmail = localStorage.getItem('userEmail');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventName, setSelectedEventName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventName: '',
    organizer: '',
    venue: '',
    city: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [notificationUpdater, setNotificationUpdater] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [cityFilter, setCityFilter] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    axios
      .get('https://advanced-event-management.onrender.com/api/organizers', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const organizerData = response.data.organizers;
        setOrganizers(organizerData);

        const venueMap = {};
        const idMap = {};
        organizerData.forEach((org) => {
          if (!venueMap[org.title]) {
            venueMap[org.title] = {};
            idMap[org.title] = {};
          }
          if (!venueMap[org.title][org.organizer]) {
            venueMap[org.title][org.organizer] = {};
            idMap[org.title][org.organizer] = {};
          }
          if (!venueMap[org.title][org.organizer][org.city]) {
            venueMap[org.title][org.organizer][org.city] = new Set();
          }
          venueMap[org.title][org.organizer][org.city].add(org.venue || 'Venue TBD');
          idMap[org.title][org.organizer][org.venue || 'Venue TBD'] = org._id;
        });
        setOrganizerVenueMap(venueMap);
        setEventIdMap(idMap);
      })
      .catch((error) => console.error('Error fetching organizers:', error));

    axios
      .get('https://advanced-event-management.onrender.com/api/allcategories')
      .then((response) => {
        const uniqueCategories = Array.from(
          new Map(response.data.map((cat) => [cat.title, cat])).values()
        );
        setCategories(uniqueCategories);
      })
      .catch((error) => console.error('Error fetching categories:', error));

    if (userEmail) {
      axios
        .get(`https://advanced-event-management.onrender.com/api/alluser-registrations?email=${userEmail}`)
        .then((response) => {
          setRegisteredEvents(new Set(response.data.registeredEvents.map((event) => event.eventId)));
        })
        .catch((error) => console.error('Error fetching registered events:', error));
    }
  }, [userEmail]);

  const handleRegisterClick = (eventId, eventName) => {
    setSelectedEventId(eventId);
    setSelectedEventName(eventName);
    setFormData({ ...formData, eventName, organizer: '', venue: '', city: '' });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }));
    } else if (name === 'email') {
      setFormData(prev => ({
        ...prev,
        [name]: value.trim().toLowerCase()
      }));
    } else if (name === 'organizer') {
      setFormData({ ...formData, organizer: value, venue: '', city: '' });
    } else if (name === 'city') {
      setFormData({ ...formData, city: value, venue: '' });
    } else if (name === 'venue') {
      const newEventId = eventIdMap[formData.eventName]?.[formData.organizer]?.[value];
      setSelectedEventId(newEventId || selectedEventId);
      setFormData({ ...formData, venue: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Phone validation
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    // Email validation
    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    const registrationData = { ...formData, eventId: selectedEventId };

    try {
      const response = await axios.post('https://advanced-event-management.onrender.com/api/register', registrationData);
      alert(response.data.message);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', eventName: '', organizer: '', venue: '', city: '' });
      setRegisteredEvents((prev) => new Set([...Array.from(prev), selectedEventId]));

      // Fetch updated notifications and update Header immediately
      const notificationResponse = await axios.get(`https://advanced-event-management.onrender.com/api/notification?email=${registrationData.email}`);
      const updatedNotifications = notificationResponse.data.notifications || [];
      if (notificationUpdater) {
        notificationUpdater(updatedNotifications);
      }
    } catch (error) {
      console.error('Registration Error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to register. Try again.');
    }
  };

  const setNotificationUpdateHandler = (updater) => {
    setNotificationUpdater(() => updater);
  };

  // Filter helpers
  const uniqueTitles = [...new Set(categories.map((category) => category.title))];
  const uniqueCities = [
    ...new Set(
      organizers
        .filter((org) => org.city)
        .map((org) => org.city)
    ),
  ];

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTitle = titleFilter ? category.title === titleFilter : true;
    const matchesCity = cityFilter.length > 0
      ? organizers.some((org) => org.title === category.title && cityFilter.includes(org.city))
      : true;
    const matchesPrice = category.price >= minPrice && category.price <= maxPrice;
    const matchesDate = startDate && endDate && category.eventDate
      ? new Date(category.eventDate) >= new Date(startDate) && new Date(category.eventDate) <= new Date(endDate)
      : true;

    return matchesSearch && matchesTitle && matchesCity && matchesPrice && matchesDate;
  });

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleTitleChange = (e) => setTitleFilter(e.target.value);
  const handleCityChange = (e) => {
    const options = e.target.options;
    const selectedCities = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCities.push(options[i].value);
      }
    }
    setCityFilter(selectedCities);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTitleFilter('');
    setCityFilter([]);
    setStartDate('');
    setEndDate('');
    setMinPrice(0);
    setMaxPrice(10000);
  };

  const handleOnClick = () => {
    window.location.href = '/birthdayevent';
  };

  const uniqueOrganizers = Array.isArray(organizers)
    ? [...new Set(organizers.filter((org) => org.title === formData.eventName).map((org) => org.organizer))]
    : [];

  const availableCities = formData.organizer
    ? Object.keys(organizerVenueMap[formData.eventName]?.[formData.organizer] || {})
    : [];

  const availableVenues = formData.city
    ? [...(organizerVenueMap[formData.eventName]?.[formData.organizer]?.[formData.city] || [])]
    : [];

  return (
    <>
      <Header onNotificationUpdate={setNotificationUpdateHandler} />
      <Container fluid className="dreamevent-canvas">
        <section className="mahaul-sabha text-center py-5">
          <h1 className="tansen-crown">Birthday Celebration</h1>
          <p className="sangit-whisper">Craft your day with Indian elegance</p>
          <Button
            variant="outline-purple"
            className="rang-path mt-3"
            onClick={handleOnClick}
          >
            Book Now
          </Button>
        </section>

        <Row className="my-5">
          <Col lg={12} md={12} sm={12}>
            <h2 className="utsav-darshan text-center">Event Visions</h2>
            <Button
              className="filter-toggle-btn mb-3"
              onClick={() => setShowFilters(!showFilters)}
              style={{ 
                backgroundColor: '#551A8B', 
                color: 'white', 
                border: 'none', 
                borderRadius: '20px', 
                padding: '10px 20px', 
                transition: 'all 0.3s ease' 
              }}
              onMouseOver={(e) => e.target.style.boxShadow = '0 0 10px rgba(85, 26, 139, 0.7)'}
              onMouseOut={(e) => e.target.style.boxShadow = 'none'}
            >
              <FaFilter className="filter-icon" /> Filters
            </Button>

            <Form 
              className={`event-filter-section mb-4 ${showFilters ? 'show' : ''}`} 
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '15px', 
                padding: '20px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                border: '2px solid #551A8B' 
              }}
            >
              <Row className="g-4">
                <Col md={4} sm={6}>
                  <Form.Group controlId="searchEvent" className="filter-group">
                    <Form.Label 
                      className="filter-label" 
                      style={{ color: '#551A8B', fontWeight: 'bold' }}
                    >
                      <FaFilter className="filter-icon" /> Search Events
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by title..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="filter-input"
                      style={{ 
                        borderColor: '#551A8B', 
                        color: 'black', 
                        borderRadius: '10px', 
                        padding: '8px' 
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} sm={6}>
                  <Form.Group controlId="titleFilter" className="filter-group">
                    <Form.Label 
                      className="filter-label" 
                      style={{ color: '#551A8B', fontWeight: 'bold' }}
                    >
                      Event Type
                    </Form.Label>
                    <Form.Select
                      value={titleFilter}
                      onChange={handleTitleChange}
                      className="filter-select"
                      style={{ 
                        borderColor: '#551A8B', 
                        color: 'black', 
                        borderRadius: '10px', 
                        padding: '8px' 
                      }}
                    >
                      <option value="">All Types</option>
                      {uniqueTitles.map((title, index) => (
                        <option key={index} value={title}>
                          {title}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} sm={6}>
                  <Form.Group controlId="cityFilter" className="filter-group mb-0">
                    <Form.Label 
                      className="filter-label" 
                      style={{ color: '#551A8B', fontWeight: 'bold' }}
                    >
                      Cities
                    </Form.Label>
                    <Form.Select
                      value={cityFilter}
                      onChange={handleCityChange}
                      className="filter-select"
                      style={{ 
                        borderColor: '#551A8B', 
                        color: 'black', 
                        borderRadius: '10px', 
                        padding: '8px' 
                      }}
                    >
                      <option value="">All Cities</option>
                      {uniqueCities.map((city, index) => (
                        <option key={index} value={city}>
                          {city}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} sm={6}>
                  <Form.Group controlId="startDate" className="filter-group">
                    <Form.Label 
                      className="filter-label" 
                      style={{ color: '#551A8B', fontWeight: 'bold' }}
                    >
                      Start Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="filter-input"
                      style={{ 
                        borderColor: '#551A8B', 
                        color: 'black', 
                        borderRadius: '10px', 
                        padding: '8px' 
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} sm={6}>
                  <Form.Group controlId="endDate" className="filter-group">
                    <Form.Label 
                      className="filter-label" 
                      style={{ color: '#551A8B', fontWeight: 'bold' }}
                    >
                      End Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="filter-input"
                      style={{ 
                        borderColor: '#551A8B', 
                        color: 'black', 
                        borderRadius: '10px', 
                        padding: '8px' 
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} sm={6} className="d-flex align-items-end">
                  <Button
                    className="btn-clear-filter w-100"
                    onClick={clearFilters}
                    style={{ 
                      backgroundColor: '#551A8B', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '10px', 
                      padding: '10px', 
                      transition: 'all 0.3s ease' 
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#3d1366'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#551A8B'}
                  >
                    Clear Filters
                  </Button>
                </Col>
              </Row>
            </Form>

            <Row>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <Col lg={4} md={6} sm={12} key={category._id} className="mb-4">
                    <Card className="mela-sankalp shadow h-100">
                      <div className="rangoli-weave">
                        <Card.Img
                          variant="top"
                          src={`https://advanced-event-management.onrender.com/${category.image}`}
                          className="sankalp-drishti"
                        />
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="sankalp-abhivadan">{category.title}</Card.Title>
                        <Card.Text className="sankalp-kavya flex-grow-1">
                          {category.description}
                        </Card.Text>
                        {/* <p className="sankalp-mulya">Price: ₹{category.price}</p> */}
                        <Button
                          variant="purple"
                          className="sangam-rhythm w-100 mt-auto"
                          onClick={() => handleRegisterClick(category._id, category.title)}
                        >
                          Register Now
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col className="text-center">
                  <p>No events found matching your filters.</p>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="niti-mandir">
        <Modal.Header closeButton className="bg-purple">
          <Modal.Title className="text-white">DreamEvent: {selectedEventName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="shloka-sanctum">
          <Form onSubmit={handleRegisterSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="shloka-verse">Event Name</Form.Label>
              <Form.Control type="text" name="eventName" value={formData.eventName} readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="shloka-verse">Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="shloka-verse">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                title="Please enter a valid email address (e.g., example@domain.com)"
                required
              />
              {formData.email && !validateEmail(formData.email) && (
                <Form.Text className="text-danger">
                  Please enter a valid email address
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="shloka-verse">Phone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                required
              />
              {formData.phone && !/^[0-9]{10}$/.test(formData.phone) && (
                <Form.Text className="text-danger">
                  Please enter a valid 10-digit phone number
                </Form.Text>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="shloka-verse">Organizer</Form.Label>
              <Form.Control
                as="select"
                name="organizer"
                value={formData.organizer}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Organizer</option>
                {uniqueOrganizers.map((organizer, index) => (
                  <option key={index} value={organizer}>
                    {organizer}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            {formData.organizer && (
              <Form.Group className="mb-3">
                <Form.Label className="shloka-verse">City</Form.Label>
                <Form.Control
                  as="select"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select City</option>
                  {availableCities.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}
            {formData.city && availableVenues.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label className="shloka-verse">Venue</Form.Label>
                <Form.Control
                  as="select"
                  name="venue"
                  value={formData.venue}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Venue</option>
                  {availableVenues.map((venue, index) => (
                    <option key={index} value={venue}>
                      {venue}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}
            <Button variant="purple" type="submit" className="niti-sanket w-100">
              Complete Registration
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  );
};

export default Allevent;