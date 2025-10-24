import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { Navbar as BootstrapNavbar, Nav, Container, Button, Dropdown } from 'react-bootstrap'

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const { user, logout, token } = useUser()
  const navigate = useNavigate()
  const [navExpanded, setNavExpanded] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleNavToggle = () => {
    setNavExpanded(!navExpanded)
  }

  const handleNavCollapse = () => {
    setNavExpanded(false)
  }

  return (
    <BootstrapNavbar
      expand="lg"
      sticky="top"
      className="navbar shadow-sm border-bottom"
      onToggle={handleNavToggle}
      expanded={navExpanded}
    >
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" onClick={handleNavCollapse}>
          <strong className="text-gradient h4 mb-0">
            <i className="bi bi-calendar-event me-2"></i>
            EventNest
          </strong>
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={handleNavCollapse}>
              <i className="bi bi-house-door me-1"></i>
              Home
            </Nav.Link>
            {token && (
              <>
                <Nav.Link as={Link} to="/create-event" onClick={handleNavCollapse}>
                  <i className="bi bi-plus-circle me-1"></i>
                  Create Event
                </Nav.Link>
                <Nav.Link as={Link} to="/dashboard" onClick={handleNavCollapse}>
                  <i className="bi bi-calendar-check me-1"></i>
                  My Events
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="align-items-center">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="btn btn-link text-decoration-none p-2 me-2"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <i className="bi bi-sun-fill fs-5"></i>
              ) : (
                <i className="bi bi-moon-fill fs-5"></i>
              )}
            </button>

            {token ? (
              <>
                {/* User Dropdown */}
                <Dropdown align="end">
                  <Dropdown.Toggle
                    as="span"
                    className="d-flex align-items-center text-decoration-none fw-600 cursor-pointer px-3 py-2 rounded-pill"
                    style={{ backgroundColor: 'rgba(var(--primary-color-rgb, 67, 97, 238), 0.1)', color: 'var(--primary-color)' }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle me-2 d-flex align-items-center justify-content-center fw-bold"
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                          color: 'white',
                          fontSize: '0.8rem'
                        }}
                      >
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="d-none d-sm-inline">{user?.name?.split(' ')[0]}</span>
                      <i className="bi bi-chevron-down ms-1"></i>
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow-lg border-0 rounded-3 mt-2">
                    <Dropdown.Header className="border-bottom">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle me-2 d-flex align-items-center justify-content-center fw-bold"
                          style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                            color: 'white'
                          }}
                        >
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="fw-bold">{user?.name}</div>
                          <small className="text-muted">{user?.email}</small>
                        </div>
                      </div>
                    </Dropdown.Header>
                    <Dropdown.Item as={Link} to="/dashboard" onClick={handleNavCollapse}>
                      <i className="bi bi-person-circle me-2"></i>
                      My Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/dashboard" onClick={handleNavCollapse}>
                      <i className="bi bi-calendar-check me-2"></i>
                      My Events
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => { handleLogout(); handleNavCollapse(); }}>
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  onClick={handleNavCollapse}
                  className="fw-600"
                >
                  Login
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="primary"
                  onClick={handleNavCollapse}
                  className="fw-600"
                >
                  Get Started
                </Button>
              </div>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}

export default Navbar
