import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Card } from 'react-bootstrap';
import axios from 'axios';

import './css/AdminPayments.css'; // Optional custom CSS

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://advanced-event-management.onrender.com/api/all-payments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayments(response.data.payments);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to load payment details.');
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;

  return (
    <div>

      <Container className="mt-5 mb-5">
        <Card className="shadow-lg border-0">
          <Card.Header className="text-white text-center py-3" style={{ backgroundColor: '#6F2DA8' }}>
            <h2 className="mb-0">Payment Management</h2>
          </Card.Header>
          <Card.Body className="p-4">
            <Table striped bordered hover responsive className="mt-3">
              <thead className="table-dark">
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Event Title</th>
                  <th>Amount (INR)</th>
                  <th>Razorpay Payment ID</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.userId?.name || 'Unknown'}</td>
                    <td>{payment.userId?.email || 'N/A'}</td>
                    <td>{payment.eventId?.title || 'N/A'}</td>
                    <td>{payment.amount / 100}</td> {/* Convert paise to INR */}
                    <td>{payment.razorpayPaymentId}</td>
                    <td>{payment.status || 'Completed'}</td>
                    <td>
                      {new Date(payment.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric' // Use 'numeric' for full year
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

export default AdminPayments;