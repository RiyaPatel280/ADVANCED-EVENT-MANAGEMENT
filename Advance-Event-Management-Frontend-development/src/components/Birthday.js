import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import birthdayImage from "./assets/birthday.png";
import { Container, Form, Button, Row, Col, Spinner, Alert, ListGroup } from "react-bootstrap";

const initialFormData = {
  name: "",
  email: "",
  eventDate: "",
  location: "",
  numberOfMembers: "",
  selectedServices: {},
  organizer: "",
  venue: "",
};

const PER_PERSON_RATE = 250;
const THRESHOLD = 300;

const Birthday = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [organizers, setOrganizers] = useState([]);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const fetchOrganizersWithServices = async () => {
      try {
        const organizersResponse = await axios.get("https://advanced-event-management.onrender.com/api/users/organizers");
        const allOrganizers = organizersResponse.data;

        const organizersWithServices = [];
        for (const org of allOrganizers) {
          const servicesResponse = await axios.get("https://advanced-event-management.onrender.com/api/services", {
            params: { addBy: org.name },
          });
          if (servicesResponse.data.services && servicesResponse.data.services.length > 0) {
            organizersWithServices.push(org);
          }
        }
        setOrganizers(organizersWithServices);
      } catch (error) {
        console.error("Error fetching organizers with services:", error.message || error);
      }
    };
    fetchOrganizersWithServices();

    // Only set formData from state if it exists, otherwise use initialFormData
    if (state?.updatedFormData) {
      setFormData({
        ...initialFormData,
        ...state.updatedFormData,
        selectedServices: state.updatedFormData.selectedServices || {},
      });
      setIsAdmin(state.isAdmin || false);
      setStep(3);
    } else {
      // Reset to initial state on refresh
      setFormData(initialFormData);
      localStorage.removeItem("birthdayFormData"); // Clear localStorage on refresh
    }
  }, [state]);

  useEffect(() => {
    const fetchServices = async () => {
      if (!formData.organizer) {
        setServices([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get("https://advanced-event-management.onrender.com/api/services", {
          params: { addBy: formData.organizer },
        });
        setServices(response.data.services || []);
        setError(null);
      } catch (err) {
        setError("Error fetching services for this organizer.");
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [formData.organizer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };
      localStorage.setItem("birthdayFormData", JSON.stringify(updatedForm));
      return updatedForm;
    });
  };

  const validateStep = (currentStep) => {
    let errors = {};
    if (currentStep === 1) {
      if (!formData.name.trim()) errors.name = "Name is required.";
      if (!formData.email.trim()) errors.email = "Email is required.";
      else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email))
        errors.email = "Invalid email address.";
      if (!formData.eventDate.trim()) errors.eventDate = "Event date is required.";
      if (!formData.location.trim()) errors.location = "Location is required.";
      if (!formData.numberOfMembers || formData.numberOfMembers <= 0)
        errors.numberOfMembers = "Please enter a valid number of attendees.";
    } else if (currentStep === 2) {
      if (!formData.organizer) errors.organizer = "Please select an organizer.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleServiceChange = (service) => {
    setFormData((prev) => {
      const isSelected = service.name in prev.selectedServices;
      let updatedServices = { ...prev.selectedServices };
      if (isSelected) {
        delete updatedServices[service.name];
      } else {
        updatedServices[service.name] = service.options ? service.options[0].tier : true;
      }
      const updatedForm = { ...prev, selectedServices: updatedServices };
      localStorage.setItem("birthdayFormData", JSON.stringify(updatedForm));
      return updatedForm;
    });
  };

  const handleTierChange = (serviceName, selectedTier) => {
    setFormData((prev) => {
      const updatedForm = {
        ...prev,
        selectedServices: { ...prev.selectedServices, [serviceName]: selectedTier },
      };
      localStorage.setItem("birthdayFormData", JSON.stringify(updatedForm));
      return updatedForm;
    });
  };

  const calculateTotalAmount = () => {
    const numMembers = parseInt(formData.numberOfMembers) || 0;
    const baseCost = numMembers > THRESHOLD ? (numMembers - THRESHOLD) * PER_PERSON_RATE : 0;
    const selectedServices = formData.selectedServices || {};
    const servicesCost = Object.entries(selectedServices).reduce(
      (sum, [serviceName, selectedTier]) => {
        const service = services.find((s) => s.name === serviceName);
        if (service?.options) {
          const selectedOption = service.options.find((opt) => opt.tier === selectedTier);
          return sum + (selectedOption ? selectedOption.price : 0);
        }
        return sum + (service ? service.price : 0);
      },
      0
    );
    return baseCost + servicesCost;
  };

  const totalAmount = calculateTotalAmount();

  const getSelectedServicesString = () => {
    const selected = Object.keys(formData.selectedServices);
    return selected.length > 0 ? selected.join(", ") : "None"; // Default to "Photography & Videography" if no services selected
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        const transformedSelectedServices = getSelectedServicesString(); // Pass as string instead of array
        const formDataWithAmount = { ...formData, selectedServices: transformedSelectedServices, totalAmount };
        localStorage.setItem("birthdayFormData", JSON.stringify(formDataWithAmount));
        navigate("/venue", { state: { totalAmount, organizer: formData.organizer, formData: formDataWithAmount } });
      }
    } else {
      alert("Please complete all required fields to proceed.");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.venue && isAdmin) {
      alert("Venue is required to confirm the booking.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to book an event.");
        navigate("/login");
        return;
      }

      const transformedSelectedServices = getSelectedServicesString();
      const formDataWithAmount = { ...formData, selectedServices: transformedSelectedServices, totalAmount };

      const response = await axios.post(
        "https://advanced-event-management.onrender.com/api/add-birthday-event",
        formDataWithAmount,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        alert(`Booking Confirmed!\nTotal Amount: ₹${totalAmount}`);
        localStorage.removeItem("birthdayFormData");
        setFormData(initialFormData);
        setIsAdmin(false);
        setStep(1);
        navigate("/booked-events");
      }
    } catch (err) {
      console.error("Error submitting the birthday event:", err.response?.data || err);
      alert(`Error: ${err.response?.data?.message || "Something went wrong. Please try again."}`);
    }
  };

  const CustomProgress = ({ currentStep, totalSteps }) => {
    return (
      <div className="d-flex align-items-center mb-5" style={{ width: "100%", justifyContent: "space-between" }}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <React.Fragment key={index}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: currentStep >= index + 1 ? "#007bff" : "#ccc",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                style={{
                  flexGrow: 1,
                  height: "4px",
                  backgroundColor: currentStep > index + 1 ? "#007bff" : "#ccc",
                  margin: "0 10px",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const displayAdminView = () => (
    <div className="p-5">
      <h1 className="mb-5 text-center text-primary">Review & Confirm Your Event</h1>
      <Row className="mb-5">
        <Col md={12}>
          <h5 className="mb-3">Event Details</h5>
          <ListGroup variant="flush">
            <ListGroup.Item><strong>Name:</strong> {formData.name}</ListGroup.Item>
            <ListGroup.Item><strong>Email:</strong> {formData.email}</ListGroup.Item>
            <ListGroup.Item><strong>Date:</strong> {formData.eventDate}</ListGroup.Item>
            <ListGroup.Item><strong>Location:</strong> {formData.location}</ListGroup.Item>
            <ListGroup.Item><strong>Attendees:</strong> {formData.numberOfMembers}</ListGroup.Item>
            <ListGroup.Item><strong>Organizer:</strong> {formData.organizer}</ListGroup.Item>
            <ListGroup.Item><strong>Venue:</strong> {formData.venue || "Not selected"}</ListGroup.Item>
            <ListGroup.Item><strong>Services:</strong> {getSelectedServicesString()}</ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={12} className="mt-4">
          <h5 className="mb-3">Cost Summary</h5>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <strong>Base Cost:</strong> ₹
              {(parseInt(formData.numberOfMembers) || 0) > THRESHOLD
                ? (parseInt(formData.numberOfMembers) - THRESHOLD) * PER_PERSON_RATE
                : 0}
            </ListGroup.Item>
            {Object.keys(formData.selectedServices).map((serviceName) => {
              const service = services.find((s) => s.name === serviceName);
              const selectedTier = formData.selectedServices[serviceName];
              return (
                <ListGroup.Item key={serviceName}>
                  {service.name}:{" "}
                  {service.options
                    ? `${selectedTier} - ₹${service.options.find((option) => option.tier === selectedTier)?.price}`
                    : `₹${service.price}`}
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Col>
      </Row>
      <div className="bg-primary text-white text-center p-4 mb-5">
        <h3 className="mb-0">Total: ₹{totalAmount}</h3>
      </div>
      <div className="d-flex justify-content-center gap-3">
        <Button variant="outline-secondary" size="lg" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button variant="success" size="lg" className="px-5" onClick={handleSubmit}>
          Confirm Booking
        </Button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className="mb-4">Step 1: Event Basics</h3>
            <Row>
              <Col md={6}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.name}
                    placeholder="Enter your full name"
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.email}
                    placeholder="Enter your email"
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group controlId="eventDate" className="mb-3">
                  <Form.Label>Event Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.eventDate}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.eventDate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="location" className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.location}
                    placeholder="Enter event location"
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.location}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="numberOfMembers" className="mb-3">
                  <Form.Label>Attendees</Form.Label>
                  <Form.Control
                    type="number"
                    name="numberOfMembers"
                    value={formData.numberOfMembers}
                    onChange={handleInputChange}
                    isInvalid={!!formErrors.numberOfMembers}
                    min="1"
                    placeholder="Number of attendees"
                  />
                  <Form.Text className="text-muted">
                    ₹{PER_PERSON_RATE} per person above {THRESHOLD}
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">{formErrors.numberOfMembers}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </>
        );
      case 2:
        return (
          <>
            <h3 className="mb-4">Step 2: Organizer & Services</h3>
            <Form.Group controlId="organizer" className="mb-4">
              <Form.Label>Select Organizer</Form.Label>
              <Form.Select
                name="organizer"
                value={formData.organizer}
                onChange={handleInputChange}
                isInvalid={!!formErrors.organizer}
              >
                <option value="">Choose an organizer</option>
                {organizers.map((org) => (
                  <option key={org.id} value={org.name}>
                    {org.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{formErrors.organizer}</Form.Control.Feedback>
            </Form.Group>
            {loading ? (
              <div className="text-center my-4">
                <Spinner animation="border" variant="primary" />
                <p>Loading services...</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="my-4">
                {error}
              </Alert>
            ) : formData.organizer ? (
              services.length > 0 ? (
                <Row>
                  {services.map((service) => (
                    <Col md={6} key={service.name} className="mb-3">
                      <Form.Check
                        type="checkbox"
                        id={service.name}
                        label={service.name}
                        checked={service.name in formData.selectedServices}
                        onChange={() => handleServiceChange(service)}
                        className="mb-2"
                      />
                      {service.options && service.name in formData.selectedServices && (
                        <Form.Select
                          value={formData.selectedServices[service.name]}
                          onChange={(e) => handleTierChange(service.name, e.target.value)}
                        >
                          {service.options.map((option) => (
                            <option key={option.tier} value={option.tier}>
                              {option.tier} - ₹{option.price}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="info" className="my-4">
                  No services available for this organizer.
                </Alert>
              )
            ) : (
              <Alert variant="warning" className="my-4">
                Please select an organizer to view services.
              </Alert>
            )}
          </>
        );
      case 3:
        return (
          <>
            <h3 className="mb-4">Step 3: Review & Proceed</h3>
            <h5 className="mb-3">Event Summary</h5>
            <ListGroup variant="flush">
              <ListGroup.Item><strong>Name:</strong> {formData.name}</ListGroup.Item>
              <ListGroup.Item><strong>Email:</strong> {formData.email}</ListGroup.Item>
              <ListGroup.Item><strong>Date:</strong> {formData.eventDate}</ListGroup.Item>
              <ListGroup.Item><strong>Location:</strong> {formData.location}</ListGroup.Item>
              <ListGroup.Item><strong>Attendees:</strong> {formData.numberOfMembers}</ListGroup.Item>
              <ListGroup.Item><strong>Organizer:</strong> {formData.organizer}</ListGroup.Item>
              <ListGroup.Item><strong>Services:</strong> {getSelectedServicesString()}</ListGroup.Item>
            </ListGroup>
            <div className="bg-primary text-white text-center p-4 mt-4">
              <h4 className="mb-0">Total: ₹{totalAmount}</h4>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <Container fluid className="py-5" style={{ background: "#ffffff" }}>
        <Container fluid className="px-2">
          <Row className="justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <Col xs={12}>
              <Row>
                <Col md={6} className="d-flex flex-column justify-content-center">
                  <h1 className="mb-4" style={{ marginTop: "50px" }}>
                    {isAdmin ? "Finalize Your Birthday Event" : "Plan Your Perfect Birthday"}
                  </h1>
                  {!isAdmin ? (
                    <>
                      <CustomProgress currentStep={step} totalSteps={3} />
                      <Form>
                        {renderStepContent()}
                        <div className="d-flex justify-content-between mt-5">
                          {step > 1 && (
                            <Button variant="outline-secondary" size="lg" onClick={handleBack}>
                              Back
                            </Button>
                          )}
                          <Button variant="primary" size="lg" onClick={handleNext} className="ms-auto">
                            {step === 3 ? "Proceed to Venue" : "Next"}
                          </Button>
                        </div>
                      </Form>
                    </>
                  ) : (
                    displayAdminView()
                  )}
                </Col>
                <Col md={6} className="d-flex justify-content-center align-items-center">
                  <img
                    src={birthdayImage}
                    alt="Birthday Celebration"
                    className="img-fluid"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      maxHeight: "80vh",
                      marginTop: "20px",
                    }}
                    onError={(e) => {
                      console.error("Failed to load birthday image");
                      e.target.src = "https://via.placeholder.com/500x500?text=Image+Not+Found";
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </Container>
      <Footer />
    </>
  );
};

export default Birthday;