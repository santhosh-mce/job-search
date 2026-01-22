const express = require("express");
const cron = require("node-cron");
const runJobBot = require("./walkinJobs.js");

const app = express();
const PORT = 3000;

// Health check
app.get("/", (req, res) => {
    res.send("✅ Job Alert Bot is running");
});

// ⏰ RUN EVERY 30 MINUTES
cron.schedule("*/60 * * * *", async () => {
    await runJobBot();
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    runJobBot(); // run once on startup
});
