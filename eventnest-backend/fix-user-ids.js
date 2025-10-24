const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');

async function fixUserIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all events with zero user ID to the correct user ID
    const correctUserId = '68f9ad661de2761003f63aab';
    
    const result = await Event.updateMany(
      { user: '000000000000000000000000' },
      { user: correctUserId }
    );

    console.log(`Updated ${result.modifiedCount} events`);
    console.log(`Matched ${result.matchedCount} events`);

    // Verify the update
    const events = await Event.find();
    console.log('\nAll events after update:');
    events.forEach((event, idx) => {
      console.log(`Event ${idx + 1}: ${event.title} - User: ${event.user}`);
    });

    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixUserIds();
