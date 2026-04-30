import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Container, Card, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/Admin.css"; // Custom CSS for creativity

const Admin = () => {
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/admin/image");

    axios
      .get("http://localhost:4000/api/users/user-profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("Profile fetch error:", err.response || err);
        navigate("/login");
      });

    axios
      .get("http://localhost:4000/api/users/images", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setImages(res.data))
      .catch((err) => {
        console.error("Images fetch error:", err.response || err);
        setError("Failed to fetch images: " + (err.response?.data?.message || err.message));
      });
  }, [navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post("http://localhost:4000/api/users/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      window.alert("Image uploaded successfully!");
      setFile(null);
      setShowModal(false);

      const res = await axios.get("http://localhost:4000/api/users/images", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImages(res.data);
      setError("");
    } catch (err) {
      console.error("Upload error:", err.response || err);
      setError(err.response?.data?.message || "Upload failed.");
    }
  };

  // Original handleDelete from the first version
  const handleDelete = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:4000/api/users/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.alert("Image deleted successfully!");
      setImages(images.filter((image) => image._id !== imageId));
      setError("");
    } catch (err) {
      console.error("Delete error:", err.response || err);
      setError(err.response?.data?.message || "Deletion failed.");
    }
  };

  if (!user)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
        <p style={{ color: "#000000", fontSize: "1.5rem", fontWeight: "bold" }}>Loading...</p>
      </div>
    );

  return (
    <div>
      <Container fluid className="mt-5 mb-5">
        <Card className="shadow-lg border-0">
          <Card.Header
            className="text-white text-center py-3"
            style={{ backgroundColor: "#6F2DA8" }}
          >
            <h2 className="mb-0">Manage Carousel Images</h2>
          </Card.Header>
          <Card.Body className="p-4">
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="d-flex justify-content-end mb-4">
              <Button
                className="btn btn-primary rounded-pill px-4"
                onClick={() => setShowModal(true)}
              >
                ➕ Add Image
              </Button>
            </div>

            {/* Images Display Section */}
            {images.length === 0 ? (
              <p className="text-center text-muted" style={{ fontSize: "1.2rem" }}>
                No images uploaded yet.
              </p>
            ) : (
              <Row className="g-4">
                {images.map((image) => (
                  <Col key={image._id} xs={12} sm={6} md={4} lg={3}>
                    <Card className="creative-card h-100 shadow-sm border-0">
                      <div className="image-wrapper">
                        <Card.Img
                          variant="top"
                          src={`http://localhost:4000${image.path}`}
                          alt="Uploaded Image"
                          className="creative-img"
                        />
                        <div className="image-overlay">
                          <Button
                            variant="danger"
                            size="sm"
                            className="overlay-btn"
                            onClick={() => handleDelete(image._id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        </div>

                      </div>

                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card.Body>
        </Card>

        {/* Upload Image Modal (Exactly like your provided code) */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add Image</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleUpload}>
              <Form.Group controlId="imageUpload" className="mb-3">
                <Form.Label>Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  style={{
                    borderColor: "#000000",
                    borderRadius: "8px",
                    backgroundColor: "#f8f9fa",
                  }}
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                disabled={!file}
                style={{ borderRadius: "8px" }}
              >
                <i className="fas fa-upload me-2"></i>
                Upload
              </Button>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              style={{ borderRadius: "8px" }}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Admin;