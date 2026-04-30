// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";

// const AddVenue = () => {
//   const [venueDetails, setVenueDetails] = useState({
//     name: "",
//     price: "",
//     services: "",
//     image: null,
//   });

//   const [venues, setVenues] = useState([]); // Store all venues
//   const fileInputRef = useRef(null);

//   // Fetch venues from database when the component loads
//   useEffect(() => {
//     fetchVenues();
//   }, []);

//   const fetchVenues = async () => {
//     try {
//       const response = await axios.get("http://localhost:4000/api/venues");
//       // Set venues to an empty array if the response does not contain venues
//       setVenues(response.data.venues || []);
//     } catch (error) {
//       console.error("Error fetching venues:", error);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setVenueDetails({ ...venueDetails, [name]: value });
//   };

//   const handleImageChange = (e) => {
//     const { files } = e.target;
//     if (files.length > 0) {
//       setVenueDetails({ ...venueDetails, image: files[0] });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const { name, price, services, image } = venueDetails;

//       if (!name || !price || !services || !image) {
//         alert("All fields, including the image, are required!");
//         return;
//       }

//       const formData = new FormData();
//       formData.append("name", name);
//       formData.append("price", price);
//       formData.append("services", services);
//       formData.append("image", image);

//       // Send request to backend
//       const response = await axios.post("http://localhost:4000/api/venues", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.data.success) {
//         alert("Venue added successfully!");
        
//         // Fetch updated venue list after adding a new venue
//         fetchVenues();

//         // Reset form fields
//         setVenueDetails({ name: "", price: "", services: "", image: null });

//         if (fileInputRef.current) {
//           fileInputRef.current.value = null;
//         }
//       }
//     } catch (error) {
//       console.error("Error adding venue:", error);
//       alert("An error occurred while adding the venue.");
//     }
//   };

//   return (
//     <div>
//       <h2>Add New Venue</h2>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Venue Name:</label>
//           <input type="text" name="name" value={venueDetails.name} onChange={handleInputChange} required />
//         </div>
//         <div>
//           <label>Price:</label>
//           <input type="number" name="price" value={venueDetails.price} onChange={handleInputChange} required />
//         </div>
//         <div>
//           <label>Services (comma separated):</label>
//           <input type="text" name="services" value={venueDetails.services} onChange={handleInputChange} required />
//         </div>
//         <div>
//           <label>Upload Image:</label>
//           <input type="file" name="image" onChange={handleImageChange} ref={fileInputRef} required />
//         </div>
//         <button type="submit">Add Venue</button>
//       </form>

//       {/* Display all venues */}
//       <div>
//         <h3>All Venues</h3>
//         {Array.isArray(venues) && venues.length === 0 ? (
//           <p>No venues available.</p>
//         ) : (
//           <ul>
//             {venues?.map((venue) => (
//               <li key={venue._id}>
//                 <h4>{venue.name}</h4>
//                 <p>Price: ${venue.price}</p>
//                 <p>Services: {venue.services}</p>
//                 <img
//                   src={`http://localhost:4000/uploads/${venue.image}`}
//                   alt={venue.name}
//                   style={{ width: "200px", height: "200px" }}
//                 />
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AddVenue;
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css";

// const AddVenue = () => {
//   const [venueDetails, setVenueDetails] = useState({
//     name: "",
//     price: "",
//     services: "",
//     image: null,
//     existingImage: "",
//   });

//   const [venues, setVenues] = useState([]);
//   const [editingVenue, setEditingVenue] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     fetchVenues();
//   }, []);

//   const fetchVenues = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const userEmail = localStorage.getItem("userEmail");

//       const response = await axios.get("http://localhost:4000/api/venues", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // Filter venues by user
//       const userVenues = response.data.filter((venue) => venue.addBy === userEmail);
//       setVenues(userVenues);
//     } catch (error) {
//       console.error("Error fetching venues:", error);
//     }
//   };

//   const handleChange = (e) => {
//     setVenueDetails({ ...venueDetails, [e.target.name]: e.target.value });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setVenueDetails({
//         ...venueDetails,
//         image: file,
//         existingImage: URL.createObjectURL(file), // Preview selected image
//       });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem("token");

//     const formData = new FormData();
//     formData.append("name", venueDetails.name);
//     formData.append("price", venueDetails.price);
//     formData.append("services", venueDetails.services); // Corrected from `services`

//     if (venueDetails.image) {
//       formData.append("image", venueDetails.image);
//     } else if (editingVenue) {
//       formData.append("existingImage", venueDetails.existingImage);
//     }

//     try {
//       if (editingVenue) {
//         await axios.put(`http://localhost:4000/api/venues/${editingVenue._id}`, formData, {
//           headers: { "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`, 
//           }
//         });
//         alert("Venue updated successfully!");
//       } else {
//         await axios.post("http://localhost:4000/api/venues", formData, {
//           headers: { "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`, 
//           }
//         });
//         alert("Venue added successfully!");
//       }

//       fetchVenues();
//       setVenueDetails({ name: "", price: "", services: "", image: null, existingImage: "" });
//       setEditingVenue(null);
//       setShowForm(false);
//     } catch (error) {
//       console.error("Error submitting venue:", error.response?.data || error.message);
//       alert("Error adding venue.");
//     }
//   };

//   const handleAddVenue = () => {
//     setVenueDetails({ name: "", price: "", services: "", image: null, existingImage: "" });
//     setEditingVenue(null);
//     setShowForm(true);
//   };

//   const handleEdit = (venue) => {
//     setVenueDetails({
//       name: venue.name,
//       price: venue.price,
//       services: venue.services, // Consistent key
//       image: null,
//       existingImage: venue.image,
//     });
//     setEditingVenue(venue);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this venue?")) {
//       try {
//         await axios.delete(`http://localhost:4000/api/venues/${id}`);
//         fetchVenues();
//         alert("Venue deleted successfully!");
//       } catch (error) {
//         console.error("Error deleting venue:", error);
//         alert("Error deleting venue.");
//       }
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <div className="d-flex justify-content-end mb-3">
//         <button className="btn btn-primary rounded-pill" onClick={handleAddVenue}>
//           ➕ Add Venue
//         </button>
//       </div>

//       {showForm && (
//         <div className="modal d-block" tabIndex="-1">
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h2 className="text-primary">{editingVenue ? "Edit Venue" : "Add New Venue"}</h2>
//                 <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
//               </div>
//               <div className="modal-body">
//                 <form onSubmit={handleSubmit}>
//                   <div className="mb-3">
//                     <label className="form-label">Venue Name:</label>
//                     <input
//                       type="text"
//                       className="form-control rounded-pill"
//                       name="name"
//                       value={venueDetails.name}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Price:</label>
//                     <input
//                       type="number"
//                       className="form-control rounded-pill"
//                       name="price"
//                       value={venueDetails.price}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Service:</label>
//                     <input
//                       type="text"
//                       className="form-control rounded-pill"
//                       name="services"
//                       value={venueDetails.services}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Upload Image:</label>
//                     <input
//                       type="file"
//                       className="form-control rounded-pill"
//                       ref={fileInputRef}
//                       onChange={handleFileChange}
//                       required={!editingVenue}
//                     />
//                     {venueDetails.existingImage && (
//                       <div className="mt-2">
//                         <img src={venueDetails.existingImage} alt="Selected" width="100" className="rounded" />
//                         <p className="text-muted">Current Image</p>
//                       </div>
//                     )}
//                   </div>

//                   <button type="submit" className="btn btn-primary w-100 rounded-pill">
//                     {editingVenue ? "Update Venue" : "Add Venue"}
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="mt-5">
//         <h2 className="text-center mb-4 text-dark">Venue List</h2>
//         <table className="table table-striped">
//           <thead className="table-dark">
//             <tr>
//               <th>Name</th>
//               <th>Price</th>
//               <th>Service</th>
//               <th>Added By</th>
//               <th>Image</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {venues.map((venue) => (
//               <tr key={venue._id}>
//                 <td>{venue.name}</td>
//                 <td>${venue.price}</td>
//                 <td>{venue.services}</td>
//                 <td>{venue.addedByName}</td>
//                 <td>{venue.image && <img src={venue.image} alt={venue.name} width="50" height="50" />}</td>
//                 <td>
//                 <td className="d-flex gap-2 justify-content-end">
//   <button className="btn btn-warning d-flex align-items-center justify-content-center" onClick={() => handleEdit(venue)}>
//     <i className="fas fa-edit"></i>
//   </button>
//   <button className="btn btn-danger d-flex align-items-center justify-content-center" onClick={() => handleDelete(venue._id)}>
//     <i className="fas fa-trash-alt"></i>
//   </button>
// </td>
// </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AddVenue;


import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Card, Button, Table } from "react-bootstrap";

const AddVenue = () => {
  const [venueDetails, setVenueDetails] = useState({
    name: "",
    price: "",
    services: "",
    image: null,
    existingImage: "",
  });

  const [venues, setVenues] = useState([]);
  const [editingVenue, setEditingVenue] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");

      const response = await axios.get("http://localhost:4000/api/venues", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter venues by user
      const userVenues = response.data.filter((venue) => venue.addBy === userEmail);
      setVenues(userVenues);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
  };

  const handleChange = (e) => {
    setVenueDetails({ ...venueDetails, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVenueDetails({
        ...venueDetails,
        image: file,
        existingImage: URL.createObjectURL(file), // Preview selected image
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", venueDetails.name);
    formData.append("price", venueDetails.price);
    formData.append("services", venueDetails.services);

    if (venueDetails.image) {
      formData.append("image", venueDetails.image);
    } else if (editingVenue) {
      formData.append("existingImage", venueDetails.existingImage);
    }

    try {
      if (editingVenue) {
        await axios.put(`http://localhost:4000/api/venues/${editingVenue._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Venue updated successfully!");
      } else {
        await axios.post("http://localhost:4000/api/venues", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Venue added successfully!");
      }

      fetchVenues();
      setVenueDetails({ name: "", price: "", services: "", image: null, existingImage: "" });
      setEditingVenue(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting venue:", error.response?.data || error.message);
      alert("Error adding venue.");
    }
  };

  const handleAddVenue = () => {
    setVenueDetails({ name: "", price: "", services: "", image: null, existingImage: "" });
    setEditingVenue(null);
    setShowForm(true);
  };

  const handleEdit = (venue) => {
    setVenueDetails({
      name: venue.name,
      price: venue.price,
      services: venue.services,
      image: null,
      existingImage: venue.image,
    });
    setEditingVenue(venue);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this venue?")) {
      try {
        await axios.delete(`http://localhost:4000/api/venues/${id}`);
        fetchVenues();
        alert("Venue deleted successfully!");
      } catch (error) {
        console.error("Error deleting venue:", error);
        alert("Error deleting venue.");
      }
    }
  };

  return (
    <div>
      <Container fluid className="mt-5 mb-5">
        <Card className="shadow-lg border-0">
          <Card.Header className="text-white text-center py-3" style={{ backgroundColor: "#6F2DA8" }}>
            <h2 className="mb-0">Venue List</h2>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-end mb-3">
              <Button className="btn btn-primary rounded-pill" onClick={handleAddVenue}>
                ➕ Add Venue
              </Button>
            </div>

            <Table striped bordered hover className="mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Location</th>
                  <th>Added By</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((venue) => (
                  <tr key={venue._id}>
                    <td>{venue.name}</td>
                    <td>₹{venue.price}</td>
                    <td>{venue.services}</td>
                    <td>{venue.addedByName}</td>
                    <td>
                      {venue.image && (
                        <img src={venue.image} alt={venue.name} width="50" height="50" />
                      )}
                    </td>
                    <td>
                      {/* Updated to use flex row */}
                      <div className="d-flex flex-row gap-2">
                        <Button
                          variant="warning"
                          className="me-2"
                          onClick={() => handleEdit(venue)}
                        >
                          <i className="fas fa-edit me-1"></i> 
                        </Button>
                        <Button
                          variant="danger"
                          className="me-2"
                          onClick={() => handleDelete(venue._id)}
                        >
                          <i className="fas fa-trash-alt me-1"></i> 
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {showForm && (
              <div className="modal d-block" tabIndex="-1">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h2 className="text-dark">{editingVenue ? "Edit Venue" : "Add New Venue"}</h2>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowForm(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label">Venue Name:</label>
                          <input
                            type="text"
                            className="form-control rounded-pill"
                            name="name"
                            value={venueDetails.name}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Price:</label>
                          <input
                            type="number"
                            className="form-control rounded-pill"
                            name="price"
                            value={venueDetails.price}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Location:</label>
                          <input
                            type="text"
                            className="form-control rounded-pill"
                            name="services"
                            value={venueDetails.services}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Upload Image:</label>
                          <input
                            type="file"
                            className="form-control rounded-pill"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            required={!editingVenue}
                          />
                          {venueDetails.existingImage && (
                            <div className="mt-2">
                              <img
                                src={venueDetails.existingImage}
                                alt="Selected"
                                width="100"
                                className="rounded"
                              />
                              <p className="text-muted">Current Image</p>
                            </div>
                          )}
                        </div>

                        <Button type="submit" className="btn btn-primary w-100 rounded-pill">
                          {editingVenue ? "Update Venue" : "Add Venue"}
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AddVenue;