import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Container, Row, Col, Form, Button, Card, Alert as BsAlert, Spinner } from 'react-bootstrap'
import { useUser } from '../context/UserContext'
import Alert from '../components/Alert'
import LoadingSpinner from '../components/LoadingSpinner'
import { eventsAPI } from '../services/api'
import moment from 'moment'

const EditEvent = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '10:00',
    category: 'Community',
    maxAttendees: 100,
    isVirtual: false,
    meetingLink: '',
    tags: ''
  })
  const [validated, setValidated] = useState(false)

  const categories = ['Health', 'Environment', 'Education', 'Community', 'Technology', 'Other']

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const res = await eventsAPI.getById(id)
      const event = res.data.data

      // Check if user is the owner
      if (event.user._id !== user._id) {
        setError('You are not authorized to edit this event.')
        return
      }

      const eventDate = moment(event.date)
      setFormData({
        title: event.title,
        description: event.description,
        location: event.location,
        date: eventDate.format('YYYY-MM-DD'),
        time: eventDate.format('HH:mm'),
        category: event.category,
        maxAttendees: event.maxAttendees,
        isVirtual: event.isVirtual,
        meetingLink: event.meetingLink || '',
        tags: event.tags?.join(', ') || ''
      })
    } catch (err) {
      setError('Failed to load event details.')
      console.error('Error fetching event:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget

    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const dateTime = moment(`${formData.date} ${formData.time}`, 'YYYY-MM-DD HH:mm').toISOString()

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        date: dateTime,
        category: formData.category,
        maxAttendees: parseInt(formData.maxAttendees) || 100,
        isVirtual: formData.isVirtual,
        meetingLink: formData.isVirtual ? formData.meetingLink.trim() : '',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      }

      await eventsAPI.update(id, eventData)
      setAlertMessage('Event updated successfully!')
      setShowAlert(true)

      setTimeout(() => {
        navigate(`/events/${id}`)
      }, 1500)
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to update event. Please try again.'
      setError(message)
      console.error('Error updating event:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-5">
                <h1 className="fw-bold mb-2">
                  <i className="bi bi-pencil-square me-2 text-primary"></i>Edit Event
                </h1>
                <p className="text-muted mb-4">Update event details and settings</p>

                {error && <Alert type="danger" message={error} />}
                {showAlert && (
                  <BsAlert variant="success" className="mb-4">
                    <i className="bi bi-check-circle me-2"></i>
                    {alertMessage}
                  </BsAlert>
                )}

                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  {/* Title */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-2">
                      <i className="bi bi-pencil me-2 text-primary"></i>Event Title
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      maxLength="100"
                      size="lg"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid event title.
                    </Form.Control.Feedback>
                    <small className="text-muted">{formData.title.length}/100</small>
                  </Form.Group>

                  {/* Description */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-2">
                      <i className="bi bi-file-text me-2 text-primary"></i>Description
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      maxLength="500"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a description.
                    </Form.Control.Feedback>
                    <small className="text-muted">{formData.description.length}/500</small>
                  </Form.Group>

                  {/* Location */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-2">
                      <i className="bi bi-geo-alt me-2 text-primary"></i>Location
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      size="lg"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a location.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6} className="mb-4">
                      <Form.Group>
                        <Form.Label className="fw-bold mb-2">
                          <i className="bi bi-tag me-2 text-primary"></i>Category
                        </Form.Label>
                        <Form.Select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          size="lg"
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-4">
                      <Form.Group>
                        <Form.Label className="fw-bold mb-2">
                          <i className="bi bi-people me-2 text-primary"></i>Max Attendees
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="maxAttendees"
                          value={formData.maxAttendees}
                          onChange={handleChange}
                          min="1"
                          size="lg"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-4">
                      <Form.Group>
                        <Form.Label className="fw-bold mb-2">
                          <i className="bi bi-calendar-event me-2 text-primary"></i>Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          required
                          size="lg"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-4">
                      <Form.Group>
                        <Form.Label className="fw-bold mb-2">
                          <i className="bi bi-clock me-2 text-primary"></i>Time
                        </Form.Label>
                        <Form.Control
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          size="lg"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Virtual Event */}
                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      name="isVirtual"
                      checked={formData.isVirtual}
                      onChange={handleChange}
                      label={
                        <span>
                          <i className="bi bi-camera-video me-2 text-primary"></i>
                          <strong>This is a virtual event</strong>
                        </span>
                      }
                    />
                  </Form.Group>

                  {formData.isVirtual && (
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold mb-2">
                        <i className="bi bi-link-45deg me-2 text-primary"></i>Meeting Link (Optional)
                      </Form.Label>
                      <Form.Control
                        type="url"
                        name="meetingLink"
                        value={formData.meetingLink}
                        onChange={handleChange}
                        placeholder="https://zoom.us/meeting/..."
                        size="lg"
                      />
                    </Form.Group>
                  )}

                  {/* Tags */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-2">
                      <i className="bi bi-bookmark-fill me-2 text-primary"></i>Tags (Optional)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g., environment, charity, education (comma-separated)"
                      size="lg"
                    />
                  </Form.Group>

                  {/* Submit & Cancel */}
                  <div className="d-grid gap-2 mt-5 pt-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={submitting}
                      className="fw-bold"
                    >
                      {submitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Update Event
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="lg"
                      onClick={() => navigate(`/events/${id}`)}
                      className="fw-bold"
                    >
                      <i className="bi bi-x-circle me-2"></i>Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default EditEvent
