import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "animate.css";
import Header from "./Header";
import Footer from "./Footer";

const PaymentDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const userId = state?.userId || localStorage.getItem("userId") || "";

  useEffect(() => {
    if (!userId) {
      window.alert("User ID is missing. Please log in.");
      navigate("/booked-events");
      return;
    }
    fetchEventDetails();
  }, [userId, navigate]);

  const fetchEventDetails = async () => {
    if (!state?.eventDate) {
      window.alert("Event date is missing.");
      return;
    }
  
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/user-birthday-event?eventDate=${state.eventDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
  
      if (data.success) {
        console.log("Event data:", data.event);
        setEvent(data.event);
      } else {
        window.alert(data.message || "No event found.");
        setEvent(null);
      }
    } catch (error) {
      window.alert("Error fetching event details.");
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  };
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getServiceIcon = (service) => {
    switch (service.toLowerCase()) {
      case "entertainment":
        return "bi-music-note-beamed";
      case "cake":
        return "bi-cake-fill";
      default:
        return "bi-gift-fill";
    }
  };

  return (
    <>
      <Header />
      <div
        className="container-fluid py-5"
        style={{
          background: "linear-gradient(rgb(85, 26, 139) 20%, rgb(53, 38, 77) 100%)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
        }}
      >
        <div
          className="position-absolute"
          style={{
            top: "5%",
            left: "3%",
            width: "25px",
            height: "25px",
            background: "#fff",
            borderRadius: "50%",
            opacity: 0.3,
          }}
        />
        <div
          className="position-absolute"
          style={{
            bottom: "10%",
            right: "5%",
            width: "20px",
            height: "20px",
            background: "#fff",
            transform: "rotate(45deg)",
            opacity: 0.3,
          }}
        />

        <h1
          className="text-center fw-bold mt-5 mb-5 display-3 animate__animated animate__zoomIn"
          style={{
            color: "#fff",
            position: "relative",
            zIndex: 2,
          }}
        >
          🎂 Birthday Event Details 🎈
          <span
            className="position-absolute"
            style={{
              top: "-30px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "2rem",
              color: "#fff",
            }}
          >
            🎉
          </span>
        </h1>

        {isLoading ? (
          <div className="text-center py-5">
            <div
              className="spinner-grow"
              style={{ width: "4rem", height: "4rem", background: "#fff" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 fs-4 text-light animate__animated animate__pulse animate__infinite">
              Getting your party ready...
            </p>
          </div>
        ) : event ? (
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <div
                className="card border-0 shadow-lg rounded-4 position-relative overflow-hidden animate__animated animate__fadeInUp"
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  color: "#000",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";
                }}
              >
                <div
                  className="card-header text-center py-4"
                  style={{
                    background: "linear-gradient(135deg, rgb(20, 5, 35), rgb(8, 2, 17))",
                    color: "#fff",
                    borderRadius: "20px 20px 0 0",
                  }}
                >
                  <h2 className="mb-0 fw-bold">{event.name}'s Grand Celebration</h2>
                  <p className="mt-2 fs-5">A Celebration in Style!</p>
                </div>

                <div className="card-body p-5">
                  <ul className="list-unstyled mb-5">
                    <li className="d-flex align-items-center mb-4">
                      <i className="bi bi-envelope-fill me-3 fs-3" style={{ color: "rgb(85, 26, 139)" }}></i>
                      <span className="fw-semibold fs-5">Email:</span>
                      <span className="ms-2 fs-5" style={{ color: "rgb(53, 38, 77)" }}>{event.email}</span>
                    </li>
                    <li className="d-flex align-items-center mb-4">
                      <i className="bi bi-calendar-event me-2 fs-3" style={{ color: "rgb(85, 26, 139)" }}></i>
                      <span className="fw-semibold fs-5">Date:</span>
                      <span className="ms-2 fs-5" style={{ color: "rgb(53, 38, 77)" }}>{formatDate(event.eventDate)}</span>
                    </li>
                    <li className="d-flex align-items-center mb-4">
                      <i className="bi bi-geo-alt-fill me-3 fs-3" style={{ color: "rgb(85, 26, 139)" }}></i>
                      <span className="fw-semibold fs-5">Location:</span>
                      <span className="ms-2 fs-5" style={{ color: "rgb(53, 38, 77)" }}>{event.location}</span>
                    </li>
                    <li className="d-flex align-items-center mb-4">
                      <i className="bi bi-house-door-fill me-3 fs-3" style={{ color: "rgb(85, 26, 139)" }}></i>
                      <span className="fw-semibold fs-5">Venue:</span>
                      <span className="ms-2 fs-5" style={{ color: "rgb(53, 38, 77)" }}>{event.venue}</span>
                    </li>
                    <li className="d-flex align-items-center mb-4">
                      <i className="bi bi-people-fill me-3 fs-3" style={{ color: "rgb(85, 26, 139)" }}></i>
                      <span className="fw-semibold fs-5">Guests:</span>
                      <span className="ms-2 fs-5" style={{ color: "rgb(53, 38, 77)" }}>{event.numberOfMembers}</span>
                    </li>
                    <li className="d-flex align-items-center mb-4">
                      <i className="bi bi-person-lines-fill me-3 fs-3" style={{ color: "rgb(85, 26, 139)" }}></i>
                      <span className="fw-semibold fs-5">Organizer:</span>
                      <span className="ms-2 fs-5" style={{ color: "rgb(53, 38, 77)" }}>{event.organizer}</span>
                    </li>
                    {event?.organizerEmail && (
                      <li className="d-flex align-items-center mb-4">
                        <i className="bi bi-envelope-fill me-3 fs-3" style={{ color: "rgb(85, 26, 139)" }}></i>
                        <span className="fw-semibold fs-5">Organizer Email:</span>
                        <span className="ms-2 fs-5" style={{ color: "rgb(53, 38, 77)" }}>{event.organizerEmail}</span>
                      </li>
                    )}
                   
                    <li className="d-flex align-items-center mb-4">
                      <i className="bi bi-cash-stack me-3 fs-3" style={{ color: "rgb(85, 26, 139)" }}></i>
                      <span className="fw-semibold fs-5">Total:</span>
                      <span className="ms-2 fs-5" style={{ color: "rgb(53, 38, 77)" }}>{formatCurrency(event.totalAmount)}</span>
                    </li>
                    {Object.entries(event.selectedServices).map(([service, value]) => (
                      <li key={service} className="d-flex align-items-center mb-4">
                        <i className={`${getServiceIcon(service)} me-3 fs-3`} style={{ color: "rgb(85, 26, 139)" }}></i>
                        <span className="fw-semibold fs-5">Services:</span>
                        <span className="ms-2 fs-5" style={{ color: "rgb(53, 38, 77)" }}>{value}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-center mt-5">
                    <button
                      className="btn btn-lg px-5 py-2 rounded-pill shadow-lg animate__animated animate__tada"
                      style={{
                        background: "linear-gradient(135deg, rgb(85, 26, 139), rgb(53, 38, 77))",
                        color: "#fff",
                        border: "2px solid rgb(53, 38, 77)",
                      }}
                      onClick={() => navigate("/book-event")}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, rgb(53, 38, 77), rgb(85, 26, 139))")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, rgb(85, 26, 139), rgb(53, 38, 77))")}
                    >
                      <i className="bi bi-arrow-left-circle me-2"></i>
                      Back to Celebrations
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-cake2 display-1 animate__animated animate__wobble" style={{ color: "#fff" }}></i>
            <p className="mt-3 fs-4 text-light">No celebration details found yet!</p>
            <button
              className="btn btn-outline-light mt-3 rounded-pill px-4"
              onClick={() => navigate("/book-event")}
            >
              Back to Events
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PaymentDetail;