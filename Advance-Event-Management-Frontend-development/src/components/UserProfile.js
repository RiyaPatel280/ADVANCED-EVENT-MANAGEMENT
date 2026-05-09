import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "./Header";
import Footer from "./Footer";

const UserProfile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (email) {
      fetchUserProfile();
    }
  }, [email]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.alert("Please log in to view your profile.");
        navigate("/login");
        return;
      }
      const response = await fetch("https://advanced-event-management.onrender.com/api/users/user-profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && data.user) {
        setName(data.user.name || "");
        setEmail(data.user.email || "");
        setUserId(data.user._id);
      } else {
        window.alert("Failed to load profile: " + data.message);
      }
    } catch (error) {
      window.alert("An error occurred while fetching your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!userId) return window.alert("User ID not found.");

    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        return window.alert("Please enter your current password.");
      }
      if (newPassword !== confirmPassword) {
        return window.alert("New password and confirmation do not match.");
      }
      if (newPassword.length < 6) {
        return window.alert("New password must be at least 6 characters long.");
      }
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://advanced-event-management.onrender.com/api/users/edit-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        window.alert("Profile updated successfully!");
        setIsEditing(false);
        localStorage.setItem("userEmail", email);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        window.alert("Profile update failed: " + data.message);
      }
    } catch (error) {
      window.alert("An error occurred while updating your profile.");
    }
  };

  return (
    <>
      <Header />
      <div 
        className="container py-5 mt-5" 
        style={{ 
          background: "linear-gradient(rgb(85, 26, 139) 20%, rgb(53, 38, 77) 100%)"
        }}
      >
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="card border-0 shadow-lg mb-5" style={{ backgroundColor: "#ffffff" }}>
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-dark" style={{ width: "3rem", height: "3rem" }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted fs-5">Loading your profile...</p>
                </div>
              ) : (
                <>
                  <div 
                    className="card-header1 text-center py-4" 
                    style={{ 
                      color: "white" 
                    }}
                  >
                    <h2 className="mb-0 fw-bold">
                      <i className="bi bi-person-circle me-2"></i>
                      {name || "Your Profile"}
                    </h2>
                    <p className="mt-2 fs-6">Manage your account details</p>
                  </div>
                  <div className="card-body p-5" style={{ backgroundColor: "#ffffff" }}>
                    <div className="text-center mb-4">
                      <div
                        className="rounded-circle text-white d-flex align-items-center justify-content-center mx-auto"
                        style={{ 
                          width: "100px", 
                          height: "100px", 
                          fontSize: "3rem", 
                          backgroundColor: "rgb(85, 26, 139)" 
                        }}
                      >
                        {name ? name.charAt(0).toUpperCase() : "U"}
                      </div>
                    </div>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm" style={{ backgroundColor: "#ffffff" }}>
                          <div className="card-body">
                            <h5 className="card-title fw-semibold text-dark">
                              <i className="bi bi-person-fill me-2"></i>Name
                            </h5>
                            <p className="card-text text-dark fs-5">{name || "Not set"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border-0 shadow-sm" style={{ backgroundColor: "#ffffff" }}>
                          <div className="card-body">
                            <h5 className="card-title fw-semibold text-dark">
                              <i className="bi bi-envelope-fill me-2"></i>Email
                            </h5>
                            <p className="card-text text-dark fs-5">{email || "Not set"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-5">
                      <button
                        className="btn btn-dark btn-lg px-5 py-2 rounded-pill shadow-sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <i className="bi bi-pencil-square me-2"></i>
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ backgroundColor: "#ffffff" }}>
              <div className="modal-header" style={{ backgroundColor: "#ffffff", color: "black" }}>
                <h5 className="modal-title fw-bold fs-4">Edit Profile</h5>
              </div>
              <div className="modal-body p-4" style={{ backgroundColor: "#ffffff" }}>
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-5 text-dark">Name</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-5 text-dark">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    value={email}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-5 text-dark">Current Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-5 text-dark">New Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (optional)"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-5 text-dark">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="modal-footer border-0 d-flex justify-content-end gap-3" style={{ backgroundColor: "#ffffff" }}>
                <button
                  className="btn btn-outline-dark px-4 py-2"
                  onClick={() => {
                    setIsEditing(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancel
                </button>
                <button className="btn btn-dark px-4 py-2" onClick={updateProfile}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default UserProfile;