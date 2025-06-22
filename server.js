const express = require("express");
const crypto = require("crypto");
const app = express();
const port = process.env.PORT || 3000;

// Password protection for /flagged
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "FBI-Blacklist-0913@";

// In-memory flagged users (use DB for production)
let flaggedUsers = [];

// === Verification Route ===
app.get("/verify", (req, res) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  const discordId = req.query.discord_id || "unknown";

  const hashedIP = crypto.createHash("sha256").update(ip).digest("hex");

  const alreadyFlagged = flaggedUsers.find(u => u.hashedIP === hashedIP);
  if (alreadyFlagged) {
    res.send(`<h2>❌ Verification Denied</h2><p>This device has already verified with a different account.</p>`);
    return;
  }

  flaggedUsers.push({ discordId, hashedIP });
  console.log(`[VERIFY] User ${discordId} has IP hash: ${hashedIP}`);

  res.send(`<h2>✅ Verification Complete</h2><p>Your IP has been hashed and recorded.</p>`);
});

// === Flagged Users Dashboard (Password Protected) ===
app.get("/flagged", (req, res) => {
  const { password } = req.query;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).send(`<h2>🔒 Access Denied</h2><p>Incorrect or missing password.</p>`);
  }

  let html = `<h2>🚨 Flagged Users</h2><ul>`;
  for (const user of flaggedUsers) {
    html += `<li>Discord ID: ${user.discordId} | IP Hash: ${user.hashedIP}</li>`;
  }
  html += `</ul>`;
  res.send(html);
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
