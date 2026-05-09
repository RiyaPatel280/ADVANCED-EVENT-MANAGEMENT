import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form, Table, Container, Card, Image } from "react-bootstrap";

const BIRTHDAY_API_URL = "https://advanced-event-management.onrender.com/api/birthday-eventsbyOA";
const SERVICES_API_URL = "https://advanced-event-management.onrender.com/api/services";
const ORGANIZERS_API_URL = "https://advanced-event-management.onrender.com/api/users/organizers";
const VENUES_API_URL = "https://advanced-event-management.onrender.com/api/venues";

const BirthdayInfo = () => {
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    eventDate: "",
    location: "",
    numberOfMembers: "",
    selectedServices: [],
    totalAmount: "",
    organizer: "",
    venue: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedVenueImage, setSelectedVenueImage] = useState(null);

  const PER_PERSON_RATE = 250; // Define the rate per person above 300
  const THRESHOLD = 300; // Threshold for additional charges

  useEffect(() => {
    fetchEvents();
    fetchOrganizers();
  }, []);

  useEffect(() => {
    if (form.organizer) {
      fetchServicesForOrganizer();
      fetchVenuesForOrganizer();
    } else {
      setServices([]);
      setVenues([]);
      setSelectedVenueImage(null);
    }
  }, [form.organizer]);

  // Recalculate total amount when editing and dependencies are ready
  useEffect(() => {
    if (editingId && services.length > 0 && venues.length > 0) {
      setForm((prevForm) => {
        const recalculatedForm = { ...prevForm };
        recalculatedForm.totalAmount = calculateTotalAmount(recalculatedForm);
        return recalculatedForm;
      });
    }
  }, [editingId, services, venues]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        setEvents([]);
        return;
      }
      const response = await axios.get(BIRTHDAY_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("API response:", response.data);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error.response?.data || error);
      setEvents([]);
    }
  };

  const fetchOrganizers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }
      const response = await axios.get(ORGANIZERS_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Organizers fetched:", response.data);
      setOrganizers(response.data);
    } catch (error) {
      console.error("Error fetching organizers:", error);
    }
  };

  const fetchVenuesForOrganizer = async () => {
    if (!form.organizer) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }
      console.log("Fetching venues for organizer:", form.organizer);
      const response = await axios.get(VENUES_API_URL, {
        params: { addBy: form.organizer },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Venues fetched:", response.data);
      setVenues(response.data || []);
      if (form.venue && !response.data.some((v) => v.name === form.venue)) {
        setForm((prev) => ({ ...prev, venue: "" }));
        setSelectedVenueImage(null);
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
      setVenues([]);
    }
  };

  const fetchServicesForOrganizer = async () => {
    if (!form.organizer) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }
      setLoadingServices(true);
      const response = await axios.get(SERVICES_API_URL, {
        params: { addBy: form.organizer },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Services fetched:", response.data);
      setServices(response.data.services || response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const calculateTotalAmount = (updatedForm) => {
    const selectedVenue = venues.find((v) => v.name === updatedForm.venue);
    const selectedServices = updatedForm.selectedServices;
    let total = 0;

    // Add venue price
    if (selectedVenue) {
      total += parseFloat(selectedVenue.price) || 0;
    }

    // Add services total
    if (selectedServices.length > 0) {
      selectedServices.forEach((serviceName) => {
        const service = services.find((s) => s.name === serviceName);
        if (service) {
          total += parseFloat(service.price) || 0;
        }
      });
    }

    // Add surcharge for > 300 members (₹250 per person above 300)
    const members = parseInt(updatedForm.numberOfMembers) || 0;
    const additionalMembers = members > THRESHOLD ? members - THRESHOLD : 0;
    total += additionalMembers * PER_PERSON_RATE;

    return total.toString();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updatedForm = {
        ...prev,
        [name]: value,
        ...(name === "organizer" ? { selectedServices: [], venue: "" } : {}),
      };

      // Recalculate total amount when relevant fields change
      if (name === "venue" || name === "numberOfMembers") {
        updatedForm.totalAmount = calculateTotalAmount(updatedForm);
      }

      if (name === "venue") {
        const selectedVenue = venues.find((v) => v.name === value);
        setSelectedVenueImage(selectedVenue ? selectedVenue.image : null);
      }

      return updatedForm;
    });
  };

  const handleServiceChange = (e) => {
    const { value, checked } = e.target;
    setForm((prevForm) => {
      const updatedServices = checked
        ? [...prevForm.selectedServices, value]
        : prevForm.selectedServices.filter((service) => service !== value);

      const updatedForm = {
        ...prevForm,
        selectedServices: updatedServices,
      };
      updatedForm.totalAmount = calculateTotalAmount(updatedForm);

      return updatedForm;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form:", form);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please log in.");
        return;
      }
      let response;
      if (editingId) {
        response = await axios.put(`${BIRTHDAY_API_URL}/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.post(BIRTHDAY_API_URL, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchEvents();
      handleCloseModal();
      alert(response.data.message || "Event saved successfully!");
    } catch (error) {
      console.error("Error saving event:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      alert(errorMessage);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    let selected = [];
    if (Array.isArray(event.selectedServices)) {
      selected = event.selectedServices;
    } else if (typeof event.selectedServices === "object" && event.selectedServices !== null) {
      selected = Object.keys(event.selectedServices);
    }
    
    // Set the initial form data with the existing totalAmount
    const updatedForm = {
      ...event,
      selectedServices: selected,
      totalAmount: event.totalAmount || ""
    };
    
    setForm(updatedForm);
    
    // Set the venue image
    const selectedVenue = venues.find((v) => v.name === event.venue);
    setSelectedVenueImage(selectedVenue ? selectedVenue.image : null);
    
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Please log in first - No authentication token found");
                console.error("No token found in localStorage");
                return;
            }

            const response = await axios.delete(`${BIRTHDAY_API_URL}/${id}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.status === 200 || response.status === 204) {
                alert("Birthday event deleted successfully!"); // Success alert
                console.log("Event deleted successfully");
                fetchEvents(); // Refresh the event list
            } else {
                alert("Unexpected response from server"); // Unexpected status alert
                console.warn("Unexpected response status:", response.status);
            }
        } catch (error) {
            if (error.response) {
                // Server responded with an error
                alert(`Failed to delete event: ${error.response.data.message || 'Server error'}`);
                console.error("Delete failed:", error.response.data);
            } else if (error.request) {
                // No response received
                alert("Network error - please check your connection");
                console.error("No response received:", error.request);
            } else {
                // Other errors
                alert("An unexpected error occurred while deleting the event");
                console.error("Error deleting event:", error.message);
            }
        }
    }
};

  const handleCloseModal = () => {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      eventDate: "",
      location: "",
      numberOfMembers: "",
      selectedServices: [],
      totalAmount: "",
      organizer: "",
      venue: "",
    });
    setSelectedVenueImage(null);
    setShowModal(false);
  };

  return (
    <div>
      <Container fluid className="mt-5 mb-5">
        <Card className="shadow-lg border-0">
          <Card.Header className="text-white text-center py-3" style={{ backgroundColor: "#6F2DA8" }}>
            <h2 className="mb-0">Manage Birthday Events</h2>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-end mb-3">
              <Button
                variant="primary"
                onClick={() => setShowModal(true)}
                className="mb-3"
              >
                + Add New Event
              </Button>
            </div>
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Event Date</th>
                  <th>Location</th>
                  <th>Members</th>
                  <th>Services</th>
                  <th>Total Amount</th>
                  <th>Organizer</th>
                  <th>Venue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id}>
                    <td>{event.name}</td>
                    <td>{event.email}</td>
                    <td>
                      {new Date(event.eventDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td>{event.location}</td>
                    <td>{event.numberOfMembers}</td>
                    <td>
                      {Array.isArray(event.selectedServices)
                        ? event.selectedServices.join(", ")
                        : event.selectedServices
                          ? Object.keys(event.selectedServices).join(", ")
                          : "None"}
                    </td>
                    <td>₹{event.totalAmount}</td>
                    <td>{event.organizer}</td>
                    <td>{event.venue || "Not specified"}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(event)}
                        style={{ marginRight: "10px", marginTop: "10px" }}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(event._id)}
                        style={{ marginRight: "10px", marginTop: "10px" }}
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

        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? "Edit Event" : "Add New Event"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formEventDate">
                <Form.Label>Event Date</Form.Label>
                <Form.Control
                  type="date"
                  name="eventDate"
                  value={
                    form.eventDate
                      ? new Date(form.eventDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formLocation">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formMembers">
                <Form.Label>Number of Members</Form.Label>
                <Form.Control
                  type="number"
                  name="numberOfMembers"
                  value={form.numberOfMembers}
                  onChange={handleChange}
                  placeholder="Enter number of members"
                  required
                />
                <Form.Text className="text-muted">
                  ₹{PER_PERSON_RATE} per person above {THRESHOLD}
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formOrganizer">
                <Form.Label>Organizer</Form.Label>
                <Form.Select
                  name="organizer"
                  value={form.organizer}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Organizer</option>
                  {organizers.map((org) => (
                    <option key={org.id} value={org.name}>
                      {org.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formVenue">
                <Form.Label>Venue</Form.Label>
                <Form.Select
                  name="venue"
                  value={form.venue}
                  onChange={handleChange}
                  disabled={!form.organizer || venues.length === 0}
                >
                  <option value="">Select Venue</option>
                  {venues.map((venue) => (
                    <option key={venue._id} value={venue.name}>
                      {venue.name} - ₹{venue.price}
                    </option>
                  ))}
                </Form.Select>
                {venues.length === 0 && form.organizer && (
                  <Form.Text className="text-muted">
                    No venues available for this organizer.
                  </Form.Text>
                )}
                {selectedVenueImage && (
                  <div className="mt-2 text-center">
                    <Image
                      src={selectedVenueImage}
                      alt="Selected Venue"
                      style={{ maxWidth: "200px", maxHeight: "200px" }}
                      thumbnail
                    />
                  </div>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Select Services</Form.Label>
                {loadingServices ? (
                  <div>Loading services...</div>
                ) : form.organizer ? (
                  services.length > 0 ? (
                    <div>
                      {services.map((service) => (
                        <Form.Check
                          key={service._id}
                          type="checkbox"
                          id={`service-${service._id}`}
                          label={`${service.name} - ₹${service.price}`}
                          value={service.name}
                          checked={form.selectedServices.includes(service.name)}
                          onChange={handleServiceChange}
                        />
                      ))}
                    </div>
                  ) : (
                    <div>No services available for this organizer.</div>
                  )
                ) : (
                  <div>Please select an organizer to view services.</div>
                )}
              </Form.Group>
              <Form.Group className="mb-3" controlId="formTotalAmount">
                <Form.Label>Total Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="totalAmount"
                  value={form.totalAmount}
                  onChange={handleChange}
                  placeholder="Total amount will be calculated"
                  readOnly
                />
              </Form.Group>
              <div className="text-end">
                <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingId ? "Update" : "Add"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default BirthdayInfo;