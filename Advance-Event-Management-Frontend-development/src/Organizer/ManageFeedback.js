import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Table, Container, Card, Button } from 'react-bootstrap';

const ManageFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAllFeedback();
  }, []);

  const fetchAllFeedback = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setFeedbackList([]);
        return;
      }
      const response = await fetch('https://advanced-event-management.onrender.com/api/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Feedback fetch failed with status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setFeedbackList(data.feedback || []);
      } else {
        console.warn('No feedback found:', data.message);
        setFeedbackList([]);
      }
    } catch (error) {
      console.error('Error fetching all feedback:', error.message);
      setFeedbackList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://advanced-event-management.onrender.com/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete feedback with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setFeedbackList(feedbackList.filter((feedback) => feedback._id !== feedbackId));
        console.log('Feedback deleted successfully');
      } else {
        console.warn('Delete failed:', data.message);
      }
    } catch (error) {
      console.error('Error deleting feedback:', error.message);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        // Full star
        stars.push(
          <i
            key={i}
            className="bi bi-star-fill me-1"
            style={{ color: '#FFD700' }}
          />
        );
      } else if (i - 0.5 <= rating) {
        // Half star
        stars.push(
          <i
            key={i}
            className="bi bi-star-half me-1"
            style={{ color: '#FFD700' }}
          />
        );
      } else {
        // Empty star
        stars.push(
          <i
            key={i}
            className="bi bi-star me-1"
            style={{ color: '#6c757d' }}
          />
        );
      }
    }
    return stars;
  };

  return (
    <div>
      <Container fluid className="mt-5 mb-5">
        <Card className="shadow-lg border-0">
          <Card.Header
            className="text-white text-center py-3"
            style={{ backgroundColor: '#6F2DA8' }}
          >
            <h2 className="mb-0">Manage Feedback</h2>
          </Card.Header>
          <Card.Body className="p-4">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : feedbackList.length > 0 ? (
              <Table striped bordered hover responsive>
                <thead className="table-dark">
                  <tr>
                    <th>Event Title</th>
                    <th>User Name</th>
                    <th>Rating</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.map((feedback) => (
                    <tr key={feedback._id}>
                      <td>{feedback.eventId?.title || 'Unknown Event'}</td>
                      <td>{feedback.userId?.name || 'Anonymous'}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {renderStars(feedback.rating)}
                          <span>({feedback.rating} / 5)</span>
                        </div>
                      </td>
                      <td>
                        {new Date(feedback.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteFeedback(feedback._id)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-3">
                <p>No feedback available.</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ManageFeedback;