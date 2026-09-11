/**
 * D. Watson — Cloud Database Client (JSONBin.io)
 * ================================================
 * Single source of truth for ALL site data: products, branches,
 * gallery, departments, hero slides, management, company info.
 *
 * All admin saves go to JSONBin. All page loads read from JSONBin.
 * LocalStorage is used only as a fast local cache.
 */

(function (window) {
  "use strict";

  // ── JSONBin Configuration ─────────────────────────────────────────────────
  const JSONBIN_BIN_ID  = "6aa3968dffd5d16053f901ea";
  const JSONBIN_API_KEY = "$2a$10$3OV2e0QeSmF5lqIVlImrHu3OrK7U8JprhYQe3gAdQN2qZsv5Ojarq";
  const JSONBIN_BASE    = "https://api.jsonbin.io/v3/b";
  const CACHE_KEY       = "dwatson_cloud_cache_v1";
  const CACHE_TTL_MS    = 30 * 1000; // 30 seconds — refresh if older than this

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Read the local cache (returns {data, fetchedAt} or null) */
  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  /** Write data to the local cache */
  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, fetchedAt: Date.now() }));
    } catch (e) {
      // Storage quota — ignore, we still push to cloud
    }
  }

  // ── Core API ──────────────────────────────────────────────────────────────

  /**
   * Fetch all site data from JSONBin cloud.
   * Returns the full data object, or null on failure.
   */
  async function fetchFromCloud() {
    try {
      const res = await fetch(`${JSONBIN_BASE}/${JSONBIN_BIN_ID}/latest`, {
        method: "GET",
        headers: {
          "X-Master-Key": JSONBIN_API_KEY,
          "X-Bin-Meta":   "false"
        }
      });
      if (!res.ok) {
        console.warn("☁️ Cloud DB fetch failed:", res.status);
        return null;
      }
      const json = await res.json();
      // JSONBin returns the bin content directly when X-Bin-Meta: false
      const data = json.record || json;
      writeCache(data);
      return data;
    } catch (err) {
      console.warn("☁️ Cloud DB unreachable:", err.message);
      return null;
    }
  }

  /**
   * Push the full site data object to JSONBin cloud.
   * Call this after every admin save action.
   * Returns true on success, false on failure.
   */
  async function pushToCloud(data) {
    try {
      data.lastModified = Date.now();
      const res = await fetch(`${JSONBIN_BASE}/${JSONBIN_BIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_API_KEY
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        console.error("☁️ Cloud DB push failed:", res.status, await res.text());
        return false;
      }
      writeCache(data);
      console.log("☁️ Cloud DB updated successfully.");
      return true;
    } catch (err) {
      console.error("☁️ Cloud DB push error:", err.message);
      return false;
    }
  }

  // ── Smart Load ────────────────────────────────────────────────────────────

  /**
   * Get site data — tries cache first, then cloud.
   * On public pages: refreshes from cloud silently in the background.
   * Always returns data synchronously from cache if available.
   */
  async function loadSiteData() {
    const cached = readCache();

    // If cache is fresh, return it immediately
    if (cached && cached.data && (Date.now() - cached.fetchedAt) < CACHE_TTL_MS) {
      return cached.data;
    }

    // Cache is stale or empty — fetch from cloud
    const cloudData = await fetchFromCloud();
    if (cloudData) return cloudData;

    // Cloud unreachable — return stale cache if available
    if (cached && cached.data) {
      console.warn("☁️ Using stale cache (cloud unreachable).");
      return cached.data;
    }

    // Nothing in cache or cloud — caller should use DEFAULT_SITE_DATA
    return null;
  }

  // ── Section-Specific Saves ────────────────────────────────────────────────
  // Each of these loads current cloud data, updates one section, then pushes back.

  async function saveProducts(products) {
    const data = await loadSiteData() || {};
    data.products = products;
    return pushToCloud(data);
  }

  async function saveBranches(branches) {
    const data = await loadSiteData() || {};
    data.branches = branches;
    return pushToCloud(data);
  }

  async function saveGallery(gallery) {
    const data = await loadSiteData() || {};
    data.gallery = gallery;
    return pushToCloud(data);
  }

  async function saveDepartments(departments) {
    const cloudLatest = await fetchFromCloud() || await loadSiteData() || {};
    cloudLatest.departments = departments;
    cloudLatest.lastModified = Date.now();
    return pushToCloud(cloudLatest);
  }

  async function saveHeroSlides(heroSlides) {
    const cloudLatest = await fetchFromCloud() || await loadSiteData() || {};
    cloudLatest.heroSlides = heroSlides;
    cloudLatest.lastModified = Date.now();
    return pushToCloud(cloudLatest);
  }

  async function saveManagement(management) {
    const cloudLatest = await fetchFromCloud() || await loadSiteData() || {};
    cloudLatest.management = management;
    cloudLatest.lastModified = Date.now();
    return pushToCloud(cloudLatest);
  }

  async function saveCompanyInfo(company) {
    const cloudLatest = await fetchFromCloud() || await loadSiteData() || {};
    cloudLatest.company = company;
    cloudLatest.lastModified = Date.now();
    return pushToCloud(cloudLatest);
  }

  async function saveFaqs(faqs) {
    const cloudLatest = await fetchFromCloud() || await loadSiteData() || {};
    cloudLatest.faqs = faqs;
    cloudLatest.lastModified = Date.now();
    return pushToCloud(cloudLatest);
  }

  /**
   * Save the COMPLETE site data object at once.
   * Merges safely with current cloud record so no section is ever accidentally wiped.
   */
  async function saveAllData(data) {
    try {
      const latest = await fetchFromCloud();
      if (latest && typeof latest === "object") {
        const merged = {
          ...latest,
          ...data,
          departments: (Array.isArray(data.departments) && data.departments.length) ? data.departments : (latest.departments || []),
          products: (Array.isArray(data.products) && data.products.length) ? data.products : (latest.products || []),
          branches: (Array.isArray(data.branches) && data.branches.length) ? data.branches : (latest.branches || []),
          heroSlides: (Array.isArray(data.heroSlides) && data.heroSlides.length) ? data.heroSlides : (latest.heroSlides || []),
          management: (Array.isArray(data.management) && data.management.length) ? data.management : (latest.management || []),
          gallery: (Array.isArray(data.gallery) && data.gallery.length) ? data.gallery : (latest.gallery || []),
          categories: (Array.isArray(data.categories) && data.categories.length) ? data.categories : (latest.categories || []),
          faqs: (Array.isArray(data.faqs) && data.faqs.length) ? data.faqs : (latest.faqs || []),
          company: { ...(latest.company || {}), ...(data.company || {}) },
          lastModified: Date.now()
        };
        return pushToCloud(merged);
      }
    } catch (e) {
      console.warn("Cloud merge notice, saving directly:", e);
    }
    return pushToCloud(data);
  }

  /**
   * Sync from cloud to localStorage.
   * Updates localStorage STORAGE_KEY so getSiteData() picks it up.
   * Fires siteDataUpdated event so all pages (and admin) re-render immediately.
   */
  async function syncCloudToLocal() {
    try {
      const cloudData = await fetchFromCloud();
      if (!cloudData || typeof cloudData !== "object") return null;

      const STORAGE_KEY = "dwatson_site_data_v19";
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));

      // Always notify the page that cloud data is fresh
      window.dispatchEvent(new Event("siteDataUpdated"));
      console.log("☁️ Site data synced from cloud (departments: " + (cloudData.departments || []).length + ", modified: " + new Date(cloudData.lastModified || Date.now()).toLocaleTimeString() + ")");
      return cloudData;
    } catch (err) {
      console.warn("☁️ Cloud sync notice:", err);
      return null;
    }
  }

  /**
   * Check cloud connection and return status.
   */
  async function checkCloudStatus() {
    try {
      const res = await fetch(`${JSONBIN_BASE}/${JSONBIN_BIN_ID}/latest`, {
        method: "GET",
        headers: {
          "X-Master-Key": JSONBIN_API_KEY,
          "X-Bin-Meta":   "false"
        }
      });
      return { connected: res.ok, status: res.status };
    } catch (e) {
      return { connected: false, error: e.message };
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  window.CloudDB = {
    // Core
    loadSiteData,
    saveAllData,
    syncCloudToLocal,
    checkCloudStatus,

    // Section helpers
    saveProducts,
    saveBranches,
    saveGallery,
    saveDepartments,
    saveHeroSlides,
    saveManagement,
    saveCompanyInfo,
    saveFaqs,

    // Low-level
    fetchFromCloud,
    pushToCloud
  };

  // ── Auto-sync on page load (runs on ALL pages: public & admin) ────────────
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => syncCloudToLocal());
    } else {
      syncCloudToLocal();
    }
  }

})(typeof window !== "undefined" ? window : global);
