const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  cancelRsvp,
  addFeedback,
  getEventsInRadius,
  getUpcomingEvents,
  getMyEvents
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(getEvents)
  .post(protect, createEvent);

router
  .route('/radius/:zipcode/:distance')
  .get(getEventsInRadius);

router
  .route('/upcoming')
  .get(getUpcomingEvents);

router
  .route('/myevents')
  .get(getMyEvents);

router
  .route('/:id')
  .get(getEvent)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router
  .route('/:id/rsvp')
  .post(protect, rsvpEvent)
  .delete(protect, cancelRsvp);

router
  .route('/:id/feedback')
  .post(protect, addFeedback);

module.exports = router;
