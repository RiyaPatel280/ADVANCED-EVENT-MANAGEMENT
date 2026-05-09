import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import './css/EventCategories.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from "react-bootstrap";

const EventCategories = () => {
  const [categories, setCategories] = useState([]);
  const [titles, setTitles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [editId, setEditId] = useState(null);
  const [price, setPrice] = useState("");
  const [registrationLimit, setRegistrationLimit] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showTitleInput, setShowTitleInput] = useState(true);
  const [dateError, setDateError] = useState("");

  const scrollRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    fetchTitles();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://advanced-event-management.onrender.com/api/categories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Fetched categories:", response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTitles = async () => {
    try {
      const response = await axios.get("https://advanced-event-management.onrender.com/api/allcategories", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const uniqueTitles = [...new Set(response.data.map(category => category.title))];
      setTitles(uniqueTitles);
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollPosition(scrollPercentage);
    }
  };

  const getThumbHeight = () => {
    if (scrollRef.current) {
      const { clientHeight, scrollHeight } = scrollRef.current;
      return (clientHeight / scrollHeight) * 100;
    }
    return 0;
  };

  const validateDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    if (selectedDate < today) {
      setDateError("You cannot book a previous date.");
      return false;
    }
    setDateError("");
    return true;
  };

  const handleAddOrUpdateCategory = async (e) => {
    e.preventDefault();
    if (!validateDate(startDate)) return;

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("startDate", startDate);
      formData.append("venue", venue);
      formData.append("city", city);
      formData.append("details", details);
      formData.append("price", price);
      const regLimit = registrationLimit ? parseInt(registrationLimit, 10) : "";
      console.log("Frontend - Raw registrationLimit:", registrationLimit);
      console.log("Frontend - Parsed regLimit to send:", regLimit);
      formData.append("registrationLimit", regLimit);
      formData.append("customFields", JSON.stringify(customFields));

      if (image) formData.append("image", image);

      const url = editId
        ? `https://advanced-event-management.onrender.com/api/categories/${editId}`
        : "https://advanced-event-management.onrender.com/api/categories";
      const method = editId ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Frontend - Server response:", response.data);

      if (editId) {
        setCategories(categories.map(cat => (cat._id === editId ? response.data.category : cat)));
        window.alert("Event updated successfully!"); // Alert for successful edit
      } else {
        setCategories([...categories, response.data.category]);
        if (!titles.includes(response.data.category.title)) {
          setTitles([...titles, response.data.category.title]);
        }
        window.alert("Event added successfully!"); // Alert for successful addition
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Error adding/updating category:", error.response?.data || error.message);
      if (error.response?.data?.message === "Start date cannot be in the past") {
        setDateError("Start date cannot be in the past.");
      }
    }
  };

  const handleEditClick = (category) => {
    setEditId(category._id);
    setTitle(category.title);
    setDescription(category.description);
    const formattedDate = category.startDate ? new Date(category.startDate).toISOString().split("T")[0] : "";
    setStartDate(formattedDate);
    setVenue(category.venue);
    setCity(category.city || "");
    setDetails(category.details);
    setPrice(category.price);
    const regLimit = category.registrationLimit ? category.registrationLimit.toString() : "";
    setRegistrationLimit(regLimit);
    setCustomFields(category.customFields || []);
    setImage(null);
    setShowModal(true);
    setShowTitleInput(true);
    setDateError("");
    console.log("Frontend - Editing category with registrationLimit:", regLimit);
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
    const updatedFields = customFields.filter((_, i) => i !== index);
    setCustomFields(updatedFields);
  };

  const handleDeleteCategory = async (id, eventTitle, userName) => {
    if (!window.confirm(`Are you sure you want to delete this event: "${eventTitle}"?`)) return;
  
    try {
      await axios.delete(`https://advanced-event-management.onrender.com/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      setCategories(categories.filter((cat) => cat._id !== id));
      const remainingTitles = categories.filter(cat => cat._id !== id).map(cat => cat.title);
      if (!remainingTitles.includes(eventTitle)) {
        setTitles(titles.filter(t => t !== eventTitle));
      }
  
      await fetch("https://advanced-event-management.onrender.com/api/notification/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${userName} deleted the event: ${eventTitle}.`,
        }),
      });
  
      // Show success alert after successful deletion
      window.alert(`Event "${eventTitle}" deleted successfully.`);
    } catch (error) {
      console.error("Error deleting event:", error.response?.data || error.message);
      window.alert("An error occurred while deleting the event. Please try again.");
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
    setShowTitleInput(true);
    setDateError("");
  };

  const handleDropdownClick = () => {
    setShowTitleInput(false);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setShowTitleInput(true);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">🎉 Event Categories</h2>

      <div className="text-end mb-3">
        <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
          ➕ Add Event
        </Button>
      </div>

      <div className="position-relative">
        <div 
          className="event-container"
          ref={scrollRef}
          onScroll={handleScroll}
          style={{ maxHeight: '450px' }}
        >
          <div className="row">
            {categories.map((category) => (
              <div key={category._id} className="col-md-4 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <img src={`https://advanced-event-management.onrender.com/${category.image}`} alt={category.title} className="img-fluid mb-1" />
                    <h5 className="card-title">{category.title}</h5>
                    <p className="card-text"><strong>Description:</strong> {category.description}</p>
                    <p className="card-text"><strong>Start Date:</strong> {category.startDate ? new Intl.DateTimeFormat("en-GB").format(new Date(category.startDate)) : "N/A"}</p>
                    <p className="card-text"><strong>Venue:</strong> {category.venue}</p>
                    <p className="card-text"><strong>City:</strong> {category.city || "N/A"}</p>
                    <p className="card-text"><strong>Details:</strong> {category.details || "No details available."}</p>
                    <p className="card-text"><strong>Price:</strong>₹{category.price}</p>
                    <p className="card-text"><strong>Registration Limit:</strong> {category.registrationLimit || "No limit"}</p>
                    {category.customFields && category.customFields.length > 0 ? (
                      category.customFields.map((field, index) => (
                        <p key={index} className="card-text">
                          <strong>{field.label}:</strong> {field.value}
                        </p>
                      ))
                    ) : (
                      <p className="card-text">No custom fields available.</p>
                    )}
                    <div className="d-flex justify-content-between">
                      <Button variant="warning" onClick={() => handleEditClick(category)}>✏ Edit</Button>
                      <Button variant="danger" onClick={() => handleDeleteCategory(category._id, category.title, "Admin")}>🗑 Delete</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="custom-scrollbar">
          <div 
            className="scrollbar-thumb"
            style={{
              height: `${getThumbHeight()}%`,
              transform: `translateY(${scrollPosition}%)`
            }}
          />
        </div>
      </div>

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
                onClick={handleDropdownClick}
                onChange={handleTitleChange}
              >
                <option value="">Select an Event Title (Optional)</option>
                {titles.map((uniqueTitle, index) => (
                  <option key={index} value={uniqueTitle}>
                    {uniqueTitle}
                  </option>
                ))}
              </Form.Control>
              {showTitleInput && (
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
              <Form.Control type="text" value={venue} onChange={(e) => setVenue(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control 
                type="text" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                placeholder="Enter city" 
                required 
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
                onChange={(e) => {
                  const value = e.target.value;
                  console.log("Frontend - Input registrationLimit:", value);
                  setRegistrationLimit(value);
                }}
                placeholder="Enter max registrations allowed"
                min="1"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Upload Image</Form.Label>
              {editId && !image && (
                <div className="mb-2">
                  <img
                    src={`https://advanced-event-management.onrender.com/${categories.find(cat => cat._id === editId)?.image}`}
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
              <Button type="submit" variant="primary" className="ms-2" disabled={!!dateError}>
                {editId ? "Update Event" : "Add Event"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EventCategories;