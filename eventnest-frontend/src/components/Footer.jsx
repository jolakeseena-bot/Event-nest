import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import '../styles/footer.css'

const Footer = () => {
  return (
    <footer className="footer mt-auto">
      <Container>
        <Row>
          <Col md={6}>
            <h5>EventNest</h5>
            <p>
              Connecting communities through events. Discover, create, and join events
              that matter to you.
            </p>
          </Col>
          <Col md={3}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled footer-links">
              <li><a href="/" className="footer-link">Home</a></li>
              <li><a href="/create-event" className="footer-link">Create Event</a></li>
              <li><a href="/dashboard" className="footer-link">My Events</a></li>
            </ul>
          </Col>
          <Col md={3}>
            <h5>Contact Us</h5>
            <ul className="list-unstyled footer-contact">
              <li><i className="bi bi-envelope me-2"></i> contact@eventnest.com</li>
              <li><i className="bi bi-telephone me-2"></i> (123) 456-7890</li>
            </ul>
          </Col>
        </Row>
        <hr className="footer-hr" />
        <Row>
          <Col className="text-center">
            <p className="mb-0 footer-copyright">&copy; {new Date().getFullYear()} EventNest. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer