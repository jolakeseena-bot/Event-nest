import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAttending, setIsAttending] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [rsvpMessage, setRsvpMessage] = useState(null)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/events/${id}`)
      const eventData = response.data.data || response.data
      setEvent(eventData)

      // Check if current user is attending
      const userId = localStorage.getItem('userId')
      if (userId && eventData.participants?.includes(userId)) {
        setIsAttending(true)
      }
    } catch (err) {
      console.error('Error fetching event:', err)
      setError('Unable to load event details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRsvp = async () => {
    try {
      setRsvpLoading(true)
      setRsvpMessage(null)

      // Get userId from localStorage
      const userId = localStorage.getItem('userId')
      if (!userId) {
        setRsvpMessage('Please log in to register for events')
        setRsvpLoading(false)
        return
      }

      if (isAttending) {
        // Cancel RSVP
        await api.delete(`/events/${id}/rsvp`, { data: { userId } })
        setIsAttending(false)
        setRsvpMessage('Successfully cancelled registration!')
      } else {
        // Register for event
        await api.post(`/events/${id}/rsvp`, { userId })
        setIsAttending(true)
        setRsvpMessage('Successfully registered for event!')
      }

      // Refresh event data
      await fetchEvent()
    } catch (err) {
      console.error('RSVP error:', err)
      setRsvpMessage(err.response?.data?.message || 'Failed to update registration')
    } finally {
      setRsvpLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryBadgeClass = (category) => {
    const categoryMap = {
      'Health': 'health',
      'Environment': 'environment',
      'Education': 'education',
      'Community': 'community',
      'Other': 'other'
    }
    return categoryMap[category] || 'other'
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error || 'Event not found'}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Events
        </button>
      </div>
    )
  }

  const participantCount = event.participants?.length || 0
  const capacityPercent = event.maxAttendees 
    ? Math.round((participantCount / event.maxAttendees) * 100)
    : 0

  return (
    <div className="event-detail py-5">
      <div className="container">
        {/* Back Button */}
        <button
          className="btn btn-outline-secondary mb-4"
          onClick={() => navigate('/')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Events
        </button>

        {/* Event Header with Image */}
        <div className="row mb-4">
          <div className="col-lg-8">
            {/* Event Image */}
            <div className="mb-4">
              <img
                src={event.image || `https://picsum.photos/seed/${event._id}/800/400.jpg`}
                alt={event.title}
                className="img-fluid rounded"
                style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
              />
            </div>

            {/* Event Title & Category */}
            <div className="mb-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <h1 className="h2 fw-bold mb-0">{event.title}</h1>
                <span className={`badge category-badge-${getCategoryBadgeClass(event.category)}`}>
                  <i className="bi bi-tag me-1"></i>
                  {event.category}
                </span>
              </div>
              <p className="text-muted mb-0">
                <i className="bi bi-person me-2"></i>
                Organized by {event.organizer || 'Community Organizer'}
              </p>
            </div>

            {/* Event Details Grid */}
            <div className="row mb-4">
              <div className="col-sm-6 mb-3">
                <div className="info-box p-3 bg-light rounded">
                  <small className="text-muted d-block mb-1">
                    <i className="bi bi-calendar-event me-2"></i>Date & Time
                  </small>
                  <p className="mb-0 fw-500">{formatDate(event.date)}</p>
                </div>
              </div>

              <div className="col-sm-6 mb-3">
                <div className="info-box p-3 bg-light rounded">
                  <small className="text-muted d-block mb-1">
                    <i className="bi bi-geo-alt me-2"></i>Location
                  </small>
                  <p className="mb-0 fw-500">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className="h5 fw-bold mb-3">About This Event</h3>
              <p className="text-muted" style={{ lineHeight: '1.6' }}>
                {event.description}
              </p>
            </div>

            {/* Capacity Info */}
            <div className="mb-4">
              <h3 className="h5 fw-bold mb-3">Attendees</h3>
              <div className="card border-0 bg-light p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>
                    <strong>{participantCount}</strong> registered out of <strong>{event.maxAttendees}</strong>
                  </span>
                  <span className="text-muted small">{capacityPercent}% full</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: `${capacityPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4 sticky-top" style={{ top: '20px' }}>
              {/* RSVP Message */}
              {rsvpMessage && (
                <div className={`alert ${isAttending ? 'alert-success' : 'alert-info'} mb-3`}>
                  <i className={`bi ${isAttending ? 'bi-check-circle' : 'bi-info-circle'} me-2`}></i>
                  {rsvpMessage}
                </div>
              )}

              {/* RSVP Button */}
              <button
                className={`btn ${isAttending ? 'btn-danger' : 'btn-primary'} btn-lg w-100 mb-3 fw-500`}
                onClick={handleRsvp}
                disabled={rsvpLoading}
              >
                {rsvpLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Updating...
                  </>
                ) : isAttending ? (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Cancel Registration
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-2"></i>
                    Register for Event
                  </>
                )}
              </button>

              {/* Event Info Card */}
              <div className="bg-light p-3 rounded">
                <div className="mb-3">
                  <small className="text-muted d-block mb-2">
                    <i className="bi bi-people me-2"></i>Capacity
                  </small>
                  <p className="mb-0">
                    <strong>{participantCount}</strong> / {event.maxAttendees} spots available
                  </p>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block mb-2">
                    <i className="bi bi-tag me-2"></i>Category
                  </small>
                  <p className="mb-0">{event.category}</p>
                </div>

                <div>
                  <small className="text-muted d-block mb-2">
                    <i className="bi bi-calendar me-2"></i>Event Status
                  </small>
                  <p className="mb-0">
                    <span className={`badge ${new Date(event.date) > new Date() ? 'bg-success' : 'bg-secondary'}`}>
                      {new Date(event.date) > new Date() ? 'Upcoming' : 'Past Event'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="row mt-5">
          <div className="col-lg-8">
            <h3 className="h5 fw-bold mb-3">Share This Event</h3>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary btn-sm">
                <i className="bi bi-facebook me-2"></i>Facebook
              </button>
              <button className="btn btn-outline-info btn-sm">
                <i className="bi bi-twitter me-2"></i>Twitter
              </button>
              <button className="btn btn-outline-success btn-sm">
                <i className="bi bi-whatsapp me-2"></i>WhatsApp
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Event link copied!')
                }}
              >
                <i className="bi bi-link-45deg me-2"></i>Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail
