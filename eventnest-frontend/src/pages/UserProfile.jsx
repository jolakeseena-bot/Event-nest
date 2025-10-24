import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import api from '../services/api'
import '../styles/profile.css'

const UserProfile = () => {
  const navigate = useNavigate()
  const { token } = useUser()
  const [profile, setProfile] = useState({
    id: '',
    name: '',
    email: '',
    bio: '',
    preferences: [],
    profileImage: null
  })
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState({
    created: 0,
    attending: 0
  })
  const fileInputRef = React.useRef(null)

  const categories = ['Health', 'Environment', 'Education', 'Community', 'Technology', 'Other']

  // Load profile from backend on mount
  useEffect(() => {
    loadProfile()
  }, [token, navigate])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      if (!token) {
        navigate('/login')
        return
      }

      const response = await api.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        const user = response.data.user
        const preferencesArray = Array.isArray(user.preferences?.categories) 
          ? user.preferences.categories 
          : Array.isArray(user.preferences) 
            ? user.preferences 
            : []
        
        setProfile({
          ...user,
          preferences: preferencesArray
        })

        // Fetch events data for stats
        try {
          const eventsResponse = await api.get('/events', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          const allEvents = eventsResponse.data.data || []
          const userId = localStorage.getItem('userId')
          
          console.log('=== UserProfile Stats Debug ===')
          console.log('Total events:', allEvents.length)
          console.log('Current user ID:', userId)
          allEvents.forEach((event, idx) => {
            console.log(`Event ${idx}: ID=${event._id}, Creator=${event.user}, Title=${event.title}`)
          })
          
          if (!userId) {
            console.warn('User ID not found in localStorage')
            setStats({ created: 0, attending: 0 })
            return
          }
          
          // Count created events - compare user ID with event creator
          const created = allEvents.filter(event => {
            const match = event.user && event.user.toString() === userId.toString()
            console.log(`  Event ${event._id}: user=${event.user}, userId=${userId}, match=${match}`)
            return match
          })
          
          // Count attending events - check if user is in participants array
          const attending = allEvents.filter(event => 
            event.participants && event.participants.some(p => p.toString() === userId.toString())
          )

          console.log('Created count:', created.length)
          console.log('Attending count:', attending.length)

          setStats({
            created: created.length,
            attending: attending.length
          })
        } catch (err) {
          console.error('Error loading events stats:', err)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setMessage('Failed to load profile')
      if (error.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const togglePreference = (category) => {
    setProfile(prev => {
      const prefs = Array.isArray(prev.preferences) ? prev.preferences : []
      return {
        ...prev,
        preferences: prefs.includes(category)
          ? prefs.filter(c => c !== category)
          : [...prefs, category]
      }
    })
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size should be less than 5MB')
        setTimeout(() => setMessage(null), 3000)
        return
      }

      try {
        setUploading(true)
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64String = reader.result
          
          try {
            const response = await api.post('/auth/upload-profile-image', 
              { imageData: base64String },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            )

            if (response.data.success) {
              setProfile(prev => ({ 
                ...prev, 
                profileImage: response.data.user.profileImage 
              }))
              setMessage('Profile picture updated successfully!')
              setTimeout(() => setMessage(null), 3000)
            }
          } catch (error) {
            console.error('Upload error:', error)
            setMessage('Failed to upload profile picture')
            setTimeout(() => setMessage(null), 3000)
          } finally {
            setUploading(false)
          }
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error processing file:', error)
        setUploading(false)
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.put('/auth/profile',
        {
          name: profile.name,
          bio: profile.bio,
          preferences: {
            categories: profile.preferences,
            notifications: {
              email: true,
              eventReminders: true
            }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.data.success) {
        setMessage('Profile updated successfully!')
        setIsEditing(false)
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage('Failed to update profile')
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="profile-container">
        <div className="profile-login-required animate-fade-in">
          <i className="bi bi-lock"></i>
          <h2>Login Required</h2>
          <p>Please log in to view your profile</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header animate-slide-down">
        <div className="profile-hero">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} className="avatar-image" />
              ) : (
                profile.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            {isEditing && (
              <>
                <button 
                  className="upload-avatar-btn" 
                  type="button" 
                  onClick={triggerFileInput}
                  disabled={uploading}
                >
                  <i className="bi bi-camera-fill"></i>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="avatar-upload-input"
                />
              </>
            )}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{profile.name || 'User'}</h1>
            <p className="profile-role">Event Organizer</p>
          </div>
        </div>
        <button
          className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          <i className={`bi ${isEditing ? 'bi-x' : 'bi-pencil'}`}></i>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'} animate-slide-down`}>
          <i className={`bi ${message.includes('success') ? 'bi-check-circle' : 'bi-exclamation-circle'}`}></i>
          {message}
        </div>
      )}

      <div className="profile-content">
        <form onSubmit={handleSave} className="profile-form animate-fade-in">
          {/* Bio Section */}
          <div className="form-section">
            <h3 className="section-title">About You</h3>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter your full name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                disabled
                placeholder="Your email"
                className="form-input"
              />
              <small className="char-count">Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio || ''}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                className="form-textarea"
                maxLength={500}
              />
              <small className="char-count">
                {(profile.bio || '').length}/500
              </small>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="form-section">
            <h3 className="section-title">Event Preferences</h3>
            <p className="section-description">
              Select the types of events you're interested in
            </p>
            <div className="preferences-grid">
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  className={`preference-btn ${Array.isArray(profile.preferences) && profile.preferences.includes(category) ? 'active' : ''}`}
                  onClick={() => isEditing && togglePreference(category)}
                  disabled={!isEditing}
                >
                  <i className="bi bi-check"></i>
                  {category}
                </button>
              ))}
            </div>
          </div>

          {isEditing && (
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              <i className="bi bi-check-circle"></i>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </form>

        {/* Stats Section */}
        <div className="profile-stats animate-slide-up">
          <h3 className="section-title">Your Activity</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.created}</div>
              <div className="stat-label">Events Created</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.attending}</div>
              <div className="stat-label">Events Attended</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
