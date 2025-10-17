import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 10000;
const INTERCOM_ACCESS_TOKEN = process.env.INTERCOM_ACCESS_TOKEN;

// Middleware
app.use(bodyParser.json());

// Root route
app.get("/", (req, res) => {
  res.send("✅ Webflow → Intercom integration is running");
});

// Webflow webhook endpoint
app.post("/webflow", async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 Webflow form submission received:");
    console.log(JSON.stringify(data, null, 2));

    const formData = data?.payload?.data || {};
    const name = formData["Name"] || "Unknown";
    const email = formData["Email"] || "noemail@unknown.com";
    const company = formData["Company Name"] || "N/A";

    console.log(`📤 Sending to Intercom: ${email} (${name})`);

    const response = await axios.post(
      "https://api.intercom.io/contacts",
      {
        role: "user",
        email,
        name,
        custom_attributes: {
          company_name: company,
          monthly_calls: formData["Monthly Calls"] || "",
          key_integrations: formData["Key Software Integrations"] || "",
          challenge: formData["Biggest Call Handling Challenge"] || ""
        }
      },
      {
        headers: {
          Authorization: INTERCOM_ACCESS_TOKEN,
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      }
    );

    console.log("✅ Successfully sent to Intercom:", response.data);
    res.status(200).send("Success");
  } catch (error) {
    console.error("❌ Error sending to Intercom:", error.response?.data || error.message);
    res.status(500).send("Error sending to Intercom");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
