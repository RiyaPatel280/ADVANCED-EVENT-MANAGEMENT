import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaCalendarCheck, FaMapMarkerAlt, FaUtensils, FaPalette, FaMusic, FaCameraRetro } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/Home.css';
import Header from './Header';
import Footer from './Footer';
import contactImage from './assets/contact-image.jpeg';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [organizerVenueMap, setOrganizerVenueMap] = useState({});
  const [eventIdMap, setEventIdMap] = useState({});
  const [contactFormData, setContactFormData] = useState({ name: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(null);
  const [contactError, setContactError] = useState(null);
  const [aboutData, setAboutData] = useState({
    title: '',
    intro: '',
    whyChooseUs: [],
    mission: ''
  });
  const [aboutLoading, setAboutLoading] = useState(true);
  const [aboutError, setAboutError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [sliderImages, setSliderImages] = useState([]);
  const [notificationUpdater, setNotificationUpdater] = useState(null);

  const userEmail = localStorage.getItem('userEmail');
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Updated Organizers State:", organizers);
  }, [organizers]);

  useEffect(() => {
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/team/viewteam", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.teamMembers);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to fetch team members: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  fetchTeamMembers();
  const token = localStorage.getItem('token');
  axios
  .get('http://localhost:4000/api/organizers', {
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
  .get('http://localhost:4000/api/allcategories')
  .then((response) => {
    const uniqueCategories = Array.from(
      new Map(response.data.map((cat) => [cat.title, cat])).values()
    );
    setCategories(uniqueCategories);
  })
  .catch((error) => console.error('Error fetching categories:', error));

if (userEmail) {
  axios
    .get(`http://localhost:4000/api/alluser-registrations?email=${userEmail}`)
    .then((response) => {
      setRegisteredEvents(new Set(response.data.registeredEvents.map((event) => event.eventId)));
    })
    .catch((error) => console.error('Error fetching registered events:', error));
}

  axios.get('http://localhost:4000/api/allcategories')
    .then(response => {
      const uniqueCategories = Array.from(
        new Map(response.data.map((cat) => [cat.title, cat])).values()
      );
      setCategories(uniqueCategories);
    })
    .catch(error => console.error('Error fetching categories:', error));

  if (userEmail) {
    axios.get(`http://localhost:4000/api/alluser-registrations?email=${userEmail}`)
      .then(response => {
        setRegisteredEvents(new Set(response.data.registeredEvents.map(event => event.eventId)));
      })
      .catch(error => console.error('Error fetching registered events:', error));
  }

  const fetchSliderImages = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/users/images');
      setSliderImages(response.data);
    } catch (err) {
      console.error('Error fetching slider images:', err);
    }
  };
  fetchSliderImages();

  const fetchAboutData = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/about');
      setAboutData(response.data);
      setAboutLoading(false);
    } catch (err) {
      console.error('Error fetching about data:', err);
      setAboutError('Failed to load about content.');
      setAboutLoading(false);
    }
  };
  fetchAboutData();
}, [userEmail]);

  const handleRegisterClick = (eventId, eventName) => {
    const userName = localStorage.getItem('userName'); // Check if user is logged in
    if (!userName) {
      alert("Please login to register for an event.");
    } else {
      setSelectedEventId(eventId);
      setSelectedEventName(eventName);
      setFormData({ ...formData, eventName, organizer: '', venue: '', city: '' });
      setShowModal(true);
    }
  };

  const handleViewDetailsClick = (eventId) => {
    navigate(`/event-detail/${eventId}`);
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
    
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    const registrationData = { ...formData, eventId: selectedEventId };
    try {
      const response = await axios.post('http://localhost:4000/api/register', registrationData);
      alert(response.data.message);
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', eventName: '', organizer: '', venue: '', city: '' });
      setRegisteredEvents(prev => new Set([...prev, selectedEventId]));

      const notificationResponse = await axios.get(`http://localhost:4000/api/notification?email=${registrationData.email}`);
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

  const handleContactChange = (e) => {
    const { id, value } = e.target;
    setContactFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSuccess(null);
    setContactError(null);

    try {
      const response = await axios.post('http://localhost:4000/api/submit', contactFormData);
      if (response.data.success) {
        setContactSuccess('Message sent successfully!');
        setContactFormData({ name: '', email: '', message: '' });
      } else {
        setContactError(response.data.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setContactError('An error occurred while sending your message. Please try again.');
    }
  };

  const uniqueOrganizers = Array.isArray(organizers)
    ? [...new Set(organizers.filter((org) => org.title === formData.eventName).map((org) => org.organizer))]
    : [];

  const availableVenues = formData.city
    ? [...(organizerVenueMap[formData.eventName]?.[formData.organizer]?.[formData.city] || [])]
    : [];

  const availableCities = formData.organizer
    ? Object.keys(organizerVenueMap[formData.eventName]?.[formData.organizer] || {})
    : [];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const sliderteamSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div>
      <Header onNotificationUpdate={setNotificationUpdateHandler} />

      <section className="hero" id="home">
        {sliderImages.length > 0 ? (
          <Slider {...sliderSettings} className="hero-slider">
            {sliderImages.map((image) => (
              <div key={image._id} className="hero-slide">
                <div
                  className="hero-slide-bg"
                  style={{
                    backgroundImage: `url(http://localhost:4000${image.path})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: '100%',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  }}
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div
            className="hero-slide-bg loading-bg"
            style={{
              backgroundImage: `url('../assets/background1.webp')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              width: '100%',
              height: '100vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <p>Loading images...</p>
          </div>
        )}

        <div className="hero-content">
          <h1 className="hero-heading">Welcome to Dream Event</h1>
          <p>Your one-stop solution for managing and organizing events effortlessly.</p>
          <Button
            variant="primary"
            className="explore-btn mt-3"
            onClick={() => {
              const element = document.getElementById("services");
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              } else {
                console.error("Element with ID 'services' not found.");
              }
            }}
          >
            Explore Our Services
          </Button>
        </div>
      </section>

      <section id="categories" className="categories-section">
        <h2 className="text-center mb-5">Event Categories</h2>
        <div className="slider-container">
          <div className="slider">
            <Row className="g-4 flex-nowrap overflow-auto">
              {categories.map((category) => (
                <Col md={3} sm={6} xs={12} key={category._id}>
                  <Card className="h-100">
                    <Card.Img
                      variant="top"
                      src={`http://localhost:4000/${category.image}`}
                      alt="Event Category"
                      className="w-100"
                      style={{ height: '200px'}}
                    />
                    <Card.Body className="d-flex flex-column">
                      <div>
                        <Card.Title>{category.title}</Card.Title>
                        <Card.Text>{category.description}</Card.Text>
                        {/* <p><strong>💰 Price:</strong> {category.price}</p> */}
                      </div>
                      <div className="mt-auto">
                        <Button
                          variant="primary"
                          className="w-100 py-2 btn-dark"
                          style={{ minHeight: '45px',marginTop: '5px'}}
                          onClick={() => handleRegisterClick(category._id, category.title)}
                        >
                          Register Now
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </section>

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
                    <option key={index} value={city}>{city}</option>
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

      <section id="services" className="services-section py-5 bg-light">
        <div className="container text-center">
          <h2 className="mt-5" style={{ color: '#6F2DA8' }}>Our Services</h2>
          <Row className="g-4">
            <Col md={4} sm={6}>
              <Card className="service-card border-0 shadow-lg rounded-4 text-center p-3 h-100">
                <Card.Body>
                  <FaCalendarCheck size={50} className="service-icon mb-3" style={{ color: '#6F2DA8' }} />
                  <Card.Title className="fw-bold">Event Planning</Card.Title>
                  <Card.Text>Full-service event planning and day-of coordination.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} sm={6}>
              <Card className="service-card border-0 shadow-lg rounded-4 text-center p-3 h-100">
                <Card.Body>
                  <FaMapMarkerAlt size={50} className="service-icon mb-3" style={{ color: '#6F2DA8' }} />
                  <Card.Title className="fw-bold">Venue Selection</Card.Title>
                  <Card.Text>Assistance in choosing the perfect venue.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} sm={6}>
              <Card className="service-card border-0 shadow-lg rounded-4 text-center p-3 h-100">
                <Card.Body>
                  <FaUtensils size={50} className="service-icon mb-3" style={{ color: '#6F2DA8' }} />
                  <Card.Title className="fw-bold">Catering Services</Card.Title>
                  <Card.Text>Customizable menus tailored to your event.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} sm={6}>
              <Card className="service-card border-0 shadow-lg rounded-4 text-center p-3 h-100">
                <Card.Body>
                  <FaPalette size={50} className="service-icon mb-3" style={{ color: '#6F2DA8' }} />
                  <Card.Title className="fw-bold">Decoration & Setup</Card.Title>
                  <Card.Text>Themed decorations and floral arrangements.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} sm={6}>
              <Card className="service-card border-0 shadow-lg rounded-4 text-center p-3 h-100">
                <Card.Body>
                  <FaMusic size={50} className="service-icon mb-3" style={{ color: '#6F2DA8' }} />
                  <Card.Title className="fw-bold">Entertainment</Card.Title>
                  <Card.Text>DJs, live bands, and more for your event.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} sm={6}>
              <Card className="service-card border-0 shadow-lg rounded-4 text-center p-3 h-100">
                <Card.Body>
                  <FaCameraRetro size={50} className="service-icon mb-3" style={{ color: '#6F2DA8' }} />
                  <Card.Title className="fw-bold">Photography & Videography</Card.Title>
                  <Card.Text>Professional photos and event videos.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      <section id="team" className="team-section py-5 bg-light">
        <div className="container text-center">
          <h2 className="mb-5" style={{ color: "#6F2DA8" }}>Meet Our Team</h2>
          {teamMembers.length <= 4 ? (
            <Row className="row-cols-1 row-cols-md-4 g-4">
              {teamMembers.map((member, index) => (
                <Col key={index}>
                  <Card className="team-card border-0 shadow-lg rounded-4 h-100 overflow-hidden">
                    <div className="team-img-container">
                      <Card.Img
                        variant="top"
                        src={
                          member.imageUrl
                            ? `http://localhost:4000${member.imageUrl}`
                            : "https://via.placeholder.com/300x200"
                        }
                        alt={member.name}
                      />
                    </div>
                    <Card.Body className="text-center">
                      <Card.Title className="fw-bold">{member.name}</Card.Title>
                      <Card.Text>{member.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Slider {...sliderteamSettings}>
              {teamMembers.map((member, index) => (
                <div key={index} className="px-2">
                  <Card className="team-card border-0 shadow-lg rounded-4 h-100 overflow-hidden">
                    <div className="team-img-container">
                      <Card.Img
                        variant="top"
                        src={
                          member.imageUrl
                            ? `http://localhost:4000${member.imageUrl}`
                            : "https://via.placeholder.com/300x200"
                        }
                        alt={member.name}
                      />
                    </div>
                    <Card.Body className="text-center">
                      <Card.Title className="fw-bold">{member.name}</Card.Title>
                      <Card.Text>{member.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-content">
          {aboutLoading ? (
            <p>Loading...</p>
          ) : aboutError ? (
            <Alert variant="danger">{aboutError}</Alert>
          ) : (
            <>
              <h2>{aboutData.title || 'About Us'}</h2>
              <p className="about-intro">
                {aboutData.intro || 'With years of experience in planning and executing flawless events, we bring your vision to life with creativity and precision.'}
              </p>
              <div className="about-details">
                <div className="about-item">
                  <h3>Why Choose Us?</h3>
                  <ul>
                    {aboutData.whyChooseUs && aboutData.whyChooseUs.length > 0 ? (
                      aboutData.whyChooseUs.map((item, index) => <li key={index}>{item}</li>)
                    ) : (
                      <>
                        <li>Personalized service tailored to your unique needs.</li>
                        <li>Experienced team dedicated to making your event a success.</li>
                        <li>Flexible packages to fit any budget and event size.</li>
                      </>
                    )}
                  </ul>
                </div>
                <div className="about-item">
                  <h3>Our Mission</h3>
                  <p>
                    {aboutData.mission || 'Our mission is to provide seamless event planning that exceeds expectations. We believe in creating memorable experiences with every event, large or small.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section id="contact" className="contact-section">
        <Row className="align-items-center">
          <Col md={6}>
            <img
              src={contactImage}
              alt="Contact Us"
              className="contact-image img-fluid rounded"
            />
          </Col>
          <Col md={6}>
            <div className="contact-content">
              <h2 className="mb-4">Get in Touch</h2>
              <p>Have any questions or want to start planning your next event? We're here to help!</p>
              <p>
                Email us at:{" "}
                <a href="mailto:support@DeamEvent.com" className="text-white">
                  support@DreamEvent.com
                </a> <span className="text-white"><b>|</b></span>  Give us a call:{" "}
                <a href="tel:+1234567890" className="text-white">
                  +123-456-7890
                </a>
              </p>

              {contactSuccess && <Alert variant="success">{contactSuccess}</Alert>}
              {contactError && <Alert variant="danger">{contactError}</Alert>}
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    placeholder="Enter your name"
                    value={contactFormData.name}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={contactFormData.email}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    className="form-control"
                    placeholder="Enter your message"
                    rows="4"
                    value={contactFormData.message}
                    onChange={handleContactChange}
                    required
                  ></textarea>
                </div>
                <Button variant="primary" type="submit" className="w-100">
                  Send Message
                </Button>
              </form>
            </div>
          </Col>
        </Row>
      </section>

      <Footer />
    </div>
  );
};

export default Home;