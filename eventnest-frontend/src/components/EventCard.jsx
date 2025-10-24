import React, { useState } from 'react'
import { Card, Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import moment from 'moment'

const EventCard = ({ event }) => {
  const [isHovered, setIsHovered] = useState(false)
  const eventDate = moment(event.date)
  const formattedDate = eventDate.format('MMM DD, YYYY')
  const formattedTime = eventDate.format('h:mm A')
  const isUpcoming = eventDate.isAfter(moment())
  
  const getCategoryColor = (category) => {
    const colors = {
      'Health': 'success',
      'Environment': 'primary',
      'Education': 'info',
      'Community': 'warning',
      'Technology': 'danger',
      'Other': 'secondary'
    }
    return colors[category] || 'secondary'
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'Health': 'heart-fill',
      'Environment': 'tree-fill',
      'Education': 'book-fill',
      'Community': 'people-fill',
      'Technology': 'cpu-fill',
      'Other': 'tag-fill'
    }
    return icons[category] || 'tag-fill'
  }

  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{isUpcoming ? 'Upcoming Event' : 'Past Event'}</Tooltip>}
    >
      <Card 
        className="event-card h-100 shadow-sm border-0 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
      >
        <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
          <Card.Img 
            variant="top" 
            src={event.image || `https://picsum.photos/seed/${event._id}/400/200.jpg?blur=2`} 
            alt={event.title}
            style={{ 
              height: '100%',
              objectFit: 'cover',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease'
            }}
          />
          
          {/* Status Badge */}
          <div className="position-absolute top-0 end-0 p-2">
            <Badge 
              bg={getCategoryColor(event.category)} 
              className="shadow-sm"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.7rem' }}
            >
              <i className={`bi bi-${getCategoryIcon(event.category)} me-1`}></i>
              {event.category}
            </Badge>
          </div>

          {/* Date Badge */}
          <div className="position-absolute bottom-0 start-0 p-2">
            <div 
              className="text-center text-white"
              style={{
                background: 'rgba(67, 97, 238, 0.95)',
                borderRadius: '0.35rem',
                padding: '0.5rem 0.7rem',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', lineHeight: '1' }}>
                {eventDate.format('DD')}
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                {eventDate.format('MMM')}
              </div>
            </div>
          </div>

          {/* Virtual Event Label */}
          {event.isVirtual && (
            <div className="position-absolute top-0 start-0 p-2">
              <Badge bg="info" className="shadow-sm">
                <i className="bi bi-camera-video me-1"></i>Virtual
              </Badge>
            </div>
          )}

          {/* Attendee Count Overlay */}
          <div className="position-absolute bottom-0 end-0 p-2">
            <div 
              className="text-white text-center"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '0.35rem',
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem',
                backdropFilter: 'blur(5px)'
              }}
            >
              <i className="bi bi-people-fill me-1"></i>
              {event.participants?.length || 0} attending
            </div>
          </div>
        </div>

        <Card.Body className="d-flex flex-column p-3">
          {/* Title */}
          <Card.Title 
            className="mb-2 fw-bold text-dark"
            style={{
              fontSize: '1rem',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {event.title}
          </Card.Title>

          {/* Organizer */}
          <Card.Subtitle className="mb-3 text-muted" style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-person-circle me-1"></i>
            {event.organizer}
          </Card.Subtitle>

          {/* Description */}
          <Card.Text 
            className="flex-grow-1 text-muted small"
            style={{
              fontSize: '0.9rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}
          >
            {event.description}
          </Card.Text>

          {/* Location & Time */}
          <div className="mb-3 pb-2 border-bottom">
            <small className="text-muted d-block mb-1">
              <i className="bi bi-geo-alt me-1"></i>
              {event.location?.length > 25 ? `${event.location.substring(0, 25)}...` : event.location}
            </small>
            <small className="text-muted d-block">
              <i className="bi bi-clock me-1"></i>
              {formattedTime}
            </small>
          </div>

          {/* Button */}
          <Button 
            as={Link} 
            to={`/events/${event._id}`} 
            variant="primary" 
            size="sm"
            className="w-100 fw-bold"
            style={{ transition: 'all 0.2s ease' }}
          >
            <i className="bi bi-arrow-right me-1"></i>
            View Details
          </Button>
        </Card.Body>
      </Card>
    </OverlayTrigger>
  )
}

export default EventCard
