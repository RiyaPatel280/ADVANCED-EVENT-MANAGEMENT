import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";

const LoginModal = ({ show, handleClose, handleShowSignUp, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null); // State for redirection
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Starting login process...");
      const response = await axios.post("https://advanced-event-management.onrender.com/api/users/login", { email, password });
      const { token, user } = response.data;

      console.log("API Response:", { token, user });

      if (token) {
        // Store user data in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user._id);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userName", user.name);
        localStorage.setItem("userPhone", user.phone);

        console.log("User Role:", user.role);

        alert(`Login successful! Welcome back, ${user.name}.`);
        onLoginSuccess(user.name); // Update header dynamically

        // Close the modal
        console.log("Closing modal...");
        handleClose();

        // Set the redirect path
        console.log("Setting redirect path...");
        if (user.role === "admin") {
          setRedirectPath("/admin/adminheader");
        } else if (user.role === "organizer") {
          setRedirectPath("/organizer/dashboard");
        } else {
          setRedirectPath("/");
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed! Please check your credentials.");
      console.error("Login failed:", error);
    }
  };

  // Effect to handle navigation
  useEffect(() => {
    if (redirectPath) {
      console.log("Navigating to:", redirectPath);
      navigate(redirectPath, { replace: true });

      // Fallback: Force redirect if navigate doesn't work
      const timer = setTimeout(() => {
        console.log("Fallback: Forcing redirect to:", redirectPath);
        window.location.href = redirectPath; // Full page reload as fallback
      }, 500); // Wait 500ms to see if navigate works

      // Cleanup timer if component unmounts or navigation succeeds
      return () => clearTimeout(timer);
    }
  }, [redirectPath, navigate]);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-3"
              required
            />
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-3"
              required
            />
          </Form.Group>

          {error && <div className="text-danger">{error}</div>}

          <Button variant="primary" type="submit" className="w-100 mb-2">
            Login
          </Button>
          <div className="text-center">
            <span>Don't have an account? </span>
            <Button variant="link" onClick={handleShowSignUp}>
              Sign Up
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;