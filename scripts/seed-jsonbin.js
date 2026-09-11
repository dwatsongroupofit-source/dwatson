/**
 * Seed ALL D. Watson site data to JSONBin cloud database.
 * Runs once to populate JSONBin with the complete DEFAULT_SITE_DATA.
 */

const JSONBIN_BIN_ID  = "6aa3968dffd5d16053f901ea";
const JSONBIN_API_KEY = "$2a$10$3OV2e0QeSmF5lqIVlImrHu3OrK7U8JprhYQe3gAdQN2qZsv5Ojarq";
const JSONBIN_BASE    = "https://api.jsonbin.io/v3/b";

// Load DEFAULT_SITE_DATA from data.js
// We wrap it in a module-safe IIFE to extract the value
const fs = require("fs");
const path = require("path");

let rawDataJs = fs.readFileSync(path.join(__dirname, "..", "js", "data.js"), "utf8");

// Strip out everything after the closing }; of DEFAULT_SITE_DATA
// and everything that references window/document/localStorage
// so Node.js can evaluate the object safely
const safeCode = rawDataJs
  // Remove browser-only APIs that Node doesn't have
  .replace(/if\s*\(typeof window[^}]+\}\s*\}/gs, "")
  .replace(/document\.\w+[^\n]*/g, "")
  .replace(/localStorage[^\n]*/g, "")
  .replace(/window\.[^\n]*/g, "")
  .replace(/async function [^{]+\{[\s\S]*?\n\}/g, "")
  .replace(/function [^{]+\{[\s\S]*?\n\}/g, "")
  // Only keep the DEFAULT_SITE_DATA declaration
  + "\nmodule.exports = DEFAULT_SITE_DATA;";

// Write to a temp file and require it
const tmpFile = path.join("/tmp", "dwatson-data-extract.js");

try {
  // Simpler approach: use regex to extract just the object and eval it
  const match = rawDataJs.match(/const DEFAULT_SITE_DATA\s*=\s*(\{[\s\S]+?\n\})\s*;/);
  if (!match) {
    throw new Error("Could not find DEFAULT_SITE_DATA in data.js");
  }
  
  // Write a proper module file
  fs.writeFileSync(tmpFile, `const DEFAULT_SITE_DATA = ${match[1]};\nmodule.exports = DEFAULT_SITE_DATA;`);
  
  const DEFAULT_SITE_DATA = require(tmpFile);
  
  const fullPayload = {
    company:      DEFAULT_SITE_DATA.company      || {},
    management:   DEFAULT_SITE_DATA.management   || [],
    heroSlides:   DEFAULT_SITE_DATA.heroSlides   || [],
    departments:  DEFAULT_SITE_DATA.departments  || [],
    products:     DEFAULT_SITE_DATA.products     || [],
    branches:     DEFAULT_SITE_DATA.branches     || [],
    gallery:      DEFAULT_SITE_DATA.gallery      || [],
    categories:   DEFAULT_SITE_DATA.categories   || [],
    trustedBrands:DEFAULT_SITE_DATA.trustedBrands|| [],
    faqs:         DEFAULT_SITE_DATA.faqs         || [],
    brands:       DEFAULT_SITE_DATA.brands       || [],
    lastModified: Date.now()
  };

  console.log("📦 Payload summary:");
  console.log("  company keys:", Object.keys(fullPayload.company).length);
  console.log("  management:", fullPayload.management.length);
  console.log("  heroSlides:", fullPayload.heroSlides.length);
  console.log("  departments:", fullPayload.departments.length);
  console.log("  products:", fullPayload.products.length);
  console.log("  branches:", fullPayload.branches.length);
  console.log("  gallery:", fullPayload.gallery.length);
  console.log("  categories:", fullPayload.categories.length);
  console.log("  trustedBrands:", fullPayload.trustedBrands.length);
  console.log("  faqs:", fullPayload.faqs.length);

  // Push to JSONBin
  const https = require("https");
  const body = JSON.stringify(fullPayload);

  const options = {
    hostname: "api.jsonbin.io",
    path: `/v3/b/${JSONBIN_BIN_ID}`,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "X-Master-Key": JSONBIN_API_KEY
    }
  };

  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => {
      if (res.statusCode === 200) {
        const parsed = JSON.parse(data);
        console.log("\n✅ SUCCESS! Full site data pushed to JSONBin cloud!");
        console.log("  Bin ID:", JSONBIN_BIN_ID);
        console.log("  Version:", parsed.metadata && parsed.metadata.version);
        console.log("\n🌍 Your entire website now loads from JSONBin cloud database.");
      } else {
        console.error("\n❌ JSONBin error:", res.statusCode, data);
      }
    });
  });

  req.on("error", (e) => console.error("Request error:", e.message));
  req.write(body);
  req.end();

} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}
