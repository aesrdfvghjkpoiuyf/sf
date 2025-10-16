// server.js
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Load token from Render environment variable
const INTERCOM_TOKEN = process.env.INTERCOM_TOKEN;

// Health check (optional)
app.get('/', (req, res) => {
  res.send('✅ Webflow → Intercom middleware is running');
});

app.post('/webflow-webhook', async (req, res) => {
  try {
    const payload = req.body;

    // Adjust field mapping if your Webflow fields are named differently
    const email = payload.data.email;
    const name = payload.data.name;

    if (!email) {
      return res.status(400).send('Missing email field from Webflow payload');
    }

    // Send contact to Intercom
    const response = await axios.post(
      'https://api.intercom.io/contacts',
      {
        email: email,
        name: name,
        role: 'lead'
      },
      {
        headers: {
          'Authorization': `Bearer ${INTERCOM_TOKEN}`,
          'Content-Type': 'application/json',
          'Intercom-Version': '2.11'
        }
      }
    );

    console.log('✅ Intercom response:', response.data);
    res.status(200).send('Contact pushed to Intercom');
  } catch (error) {
    console.error('❌ Error pushing to Intercom:', error.response?.data || error.message);
    res.status(500).send('Error sending to Intercom');
  }
});

// Render dynamically assigns PORT — use it instead of hardcoding 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
