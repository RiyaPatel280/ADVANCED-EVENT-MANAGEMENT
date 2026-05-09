import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Card, Button } from 'react-bootstrap';
import axios from 'axios';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://advanced-event-management.onrender.com/api/all-contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data.contacts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contact details.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://advanced-event-management.onrender.com/api/contact/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Refresh the contact list after successful deletion
        setContacts(contacts.filter(contact => contact._id !== id));
      } catch (err) {
        console.error('Error deleting contact:', err);
        setError('Failed to delete contact.');
      }
    }
  };

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;

  return (
    <div>
      <Container className="mt-5 mb-5">
        <Card className="shadow-lg border-0">
          <Card.Header className="text-white text-center py-3" style={{ backgroundColor: '#6F2DA8' }}>
            <h2 className="mb-0">Contact Management</h2>
          </Card.Header>
          <Card.Body className="p-4">
            <Table striped bordered hover responsive className="mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact._id}>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td>{contact.message}</td>
                    <td>
                      {(() => {
                        const date = new Date(contact.createdAt);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-based
                        const year = date.getFullYear();
                        return `${day}/${month}/${year}`;
                      })()}
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(contact._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ContactManagement;