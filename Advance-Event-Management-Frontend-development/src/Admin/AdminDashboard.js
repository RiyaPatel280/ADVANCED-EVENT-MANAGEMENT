import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Card, Container, Badge } from 'react-bootstrap';
import { FaUsers, FaCalendarAlt, FaUserTie, FaStar } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './css/admindashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, organizers: 0, events: 0 });
  const [chartData, setChartData] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:4000/api/admin-stats')
      .then((response) => {
        setStats(response.data.stats);
        setChartData(response.data.chartData);
      })
      .catch((error) => console.error('Error fetching dashboard data:', error));

    axios
      .get('http://localhost:4000/api/upcoming-events', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        setUpcomingEvents(response.data.events);
      })
      .catch((error) => {
        console.error('Error fetching upcoming events:', error);
        setUpcomingEvents([]);
      });
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="official-tooltip p-2 bg-light border rounded shadow-sm">
          <p className="mb-0">
            <FaStar size={12} style={{ color: '#6F2DA8', marginRight: '5px' }} />
            {`${label}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const COLORS = ['#8B5ACF', '#4B1C7A', '#6F2DA8', '#A78BFA', '#D6BCFA'];

  return (
    <Container fluid className="mt-4 official-admin-panel px-3">
      {/* Stats Cards */}
      <Row className="mb-4 justify-content-between gx-4">
        <Col xs={12} sm={4} md={4} lg={4} className="mb-3 px-0">
          <Card
            className="stat-card shadow w-100"
            style={{
              maxWidth: '350px',
              margin: '0 auto',
              borderRadius: '15px',
              border: '3px solid #6F2DA8', // Purple border
              background: '#fff', // White background
              height: '200px', // Reduced height
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <Card.Body className="text-center py-3 d-flex flex-column align-items-center justify-content-center position-relative">
              <div
                className="icon-circle"
                style={{
                  position: 'absolute',
                  top: '10px',
                  width: '50px',
                  height: '50px',
                  background: '#6F2DA8', // Purple circle for icon
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaUsers className="stat-icon" size={30} style={{ color: '#fff' }} />
              </div>
              <Card.Title className="fw-bold fs-5 mt-4 text-dark">Users</Card.Title>
              <Card.Text className="fs-3 fw-bold text-dark">{stats.users}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4} md={4} lg={4} className="mb-3 px-0">
          <Card
            className="stat-card shadow w-100"
            style={{
              maxWidth: '350px',
              margin: '0 auto',
              borderRadius: '15px',
              border: '3px solid #6F2DA8', // Purple border
              background: '#fff', // White background
              height: '200px', // Reduced height
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <Card.Body className="text-center py-3 d-flex flex-column align-items-center justify-content-center position-relative">
              <div
                className="icon-circle"
                style={{
                  position: 'absolute',
                  top: '10px',
                  width: '50px',
                  height: '50px',
                  background: '#6F2DA8',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaUserTie className="stat-icon" size={30} style={{ color: '#fff' }} />
              </div>
              <Card.Title className="fw-bold fs-5 mt-4 text-dark">Organizers</Card.Title>
              <Card.Text className="fs-3 fw-bold text-dark">{stats.organizers}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4} md={4} lg={4} className="mb-3 px-0">
          <Card
            className="stat-card shadow w-100"
            style={{
              maxWidth: '350px',
              margin: '0 auto',
              borderRadius: '15px',
              border: '3px solid #6F2DA8', // Purple border
              background: '#fff', // White background
              height: '200px', // Reduced height
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <Card.Body className="text-center py-3 d-flex flex-column align-items-center justify-content-center position-relative">
              <div
                className="icon-circle"
                style={{
                  position: 'absolute',
                  top: '10px',
                  width: '50px',
                  height: '50px',
                  background: '#6F2DA8',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaCalendarAlt className="stat-icon" size={30} style={{ color: '#fff' }} />
              </div>
              <Card.Title className="fw-bold fs-5 mt-4 text-dark">Events</Card.Title>
              <Card.Text className="fs-3 fw-bold text-dark">{stats.events}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pie Chart and Upcoming Events */}
      <Row className="mb-4 gx-4 gy-4">
        <Col md={6} className="mb-3">
          <Card className="shadow border-0" style={{ height: '400px', borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column justify-content-center p-3">
              <h4 className="text-center mb-3 fw-bold text-dark">Event Distribution</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="name"
                    cx="60%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="shadow border-0" style={{ height: '400px', borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column p-3">
              <h4 className="text-center mb-3 fw-bold text-dark">Upcoming Events</h4>
              <Row className="flex-grow-1 overflow-auto gx-2 gy-2">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => (
                    <Col xs={12} sm={6} key={index}>
                      <Card className="shadow-sm border-0 h-100 p-2" style={{ borderRadius: '10px' }}>
                        <Card.Body className="d-flex align-items-center p-0">
                          <FaCalendarAlt size={25} style={{ color: '#6F2DA8', marginRight: '10px' }} />
                          <div>
                            <Card.Title className="fw-bold text-dark mb-1" style={{ fontSize: '1rem' }}>
                              {event.title}
                            </Card.Title>
                            <Card.Text className="text-muted small mb-1">
                              {new Date(event.startDate).toLocaleDateString()} - {event.venue}
                            </Card.Text>
                            <Badge bg="primary" className="fw-normal">
                              {event.organizer}
                            </Badge>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col xs={12} className="text-center text-muted d-flex align-items-center justify-content-center h-100">
                    No upcoming events scheduled after today.
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;