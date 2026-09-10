/**
 * D. Watson — Serverless Cloud Image Upload API (Vercel Serverless Function)
 * 
 * Provides a secure, zero-CORS proxy to upload images to FreeImage.host / Cloud CDN.
 * Returns a permanent, fast Cloudflare CDN URL (e.g. https://iili.io/xyz.jpg).
 */

module.exports = async (req, res) => {
  // 1. Set CORS headers so the function can be called from any frontend origin
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed. Use POST." });
  }

  try {
    let body = req.body;

    // Handle stringified body if not automatically parsed
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        // Might be raw base64 or invalid JSON
      }
    }

    if (!body) {
      return res.status(400).json({ success: false, error: "Missing request body." });
    }

    // Extract image payload (support dataUrl or raw base64)
    let rawImage = body.image || body.source || body.dataUrl || body;
    if (typeof rawImage !== "string") {
      return res.status(400).json({ success: false, error: "Invalid image format. Expected Base64 string." });
    }

    // Strip Data URL prefix if present (e.g. "data:image/jpeg;base64,")
    const cleanBase64 = rawImage.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

    if (!cleanBase64 || cleanBase64.length < 50) {
      return res.status(400).json({ success: false, error: "Base64 image content is empty or invalid." });
    }

    const filename = (body.filename || body.name || `dwatson_${Date.now()}`).replace(/[^a-zA-Z0-9_.-]/g, "_");

    // 1. Cloudinary Upload (Cloud Name: bempxyod)
    const cldName = process.env.CLOUDINARY_CLOUD_NAME || "bempxyod";
    const cldPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "dwatson";
    if (cldName && cldPreset) {
      try {
        const cldForm = new FormData();
        cldForm.append("file", `data:image/jpeg;base64,${cleanBase64}`);
        cldForm.append("upload_preset", cldPreset);

        const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cldName}/image/upload`, {
          method: "POST",
          body: cldForm
        });
        const cldData = await cldRes.json().catch(() => null);
        if (cldRes.ok && cldData && cldData.secure_url) {
          return res.status(200).json({
            success: true,
            url: cldData.secure_url,
            display_url: cldData.secure_url,
            thumb_url: cldData.secure_url,
            name: filename,
            provider: "cloudinary"
          });
        }
      } catch (cldErr) {
        console.warn("Cloudinary upload fallback:", cldErr.message);
      }
    }

    const freeImageApiKey = process.env.FREEIMAGE_API_KEY || "6d207e02198a847aa98d0a2a901485a5";

    // 2. Upload to FreeImage.host API using native Node.js FormData
    const formData = new FormData();
    formData.append("key", freeImageApiKey);
    formData.append("action", "upload");
    formData.append("source", cleanBase64);
    formData.append("format", "json");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const cdnResponse = await fetch("https://freeimage.host/api/1/upload", {
      method: "POST",
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const cdnData = await cdnResponse.json().catch(() => null);

    if (cdnResponse.ok && cdnData && cdnData.status_code === 200 && cdnData.image && cdnData.image.url) {
      return res.status(200).json({
        success: true,
        url: cdnData.image.url,
        display_url: cdnData.image.display_url || cdnData.image.url,
        thumb_url: (cdnData.image.thumb && cdnData.image.thumb.url) || cdnData.image.url,
        name: filename,
        provider: "freeimage"
      });
    }

    // ImgBB Upload with user's key
    const imgbbKey = process.env.IMGBB_API_KEY || "5d369a9387210e1432e7018b92d3d0e8";
    if (imgbbKey) {
      try {
        const imgbbForm = new FormData();
        imgbbForm.append("key", imgbbKey);
        imgbbForm.append("image", cleanBase64);
        imgbbForm.append("name", filename);

        const imgbbRes = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: imgbbForm
        });
        const imgbbData = await imgbbRes.json();
        if (imgbbRes.ok && imgbbData && imgbbData.data && imgbbData.data.url) {
          return res.status(200).json({
            success: true,
            url: imgbbData.data.url,
            provider: "imgbb"
          });
        }
      } catch (fallbackErr) {
        console.warn("ImgBB fallback error:", fallbackErr);
      }
    }

    const errMsg = (cdnData && cdnData.error && cdnData.error.message) || "Failed to upload image to Cloud CDN.";
    return res.status(502).json({
      success: false,
      error: errMsg,
      details: cdnData
    });
  } catch (err) {
    console.error("Cloud Image Upload Serverless Error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error: " + (err.message || "Failed to process image.")
    });
  }
};
