import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css"; // Still imported for styling, but toast won't be used

const ManageProfile = () => {
  const navigate = useNavigate();

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState(null);

  // Loading state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (email) {
      fetchProfileData();
    }
  }, [email]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to view your profile.");
        navigate("/login");
        return;
      }

      const profileResponse = await axios.get("http://localhost:4000/api/users/user-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileResponse.data.success && profileResponse.data.user) {
        setName(profileResponse.data.user.name || "");
        setEmail(profileResponse.data.user.email || "");
        setUserId(profileResponse.data.user._id);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      alert("Failed to load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        `http://localhost:4000/api/users/edit-user/${userId}`,
        {
          name,
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("API Response:", response.data);
      if (response.data.success) {
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
        // Adjust this based on your backend's exact message
        if (response.data.message && (response.data.message.toLowerCase().includes("current password") || response.data.message.toLowerCase().includes("incorrect") || response.data.message.toLowerCase().includes("invalid"))) {
          alert("Please enter your current password.");
        } else {
          alert("Profile update failed: " + response.data.message);
        }
      }
    } catch (error) {
      console.log("Caught Error:", error.response ? error.response.data : error.message);
      if (error.response && error.response.data && error.response.data.message) {
        // Adjust this based on your backend's exact message
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
              <p className="mt-3 text-muted fs-5">Loading your profile...</p>
            </div>
          ) : (
            <>
              <div className="text-center py-3 border-bottom border-3" style={{ borderColor: "#6F2DA8" }}>
                <h2 className="mb-0 fw-bold text-dark">
                  <i className="bi bi-person-fill-gear me-2" style={{ color: "#6F2DA8" }}></i>
                  Manage Profile
                </h2>
                <p className="mt-2 fs-6 text-muted">Update your admin profile details</p>
              </div>
              <div className="p-4">
                {/* Profile Section */}
                <div className="mb-4">
                  <h4 className="fw-bold text-dark mb-4 text-center">
                    <i className="bi bi-person-circle me-2" style={{ color: "#6F2DA8" }}></i>Profile Details
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
                      {name ? name.charAt(0).toUpperCase() : "A"}
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

export default ManageProfile;