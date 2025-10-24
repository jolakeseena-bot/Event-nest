const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');

async function fixEventOwner() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Update Data Science for beginners to have Vasuki as creator
    const vasukiId = '68f909f24eb9313aca2c3f9b';
    
    const result = await Event.findOneAndUpdate(
      { title: 'Data Science for beginners' },
      { user: vasukiId },
      { new: true }
    );

    console.log('Updated event:');
    console.log(`Title: ${result.title}`);
    console.log(`Creator ID: ${result.user}`);
    console.log(`Organizer: ${result.organizer}`);

    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixEventOwner();
