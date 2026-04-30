import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, ListGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import './css/AdminAbout.css'; // Custom CSS for fine-tuning

const AdminAbout = () => {
  const [formData, setFormData] = useState({
    title: '',
    intro: '',
    whyChooseUs: [],
    mission: ''
  });
  const [whyChooseUsInput, setWhyChooseUsInput] = useState('');
  const [error, setError] = useState(null); // Only keeping error alert

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/about');
        setFormData(response.data);
      } catch (err) {
        console.error('Error fetching about data:', err);
      }
    };
    fetchAboutData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhyChooseUsChange = (e) => {
    setWhyChooseUsInput(e.target.value);
  };

  const addWhyChooseUs = () => {
    if (whyChooseUsInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        whyChooseUs: [...prev.whyChooseUs, whyChooseUsInput.trim()]
      }));
      setWhyChooseUsInput('');
    }
  };

  const removeWhyChooseUs = (index) => {
    setFormData((prev) => ({
      ...prev,
      whyChooseUs: prev.whyChooseUs.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous error message

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:4000/api/update', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Show popup alert on successful update
      alert('About content updated successfully!');
      setFormData(response.data.data);
    } catch (err) {
      console.error('Error updating about:', err);
      setError('Failed to update about content. Please try again.');
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <Card className="shadow-lg border-0">
        <Card.Header className="text-white text-center py-3" style={{ backgroundColor: '#6F2DA8' }}>
          <h2 className="mb-0">Manage About Content</h2>
        </Card.Header>
        <Card.Body className="p-4">
          {error && (
            <Alert variant="danger" className="mb-4" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="rounded-3"
                    placeholder="Enter the title"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Intro</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="intro"
                    value={formData.intro}
                    onChange={handleChange}
                    required
                    className="rounded-3"
                    placeholder="Enter the intro text"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Why Choose Us</Form.Label>
              <Row className="align-items-center mb-3">
                <Col md={9}>
                  <Form.Control
                    type="text"
                    value={whyChooseUsInput}
                    onChange={handleWhyChooseUsChange}
                    placeholder="Add a reason (e.g., 'Expert Team')"
                    className="rounded-3"
                  />
                </Col>
                <Col md={3}>
                  <Button
                    style={{ backgroundColor: '#6F2DA8', borderColor: '#6F2DA8' }}
                    className="w-100 rounded-3 text-white"
                    onClick={addWhyChooseUs}
                    disabled={!whyChooseUsInput.trim()}
                  >
                    Add
                  </Button>
                </Col>
              </Row>
              {formData.whyChooseUs.length > 0 && (
                <ListGroup className="mt-2">
                  {formData.whyChooseUs.map((item, index) => (
                    <ListGroup.Item
                      key={index}
                      className="d-flex justify-content-between align-items-center rounded-3 mb-2"
                    >
                      <span>{item}</span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-3"
                        onClick={() => removeWhyChooseUs(index)}
                      >
                        Remove
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Mission</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="mission"
                value={formData.mission}
                onChange={handleChange}
                required
                className="rounded-3"
                placeholder="Enter the mission statement"
              />
            </Form.Group>

            <div className="text-center">
              <Button
                style={{ backgroundColor: '#6F2DA8', borderColor: '#6F2DA8' }}
                className="px-5 py-2 rounded-3 shadow-sm text-white"
                type="submit"
              >
                Update About
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminAbout;