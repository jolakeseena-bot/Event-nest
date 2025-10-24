import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import '../styles/auth.css'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validated, setValidated] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const { register, user } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Calculate password strength
  useEffect(() => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }, [password])

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return 'Very Weak'
      case 1: return 'Weak'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Strong'
      case 5: return 'Very Strong'
      default: return ''
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: case 1: return '#dc3545'
      case 2: return '#fd7e14'
      case 3: return '#ffc107'
      case 4: return '#20c997'
      case 5: return '#28a745'
      default: return '#6c757d'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget

    if (form.checkValidity() === false) {
      e.stopPropagation()
      setValidated(true)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Please use a stronger password.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await register({ name, email, password })

      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Registration error:', err)
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
              <i className="bi bi-person-plus"></i>
            </div>
            <h2 className="auth-title">Join EventNest</h2>
            <p className="auth-subtitle">Create your account and start discovering events</p>
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
            {/* Name Field */}
            <div className="auth-form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                required
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="password-strength-container">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: passwordStrength <= 1 ? '#dc3545' : 
                                        passwordStrength === 2 ? '#fd7e14' :
                                        passwordStrength === 3 ? '#ffc107' :
                                        passwordStrength === 4 ? '#20c997' : '#28a745'
                      }}
                    ></div>
                  </div>
                  <span className="strength-text">
                    {passwordStrength === 0 ? 'Very Weak' :
                     passwordStrength === 1 ? 'Weak' :
                     passwordStrength === 2 ? 'Fair' :
                     passwordStrength === 3 ? 'Good' :
                     passwordStrength === 4 ? 'Strong' : 'Very Strong'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="auth-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-group">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <small className="text-danger mt-1 d-block">
                  <i className="bi bi-x-circle me-1"></i>
                  Passwords don't match
                </small>
              )}
            </div>

            {/* Terms & Privacy */}
            <div className="auth-form-group">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="terms"
                  className="checkbox-input"
                  required
                />
                <label htmlFor="terms" style={{ margin: 0 }}>
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>
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
                  Creating Account...
                </span>
              ) : (
                <span className="btn-loading">
                  <i className="bi bi-person-plus"></i>
                  Create Account
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          {/* Sign In Link */}
          <div className="auth-toggle">
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
