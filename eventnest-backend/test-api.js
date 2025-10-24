const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API...');
    const response = await axios.get('http://localhost:5000/api/events');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
