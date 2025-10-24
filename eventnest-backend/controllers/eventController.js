const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get all events
// @route     GET /api/events
// @access    Public
exports.getEvents = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'category', 'location'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource - don't populate user field to keep it as ID for frontend comparison
  query = Event.find(JSON.parse(queryStr));

  // Search functionality
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query = query.or([
      { title: searchRegex },
      { description: searchRegex },
      { organizer: searchRegex }
    ]);
  }

  // Filter by category
  if (req.query.category) {
    query = query.where('category').equals(req.query.category);
  }

  // Filter by location
  if (req.query.location) {
    const locationRegex = new RegExp(req.query.location, 'i');
    query = query.where('location', locationRegex);
  }

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Event.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const events = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: events.length,
    pagination,
    data: events
  });
});

// @desc      Get single event
// @route     GET /api/events/:id
// @access    Public
exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id)
    .populate('user', 'name')
    .populate('participants', 'name email')
    .populate('feedback.user', 'name');

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Calculate average rating
  let avgRating = 0;
  if (event.feedback && event.feedback.length > 0) {
    const totalRating = event.feedback.reduce((sum, item) => sum + item.rating, 0);
    avgRating = totalRating / event.feedback.length;
  }

  res.status(200).json({
    success: true,
    data: {
      ...event.toObject(),
      avgRating: avgRating.toFixed(1)
    }
  });
});

// @desc      Create new event
// @route     POST /api/events
// @access    Public (MVP - no auth required)
exports.createEvent = asyncHandler(async (req, res, next) => {
  // Set user ID from authenticated request
  req.body.user = req.user.id;

  // Add default values if not provided
  if (!req.body.capacity && !req.body.maxAttendees) {
    req.body.maxAttendees = 100;
  }
  // Handle both 'capacity' and 'maxAttendees' field names
  if (req.body.capacity && !req.body.maxAttendees) {
    req.body.maxAttendees = req.body.capacity;
  }

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    data: event
  });
});

// @desc      Update event
// @route     PUT /api/events/:id
// @access    Private
exports.updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is event owner
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this event`,
        401
      )
    );
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc      Delete event
// @route     DELETE /api/events/:id
// @access    Private
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is event owner
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this event`,
        401
      )
    );
  }

  event.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Register for event
// @route     POST /api/events/:id/rsvp
// @access    Private
exports.rsvpEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // For MVP: support both authenticated users and anonymous users
  const userId = req.user?.id || req.body.userId || req.headers['x-user-id'];
  
  if (!userId) {
    return next(
      new ErrorResponse('User identification required to register for event', 400)
    );
  }

  // Check if already registered (compare as strings to handle both ObjectId and string)
  const isAlreadyRegistered = event.participants.some(
    participant => participant.toString() === userId.toString()
  );
  
  if (isAlreadyRegistered) {
    return next(
      new ErrorResponse(`User already registered for this event`, 400)
    );
  }

  // Check if event is full
  if (event.participants.length >= event.maxAttendees) {
    return next(
      new ErrorResponse(`Event is full`, 400)
    );
  }

  event.participants.push(userId);
  await event.save();

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc      Cancel RSVP for event
// @route     DELETE /api/events/:id/rsvp
// @access    Private
exports.cancelRsvp = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // For MVP: support both authenticated users and anonymous users
  const userId = req.user?.id || req.body.userId || req.headers['x-user-id'];
  
  if (!userId) {
    return next(
      new ErrorResponse('User identification required', 400)
    );
  }

  // Check if user is registered
  if (!event.participants.includes(userId)) {
    return next(
      new ErrorResponse(`User is not registered for this event`, 400)
    );
  }

  // Remove user from participants
  event.participants = event.participants.filter(
    participant => participant.toString() !== userId
  );
  await event.save();

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc      Add feedback to event
// @route     POST /api/events/:id/feedback
// @access    Private
exports.addFeedback = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return next(
      new ErrorResponse('Please provide a rating between 1 and 5', 400)
    );
  }

  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user participated in the event
  if (!event.participants.includes(req.user.id)) {
    return next(
      new ErrorResponse('You must participate in the event to leave feedback', 400)
    );
  }

  // Check if user already left feedback
  const existingFeedback = event.feedback.find(
    f => f.user.toString() === req.user.id
  );

  if (existingFeedback) {
    // Update existing feedback
    existingFeedback.rating = rating;
    existingFeedback.comment = comment || '';
  } else {
    // Add new feedback
    event.feedback.push({
      user: req.user.id,
      rating,
      comment: comment || ''
    });
  }

  await event.save();

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc      Get events within a radius
// @route     GET /api/events/radius/:zipcode/:distance
// @access    Public
exports.getEventsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const events = await Event.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc      Get upcoming events for a user
// @route     GET /api/events/upcoming
// @access    Private
exports.getUpcomingEvents = asyncHandler(async (req, res, next) => {
  const now = new Date();
  
  // For MVP: make this endpoint work without authentication
  // If user is authenticated, filter by their participation
  // Otherwise, return all upcoming events
  const query = { date: { $gt: now } };
  
  if (req.user?.id) {
    query.participants = req.user.id;
  }
  
  const events = await Event.find(query).populate('user', 'name');

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

// @desc      Get events created by a user
// @route     GET /api/events/myevents
// @access    Private
exports.getMyEvents = asyncHandler(async (req, res, next) => {
  // For MVP: return empty if no user authenticated
  if (!req.user?.id) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }

  const events = await Event.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});