const express = require("express");
const crypto = require("crypto");
const app = express();
const port = process.env.PORT || 3000;

app.get("/verify", (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  const discordId = req.query.discord_id || "unknown";
  const hashedIP = crypto.createHash("sha256").update(ip).digest("hex");

  console.log(`[VERIFY] User ${discordId} has IP hash: ${hashedIP}`);

  res.send(`
    <h2>✅ Verification Complete</h2>
    <p>Your IP has been hashed and recorded for abuse prevention.</p>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
