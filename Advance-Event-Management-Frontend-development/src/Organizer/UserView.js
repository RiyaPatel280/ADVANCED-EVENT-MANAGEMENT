import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Table, Container, Card, Pagination } from "react-bootstrap";

const UserView = () => {
  const [registrations, setRegistrations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [itemsPerPage] = useState(10);
  const organizerEmail = localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://advanced-event-management.onrender.com/api/registrations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Registrations fetch failed with status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.registrations || []);
      } else {
        console.warn("No registrations found:", data.message);
        setRegistrations([]);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error.message);
      setRegistrations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizerEmail && token) {
      fetchRegistrations();
    }
  }, [organizerEmail, token]);

  // Calculate pagination variables
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = registrations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(registrations.length / itemsPerPage);

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
            style={{ backgroundColor: '#6F2DA8' }}
          >
            <h2 className="mb-0">Registrations for Your Events</h2>
          </Card.Header>
          <Card.Body className="p-4">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : registrations.length > 0 ? (
              <>
                <Table striped bordered hover responsive>
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>User Name</th>
                      <th>User Email</th>
                      <th>Event Title</th>
                      <th>Location</th>
                      <th>Phone</th>
                      <th>Organizer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((event, index) => (
                      <tr key={event._id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{event.name || "N/A"}</td>
                        <td>{event.email || "N/A"}</td>
                        <td>{event.eventId?.title || "N/A"}</td>
                        <td>{event.eventId?.venue || "N/A"}</td>
                        <td>{event.phone || "N/A"}</td>
                        <td>{event.organizer || "N/A"}</td>
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
                <p>No users have registered for your events yet.</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default UserView;