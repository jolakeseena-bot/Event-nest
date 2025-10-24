import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Badge, Alert as BsAlert, Form, Modal, ProgressBar, Tooltip, OverlayTrigger } from 'react-bootstrap'
import { useUser } from '../context/UserContext'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'
import { eventsAPI } from '../services/api'
import moment from 'moment'

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useUser()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAttending, setIsAttending] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState('success')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' })
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const res = await eventsAPI.getById(id)
      setEvent(res.data.data)
      
      if (user && res.data.data.participants.some(p => p._id === user._id)) {
        setIsAttending(true)
      }
    } catch (err) {
      setError('Unable to load event details. Please try again.')
      console.error('Error fetching event:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRsvp = async () => {
    if (!token) {
      navigate('/login', { state: { from: `/events/${id}` } })
      return
    }

    try {
      setRsvpLoading(true)
      await eventsAPI.rsvp(id)
      setIsAttending(true)
      setAlertMessage('Successfully registered for this event!')
      setAlertType('success')
      setShowAlert(true)
      fetchEvent()
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to register for event.'
      setAlertMessage(message)
      setAlertType('danger')
      setShowAlert(true)
    } finally {
      setRsvpLoading(false)
    }
  }

  const handleCancelRsvp = async () => {
    try {
      setRsvpLoading(true)
      await eventsAPI.cancelRsvp(id)
      setIsAttending(false)
      setAlertMessage('Registration cancelled successfully.')
      setAlertType('info')
      setShowAlert(true)
      fetchEvent()
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to cancel registration.'
      setAlertMessage(message)
      setAlertType('danger')
      setShowAlert(true)
    } finally {
      setRsvpLoading(false)
    }
  }

  const handleFeedbackSubmit = async () => {
    if (!feedbackForm.rating) {
      alert('Please select a rating')
      return
    }

    try {
      setFeedbackLoading(true)
      await eventsAPI.addFeedback(id, {
        rating: feedbackForm.rating,
        comment: feedbackForm.comment
      })
      setAlertMessage('Your feedback has been submitted!')
      setAlertType('success')
      setShowAlert(true)
      setShowFeedbackModal(false)
      setFeedbackForm({ rating: 5, comment: '' })
      fetchEvent()
    } catch (err) {
      setAlertMessage('Failed to submit feedback.')
      setAlertType('danger')
      setShowAlert(true)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const isEventOwner = user && event && user._id === event.user._id
  const isEventPassed = event && moment(event.date).isBefore(moment())

  const formatDate = (dateString) => {
    return moment(dateString).format('dddd, MMMM DD, YYYY [at] h:mm A')
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

  const calculateAverageRating = () => {
    if (!event?.feedback || event.feedback.length === 0) return 0
    const avg = event.feedback.reduce((sum, f) => sum + f.rating, 0) / event.feedback.length
    return avg.toFixed(1)
  }

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <i key={i} className={`bi bi-star${i < rating ? '-fill' : ''}`} style={{ color: i < rating ? '#ffc107' : '#ddd' }}></i>
    ))
  }

  if (loading) return <LoadingSpinner />
  if (error) return <Container className="py-5"><Alert type="danger" message={error} /></Container>
  if (!event) return <Container className="py-5"><Alert type="danger" message="Event not found" /></Container>

  return (
    <div>
      <Container className="py-5">
        {showAlert && (
          <BsAlert 
            variant={alertType} 
            onClose={() => setShowAlert(false)} 
            dismissible
            className="mb-4"
          >
            {alertMessage}
          </BsAlert>
        )}

        <Row className="g-4">
          <Col lg={8}>
            {/* Event Image */}
            <div className="mb-4 rounded-3 overflow-hidden shadow-sm" style={{ height: '400px' }}>
              <img 
                src={event.image || `https://picsum.photos/seed/${event._id}/1200/400.jpg`}
                alt={event.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Event Title & Meta */}
            <div className="mb-4">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div>
                  <Badge bg={getCategoryColor(event.category)} className="mb-3">
                    <i className={`bi bi-${getCategoryIcon(event.category)} me-1`}></i>
                    {event.category}
                  </Badge>
                  <h1 className="fw-bold mb-2">{event.title}</h1>
                  <p className="text-muted mb-0">
                    <i className="bi bi-person-circle me-2"></i>
                    Organized by <strong>{event.organizer}</strong>
                  </p>
                </div>
                <div className="text-end">
                  <div className="event-date d-inline-block text-center bg-primary text-white rounded p-3">
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', lineHeight: '1' }}>
                      {moment(event.date).format('DD')}
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      {moment(event.date).format('MMM')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details Tabs */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-3">
                  <i className="bi bi-info-circle me-2 text-primary"></i>Event Details
                </h4>
                <hr />

                <Row className="mb-4">
                  <Col md={6} className="mb-3 mb-md-0">
                    <h6 className="text-muted text-uppercase fw-bold mb-2">
                      <i className="bi bi-calendar-event me-2"></i>Date & Time
                    </h6>
                    <p className="mb-0">{formatDate(event.date)}</p>
                  </Col>
                  <Col md={6}>
                    <h6 className="text-muted text-uppercase fw-bold mb-2">
                      <i className="bi bi-geo-alt me-2"></i>Location
                    </h6>
                    <p className="mb-0">{event.location}</p>
                  </Col>
                </Row>

                <Row>
                  <Col md={6} className="mb-3 mb-md-0">
                    <h6 className="text-muted text-uppercase fw-bold mb-2">
                      <i className="bi bi-people me-2"></i>Attendees
                    </h6>
                    <p className="mb-0">{event.participants?.length || 0} / {event.maxAttendees || 'Unlimited'}</p>
                  </Col>
                  <Col md={6}>
                    <h6 className="text-muted text-uppercase fw-bold mb-2">
                      <i className="bi bi-tag me-2"></i>Status
                    </h6>
                    <Badge bg={isEventPassed ? 'secondary' : 'success'} className="fs-6">
                      {isEventPassed ? 'Event Completed' : 'Upcoming'}
                    </Badge>
                  </Col>
                </Row>

                {event.isVirtual && (
                  <div className="mt-4 pt-4 border-top">
                    <h6 className="text-muted text-uppercase fw-bold mb-2">
                      <i className="bi bi-camera-video me-2"></i>Virtual Meeting
                    </h6>
                    {event.meetingLink ? (
                      <Button 
                        href={event.meetingLink} 
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
              </Card.Body>
            </Card>

            {/* Description */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-3">
                  <i className="bi bi-file-text me-2 text-primary"></i>Description
                </h4>
                <hr />
                <p className="text-muted" style={{ lineHeight: '1.8' }}>
                  {event.description}
                </p>
              </Card.Body>
            </Card>

            {/* Attendees */}
            {event.participants && event.participants.length > 0 && (
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h4 className="fw-bold mb-3">
                    <i className="bi bi-people-fill me-2 text-primary"></i>Attendees ({event.participants.length})
                  </h4>
                  <hr />
                  <div className="d-flex flex-wrap gap-2">
                    {event.participants.slice(0, 10).map(participant => (
                      <OverlayTrigger
                        key={participant._id}
                        placement="top"
                        overlay={<Tooltip>{participant.name}</Tooltip>}
                      >
                        <div 
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                      </OverlayTrigger>
                    ))}
                    {event.participants.length > 10 && (
                      <div 
                        className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', fontSize: '0.75rem', fontWeight: 'bold' }}
                      >
                        +{event.participants.length - 10}
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Feedback Section */}
            {event.feedback && event.feedback.length > 0 && (
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold mb-0">
                      <i className="bi bi-chat-left-quote me-2 text-primary"></i>Event Reviews
                    </h4>
                    <div className="text-center">
                      <div style={{ fontSize: '1.5rem', color: '#ffc107' }}>
                        {getRatingStars(Math.round(calculateAverageRating()))}
                      </div>
                      <small className="text-muted">{calculateAverageRating()} ({event.feedback.length} reviews)</small>
                    </div>
                  </div>
                  <hr />
                  <div className="space-y-3">
                    {event.feedback.slice(0, 5).map((review, idx) => (
                      <div key={idx} className="pb-3" style={{ borderBottom: idx < Math.min(4, event.feedback.length - 1) ? '1px solid #e9ecef' : 'none' }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <strong>{review.user?.name || 'Anonymous'}</strong>
                          <div style={{ color: '#ffc107' }}>
                            {getRatingStars(review.rating)}
                          </div>
                        </div>
                        {review.comment && <p className="text-muted small mb-0">{review.comment}</p>}
                        <small className="text-secondary">{moment(review.createdAt).fromNow()}</small>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Event Actions</h5>

                {isEventOwner ? (
                  <div className="d-grid gap-2">
                    <Button 
                      as={Link} 
                      to={`/edit-event/${event._id}`} 
                      variant="primary"
                      className="fw-bold"
                    >
                      <i className="bi bi-pencil-square me-2"></i>Edit Event
                    </Button>
                    <Button 
                      variant="outline-danger"
                      className="fw-bold"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this event?')) {
                          try {
                            await eventsAPI.delete(id)
                            navigate('/')
                          } catch (err) {
                            setAlertMessage('Failed to delete event.')
                            setAlertType('danger')
                            setShowAlert(true)
                          }
                        }
                      }}
                    >
                      <i className="bi bi-trash me-2"></i>Delete Event
                    </Button>
                  </div>
                ) : (
                  <div className="d-grid gap-2">
                    {isAttending ? (
                      <Button 
                        variant="outline-danger" 
                        onClick={handleCancelRsvp}
                        disabled={rsvpLoading}
                        className="fw-bold"
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        {rsvpLoading ? 'Cancelling...' : 'Cancel Registration'}
                      </Button>
                    ) : (
                      <Button 
                        variant="primary"
                        onClick={handleRsvp}
                        disabled={rsvpLoading}
                        className="fw-bold"
                        size="lg"
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        {rsvpLoading ? 'Registering...' : 'Register for Event'}
                      </Button>
                    )}

                    {isEventPassed && isAttending && (
                      <Button 
                        variant="outline-primary"
                        onClick={() => setShowFeedbackModal(true)}
                        className="fw-bold"
                      >
                        <i className="bi bi-star me-2"></i>Leave Review
                      </Button>
                    )}
                  </div>
                )}

                <hr className="my-4" />

                <h6 className="text-muted text-uppercase fw-bold mb-3">Event Information</h6>
                <div className="space-y-3">
                  <div>
                    <small className="text-muted d-block mb-1">Category</small>
                    <Badge bg={getCategoryColor(event.category)}>{event.category}</Badge>
                  </div>
                  <div>
                    <small className="text-muted d-block mb-1">Capacity</small>
                    <div>
                      <small className="fw-bold">{event.participants?.length || 0} / {event.maxAttendees || '∞'}</small>
                    </div>
                    {event.maxAttendees && (
                      <ProgressBar 
                        now={Math.round((event.participants?.length || 0) / event.maxAttendees * 100)} 
                        className="mt-2"
                        style={{ height: '8px' }}
                      />
                    )}
                  </div>
                  {event.tags && event.tags.length > 0 && (
                    <div>
                      <small className="text-muted d-block mb-2">Tags</small>
                      <div className="d-flex flex-wrap gap-1">
                        {event.tags.map((tag, idx) => (
                          <Badge key={idx} bg="light" text="dark">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Feedback Modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Leave Your Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold mb-3">Rate this event</Form.Label>
              <div>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    style={{ fontSize: '2rem', cursor: 'pointer', color: star <= feedbackForm.rating ? '#ffc107' : '#ddd', marginRight: '0.5rem' }}
                  >
                    <i className="bi bi-star-fill"></i>
                  </span>
                ))}
              </div>
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-bold mb-2">Your Comment (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Share your experience..."
                value={feedbackForm.comment}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                maxLength="200"
              />
              <small className="text-muted">{feedbackForm.comment.length}/200</small>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleFeedbackSubmit}
            disabled={feedbackLoading}
            className="fw-bold"
          >
            {feedbackLoading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EventDetail
