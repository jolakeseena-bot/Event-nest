const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  organizer: {
    type: String,
    required: [true, 'Please add an organizer name']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Health', 'Environment', 'Education', 'Community', 'Technology', 'Other']
  },
  participants: [mongoose.Schema.Types.Mixed],
  maxAttendees: {
    type: Number,
    default: 100
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  feedback: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      maxlength: [200, 'Comment cannot be more than 200 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVirtual: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title
EventSchema.pre('save', function(next) {
  next();
});

module.exports = mongoose.model('Event', EventSchema);