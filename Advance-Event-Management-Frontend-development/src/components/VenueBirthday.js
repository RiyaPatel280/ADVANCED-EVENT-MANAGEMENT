import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/VenueSelection.css";
import Header from "./Header";
import Footer from "./Footer";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import noVenueImage from "./assets/novenue.jpg";

const VenueSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialTotalFromState = location.state?.totalAmount || 0;
  const selectedOrganizer = location.state?.organizer || "";
  const initialFormData = location.state?.formData || {};

  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState("");
  const [venuePrice, setVenuePrice] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState([]); // Store multiple payments
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get("https://advanced-event-management.onrender.com/api/venues", {
          params: { addBy: selectedOrganizer },
        });
        setVenues(response.data);
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };
    if (selectedOrganizer) fetchVenues();
  }, [selectedOrganizer]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      const token = localStorage.getItem("token");
      if (token && formData.eventDate) {
        try {
          const response = await axios.get(
            `https://advanced-event-management.onrender.com/api/user-birthday-payment-details?eventDate=${formData.eventDate}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setPaymentHistory(response.data.payments || []); // Expect an array of payments
        } catch (error) {
          console.error("Error fetching payment history:", error);
        }
      }
    };
    fetchPaymentHistory();
  }, [formData.eventDate]);

  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue.name);
    setVenuePrice(venue.price);
    setFormData((prev) => ({ ...prev, venue: venue.name }));
  };

  const handleNoVenueSelect = () => {
    setSelectedVenue("none");
    setVenuePrice(0);
    setFormData((prev) => ({ ...prev, venue: "No Venue" }));
  };

  const finalTotal = BigInt(initialTotalFromState) + BigInt(venuePrice);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to proceed with payment.");
      navigate("/login");
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay script failed to load. Please try again.");
      return;
    }

    const amount = finalTotal * BigInt(100);
    const userPhone = localStorage.getItem("userPhone") || "9876543210";

    const options = {
      key: "rzp_test_zt5DDs1PmkkyDy",
      amount: Number(amount),
      currency: "INR",
      name: "Birthday Event Booking",
      description: `Payment for Birthday Event on ${formData.eventDate}`,
      handler: async function (response) {
        alert(`Payment Successful! Transaction ID: ${response.razorpay_payment_id}`);
        try {
          const saveResponse = await axios.post(
            "https://advanced-event-management.onrender.com/api/save-birthday-payment",
            {
              razorpayPaymentId: response.razorpay_payment_id,
              eventDate: formData.eventDate,
              amount: amount.toString(),
              venue: selectedVenue,
              formData: {
                ...formData,
                totalAmount: finalTotal.toString(),
              },
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Fetch updated payment history after successful payment
          const paymentDetailsResponse = await axios.get(
            `https://advanced-event-management.onrender.com/api/user-birthday-payment-details?eventDate=${formData.eventDate}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setPaymentHistory(paymentDetailsResponse.data.payments || []);
          navigate("/book-event");
        } catch (error) {
          alert("Failed to save payment details: " + (error.response?.data?.message || error.message));
        }
      },
      prefill: {
        name: formData.name || "Guest",
        email: formData.email || "guest@example.com",
        contact: userPhone,
      },
      notes: { eventDate: formData.eventDate, venue: selectedVenue },
      theme: { color: "#7D4CAF" },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };
  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };
  return (
    <>
      <Header />
      <div className="container py-5" style={{ paddingTop: "5rem" }}>
        <div
          className="text-center mb-5 p-4 rounded-3"
          style={{
            background: "linear-gradient(135deg, #7D4CAF, #551A8B)",
            color: "#fff",
            marginTop: "3rem",
          }}
        >
          <h1 className="display-5 fw-bold mb-4">
            <i className="bi bi-geo-alt-fill me-2"></i> Venue Selection
          </h1>
          <p className="lead mb-3">Step 4 of 4: Choose a venue to finalize your booking</p>
          {selectedOrganizer && (
            <p className="fs-5">
              Organizer:{" "}
              <span className="fw-semibold badge bg-light text-dark py-2 px-3">
                {selectedOrganizer}
              </span>
            </p>
          )}
        </div>

        <Form>
          <Row className="g-4">
            {venues.length > 0 ? (
              venues.map((venue) => (
                <Col key={venue._id} md={4} sm={6}>
                  <Card
                    className={`h-100 shadow-sm venue-card ${
                      selectedVenue === venue.name ? "selected" : ""
                    }`}
                    onClick={() => handleVenueSelect(venue)}
                    style={{
                      transition: "all 0.3s ease",
                      border: selectedVenue === venue.name ? "5px solid #7D4CAF" : "none",
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={venue.image}
                      alt={venue.name}
                      style={{
                        height: "200px",
                        objectFit: "cover",
                        borderTopLeftRadius: "15px",
                        borderTopRightRadius: "15px",
                      }}
                    />
                    <Card.Body className="p-4 d-flex flex-column justify-content-end">
                      <div className="custom-radio">
                        <Form.Check>
                          <Form.Check.Input
                            type="radio"
                            id={`venue-${venue._id}`}
                            name="venue"
                            value={venue.name}
                            checked={selectedVenue === venue.name}
                            onChange={() => handleVenueSelect(venue)}
                            className="d-none"
                          />
                          <Form.Check.Label
                            htmlFor={`venue-${venue._id}`}
                            className="d-flex flex-column"
                          >
                            <div className="d-flex align-items-center">
                              <span
                                className="radio-icon me-2"
                                style={{ fontSize: "1.25rem", lineHeight: "1" }}
                              >
                                <i className="bi bi-building"></i>
                              </span>
                              <span
                                className="fw-bold venue-name"
                                style={{
                                  background: "linear-gradient(45deg, #7D4CAF, #551A8B)",
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  fontSize: "1.25rem",
                                  lineHeight: "1",
                                }}
                              >
                                {venue.name}
                              </span>
                            </div>
                            <div className="venue-details mt-2">
                              <p
                                className="mb-0 venue-service"
                                style={{
                                  color: "#000",
                                  fontWeight: "600",
                                  fontSize: "1.1rem",
                                }}
                              >
                                {venue.services}
                              </p>
                              <p
                                className="mb-0 venue-price"
                                style={{
                                  color: "#28a745",
                                  fontWeight: "600",
                                  fontSize: "1.1rem",
                                }}
                              >
                                ₹{venue.price}
                              </p>
                            </div>
                          </Form.Check.Label>
                        </Form.Check>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col xs={12}>
                <div className="alert alert-info text-center">
                  <i className="bi bi-info-circle me-2"></i> No venues available.
                </div>
              </Col>
            )}

            <Col md={4} sm={6}>
              <Card
                className={`h-100 shadow-sm venue-card ${
                  selectedVenue === "none" ? "selected" : ""
                }`}
                onClick={handleNoVenueSelect}
                style={{
                  transition: "all 0.3s ease",
                  border: selectedVenue === "none" ? "5px solid #7D4CAF" : "none",
                }}
              >
                <Card.Img
                  variant="top"
                  src={noVenueImage}
                  alt="No Venue Required"
                  style={{
                    height: "200px",
                    objectFit: "cover",
                    borderTopLeftRadius: "15px",
                    borderTopRightRadius: "15px",
                  }}
                />
                <Card.Body className="p-4 d-flex flex-column justify-content-end">
                  <div className="custom-radio">
                    <Form.Check>
                      <Form.Check.Input
                        type="radio"
                        id="no-venue"
                        name="venue"
                        value="none"
                        checked={selectedVenue === "none"}
                        onChange={handleNoVenueSelect}
                        className="d-none"
                      />
                      <Form.Check.Label
                        htmlFor="no-venue"
                        className="d-flex flex-column"
                      >
                        <div className="d-flex align-items-center">
                          <span
                            className="radio-icon me-2"
                            style={{ fontSize: "1.25rem", lineHeight: "1" }}
                          >
                            <i className="bi bi-house-door"></i>
                          </span>
                          <span
                            className="fw-bold venue-name"
                            style={{
                              background: "linear-gradient(45deg, #7D4CAF, #551A8B)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              fontSize: "1.25rem",
                              lineHeight: "1",
                            }}
                          >
                            No Venue Required
                          </span>
                        </div>
                        <div className="venue-details mt-2">
                          <p
                            className="mb-0 venue-price"
                            style={{
                              color: "#28a745",
                              fontWeight: "600",
                              fontSize: "1.1rem",
                            }}
                          >
                            ₹0
                          </p>
                        </div>
                      </Form.Check.Label>
                    </Form.Check>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>

        <Card
          className="mt-5 shadow-lg border-0"
          style={{ background: "linear-gradient(135deg, #f8f9fa, #e9ecef)" }}
        >
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={6}>
                <h4 className="fw-bold mb-3">
                  <i className="bi bi-cart-check me-2"></i> Booking Summary
                </h4>
                <p>
                  Services Total: <span className="fw-semibold">₹{initialTotalFromState}</span>
                </p>
                <p>
                  Venue Cost: <span className="fw-semibold">₹{venuePrice}</span>
                </p>
                <h5 className="text-success fw-bold">Final Total: ₹{finalTotal.toString()}</h5>
                {paymentHistory.length > 0 && (
                  <div className="mt-3">
                    <h6>Payment History:</h6>
                    <ul>
                      {paymentHistory.map((payment, index) => (
                        <li key={index}>
                          Transaction ID: {payment.razorpayPaymentId} - ₹{payment.amount / 100}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Col>
              <Col md={6} className="text-md-end text-center mt-md-0 mt-3">
                <Button
                  size="lg"
                  className="px-5 payment-btn"
                  onClick={handlePayment}
                  disabled={!selectedVenue}
                  style={{ background: "linear-gradient(135deg, #7D4CAF, #551A8B)", border: "none" }}
                >
                  <i className="bi bi-wallet2 me-2"></i> Proceed to Payment
                </Button>
                <p></p>
                <Button
                  
                  size="lg"
                  className="px-5 payment-btn"
                  onClick={handleBack}
                  style={{ background: "linear-gradient(135deg,rgb(0, 0, 0),rgb(1, 1, 1))", border: "none" }}
                >
                  <i className="bi bi-arrow-left me-2"></i> Back
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default VenueSelection;