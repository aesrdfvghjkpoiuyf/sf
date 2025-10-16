// server.js
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json()); // parse JSON payloads

// 🔑 Replace this with your actual Intercom access token
const INTERCOM_TOKEN = 'YOUR_INTERCOM_ACCESS_TOKEN_HERE';

app.post('/webflow-webhook', async (req, res) => {
  try {
    const payload = req.body;

    // ✅ Adjust according to your Webflow form field names
    const email = payload.data.email;
    const name = payload.data.name;

    // Push contact to Intercom
    const response = await axios.post(
      'https://api.intercom.io/contacts',
      {
        email: email,
        name: name,
        role: "lead"
      },
      {
        headers: {
          'Authorization': `Bearer ${INTERCOM_TOKEN}`,
          'Content-Type': 'application/json',
          'Intercom-Version': '2.11'
        }
      }
    );

    console.log('✅ Contact pushed to Intercom:', response.data);
    res.status(200).send('Contact pushed to Intercom');
  } catch (error) {
    console.error('❌ Error pushing to Intercom:', error.response?.data || error.message);
    res.status(500).send('Error sending to Intercom');
  }
});

app.listen(3000, () => {
  console.log('🚀 Server is running on port 3000');
});
