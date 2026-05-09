import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Table, Container, Card, Pagination } from "react-bootstrap";

const BookedEventsView = () => {
  const [bookedEvents, setBookedEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage] = useState(5);
  const organizerEmail = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");

  const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchBookedEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://advanced-event-management.onrender.com/api/booked-eventsOA", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Booked events fetch failed with status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setBookedEvents(data.bookedEvents || []);
      } else {
        console.warn("No booked events found:", data.message);
        setBookedEvents([]);
      }
    } catch (error) {
      console.error("Error fetching booked events:", error.message);
      setBookedEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizerEmail && token) {
      fetchBookedEvents();
    }
  }, [organizerEmail, token]);

  // Calculate pagination variables
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = bookedEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(bookedEvents.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate pagination items
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <div>
      <Container fluid className="mt-5 mb-5">
        <Card className="shadow-lg border-0">
          <Card.Header
            className="text-white text-center py-3"
            style={{ backgroundColor: "#6F2DA8" }}
          >
            <h2 className="mb-0">Your Booked Events</h2>
          </Card.Header>
          <Card.Body className="p-4">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : bookedEvents.length > 0 ? (
              <>
                <Table striped bordered hover responsive>
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Event Name</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Organizer</th>
                      <th>Amount</th>
                      <th>Payment ID</th>
                      <th>Status</th>
                      <th>Booked On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((event, index) => (
                      <tr key={event._id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{event.eventId?.title || "N/A"}</td>
                        <td>{event.eventId?.startDate ? formatDate(event.eventId.startDate) : "N/A"}</td>
                        <td>{event.eventId?.venue || "N/A"}</td>
                        <td>{event.eventId?.organizer || "N/A"}</td>
                        <td>{event.amount ? formatCurrency(event.amount, event.currency || "INR") : "N/A"}</td>
                        <td>{event.razorpayPaymentId || "N/A"}</td>
                        <td>{event.status || "N/A"}</td>
                        <td>{event.createdAt ? formatDate(event.createdAt) : "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {paginationItems}
                      <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-3">
                <p>You haven't had any events booked yet.</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default BookedEventsView;