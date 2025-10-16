import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Webflow → Intercom Server Running");
});

// ✅ Webhook endpoint
app.post("/webflow-webhook", async (req, res) => {
  console.log("📩 Webflow form submission received:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    // Extract correct data shape
    const payload = req.body.payload || {};
    const data = payload.data || {};

    // Get name & email safely
    const name = data.Name || data.name || "No Name";
    const email = data.Email || data.email;

    if (!email) {
      console.error("❌ Missing email field in payload:", data);
      return res.status(400).send("Missing email field in form data");
    }

    // ✅ Send to Intercom
    await axios.post(
      "https://api.intercom.io/contacts",
      { email, name },
      {
        headers: {
          Authorization: `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      }
    );

    console.log("✅ Data sent to Intercom successfully");
    res.status(200).send("OK");
  } catch (error) {
    console.error(
      "❌ Error sending to Intercom:",
      error.response?.data || error.message
    );
    res.status(500).send("Error sending to Intercom");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
