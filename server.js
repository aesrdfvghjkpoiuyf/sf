import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running successfully 🚀");
});

app.post("/webflow-form", async (req, res) => {
  try {
    const { payload } = req.body;
    const formData = payload?.data || {};

    // ✅ Correctly extract email field
    const email = formData.Email || formData.email || null;

    if (!email) {
      console.error("❌ Missing email field in payload:", req.body);
      return res.status(400).send("Missing email field in payload");
    }

    // ✅ Prepare Intercom data
    const intercomPayload = {
      email,
      name: formData.Name,
      custom_attributes: {
        company_name: formData["Company Name"],
        monthly_calls: formData["Monthly Calls"],
        key_software_integrations: formData["Key Software Integrations"],
        biggest_call_handling_challenge: formData["Biggest Call Handling Challenge"],
      },
    };

    // ✅ Send to Intercom
    const intercomResponse = await axios.post(
      "https://api.intercom.io/contacts",
      intercomPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Successfully sent to Intercom:", intercomResponse.data);
    res.status(200).send("Form sent to Intercom");
  } catch (err) {
    console.error("❌ Error sending to Intercom:", err.response?.data || err.message);
    res.status(500).send("Error sending to Intercom");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
