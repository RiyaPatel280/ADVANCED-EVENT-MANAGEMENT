import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal, Form, Table, Container, Card } from "react-bootstrap";


const AddService = () => {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    options: [{ tier: "", price: "" }],
  });

  // Fetch Services from API
  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");

      const response = await axios.get("https://advanced-event-management.onrender.com/api/allservices", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter services for the logged-in user
      const userServices = response.data.filter(service => service.addBy === userEmail);
      setServices(userServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchServices();

    if (showModal && editService) {
      setEditService((prev) => ({
        ...prev,
        options: Array.isArray(prev?.options) ? prev.options : [{ tier: "", price: "" }],
      }));
    }
  }, [showModal]);

  // Handle Input Changes
  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditService({ ...editService, [name]: value });
    } else {
      setNewService({ ...newService, [name]: value });
    }
  };

  // Handle Option Changes
  const handleOptionChange = (index, field, value, isEdit = false) => {
    const updatedOptions = (isEdit ? [...editService.options] : [...newService.options]);
    updatedOptions[index][field] = value;

    if (isEdit) {
      setEditService({ ...editService, options: updatedOptions });
    } else {
      setNewService({ ...newService, options: updatedOptions });
    }
  };

  // Add More Options
  const addOption = (isEdit = false) => {
    if (isEdit) {
      setEditService({ ...editService, options: [...editService.options, { tier: "", price: "" }] });
    } else {
      setNewService({ ...newService, options: [...newService.options, { tier: "", price: "" }] });
    }
  };

  // Remove an Option
  const removeOption = (index, isEdit = false) => {
    if (isEdit) {
      const filteredOptions = editService.options.filter((_, i) => i !== index);
      setEditService({ ...editService, options: filteredOptions });
    } else {
      const filteredOptions = newService.options.filter((_, i) => i !== index);
      setNewService({ ...newService, options: filteredOptions });
    }
  };


// Handle Adding a New Service
const handleAddService = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "https://advanced-event-management.onrender.com/api/services",
      newService,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Show success alert from API response
    alert(response.data.message); // This will display "Service added successfully!"

    setServices([...services, response.data.service]);
    setNewService({ name: "", price: "", options: [{ tier: "", price: "" }] });
    setShowModal(false);
  } catch (error) {
    // Show error alert from API response or default message
    const errorMessage = error.response?.data?.message || "Failed to add service.";
    alert(errorMessage); // This will display "Failed to add service." or custom error
    console.error("🚨 Error adding service:", error.response?.data || error.message);
  }
};

  // Handle Editing a Service
  const handleEdit = async (id) => {
    try {
      const response = await axios.get(`https://advanced-event-management.onrender.com/api/services/${id}`);
      console.log("Service Data:", response.data);

      const serviceData = response.data.service;

      if (!serviceData) {
        alert("Service not found!");
        return;
      }

      setEditService({
        _id: serviceData._id || "",
        name: serviceData.name || "",
        price: serviceData.price || "",
        options: Array.isArray(serviceData.options) ? serviceData.options : [{ tier: "", price: "" }],
      });

      setShowModal(true);
    } catch (error) {
      console.error("Error fetching service details:", error);
    }
  };

  // Handle Updating Service
  // Handle Updating Service
const handleUpdateService = async () => {
  console.log("Edit Service:", editService);

  if (!editService || !editService._id) {
    alert("No service selected for update.");
    return;
  }

  try {
    const token = localStorage.getItem("token"); // Assuming token is needed for authorization
    const response = await axios.put(
      `https://advanced-event-management.onrender.com/api/services/${editService._id}`, 
      editService,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Show success alert from API response
    alert(response.data.message); // This will display "Service updated successfully!"

    setServices(services.map((service) =>
      service._id === editService._id ? editService : service
    ));

    setShowModal(false);
  } catch (error) {
    // Show error alert from API response or default message
    const errorMessage = error.response?.data?.message || "Failed to update service.";
    alert(errorMessage); // Displays specific error like "Service not found in the database." or "Failed to update service."
    console.error("Error updating service:", error.response?.data || error.message);
  }
};

  // Handle Deleting a Service
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this service?");
    
    if (!isConfirmed) return;

    try {
      await axios.delete(`https://advanced-event-management.onrender.com/api/services/${id}`);
      setServices(services.filter((service) => service._id !== id));
      alert("Service deleted successfully!");
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete the service.");
    }
  };

  return (
    <div>
     
      <Container fluid className="mt-5 mb-5">
        <Card className="shadow-lg border-0">
          <Card.Header className="text-white text-center py-3" style={{ backgroundColor: '#6F2DA8' }}>
            <h2 className="mb-0">Service List</h2>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-end mb-3">
              <Button
                className="btn btn-primary rounded-pill"
                onClick={() => { setShowModal(true); setEditService(null); }}
              >
                ➕ Add Services
              </Button>
            </div>

            <Table striped bordered hover className="mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Options</th>
                  <th>Added By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service._id}>
                    <td>{service.name}</td>
                    <td>₹{service.price}</td>
                    <td>
                      {Array.isArray(service.options)
                        ? service.options.map((opt, idx) => (
                            <div key={idx}>{opt.tier} - ${opt.price}</div>
                          ))
                        : "N/A"}
                    </td>
                    <td>{service.addedByName}</td>
                    <td>
                      <Button
                        variant="warning"
                        className="me-2"
                        onClick={() => handleEdit(service._id)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(service._id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Modal for Adding/Editing Services */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editService ? "Edit Service" : "Add Service"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Service Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editService ? editService.name : newService.name}
                  onChange={(e) => handleInputChange(e, !!editService)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Service Price</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={editService ? editService.price : newService.price}
                  onChange={(e) => handleInputChange(e, !!editService)}
                />
              </Form.Group>

              <Form.Label>Options</Form.Label>
              {(editService ? editService.options : newService.options).map((option, index) => (
                <div key={index} className="mb-2 d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Tier"
                    value={option.tier}
                    onChange={(e) => handleOptionChange(index, "tier", e.target.value, !!editService)}
                    className="me-2"
                  />
                  <Form.Control
                    type="number"
                    placeholder="Price"
                    value={option.price}
                    onChange={(e) => handleOptionChange(index, "price", e.target.value, !!editService)}
                  />
                  <Button variant="danger" onClick={() => removeOption(index, !!editService)}>X</Button>
                </div>
              ))}
              <Button variant="success" onClick={() => addOption(!!editService)}>+ Add Option</Button>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={editService ? handleUpdateService : handleAddService}>
              {editService ? "Update" : "Add"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default AddService;