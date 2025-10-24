import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import '../styles/home-modern.css'

const Home = () => {
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [bookmarks, setBookmarks] = useState(JSON.parse(localStorage.getItem('bookmarks') || '[]'))

  const categories = ['Health', 'Environment', 'Education', 'Community', 'Technology', 'Other']

  useEffect(() => {
    loadEvents()
  }, [page, searchTerm, category])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (category) params.append('category', category)
      params.append('page', page)

      const response = await api.get(`/events?${params}`)
      setEvents(response.data.data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = (eventId) => {
    let updatedBookmarks
    if (bookmarks.includes(eventId)) {
      updatedBookmarks = bookmarks.filter(id => id !== eventId)
    } else {
      updatedBookmarks = [...bookmarks, eventId]
    }
    setBookmarks(updatedBookmarks)
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks))
  }

  const isBookmarked = (eventId) => bookmarks.includes(eventId)

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section animate-fade-in">
        <div className="hero-content">
          <div className="hero-glow"></div>
          <h1 className="hero-title gradient-text">
            Discover Amazing Events
          </h1>
          <p className="hero-subtitle">
            Connect with people, create memories, and experience what you love
          </p>
          <Link to="/create-event" className="btn btn-primary btn-lg">
            <i className="bi bi-plus-circle"></i>
            Create Your Event
          </Link>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="search-section animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="search-container">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search events by name or description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="category-filter">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-section">
        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <i className="bi bi-search"></i>
            <h3>No Events Found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event, index) => (
              <div
                key={event._id}
                className="event-card animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="event-image">
                  <img
                    src={event.image || `https://picsum.photos/seed/${event._id}/400/250.jpg`}
                    alt={event.title}
                  />
                  <div className="event-category">
                    <span className="badge badge-cyan">{event.category}</span>
                  </div>
                  <button
                    className="bookmark-btn"
                    onClick={() => toggleBookmark(event._id)}
                    title={isBookmarked(event._id) ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    <i className={`bi ${isBookmarked(event._id) ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
                  </button>
                </div>

                <div className="event-info">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">
                    {event.description.substring(0, 80)}...
                  </p>

                  <div className="event-details">
                    <div className="detail-item">
                      <i className="bi bi-calendar-event"></i>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <i className="bi bi-geo-alt"></i>
                      <span>{event.location}</span>
                    </div>
                    <div className="detail-item">
                      <i className="bi bi-people"></i>
                      <span>{event.participants?.length || 0} attending</span>
                    </div>
                  </div>

                  <div className="event-footer">
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
                    <Link to={`/events/${event._id}`} className="btn btn-primary btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
