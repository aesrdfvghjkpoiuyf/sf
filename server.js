import express from "express"
import bodyParser from "body-parser"
import axios from "axios"

const app = express()
const PORT = process.env.PORT || 10000

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Root route
app.get("/", (req, res) => {
  res.send("✅ Webflow → Intercom integration is running!")
})

// Webflow form submission webhook
app.post("/webflow", async (req, res) => {
  console.log("📩 Webflow form submission received:")
  console.log(JSON.stringify(req.body, null, 2))

  try {
    const { payload } = req.body
    const formData = payload?.data || {}

    const name = formData["Name"] || "Unknown"
    const email = formData["Email"]
    const companyName = formData["Company Name"] || ""
    const monthlyCalls = formData["Monthly Calls"] || ""
    const keyIntegrations = formData["Key Software Integrations"] || ""
    const mainChallenge = formData["Biggest Call Handling Challenge"] || ""

    if (!email) {
      console.error("❌ Missing email field — cannot send to Intercom.")
      return res.status(400).json({ error: "Missing email" })
    }

    console.log("📝 Parsed form data:", { name, email, companyName, monthlyCalls })

    // Construct Intercom contact payload
    const intercomData = {
      role: "user",
      email,
      name,
      custom_attributes: {
        "Company Name": companyName,
        "Monthly Calls": monthlyCalls,
        "Key Software Integrations": keyIntegrations,
        "Biggest Call Handling Challenge": mainChallenge,
      },
    }

    console.log("🚀 Sending to Intercom...")
    console.log("Using token:", process.env.INTERCOM_ACCESS_TOKEN ? "Token found ✓" : "Token missing ✗")

    const response = await axios.post("https://api.intercom.io/contacts", intercomData, {
      headers: {
        Authorization: `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    console.log("✅ Successfully sent to Intercom:")
    console.log(response.data)

    res.status(200).json({ success: true })
  } catch (error) {
    console.error("❌ Error sending to Intercom:", error.response?.data || error.message)
    res.status(500).json({ error: "Failed to send to Intercom" })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
