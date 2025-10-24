import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import '../styles/bookmarks.css'

const Bookmarks = () => {
  const [bookmarkedEvents, setBookmarkedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadBookmarkedEvents()
  }, [])

  const loadBookmarkedEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const bookmarkIds = JSON.parse(localStorage.getItem('bookmarks') || '[]')
      
      if (bookmarkIds.length === 0) {
        setBookmarkedEvents([])
        setLoading(false)
        return
      }

      const response = await api.get('/events')
      const allEvents = response.data.data || []
      
      const bookmarked = allEvents.filter(event => bookmarkIds.includes(event._id))
      setBookmarkedEvents(bookmarked)
    } catch (err) {
      console.error('Error loading bookmarks:', err)
      setError('Failed to load bookmarked events')
    } finally {
      setLoading(false)
    }
  }

  const removeBookmark = (eventId) => {
    const bookmarkIds = JSON.parse(localStorage.getItem('bookmarks') || '[]')
    const updated = bookmarkIds.filter(id => id !== eventId)
    localStorage.setItem('bookmarks', JSON.stringify(updated))
    setBookmarkedEvents(prev => prev.filter(e => e._id !== eventId))
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

  if (loading) {
    return (
      <div className="bookmarks-container">
        <div className="loading-skeleton">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bookmarks-container">
      <div className="bookmarks-header animate-slide-down">
        <div>
          <h1 className="bookmarks-title">
            <i className="bi bi-bookmark-fill"></i>
            Saved Events
          </h1>
          <p className="bookmarks-subtitle">Your collection of favorite events</p>
        </div>
        <div className="bookmark-count badge badge-primary">
          {bookmarkedEvents.length} Event{bookmarkedEvents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {error && (
        <div className="alert alert-error animate-slide-down">
          <i className="bi bi-exclamation-circle"></i>
          {error}
        </div>
      )}

      {bookmarkedEvents.length === 0 ? (
        <div className="empty-state animate-fade-in">
          <div className="empty-icon">
            <i className="bi bi-bookmark"></i>
          </div>
          <h3>No Saved Events Yet</h3>
          <p>Start bookmarking events to save them for later</p>
          <Link to="/" className="btn btn-primary">
            <i className="bi bi-search"></i>
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="bookmarks-grid">
          {bookmarkedEvents.map((event, index) => (
            <div
              key={event._id}
              className="bookmark-card animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="card-image-wrapper">
                <img
                  src={event.image || `https://picsum.photos/seed/${event._id}/400/250.jpg`}
                  alt={event.title}
                  className="card-image"
                />
                <button
                  className="bookmark-remove-btn"
                  onClick={() => removeBookmark(event._id)}
                  title="Remove from bookmarks"
                >
                  <i className="bi bi-bookmark-fill"></i>
                </button>
              </div>

              <div className="card-content">
                <div className="card-header">
                  <h3 className="card-title">{event.title}</h3>
                  <span className={`badge badge-${
                    event.category === 'Health' ? 'primary' :
                    event.category === 'Environment' ? 'success' :
                    event.category === 'Education' ? 'info' :
                    'secondary'
                  }`}>
                    {event.category}
                  </span>
                </div>

                <p className="card-description">{event.description.substring(0, 100)}...</p>

                <div className="card-meta">
                  <div className="meta-item">
                    <i className="bi bi-calendar-event"></i>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="meta-item">
                    <i className="bi bi-clock"></i>
                    <span>{formatTime(event.date)}</span>
                  </div>
                  <div className="meta-item">
                    <i className="bi bi-geo-alt"></i>
                    <span>{event.location}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="capacity-info">
                    <div className="capacity-bar">
                      <div
                        className="capacity-fill"
                        style={{
                          width: `${Math.round(
                            ((event.participants?.length || 0) / (event.maxAttendees || 100)) * 100
                          )}%`
                        }}
                      ></div>
                    </div>
                    <small className="capacity-text">
                      {event.participants?.length || 0} / {event.maxAttendees || 100} attendees
                    </small>
                  </div>

                  <Link
                    to={`/events/${event._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookmarks
