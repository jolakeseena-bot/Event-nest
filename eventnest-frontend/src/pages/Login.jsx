import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import '../styles/auth.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validated, setValidated] = useState(false)

  const { login, user } = useUser()
  const location = useLocation()
  const navigate = useNavigate()

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget

    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await login(email, password)

      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          {/* Logo Section */}
          <div className="auth-logo-section">
            <div className="auth-logo">
              <i className="bi bi-calendar-event"></i>
            </div>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your EventNest account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="auth-alert auth-alert-error">
              <i className="bi bi-exclamation-triangle-fill"></i>
              <div>{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Email Field */}
            <div className="auth-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="auth-form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="auth-form-footer">
              <div className="remember-me">
                <input type="checkbox" id="remember" className="checkbox-input" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="#" className="auth-link">Forgot Password?</Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <span className="btn-loading">
                  <i className="bi bi-hourglass-split"></i>
                  Signing In...
                </span>
              ) : (
                <span className="btn-loading">
                  <i className="bi bi-box-arrow-in-right"></i>
                  Sign In
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>New to EventNest?</span>
          </div>

          {/* Sign Up Link */}
          <div className="auth-toggle">
            <Link to="/register" className="auth-link">
              Create an account now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
