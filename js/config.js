/**
 * D. Watson Chemist & Superstore — API & Environment Configuration
 * 
 * Instructions for Deploying Separately (Vercel Frontend + Railway Backend):
 * 1. Deploy this repo to Vercel (for frontend) and Railway (for backend node server).
 * 2. Once Railway gives you your backend URL (e.g. https://dwatson-backend-production.up.railway.app),
 *    paste it into RAILWAY_BACKEND_URL below, or set it via the Admin portal / localStorage.
 * 3. When testing on localhost, it automatically connects to your local server without needing changes.
 */

window.DW_CONFIG = {
  // 🔗 Put your live Railway backend URL here (e.g. 'https://dwatson-production.up.railway.app')
  RAILWAY_BACKEND_URL: "https://dwatson-production.up.railway.app",

  /**
   * Resolves the active backend API endpoint dynamically.
   */
  getBackendUrl: function() {
    // 1. Check if user configured a custom URL in localStorage (e.g. via Admin Panel)
    const customUrl = localStorage.getItem("dw_custom_api_url");
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, "");
    }

    // 2. Local development fallback (relative path on same port)
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "") {
      return "";
    }

    // 3. Remote Production (Vercel -> Railway)
    const railwayUrl = (this.RAILWAY_BACKEND_URL || "").trim().replace(/\/+$/, "");
    return railwayUrl;
  },

  /**
   * Allows changing the backend URL at runtime (useful for testing on Vercel preview)
   */
  setBackendUrl: function(url) {
    if (!url || !url.trim()) {
      localStorage.removeItem("dw_custom_api_url");
    } else {
      localStorage.setItem("dw_custom_api_url", url.trim().replace(/\/+$/, ""));
    }
    console.log("🔗 Backend API URL updated to:", this.getBackendUrl());
  }
};
