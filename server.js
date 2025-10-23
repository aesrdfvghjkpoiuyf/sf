import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Webflow → Intercom Server is running!");
});

// ✅ Webflow Webhook route
app.post("/webflow-webhook", async (req, res) => {
  console.log("📩 Webflow form submission received:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const payload = req.body.payload || {};
    const data = payload.data || {};

    // Extract form fields safely
    const name = data.Name || data.name || "No Name";
    const email = data.Email || data.email;
    const companyName = data["Company Name"] || "";
    const monthlyCalls = data["Monthly Calls"] || "";
    const integrations = data["Key Software Integrations"] || "";
    const challenge = data["Biggest Call Handling Challenge"] || "";
    const pageUrl = payload.pageUrl || "";

    if (!email) {
      console.error("❌ Missing email field in payload:", data);
      return res.status(400).send("Missing email field in form data");
    }

    console.log(`📤 Sending to Intercom: ${email} (${name})`);

    // ✅ Step 1: Send Contact to Intercom
    const contactResponse = await axios.post(
      "https://api.intercom.io/contacts",
      {
        email,
        name,
        custom_attributes: {
          company: companyName, // ✅ fixed (Intercom default field)
          monthly_calls: monthlyCalls,
          key_integrations: integrations,
          call_challenge: challenge,
          page_url: pageUrl,
          form_name: payload.name || "Webflow Form",
        },
      },
      {
        headers: {
          Authorization:
            "Bearer dG9rOjkzNTU0YzJhXzgzMmFfNGExYl84MzlmXzFmMmRmYjRmZDEwYToxOjA=", // ✅ your Intercom token
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("✅ Contact created/updated successfully:", contactResponse.data);

    // ✅ Step 2: Create Event in Intercom
    await axios.post(
      "https://api.intercom.io/events",
      {
        event_name: "webflow_form_submitted",
        created_at: Math.floor(Date.now() / 1000),
        email,
        metadata: {
          form_name: payload.name || "Enterprise Lead Form",
          company: companyName,
          monthly_calls: monthlyCalls,
          key_integrations: integrations,
          call_challenge: challenge,
          page_url: pageUrl,
        },
      },
      {
        headers: {
          Authorization:
            "Bearer dG9rOjkzNTU0YzJhXzgzMmFfNGExYl84MzlmXzFmMmRmYjRmZDEwYToxOjA=", // ✅ same token
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("✅ Event logged in Intercom successfully");
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error sending to Intercom:", error.response?.data || error.message);
    res.status(500).send("Error sending to Intercom");
  }
});

const PORT = 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
