import express from "express";
import { nanoid } from "nanoid";
import pool from "../db.js";

export const router = express.Router();

const isValidUrl = (raw) => {
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (e) {
    return false;
  }
};

const isValidCode = (c) => /^[A-Za-z0-9]{6,8}$/.test(c);

router.post("/", async (req, res) => {
  try {
    const { url, code } = req.body || {};
    if (!url) return res.status(400).json({ error: "url is required" });
    if (!isValidUrl(url)) return res.status(400).json({ error: "invalid url" });

    const short = code ? String(code) : nanoid(6);
    if (code && !isValidCode(code))
      return res.status(400).json({ error: "invalid code format" });

    // Defensive insert to avoid race where two requests try same code simultaneously.
    // Use ON CONFLICT DO NOTHING and check RETURNING to detect duplicate key.
    const insert = await pool.query(
      "INSERT INTO links (code, url) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING RETURNING code, url, clicks, last_clicked, created_at",
      [short, url]
    );

    if (!insert.rows.length) {
      return res.status(409).json({ error: "code exists" });
    }

    return res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
});

router.get("/", async (_, res) => {
  try {
    const result = await pool.query(
      "SELECT code, url, clicks, last_clicked, created_at FROM links ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
});

router.get("/:code", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT code, url, clicks, last_clicked, created_at FROM links WHERE code=$1",
      [req.params.code]
    );
    if (!result.rows.length) return res.status(404).json({ error: "not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
});

router.delete("/:code", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM links WHERE code=$1 RETURNING code", [
      req.params.code,
    ]);
    if (!result.rows.length) return res.status(404).json({ error: "not found" });
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
});