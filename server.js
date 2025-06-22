const express = require("express");
const crypto = require("crypto");
const app = express();
const port = process.env.PORT || 3000;

// In-memory flag store (replace with DB later)
let flaggedUsers = [];

// === Verification Page ===
app.get("/verify", (req, res) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  const discordId = req.query.discord_id || "unknown";
  const hashedIP = crypto.createHash("sha256").update(ip).digest("hex");

  // Flag logic (example: block duplicates)
  const alreadyFlagged = flaggedUsers.find(u => u.hashedIP === hashedIP);
  if (alreadyFlagged) {
    res.send(`<h2>❌ Verification Denied</h2><p>This device has already verified with a different account.</p>`);
    return;
  }

  flaggedUsers.push({ discordId, hashedIP });
  console.log(`[VERIFY] User ${discordId} has IP hash: ${hashedIP}`);

  res.send(`<h2>✅ Verification Complete</h2><p>Your IP has been hashed and recorded.</p>`);
});

// === Dashboard Page ===
app.get("/flagged", (req, res) => {
  let html = `<h2>🚨 Flagged Users</h2><ul>`;
  for (const user of flaggedUsers) {
    html += `<li>Discord ID: ${user.discordId} | IP Hash: ${user.hashedIP}</li>`;
  }
  html += `</ul>`;
  res.send(html);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
