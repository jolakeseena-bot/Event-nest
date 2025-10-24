import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import '../styles/dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')

  const [userName, setUserName] = useState(localStorage.getItem('userName') || '')
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(userName)
  const [nameSaveMessage, setNameSaveMessage] = useState(null)

  const [stats, setStats] = useState({
    created: 0,
    attending: 0,
    upcoming: 0,
    totalAttendees: 0
  })

  const [createdEvents, setCreatedEvents] = useState([])
  const [attendingEvents, setAttendingEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('attending')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleSaveName = () => {
    if (tempName.trim().length > 0) {
      localStorage.setItem('userName', tempName)
      setUserName(tempName)
      setIsEditingName(false)
      setNameSaveMessage('Name updated successfully! ✓')
      setTimeout(() => setNameSaveMessage(null), 3000)
    }
  }

  const handleCancelName = () => {
    setTempName(userName)
    setIsEditingName(false)
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all events
      const response = await api.get('/events')
      const allEvents = response.data.data || []

      // Find events created by this user (compare as strings for both)
      const created = allEvents.filter(event => event.user && event.user.toString() === userId.toString())
      
      // Find events user is attending (compare as strings for mixed types)
      const attending = allEvents.filter(event => 
        event.participants && event.participants.some(p => p.toString() === userId.toString())
      )

      // Get upcoming events count
      const now = new Date()
      const upcoming = attending.filter(event => new Date(event.date) > now)

      setCreatedEvents(created)
      setAttendingEvents(attending)
      setStats({
        created: created.length,
        attending: attending.length,
        upcoming: upcoming.length
      })
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      await api.delete(`/events/${eventId}`)
      setCreatedEvents(prev => prev.filter(e => e._id !== eventId))
      setStats(prev => ({ ...prev, created: prev.created - 1 }))
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete event')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isEventUpcoming = (dateString) => {
    return new Date(dateString) > new Date()
  }

  const StatCard = ({ title, value, icon, color }) => (
    <div className="col-md-6 col-lg-3 mb-4">
      <div
        className="card border-0 text-white p-4 rounded-3"
        style={{ background: color, minHeight: '120px' }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="mb-2 opacity-75">{title}</p>
            <h2 className="mb-0 fw-bold">{value}</h2>
          </div>
          <i className={`bi ${icon} display-5 opacity-50`}></i>
        </div>
      </div>
    </div>
  )

  const EventCard = ({ event, isCreated }) => (
    <div className="card event-card border-0 shadow-sm mb-3 overflow-hidden hover-shadow">
      <div className="row g-0 h-100">
        {/* Event Image */}
        <div className="col-md-3">
          <img
            src={event.image || `https://picsum.photos/seed/${event._id}/300/200.jpg`}
            alt={event.title}
            className="img-fluid h-100"
            style={{ objectFit: 'cover', minHeight: '200px' }}
          />
        </div>

        {/* Event Details */}
        <div className="col-md-9">
          <div className="card-body h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 className="card-title fw-bold mb-1">{event.title}</h5>
                <p className="text-muted small mb-0">
                  <i className="bi bi-person me-1"></i>
                  {event.organizer}
                </p>
              </div>
              <span className={`badge bg-${
                event.category === 'Health' ? 'success' :
                event.category === 'Environment' ? 'info' :
                event.category === 'Education' ? 'primary' :
                event.category === 'Community' ? 'warning' :
                'secondary'
              }`}>
                {event.category}
              </span>
            </div>

            <p className="card-text text-muted small mb-3">
              {event.description.substring(0, 100)}...
            </p>

            <div className="row text-muted small mb-3">
              <div className="col-md-4">
                <i className="bi bi-calendar me-2"></i>
                {formatDate(event.date)}
              </div>
              <div className="col-md-4">
                <i className="bi bi-clock me-2"></i>
                {formatTime(event.date)}
              </div>
              <div className="col-md-4">
                <i className="bi bi-geo-alt me-2"></i>
                {event.location}
              </div>
            </div>

            {/* Participants */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="text-muted">Participants</small>
                <small className="text-muted">
                  {event.participants?.length || 0} / {event.maxAttendees || 100}
                </small>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${Math.round(((event.participants?.length || 0) / (event.maxAttendees || 100)) * 100)}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Status Badge and Actions */}
            <div className="d-flex justify-content-between align-items-center">
              <span className={`badge ${isEventUpcoming(event.date) ? 'bg-success' : 'bg-secondary'}`}>
                {isEventUpcoming(event.date) ? 'Upcoming' : 'Past'}
              </span>

              <div className="btn-group btn-group-sm">
                <Link
                  to={`/events/${event._id}`}
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-eye me-1"></i>View
                </Link>

                {isCreated && (
                  <>
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate(`/create-event?edit=${event._id}`)}
                    >
                      <i className="bi bi-pencil me-1"></i>Edit
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleDeleteEvent(event._id)}
                    >
                      <i className="bi bi-trash me-1"></i>Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Profile Card with Name Edit */}
      <div className="card border-0 shadow-sm mb-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              {!isEditingName ? (
                <div className="d-flex align-items-center gap-2">
                  <div>
                    <h2 className="h4 fw-bold mb-1">
                      <i className="bi bi-person-circle me-2" style={{ color: '#2563eb' }}></i>
                      Welcome, {userName || 'Guest User'}! 👋
                    </h2>
                    <p className="text-muted small mb-0">ID: {userId}</p>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setTempName(userName)
                      setIsEditingName(true)
                    }}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
                    Edit Name
                  </button>
                </div>
              ) : (
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="text"
                    className="form-control"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength="50"
                    autoFocus
                  />
                  <button
                    className="btn btn-sm btn-success"
                    onClick={handleSaveName}
                  >
                    <i className="bi bi-check me-1"></i>
                    Save
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={handleCancelName}
                  >
                    Cancel
                  </button>
                </div>
              )}
              {nameSaveMessage && (
                <div className="alert alert-success alert-dismissible fade show mt-3 mb-0" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  {nameSaveMessage}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setNameSaveMessage(null)}
                  ></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="mb-5">
        <h1 className="h2 fw-bold mb-2">
          <i className="bi bi-speedometer2 me-2"></i>
          Your Dashboard
        </h1>
        <p className="text-muted">Manage your events and track your activity</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="row mb-5">
        <StatCard
          title="Events Created"
          value={stats.created}
          icon="bi-calendar-plus"
          color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          title="Events Attending"
          value={stats.attending}
          icon="bi-check-circle"
          color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcoming}
          icon="bi-calendar-event"
          color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="btn-group" role="tablist">
          <button
            className={`btn ${activeTab === 'attending' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('attending')}
          >
            <i className="bi bi-check-circle me-2"></i>
            Events Attending ({attendingEvents.length})
          </button>
          <button
            className={`btn ${activeTab === 'created' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('created')}
          >
            <i className="bi bi-calendar-plus me-2"></i>
            My Events ({createdEvents.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Events Attending Tab */}
        {activeTab === 'attending' && (
          <div className="tab-pane active">
            {attendingEvents.length === 0 ? (
              <div className="card border-0 bg-light p-5 text-center">
                <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                <p className="text-muted mb-0">
                  You're not attending any events yet.
                </p>
                <Link to="/" className="btn btn-primary mt-3">
                  <i className="bi bi-search me-2"></i>
                  Explore Events
                </Link>
              </div>
            ) : (
              <div>
                {attendingEvents.map(event => (
                  <EventCard key={event._id} event={event} isCreated={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Events Tab */}
        {activeTab === 'created' && (
          <div className="tab-pane active">
            {createdEvents.length === 0 ? (
              <div className="card border-0 bg-light p-5 text-center">
                <i className="bi bi-calendar-x display-4 text-muted mb-3"></i>
                <p className="text-muted mb-0">
                  You haven't created any events yet.
                </p>
                <Link to="/create-event" className="btn btn-primary mt-3">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Your First Event
                </Link>
              </div>
            ) : (
              <div>
                {createdEvents.map(event => (
                  <EventCard key={event._id} event={event} isCreated={true} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Event Button (Fixed) */}
      <div className="mt-5 text-center">
        <Link to="/create-event" className="btn btn-lg btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Create New Event
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
