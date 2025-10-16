import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// ✅ Simple GET route to confirm server is live
app.get("/", (req, res) => {
  res.send("✅ Webflow → Intercom Server Running");
});

// ✅ Webflow form submission handler
app.post("/webflow-webhook", async (req, res) => {
  console.log("📩 Webflow form submission received:");
  console.log(JSON.stringify(req.body, null, 2)); // log full payload for debugging

  try {
    // Handle possible Webflow payload shapes
    const formData = req.body.data || req.body;

    // Try lowercase + uppercase variations
    const name = formData.name || formData.Name || "No Name Provided";
    const email = formData.email || formData.Email;

    if (!email) {
      console.error("❌ Missing email field in payload:", formData);
      return res.status(400).send("Missing email field in form data");
    }

    // ✅ Send data to Intercom
    await axios.post(
      "https://api.intercom.io/contacts",
      {
        email,
        name
      },
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
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
