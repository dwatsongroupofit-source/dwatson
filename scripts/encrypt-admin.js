/**
 * D. Watson Chemist & Superstore - Admin Studio AES-256 Crypter
 * Encrypts the entire admin studio HTML & controllers with AES-GCM-256.
 * Zero plaintext passwords or hashes are stored in the final admin.html.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const rootDir = path.resolve(__dirname, "..");
const srcFile = path.join(rootDir, "admin.src.html");
const destFile = path.join(rootDir, "admin.html");

const password = process.argv[2] || process.env.ADMIN_PORTAL_PASSWORD;

if (!password) {
  console.error("❌ Please provide the encryption password as an argument:\n   Usage: node scripts/encrypt-admin.js <your-password>");
  process.exit(1);
}

if (!fs.existsSync(srcFile)) {
  console.error("❌ admin.src.html not found! Please ensure source template exists.");
  process.exit(1);
}

const rawHtml = fs.readFileSync(srcFile, "utf8");

// Extract the protected content (everything after the auth overlay)
const startMarker = "<!-- === PROTECTED STUDIO CONTENT START === -->";
const endMarker = "<!-- === PROTECTED STUDIO CONTENT END === -->";

let protectedContent = "";
if (rawHtml.includes(startMarker) && rawHtml.includes(endMarker)) {
  const parts = rawHtml.split(startMarker);
  protectedContent = parts[1].split(endMarker)[0].trim();
} else {
  // Fallback extraction: after </form>\s*</div>\s*</div>
  const match = rawHtml.match(/<\/form>\s*<\/div>\s*<\/div>([\s\S]*?)<\/body>/i);
  if (match) {
    protectedContent = match[1].trim();
  } else {
    console.error("❌ Could not locate protected studio content in admin.src.html");
    process.exit(1);
  }
}

console.log(`🔐 Encrypting ${protectedContent.length} characters of studio content with AES-256-GCM...`);

// AES-256-GCM Encryption compatible with Web Crypto API
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const iterations = 100000;

const key = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

const ciphertext = Buffer.concat([
  cipher.update(protectedContent, "utf8"),
  cipher.final(),
  cipher.getAuthTag()
]);

const payloadObj = {
  v: 1,
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  data: ciphertext.toString("base64")
};

const payloadJson = JSON.stringify(payloadObj);

// Build final admin.html
const finalAdminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base href="/">
  <title>D. Watson Portal Studio | Zero-Code Content &amp; Security Management</title>
  <meta name="robots" content="noindex, nofollow">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Font Awesome 6 -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <!-- Cache Control (Zero Stale Assets) -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="assets/images/favicon.png">
  <link rel="shortcut icon" href="favicon.ico">

  <!-- Stylesheets (Dynamic Cache-Busting) -->
  <link rel="stylesheet" href="css/style.css?v=25.0">
  <link rel="stylesheet" href="css/admin.css?v=${Date.now()}">

  <style>
    /* Preserve seamless flexbox layout */
    #adminStudioMount {
      display: contents;
    }
    .admin-mobile-quick-tabs {
      display: none;
    }
    @media (max-width: 992px) {
      .admin-mobile-quick-tabs {
        display: flex;
        background: #0F172A;
        padding: 8px 12px;
        overflow-x: auto;
        white-space: nowrap;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        position: sticky;
        top: 64px;
        z-index: 1050;
        gap: 8px;
      }
      .admin-mobile-quick-tabs::-webkit-scrollbar {
        display: none;
      }
      .admin-mobile-quick-tabs .quick-tab-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.08);
        color: #94A3B8;
        font-size: 0.8rem;
        font-weight: 700;
        border: 1px solid rgba(255, 255, 255, 0.12);
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .admin-mobile-quick-tabs .quick-tab-btn.active {
        background: #DC2626;
        color: #FFFFFF;
        border-color: #DC2626;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
      }
    }
    /* AES Decryptor Specific Styles */
    .decrypt-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .auth-error.shake {
      animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }
    .auth-badge.aes-badge {
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
  </style>
</head>
<body class="admin-body">

  <!-- ================= AUTHENTICATION / AES DECRYPTION GATE ================= -->
  <div class="admin-auth-overlay" id="adminAuthOverlay">
    <div class="auth-card" id="authCard">
      <img src="assets/images/logo.png" alt="D. Watson Chemist & Superstore" class="auth-logo">
      <span class="auth-badge aes-badge"><i class="fa-solid fa-shield-halved"></i> AES-256 Protected Studio</span>
      <h2 class="auth-title">Portal Studio Login</h2>
      <p class="auth-sub">Enter your administrator credentials to decrypt and unlock live studio management.</p>

      <div class="auth-error" id="loginError">
        Invalid administrator password. Please try again.
      </div>

      <form id="adminLoginForm">
        <div class="auth-input-group">
          <label for="loginUsername">Administrator Username</label>
          <input type="text" id="loginUsername" class="auth-input" placeholder="e.g. admin" required autocomplete="username" value="admin">
        </div>

        <div class="auth-input-group">
          <label for="loginPassword">Administrator Password</label>
          <input type="password" id="loginPassword" class="auth-input" placeholder="••••••••" required autocomplete="current-password" autofocus>
          <button type="button" class="password-toggle-btn" onclick="togglePasswordVisibility('loginPassword', this.querySelector('i'))" aria-label="Toggle password view">
            <i class="fa-regular fa-eye"></i>
          </button>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; font-size:0.82rem; color:#64748B;">
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" id="loginRememberMe" checked> Remember session
          </label>
          <a href="index.html" style="color:#DC2626; font-weight:600;"><i class="fa-solid fa-arrow-left"></i> Back to Site</a>
        </div>

        <button type="submit" class="auth-btn" id="loginSubmitBtn">
          <i class="fa-solid fa-unlock-keyhole"></i> Unlock Portal Studio
        </button>
      </form>
    </div>
  </div>

  <!-- Dynamic Mount for Decrypted Studio Elements -->
  <div id="adminStudioMount"></div>

  <!-- AES-256 Encrypted Studio Payload (Zero Plaintext Code) -->
  <script id="dwEncryptedPayload" type="application/json">${payloadJson}</script>

  <!-- Cryptographic Decryption Engine (Native Web Crypto API) -->
  <script>
    (function() {
      const STORAGE_KEY_AUTH = "dwatson_admin_auth";
      const STORAGE_KEY_PASS = "dwatson_aes_key";
      
      const overlay = document.getElementById("adminAuthOverlay");
      const form = document.getElementById("adminLoginForm");
      const usernameInput = document.getElementById("loginUsername");
      const passwordInput = document.getElementById("loginPassword");
      const rememberCheckbox = document.getElementById("loginRememberMe");
      const errorBox = document.getElementById("loginError");
      const submitBtn = document.getElementById("loginSubmitBtn");
      const mountEl = document.getElementById("adminStudioMount");
      const payloadScript = document.getElementById("dwEncryptedPayload");

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

      // Base64 helper utilities
      function base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      }

      // AES-256-GCM Decryption Function
      async function decryptPayload(password) {
        const payload = JSON.parse(payloadScript.textContent);
        const salt = base64ToUint8Array(payload.salt);
        const iv = base64ToUint8Array(payload.iv);
        const ciphertext = base64ToUint8Array(payload.data);

        // 1. Derive AES key from password using PBKDF2 (100,000 iterations)
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
          "raw",
          enc.encode(password),
          { name: "PBKDF2" },
          false,
          ["deriveKey"]
        );

        const key = await window.crypto.subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
          },
          keyMaterial,
          { name: "AES-GCM", length: 256 },
          false,
          ["decrypt"]
        );

        // 2. Decrypt with AES-GCM (mathematical check verifies password)
        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: iv },
          key,
          ciphertext
        );

        return new TextDecoder().decode(decryptedBuffer);
      }

      function loadScript(src) {
        return new Promise((resolve, reject) => {
          if (document.querySelector('script[src="' + src + '"]')) {
            return resolve();
          }
          const s = document.createElement("script");
          s.src = src;
          s.async = false;
          s.onload = () => resolve();
          s.onerror = (e) => {
            console.error("Failed loading script:", src, e);
            reject(e);
          };
          document.body.appendChild(s);
        });
      }

      // Mount decrypted DOM and execute scripts in strict order
      async function mountStudio(decryptedHtml) {
        mountEl.innerHTML = decryptedHtml;

        // Load dependencies in exact sequence with cache-busting timestamp
        try {
          const t = Date.now();
          await loadScript("js/config.js?v=" + t);
          await loadScript("js/data.js?v=" + t);
          await loadScript("js/admin.js?v=" + t);
        } catch (err) {
          console.error("Error loading studio dependencies:", err);
        }

        // Initialize state, tab navigation and render all modules
        if (typeof window.bootAdminApp === "function") {
          window.bootAdminApp();
        }

        // Hide login overlay
        overlay.classList.add("authenticated");
      }

      // Handle Decryption / Unlock
      async function attemptUnlock(pass, remember) {
        if (!pass) return false;
        
        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="decrypt-spinner"></span> Decrypting Studio...';
          }
          if (errorBox) errorBox.classList.remove("show", "shake");

          const decryptedHtml = await decryptPayload(pass);
          
          // Decryption succeeded! Password was 100% correct
          sessionStorage.setItem(STORAGE_KEY_AUTH, "true");
          sessionStorage.setItem(STORAGE_KEY_PASS, pass);
          if (remember) {
            localStorage.setItem("dwatson_admin_remember", "true");
            localStorage.setItem(STORAGE_KEY_PASS, pass);
          } else {
            localStorage.removeItem("dwatson_admin_remember");
            localStorage.removeItem(STORAGE_KEY_PASS);
          }

          await mountStudio(decryptedHtml);
          return true;
        } catch (err) {
          console.warn("Decryption failed:", err);
          if (errorBox) {
            errorBox.textContent = "Invalid administrator password. Access denied.";
            errorBox.classList.add("show", "shake");
          }
          if (passwordInput) {
            passwordInput.value = "";
            passwordInput.focus();
          }
          return false;
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-unlock-keyhole"></i> Unlock Portal Studio';
          }
        }
      }

      // Form Submit Handler
      form.addEventListener("submit", async function(e) {
        e.preventDefault();
        const enteredUser = (usernameInput ? usernameInput.value.trim() : "admin") || "admin";
        const enteredPass = passwordInput ? passwordInput.value : "";
        const remember = rememberCheckbox ? rememberCheckbox.checked : true;

        if (enteredUser.toLowerCase() !== "admin") {
          if (errorBox) {
            errorBox.textContent = "Unknown username. Default is 'admin'.";
            errorBox.classList.add("show", "shake");
          }
          return;
        }

        await attemptUnlock(enteredPass, remember);
      });

      // Auto-unlock if valid session exists in memory
      (async function checkExistingSession() {
        const savedPass = sessionStorage.getItem(STORAGE_KEY_PASS) || 
                          (localStorage.getItem("dwatson_admin_remember") === "true" ? localStorage.getItem(STORAGE_KEY_PASS) : null);
        if (savedPass) {
          const success = await attemptUnlock(savedPass, true);
          if (!success) {
            // Stale or invalid cached password
            sessionStorage.removeItem(STORAGE_KEY_AUTH);
            sessionStorage.removeItem(STORAGE_KEY_PASS);
            localStorage.removeItem(STORAGE_KEY_PASS);
          }
        }
      })();
    })();
  </script>
</body>
</html>
`;

fs.writeFileSync(destFile, finalAdminHtml, "utf8");
console.log(`✅ Successfully generated AES-256 encrypted admin.html (${finalAdminHtml.length} bytes)`);
console.log(`🔐 Master password configured and encrypted.`);
