import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { router as linkRoutes } from "./routes/links.js";
import db, { ensureSchema } from "./db.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

// Serve the views directory as static so files like /stats.html and /error.html are reachable
app.use(express.static(path.join(__dirname, "views")));

app.use("/api/links", linkRoutes);

app.get("/healthz", (req, res) => res.json({ ok: true, version: "1.x" }));

// Quick DB test endpoint
app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ success: true, server_time: result.rows[0] });
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    // Atomically increment clicks and fetch the target URL
    const result = await db.query(
      "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code=$1 RETURNING url",
      [code]
    );

    if (!result.rows.length)
      return res.status(404).sendFile(path.join(__dirname, "views", "error.html"));

    const { url } = result.rows[0];
    // Redirect to the target URL. Keep errors internal and do not expose DB error details.
    return res.redirect(302, url);
  } catch (err) {
    console.error('Redirect error:', err);
    return res.status(500).sendFile(path.join(__dirname, "views", "error.html"));
  }
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "views/index.html")));

const PORT = process.env.PORT || 5000;
// Ensure DB schema in background (do not crash process if it fails).
ensureSchema().catch((err) => {
  console.error('ensureSchema error:', err);
});

app.listen(PORT, () => console.log('Server running on ' + PORT));