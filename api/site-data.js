/**
 * D. Watson — Site Data API (JSONBin.io Cloud Proxy)
 *
 * GET  /api/site-data  → Fetch latest site data from JSONBin cloud
 * POST /api/site-data  → Push updated site data to JSONBin cloud
 *
 * JSONBin is the permanent cloud database — no more /tmp resets.
 */

const JSONBIN_BIN_ID  = process.env.JSONBIN_BIN_ID  || "6aa3968dffd5d16053f901ea";
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY  || "$2a$10$3OV2e0QeSmF5lqIVlImrHu3OrK7U8JprhYQe3gAdQN2qZsv5Ojarq";
const JSONBIN_BASE    = "https://api.jsonbin.io/v3/b";

module.exports = async (req, res) => {
  // CORS headers — allow all origins
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

  // ── GET: Fetch latest data from JSONBin ────────────────────────────────────
  if (req.method === "GET") {
    try {
      const response = await fetch(`${JSONBIN_BASE}/${JSONBIN_BIN_ID}/latest`, {
        method: "GET",
        headers: {
          "X-Master-Key": JSONBIN_API_KEY,
          "X-Bin-Meta":   "false"
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("JSONBin GET error:", response.status, errText);
        return res.status(502).json({
          success: false,
          error: `JSONBin error ${response.status}: ${errText}`
        });
      }

      const data = await response.json();
      // JSONBin returns { record: {...} } — extract the record
      const record = data.record || data;

      return res.status(200).json({
        success: true,
        source: "jsonbin-cloud",
        lastUpdated: record.lastModified || Date.now(),
        data: record
      });
    } catch (err) {
      console.error("GET /api/site-data error:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── POST / PUT: Push updated data to JSONBin ───────────────────────────────
  if (req.method === "POST" || req.method === "PUT") {
    try {
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) {}
      }

      const siteData = (body && body.data) ? body.data : body;
      if (!siteData || typeof siteData !== "object") {
        return res.status(400).json({ success: false, error: "Invalid site data payload." });
      }

      // Fetch current cloud data to safely merge, preventing accidental resets of other sections
      let currentData = {};
      try {
        const curRes = await fetch(`${JSONBIN_BASE}/${JSONBIN_BIN_ID}/latest`, {
          method: "GET",
          headers: {
            "X-Master-Key": JSONBIN_API_KEY,
            "X-Bin-Meta": "false"
          }
        });
        if (curRes.ok) {
          const curJson = await curRes.json();
          currentData = curJson.record || curJson;
        }
      } catch (fErr) {
        console.warn("Could not fetch current cloud data before merge:", fErr.message);
      }

      const mergedData = {
        ...currentData,
        ...siteData,
        departments: (Array.isArray(siteData.departments) && siteData.departments.length > 0) ? siteData.departments : (currentData.departments || []),
        products: (Array.isArray(siteData.products) && siteData.products.length > 0) ? siteData.products : (currentData.products || []),
        branches: (Array.isArray(siteData.branches) && siteData.branches.length > 0) ? siteData.branches : (currentData.branches || []),
        heroSlides: (Array.isArray(siteData.heroSlides) && siteData.heroSlides.length > 0) ? siteData.heroSlides : (currentData.heroSlides || []),
        management: (Array.isArray(siteData.management) && siteData.management.length > 0) ? siteData.management : (currentData.management || []),
        gallery: (Array.isArray(siteData.gallery) && siteData.gallery.length > 0) ? siteData.gallery : (currentData.gallery || []),
        categories: (Array.isArray(siteData.categories) && siteData.categories.length > 0) ? siteData.categories : (currentData.categories || []),
        faqs: (Array.isArray(siteData.faqs) && siteData.faqs.length > 0) ? siteData.faqs : (currentData.faqs || []),
        company: { ...(currentData.company || {}), ...(siteData.company || {}) },
        lastModified: Date.now()
      };

      const response = await fetch(`${JSONBIN_BASE}/${JSONBIN_BIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_API_KEY
        },
        body: JSON.stringify(mergedData)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("JSONBin PUT error:", response.status, errText);
        return res.status(502).json({
          success: false,
          error: `JSONBin error ${response.status}: ${errText}`
        });
      }

      return res.status(200).json({
        success: true,
        message: "Site data saved to cloud successfully!",
        lastUpdated: mergedData.lastModified
      });
    } catch (err) {
      console.error("POST /api/site-data error:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method Not Allowed." });
};
