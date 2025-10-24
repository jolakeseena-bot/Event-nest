import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useTheme } from '../context/ThemeContext'
import '../styles/navbar-professional.css'

const Navbar = () => {
  const { user, logout } = useUser()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return 'G'
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <i className="bi bi-calendar-event"></i>
          <span>EventNest</span>
        </Link>

        {/* Mobile Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <ul className={`navbar-nav ${mobileMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" className="nav-link active">
              Discover
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/bookmarks" className="nav-link">
                  Saved
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* User Menu */}
        <div className="user-menu">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            <i className={`bi bi-${isDark ? 'sun' : 'moon'}`}></i>
          </button>

          {user ? (
            <>
              <Link to="/create-event" className="btn btn-primary btn-sm">
                <i className="bi bi-plus"></i>
                Create
              </Link>
              <div className="user-avatar" title={user.name}>
                {getUserInitials()}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
