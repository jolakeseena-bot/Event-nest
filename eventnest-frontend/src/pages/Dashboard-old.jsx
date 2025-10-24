import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Alert as BsAlert, Nav, ProgressBar, Tooltip, OverlayTrigger } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'
import { eventsAPI } from '../services/api'
import moment from 'moment'

const Dashboard = () => {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('created')
  const [createdEvents, setCreatedEvents] = useState([])
  const [participatingEvents, setParticipatingEvents] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUserEvents()
  }, [])

  const fetchUserEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [myEventsRes, upcomingRes] = await Promise.all([
        eventsAPI.getMyEvents(),
        eventsAPI.getUpcoming()
      ])

      if (myEventsRes.data.data) {
        const created = myEventsRes.data.data.filter(e => e.isCreated)
        const participating = myEventsRes.data.data.filter(e => !e.isCreated)
        setCreatedEvents(created)
        setParticipatingEvents(participating)
      }

      setUpcomingEvents(upcomingRes.data.data || [])
    } catch (err) {
      setError('Failed to load your events.')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return

    try {
      await eventsAPI.delete(eventId)
      setCreatedEvents(prev => prev.filter(e => e._id !== eventId))
    } catch (err) {
      setError('Failed to delete event.')
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Health': 'success',
      'Environment': 'primary',
      'Education': 'info',
      'Community': 'warning',
      'Technology': 'danger',
      'Other': 'secondary'
    }
    return colors[category] || 'secondary'
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'Health': 'heart-fill',
      'Environment': 'tree-fill',
      'Education': 'book-fill',
      'Community': 'people-fill',
      'Technology': 'cpu-fill',
      'Other': 'tag-fill'
    }
    return icons[category] || 'tag-fill'
  }

  const EventRow = ({ event, isOwner }) => {
    const isUpcoming = moment(event.date).isAfter(moment())
    
    return (
      <Card className="mb-3 border-0 shadow-sm hover-shadow" style={{ transition: 'all 0.3s ease' }}>
        <Card.Body className="p-3">
          <Row className="align-items-center">
            <Col lg={2} className="mb-3 mb-lg-0">
              <img 
                src={event.image || `https://picsum.photos/seed/${event._id}/200/120.jpg`}
                alt={event.title}
                className="img-fluid rounded"
                style={{ height: '100px', objectFit: 'cover', width: '100%' }}
              />
            </Col>
            <Col lg={6} className="mb-3 mb-lg-0">
              <Link to={`/events/${event._id}`} className="text-decoration-none">
                <h5 className="fw-bold text-dark mb-2 hover-text-primary" style={{ transition: 'color 0.2s' }}>
                  {event.title}
                </h5>
              </Link>
              <div className="mb-2">
                <Badge bg={getCategoryColor(event.category)} className="me-2">
                  <i className={`bi bi-${getCategoryIcon(event.category)} me-1`}></i>
                  {event.category}
                </Badge>
                <Badge bg={isUpcoming ? 'success' : 'secondary'}>
                  {isUpcoming ? 'Upcoming' : 'Completed'}
                </Badge>
              </div>
              <small className="text-muted d-block">
                <i className="bi bi-calendar-event me-1"></i>
                {moment(event.date).format('MMM DD, YYYY [at] h:mm A')}
              </small>
              <small className="text-muted d-block">
                <i className="bi bi-geo-alt me-1"></i>
                {event.location}
              </small>
            </Col>
            <Col lg={2} className="mb-3 mb-lg-0">
              <div className="text-center">
                <h6 className="mb-1 fw-bold">{event.participants?.length || 0}</h6>
                <small className="text-muted">Attendees</small>
                {event.maxAttendees && (
                  <ProgressBar 
                    now={Math.round((event.participants?.length || 0) / event.maxAttendees * 100)} 
                    className="mt-2"
                    style={{ height: '4px' }}
                  />
                )}
              </div>
            </Col>
            <Col lg={2} className="text-lg-end">
              <div className="d-grid gap-2">
                <Button 
                  as={Link}
                  to={`/events/${event._id}`}
                  variant="outline-primary"
                  size="sm"
                  className="fw-bold"
                >
                  <i className="bi bi-eye me-1"></i>View
                </Button>
                {isOwner && (
                  <>
                    <Button 
                      as={Link}
                      to={`/edit-event/${event._id}`}
                      variant="outline-info"
                      size="sm"
                      className="fw-bold"
                    >
                      <i className="bi bi-pencil me-1"></i>Edit
                    </Button>
                    <Button 
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteEvent(event._id)}
                      className="fw-bold"
                    >
                      <i className="bi bi-trash me-1"></i>Delete
                    </Button>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    )
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="bg-light py-5">
      <Container>
        {/* Header */}
        <div className="mb-5">
          <h1 className="fw-bold mb-2">
            <i className="bi bi-person-circle me-2 text-primary"></i>Welcome, {user?.name}!
          </h1>
          <p className="text-muted">Manage your events and track your participation</p>
        </div>

        {error && <Alert type="danger" message={error} />}

        {/* Stats Cards */}
        <Row className="g-4 mb-5">
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center h-100" style={{ background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)' }}>
              <Card.Body className="text-white">
                <h2 className="fw-bold mb-2">{createdEvents.length}</h2>
                <p className="mb-0">Events Created</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center h-100" style={{ background: 'linear-gradient(135deg, #4cc9f0 0%, #4895ef 100%)' }}>
              <Card.Body className="text-white">
                <h2 className="fw-bold mb-2">{participatingEvents.length}</h2>
                <p className="mb-0">Events Attending</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center h-100" style={{ background: 'linear-gradient(135deg, #3dd5f3 0%, #48dbfb 100%)' }}>
              <Card.Body className="text-white">
                <h2 className="fw-bold mb-2">{upcomingEvents.length}</h2>
                <p className="mb-0">Upcoming Events</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm text-center h-100" style={{ background: 'linear-gradient(135deg, #f19c1f 0%, #f77f00 100%)' }}>
              <Card.Body className="text-white">
                <h2 className="fw-bold mb-2">
                  {createdEvents.reduce((sum, e) => sum + (e.participants?.length || 0), 0)}
                </h2>
                <p className="mb-0">Total Attendees</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        <Card className="border-0 shadow-lg">
          <Card.Header className="border-0 bg-white">
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
              <Nav.Item>
                <Nav.Link eventKey="created" className="fw-bold">
                  <i className="bi bi-calendar-plus me-2"></i>My Created Events
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="participating" className="fw-bold">
                  <i className="bi bi-hand-thumbs-up me-2"></i>Events I'm Attending
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="upcoming" className="fw-bold">
                  <i className="bi bi-star me-2"></i>Upcoming Events
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body className="p-4">
            {activeTab === 'created' && (
              <div>
                {createdEvents.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-calendar-x display-1 text-muted"></i>
                    <h4 className="mt-3 fw-bold">No Events Created</h4>
                    <p className="text-muted mb-4">Start organizing by creating your first event</p>
                    <Button href="/create-event" variant="primary" className="fw-bold">
                      <i className="bi bi-plus-circle me-2"></i>Create Event
                    </Button>
                  </div>
                ) : (
                  createdEvents.map(event => (
                    <EventRow key={event._id} event={event} isOwner={true} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'participating' && (
              <div>
                {participatingEvents.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-hand-thumbs-up display-1 text-muted"></i>
                    <h4 className="mt-3 fw-bold">You're Not Attending Any Events</h4>
                    <p className="text-muted mb-4">Explore and join events in your community</p>
                    <Button href="/" variant="primary" className="fw-bold">
                      <i className="bi bi-search me-2"></i>Explore Events
                    </Button>
                  </div>
                ) : (
                  participatingEvents.map(event => (
                    <EventRow key={event._id} event={event} isOwner={false} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'upcoming' && (
              <div>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-calendar display-1 text-muted"></i>
                    <h4 className="mt-3 fw-bold">No Upcoming Events</h4>
                    <p className="text-muted mb-4">No upcoming events at the moment</p>
                  </div>
                ) : (
                  upcomingEvents.map(event => (
                    <EventRow key={event._id} event={event} isOwner={false} />
                  ))
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default Dashboard
