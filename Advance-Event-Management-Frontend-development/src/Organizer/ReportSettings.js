import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";

const OrganizerSettings = () => {
  const navigate = useNavigate();

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState(null);

  // Events state
  const [events, setEvents] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile and events on mount
  useEffect(() => {
    if (email) {
      fetchOrganizerData();
      fetchOrganizerEvents();
    }
  }, [email]);

  const fetchOrganizerData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to view your settings.");
        navigate("/login");
        return;
      }

      const profileResponse = await axios.get("https://advanced-event-management.onrender.com/api/users/user-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileResponse.data.success && profileResponse.data.user) {
        setName(profileResponse.data.user.name || "");
        setEmail(profileResponse.data.user.email || "");
        setUserId(profileResponse.data.user._id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrganizerEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://advanced-event-management.onrender.com/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events. Please try again.");
    }
  };

  // Update profile
 // Update profile
// Update profile
const updateProfile = async () => {
  if (!userId) return alert("User ID not found.");

  if (newPassword || confirmPassword) {
    if (!currentPassword) return alert("Please enter your current password.");
    if (newPassword !== confirmPassword) return alert("New password and confirmation do not match.");
    if (newPassword.length < 6) return alert("New password must be at least 6 characters long.");
  }

  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `https://advanced-event-management.onrender.com/api/users/edit-user/${userId}`,
      {
        name,
        email,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("API Response:", response.data); // Debug log to see the response
    if (response.data.success) {
      // Check if a new password was provided and show specific alert
      if (newPassword) {
        alert("Password successfully updated");
      } else {
        alert("Profile successfully updated");
      }
      setIsEditingProfile(false);
      localStorage.setItem("userEmail", email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      console.log("Error Message from Backend:", response.data.message); // Debug log for error
      // Check if the error is about the current password
      if (response.data.message && (response.data.message.toLowerCase().includes("current password") || response.data.message.toLowerCase().includes("incorrect") || response.data.message.toLowerCase().includes("invalid"))) {
        alert("Please enter your current password.");
      } else {
        alert("Profile update failed: " + response.data.message);
      }
    }
  } catch (error) {
    console.log("Caught Error:", error.response ? error.response.data : error.message); // Debug log for caught error
    // Handle specific error messages from the backend
    if (error.response && error.response.data && error.response.data.message) {
      if (error.response.data.message.toLowerCase().includes("current password") || error.response.data.message.toLowerCase().includes("incorrect") || error.response.data.message.toLowerCase().includes("invalid")) {
        alert("Please enter your current password.");
      } else {
        alert("Profile update failed: " + error.response.data.message);
      }
    } else {
      alert("An error occurred while updating your profile.");
    }
  }
};

  return (
    <div className="container-fluid py-4 mt-2 bg-white">
      <div className="row justify-content-center">
        <div className="col-12">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem", color: "#6F2DA8" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted fs-5">Loading your settings...</p>
            </div>
          ) : (
            <>
              <div className="text-center py-3 border-bottom border-3" style={{ borderColor: "#6F2DA8" }}>
                <h2 className="mb-0 fw-bold text-dark">
                  <i className="bi bi-gear-fill me-2" style={{ color: "#6F2DA8" }}></i>
                  Organizer Settings
                </h2>
                <p className="mt-2 fs-6 text-muted">Manage your profile and events</p>
              </div>
              <div className="p-4">
                {/* Profile Section */}
                <div className="mb-4">
                  <h4 className="fw-bold text-dark mb-4 text-center">
                    <i className="bi bi-person-circle me-2" style={{ color: "#6F2DA8" }}></i>Profile
                  </h4>
                  {/* Profile Image Placeholder */}
                  <div className="d-flex justify-content-center mb-4">
                    <div
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                      style={{
                        width: "150px",
                        height: "150px",
                        backgroundColor: "#6F2DA8",
                        color: "#fff",
                        fontSize: "2rem",
                      }}
                    >
                      {name ? name.charAt(0).toUpperCase() : "U"}
                    </div>
                  </div>
                  {/* Profile Cards */}
                  <div className="row g-3 justify-content-center">
                    <div className="col-md-3 col-sm-6">
                      <div className="card border-3 shadow-sm h-100 p-3 text-center" style={{ borderColor: "#6F2DA8" }}>
                        <h5 className="fw-semibold text-dark mb-2">
                          <i className="bi bi-person-fill me-2" style={{ color: "#6F2DA8" }}></i>Name
                        </h5>
                        <p className="text-dark fs-5 mb-0">{name || "Not set"}</p>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6">
                      <div className="card border-3 shadow-sm h-100 p-3 text-center" style={{ borderColor: "#6F2DA8" }}>
                        <h5 className="fw-semibold text-dark mb-2">
                          <i className="bi bi-envelope-fill me-2" style={{ color: "#6F2DA8" }}></i>Email
                        </h5>
                        <p className="text-dark fs-5 mb-0">{email || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <button
                      className="btn btn-outline-primary px-4 py-2 fw-semibold"
                      style={{ borderColor: "#6F2DA8", color: "#6F2DA8" }}
                      onClick={() => setIsEditingProfile(true)}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#6F2DA8", e.target.style.color = "#fff")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "transparent", e.target.style.color = "#6F2DA8")}
                    >
                      <i className="bi bi-pencil-square me-2" style={{ color: "#6F2DA8" }}></i>Edit Profile
                    </button>
                  </div>
                </div>

                {/* Events Section */}
                <div className="mb-4">
                  <h4 className="fw-bold text-dark mb-3">
                    <i className="bi bi-calendar-event me-2" style={{ color: "#6F2DA8" }}></i>Your Events
                  </h4>
                  <div className="row">
                  {events.map((event, index) => (
  <div key={event._id || index} className="col-md-4 mb-4">
    <div className="card border-3 shadow-sm h-100" style={{ borderColor: "#6F2DA8" }}>
      {event.image ? (
        <img
          src={`https://advanced-event-management.onrender.com/${event.image}`}
          alt={event.title}
          className="card-img-top rounded-top"
          style={{ width: "100%", objectFit: "cover", height: "200px" }}
        />
      ) : (
        <img
          src="/default-image.jpg" // Use a default image if no event image is available
          alt="Default"
          className="card-img-top rounded-top"
          style={{ width: "100%", objectFit: "cover", height: "200px" }}
        />
      )}
      <div className="card-body">
        <h5 className="card-title">{event.title}</h5>
        <p className="card-text"><strong>Description:</strong> {event.description}</p>
        <p className="card-text">
          <strong>Start Date:</strong>{" "}
          {event.startDate
            ? new Intl.DateTimeFormat("en-GB").format(new Date(event.startDate))
            : "N/A"}
        </p>
        <p className="card-text"><strong>Venue:</strong> {event.venue}</p>
        <p className="card-text"><strong>City:</strong> {event.city || "N/A"}</p>
        <p className="card-text"><strong>Price:</strong> ₹{event.price}</p>
        <p className="card-text">
          <strong>Registration Limit:</strong>{" "}
          {event.registrationLimit || "No limit"} (Current: {event.registrations?.length || 0})
        </p>
      </div>
    </div>
  </div>
))}

                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-3" style={{ borderColor: "#6F2DA8" }}>
              <div className="modal-header bg-white border-bottom-0">
                <h5 className="modal-title fw-bold fs-4 text-dark">Edit Profile</h5>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-5 text-dark">Name</label>
                  <input
                    type="text"
                    className="form-control border-2"
                    style={{ borderColor: "#6F2DA8" }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-5 text-dark">Email</label>
                  <input
                    type="email"
                    className="form-control border-2"
                    style={{ borderColor: "#6F2DA8" }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-5 text-dark">Current Password</label>
                  <input
                    type="password"
                    className="form-control border-2"
                    style={{ borderColor: "#6F2DA8" }}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-5 text-dark">New Password</label>
                  <input
                    type="password"
                    className="form-control border-2"
                    style={{ borderColor: "#6F2DA8" }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (optional)"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-5 text-dark">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control border-2"
                    style={{ borderColor: "#6F2DA8" }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="modal-footer border-0 d-flex justify-content-end gap-3">
                <button
                  className="btn btn-outline-primary px-4 py-2"
                  style={{ borderColor: "#6F2DA8", color: "#6F2DA8" }}
                  onClick={() => {
                    setIsEditingProfile(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#6F2DA8", e.target.style.color = "#fff")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "transparent", e.target.style.color = "#6F2DA8")}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary px-4 py-2"
                  style={{ backgroundColor: "#6F2DA8", borderColor: "#6F2DA8" }}
                  onClick={updateProfile}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#4B1C7A")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#6F2DA8")}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerSettings;