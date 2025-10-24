import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const CATEGORIES = ['Health', 'Environment', 'Education', 'Community', 'Other']

export default function CreateEvent() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '10:00',
    category: 'Other',
    capacity: 100
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Event title is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Event description is required')
      return false
    }
    if (!formData.date) {
      setError('Event date is required')
      return false
    }
    if (!formData.location.trim()) {
      setError('Event location is required')
      return false
    }
    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      setError('Event capacity must be greater than 0')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.time}:00`)
      
      const eventPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: eventDateTime.toISOString(),
        location: formData.location.trim(),
        category: formData.category,
        capacity: parseInt(formData.capacity)
      }

      await api.post('/events', eventPayload)
      setSuccess('Event created successfully! Redirecting...')
      
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      console.error('Error creating event:', err)
      setError(
        err.response?.data?.message || 
        'Failed to create event. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className="h2 fw-bold mb-2">
              <i className="bi bi-calendar-plus me-2"></i>
              Create New Event
            </h1>
            <p className="text-muted">
              Share your event with the community
            </p>
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

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle me-2"></i>
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Title */}
            <div className="mb-3">
              <label htmlFor="title" className="form-label fw-500">
                Event Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                disabled={loading}
                maxLength="100"
              />
              <small className="form-text text-muted">
                {formData.title.length}/100 characters
              </small>
            </div>

            {/* Description */}
            <div className="mb-3">
              <label htmlFor="description" className="form-label fw-500">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control form-control-lg"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe what your event is about"
                disabled={loading}
                maxLength="500"
              ></textarea>
              <small className="form-text text-muted">
                {formData.description.length}/500 characters
              </small>
            </div>

            {/* Date & Time Row */}
            <div className="row">
              <div className="col-sm-6 mb-3">
                <label htmlFor="date" className="form-label fw-500">
                  Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control form-control-lg"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  disabled={loading}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="col-sm-6 mb-3">
                <label htmlFor="time" className="form-label fw-500">
                  Time <span className="text-danger">*</span>
                </label>
                <input
                  type="time"
                  className="form-control form-control-lg"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Location */}
            <div className="mb-3">
              <label htmlFor="location" className="form-label fw-500">
                Location <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, venue, or address"
                disabled={loading}
              />
            </div>

            {/* Category & Capacity Row */}
            <div className="row">
              <div className="col-sm-6 mb-3">
                <label htmlFor="category" className="form-label fw-500">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="col-sm-6 mb-3">
                <label htmlFor="capacity" className="form-label fw-500">
                  Capacity <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Max participants"
                  min="1"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="d-grid gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg fw-500"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Event
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-lg"
                onClick={() => navigate('/')}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
