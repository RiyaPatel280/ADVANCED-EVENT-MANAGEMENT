import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Header";
import Footer from "./Footer";

const BirthdayEventDetail = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const response = await fetch(
          `http://localhost:4000/api/birthday-events/email/${encodeURIComponent(email)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const text = await response.text();
        console.log("Raw response:", text);

        const data = JSON.parse(text);
        if (data.success) {
          setEvent(data.event);
        } else {
          throw new Error(data.message || "Failed to fetch event details.");
        }
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [email]);

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
    }).format(amount / 100);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-purple" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-danger">Error</h3>
        <p>{error}</p>
        <button className="btn btn-outline-purple" onClick={handleBack}>
          Go Back
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-5 text-center">
        <h3>No Event Found</h3>
        <button className="btn btn-outline-purple" onClick={handleBack}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container py-5">
        <h2 className="text-center fw-bold mb-5 text-purple-gradient display-5">
          🎂 {event.name} Details
        </h2>
        <div className="card shadow-lg p-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <p className="fs-5">
                  <strong>
                    <i className="bi bi-person me-2"></i> Name:
                  </strong>{" "}
                  {event.name}
                </p>
                <p className="fs-5">
                  <strong>
                    <i className="bi bi-envelope me-2"></i> Email:
                  </strong>{" "}
                  {event.email}
                </p>
                <p className="fs-5">
                  <strong>
                    <i className="bi bi-calendar-event me-2"></i> Event Date:
                  </strong>{" "}
                  {formatDate(event.eventDate)}
                </p>
                <p className="fs-5">
                  <strong>
                    <i className="bi bi-geo-alt me-2"></i> Location:
                  </strong>{" "}
                  {event.location}
                </p>
                <p className="fs-5">
                  <strong>
                    <i className="bi bi-geo-alt-fill me-2"></i> Venue:
                  </strong>{" "}
                  {event.venue}
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <p className="fs-5">
                  <strong>
                    <i className="bi bi-people me-2"></i> Number of Members:
                  </strong>{" "}
                  {event.numberOfMembers}
                </p>
                <p className="fs-5">
                  <strong>
                    <i className="bi bi-cash me-2"></i> Total Amount:
                  </strong>{" "}
                  {formatCurrency(event.totalAmount)}
                </p>
                <p className="fs-5">
                  <strong>
                    <i className="bi bi-person-check me-2"></i> Organizer:
                  </strong>{" "}
                  {event.organizer}
                </p>
                <p className="fs-5">
                  <strong>
                    <i className="bi bi-list-check me-2"></i> Selected Services:
                  </strong>
                </p>
                <ul className="list-unstyled">
                  {Object.entries(event.selectedServices).map(([service, value]) => (
                    <li key={service} className="ms-4">
                      {value ? (
                        <span>
                          <i className="bi bi-check-circle text-success me-2"></i>
                          {service}
                        </span>
                      ) : (
                        <span>
                          <i className="bi bi-x-circle text-danger me-2"></i>
                          {service}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="text-center mt-4">
              <button
                className="btn btn-outline-purple btn-lg px-4 py-2"
                onClick={handleBack}
              >
                <i className="bi bi-arrow-left me-2"></i> Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BirthdayEventDetail;