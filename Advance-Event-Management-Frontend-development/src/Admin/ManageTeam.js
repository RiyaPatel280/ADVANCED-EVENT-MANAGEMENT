import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Form, Container, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const ManageTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMember, setNewMember] = useState({ name: "", description: "", image: null });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
        const response = await fetch("https://advanced-event-management.onrender.com/api/team/viewteam", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setTeamMembers(data.teamMembers);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError("Failed to fetch team members: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamMembers();
  }, []);

  const handleAddOrUpdateMember = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newMember.name);
    formData.append("description", newMember.description);
    if (newMember.image) {
      formData.append("image", newMember.image);
    }

    const url = editingMember
      ? `https://advanced-event-management.onrender.com/api/team/update/${editingMember._id}`
      : "https://advanced-event-management.onrender.com/api/team/add";
    const method = editingMember ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        if (editingMember) {
          setTeamMembers(
            teamMembers.map((member) =>
              member._id === editingMember._id ? data.teamMember : member
            )
          );
        } else {
          setTeamMembers([...teamMembers, data.teamMember]);
        }
        setShowModal(false);
        setNewMember({ name: "", description: "", image: null });
        setEditingMember(null);
        setError("");
        window.alert(`${editingMember ? "Team member updated" : "Team member added"} successfully!`);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to update team member: " + error.message);
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await fetch(`https://advanced-event-management.onrender.com/api/team/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTeamMembers(teamMembers.filter((member) => member._id !== id));
        window.alert("Team member deleted successfully!");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to delete team member: " + error.message);
    }
  };

  return (
    <div>
      <Container fluid className="mt-5 mb-5">
        <Card className="shadow-lg border-0">
          <Card.Header
            className="text-white text-center py-3"
            style={{ backgroundColor: "#6F2DA8" }}
          >
            <h2 className="mb-0">Manage Team</h2>
          </Card.Header>
          <Card.Body className="p-4">
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="d-flex justify-content-end mb-3">
              <Button
                className="btn btn-primary rounded-pill"
                onClick={() => {
                  setShowModal(true);
                  setEditingMember(null);
                  setNewMember({ name: "", description: "", image: null });
                }}
              >
                ➕ Add Team Member
              </Button>
            </div>

            <Table striped bordered hover className="mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : teamMembers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No team members found
                    </td>
                  </tr>
                ) : (
                  teamMembers.map((member) => (
                    <tr key={member._id}>
                      <td>
                        <img
                          src={
                            member.imageUrl
                              ? `https://advanced-event-management.onrender.com${member.imageUrl}`
                              : "https://via.placeholder.com/50x50"
                          }
                          alt={member.name}
                          style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        />
                      </td>
                      <td>{member.name}</td>
                      <td>{member.description}</td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            setEditingMember(member);
                            setNewMember({
                              name: member.name,
                              description: member.description,
                              image: null,
                            });
                            setShowModal(true);
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteMember(member._id)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Add/Edit Team Member Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editingMember ? "Edit Team Member" : "Add Team Member"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddOrUpdateMember}>
              <Form.Group controlId="memberName" className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group controlId="memberDescription" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter description"
                  value={newMember.description}
                  onChange={(e) =>
                    setNewMember({ ...newMember, description: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group controlId="memberImage" className="mb-3">
                <Form.Label>Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setNewMember({ ...newMember, image: e.target.files[0] })}
                />
                {editingMember && !newMember.image && (
                  <Form.Text className="text-muted">
                    Leave blank to keep the existing image.
                  </Form.Text>
                )}
              </Form.Group>
              <Button variant="primary" type="submit">
                {editingMember ? "Update" : "Add"}
              </Button>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default ManageTeam;