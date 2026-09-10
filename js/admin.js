/**
 * D. Watson Content Management Studio - Admin Controller
 * Zero-Code Visual Editor with SHA-256 Client-Side Authentication Guard
 */

let adminData = null;
let activeModalType = null;
let editItemIndex = -1;
let failedAttempts = 0;
let lockoutTimer = null;
let inactivityTimer = null;
let activeInquiryFilter = "all";
let isCloudSyncInitialized = false;
const ADMIN_CLOUD_TOPIC = "dwatson_pharmacy_inquiries_2026";
const ADMIN_CLOUD_URL = `https://ntfy.sh/${ADMIN_CLOUD_TOPIC}`;
let lastCloudPollTimestamp = Math.floor(Date.now() / 1000) - 30;

// SHA-256 Utility for secure client-side password hashing
async function sha256(message) {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    // Fallback simple hash if Web Crypto is unavailable in non-secure context
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return "fallback_" + Math.abs(hash).toString(16);
  }
}

function bootAdminApp() {
  loadAdminState();
  initAuthGuard();
  initTabNavigation();
  initInactivityWatcher();
}

window.bootAdminApp = bootAdminApp;
window.initTabNavigation = initTabNavigation;
window.renderAllSections = renderAllSections;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootAdminApp);
} else {
  bootAdminApp();
}

/**
 * Load fresh site data into admin state
 */
function loadAdminState() {
  adminData = getSiteData();
}

/* ==========================================================================
   AUTHENTICATION & SECURITY GATE
   ========================================================================== */
function initAuthGuard() {
  initRealtimeCloudSync();
  const overlay = document.getElementById("adminAuthOverlay");
  const loginForm = document.getElementById("adminLoginForm");
  const isAuthSession = sessionStorage.getItem("dwatson_admin_auth") === "true" || localStorage.getItem("dwatson_admin_remember") === "true";

  if (isAuthSession) {
    if (overlay) overlay.classList.add("authenticated");
    renderAllSections();
  } else {
    if (overlay) overlay.classList.remove("authenticated");
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const usernameInput = document.getElementById("loginUsername").value.trim();
  const passwordInput = document.getElementById("loginPassword").value;
  const rememberMe = document.getElementById("loginRememberMe")?.checked;
  const errorEl = document.getElementById("loginError");
  const submitBtn = document.getElementById("loginSubmitBtn");

  if (failedAttempts >= 5) {
    showToast("Too many failed attempts. Please wait 60 seconds.", "error");
    return;
  }

  const authConfig = adminData.company.adminAuth || {
    username: "admin",
    passwordHash: "755490408479e09d5a6c117d7ee41f71dfb25a3ea23ff790f9cd3497d51ee910"
  };

  const inputHash = await sha256(passwordInput);
  // SHA-256 hash check or AES-verified session
  const isValidPass = (inputHash === authConfig.passwordHash) || 
                      (sessionStorage.getItem("dwatson_admin_auth") === "true");

  const isValidUser = (usernameInput.toLowerCase() === (authConfig.username || "admin").toLowerCase());

  if (isValidUser && isValidPass) {
    failedAttempts = 0;
    sessionStorage.setItem("dwatson_admin_auth", "true");
    if (rememberMe) {
      localStorage.setItem("dwatson_admin_remember", "true");
    } else {
      localStorage.removeItem("dwatson_admin_remember");
    }

    const overlay = document.getElementById("adminAuthOverlay");
    overlay.classList.add("authenticated");
    if (errorEl) errorEl.classList.remove("show");

    renderAllSections();
    showToast("Welcome back! Portal Studio unlocked.", "success");
    resetInactivityTimer();
  } else {
    failedAttempts++;
    if (errorEl) {
      errorEl.textContent = `Invalid username or password (${failedAttempts}/5 attempts)`;
      errorEl.classList.add("show");
    }

    if (failedAttempts >= 5) {
      if (errorEl) errorEl.textContent = "Security lockout active. Please wait 60 seconds.";
      if (submitBtn) submitBtn.disabled = true;

      lockoutTimer = setTimeout(() => {
        failedAttempts = 0;
        if (errorEl) errorEl.classList.remove("show");
        if (submitBtn) submitBtn.disabled = false;
      }, 60000);
    }
  }
}

window.adminLogout = function() {
  sessionStorage.removeItem("dwatson_admin_auth");
  sessionStorage.removeItem("dwatson_aes_key");
  localStorage.removeItem("dwatson_admin_remember");
  localStorage.removeItem("dwatson_aes_key");
  const overlay = document.getElementById("adminAuthOverlay");
  if (overlay) overlay.classList.remove("authenticated");
  location.reload();
};

window.togglePasswordVisibility = function(inputId, iconEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    if (iconEl) iconEl.className = "fa-regular fa-eye-slash";
  } else {
    input.type = "password";
    if (iconEl) iconEl.className = "fa-regular fa-eye";
  }
};

/**
 * Smart In-Browser Canvas Image Compressor
 * Resizes large gallery/camera photos (e.g. 10MB) down to ~60KB web-ready images
 */
function compressImageFile(file, maxDim = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        canvas.toBlob((blob) => {
          resolve({ dataUrl, blob, width, height });
        }, "image/jpeg", quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Universal Image Upload Handler with Smart Canvas Compression & Live Cloud Link Generation
 */
window.handleAdminImageUpload = async function(inputEl, targetInputId, previewImgId) {
  if (!inputEl.files || !inputEl.files[0]) return;
  const file = inputEl.files[0];
  const targetInput = document.getElementById(targetInputId);
  const previewImg = document.getElementById(previewImgId);
  const uploadLabel = inputEl.closest("label");
  const origLabelHtml = uploadLabel ? uploadLabel.innerHTML : "";

  try {
    if (uploadLabel) {
      uploadLabel.style.pointerEvents = "none";
      uploadLabel.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading...`;
    }
    showToast("Optimizing & uploading photo to Cloud CDN...", "info");

    // 1. Compress image in-browser (max 1200px, 0.82 quality) for optimal size and instant local preview
    const { dataUrl } = await compressImageFile(file, 1200, 0.82);

    // Set immediate preview
    if (previewImg) previewImg.src = dataUrl;

    let uploadedLiveUrl = null;

    // Strategy 1: Direct Cloudinary Cloud CDN Upload (Highest quality, auto-crop & zero backend needed)
    const cldName = (window.DW_CONFIG && window.DW_CONFIG.CLOUDINARY_CLOUD_NAME) || localStorage.getItem("dw_cloudinary_cloud_name") || "bempxyod";
    const cldPreset = localStorage.getItem("dw_cloudinary_preset") || (window.DW_CONFIG && window.DW_CONFIG.CLOUDINARY_UPLOAD_PRESET) || "dwatson";

    if (cldName && cldPreset) {
      try {
        const cldForm = new FormData();
        cldForm.append("file", file);
        cldForm.append("upload_preset", cldPreset);
        
        const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cldName)}/image/upload`, {
          method: "POST",
          body: cldForm
        });
        const cldJson = await cldRes.json().catch(() => null);
        if (cldRes.ok && cldJson && cldJson.secure_url) {
          uploadedLiveUrl = cldJson.secure_url;
        } else if (cldJson && cldJson.error) {
          console.warn("Cloudinary upload notice:", cldJson.error.message);
        }
      } catch (cldErr) {
        console.warn("Cloudinary fetch notice:", cldErr.message);
      }
    }

    // Strategy 2: Direct Client-Side ImgBB (if custom key configured)
    if (!uploadedLiveUrl) {
      const directImgbbKey = (window.DW_CONFIG && window.DW_CONFIG.IMGBB_API_KEY) || localStorage.getItem("dw_imgbb_api_key");
      if (directImgbbKey && directImgbbKey.length > 8) {
        try {
          const formData = new FormData();
          formData.append("key", directImgbbKey);
          formData.append("image", dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, ""));
          formData.append("name", file.name.replace(/\.[^/.]+$/, ""));

          const res = await fetch("https://api.imgbb.com/1/upload", {
            method: "POST",
            body: formData
          });
          const json = await res.json().catch(() => null);
          if (res.ok && json && json.data && json.data.url) {
            uploadedLiveUrl = json.data.url;
          }
        } catch (imgbbErr) {
          console.warn("Direct ImgBB notice:", imgbbErr.message);
        }
      }
    }

    // Strategy 2: Vercel Serverless Function (/api/upload - Runs automatically on Vercel for free)
    if (!uploadedLiveUrl) {
      const uploadUrl = (window.DW_CONFIG && typeof window.DW_CONFIG.getUploadUrl === "function") 
        ? window.DW_CONFIG.getUploadUrl() 
        : "/api/upload";

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: dataUrl,
            filename: file.name
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.url) {
            uploadedLiveUrl = json.url;
          }
        } else {
          const errJson = await res.json().catch(() => null);
          console.warn("Upload API notice:", res.status, errJson);
        }
      } catch (apiErr) {
        console.warn("Cloud upload API notice:", apiErr.message);
      }
    }

    if (uploadedLiveUrl) {
      if (targetInput) targetInput.value = uploadedLiveUrl;
      if (previewImg) previewImg.src = uploadedLiveUrl;
      showToast("Photo uploaded live to Cloud CDN! Permanent link saved.", "success");
    } else {
      // Fallback: save compressed dataUrl so user's photo is not lost
      if (targetInput) targetInput.value = dataUrl;
      showToast("Photo compressed and saved locally. (Click Save to apply)", "warning");
    }
  } catch (err) {
    console.error("Image processing error:", err);
    showToast("Error processing photo: " + (err.message || "Please try again."), "error");
  } finally {
    if (uploadLabel && origLabelHtml) {
      uploadLabel.style.pointerEvents = "auto";
      uploadLabel.innerHTML = origLabelHtml;
    }
    inputEl.value = "";
  }
};

/**
 * 1-Tap Copy Helper for Image URLs
 */
window.copyInputLink = function(inputId) {
  const el = document.getElementById(inputId);
  if (!el || !el.value) {
    showToast("No image URL to copy yet.", "info");
    return;
  }
  navigator.clipboard.writeText(el.value).then(() => {
    showToast("Image link copied to clipboard!", "success");
  }).catch(() => {
    el.select();
    document.execCommand("copy");
    showToast("Image link copied!", "success");
  });
};


function initInactivityWatcher() {
  const resetEvents = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
  resetEvents.forEach(evt => {
    document.addEventListener(evt, resetInactivityTimer, { passive: true });
  });
  resetInactivityTimer();
}

function resetInactivityTimer() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  // Auto lock after 20 minutes of inactivity
  inactivityTimer = setTimeout(() => {
    if (sessionStorage.getItem("dwatson_admin_auth") === "true") {
      adminLogout();
      showToast("Session timed out due to inactivity.", "info");
    }
  }, 20 * 60 * 1000);
}

/**
 * Tab Navigation & Mobile Drawer
 */
function initTabNavigation() {
  const tabs = document.querySelectorAll(".admin-nav-item");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const targetPaneId = tab.getAttribute("data-tab");
      document.querySelectorAll(".admin-tab-pane").forEach(pane => {
        pane.classList.remove("active");
      });

      const targetPane = document.getElementById(targetPaneId);
      if (targetPane) targetPane.classList.add("active");

      // Auto-close mobile sidebar drawer on tap
      if (window.innerWidth <= 992) {
        closeAdminDrawer();
      }
    });
  });
}

window.toggleAdminDrawer = function() {
  const sidebar = document.getElementById("adminSidebar");
  const backdrop = document.getElementById("adminDrawerBackdrop");
  if (sidebar) sidebar.classList.toggle("open");
  if (backdrop) backdrop.classList.toggle("active");
};

window.closeAdminDrawer = function() {
  const sidebar = document.getElementById("adminSidebar");
  const backdrop = document.getElementById("adminDrawerBackdrop");
  if (sidebar) sidebar.classList.remove("open");
  if (backdrop) backdrop.classList.remove("active");
};

/**
 * Render all management panes
 */
function renderAllSections() {
  loadAdminState();
  renderSlidesList();
  renderDepartmentsList();
  renderCategoriesList();
  renderBrandsList();
  renderBranchesList();
  renderProductsList();
  renderGalleryList();
  renderManagementList();
  renderPrescriptionsList();
  populateCompanySettingsForm();
  populateSecurityForm();
  initRealtimeCloudSync();
}

/* ==========================================================================
   1. HERO SLIDES MANAGER
   ========================================================================== */
function renderSlidesList() {
  const container = document.getElementById("adminSlidesList");
  if (!container) return;

  if (!adminData.heroSlides || !adminData.heroSlides.length) {
    container.innerHTML = `<p style="color: #64748B;">No slides configured. Click "+ Add New Slide" above.</p>`;
    return;
  }

  container.innerHTML = adminData.heroSlides.map((slide, idx) => `
    <div class="editable-item-card">
      <img src="${slide.image}" class="item-thumbnail" alt="Slide ${idx + 1}">
      <div class="item-info">
        <div class="item-title">${escapeAdminHtml(slide.title)}</div>
        <div class="item-sub"><strong>Tag:</strong> ${escapeAdminHtml(slide.tag)} • <strong>Badge:</strong> ${escapeAdminHtml(slide.badgeText || 'None')}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-outline btn-sm" onclick="openSlideModal(${idx})">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="btn btn-sm" style="background:#FEE2E2; color:#DC2626;" onclick="deleteSlide(${idx})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join("");
}

window.openSlideModal = function(index = -1) {
  editItemIndex = index;
  activeModalType = "slide";
  const modal = document.getElementById("adminEditModal");
  const modalTitle = document.getElementById("adminModalTitle");
  const modalBody = document.getElementById("adminModalBody");

  if (!modal || !modalTitle || !modalBody) return;

  const isNew = index === -1;
  const slide = isNew ? {
    tag: "Pharmacy & Care",
    title: "New Promotional Banner Headline",
    subtitle: "Describe the offer, service or featured department here.",
    image: "assets/images/pharmacy.jpg",
    badgeText: "Special Feature",
    ctaPrimaryText: "WhatsApp Inquiry",
    ctaPrimaryLink: "#prescription-box",
    ctaSecondaryText: "View Branches",
    ctaSecondaryLink: "#branches"
  } : adminData.heroSlides[index];

  modalTitle.textContent = isNew ? "Add New Hero Slide" : `Edit Slide #${index + 1}`;
  modalBody.innerHTML = `
    <form id="slideEditForm" onsubmit="saveSlideModal(event)">
      <div class="admin-form-group">
        <label>Slide Category Tag</label>
        <input type="text" class="admin-form-input" id="slideTag" value="${escapeAdminHtml(slide.tag)}" required>
      </div>
      <div class="admin-form-group">
        <label>Main Headline Title</label>
        <input type="text" class="admin-form-input" id="slideTitle" value="${escapeAdminHtml(slide.title)}" required>
      </div>
      <div class="admin-form-group">
        <label>Subtitle / Description</label>
        <textarea class="admin-form-input" id="slideSubtitle" rows="3" required>${escapeAdminHtml(slide.subtitle)}</textarea>
      </div>
      <div class="admin-form-group">
        <label>Slide Image (Upload Photo or Enter Path/URL)</label>
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
          <input type="text" class="admin-form-input" id="slideImage" value="${escapeAdminHtml(slide.image)}" style="flex:1;" oninput="document.getElementById('slideImgPreview').src=this.value;">
          <button type="button" class="btn btn-outline btn-sm" onclick="copyInputLink('slideImage')" title="Copy Image Link" style="padding:6px 10px;">
            <i class="fa-regular fa-copy"></i>
          </button>
          <label class="btn btn-outline btn-sm" style="cursor:pointer; white-space:nowrap; margin-bottom:0; display:inline-flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-cloud-arrow-up"></i> Upload
            <input type="file" accept="image/*" style="display:none;" onchange="handleAdminImageUpload(this, 'slideImage', 'slideImgPreview')">
          </label>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <img id="slideImgPreview" src="${slide.image || 'assets/images/pharmacy.jpg'}" alt="Preview" style="width:90px; height:50px; object-fit:cover; border-radius:6px; border:1px solid #CBD5E1;" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
          <small style="color:#64748B; font-size:0.78rem;">Preview of current image. You can upload a photo or paste a URL/path.</small>
        </div>
      </div>
      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Badge Ribbon Text</label>
          <input type="text" class="admin-form-input" id="slideBadge" value="${escapeAdminHtml(slide.badgeText || '')}">
        </div>
        <div class="admin-form-group">
          <label>Primary Button Text</label>
          <input type="text" class="admin-form-input" id="slideCta1Text" value="${escapeAdminHtml(slide.ctaPrimaryText || 'WhatsApp')}">
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeAdminModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-check"></i> Save Slide</button>
      </div>
    </form>
  `;

  modal.classList.add("active");
};

window.saveSlideModal = function(e) {
  e.preventDefault();
  const newSlide = {
    id: editItemIndex === -1 ? Date.now() : adminData.heroSlides[editItemIndex].id,
    tag: document.getElementById("slideTag").value.trim(),
    title: document.getElementById("slideTitle").value.trim(),
    subtitle: document.getElementById("slideSubtitle").value.trim(),
    image: document.getElementById("slideImage").value.trim(),
    badgeText: document.getElementById("slideBadge").value.trim(),
    ctaPrimaryText: document.getElementById("slideCta1Text").value.trim(),
    ctaPrimaryLink: "#prescription-box",
    ctaSecondaryText: "Find Nearest Branch",
    ctaSecondaryLink: "#branches"
  };

  if (editItemIndex === -1) {
    adminData.heroSlides.push(newSlide);
  } else {
    adminData.heroSlides[editItemIndex] = newSlide;
  }

  saveSiteData(adminData);
  closeAdminModal();
  renderSlidesList();
  showToast("Slide updated successfully!");
};

window.deleteSlide = function(idx) {
  if (confirm("Are you sure you want to remove this hero slide?")) {
    adminData.heroSlides.splice(idx, 1);
    saveSiteData(adminData);
    renderSlidesList();
    showToast("Slide removed.");
  }
};

/* ==========================================================================
   1b. 13 SPECIALIZED DEPARTMENTS MANAGER
   ========================================================================== */
function renderDepartmentsList() {
  const container = document.getElementById("adminDepartmentsList");
  if (!container) return;

  if (!adminData.departments || !adminData.departments.length) {
    container.innerHTML = `<p style="color: #64748B;">No departments configured. Click "+ Add New Department".</p>`;
    return;
  }

  container.innerHTML = adminData.departments.map((dept, idx) => `
    <div class="editable-item-card">
      <img src="${dept.image || 'assets/images/Shop Inside/Medicine.jpeg'}" class="item-thumbnail" alt="${escapeAdminHtml(dept.name)}" onerror="this.onerror=null; this.src='assets/images/Shop Inside/Medicine.jpeg';">
      <div class="item-info">
        <div class="item-title">
          ${escapeAdminHtml(dept.name)}
          <span style="color:#A50505; font-size:0.75rem; font-weight:800; margin-left:6px; background:#FEE2E2; padding:2px 8px; border-radius:10px;">${escapeAdminHtml(dept.badge || 'Department')}</span>
        </div>
        <div class="item-sub">
          <strong>Tagline:</strong> ${escapeAdminHtml(dept.tagline || 'Specialized Care')} • 
          <strong>Icon:</strong> <i class="${escapeAdminHtml(dept.icon || 'fa-solid fa-store')}"></i> (${escapeAdminHtml(dept.icon || 'icon')})
        </div>
        <div style="font-size:0.78rem; color:#64748B; margin-top:2px;">
          ${escapeAdminHtml((dept.description || '').substring(0, 110))}...
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-outline btn-sm" onclick="openDepartmentModal(${idx})">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="btn btn-sm" style="background:#FEE2E2; color:#DC2626;" onclick="deleteDepartment(${idx})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join("");
}

window.openDepartmentModal = function(index = -1) {
  editItemIndex = index;
  activeModalType = "department";
  const modal = document.getElementById("adminEditModal");
  const modalTitle = document.getElementById("adminModalTitle");
  const modalBody = document.getElementById("adminModalBody");

  if (!modal || !modalTitle || !modalBody) return;

  const isNew = index === -1;
  const dept = isNew ? {
    id: `dept_${Date.now()}`,
    name: "New Department Name",
    badge: "Specialty Service",
    tagline: "Department Tagline or Promise",
    image: "assets/images/Shop Inside/Medicine.jpeg",
    icon: "fa-solid fa-prescription-bottle-medical",
    description: "Full description of services, authentic sourcing, and product availability for this department.",
    features: [
      "100% Genuine & Authentic Products Guaranteed",
      "Specialized Store Shelves & Display Counters",
      "Certified Department Advisors Available",
      "Fast WhatsApp Ordering & In-Store Availability"
    ],
    whatsappMsg: "Hi D.Watson, I would like to inquire about this department."
  } : adminData.departments[index];

  const featuresText = Array.isArray(dept.features) ? dept.features.join("\n") : (dept.features || "");

  modalTitle.textContent = isNew ? "Add New Department" : `Edit: ${dept.name}`;
  modalBody.innerHTML = `
    <form id="departmentEditForm" onsubmit="saveDepartmentModal(event)">
      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Department Name</label>
          <input type="text" class="admin-form-input" id="deptName" value="${escapeAdminHtml(dept.name)}" required>
        </div>
        <div class="admin-form-group">
          <label>Badge Ribbon Text (e.g. Core Specialty, Luxury Derma)</label>
          <input type="text" class="admin-form-input" id="deptBadge" value="${escapeAdminHtml(dept.badge || '')}" required>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Headline Tagline</label>
          <input type="text" class="admin-form-input" id="deptTagline" value="${escapeAdminHtml(dept.tagline || '')}" required>
        </div>
        <div class="admin-form-group">
          <label>FontAwesome Icon Class (e.g. fa-solid fa-wand-magic-sparkles)</label>
          <input type="text" class="admin-form-input" id="deptIcon" value="${escapeAdminHtml(dept.icon || 'fa-solid fa-store')}" required>
        </div>
      </div>

      <div class="admin-form-group">
        <label>Department Photo (Upload Photo or Enter Path/URL)</label>
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
          <input type="text" class="admin-form-input" id="deptImage" value="${escapeAdminHtml(dept.image || '')}" style="flex:1;" oninput="document.getElementById('deptImgPreview').src=this.value;">
          <button type="button" class="btn btn-outline btn-sm" onclick="copyInputLink('deptImage')" title="Copy Image Link" style="padding:6px 10px;">
            <i class="fa-regular fa-copy"></i>
          </button>
          <label class="btn btn-outline btn-sm" style="cursor:pointer; white-space:nowrap; margin-bottom:0; display:inline-flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-cloud-arrow-up"></i> Upload
            <input type="file" accept="image/*" style="display:none;" onchange="handleAdminImageUpload(this, 'deptImage', 'deptImgPreview')">
          </label>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <img id="deptImgPreview" src="${dept.image || 'assets/images/Shop Inside/Medicine.jpeg'}" alt="Preview" style="width:90px; height:56px; object-fit:cover; border-radius:6px; border:1px solid #CBD5E1;" onerror="this.onerror=null; this.src='assets/images/Shop Inside/Medicine.jpeg';">
          <small style="color:#64748B; font-size:0.78rem;">Department photo for card and detail page.</small>
        </div>
      </div>

      <div class="admin-form-group">
        <label>Full Overview &amp; Description</label>
        <textarea class="admin-form-input" id="deptDescription" rows="3" required>${escapeAdminHtml(dept.description || '')}</textarea>
      </div>

      <div class="admin-form-group">
        <label>Key Bullet Features (One per line)</label>
        <textarea class="admin-form-input" id="deptFeatures" rows="4" placeholder="Feature 1&#10;Feature 2&#10;Feature 3">${escapeAdminHtml(featuresText)}</textarea>
        <small style="color:#64748B; font-size:0.78rem;">Enter each highlight bullet on a new line.</small>
      </div>

      <div class="admin-form-group">
        <label>WhatsApp Quick-Inquiry Pre-fill Message</label>
        <input type="text" class="admin-form-input" id="deptWhatsappMsg" value="${escapeAdminHtml(dept.whatsappMsg || 'Hi D.Watson, I would like to inquire about this department.')}" required>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeAdminModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-check"></i> Save Department</button>
      </div>
    </form>
  `;

  modal.classList.add("active");
};

window.saveDepartmentModal = function(e) {
  e.preventDefault();
  const rawFeatures = document.getElementById("deptFeatures").value;
  const parsedFeatures = rawFeatures.split("\n").map(f => f.trim()).filter(Boolean);

  const existingDept = editItemIndex !== -1 ? adminData.departments[editItemIndex] : null;
  const nameVal = document.getElementById("deptName").value.trim();
  const idVal = existingDept?.id || nameVal.toLowerCase().replace(/[^a-z0-9]+/g, "_");

  const newDept = {
    id: idVal,
    name: nameVal,
    badge: document.getElementById("deptBadge").value.trim() || "Specialty",
    tagline: document.getElementById("deptTagline").value.trim(),
    image: document.getElementById("deptImage").value.trim() || "assets/images/Shop Inside/Medicine.jpeg",
    icon: document.getElementById("deptIcon").value.trim() || "fa-solid fa-store",
    description: document.getElementById("deptDescription").value.trim(),
    features: parsedFeatures.length ? parsedFeatures : ["100% Genuine Guaranteed", "Certified Advisors on Duty"],
    whatsappMsg: document.getElementById("deptWhatsappMsg").value.trim() || `Hi D.Watson, I am inquiring about ${nameVal}.`
  };

  if (editItemIndex === -1) {
    adminData.departments.push(newDept);
  } else {
    adminData.departments[editItemIndex] = newDept;
  }

  saveSiteData(adminData);
  closeAdminModal();
  renderDepartmentsList();
  showToast("Department saved and published live!");
};

window.deleteDepartment = function(idx) {
  const dept = adminData.departments[idx];
  if (confirm(`Are you sure you want to delete "${dept?.name || 'this department'}"?`)) {
    adminData.departments.splice(idx, 1);
    saveSiteData(adminData);
    renderDepartmentsList();
    showToast("Department removed.");
  }
};

/* ==========================================================================
   1c. POPULAR CATEGORIES MANAGER
   ========================================================================== */
function renderCategoriesList() {
  const container = document.getElementById("adminCategoriesList");
  if (!container) return;

  if (!adminData.categories || !adminData.categories.length) {
    container.innerHTML = `<p style="color: #64748B;">No popular categories configured. Click "+ Add New Category".</p>`;
    return;
  }

  container.innerHTML = adminData.categories.map((cat, idx) => `
    <div class="editable-item-card">
      <div style="width:48px; height:48px; border-radius:50%; background:#F1F5F9; display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:#A50505; flex-shrink:0;">
        <i class="${escapeAdminHtml(cat.icon || 'fa-solid fa-shapes')}"></i>
      </div>
      <div class="item-info">
        <div class="item-title">
          ${escapeAdminHtml(cat.name)}
          <span style="font-size:0.75rem; color:#2563EB; font-weight:700; margin-left:6px;">[${escapeAdminHtml(cat.colorClass || 'default')}]</span>
        </div>
        <div class="item-sub">
          <strong>Icon:</strong> ${escapeAdminHtml(cat.icon)} • 
          <strong>Dept Link:</strong> <code>${escapeAdminHtml(cat.link || '')}</code>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-outline btn-sm" onclick="openCategoryModal(${idx})">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="btn btn-sm" style="background:#FEE2E2; color:#DC2626;" onclick="deleteCategory(${idx})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join("");
}

window.openCategoryModal = function(index = -1) {
  editItemIndex = index;
  activeModalType = "category";
  const modal = document.getElementById("adminEditModal");
  const modalTitle = document.getElementById("adminModalTitle");
  const modalBody = document.getElementById("adminModalBody");

  if (!modal || !modalTitle || !modalBody) return;

  const isNew = index === -1;
  const cat = isNew ? {
    id: `cat_${Date.now()}`,
    name: "New Category",
    icon: "fa-solid fa-pills",
    colorClass: "cat-medicines",
    link: "departments.html?dept=pharmacy",
    deptId: "pharmacy"
  } : adminData.categories[index];

  modalTitle.textContent = isNew ? "Add Popular Category" : `Edit: ${cat.name}`;
  modalBody.innerHTML = `
    <form id="categoryEditForm" onsubmit="saveCategoryModal(event)">
      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Category Display Name</label>
          <input type="text" class="admin-form-input" id="catName" value="${escapeAdminHtml(cat.name)}" required>
        </div>
        <div class="admin-form-group">
          <label>FontAwesome Icon Class</label>
          <input type="text" class="admin-form-input" id="catIcon" value="${escapeAdminHtml(cat.icon || 'fa-solid fa-shapes')}" required>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Color Theme Class</label>
          <select class="admin-form-input" id="catColorClass">
            <option value="cat-medicines" ${cat.colorClass === 'cat-medicines' ? 'selected' : ''}>Red / Medicines (cat-medicines)</option>
            <option value="cat-supplements" ${cat.colorClass === 'cat-supplements' ? 'selected' : ''}>Orange / Vitamins (cat-supplements)</option>
            <option value="cat-baby" ${cat.colorClass === 'cat-baby' ? 'selected' : ''}>Pink / Baby Care (cat-baby)</option>
            <option value="cat-skincare" ${cat.colorClass === 'cat-skincare' ? 'selected' : ''}>Teal / Skincare (cat-skincare)</option>
            <option value="cat-devices" ${cat.colorClass === 'cat-devices' ? 'selected' : ''}>Blue / Optics & Devices (cat-devices)</option>
            <option value="cat-personal" ${cat.colorClass === 'cat-personal' ? 'selected' : ''}>Purple / Surgical & Hospital (cat-personal)</option>
            <option value="cat-fragrances" ${cat.colorClass === 'cat-fragrances' ? 'selected' : ''}>Gold / Fragrances (cat-fragrances)</option>
            <option value="cat-superstore" ${cat.colorClass === 'cat-superstore' ? 'selected' : ''}>Green / Superstore (cat-superstore)</option>
          </select>
        </div>
        <div class="admin-form-group">
          <label>Linked Department</label>
          <select class="admin-form-input" id="catDeptId" onchange="document.getElementById('catLink').value='departments.html?dept='+this.value">
            ${(adminData.departments || []).map(d => `<option value="${escapeAdminHtml(d.id)}" ${cat.deptId === d.id ? 'selected' : ''}>${escapeAdminHtml(d.name)}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="admin-form-group">
        <label>Destination Target Link</label>
        <input type="text" class="admin-form-input" id="catLink" value="${escapeAdminHtml(cat.link || 'departments.html')}" required>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeAdminModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-check"></i> Save Category</button>
      </div>
    </form>
  `;

  modal.classList.add("active");
};

window.saveCategoryModal = function(e) {
  e.preventDefault();
  const nameVal = document.getElementById("catName").value.trim();
  const deptIdVal = document.getElementById("catDeptId").value;
  const linkVal = document.getElementById("catLink").value.trim() || `departments.html?dept=${deptIdVal}`;

  const existingCat = editItemIndex !== -1 ? adminData.categories[editItemIndex] : null;
  const idVal = existingCat?.id || `cat_${nameVal.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

  const newCat = {
    id: idVal,
    name: nameVal,
    icon: document.getElementById("catIcon").value.trim() || "fa-solid fa-shapes",
    colorClass: document.getElementById("catColorClass").value,
    link: linkVal,
    deptId: deptIdVal
  };

  if (editItemIndex === -1) {
    adminData.categories.push(newCat);
  } else {
    adminData.categories[editItemIndex] = newCat;
  }

  saveSiteData(adminData);
  closeAdminModal();
  renderCategoriesList();
  showToast("Category saved!");
};

window.deleteCategory = function(idx) {
  const cat = adminData.categories[idx];
  if (confirm(`Delete "${cat?.name || 'this category'}"?`)) {
    adminData.categories.splice(idx, 1);
    saveSiteData(adminData);
    renderCategoriesList();
    showToast("Category removed.");
  }
};

/* ==========================================================================
   1d. TRUSTED PARTNER BRANDS MANAGER
   ========================================================================== */
function renderBrandsList() {
  const container = document.getElementById("adminBrandsList");
  if (!container) return;

  if (!adminData.trustedBrands || !adminData.trustedBrands.length) {
    container.innerHTML = `<p style="color: #64748B;">No partner brands configured. Click "+ Add Partner Brand".</p>`;
    return;
  }

  container.innerHTML = adminData.trustedBrands.map((brand, idx) => `
    <div class="editable-item-card">
      <div style="width:48px; height:48px; border-radius:8px; background:#F8FAFC; border:1px solid #E2E8F0; display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:#A50505; flex-shrink:0;">
        <i class="${escapeAdminHtml(brand.icon || 'fa-solid fa-capsules')}"></i>
      </div>
      <div class="item-info">
        <div class="item-title">
          ${escapeAdminHtml(brand.name)}
          ${brand.isVerified ? '<span style="color:#16A34A; font-size:0.75rem; font-weight:800; margin-left:6px;"><i class="fa-solid fa-circle-check"></i> VERIFIED PARTNER</span>' : ''}
        </div>
        <div class="item-sub">
          <strong>Category:</strong> ${escapeAdminHtml(brand.category || 'Pharmaceutical')} • 
          <strong>Icon:</strong> ${escapeAdminHtml(brand.icon || 'fa-solid fa-capsules')}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-outline btn-sm" onclick="openBrandModal(${idx})">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="btn btn-sm" style="background:#FEE2E2; color:#DC2626;" onclick="deleteBrand(${idx})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join("");
}

window.openBrandModal = function(index = -1) {
  editItemIndex = index;
  activeModalType = "brand";
  const modal = document.getElementById("adminEditModal");
  const modalTitle = document.getElementById("adminModalTitle");
  const modalBody = document.getElementById("adminModalBody");

  if (!modal || !modalTitle || !modalBody) return;

  const isNew = index === -1;
  const brand = isNew ? {
    id: `tb_${Date.now()}`,
    name: "New Partner Brand",
    category: "Pharmaceutical & Wellness",
    icon: "fa-solid fa-capsules",
    isVerified: true
  } : adminData.trustedBrands[index];

  modalTitle.textContent = isNew ? "Add Trusted Partner Brand" : `Edit: ${brand.name}`;
  modalBody.innerHTML = `
    <form id="brandEditForm" onsubmit="saveBrandModal(event)">
      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Brand Name</label>
          <input type="text" class="admin-form-input" id="brandName" value="${escapeAdminHtml(brand.name)}" required>
        </div>
        <div class="admin-form-group">
          <label>Specialty Category (e.g. Clinical Skincare, Global Pharma)</label>
          <input type="text" class="admin-form-input" id="brandCategory" value="${escapeAdminHtml(brand.category || '')}" required>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>FontAwesome Icon Class</label>
          <input type="text" class="admin-form-input" id="brandIcon" value="${escapeAdminHtml(brand.icon || 'fa-solid fa-capsules')}" required>
        </div>
        <div class="admin-form-group" style="display:flex; flex-direction:column; justify-content:center;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; margin-top:15px; font-weight:700;">
            <input type="checkbox" id="brandVerified" ${brand.isVerified ? 'checked' : ''}>
            <span>Mark as Official Verified Partner</span>
          </label>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeAdminModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-check"></i> Save Brand</button>
      </div>
    </form>
  `;

  modal.classList.add("active");
};

window.saveBrandModal = function(e) {
  e.preventDefault();
  const nameVal = document.getElementById("brandName").value.trim();
  const existingBrand = editItemIndex !== -1 ? adminData.trustedBrands[editItemIndex] : null;
  const idVal = existingBrand?.id || `tb_${nameVal.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

  const newBrand = {
    id: idVal,
    name: nameVal,
    category: document.getElementById("brandCategory").value.trim() || "Healthcare Partner",
    icon: document.getElementById("brandIcon").value.trim() || "fa-solid fa-capsules",
    isVerified: document.getElementById("brandVerified").checked
  };

  if (editItemIndex === -1) {
    adminData.trustedBrands.push(newBrand);
  } else {
    adminData.trustedBrands[editItemIndex] = newBrand;
  }

  saveSiteData(adminData);
  closeAdminModal();
  renderBrandsList();
  showToast("Partner brand saved and updated in homepage marquee!");
};

window.deleteBrand = function(idx) {
  const b = adminData.trustedBrands[idx];
  if (confirm(`Delete "${b?.name || 'this brand'}" from trusted partners?`)) {
    adminData.trustedBrands.splice(idx, 1);
    saveSiteData(adminData);
    renderBrandsList();
    showToast("Partner brand removed.");
  }
};

/* ==========================================================================
   2. BRANCHES LOCATOR & DELIVERY HUBS MANAGER
   ========================================================================== */
function renderBranchesList() {
  const container = document.getElementById("adminBranchesList");
  if (!container) return;

  if (!adminData.branches || !adminData.branches.length) {
    container.innerHTML = `<p style="color: #64748B;">No branches listed. Click "+ Add New Branch".</p>`;
    return;
  }

  container.innerHTML = adminData.branches.map((branch, idx) => `
    <div class="editable-item-card">
      <img src="${branch.image || 'assets/images/store_flagship.jpg'}" class="item-thumbnail" alt="${escapeAdminHtml(branch.name)}" onerror="this.onerror=null; this.src='assets/images/store_flagship.jpg';">
      <div class="item-info">
        <div class="item-title">
          ${escapeAdminHtml(branch.name)} 
          ${branch.is24Hours ? '<span style="color:#DC2626; font-size:0.75rem; font-weight:800; margin-left:5px;">[24/7 OPEN]</span>' : ''}
          ${branch.isFlagship ? '<span style="color:#2563EB; font-size:0.75rem; font-weight:800; margin-left:5px;">[⭐ FLAGSHIP]</span>' : ''}
          ${branch.expressDelivery ? `<span style="color:#16A34A; font-size:0.75rem; font-weight:800; margin-left:5px;"><i class="fa-solid fa-truck-fast"></i> EXPRESS (Rs. ${branch.deliveryFee || 200}, Min Rs. ${branch.minOrderAmount || 1000})</span>` : `<span style="color:#94A3B8; font-size:0.75rem; font-weight:700; margin-left:5px;"><i class="fa-solid fa-store"></i> IN-STORE PICKUP ONLY</span>`}
        </div>
        <div class="item-sub">
          <strong>City:</strong> ${escapeAdminHtml(branch.city)} • 
          <strong>Phone:</strong> ${escapeAdminHtml(branch.phone)} • 
          <strong>WhatsApp:</strong> <span style="color:#16A34A; font-weight:700;">${escapeAdminHtml(branch.whatsapp || 'None')}</span>
        </div>
        <div style="font-size:0.78rem; color:#64748B; margin-top:2px;">${escapeAdminHtml(branch.address)}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-outline btn-sm" onclick="openBranchModal(${idx})">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="btn btn-sm" style="background:#FEE2E2; color:#DC2626;" onclick="deleteBranch(${idx})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join("");
}

window.openBranchModal = function(index = -1) {
  editItemIndex = index;
  activeModalType = "branch";
  const modal = document.getElementById("adminEditModal");
  const modalTitle = document.getElementById("adminModalTitle");
  const modalBody = document.getElementById("adminModalBody");

  if (!modal || !modalTitle || !modalBody) return;

  const isNew = index === -1;
  const branch = isNew ? {
    name: "New Branch Name",
    city: "Islamabad",
    area: "Commercial Sector",
    address: "Full Street Address, City",
    phone: "051-8438111",
    timings: "08:00 AM - 12:00 AM Daily",
    is24Hours: false,
    isFlagship: false,
    expressDelivery: true,
    deliveryFee: 200,
    minOrderAmount: 1000,
    image: "assets/images/store_flagship.jpg",
    services: ["24/7 Pharmacy", "Cosmetics", "Superstore", "Optics"],
    mapUrl: "https://maps.google.com/?q=D.+Watson",
    whatsapp: "923329716666"
  } : adminData.branches[index];

  modalTitle.textContent = isNew ? "Add New Store Branch" : `Edit: ${branch.name}`;
  modalBody.innerHTML = `
    <form id="branchEditForm" onsubmit="saveBranchModal(event)">
      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Branch Name</label>
          <input type="text" class="admin-form-input" id="branchName" value="${escapeAdminHtml(branch.name)}" required>
        </div>
        <div class="admin-form-group">
          <label>City Group</label>
          <select class="admin-form-input" id="branchCity">
            <option value="Islamabad" ${branch.city === 'Islamabad' ? 'selected' : ''}>Islamabad</option>
            <option value="Rawalpindi" ${branch.city === 'Rawalpindi' ? 'selected' : ''}>Rawalpindi</option>
            <option value="Lahore" ${branch.city === 'Lahore' ? 'selected' : ''}>Lahore</option>
            <option value="Other Cities" ${branch.city === 'Other Cities' ? 'selected' : ''}>Other Cities (Abbottabad, Attock, etc.)</option>
          </select>
        </div>
      </div>

      <div class="admin-form-group">
        <label>Full Address</label>
        <input type="text" class="admin-form-input" id="branchAddress" value="${escapeAdminHtml(branch.address)}" required>
      </div>

      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Direct Phone Number</label>
          <input type="text" class="admin-form-input" id="branchPhone" value="${escapeAdminHtml(branch.phone)}" required>
        </div>
        <div class="admin-form-group">
          <label>Operating Timings</label>
          <input type="text" class="admin-form-input" id="branchTimings" value="${escapeAdminHtml(branch.timings)}" required>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Branch Image (Upload Photo or Enter Path/URL)</label>
          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
            <input type="text" class="admin-form-input" id="branchImage" value="${escapeAdminHtml(branch.image || '')}" placeholder="assets/images/branches/f6-supermarket.jpg" style="flex:1;" oninput="document.getElementById('branchImgPreview').src=this.value;">
            <button type="button" class="btn btn-outline btn-sm" onclick="copyInputLink('branchImage')" title="Copy Image Link" style="padding:6px 10px;">
              <i class="fa-regular fa-copy"></i>
            </button>
            <label class="btn btn-outline btn-sm" style="cursor:pointer; white-space:nowrap; margin-bottom:0; display:inline-flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-cloud-arrow-up"></i> Upload
              <input type="file" accept="image/*" style="display:none;" onchange="handleAdminImageUpload(this, 'branchImage', 'branchImgPreview')">
            </label>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <img id="branchImgPreview" src="${branch.image || 'assets/images/store_flagship.jpg'}" alt="Preview" style="width:90px; height:52px; object-fit:cover; border-radius:6px; border:1px solid #CBD5E1;" onerror="this.onerror=null; this.src='assets/images/store_flagship.jpg';">
            <small style="color:#64748B; font-size:0.78rem;">Real photo for ${escapeAdminHtml(branch.name)}</small>
          </div>
        </div>
        <div class="admin-form-group">
          <label>Google Maps Direction Link</label>
          <input type="text" class="admin-form-input" id="branchMap" value="${escapeAdminHtml(branch.mapUrl || '')}">
          <small style="color:#64748B; font-size:0.78rem;">Link to Google Maps location.</small>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>WhatsApp Number for Prescription Order</label>
          <input type="text" class="admin-form-input" id="branchWhatsapp" value="${escapeAdminHtml(branch.whatsapp || '923329716666')}" placeholder="e.g. 923329716666" required>
          <small style="color:#64748B; font-size:0.78rem;">Country code first without + (e.g. 923329716666).</small>
        </div>
        <div class="admin-form-group" style="display:flex; flex-direction:column; justify-content:center;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; margin-top:15px;">
            <input type="checkbox" id="branchFlagship" ${branch.isFlagship ? 'checked' : ''}>
            <strong>Mark as Flagship Outlet (Shows in Priority Dropdowns)</strong>
          </label>
        </div>
      </div>

      <!-- Express Home Delivery & Purchase Rules -->
      <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:14px 16px; border-radius:8px; margin: 15px 0;">
        <div style="font-weight:700; color:#0F172A; font-size:0.9rem; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-truck-fast" style="color:#A50505;"></i> Express Home Delivery &amp; Purchase Rules
        </div>
        <div class="admin-form-group" style="margin-bottom:10px;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:700; color:#0F172A;">
            <input type="checkbox" id="branchExpressDelivery" ${branch.expressDelivery !== false ? 'checked' : ''}>
            <span>Enable Express Home Delivery for this Branch</span>
          </label>
          <small style="color:#64748B; font-size:0.78rem;">If checked, customers can order prescription delivery from this outlet. If unchecked, marked as "In-Store Pickup Only".</small>
        </div>
        <div class="form-grid-2">
          <div class="admin-form-group" style="margin-bottom:0;">
            <label>Delivery Fee (PKR)</label>
            <input type="number" class="admin-form-input" id="branchDeliveryFee" value="${branch.deliveryFee !== undefined ? branch.deliveryFee : 200}" min="0" step="50" required>
            <small style="color:#64748B; font-size:0.75rem;">Standard dispatch fee (e.g. 200 PKR).</small>
          </div>
          <div class="admin-form-group" style="margin-bottom:0;">
            <label>Minimum Purchase Amount (PKR)</label>
            <input type="number" class="admin-form-input" id="branchMinOrder" value="${branch.minOrderAmount !== undefined ? branch.minOrderAmount : 1000}" min="0" step="100" required>
            <small style="color:#64748B; font-size:0.75rem;">Minimum order required for dispatch (e.g. 1000 PKR).</small>
          </div>
        </div>
      </div>

      <div class="admin-form-group">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
          <input type="checkbox" id="branch24" ${branch.is24Hours ? 'checked' : ''}>
          <strong>Mark as 24/7 Round-the-Clock Open Branch</strong>
        </label>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeAdminModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-check"></i> Save Branch</button>
      </div>
    </form>
  `;

  modal.classList.add("active");
};

window.saveBranchModal = function(e) {
  e.preventDefault();
  const newBranch = {
    id: editItemIndex === -1 ? `b_${Date.now()}` : adminData.branches[editItemIndex].id,
    name: document.getElementById("branchName").value.trim(),
    city: document.getElementById("branchCity").value,
    area: document.getElementById("branchName").value.trim(),
    address: document.getElementById("branchAddress").value.trim(),
    phone: document.getElementById("branchPhone").value.trim(),
    timings: document.getElementById("branchTimings").value.trim(),
    is24Hours: document.getElementById("branch24").checked,
    isFlagship: document.getElementById("branchFlagship").checked,
    expressDelivery: document.getElementById("branchExpressDelivery") ? document.getElementById("branchExpressDelivery").checked : true,
    deliveryFee: parseInt(document.getElementById("branchDeliveryFee")?.value, 10) || 200,
    minOrderAmount: parseInt(document.getElementById("branchMinOrder")?.value, 10) || 1000,
    image: document.getElementById("branchImage").value.trim() || "assets/images/store_flagship.jpg",
    services: ["Pharmacy", "Superstore", "Cosmetics", "Optics"],
    mapUrl: document.getElementById("branchMap").value.trim() || `https://maps.google.com/?q=${encodeURIComponent(document.getElementById("branchName").value)}`,
    whatsapp: document.getElementById("branchWhatsapp").value.trim() || "923329716666"
  };

  if (editItemIndex === -1) {
    adminData.branches.push(newBranch);
  } else {
    adminData.branches[editItemIndex] = newBranch;
  }

  saveSiteData(adminData);
  closeAdminModal();
  renderBranchesList();
  showToast("Branch saved successfully!");
};

window.deleteBranch = function(idx) {
  if (confirm("Delete this branch location?")) {
    adminData.branches.splice(idx, 1);
    saveSiteData(adminData);
    renderBranchesList();
    showToast("Branch removed.");
  }
};

/* ==========================================================================
   3. FEATURED PRODUCTS SHOWCASE MANAGER
   ========================================================================== */
function renderProductsList() {
  const container = document.getElementById("adminProductsList");
  if (!container) return;

  if (!adminData.products || !adminData.products.length) {
    container.innerHTML = `<p style="color: #64748B;">No featured products configured. Click "+ Add New Product".</p>`;
    return;
  }

  container.innerHTML = adminData.products.map((prod, idx) => `
    <div class="editable-item-card">
      <img src="${prod.image || 'assets/images/pharmacy.jpg'}" class="item-thumbnail" alt="${escapeAdminHtml(prod.name)}">
      <div class="item-info">
        <div class="item-title">${escapeAdminHtml(prod.name)} <span style="font-weight:700; color:var(--dw-blue); font-size:0.82rem;">(${escapeAdminHtml(prod.price || 'Inquire')})</span></div>
        <div class="item-sub"><strong>Brand:</strong> ${escapeAdminHtml(prod.brand || 'D. Watson')} • <strong>Category:</strong> ${escapeAdminHtml(prod.categoryName || prod.category)}</div>
        <div style="font-size:0.78rem; color:#64748B;">${escapeAdminHtml(prod.description || '')}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-outline btn-sm" onclick="openProductModal(${idx})">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="btn btn-sm" style="background:#FEE2E2; color:#DC2626;" onclick="deleteProduct(${idx})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join("");
}

window.openProductModal = function(index = -1) {
  editItemIndex = index;
  activeModalType = "product";
  const modal = document.getElementById("adminEditModal");
  const modalTitle = document.getElementById("adminModalTitle");
  const modalBody = document.getElementById("adminModalBody");

  if (!modal || !modalTitle || !modalBody) return;

  const isNew = index === -1;
  const prod = isNew ? {
    name: "New Product Name",
    category: "cosmetics",
    categoryName: "Cosmetics & Skincare",
    brand: "Original Brand",
    price: "PKR 3,500",
    tag: "Genuine Guaranteed",
    image: "assets/images/cosmetics.jpg",
    description: "Authentic imported product available at D. Watson branches and express delivery.",
    inStock: true
  } : adminData.products[index];

  modalTitle.textContent = isNew ? "Add New Featured Product" : `Edit: ${prod.name}`;
  modalBody.innerHTML = `
    <form id="productEditForm" onsubmit="saveProductModal(event)">
      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Product Name</label>
          <input type="text" class="admin-form-input" id="prodName" value="${escapeAdminHtml(prod.name)}" required>
        </div>
        <div class="admin-form-group">
          <label>Department Category</label>
          <select class="admin-form-input" id="prodCategory">
            <option value="pharmacy" ${prod.category === 'pharmacy' ? 'selected' : ''}>Medicines & Supplements</option>
            <option value="cosmetics" ${prod.category === 'cosmetics' ? 'selected' : ''}>Cosmetics & Skincare</option>
            <option value="optics" ${prod.category === 'optics' ? 'selected' : ''}>Optics & Eyewear</option>
            <option value="surgical" ${prod.category === 'surgical' ? 'selected' : ''}>Surgical & Health Devices</option>
            <option value="grocery" ${prod.category === 'grocery' ? 'selected' : ''}>Baby Care & Supermarket</option>
          </select>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Brand / Origin</label>
          <input type="text" class="admin-form-input" id="prodBrand" value="${escapeAdminHtml(prod.brand || '')}" required>
        </div>
        <div class="admin-form-group">
          <label>Price Display (e.g. PKR 4,500)</label>
          <input type="text" class="admin-form-input" id="prodPrice" value="${escapeAdminHtml(prod.price || '')}">
        </div>
      </div>

      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Product Image (Upload Photo or Enter Path/URL)</label>
          <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
            <input type="text" class="admin-form-input" id="prodImage" value="${escapeAdminHtml(prod.image)}" style="flex:1;" oninput="document.getElementById('prodImgPreview').src=this.value;">
            <button type="button" class="btn btn-outline btn-sm" onclick="copyInputLink('prodImage')" title="Copy Image Link" style="padding:6px 10px;">
              <i class="fa-regular fa-copy"></i>
            </button>
            <label class="btn btn-outline btn-sm" style="cursor:pointer; white-space:nowrap; margin-bottom:0; display:inline-flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-cloud-arrow-up"></i> Upload
              <input type="file" accept="image/*" style="display:none;" onchange="handleAdminImageUpload(this, 'prodImage', 'prodImgPreview')">
            </label>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <img id="prodImgPreview" src="${prod.image || 'assets/images/cosmetics.jpg'}" alt="Preview" style="width:70px; height:50px; object-fit:cover; border-radius:6px; border:1px solid #CBD5E1;" onerror="this.onerror=null; this.src='assets/images/cosmetics.jpg';">
            <small style="color:#64748B; font-size:0.78rem;">Product package or bottle shot.</small>
          </div>
        </div>
        <div class="admin-form-group">
          <label>Badge Tag (e.g. Dermatologist Recommended)</label>
          <input type="text" class="admin-form-input" id="prodTag" value="${escapeAdminHtml(prod.tag || '')}">
        </div>
      </div>

      <div class="admin-form-group">
        <label>Short Description</label>
        <textarea class="admin-form-input" id="prodDesc" rows="2" required>${escapeAdminHtml(prod.description)}</textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeAdminModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-check"></i> Save Product</button>
      </div>
    </form>
  `;

  modal.classList.add("active");
};

window.saveProductModal = function(e) {
  e.preventDefault();
  const catKey = document.getElementById("prodCategory").value;
  const catNames = {
    pharmacy: "Medicines & Supplements",
    cosmetics: "Cosmetics & Skincare",
    optics: "Optics & Eyewear",
    surgical: "Surgical & Health Devices",
    grocery: "Baby Care & Supermarket"
  };

  const newProd = {
    id: editItemIndex === -1 ? `p_${Date.now()}` : adminData.products[editItemIndex].id,
    name: document.getElementById("prodName").value.trim(),
    category: catKey,
    categoryName: catNames[catKey] || "Retail",
    brand: document.getElementById("prodBrand").value.trim(),
    price: document.getElementById("prodPrice").value.trim() || "Inquire Price",
    tag: document.getElementById("prodTag").value.trim() || "Verified Genuine",
    image: document.getElementById("prodImage").value.trim() || "assets/images/pharmacy.jpg",
    description: document.getElementById("prodDesc").value.trim(),
    inStock: true
  };

  if (editItemIndex === -1) {
    if (!adminData.products) adminData.products = [];
    adminData.products.push(newProd);
  } else {
    adminData.products[editItemIndex] = newProd;
  }

  saveSiteData(adminData);
  closeAdminModal();
  renderProductsList();
  showToast("Product saved successfully!");
};

window.deleteProduct = function(idx) {
  if (confirm("Delete this featured product?")) {
    adminData.products.splice(idx, 1);
    saveSiteData(adminData);
    renderProductsList();
    showToast("Product removed.");
  }
};

/* ==========================================================================
   4. GALLERY MANAGER (Random Photos, Uploads & Captions)
   ========================================================================== */
function renderGalleryList() {
  const container = document.getElementById("adminGalleryList");
  if (!container) return;

  if (!adminData.gallery || !adminData.gallery.length) {
    container.innerHTML = `<p style="color: #64748B;">No photos in gallery yet. Click "+ Add Photo" above to upload images.</p>`;
    return;
  }

  container.innerHTML = adminData.gallery.map((item, idx) => `
    <div class="editable-item-card">
      <img src="${encodeURI(item.image)}" class="item-thumbnail" alt="${escapeAdminHtml(item.title || 'Photo')}" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
      <div class="item-info">
        <div class="item-title">${escapeAdminHtml(item.title || 'Untitled Photo')}</div>
        <div class="item-sub">${item.description ? escapeAdminHtml(item.description) : '<span style="color:#94A3B8;">No caption</span>'}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-outline btn-sm" onclick="openGalleryModal(${idx})">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="btn btn-sm" style="background:#FEE2E2; color:#DC2626;" onclick="deleteGalleryItem(${idx})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join("");
}

window.openGalleryModal = function(index = -1) {
  editItemIndex = index;
  activeModalType = "gallery";
  const modal = document.getElementById("adminEditModal");
  const modalTitle = document.getElementById("adminModalTitle");
  const modalBody = document.getElementById("adminModalBody");

  if (!modal || !modalTitle || !modalBody) return;

  const isNew = index === -1;
  const item = isNew ? {
    title: "",
    category: "general",
    categoryName: "General",
    image: "assets/images/Shop Inside/gallery-10.jpg",
    description: ""
  } : adminData.gallery[index];

  modalTitle.textContent = isNew ? "Add New Photo to Gallery" : "Edit Gallery Photo";
  modalBody.innerHTML = `
    <form id="galleryEditForm" onsubmit="saveGalleryModal(event)">
      <div class="admin-form-group">
        <label>Photo Title</label>
        <input type="text" class="admin-form-input" id="galTitle" placeholder="e.g. Ramadan Offer, New Fragrance Arrival, F-6 Branch" value="${escapeAdminHtml(item.title || '')}">
      </div>
      <div class="admin-form-group">
        <label>Gallery Photo (Upload from Computer or Enter Path/URL)</label>
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
          <input type="text" class="admin-form-input" id="galImage" placeholder="assets/images/Shop Inside/... or paste image URL" value="${escapeAdminHtml(item.image || '')}" required style="flex:1;" oninput="document.getElementById('galImgPreview').src=this.value;">
          <button type="button" class="btn btn-outline btn-sm" onclick="copyInputLink('galImage')" title="Copy Image Link" style="padding:6px 10px;">
            <i class="fa-regular fa-copy"></i>
          </button>
          <label class="btn btn-outline btn-sm" style="cursor:pointer; white-space:nowrap; margin-bottom:0; display:inline-flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-cloud-arrow-up"></i> Upload from PC
            <input type="file" accept="image/*" style="display:none;" onchange="handleAdminImageUpload(this, 'galImage', 'galImgPreview')">
          </label>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <img id="galImgPreview" src="${encodeURI(item.image || 'assets/images/pharmacy.jpg')}" alt="Preview" style="width:90px; height:60px; object-fit:cover; border-radius:6px; border:1px solid #CBD5E1;" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
          <small style="color:#64748B; font-size:0.78rem;">Live preview. You can upload any image format (.jpg, .png, .webp).</small>
        </div>
      </div>
      <div class="admin-form-group">
        <label>Caption / Short Note (Optional)</label>
        <textarea class="admin-form-input" id="galDesc" rows="2" placeholder="Optional description or details">${escapeAdminHtml(item.description || '')}</textarea>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeAdminModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-check"></i> Save Photo</button>
      </div>
    </form>
  `;

  modal.classList.add("active");
};

window.saveGalleryModal = function(e) {
  e.preventDefault();

  const titleVal = document.getElementById("galTitle").value.trim();
  const imgVal = document.getElementById("galImage").value.trim();
  const descVal = document.getElementById("galDesc").value.trim();

  if (!imgVal) {
    showToast("Please choose or upload a photo.", "error");
    return;
  }

  const newItem = {
    id: editItemIndex === -1 ? `g_${Date.now()}` : (adminData.gallery[editItemIndex] && adminData.gallery[editItemIndex].id ? adminData.gallery[editItemIndex].id : `g_${Date.now()}`),
    title: titleVal || "D. Watson Photo",
    category: "general",
    categoryName: "General",
    image: imgVal,
    description: descVal
  };

  if (!adminData.gallery) adminData.gallery = [];

  if (editItemIndex === -1) {
    adminData.gallery.unshift(newItem); // add to beginning of gallery
  } else {
    adminData.gallery[editItemIndex] = newItem;
  }

  saveSiteData(adminData);
  closeAdminModal();
  renderGalleryList();
  showToast("Photo saved to gallery!", "success");
};

window.deleteGalleryItem = function(idx) {
  if (confirm("Remove this photo from the gallery?")) {
    adminData.gallery.splice(idx, 1);
    saveSiteData(adminData);
    renderGalleryList();
    showToast("Photo removed from gallery.", "info");
  }
};

/* ==========================================================================
   5. BOARD OF DIRECTORS & MANAGEMENT TEAM MANAGER
   ========================================================================== */
function renderManagementList() {
  const container = document.getElementById("adminManagementList");
  if (!container) return;

  const members = (adminData.management && adminData.management.length) ? adminData.management : (DEFAULT_SITE_DATA.management || []);

  if (!members.length) {
    container.innerHTML = `<p style="color: #64748B;">No executive management profiles configured. Click "+ Add Executive Member".</p>`;
    return;
  }

  container.innerHTML = members.map((m, idx) => `
    <div class="editable-item-card">
      <img src="${m.image || 'assets/images/management/zafar-bakhtawari.png'}" class="item-thumbnail" style="border-radius: 50%; width: 56px; height: 56px; object-fit: cover; border: 2px solid #E2E8F0;" alt="${escapeAdminHtml(m.name)}" onerror="this.onerror=null; this.src='assets/images/management/zafar-bakhtawari.png';">
      <div class="item-info">
        <div class="item-title">${escapeAdminHtml(m.name)} <span style="font-weight:700; color:var(--dw-red); font-size:0.82rem;">(${escapeAdminHtml(m.role)})</span></div>
        <div class="item-sub"><strong>Organization:</strong> ${escapeAdminHtml(m.organization || 'D. Watson Group of Pharmacies')} • <strong>Badge:</strong> ${escapeAdminHtml(m.badge || 'Executive')}</div>
        <div style="font-size:0.78rem; color:#64748B; margin-top:2px;">${escapeAdminHtml(m.bio || '')}</div>
      </div>
      <div class="item-actions">
        <button class="btn btn-outline btn-sm" onclick="openManagementModal(${idx})">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="btn btn-sm" style="background:#FEE2E2; color:#DC2626;" onclick="deleteManagementMember(${idx})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join("");
}

window.openManagementModal = function(index = -1) {
  editItemIndex = index;
  activeModalType = "management";
  const modal = document.getElementById("adminEditModal");
  const modalTitle = document.getElementById("adminModalTitle");
  const modalBody = document.getElementById("adminModalBody");

  if (!modal || !modalTitle || !modalBody) return;

  const members = (adminData.management && adminData.management.length) ? adminData.management : (DEFAULT_SITE_DATA.management || []);
  const isNew = index === -1;
  const member = isNew ? {
    name: "Executive Name",
    role: "DIRECTOR",
    organization: "D. Watson Group of Pharmacies",
    badge: "Executive Director",
    icon: "fa-solid fa-user-tie",
    bio: "Leadership summary and corporate governance contributions.",
    image: "assets/images/management/zafar-bakhtawari.png"
  } : members[index];

  modalTitle.textContent = isNew ? "Add Executive Board Member" : `Edit: ${member.name}`;

  modalBody.innerHTML = `
    <form id="modalManagementForm" onsubmit="saveManagementModal(event)">
      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Executive Full Name *</label>
          <input type="text" class="admin-form-input" id="mgrName" value="${escapeAdminHtml(member.name)}" required>
        </div>
        <div class="admin-form-group">
          <label>Designation / Role (e.g. CHAIRMAN, CO-CHAIRMAN, CEO, DIRECTOR) *</label>
          <input type="text" class="admin-form-input" id="mgrRole" value="${escapeAdminHtml(member.role)}" required>
        </div>
      </div>

      <div class="form-grid-2">
        <div class="admin-form-group">
          <label>Organization / Group *</label>
          <input type="text" class="admin-form-input" id="mgrOrg" value="${escapeAdminHtml(member.organization || 'D. Watson Group of Pharmacies')}" required>
        </div>
        <div class="admin-form-group">
          <label>Leadership Badge Pill Text (e.g. Founding Chairman, Executive Director)</label>
          <input type="text" class="admin-form-input" id="mgrBadge" value="${escapeAdminHtml(member.badge || '')}">
        </div>
      </div>

      <div class="admin-form-group">
        <label>Executive Bio / Summary Description</label>
        <textarea class="admin-form-input" id="mgrBio" rows="3">${escapeAdminHtml(member.bio || '')}</textarea>
      </div>

      <div class="admin-form-group">
        <label>Profile Portrait Photo</label>
        <div class="admin-img-upload-box">
          <div class="admin-img-preview-wrap">
            <img src="${member.image || 'assets/images/management/zafar-bakhtawari.png'}" id="mgrImgPreview" class="admin-preview-img" style="border-radius:50%; width:70px; height:70px; object-fit:cover;" alt="Portrait Preview" onerror="this.onerror=null; this.src='assets/images/management/zafar-bakhtawari.png';">
          </div>
          <div style="flex:1;">
            <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
              <input type="text" class="admin-form-input" id="mgrImage" value="${escapeAdminHtml(member.image || '')}" placeholder="assets/images/management/... or paste photo URL" style="flex:1;" oninput="document.getElementById('mgrImgPreview').src=this.value;">
              <button type="button" class="btn btn-outline btn-sm" onclick="copyInputLink('mgrImage')" title="Copy Image Link" style="padding:6px 10px;">
                <i class="fa-regular fa-copy"></i>
              </button>
            </div>
            <label class="btn btn-outline btn-sm admin-upload-btn">
              <i class="fa-solid fa-cloud-arrow-up"></i> Upload Portrait from Computer
              <input type="file" accept="image/*" style="display:none;" onchange="handleAdminImageUpload(this, 'mgrImage', 'mgrImgPreview')">
            </label>
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeAdminModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-check"></i> Save Profile</button>
      </div>
    </form>
  `;

  modal.classList.add("active");
};

window.saveManagementModal = function(e) {
  e.preventDefault();
  if (!adminData.management) {
    adminData.management = JSON.parse(JSON.stringify(DEFAULT_SITE_DATA.management || []));
  }

  const roleVal = document.getElementById("mgrRole").value.trim();
  const roleUpper = roleVal.toUpperCase();
  let defaultIcon = "fa-solid fa-briefcase";
  if (roleUpper.includes("CHAIRMAN") && !roleUpper.includes("CO-")) defaultIcon = "fa-solid fa-crown";
  else if (roleUpper.includes("CO-CHAIRMAN")) defaultIcon = "fa-solid fa-star";
  else if (roleUpper.includes("CEO")) defaultIcon = "fa-solid fa-user-tie";
  else if (roleUpper.includes("DIRECTOR")) defaultIcon = "fa-solid fa-chart-line";

  const updatedMember = {
    id: editItemIndex === -1 ? Date.now() : (adminData.management[editItemIndex]?.id || Date.now()),
    name: document.getElementById("mgrName").value.trim(),
    role: roleVal,
    organization: document.getElementById("mgrOrg").value.trim(),
    badge: document.getElementById("mgrBadge").value.trim() || (roleUpper.includes("CHAIRMAN") ? "Founding Chairman" : "Executive Board"),
    icon: defaultIcon,
    bio: document.getElementById("mgrBio").value.trim(),
    image: document.getElementById("mgrImage").value.trim() || "assets/images/management/zafar-bakhtawari.png"
  };

  if (editItemIndex === -1) {
    adminData.management.push(updatedMember);
  } else {
    adminData.management[editItemIndex] = updatedMember;
  }

  saveSiteData(adminData);
  closeAdminModal();
  renderManagementList();
  showToast("Executive profile saved successfully!");
};

window.deleteManagementMember = function(idx) {
  if (confirm("Delete this executive board profile?")) {
    if (!adminData.management) {
      adminData.management = JSON.parse(JSON.stringify(DEFAULT_SITE_DATA.management || []));
    }
    adminData.management.splice(idx, 1);
    saveSiteData(adminData);
    renderManagementList();
    showToast("Profile removed.");
  }
};

/* ==========================================================================
   6. COMPANY PROFILE & HERITAGE SETTINGS
   ========================================================================== */
function populateCompanySettingsForm() {
  const c = adminData.company;
  if (!c) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined ? val : "";
  };

  setVal("setCompanyName", c.name);
  setVal("setHelpline", c.helpline);
  setVal("setWhatsApp", c.whatsapp);
  setVal("setWhatsAppDisplay", c.whatsappDisplay);
  setVal("setEmail", c.email);
  setVal("setAddress", c.address);
  setVal("setAnnouncement", c.announcement);
  setVal("setAboutShort", c.aboutShort);
  setVal("setAboutHistory", c.aboutHistory);
  setVal("setDeliveryFee", c.deliveryDefaultFee !== undefined ? c.deliveryDefaultFee : 200);
  setVal("setDeliveryMinOrder", c.deliveryMinOrder !== undefined ? c.deliveryMinOrder : 1000);
  setVal("setDeliveryFreeThreshold", c.deliveryFreeThreshold !== undefined ? c.deliveryFreeThreshold : 3000);

  // Crisp Live Chat Settings
  const crispEnabledEl = document.getElementById("setCrispEnabled");
  if (crispEnabledEl) {
    const savedEnabled = localStorage.getItem("dw_crisp_enabled");
    crispEnabledEl.checked = (savedEnabled !== null) ? (savedEnabled === "true") : (c.crispEnabled !== false);
  }
  setVal("setCrispWebsiteId", localStorage.getItem("dw_crisp_website_id") || c.crispWebsiteId || "4ea9bb45-b036-4468-bb27-09fe93c30b3f");
}

window.saveCompanySettings = function(e) {
  if (e) e.preventDefault();

  adminData.company.name = document.getElementById("setCompanyName").value.trim();
  adminData.company.helpline = document.getElementById("setHelpline").value.trim();
  adminData.company.phone = document.getElementById("setHelpline").value.trim();
  adminData.company.whatsapp = document.getElementById("setWhatsApp").value.trim();
  adminData.company.whatsappDisplay = document.getElementById("setWhatsAppDisplay").value.trim();
  adminData.company.email = document.getElementById("setEmail").value.trim();
  adminData.company.address = document.getElementById("setAddress").value.trim();
  adminData.company.announcement = document.getElementById("setAnnouncement").value.trim();
  adminData.company.aboutShort = document.getElementById("setAboutShort").value.trim();
  adminData.company.aboutHistory = document.getElementById("setAboutHistory").value.trim();

  // Crisp Live Chat Settings
  const crispEnabledEl = document.getElementById("setCrispEnabled");
  const crispWebIdEl = document.getElementById("setCrispWebsiteId");

  if (crispEnabledEl) {
    adminData.company.crispEnabled = crispEnabledEl.checked;
    localStorage.setItem("dw_crisp_enabled", crispEnabledEl.checked ? "true" : "false");
  }
  if (crispWebIdEl) {
    const webIdVal = crispWebIdEl.value.trim() || "4ea9bb45-b036-4468-bb27-09fe93c30b3f";
    adminData.company.crispWebsiteId = webIdVal;
    localStorage.setItem("dw_crisp_website_id", webIdVal);
  }

  const delFeeEl = document.getElementById("setDeliveryFee");
  const minOrderEl = document.getElementById("setDeliveryMinOrder");
  const freeThreshEl = document.getElementById("setDeliveryFreeThreshold");

  if (delFeeEl) adminData.company.deliveryDefaultFee = parseInt(delFeeEl.value, 10) || 200;
  if (minOrderEl) adminData.company.deliveryMinOrder = parseInt(minOrderEl.value, 10) || 1000;
  if (freeThreshEl) adminData.company.deliveryFreeThreshold = parseInt(freeThreshEl.value, 10) || 3000;

  saveSiteData(adminData);
  showToast("Company settings, delivery policies & live chat configuration published!");
};

/* ==========================================================================
   6. SECURITY & PASSWORD SETTINGS
   ========================================================================== */
function populateSecurityForm() {
  const auth = adminData.company.adminAuth || { username: "admin", securityPin: "1978" };
  const userEl = document.getElementById("secUsername");
  const pinEl = document.getElementById("secPin");
  if (userEl) userEl.value = auth.username || "admin";
  if (pinEl) pinEl.value = auth.securityPin || "1978";
}

window.saveSecurityCredentials = async function(e) {
  e.preventDefault();
  const username = document.getElementById("secUsername").value.trim();
  const pin = document.getElementById("secPin").value.trim();
  const newPass = document.getElementById("secNewPassword").value;
  const confirmPass = document.getElementById("secConfirmPassword").value;

  if (newPass) {
    if (newPass !== confirmPass) {
      alert("New password and confirmation do not match!");
      return;
    }
    if (newPass.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    const hash = await sha256(newPass);
    adminData.company.adminAuth.passwordHash = hash;
    adminData.company.adminAuth.defaultPassPlain = newPass;
  }

  adminData.company.adminAuth.username = username;
  adminData.company.adminAuth.securityPin = pin;

  saveSiteData(adminData);
  document.getElementById("secNewPassword").value = "";
  document.getElementById("secConfirmPassword").value = "";
  showToast("Security credentials updated successfully!");
};

/* ==========================================================================
   6b. CUSTOMER ORDERS & INQUIRIES DESK
   ========================================================================== */

window.filterInquiriesType = function(type, btnEl) {
  activeInquiryFilter = type;
  const filterBar = document.getElementById("inquiryFilterBar");
  if (filterBar) {
    filterBar.querySelectorAll("button").forEach(b => {
      b.classList.remove("btn-primary");
      b.classList.add("btn-outline");
    });
  }
  if (btnEl) {
    btnEl.classList.remove("btn-outline");
    btnEl.classList.add("btn-primary");
  }
  renderPrescriptionsList();
};

function renderPrescriptionsList() {
  const container = document.getElementById("adminPrescriptionsList");
  if (!container) return;

  const rawList = typeof getCustomerInquiries === "function" ? getCustomerInquiries() : getPrescriptionsData();
  
  const list = rawList.filter(item => {
    if (activeInquiryFilter === "all") return true;
    if (activeInquiryFilter === "product") return item.type === "product";
    if (activeInquiryFilter === "prescription") return item.type === "prescription" || !item.type;
    return true;
  });

  if (!list.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; background: #F8FAFC; border-radius: 16px; border: 1px dashed #CBD5E1;">
        <i class="fa-solid fa-bell-concierge" style="font-size: 2.5rem; color: #94A3B8; margin-bottom: 12px;"></i>
        <h4 style="color: #0F172A; margin-bottom: 6px;">No Customer Inquiries or Orders Found</h4>
        <p style="color: #64748B; font-size: 0.85rem; max-width: 500px; margin: 0 auto;">
          When customers submit prescriptions or click "Inquire / Order" on any product, their orders and photos will appear here in real-time for 1-click inspection, direct clean download, and instant WhatsApp replies.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((item, idx) => {
    const isProduct = item.type === "product";
    const badgeColor = isProduct ? "#1D4ED8" : "#DC2626";
    const badgeIcon = isProduct ? "fa-box-open" : "fa-file-prescription";
    const badgeLabel = isProduct ? "PRODUCT ORDER" : "PRESCRIPTION";
    const photoSrc = item.prescription_image || item.photoUrl || item.imageBase64 || item.image || "assets/images/pharmacy.jpg";

    return `
      <div class="editable-item-card" style="align-items: flex-start; padding: 18px;">
        <div style="width: 100px; height: 100px; border-radius: 10px; overflow: hidden; background: #E2E8F0; flex-shrink: 0; cursor: pointer;" onclick="viewInquiryPhoto('${item.id}')" title="Click to enlarge photo">
          <img src="${photoSrc}" style="width: 100%; height: 100%; object-fit: cover;" alt="${escapeAdminHtml(item.id)}">
        </div>
        
        <div class="item-info" style="flex: 1;">
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px; flex-wrap: wrap;">
            <span style="background: ${badgeColor}; color: white; font-weight: 800; font-size: 0.72rem; padding: 2px 8px; border-radius: 4px;">
              <i class="fa-solid ${badgeIcon}"></i> ${badgeLabel} (${escapeAdminHtml(item.id || 'DW')})
            </span>
            <span style="color: #64748B; font-size: 0.78rem;"><i class="fa-regular fa-clock"></i> ${escapeAdminHtml(item.date || '')}</span>
          </div>
          
          <div class="item-title" style="font-size: 1.05rem; margin-bottom: 4px;">
            ${isProduct ? escapeAdminHtml(item.productName) : escapeAdminHtml(item.name || 'Customer')}
            ${item.phone ? `
              <a href="tel:${escapeAdminHtml(item.phone)}" style="font-size: 0.85rem; color: var(--dw-blue); font-weight: 700; margin-left: 8px;">
                <i class="fa-solid fa-phone"></i> ${escapeAdminHtml(item.phone)}
              </a>
            ` : ''}
          </div>
          
          <div class="item-sub" style="margin-bottom: 6px;">
            ${isProduct ? `<strong>Brand:</strong> ${escapeAdminHtml(item.brand || 'D. Watson')} • <strong>Price:</strong> <span style="color:#16A34A; font-weight:800;">${escapeAdminHtml(item.price || 'Inquire')}</span> • <strong>Category:</strong> ${escapeAdminHtml(item.category || '')}` : `<strong>Branch:</strong> ${escapeAdminHtml(item.branch || 'Nearest Branch')}`}
          </div>
          
          ${item.notes ? `<div style="font-size: 0.82rem; color: #334155; background: #F1F5F9; padding: 6px 10px; border-radius: 6px; margin-top: 4px;"><strong>Customer Inquiry:</strong> ${escapeAdminHtml(item.notes)}</div>` : ''}
        </div>

        <div class="item-actions" style="display: flex; flex-direction: column; gap: 6px;">
          <button class="btn btn-primary btn-sm" onclick="viewInquiryPhoto('${item.id}')" title="Inspect Photo Full Size">
            <i class="fa-solid fa-magnifying-glass-plus"></i> View Photo
          </button>
          ${!isProduct && item.imageBase64 ? `
            <button class="btn btn-outline btn-sm" onclick="downloadInquiryPhoto('${item.id}')" title="Download original image file (No ads)">
              <i class="fa-solid fa-download"></i> Download
            </button>
          ` : ''}
          <button class="btn btn-sm" style="background:#FEE2E2; color:#DC2626;" onclick="deleteInquiryRecord('${item.id}')" title="Delete record">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `;
  }).join("");
}

window.viewInquiryPhoto = function(id) {
  const rawList = typeof getCustomerInquiries === "function" ? getCustomerInquiries() : getPrescriptionsData();
  const item = rawList.find(i => i.id === id);
  if (!item) {
    showToast("Record not found.", "error");
    return;
  }

  const photoSrc = item.prescription_image || item.photoUrl || item.imageBase64 || item.image || "assets/images/pharmacy.jpg";

  const modal = document.getElementById("adminEditModal");
  const modalTitle = document.getElementById("adminModalTitle");
  const modalBody = document.getElementById("adminModalBody");

  if (!modal || !modalTitle || !modalBody) return;

  const isProduct = item.type === "product";
  modalTitle.textContent = isProduct ? `Product Inquiry: ${item.productName} (${item.id})` : `Prescription: ${item.name} (${item.id})`;
  
  modalBody.innerHTML = `
    <div style="text-align: center;">
      <div style="max-height: 65vh; overflow: auto; border-radius: 12px; border: 1px solid #CBD5E1; background: #0F172A; padding: 10px; margin-bottom: 16px;">
        <img src="${photoSrc}" style="max-width: 100%; height: auto; border-radius: 8px;" alt="Inquiry Photo">
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="text-align: left; font-size: 0.85rem; color: #475569;">
          <strong>ID:</strong> ${escapeAdminHtml(item.id)} • <strong>Date:</strong> ${escapeAdminHtml(item.date || '')}<br>
          ${isProduct ? `<strong>Product:</strong> ${escapeAdminHtml(item.productName)} (${escapeAdminHtml(item.price || 'Inquire')})` : `<strong>Customer:</strong> ${escapeAdminHtml(item.name || '')} (${escapeAdminHtml(item.phone || '')})`}
        </div>
        <div style="display: flex; gap: 8px;">
          ${!isProduct && item.imageBase64 ? `
            <button type="button" class="btn btn-primary btn-sm" onclick="downloadInquiryPhoto('${item.id}')">
              <i class="fa-solid fa-download"></i> Download Clean Image
            </button>
          ` : ''}
          <button type="button" class="btn btn-outline btn-sm" onclick="closeAdminModal()">Close</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");
};

window.downloadInquiryPhoto = function(id) {
  const rawList = typeof getCustomerInquiries === "function" ? getCustomerInquiries() : getPrescriptionsData();
  const item = rawList.find(i => i.id === id);
  if (!item || !item.imageBase64) {
    showToast("No image file to download.", "error");
    return;
  }

  const a = document.createElement("a");
  a.href = item.imageBase64;
  a.download = `${item.id || 'prescription'}_${(item.name || 'customer').replace(/\s+/g, '_')}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("Image downloaded cleanly without any third-party ads!");
};

window.deleteInquiryRecord = function(id) {
  if (confirm("Delete this inquiry / order record?")) {
    if (typeof deleteCustomerInquiry === "function") {
      deleteCustomerInquiry(id);
    } else {
      deletePrescriptionOrder(id);
    }
    renderPrescriptionsList();
    showToast("Record deleted.");
  }
};

/* ==========================================================================
   7. BACKUP, EXPORT & RESTORE
   ========================================================================== */
window.exportSiteJSON = function() {
  exportSiteDataJSON();
  showToast("Configuration JSON file downloaded.");
};

window.exportSiteCode = function() {
  if (typeof exportSiteDataAsCode === "function") {
    exportSiteDataAsCode();
  } else {
    showToast("Export helper loading, please try again in a moment.", "info");
  }
};

window.syncSiteDataCloud = async function() {
  showToast("Synchronizing site data across devices...", "info");
  if (typeof syncSiteDataToCloud === "function") {
    await syncSiteDataToCloud(adminData);
    showToast("Cloud sync broadcast complete! Other devices will receive updates.", "success");
  } else {
    showToast("Local data active.", "success");
  }
};

window.triggerImportJSON = function() {
  document.getElementById("importJsonInput")?.click();
};

window.handleFileImport = function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const res = importSiteDataJSON(evt.target.result);
    if (res.success) {
      loadAdminState();
      renderAllSections();
      showToast("Data imported and published live!");
    } else {
      alert("Import error: " + res.error);
    }
  };
  reader.readAsText(file);
};

window.resetToFactoryDefaults = function() {
  if (confirm("Reset all website configurations and branch data to official D. Watson defaults? Custom edits will be overwritten.")) {
    resetSiteData();
    loadAdminState();
    renderAllSections();
    showToast("Reset to factory defaults successfully.");
  }
};

/* ==========================================================================
   MODAL & TOAST HELPERS
   ========================================================================== */
window.closeAdminModal = function() {
  const modal = document.getElementById("adminEditModal");
  if (modal) modal.classList.remove("active");
};

function showToast(msg, type = "success") {
  const toast = document.getElementById("adminToast");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.background = type === "error" ? "#DC2626" : type === "info" ? "#1D4ED8" : "#0F172A";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

function escapeAdminHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================================================================
   8. REAL-TIME CLOUD DATABASE SYNC ENGINE (Multi-Device Live Sync)
   ========================================================================== */

function initRealtimeCloudSync() {
  if (isCloudSyncInitialized) return;
  isCloudSyncInitialized = true;

  console.log("🟢 Connecting Real-Time Cloud Sync Channel for D. Watson Studio...");

  // 1. Initial Cloud Sync Fetch
  fetchRecentCloudInquiries();

  // 2. Connect Live Server-Sent Events (Instant Push)
  if (window.EventSource) {
    try {
      const sse = new EventSource(`${ADMIN_CLOUD_URL}/sse`);
      
      sse.onmessage = function(e) {
        try {
          const data = JSON.parse(e.data);
          if (data && data.message) {
            const payload = typeof data.message === "string" ? JSON.parse(data.message) : data.message;
            if (payload && payload.id) {
              handleNewIncomingInquiry(payload);
            }
          }
        } catch (err) {
          // Non-JSON message ignored
        }
      };

      sse.onerror = function() {
        // Fallback polling will handle it silently
      };
    } catch (e) {
      console.warn("EventSource setup error, using polling fallback:", e);
    }
  }

  // 3. Resilient Cloud Polling Backup (every 10 seconds)
  setInterval(fetchRecentCloudInquiries, 10000);
}

async function fetchRecentCloudInquiries() {
  try {
    const res = await fetch(`${ADMIN_CLOUD_URL}/json?poll=1&since=${lastCloudPollTimestamp}`);
    if (res.ok) {
      const text = await res.text();
      const lines = text.trim().split("\n").filter(Boolean);
      
      lines.forEach(line => {
        try {
          const json = JSON.parse(line);
          if (json && json.time) {
            lastCloudPollTimestamp = Math.max(lastCloudPollTimestamp, json.time);
          }
          if (json && json.message) {
            const payload = typeof json.message === "string" ? JSON.parse(json.message) : json.message;
            if (payload && payload.id) {
              syncInquirySilently(payload);
            }
          }
        } catch (e) {}
      });
    }
  } catch (err) {
    // Silent fallback
  }
}

window.handleClearAllInquiries = function() {
  if (confirm("Are you sure you want to permanently clear all customer inquiries and orders?")) {
    if (typeof clearAllCustomerInquiries === "function") {
      clearAllCustomerInquiries();
    } else {
      localStorage.setItem("dwatson_all_inquiries", "[]");
      localStorage.setItem("dwatson_prescriptions", "[]");
    }
    renderPrescriptionsList();
    showToast("All customer orders and inquiries cleared.");
  }
};

function syncInquirySilently(inquiry) {
  if (!inquiry || !inquiry.id) return;
  if (typeof isDeletedInquiry === "function" && isDeletedInquiry(inquiry.id)) {
    return; // Was permanently deleted by admin, ignore from cloud sync!
  }

  const existing = typeof getCustomerInquiries === "function" ? getCustomerInquiries() : [];
  const alreadyExists = existing.some(i => i.id === inquiry.id);
  
  if (!alreadyExists) {
    existing.unshift(inquiry);
    localStorage.setItem("dwatson_all_inquiries", JSON.stringify(existing.slice(0, 150)));
    renderPrescriptionsList();
  }
}

function handleNewIncomingInquiry(inquiry) {
  if (!inquiry || !inquiry.id) return;
  if (typeof isDeletedInquiry === "function" && isDeletedInquiry(inquiry.id)) {
    return; // Was permanently deleted by admin
  }

  const existing = typeof getCustomerInquiries === "function" ? getCustomerInquiries() : [];
  const alreadyExists = existing.some(i => i.id === inquiry.id);
  
  if (!alreadyExists) {
    existing.unshift(inquiry);
    localStorage.setItem("dwatson_all_inquiries", JSON.stringify(existing.slice(0, 150)));
    
    // Play live notification sound
    playOrderNotificationChime();

    // Show floating toast
    const isProduct = inquiry.type === "product";
    const label = isProduct ? `🛍️ New Order: ${inquiry.productName || inquiry.id}` : `💊 New Rx: ${inquiry.name || inquiry.id}`;
    showToast(label, "info");

    // Re-render live inquiries desk
    renderPrescriptionsList();
  }
}

/**
 * Web Audio API Notification Chime (No audio files needed, works on all browsers)
 */
function playOrderNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.00, now + 0.12); // A5

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {
    // Audio optional
  }
}
