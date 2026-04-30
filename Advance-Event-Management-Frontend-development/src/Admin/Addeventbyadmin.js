import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form, Container, Card, Row, Col } from "react-bootstrap";

const Addeventbyadmin = () => {
  const [categories, setCategories] = useState([]);
  const [titles, setTitles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [details, setDetails] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [price, setPrice] = useState("");
  const [registrationLimit, setRegistrationLimit] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [dateError, setDateError] = useState("");
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [organizerFilter, setOrganizerFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchCategories();
    fetchTitles();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/allcategories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTitles = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/allcategories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const uniqueTitles = [...new Set(response.data.map(category => category.title))];
      setTitles(uniqueTitles);
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
  };

  const validateDate = (date) => {
    const selectedDate = new Date(date);
    const currentDate = new Date(today);
    if (selectedDate < currentDate) {
      setDateError("Start date cannot be in the past.");
    } else {
      setDateError("");
    }
  };

  const handleAddOrUpdateCategory = async (e) => {
    e.preventDefault();
    if (dateError) return;

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("startDate", startDate);
      formData.append("venue", venue);
      formData.append("city", city);
      formData.append("details", details);
      formData.append("price", price);
      formData.append("registrationLimit", registrationLimit);
      formData.append("customFields", JSON.stringify(customFields));
      if (image) formData.append("image", image);

      const url = editId ? `http://localhost:4000/api/categories/${editId}` : "http://localhost:4000/api/categories";
      const method = editId ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (editId) {
        setCategories(categories.map(cat => (cat._id === editId ? response.data.category : cat)));
        alert("Event updated successfully!"); // Alert for successful edit
      } else {
        setCategories([...categories, response.data.category]);
        if (!titles.includes(response.data.category.title)) {
          setTitles([...titles, response.data.category.title]);
        }
        alert("Event added successfully!"); // Alert for successful addition
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Error adding/updating category:", error.response?.data || error.message);
      alert("Failed to save event. Please try again."); // Alert for error
    }
  };

  const handleEditClick = (category) => {
    setEditId(category._id);
    setTitle(category.title);
    setDescription(category.description);
    const formattedDate = category.startDate ? new Date(category.startDate).toISOString().split("T")[0] : "";
    setStartDate(formattedDate);
    validateDate(formattedDate);
    setVenue(category.venue);
    setCity(category.city || "");
    setDetails(category.details);
    setPrice(category.price);
    setRegistrationLimit(category.registrationLimit || "");
    setCustomFields(category.customFields || []);
    setImage(null);
    setShowModal(true);
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { label: "", value: "" }]);
  };

  const handleCustomFieldChange = (index, key, value) => {
    const updatedFields = [...customFields];
    updatedFields[index][key] = value;
    setCustomFields(updatedFields);
  };

  const handleDeleteCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:4000/api/categories/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCategories(categories.filter((cat) => cat._id !== id));
        const deletedCategory = categories.find(cat => cat._id === id);
        if (deletedCategory) {
          const remainingTitles = categories.filter(cat => cat._id !== id).map(cat => cat.title);
          if (!remainingTitles.includes(deletedCategory.title)) {
            setTitles(titles.filter(t => t !== deletedCategory.title));
          }
        }
        alert("Event deleted successfully!"); // Alert for successful deletion
      } catch (error) {
        console.error("Error deleting category:", error.response?.data || error.message);
        alert("Failed to delete event. Please try again."); // Alert for error
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setVenue("");
    setCity("");
    setDetails("");
    setImage(null);
    setCustomFields([]);
    setEditId(null);
    setPrice("");
    setRegistrationLimit("");
    setDateError("");
  };

  const uniqueOrganizers = [...new Set(categories.map(category => category.organizer).filter(org => org))];
  const uniqueTitles = [...new Set(categories.map(category => category.title))];

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrganizer = organizerFilter ? category.organizer === organizerFilter : true;
    const matchesTitle = titleFilter ? category.title === titleFilter : true;

    return matchesSearch && matchesOrganizer && matchesTitle;
  });

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleOrganizerChange = (e) => setOrganizerFilter(e.target.value);
  const handleTitleChange = (e) => setTitleFilter(e.target.value);

  return (
    <div>
      <Container fluid className="mt-5 mb-5">
        <Card className="shadow border-0">
          <Card.Header className="text-white text-center py-3 bg-primary">
            <h2 className="mb-0">🎉 Event Categories</h2>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="text-end mb-3">
              <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
                ➕ Add Event
              </Button>
            </div>

            <Form className="mb-4">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group controlId="searchEvent">
                    <Form.Label>Search by Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter event title..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="shadow-sm"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="organizerFilter">
                    <Form.Label>Filter by Organizer</Form.Label>
                    <Form.Select
                      value={organizerFilter}
                      onChange={handleOrganizerChange}
                      className="shadow-sm"
                    >
                      <option value="">All Organizers</option>
                      {uniqueOrganizers.map((organizer, index) => (
                        <option key={index} value={organizer}>{organizer}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="titleFilter">
                    <Form.Label>Filter by Event Title</Form.Label>
                    <Form.Select
                      value={titleFilter}
                      onChange={handleTitleChange}
                      className="shadow-sm"
                    >
                      <option value="">All Titles</option>
                      {uniqueTitles.map((title, index) => (
                        <option key={index} value={title}>{title}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>

            <div className="row row-cols-1 row-cols-md-3 g-4">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <div key={category._id} className="col">
                    <Card className="h-100 shadow-sm">
                      <Card.Img
                        variant="top"
                        src={`http://localhost:4000/${category.image}`}
                        alt={category.title}
                        className="img-fluid"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <Card.Body>
                        <Card.Title className="fw-bold">{category.title}</Card.Title>
                        <Card.Text><strong>Description:</strong> {category.description}</Card.Text>
                        <Card.Text><strong>Start Date:</strong> {category.startDate ? new Intl.DateTimeFormat("en-GB").format(new Date(category.startDate)) : "N/A"}</Card.Text>
                        <Card.Text><strong>Price:</strong> ₹{category.price}</Card.Text>
                        <Card.Text><strong>Venue:</strong> {category.venue}</Card.Text>
                        <Card.Text><strong>City:</strong> {category.city || "N/A"}</Card.Text>
                        <Card.Text><strong>Details:</strong> {category.details || "No details available."}</Card.Text>
                        <Card.Text><strong>Registration Limit:</strong> {category.registrationLimit || "No limit"}</Card.Text>
                        {category.customFields && category.customFields.length > 0 ? (
                          category.customFields.map((field, index) => (
                            <Card.Text key={index}>
                              <strong>{field.label}:</strong> {field.value}
                            </Card.Text>
                          ))
                        ) : (
                          <Card.Text>No custom fields available.</Card.Text>
                        )}
                        <div className="d-flex justify-content-between">
                          <Button variant="warning" onClick={() => handleEditClick(category)}><i className="fas fa-edit"></i></Button>
                          <Button variant="danger" onClick={() => handleDeleteCategory(category._id)}><i className="fas fa-trash-alt"></i></Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="col text-center">
                  <p>No events found matching your filters.</p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered dialogClassName="custom-modal">
          <Modal.Header closeButton>
            <Modal.Title>{editId ? "Edit Event" : "Add Event"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddOrUpdateCategory}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  as="select"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                >
                  <option value="">Select an Event Title (Optional)</option>
                  {titles.map((uniqueTitle, index) => (
                    <option key={index} value={uniqueTitle}>{uniqueTitle}</option>
                  ))}
                </Form.Control>
                {(!title || editId) && (
                  <Form.Control
                    type="text"
                    placeholder={editId ? "Edit title or type a new one" : "Type a new title"}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2"
                    required
                  />
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    validateDate(e.target.value);
                  }}
                  min={today}
                  required
                />
                {dateError && <Form.Text className="text-danger">{dateError}</Form.Text>}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Venue</Form.Label>
                <Form.Control
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="Enter the city"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Details</Form.Label>
                <Form.Control as="textarea" rows={2} value={details} onChange={(e) => setDetails(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Registration Limit</Form.Label>
                <Form.Control
                  type="number"
                  value={registrationLimit}
                  onChange={(e) => setRegistrationLimit(e.target.value)}
                  placeholder="Enter max registrations allowed"
                  min="1"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Upload Image</Form.Label>
                {editId && !image && (
                  <div className="mb-2">
                    <img
                      src={`http://localhost:4000/${categories.find(cat => cat._id === editId)?.image}`}
                      alt="Existing Event"
                      className="img-fluid rounded shadow-sm"
                      style={{ maxWidth: "100px", maxHeight: "100px" }}
                    />
                  </div>
                )}
                <Form.Control type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
              </Form.Group>

              {customFields.map((field, index) => (
                <div key={index} className="mb-3 border rounded p-2">
                  <Form.Group className="mb-2">
                    <Form.Label>Field Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={field.label}
                      onChange={(e) => handleCustomFieldChange(index, "label", e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Field Value</Form.Label>
                    <Form.Control
                      type="text"
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteCustomField(index)}>🗑 Delete</Button>
                </div>
              ))}

              <Button variant="success" size="sm" onClick={handleAddCustomField}>➕ Add Custom Field</Button>

              <div className="text-end mt-3">
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="ms-2">{editId ? "Update Event" : "Add Event"}</Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default Addeventbyadmin;