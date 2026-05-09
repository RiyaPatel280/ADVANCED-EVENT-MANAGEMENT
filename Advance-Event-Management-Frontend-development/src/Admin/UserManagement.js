import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Table, Form, Container, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState({ id: null, name: "", email: "", phone: "", role: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    password: "", 
    password_confirmation: "", 
    role: "attendee" 
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://advanced-event-management.onrender.com/api/users/all-users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleEdit = async () => {
    // Check if email is already in use by another user (excluding the current user being edited)
    if (users.some(user => 
      user.email.toLowerCase() === editUser.email.toLowerCase() && 
      user._id !== editUser.id
    )) {
      window.alert("Email is already in use. Please use a different email.");
      return;
    }
  
    if (!validateEmail(editUser.email)) {
      window.alert("Please enter a valid email address.");
      return;
    }
    if (!validatePhone(editUser.phone)) {
      window.alert("Phone number must be exactly 10 digits.");
      return;
    }
    try {
      await axios.put(
        `https://advanced-event-management.onrender.com/api/users/edit-user/${editUser.id}`,
        { name: editUser.name, email: editUser.email, phone: editUser.phone, role: editUser.role },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchUsers();
      setShowEditModal(false);
      setEditUser({ id: null, name: "", email: "", phone: "", role: "" });
      window.alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error.message);
      window.alert("Failed to update user.");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    try {
      await axios.delete(`https://advanced-event-management.onrender.com/api/users/delete-user/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchUsers();
      window.alert("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error.message);
      window.alert("Failed to delete user.");
    }
  };

  const handleAddUser = async () => {
    // Check if email already exists
    if (users.some(user => user.email.toLowerCase() === newUser.email.toLowerCase())) {
      window.alert("Email is already in use. Please use a different email.");
      return;
    }
  
    if (!validateEmail(newUser.email)) {
      window.alert("Please enter a valid email address.");
      return;
    }
    if (!validatePhone(newUser.phone)) {
      window.alert("Phone number must be exactly 10 digits.");
      return;
    }
    if (!validatePassword(newUser.password)) {
      window.alert("Password must be at least 6 characters long.");
      return;
    }
    if (newUser.password !== newUser.password_confirmation) {
      window.alert("Password and confirmation password must match.");
      return;
    }
    try {
      await axios.post(
        "https://advanced-event-management.onrender.com/api/users/signup",
        { 
          name: newUser.name, 
          email: newUser.email, 
          phone: newUser.phone,
          password: newUser.password, 
          password_confirmation: newUser.password_confirmation, 
          role: newUser.role 
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchUsers();
      setShowAddModal(false);
      setNewUser({ name: "", email: "", phone: "", password: "", password_confirmation: "", role: "attendee" });
      window.alert("User added successfully!");
    } catch (error) {
      console.error("Error adding user:", error.message);
      window.alert("Failed to add user.");
    }
  };

  return (
    <div>
      <Container fluid className="mt-5 mb-5">
        <Card className="shadow-lg border-0">
          <Card.Header className="text-white text-center py-3" style={{ backgroundColor: '#6F2DA8' }}>
            <h2 className="mb-0">Manage Attendee</h2>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-end mb-3">
              <Button className="btn btn-primary rounded-pill" onClick={() => {
                setShowAddModal(true);
                setShowEditModal(false);
              }}>
                ➕ Add Attendee
              </Button>
            </div>

            <Table striped bordered hover className="mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((user) => user.role === "attendee")
                  .map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || "N/A"}</td>
                      <td>{user.role}</td>
                      <td>
                        {/* <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            setEditUser({
                              id: user._id,
                              name: user.name,
                              email: user.email,
                              phone: user.phone || "",
                              role: user.role,
                            });
                            setShowEditModal(true);
                            setShowAddModal(false);
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </Button> */}
                        <Button variant="danger" size="sm" onClick={() => handleDelete(user._id)}>
                          <i className="fas fa-trash-alt"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Edit User Modal */}

<Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Edit User</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group controlId="editUserName" className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter name"
          value={editUser.name}
          onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
        />
      </Form.Group>
      <Form.Group controlId="editUserEmail" className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={editUser.email}
          onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
          required
        />
      </Form.Group>
      <Form.Group controlId="editUserPhone" className="mb-3">
        <Form.Label>Phone</Form.Label>
        <Form.Control
          type="tel"
          placeholder="Enter 10-digit phone number"
          value={editUser.phone}
          onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
          maxLength={10} // Added maxLength restriction
          required
        />
      </Form.Group>
      <Form.Group controlId="editUserRole" className="mb-3">
        <Form.Label>Role</Form.Label>
        <Form.Select
          value={editUser.role}
          onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
        >
          <option value="attendee">Attendee</option>
          <option value="organizer">Organizer</option>
        </Form.Select>
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleEdit}>
      Update
    </Button>
  </Modal.Footer>
</Modal>

        {/* Add User Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="addUserName" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="addUserEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="addUserPhone" className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="addUserPassword" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="addUserPasswordConfirmation" className="mb-3">
                <Form.Label>Password Confirmation</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm password"
                  value={newUser.password_confirmation}
                  onChange={(e) => setNewUser({ ...newUser, password_confirmation: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="addUserRole" className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="attendee">Attendee</option>
                  {/* <option value="organizer">Organizer</option> */}
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddUser}>
              Add
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default UserManagement;