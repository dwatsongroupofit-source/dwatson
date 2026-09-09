/**
 * D. Watson — Site Data Synchronization API (Serverless & Node Endpoint)
 * 
 * Synchronizes custom site configuration (departments, products, sliders, branches)
 * across multiple devices (mobile, desktop, and live website).
 */

const fs = require("fs");
const path = require("path");

// In-memory cache for serverless lifecycle
let cachedSiteData = null;
let lastUpdated = 0;

const DATA_FILE_PATH = path.join(process.cwd(), "data", "site-data-custom.json");

module.exports = async (req, res) => {
  // 1. CORS Headers for cross-device support (mobile to local server / cross-origin)
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // 2. GET: Return the latest synchronized site data
  if (req.method === "GET") {
    try {
      if (cachedSiteData) {
        return res.status(200).json({
          success: true,
          source: "memory",
          lastUpdated: lastUpdated,
          data: cachedSiteData
        });
      }

      if (fs.existsSync(DATA_FILE_PATH)) {
        const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf8");
        const parsed = JSON.parse(fileContent);
        cachedSiteData = parsed;
        return res.status(200).json({
          success: true,
          source: "disk",
          lastUpdated: lastUpdated || Date.now(),
          data: parsed
        });
      }

      return res.status(200).json({
        success: false,
        message: "No custom site data recorded yet. Using default site data."
      });
    } catch (err) {
      console.warn("Error reading site data:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. POST / PUT: Update synchronized site data
  if (req.method === "POST" || req.method === "PUT") {
    try {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch (e) {}
      }

      const siteData = (body && body.data) ? body.data : body;
      if (!siteData || typeof siteData !== "object") {
        return res.status(400).json({ success: false, error: "Invalid site data payload." });
      }

      // Update in-memory cache
      cachedSiteData = siteData;
      lastUpdated = Date.now();

      // Persist to disk if directory is writable (e.g. local dev / Node server)
      try {
        const dir = path.dirname(DATA_FILE_PATH);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(siteData, null, 2), "utf8");
      } catch (fsErr) {
        // On read-only serverless filesystems (e.g. Vercel production), disk write might be restricted
        console.warn("Disk write notice (in-memory sync active):", fsErr.message);
      }

      return res.status(200).json({
        success: true,
        message: "Site data synchronized successfully!",
        lastUpdated: lastUpdated
      });
    } catch (err) {
      console.error("Error saving site data:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method Not Allowed." });
};
