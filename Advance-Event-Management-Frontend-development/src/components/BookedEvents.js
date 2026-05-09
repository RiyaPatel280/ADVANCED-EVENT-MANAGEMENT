import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Header";
import Footer from "./Footer";

const BookedEvents = () => {
  const navigate = useNavigate();
  const [bookedEvents, setBookedEvents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [rating, setRating] = useState(0);
  const email = localStorage.getItem("userEmail") || "";
  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    if (email) {
      fetchBookedEvents();
      fetchPaymentDetails();
    } else {
      window.alert("Sign in to view your booked events.");
      navigate("/login");
    }
  }, [email, navigate]);

  const fetchBookedEvents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://advanced-event-management.onrender.com/api/booked-events?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setBookedEvents(data.bookedEvents || []);
      } else {
        setBookedEvents([]);
      }
    } catch (error) {
      window.alert("Failed to load your booked events.");
      setBookedEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://advanced-event-management.onrender.com/api/check-birthday-payment-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.payments) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
    }
  };

  const handleViewDetails = (eventId) => {
    if (!eventId) {
      window.alert("Event details unavailable.");
      return;
    }
    navigate(`/event-detail/${eventId}`);
  };

  const handleFeedback = (eventId) => {
    if (!eventId) {
      window.alert("Event feedback unavailable.");
      return;
    }
    setSelectedEventId(eventId);
    setRating(0);
    setShowModal(true);
  };

  const handleRating = (rate) => {
    setRating(rate);
  };

  const submitFeedback = async () => {
    if (!selectedEventId || rating === 0) {
      window.alert("Please select a rating before submitting.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://advanced-event-management.onrender.com/api/submit-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          rating: rating,
          userId: userId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        window.alert("Feedback submitted successfully!");
        setShowModal(false);
      } else {
        if (data.message === "You have already submitted feedback for this event") {
          window.alert("You have already submitted feedback for this event.");
        } else {
          window.alert(data.message || "Failed to submit feedback.");
        }
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      window.alert("An error occurred while submitting feedback.");
    }
  };

  const handlePaymentDetails = (paymentId, userIdFromPayment, eventDate) => {
    if (!paymentId || !userIdFromPayment || !eventDate) {
      window.alert("Payment details unavailable.");
      return;
    }
    navigate(`/payment-detail/${paymentId}`, { 
      state: { userId: userIdFromPayment, paymentId: paymentId, eventDate: eventDate } 
    });
  };
  

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const fullStarFilled = rating >= i;
      const halfStarFilled = rating >= i - 0.5 && rating < i;

      stars.push(
        <span
          key={`star-${i}`}
          style={{
            position: "relative",
            display: "inline-block",
            width: "2rem",
            marginRight: "6px",
          }}
        >
          <i
            className={`bi ${halfStarFilled || fullStarFilled ? "bi-star-fill" : "bi-star"} fs-2`}
            style={{
              color: halfStarFilled || fullStarFilled ? "#FFD700" : "#551A8B",
              cursor: "pointer",
              clipPath: "inset(0 50% 0 0)",
              position: "absolute",
            }}
            onClick={() => handleRating(i - 0.5)}
          ></i>
          <i
            className={`bi ${fullStarFilled ? "bi-star-fill" : "bi-star"} fs-2`}
            style={{
              color: fullStarFilled ? "#FFD700" : "#551A8B",
              cursor: "pointer",
              clipPath: "inset(0 0 0 50%)",
              position: "absolute",
            }}
            onClick={() => handleRating(i)}
          ></i>
          <i
            className="bi bi-star fs-2"
            style={{ opacity: 0, cursor: "pointer", position: "relative" }}
            onClick={(e) => {
              const rect = e.target.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const halfWidth = rect.width / 2;
              handleRating(i - (clickX < halfWidth ? 0.5 : 0));
            }}
          ></i>
        </span>
      );
    }
    return stars;
  };

  return (
    <>
      <Header />
      <div
        className="container-fluid py-5 mt-5"
        style={{
          background: "linear-gradient(rgb(85, 26, 139) 20%, rgb(53, 38, 77) 100%)",
        }}
      >
        <div className="container pt-5">
          {/* Booked Events Section */}
          <div className="text-center mb-5">
            <h1
              className="display-3 fw-bold text-white"
              style={{
                textShadow: "0 0 10px #4B0082, 0 0 20px #fff",
                fontFamily: "'Georgia', serif",
              }}
            >
              Your Booked Events
            </h1>
            <p className="lead text-white opacity-75">
              Your reserved experiences await.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-white opacity-50" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : bookedEvents.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
              {bookedEvents.map((event, index) => (
                <div key={index} className="col">
                  <div className="card h-100 bg-white border-0 shadow-sm">
                    <div className="card-body p-4 d-flex flex-column">
                      <h5
                        className="card-title fw-semibold mb-3 fs-3"
                        style={{ color: "#551A8B" }}
                      >
                        {event.eventId?.title || "Untitled Event"}
                      </h5>
                      <p className="mb-2 fs-5" style={{ color: "#551A8B" }}>
                        <i className="bi bi-calendar-event me-2"></i>
                        {event.eventId?.startDate
                          ? formatDate(event.eventId.startDate)
                          : "Date TBD"}
                      </p>
                      <p className="mb-4 fs-6" style={{ color: "#551A8B" }}>
                        <i className="bi bi-geo-alt me-2"></i>
                        {event.eventId?.venue || "Venue TBD"}
                      </p>
                      <div className="mt-auto d-flex justify-content-start gap-3">
                        <button
                          className="btn fw-medium px-4 py-2"
                          style={{
                            background: "linear-gradient(rgb(85, 26, 139) 20%, rgb(53, 38, 77) 100%)",
                            color: "#fff",
                          }}
                          onClick={() => handleFeedback(event.eventId?._id)}
                        >
                          <i className="bi bi-chat-left-text me-2"></i> Feedback
                        </button>
                        <button
                          className="btn fw-medium px-4 py-2"
                          style={{
                            background: "linear-gradient(rgb(85, 26, 139) 20%, rgb(53, 38, 77) 100%)",
                            color: "#fff",
                          }}
                          onClick={() => handleViewDetails(event.eventId?._id)}
                        >
                          <i className="bi bi-eye me-2"></i> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <h3 className="text-white fw-light mb-4 opacity-75 fs-2">
                No events booked yet.
              </h3>
              <p className="text-white opacity-50 mb-4 fs-5">
                Start booking your exclusive experiences.
              </p>
              <button
                className="btn btn-light fw-medium px-5 py-3"
                style={{ color: "#551A8B" }}
                onClick={() => navigate("/alleventview")}
              >
                <i className="bi bi-search me-2"></i> Explore Now
              </button>
            </div>
          )}

          {/* Feedback Modal */}
          <div className={`modal fade ${showModal ? "show d-block" : ""}`} tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" style={{ color: "#551A8B" }}>Rate This Event</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="d-flex justify-content-center mb-3">
                    {renderStars()}
                  </div>
                  <p className="text-center" style={{ color: "#551A8B" }}>
                    {rating > 0 ? `You rated ${rating} star${rating !== 1 ? "s" : ""}` : "Please select a rating"}
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn fw-medium px-4 py-2"
                    style={{
                      background: "linear-gradient(rgb(85, 26, 139) 20%, rgb(53, 38, 77) 100%)",
                      color: "#fff",
                    }}
                    onClick={submitFeedback}
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History Section */}
          <div className="text-center mb-5">
            <h1
              className="display-3 fw-bold text-white"
              style={{
                textShadow: "0 0 10px #4B0082, 0 0 20px #fff",
                fontFamily: "'Georgia', serif",
              }}
            >
              Your Birthday Booking
            </h1>
            <p className="lead text-white opacity-75">
              Your special day, officially set
            </p>
          </div>

          {payments.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {payments.map((payment, index) => (
                <div key={index} className="col">
                  <div className="card h-100 bg-white border-0 shadow-sm">
                    <div className="card-body p-4 d-flex flex-column">
                      <h5
                        className="card-title fw-semibold mb-3 fs-3"
                        style={{ color: "#551A8B" }}
                      >
                        Birthday Event Payment
                      </h5>
                      <p className="mb-2 fs-5" style={{ color: "#551A8B" }}>
                        <i className="bi bi-calendar-event me-2"></i>
                        {payment.eventDate ? formatDate(payment.eventDate) : "Date TBD"}
                      </p>
                      <p className="mb-2 fs-6" style={{ color: "#551A8B" }}>
                        <i className="bi bi-geo-alt me-2"></i>
                        {payment.venue || "Venue TBD"}
                      </p>
                      <p className="mb-2 fs-6" style={{ color: "#551A8B" }}>
                        <i className="bi bi-cash me-2"></i>
                        Amount: {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className="mb-2 fs-6" style={{ color: "#551A8B" }}>
                        <i className="bi bi-receipt me-2"></i>
                        Payment ID: {payment.razorpayPaymentId}
                      </p>
                      <p className="mb-2 fs-6" style={{ color: "#551A8B" }}>
                        <i className="bi bi-check-circle me-2"></i>
                        Status: {payment.status}
                      </p>
                      <p className="mb-4 fs-6" style={{ color: "#551A8B" }}>
                        <i className="bi bi-clock me-2"></i>
                        Paid on: {formatDate(payment.createdAt)}
                      </p>
                      <div className="mt-auto d-flex gap-3">
                      <button
  className="btn fw-medium px-4 py-2"
  style={{
    background: "linear-gradient(rgb(85, 26, 139) 20%, rgb(53, 38, 77) 100%)",
    color: "#fff",
  }}
  onClick={() => handlePaymentDetails(payment.razorpayPaymentId, payment.userId, payment.eventDate)}
>
  <i className="bi bi-eye me-2"></i> View Details
</button>

                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <h3 className="text-white fw-light mb-4 opacity-75 fs-2">
                No payment history yet.
              </h3>
              <p className="text-white opacity-50 mb-4 fs-5">
                Your payment records will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookedEvents;