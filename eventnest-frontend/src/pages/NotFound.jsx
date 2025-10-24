import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="text-center">
            <Card.Body className="p-5">
              <h1 className="display-1">404</h1>
              <h2>Page Not Found</h2>
              <p className="text-muted">
                The page you are looking for might have been removed, had its name changed, 
                or is temporarily unavailable.
              </p>
              <Button as={Link} to="/" variant="primary">
                Go to Homepage
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default NotFound