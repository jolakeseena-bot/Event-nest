import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Modal, Badge } from 'react-bootstrap'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useUser } from '../context/UserContext'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'
import { eventsAPI } from '../services/api'
import moment from 'moment'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const CalendarPage = () => {
  const { user } = useUser()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await eventsAPI.getAll()
      const calendarEvents = res.data.data.map(event => ({
        id: event._id,
        title: event.title,
        start: new Date(event.date),
        end: new Date(event.date),
        resource: event
      }))

      setEvents(calendarEvents)
    } catch (err) {
      setError('Failed to fetch events. Please try again later.')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event.resource)
    setShowEventModal(true)
  }

  const getEventStyle = (event) => {
    const eventDate = moment(event.resource.date)
    const now = moment()

    let backgroundColor = '#4361ee' // Default primary color
    if (event.resource.category === 'Environment') backgroundColor = '#3f37c9'
    else if (event.resource.category === 'Education') backgroundColor = '#4895ef'
    else if (event.resource.category === 'Community') backgroundColor = '#4cc9f0'
    else if (event.resource.category === 'Technology') backgroundColor = '#f19c1f'
    else if (event.resource.category === 'Health') backgroundColor = '#f77f00'

    if (now.isAfter(eventDate)) {
      backgroundColor = '#6c757d' // Gray for past events
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
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

  if (loading) return <LoadingSpinner />

  return (
    <div className="bg-light py-5">
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-2">
              <i className="bi bi-calendar3 me-2 text-primary"></i>
              Event Calendar
            </h1>
            <p className="text-muted mb-0">View all events in a beautiful calendar layout</p>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              onClick={fetchEvents}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </Button>
          </div>
        </div>

        {error && <Alert type="danger" message={error} />}

        <Card className="border-0 shadow-lg">
          <Card.Body className="p-4">
            <div style={{ height: '600px' }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleEventClick}
                eventPropGetter={getEventStyle}
                views={['month', 'week', 'day']}
                defaultView="month"
                components={{
                  toolbar: CustomToolbar
                }}
                messages={{
                  next: "Next",
                  previous: "Previous",
                  today: "Today",
                  month: "Month",
                  week: "Week",
                  day: "Day"
                }}
              />
            </div>
          </Card.Body>
        </Card>

        {/* Legend */}
        <Card className="mt-4 border-0 shadow-sm">
          <Card.Body className="p-4">
            <h5 className="fw-bold mb-3">Legend</h5>
            <div className="d-flex flex-wrap gap-3">
              <div className="d-flex align-items-center">
                <div className="rounded me-2" style={{ width: '20px', height: '20px', backgroundColor: '#4361ee' }}></div>
                <span className="fw-600">Health</span>
              </div>
              <div className="d-flex align-items-center">
                <div className="rounded me-2" style={{ width: '20px', height: '20px', backgroundColor: '#3f37c9' }}></div>
                <span className="fw-600">Environment</span>
              </div>
              <div className="d-flex align-items-center">
                <div className="rounded me-2" style={{ width: '20px', height: '20px', backgroundColor: '#4895ef' }}></div>
                <span className="fw-600">Education</span>
              </div>
              <div className="d-flex align-items-center">
                <div className="rounded me-2" style={{ width: '20px', height: '20px', backgroundColor: '#4cc9f0' }}></div>
                <span className="fw-600">Community</span>
              </div>
              <div className="d-flex align-items-center">
                <div className="rounded me-2" style={{ width: '20px', height: '20px', backgroundColor: '#f19c1f' }}></div>
                <span className="fw-600">Technology</span>
              </div>
              <div className="d-flex align-items-center">
                <div className="rounded me-2" style={{ width: '20px', height: '20px', backgroundColor: '#6c757d' }}></div>
                <span className="fw-600">Past Events</span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Event Details Modal */}
      <Modal
        show={showEventModal}
        onHide={() => setShowEventModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            <i className="bi bi-calendar-event me-2 text-primary"></i>
            {selectedEvent?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <div>
              {/* Event Image */}
              {selectedEvent.image && (
                <div className="mb-4">
                  <img
                    src={selectedEvent.image || `https://picsum.photos/seed/${selectedEvent._id}/300/200.jpg`}
                    alt={selectedEvent.title}
                    className="img-fluid rounded shadow-sm"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Event Details */}
              <Row className="mb-3">
                <Col md={6}>
                  <h6 className="text-muted text-uppercase fw-bold mb-2">
                    <i className="bi bi-calendar-event me-1"></i>Category
                  </h6>
                  <Badge bg={getCategoryColor(selectedEvent.category)} className="fs-6 px-3 py-2">
                    {selectedEvent.category}
                  </Badge>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted text-uppercase fw-bold mb-2">
                    <i className="bi bi-clock me-1"></i>Date & Time
                  </h6>
                  <p className="mb-0 fw-bold">
                    {moment(selectedEvent.date).format('dddd, MMMM DD, YYYY [at] h:mm A')}
                  </p>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <h6 className="text-muted text-uppercase fw-bold mb-2">
                    <i className="bi bi-geo-alt me-1"></i>Location
                  </h6>
                  <p className="mb-0">{selectedEvent.location}</p>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted text-uppercase fw-bold mb-2">
                    <i className="bi bi-people me-1"></i>Attendees
                  </h6>
                  <p className="mb-0 fw-bold">
                    {selectedEvent.participants?.length || 0} / {selectedEvent.maxAttendees || 'No limit'}
                  </p>
                </Col>
              </Row>

              {selectedEvent.isVirtual && (
                <div className="mb-3">
                  <h6 className="text-muted text-uppercase fw-bold mb-2">
                    <i className="bi bi-camera-video me-1"></i>Virtual Event
                  </h6>
                  {selectedEvent.meetingLink ? (
                    <Button
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      variant="info"
                      className="fw-bold"
                    >
                      <i className="bi bi-box-arrow-up-right me-2"></i>Join Meeting
                    </Button>
                  ) : (
                    <p className="text-muted mb-0">Meeting link will be shared soon</p>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="mb-3">
                <h6 className="text-muted text-uppercase fw-bold mb-2">
                  <i className="bi bi-file-text me-1"></i>Description
                </h6>
                <p className="text-muted" style={{ lineHeight: '1.6' }}>
                  {selectedEvent.description}
                </p>
              </div>

              {/* Organizer */}
              <div className="mb-3">
                <h6 className="text-muted text-uppercase fw-bold mb-2">
                  <i className="bi bi-person-circle me-1"></i>Organized by
                </h6>
                <p className="mb-0 fw-bold">{selectedEvent.organizer}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowEventModal(false)}
          >
            Close
          </Button>
          {selectedEvent && (
            <Button
              variant="primary"
              href={`/events/${selectedEvent._id}`}
            >
              <i className="bi bi-eye me-1"></i>View Full Details
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}

// Custom toolbar component for better styling
const CustomToolbar = ({ label, onNavigate, onView }) => {
  const navigate = action => {
    onNavigate(action)
  }

  const view = view => {
    onView(view)
  }

  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div className="d-flex align-items-center gap-2">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => navigate('PREV')}
        >
          <i className="bi bi-chevron-left"></i>
        </Button>
        <h4 className="mb-0 fw-bold">{label}</h4>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => navigate('NEXT')}
        >
          <i className="bi bi-chevron-right"></i>
        </Button>
      </div>
      <div className="d-flex gap-2">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => navigate('TODAY')}
        >
          Today
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => view('month')}
        >
          Month
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => view('week')}
        >
          Week
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => view('day')}
        >
          Day
        </Button>
      </div>
    </div>
  )
}

export default CalendarPage
