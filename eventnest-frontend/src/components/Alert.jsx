import React from 'react'
import { Alert as BootstrapAlert } from 'react-bootstrap'

const Alert = ({ type, message, onClose }) => {
  return (
    <BootstrapAlert variant={type} onClose={onClose} dismissible>
      {message}
    </BootstrapAlert>
  )
}

export default Alert