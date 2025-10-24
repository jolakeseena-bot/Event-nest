import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap'
import EventCard from '../components/EventCard'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'
import { eventsAPI } from '../services/api'

const Home = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: ''
  })
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchEvents()
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [filters])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the API service with query parameters
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.category) params.category = filters.category
      if (filters.location) params.location = filters.location

      const res = await eventsAPI.getAll(params)
      setEvents(res.data.data)
    } catch (err) {
      setError('Failed to fetch events. Please try again later.')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      // In a real app, you might have an endpoint for categories
      // For now, we'll use the static list from our backend
      setCategories(['Health', 'Environment', 'Education', 'Community', 'Technology', 'Other'])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: ''
    })
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold">Discover Amazing Events Near You</h1>
              <p className="lead">
                Join our community of event organizers and attendees. Find events that match your interests or create your own.
              </p>
            </Col>
            <Col md={6}>
              <Card className="bg-light bg-opacity-25 border-0">
                <Card.Body>
                  <h4 className="text-white">Find Your Next Experience</h4>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Control 
                        type="text" 
                        placeholder="Search events..." 
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Select 
                            name="category"
                            value={filters.category}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Control 
                            type="text" 
                            placeholder="Location" 
                            name="location"
                            value={filters.location}
                            onChange={handleFilterChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-grid gap-2">
                      <Button variant="light" type="button" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Events Section */}
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Upcoming Events</h2>
          <div>
            <span className="text-muted me-2">
              {events.length} {events.length === 1 ? 'Event' : 'Events'} Found
            </span>
          </div>
        </div>

        {error && <Alert type="danger" message={error} />}

        {loading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <i className="bi bi-calendar-x display-1 text-muted"></i>
              <h3 className="mt-3">No Events Found</h3>
              <p className="text-muted">
                Try adjusting your filters or check back later for new events.
              </p>
            </Card.Body>
          </Card>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {events.map(event => (
              <Col key={event._id}>
                <EventCard event={event} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  )
}

export default Home
