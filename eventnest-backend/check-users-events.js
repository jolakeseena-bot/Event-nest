const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Event = require('./models/Event');

async function checkUsersAndEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get all users
    const users = await User.find({}, { _id: 1, name: 1, email: 1 });
    console.log('=== ALL USERS ===');
    users.forEach(user => {
      console.log(`Name: ${user.name}, ID: ${user._id}, Email: ${user.email}`);
    });

    // Get all events
    console.log('\n=== ALL EVENTS ===');
    const events = await Event.find({}, { _id: 1, title: 1, user: 1, organizer: 1 });
    events.forEach(event => {
      console.log(`Title: ${event.title}, Creator ID: ${event.user}, Organizer: ${event.organizer}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsersAndEvents();
