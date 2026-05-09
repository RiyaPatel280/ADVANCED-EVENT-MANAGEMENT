import React, { useState } from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import contactImage from "./assets/contact-image.jpeg";


const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    try {
      const response = await axios.post("https://advanced-event-management.onrender.com/api/submit", formData);
      if (response.data.success) {
        setSuccess("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" }); // Reset form
      } else {
        setError(response.data.message || "Failed to send message.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("An error occurred while sending your message. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <section id="contact" className="contact-section">
        <Row className="g-0"> {/* g-0 removes gutter spacing */}
          {/* Full-screen image */}
          <Col md={6} className="p-0">
            <img
              src={contactImage}
              alt="Contact Us"
              className="contact-image img-fluid w-100 h-100"
            />
          </Col>
          {/* Contact form */}
          <Col md={6} className="contact-content-col">
            <Container className="contact-content py-5">
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
            

              {/* Contact Form */}
              {success && <Alert variant="success">{success}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
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
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <Button variant="primary" type="submit" className="w-100">
                  Send Message
                </Button>
              </form>
            </Container>
          </Col>
        </Row>
      </section>
      <Footer />
    </>
  );
};

export default Contact;