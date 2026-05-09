import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Card, Container, Form } from 'react-bootstrap';
import './css/AdminPayments.css'; // Optional custom CSS for consistency

const AdminAllViewEvent = () => {
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // Filter by title (search input)
    const [organizerFilter, setOrganizerFilter] = useState(''); // Filter by organizer
    const [titleFilter, setTitleFilter] = useState(''); // Filter by event title (dropdown)

    useEffect(() => {
        axios.get('https://advanced-event-management.onrender.com/api/allcategories')
            .then(response => setCategories(response.data))
            .catch(error => console.error("Error fetching categories:", error));
    }, []);

    // Get unique titles and organizers for dropdowns
    const uniqueTitles = [...new Set(categories.map(category => category.title))];
    const uniqueOrganizers = [...new Set(categories.map(category => category.organizer))];

    // Filter categories based on search query, organizer, and title
    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesOrganizer = organizerFilter ? category.organizer === organizerFilter : true;
        const matchesTitle = titleFilter ? category.title === titleFilter : true;

        return matchesSearch && matchesOrganizer && matchesTitle;
    });

    // Handle input changes
    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleOrganizerChange = (e) => setOrganizerFilter(e.target.value);
    const handleTitleChange = (e) => setTitleFilter(e.target.value);

    return (
        <div>
            <Container fluid className="mt-5 mb-5">
                <Card className="shadow-lg border-0">
                    <Card.Header className="text-white text-center py-3" style={{ backgroundColor: '#6F2DA8' }}>
                        <h2 className="mb-0">Event Categories</h2>
                    </Card.Header>
                    <Card.Body className="p-4">
                        {/* Filter Section */}
                        <Form className="mb-4">
                            <Row className="g-3">
                                {/* Search by Title */}
                                <Col md={4}>
                                    <Form.Group controlId="searchEvent">
                                        <Form.Label>Search by Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter event title..."
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            className="shadow-sm"
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Organizer Filter */}
                                <Col md={4}>
                                    <Form.Group controlId="organizerFilter">
                                        <Form.Label>Filter by Organizer</Form.Label>
                                        <Form.Select
                                            value={organizerFilter}
                                            onChange={handleOrganizerChange}
                                            className="shadow-sm"
                                        >
                                            <option value="">All Organizers</option>
                                            {uniqueOrganizers.map((organizer, index) => (
                                                <option key={index} value={organizer}>
                                                    {organizer}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                {/* Title Filter Dropdown */}
                                <Col md={4}>
                                    <Form.Group controlId="titleFilter">
                                        <Form.Label>Filter by Event Title</Form.Label>
                                        <Form.Select
                                            value={titleFilter}
                                            onChange={handleTitleChange}
                                            className="shadow-sm"
                                        >
                                            <option value="">All Titles</option>
                                            {uniqueTitles.map((title, index) => (
                                                <option key={index} value={title}>
                                                    {title}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>

                        <div
                            className="overflow-auto"
                            style={{
                                height: '500px', // Vertical scroll height
                                overflowY: 'scroll',
                                scrollbarWidth: 'none', // Firefox
                                msOverflowStyle: 'none' // IE & Edge
                            }}
                        >
                            {/* Hide scrollbar in Webkit browsers */}
                            <style>
                                {`
                                    div::-webkit-scrollbar {
                                        display: none;
                                    }
                                `}
                            </style>

                            <Row>
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map(category => (
                                        <Col lg={4} md={6} sm={12} key={category._id} className="mb-4">
                                            <Card className="shadow-sm border-2 h-100">
                                                <Card.Img
                                                    variant="top"
                                                    src={`https://advanced-event-management.onrender.com/${category.image}`}
                                                    style={{ height: '200px', objectFit: 'cover' }}
                                                />
                                                <Card.Body>
                                                    <Card.Title>{category.title}</Card.Title>
                                                    <Card.Text>{category.description}</Card.Text>
                                                    <p><strong>Organizer:</strong> {category.organizer}</p>
                                                    <p><strong>Price:</strong> {category.price}</p>
                                                    {/* Display eventType if it exists */}
                                                    {category.eventType && (
                                                        <p><strong>Event Type:</strong> {category.eventType}</p>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))
                                ) : (
                                    <Col className="text-center">
                                        <p>No events found matching your filters.</p>
                                    </Col>
                                )}
                            </Row>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default AdminAllViewEvent;