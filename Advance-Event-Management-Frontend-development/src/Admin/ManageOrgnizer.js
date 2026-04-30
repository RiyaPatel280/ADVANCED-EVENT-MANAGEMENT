import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Container, Card, Table, Modal, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const ManageOrganizer = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPhone, setEditedPhone] = useState(""); // New state for phone
  const [editedRole, setEditedRole] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState(""); // New state for phone
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:4000/api/users/all-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredUsers = (response.data.users || []).filter(
        (user) => user && user.role === "organizer"
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditedName(user.name);
    setEditedEmail(user.email);
    setEditedPhone(user.phone || ""); // Assuming phone might be in user data
    setEditedRole(user.role);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditedName("");
    setEditedEmail("");
    setEditedPhone(""); // Reset phone
    setEditedRole("");
  };

  const handleEditSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `http://localhost:4000/api/users/edit-user/${editingUser._id}`,
        { name: editedName, email: editedEmail, phone: editedPhone, role: editedRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Organizer updated successfully"); // Updated alert message
      fetchUsers();
      handleEditModalClose();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "An error occurred while updating the user"
      );
    }
  };

  const handleDelete = async (userId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/users/delete-user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Organizer deleted successfully"); // Updated alert message
      fetchUsers();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "An error occurred while deleting the user"
      );
    }
  };

  const handleAddModalOpen = () => {
    setShowAddModal(true);
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
    setNewName("");
    setNewEmail("");
    setNewPhone(""); // Reset phone
    setNewPassword("");
  };

  const handleAddOrganizer = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:4000/api/users/signup",
        {
          name: newName,
          email: newEmail,
          phone: newPhone,
          password: newPassword,
          password_confirmation: newPassword,
          role: "organizer",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Organizer added successfully"); // Updated alert message
      fetchUsers();
      handleAddModalClose();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "An error occurred while adding the organizer"
      );
    }
  };

  return (
    <div>
      <Container fluid className="mt-5 mb-5">
        <Card className="shadow-lg border-0">
          <Card.Header className="text-white text-center py-3" style={{ backgroundColor: '#6F2DA8' }}>
            <h2 className="mb-0">Manage Organizer</h2>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="mb-3 text-end">
              <Button className="btn btn-primary rounded-pill" onClick={handleAddModalOpen}>
                ➕ Add Organizer
              </Button>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive">
                  <Table className="table table-bordered table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th> {/* Added Phone column */}
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone || "N/A"}</td> {/* Display phone or N/A */}
                          <td>{user.role}</td>
                          <td>
                            {/* <Button
                              variant="warning"
                              className="me-2"
                              onClick={() => handleEditClick(user)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button> */}
                            <Button
                              variant="danger"
                              onClick={() => handleDelete(user._id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Edit Organizer Modal */}
            <Modal show={showEditModal} onHide={handleEditModalClose}>
              <Modal.Header closeButton>
                <Modal.Title>Edit Organizer</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3" controlId="editName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="editEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="editPhone">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="editRole">
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                      value={editedRole}
                      onChange={(e) => setEditedRole(e.target.value)}
                    >
                      <option value="organizer">Organizer</option>
                      <option value="attendee">Attendee</option>
                    </Form.Select>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleEditModalClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleEditSave}>
                  Save Changes
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Add Organizer Modal */}
            <Modal show={showAddModal} onHide={handleAddModalClose}>
              <Modal.Header closeButton>
                <Modal.Title>Add Organizer</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleAddOrganizer}>
                  <Form.Group className="mb-3" controlId="addName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="addEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="addPhone">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Enter phone number"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="addRole">
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                      value="organizer"
                      disabled
                    >
                      <option value="organizer">Organizer</option>
                      <option value="attendee">Attendee</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="addPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleAddModalClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Add Organizer
                    </Button>
                  </Modal.Footer>
                </Form>
              </Modal.Body>
            </Modal>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ManageOrganizer;