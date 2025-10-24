import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import api from '../services/api'
import '../styles/navbar.css'

const Navbar = () => {
  const { user, logout, token } = useUser()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [userName, setUserName] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (token) {
      loadUserProfile()
    }
  }, [token])

  const loadUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.data.success) {
        setProfileImage(response.data.user.profileImage)
        setUserName(response.data.user.name)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Fallback to localStorage
      setUserName(localStorage.getItem('userName') || 'User')
    }
  }

  const handleLogout = () => {
    logout()
    setProfileImage(null)
    setUserName('')
    navigate('/')
    setIsOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Create Event', path: '/create-event', requiresAuth: true },
    { label: 'Dashboard', path: '/dashboard', requiresAuth: true },
    { label: 'Bookmarks', path: '/bookmarks', requiresAuth: true }
  ]

  return (
    <nav className={`navbar-modern ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo animate-fade-in">
          <span>EventNest</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          <div className="nav-links">
            {navLinks.map(link => (
              (!link.requiresAuth || token) && (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link transition-all ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          <div className="navbar-actions">
            {/* Theme Toggle */}
            <button
              className="theme-toggle-btn transition-all"
              onClick={toggleTheme}
              title="Toggle dark mode"
            >
              <i className={`bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
            </button>

            {/* Auth Buttons */}
            {token ? (
              <div className="user-menu">
                <button 
                  className="user-profile-btn"
                  onClick={() => {
                    navigate('/profile');
                  }}
                  title="Go to Profile"
                  type="button"
                >
                  <div className="user-avatar">
                    {profileImage ? (
                      <img src={profileImage} alt={userName} className="avatar-img" />
                    ) : (
                      userName?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="user-name">{userName || 'User'}</span>
                </button>
                <button className="logout-btn btn btn-sm" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i>
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`hamburger transition-all ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="navbar-mobile animate-slide-down">
          <div className="mobile-nav-links">
            {navLinks.map(link => (
              (!link.requiresAuth || token) && (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          <div className="mobile-nav-footer">
            <button
              className="theme-toggle-mobile"
              onClick={toggleTheme}
            >
              <i className={`bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {token ? (
              <button className="btn btn-primary w-100" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i>
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline w-100">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary w-100">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
