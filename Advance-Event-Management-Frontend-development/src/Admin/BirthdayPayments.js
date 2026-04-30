import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Card } from 'react-bootstrap';
import axios from 'axios';


const BirthdayPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBirthdayPayments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/all-birthday-payments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayments(response.data.payments || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching birthday payments:', err);
        setError('Failed to load birthday payment details.');
        setLoading(false);
      }
    };
    fetchBirthdayPayments();
  }, []);

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;

  return (
    <div>
      <Container className="mt-5 mb-5">
        <Card className="shadow-lg border-0">
          <Card.Header className="text-white text-center py-3" style={{ backgroundColor: '#FF69B4' }}>
            <h2 className="mb-0">Birthday Payment Management</h2>
          </Card.Header>
          <Card.Body className="p-4">
            <Table striped bordered hover responsive className="mt-3">
              <thead className="table-dark">
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Event Date</th>
                  <th>Venue</th>
                  <th>Amount (INR)</th>
                  <th>Razorpay Payment ID</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.userId?.name || 'Unknown'}</td>
                    <td>{payment.userId?.email || 'N/A'}</td>
                    <td>
                      {new Date(payment.eventDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }).replace(/\//g, '/')}
                    </td>
                    <td>{payment.venue || 'N/A'}</td>
                    <td>{payment.amount / 100}</td> {/* Convert paise to INR */}
                    <td>{payment.razorpayPaymentId || 'N/A'}</td>
                    <td>{payment.status || 'Completed'}</td>
                    <td>
                      {new Date(payment.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }).replace(/\//g, '/')}
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

export default BirthdayPayments;