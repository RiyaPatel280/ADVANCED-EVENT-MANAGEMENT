import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Row,
  Col,
  Badge,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import logo from './assets/logo2.png';
import Header from "./Header";
import Footer from "./Footer";
import "./css/EventDetail.css";

// Custom CSS for the official non-table layout
const customStyles = `
  .official-details-container {
    background-color: #F8F9FA;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px dashed #D1D5DB;
  }
  .detail-row:last-child {
    border-bottom: none;
  }
  .detail-label {
    flex: 0 0 40%;
    font-weight: bold;
    color: #2C3E50;
  }
  .detail-value {
    flex: 0 0 60%;
    text-align: right;
    color: #1A202C;
  }
  .refund-note {
    color: #E53E3E;
    font-size: 0.9rem;
    text-align: center;
    margin-top: 10px;
  }
`;

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCompletedPayment, setHasCompletedPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isBirthdayEvent, setIsBirthdayEvent] = useState(false);
  const [userPhone, setUserPhone] = useState(() => {
    const phone = localStorage.getItem("userPhone");
    return phone && phone.length === 9 ? phone + "0" : phone || "9876543210";
  });

  useEffect(() => {
    const phone = localStorage.getItem("userPhone");
    console.log("userPhone from localStorage on mount:", phone);
    const adjustedPhone = phone && phone.length === 9 ? phone + "0" : phone || "9876543210";
    setUserPhone(adjustedPhone);

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        let fetchedEvent;
        let eventTypeIsBirthday = false;

        try {
          const eventResponse = await axios.get(`https://advanced-event-management.onrender.com/api/event-details/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchedEvent = eventResponse.data;
        } catch (predefinedError) {
          const birthdayResponse = await axios.get(`https://advanced-event-management.onrender.com/api/birthday-event/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchedEvent = {
            _id: birthdayResponse.data._id,
            title: "Birthday",
            startDate: birthdayResponse.data.eventDate,
            venue: birthdayResponse.data.venue,
            city: birthdayResponse.data.city || "Unknown",
            description: `Birthday event for ${birthdayResponse.data.name}`,
            organizer: birthdayResponse.data.organizer,
            email: birthdayResponse.data.email,
            price: birthdayResponse.data.totalAmount,
            details: `Number of Members ${birthdayResponse.data.numberOfMembers}, Services ${JSON.stringify(birthdayResponse.data.selectedServices)}`,
            customFields: birthdayResponse.data.customFields || [],
          };
          eventTypeIsBirthday = true;
        }

        setEvent(fetchedEvent);
        setIsBirthdayEvent(eventTypeIsBirthday);

        const userResponse = await axios.get("https://advanced-event-management.onrender.com/api/users/user-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userResponse.data.success) {
          setUser(userResponse.data.user);
        } else {
          throw new Error("User data fetch failed");
        }

        const paymentStatusResponse = await axios.get(
          `https://advanced-event-management.onrender.com/api/check-payment-status?${eventTypeIsBirthday ? `eventDate=${fetchedEvent.startDate}` : `eventId=${eventId}`}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHasCompletedPayment(paymentStatusResponse.data.hasCompletedPayment);

        if (paymentStatusResponse.data.hasCompletedPayment) {
          const paymentDetailsResponse = await axios.get(
            `https://advanced-event-management.onrender.com/api/user-payment-details?${eventTypeIsBirthday ? `eventDate=${fetchedEvent.startDate}` : `eventId=${eventId}`}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setPaymentDetails(paymentDetailsResponse.data.payment);
        }

        setLoading(false);
      } catch (error) {
        console.error("Fetch Error:", error.response?.data || error.message);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId, navigate]);

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
    const proceed = window.confirm("Note: This payment is not available for refund. Do you want to continue?");
    if (!proceed) {
      return;
    }

    if (!user?._id) {
      setError("User not authenticated. Please log in again.");
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in again.");
      navigate("/login");
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      setError("Razorpay script failed to load. Please try again.");
      return;
    }

    const amount = event?.price ? event.price * 100 : 500 * 100;
    const validatedPhone = userPhone.length === 10 && /^\d+$/.test(userPhone) ? userPhone : "9876543210";
    console.log("Using userPhone for payment:", validatedPhone);

    const options = {
      key: "rzp_test_zt5DDs1PmkkyDy",
      amount,
      currency: "INR",
      name: "DreamEvent",
      description: `Payment for ${event?.title || "Event"}`,
      handler: async function (response) {
        console.log("Payment Response:", response);
        alert(`Payment Successful! Transaction ID: ${response.razorpay_payment_id}`);

        try {
          const paymentPayload = isBirthdayEvent
            ? { razorpayPaymentId: response.razorpay_payment_id, eventDate: event.startDate, amount }
            : { razorpayPaymentId: response.razorpay_payment_id, eventId, amount };
          console.log("Sending payment payload:", paymentPayload);

          const saveResponse = await axios.post(
            "https://advanced-event-management.onrender.com/api/save-payment",
            paymentPayload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Save Response:", saveResponse.data);
          setHasCompletedPayment(true);

          const paymentDetailsResponse = await axios.get(
            `https://advanced-event-management.onrender.com/api/user-payment-details?${isBirthdayEvent ? `eventDate=${event.startDate}` : `eventId=${eventId}`}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Payment Details Response:", paymentDetailsResponse.data);
          setPaymentDetails(paymentDetailsResponse.data.payment);
        } catch (error) {
          console.error("Save Payment Error:", error.response?.data || error.message);
          setError("Failed to save payment details. Check console for details.");
        }
      },
      prefill: {
        name: user?.name || "Guest",
        email: user?.email || "guest@example.com",
        contact: validatedPhone,
      },
      notes: {
        address: "Dynamic Address",
        eventId: isBirthdayEvent ? null : eventId,
        eventDate: isBirthdayEvent ? event.startDate : null,
        userId: user._id,
      },
      theme: {
        color: "#7D4CAF",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const handlePaymentDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://advanced-event-management.onrender.com/api/user-payment-details?${isBirthdayEvent ? `eventDate=${event.startDate}` : `eventId=${eventId}`}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentDetails(response.data.payment);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching payment details:", error.response?.data || error.message);
      setError("Failed to fetch payment details.");
    }
  };

  const handleCloseModal = () => setShowModal(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generatePDF = () => {
    if (!paymentDetails) return null;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    doc.addImage(logo, "PNG", margin, 0, 30, 25);
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    const title = "Payment Receipt";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("www.DreamEvent.com", pageWidth - margin, 20, { align: "right" });
    doc.setLineWidth(0.5);
    doc.setDrawColor(0);
    doc.line(margin, 25, pageWidth - margin, 25);

    doc.setGState(new doc.GState({ opacity: 0.1 }));
    const watermarkWidth = 100;
    const watermarkHeight = 80;
    const watermarkX = (pageWidth - watermarkWidth) / 2;
    const watermarkY = (pageHeight - watermarkHeight) / 2;
    doc.addImage(logo, "PNG", watermarkX, watermarkY, watermarkWidth, watermarkHeight);
    doc.setGState(new doc.GState({ opacity: 1 }));

    const startX = margin;
    const startY = 35;
    const containerWidth = pageWidth - margin * 2;
    const rowHeight = 10;
    const padding = 5;

    const details = [
      { label: "Name", value: paymentDetails.userId?.name || "N/A" },
      { label: "Email", value: paymentDetails.userId?.email || "N/A" },
      { label: "Event Title", value: paymentDetails.eventId?.title || (isBirthdayEvent ? "Birthday" : "N/A") },
      { label: "Payment ID", value: paymentDetails.razorpayPaymentId || "N/A" },
      { label: "Amount", value: `${(paymentDetails.amount / 100) || "N/A"}` },
      { label: "Status", value: paymentDetails.status === "completed" ? "Paid" : paymentDetails.status || "N/A" },
      { label: "Venue", value: event.venue || "N/A" },
      { label: "City", value: event.city || "Unknown" },
    ];

    if (isBirthdayEvent) {
      details.push({ label: "Event Date", value: formatDate(paymentDetails.eventDate) || "N/A" });
    }

    doc.setFillColor(248, 249, 250);
    const containerHeight = details.length * rowHeight + padding * 2 + (paymentDetails.status === "completed" ? 15 : 0);
    doc.rect(startX, startY, containerWidth, containerHeight, "F");

    let yPos = startY + padding + 7;
    doc.setFontSize(12);
    details.forEach(({ label, value }, index) => {
      if (index < details.length - 1) {
        doc.setLineDash([1, 1]);
        doc.setDrawColor(209, 213, 219);
        doc.line(startX + padding, yPos + 1, startX + containerWidth - padding, yPos + 1);
        doc.setLineDash([]);
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(44, 62, 80);
      doc.text(label, startX + padding, yPos);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(26, 32, 44);
      const valueWidth = doc.getTextWidth(value);
      doc.text(value, startX + containerWidth - padding - valueWidth, yPos);

      yPos += rowHeight;
    });

    if (paymentDetails.status === "completed") {
      doc.setFontSize(10);
      doc.setTextColor(229, 62, 62);
      const refundNote = "Note: This payment is not available for refund.";
      const refundNoteWidth = doc.getTextWidth(refundNote);
      doc.text(refundNote, (pageWidth - refundNoteWidth) / 2, yPos + 10);
    }

    const footerY = pageHeight - 20;
    doc.setLineWidth(0.5);
    doc.setDrawColor(0);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for choosing DreamEvent! | Contact: support@dreamevent.com", pageWidth / 2, footerY, { align: "center" });

    return doc;
  };

  const downloadPDF = () => {
    const doc = generatePDF();
    if (doc) {
      doc.save(`Payment_Details_${paymentDetails.razorpayPaymentId || "Event"}.pdf`);
    }
  };

  if (loading) {
    return (
      <Container className="ed-loading-container">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Spinner animation="border" className="ed-loading-spinner" />
        </motion.div>
        <motion.span
          className="ed-loading-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Summoning Royal Grandeur...
        </motion.span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="ed-event-detail-container">
        <Alert className="ed-error-alert">
          <h4 className="mb-0">{error}</h4>
        </Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container className="ed-event-detail-container">
        <Alert className="ed-no-event-alert">
          <h5 className="mb-0">The Royal Event Has Vanished!</h5>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <div className="ed-event-detail-container" style={{ padding: 0, margin: 0 }}>
        {event.image && (
          <div className="ed-event-image-container position-relative" style={{ width: "100vw", height: "50vh", overflow: "hidden" }}>
            <motion.img
              src={`https://advanced-event-management.onrender.com/${event.image}`}
              alt={event.title || "Event Image"}
              className="ed-event-image"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) =>
                (e.target.src = "https://via.placeholder.com/1920x1080?text=Royal+Event+Image")
              }
            />
            <Badge
              className="ed-event-price-badge position-absolute"
              style={{ top: "20px", right: "20px", fontSize: "1.2rem", padding: "10px" }}
            >
              ₹{event.price || "N/A"}
            </Badge>
          </div>
        )}
        <Container className="py-5">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Row className="mb-5">
              <Col md={8}>
                <motion.h2
                  className="ed-event-title mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  {event.title || "Untitled Event"}
                </motion.h2>
                <motion.p
                  className="ed-event-description mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  {event.description || "Step into a world of royal wonder!"}
                </motion.p>
                <motion.h5
                  className="ed-section-title ed-extras-title"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  Additional Details
                </motion.h5>
                <ul className="list-unstyled">
                  <motion.li
                    className="ed-extras-item d-flex align-items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  >
                    <i className="bi bi-info-circle-fill me-2" />
                    <span><strong>Details</strong> {event.details || "No magical extras yet!"}</span>
                  </motion.li>
                  {event.customFields && event.customFields.length > 0 ? (
                    event.customFields.map((field, index) => (
                      <motion.li
                        key={index}
                        className="ed-extras-item d-flex align-items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + (index + 1) * 0.1, duration: 0.8 }}
                      >
                        <i className="bi bi-bookmark-fill me-2" />
                        <span><strong>{field.label}</strong> {field.value}</span>
                      </motion.li>
                    ))
                  ) : (
                    <motion.li
                      className="ed-extras-item d-flex align-items-center"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                    >
                      <i className="bi bi-bookmark-fill me-2" />
                      <span>No custom fields available.</span>
                    </motion.li>
                  )}
                </ul>
              </Col>
              <Col md={4}>
                <Row className="mb-4 gap-1">
                  <Col xs="auto">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      {hasCompletedPayment ? (
                        <Button
                          className="ed-payment-details-button"
                          onClick={handlePaymentDetails}
                        >
                          Payment Details
                        </Button>
                      ) : (
                        <Button
                          className="ed-payment-button"
                          onClick={handlePayment}
                          disabled={!event || !event.price || !user}
                        >
                          Pay Now
                        </Button>
                      )}
                    </motion.div>
                  </Col>
                  <Col xs="auto">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        className="ed-back-button"
                        onClick={() => window.history.back()}
                      >
                        Back to the Realm
                      </Button>
                    </motion.div>
                  </Col>
                </Row>
                <motion.h5
                  className="ed-section-title ed-highlights-title"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  Event Overview
                </motion.h5>
                <ul className="list-unstyled">
                  <motion.li
                    className="ed-highlight-item d-flex align-items-center"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  >
                    <i className="bi bi-mic-fill me-2" />
                    <span><strong>Organizer</strong> {event.organizer || "Unknown"}</span>
                  </motion.li>
                  <motion.li
                    className="ed-highlight-item d-flex align-items-center"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  >
                    <i className="bi bi-envelope-fill me-2" />
                    <span><strong>Email</strong> {event.email || "N/A"}</span>
                  </motion.li>
                  <motion.li
                    className="ed-highlight-item d-flex align-items-center"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                  >
                    <i className="bi bi-calendar-event-fill me-2" />
                    <span><strong>Date</strong> {event.startDate ? formatDate(event.startDate) : "N/A"}</span>
                  </motion.li>
                  <motion.li
                    className="ed-highlight-item d-flex align-items-center mb-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0, duration: 0.8 }}
                  >
                    <i className="bi bi-geo-alt-fill me-2" />
                    <span><strong>Venue</strong> {event.venue || "N/A"}</span>
                  </motion.li>
                  <motion.li
                    className="ed-highlight-item d-flex align-items-center"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1, duration: 0.8 }}
                  >
                    <i className="bi bi-building me-2" />
                    <span><strong>City</strong> {event.city || "Unknown"}</span>
                  </motion.li>
                  <motion.li
                    className="ed-highlight-item d-flex align-items-center"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                  >
                    <i className="bi bi-currency-rupee me-2" />
                    <span><strong>Amount</strong> ₹{event.price || "N/A"}</span>
                  </motion.li>
                </ul>
              </Col>
            </Row>
          </motion.div>
        </Container>

        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Payment Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <style>{customStyles}</style>
            {paymentDetails ? (
              <div className="official-details-container">
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{paymentDetails.userId?.name || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{paymentDetails.userId?.email || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Event Title</span>
                  <span className="detail-value">{paymentDetails.eventId?.title || (isBirthdayEvent ? "Birthday" : "N/A")}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment ID</span>
                  <span className="detail-value">{paymentDetails.razorpayPaymentId || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount</span>
                  <span className="detail-value">₹{(paymentDetails.amount / 100) || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">{paymentDetails.status === "completed" ? "Paid" : paymentDetails.status || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Venue</span>
                  <span className="detail-value">{event.venue || "N/A"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">City</span>
                  <span className="detail-value">{event.city || "Unknown"}</span>
                </div>
                {isBirthdayEvent && (
                  <div className="detail-row">
                    <span className="detail-label">Event Date</span>
                    <span className="detail-value">{formatDate(paymentDetails.eventDate) || "N/A"}</span>
                  </div>
                )}
                {paymentDetails.status === "completed" && (
                  <p className="refund-note">Note: This payment is not available for refund.</p>
                )}
              </div>
            ) : (
              <p>No payment details available.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            {paymentDetails && (
              <Button variant="primary" onClick={downloadPDF}>
                Download PDF
              </Button>
            )}
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      <Footer />
    </>
  );
};

export default EventDetail;