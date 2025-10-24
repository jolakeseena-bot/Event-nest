import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { Spinner } from 'react-bootstrap'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useUser()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" state={{ from: location }} replace />
}

export default PrivateRoute