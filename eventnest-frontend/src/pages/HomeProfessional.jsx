import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import '../styles/home-professional.css'

const HomeProfessional = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const categories = ['All', 'Health', 'Environment', 'Education', 'Community', 'Technology', 'Other']

  useEffect(() => {
    loadEvents()
  }, [search, category])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category && category !== 'All') params.append('category', category)

      const response = await api.get(`/events?${params}`)
      setEvents(response.data.data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = (participants, maxAttendees) => {
    return Math.round(((participants || 0) / (maxAttendees || 100)) * 100)
  }

  const getCapacityStatus = (percentage) => {
    if (percentage === 100) return 'Full'
    if (percentage >= 80) return 'Almost full'
    if (percentage >= 50) return 'Half full'
    return `${percentage}% filled`
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Discover & Create Events</h1>
          <p className="hero-subtitle">
            Find amazing events happening around you or create your own to connect with people who share your interests.
          </p>
          <div className="hero-cta">
            <Link to="/create-event" className="btn btn-primary btn-lg">
              <i className="bi bi-plus-lg"></i>
              Create Event
            </Link>
            <button className="btn btn-secondary btn-lg" onClick={() => window.scrollTo(0, 500)}>
              <i className="bi bi-arrow-down"></i>
              Explore
            </button>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search events by name, location, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat === 'All' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-section">
        {loading ? (
          <div className="events-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton skeleton-card"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-search"></i>
            <h3>No events found</h3>
            <p>Try adjusting your search filters or create an event yourself</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event, index) => (
              <article key={event._id} className="event-card" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="event-image">
                  <img
                    src={event.image || `https://picsum.photos/seed/${event._id}/400/250.jpg`}
                    alt={event.title}
                  />
                  <span className="event-badge">{event.category}</span>
                </div>

                <div className="event-content">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">{event.description}</p>

                  <div className="event-meta">
                    <div className="meta-item">
                      <i className="bi bi-calendar3"></i>
                      <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="meta-item">
                      <i className="bi bi-geo-alt"></i>
                      <span>{event.location}</span>
                    </div>
                    <div className="meta-item">
                      <i className="bi bi-people"></i>
                      <span>{event.participants?.length || 0} attending</span>
                    </div>
                  </div>

                  <div className="event-capacity">
                    <div className="capacity-label">
                      <span>Capacity</span>
                      <span>{getCapacityStatus(getProgressPercentage(event.participants?.length, event.maxAttendees))}</span>
                    </div>
                    <div className="capacity-bar">
                      <div
                        className="capacity-fill"
                        style={{
                          width: `${getProgressPercentage(event.participants?.length, event.maxAttendees)}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="event-footer">
                    <Link to={`/events/${event._id}`} className="event-link">
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HomeProfessional
