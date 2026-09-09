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
  // ✉️ EmailJS Serverless Configurations (Host your site anywhere!)
  EMAILJS_PUBLIC_KEY: "m-RVdy9Q6jKly8bno",
  EMAILJS_SERVICE_ID: "service_z5e9jtl",
  EMAILJS_TEMPLATE_ADMIN: "template_pbxd89v",
  EMAILJS_TEMPLATE_CUSTOMER: "template_e2fgxk1",

  // 🔗 Set to empty to use the serverless same-origin relative path (e.g. Vercel Serverless Functions)
  RAILWAY_BACKEND_URL: "",

  // ☁️ Cloud Image Upload Endpoint (Zero-CORS serverless function on Vercel)
  UPLOAD_ENDPOINT: "/api/upload",

  // 📸 Direct 100% Client-Side Third-Party Cloud Upload (ImgBB CDN)
  // Direct browser uploads with zero backend required
  IMGBB_API_KEY: "5d369a9387210e1432e7018b92d3d0e8",
  IMGBB_UPLOAD_URL: "https://api.imgbb.com/1/upload",

  // 💬 Live Chat Configuration (Crisp Advanced Multi-Agent Live Chat)
  CRISP_ENABLED: true,
  CRISP_WEBSITE_ID: "4ea9bb45-b036-4468-bb27-09fe93c30b3f", // User's Crisp Website ID

  /**
   * Resolves whether Crisp live chat is active
   */
  isCrispEnabled: function() {
    const saved = localStorage.getItem("dw_crisp_enabled");
    if (saved !== null) return saved === "true";
    return Boolean(this.CRISP_ENABLED);
  },

  /**
   * Returns active Crisp Website ID
   */
  getCrispWebsiteId: function() {
    return localStorage.getItem("dw_crisp_website_id") || this.CRISP_WEBSITE_ID || "";
  },

  /**
   * Resolves the active image upload endpoint
   */
  getUploadUrl: function() {
    const base = this.getBackendUrl();
    if (base) {
      return base + (this.UPLOAD_ENDPOINT.startsWith("/") ? this.UPLOAD_ENDPOINT : "/" + this.UPLOAD_ENDPOINT);
    }
    return this.UPLOAD_ENDPOINT;
  },

  /**
   * Resolves the active backend API endpoint dynamically.
   */
  getBackendUrl: function() {
    // 1. Check if user configured a custom URL in localStorage (e.g. via Admin Panel)
    const customUrl = localStorage.getItem("dw_custom_api_url");
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, "");
    }

    // 2. Local development & Serverless Vercel fallback (same-origin relative paths)
    // Both localhost and live Vercel deployments run frontend and functions on the same domain.
    return (this.RAILWAY_BACKEND_URL || "").trim().replace(/\/+$/, "");
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
