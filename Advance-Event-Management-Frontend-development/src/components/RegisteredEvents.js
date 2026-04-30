import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Header";
import Footer from "./Footer";

const RegisteredEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const email = localStorage.getItem("userEmail") || "";
  const name = localStorage.getItem("userName") || "";

  useEffect(() => {
    if (email) {
      fetchUserRegistrations();
    } else {
      window.alert("Sign in to unlock your curated events.");
      navigate("/login");
    }
  }, [email, navigate]);

  const fetchUserRegistrations = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/user-registrations?email=${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setEvents(data.registeredEvents || []);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      window.alert("Failed to load your events.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRegistration = async (eventId, userName, eventTitle) => {
    if (!eventId) {
      window.alert("Event ID missing—cancellation aborted.");
      return;
    }
    if (!window.confirm(`Cancel your spot for ${eventTitle || "this event"}?`))
      return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:4000/api/cancel-registration",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, eventId }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setEvents((prev) => prev.filter((event) => event.eventId?._id !== eventId));
        window.alert("Spot successfully released.");
        await fetch("http://localhost:4000/api/notification/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `${userName} released their spot for ${eventTitle || "an event"}.`,
          }),
        });
      } else {
        window.alert("Cancellation failed: " + data.message);
      }
    } catch (error) {
      console.error("Cancel error:", error);
      window.alert("An error occurred during cancellation.");
    }
  };

  const handleBookNow = (event) => {
    if (!event?.eventId?._id) {
      window.alert("Event details unavailable.");
      return;
    }
    navigate(`/event-detail/${event.eventId._id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          <div className="text-center mb-5">
            <h1
              className="display-3 fw-bold text-white"
              style={{
                color: "#fff",
                textShadow: "0 0 10px #4B0082, 0 0 20px #fff",
                fontFamily: "'Georgia', serif",
              }}
            >
              Your Exclusive Events
            </h1>
            <p className="lead text-white opacity-75">
              Curated experiences, reserved just for you.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-white opacity-50" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : events.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {events.map((event, index) => (
                <div key={index} className="col">
                  <div className="card h-100 bg-white border-0 shadow-sm">
                    <div className="card-body p-4 d-flex flex-column">
                      <h5
                        className="card-title fw-semibold mb-3 fs-3"
                        style={{
                          color: "#551A8B",
                        }}
                      >
                        {event.eventId?.title || "Untitled Experience"}
                      </h5>
                      <p
                        className="mb-2 fs-5"
                        style={{
                          color: "#551A8B",
                        }}
                      >
                        <i className="bi bi-calendar-event me-2"></i>
                        {event.eventId?.startDate
                          ? formatDate(event.eventId.startDate)
                          : "Date TBD"}
                      </p>
                      <p
                        className="mb-4 fs-6"
                        style={{
                          color: "#551A8B",
                        }}
                      >
                        <i className="bi bi-geo-alt me-2"></i>
                        {event.eventId?.venue || "Location TBD"}
                      </p>
                      <div className="mt-auto d-flex gap-3">
                        <button
                          className="btn fw-medium px-4 py-2"
                          style={{
                            background: "linear-gradient(rgb(85, 26, 139) 20%, rgb(53, 38, 77) 100%)",
                            color: "#fff",
                          }}
                          onClick={() => handleBookNow(event)}
                        >
                          <i className="bi bi-calendar-check me-2"></i> Book Now
                        </button>
                        <button
                          className="btn fw-medium px-4 py-2"
                          style={{
                            background: "transparent",
                            color: "rgb(85, 26, 139)",
                            border: "1px solid rgb(85, 26, 139)",
                          }}
                          onClick={() =>
                            cancelRegistration(
                              event.eventId?._id,
                              name,
                              event.eventId?.title
                            )
                          }
                        >
                          <i className="bi bi-x-circle me-2"></i> Cancel
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
                No events reserved yet.
              </h3>
              <p className="text-white opacity-50 mb-4 fs-5">
                Discover experiences that define your journey.
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RegisteredEvents;