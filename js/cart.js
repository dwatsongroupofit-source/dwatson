/**
 * D. Watson Chemist & Superstore — Mobile-First Cart & Checkout System
 * ====================================================================
 * Features:
 * - LocalStorage persistence (dwatson_cart_v1)
 * - Floating thumb-zone cart button (FAB) with live item counter badge
 * - Mobile bottom-sheet slide-up drawer / desktop slide-in modal
 * - Free shipping progress indicator (Threshold: PKR 3,000 | Default Fee: PKR 200)
 * - Stepper controls (+/- quantity), item removal, subtotal & line-item calculations
 * - Dual checkout modes:
 *     1. 1-Tap Consolidated WhatsApp Order (pre-filled invoice to helpline)
 *     2. Cash on Delivery (COD) order logging to cloud portal & instant receipt
 * - Toast notification feedback on adding items
 */

(function (window) {
  "use strict";

  const STORAGE_KEY = "dwatson_cart_items_v1";
  const DEFAULT_DELIVERY_FEE = 200;
  const FREE_DELIVERY_THRESHOLD = 3000;
  const DEFAULT_HELPLINE = "923329716666";

  // State
  let cartItems = [];

  // Load from localStorage
  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          cartItems = parsed;
        }
      }
    } catch (e) {
      cartItems = [];
    }
  }

  // Save to localStorage
  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {}
    updateCartUI();
    window.dispatchEvent(new CustomEvent("dwatson_cart_updated", { detail: { items: cartItems } }));
  }

  // Helper: Parse PKR price string into clean integer
  function parsePrice(priceStr) {
    if (typeof priceStr === "number") return priceStr;
    if (!priceStr || typeof priceStr !== "string") return 0;
    const clean = priceStr.replace(/[^0-9.]/g, "");
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }

  // Public Cart Object
  const DWCart = {
    // Add item to cart
    addItem: function (product, qty = 1) {
      if (!product || !product.id) return;
      loadCart();

      const existingIndex = cartItems.findIndex((item) => item.id === product.id);
      const priceNum = parsePrice(product.price);

      if (existingIndex > -1) {
        cartItems[existingIndex].qty += qty;
      } else {
        cartItems.push({
          id: product.id,
          name: product.name || "D. Watson Item",
          brand: product.brand || "D. Watson",
          price: product.price || "Inquire",
          priceNum: priceNum,
          image: product.image || "assets/images/pharmacy.jpg",
          category: product.category || "pharmacy",
          qty: Math.max(1, qty)
        });
      }

      saveCart();
      showToast(`Added "${product.name}" to order bag! 🛍️`);
      triggerBadgeBounce();
    },

    // Remove item completely
    removeItem: function (productId) {
      loadCart();
      cartItems = cartItems.filter((item) => item.id !== productId);
      saveCart();
      renderCartDrawerItems();
    },

    // Update quantity
    updateQty: function (productId, delta) {
      loadCart();
      const item = cartItems.find((i) => i.id === productId);
      if (!item) return;

      item.qty += delta;
      if (item.qty <= 0) {
        cartItems = cartItems.filter((i) => i.id !== productId);
      }
      saveCart();
      renderCartDrawerItems();
    },

    // Clear cart
    clear: function () {
      cartItems = [];
      saveCart();
      renderCartDrawerItems();
    },

    // Getters
    getItems: function () {
      loadCart();
      return [...cartItems];
    },

    getCount: function () {
      loadCart();
      return cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
    },

    getSubtotal: function () {
      loadCart();
      return cartItems.reduce((sum, item) => sum + (item.priceNum || 0) * (item.qty || 1), 0);
    },

    getDeliveryFee: function () {
      const sub = this.getSubtotal();
      if (sub === 0) return 0;
      return sub >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
    },

    getTotal: function () {
      return this.getSubtotal() + this.getDeliveryFee();
    },

    // UI Controls
    openDrawer: function () {
      const drawer = document.getElementById("dwCartDrawer");
      const backdrop = document.getElementById("dwCartBackdrop");
      if (drawer && backdrop) {
        populateDeliveryBranchesDropdown();
        renderCartDrawerItems();
        drawer.classList.add("open");
        backdrop.classList.add("open");
        document.body.classList.add("cart-open");
      }
    },

    closeDrawer: function () {
      const drawer = document.getElementById("dwCartDrawer");
      const backdrop = document.getElementById("dwCartBackdrop");
      if (drawer && backdrop) {
        drawer.classList.remove("open");
        backdrop.classList.remove("open");
        document.body.classList.remove("cart-open");
      }
    },

    toggleDrawer: function () {
      const drawer = document.getElementById("dwCartDrawer");
      if (drawer && drawer.classList.contains("open")) {
        this.closeDrawer();
      } else {
        this.openDrawer();
      }
    },

    // Checkout 1: WhatsApp Consolidated Order
    submitWhatsAppOrder: function (event) {
      if (event) event.preventDefault();
      loadCart();
      if (!cartItems.length) {
        alert("Your order bag is empty! Please add some products first.");
        return;
      }

      const name = (document.getElementById("cartCustomerName")?.value || "").trim();
      const phone = (document.getElementById("cartCustomerPhone")?.value || "").trim();
      const address = (document.getElementById("cartCustomerAddress")?.value || "").trim();
      const branchSelect = document.getElementById("cartCustomerBranch");
      const notes = (document.getElementById("cartCustomerNotes")?.value || "").trim();

      if (!name || !phone) {
        alert("Please enter your Name and WhatsApp phone number to proceed.");
        const target = !name ? document.getElementById("cartCustomerName") : document.getElementById("cartCustomerPhone");
        if (target) target.focus();
        return;
      }

      if (!branchSelect || !branchSelect.value) {
        alert("Please select your preferred D. Watson delivery branch from the dropdown.");
        if (branchSelect) branchSelect.focus();
        return;
      }

      const selectedOption = branchSelect.options[branchSelect.selectedIndex];
      const branchName = selectedOption ? (selectedOption.getAttribute("data-name") || selectedOption.text) : "D. Watson Delivery Branch";
      let branchWhatsApp = selectedOption ? selectedOption.getAttribute("data-whatsapp") : DEFAULT_HELPLINE;
      if (!branchWhatsApp || branchWhatsApp.length < 9) {
        branchWhatsApp = DEFAULT_HELPLINE;
      }

      const subtotal = this.getSubtotal();
      const fee = this.getDeliveryFee();
      const total = this.getTotal();

      // Build WhatsApp message
      let msg = `*--- 🛍️ D. WATSON OFFICIAL ORDER ---*\n`;
      msg += `*Order Date:* ${new Date().toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}\n\n`;
      msg += `📦 *ITEMS ORDERED (${this.getCount()} items):*\n`;

      cartItems.forEach((item, idx) => {
        const lineTotal = item.priceNum ? `PKR ${(item.priceNum * item.qty).toLocaleString()}` : item.price;
        msg += `${idx + 1}. *${item.name}*\n   Qty: ${item.qty} × ${item.price} = *${lineTotal}*\n   Brand: ${item.brand}\n`;
      });

      msg += `\n─────────────────────\n`;
      msg += `💵 *Subtotal:* PKR ${subtotal.toLocaleString()}\n`;
      msg += `🚚 *Delivery Fee:* ${fee === 0 ? "FREE (Orders over PKR 3,000)" : `PKR ${fee}`}\n`;
      msg += `💰 *TOTAL PAYABLE:* PKR ${total.toLocaleString()} (Cash on Delivery)\n`;
      msg += `─────────────────────\n\n`;
      msg += `👤 *Customer Name:* ${name}\n`;
      msg += `📞 *Customer WhatsApp:* ${phone}\n`;
      msg += `📍 *Delivery Address:* ${address || "Will share live location on WhatsApp"}\n`;
      msg += `🏥 *Delivery Branch:* ${branchName}\n`;
      msg += `📱 *Branch Dispatch WhatsApp:* ${branchWhatsApp}\n`;
      if (notes) {
        msg += `📝 *Order Note:* ${notes}\n`;
      }
      msg += `\n_Hi D. Watson ${branchName}, please confirm my order and dispatch via express rider._`;

      // Log order to portal inquiries for internal record tracking
      const orderId = "DW-ORD-" + Math.floor(100000 + Math.random() * 900000);
      logOrderToPortal(orderId, name, phone, address, branchName, notes, "Branch WhatsApp Checkout");

      // Open specific branch WhatsApp
      const waUrl = `https://wa.me/${branchWhatsApp}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");

      // Close drawer & show message
      this.closeDrawer();
      showToast(`Order sent to ${branchName} WhatsApp! 🚀`);
    },

    // Checkout 2: Cash on Delivery Direct Web Submission
    submitCODOrder: async function (event) {
      if (event) event.preventDefault();
      loadCart();
      if (!cartItems.length) {
        alert("Your order bag is empty! Please add some products first.");
        return;
      }

      const name = (document.getElementById("cartCustomerName")?.value || "").trim();
      const phone = (document.getElementById("cartCustomerPhone")?.value || "").trim();
      const address = (document.getElementById("cartCustomerAddress")?.value || "").trim();
      const branch = document.getElementById("cartCustomerBranch")?.value || "Nearest Twin Cities Branch";
      const notes = (document.getElementById("cartCustomerNotes")?.value || "").trim();

      if (!name || !phone || !address) {
        alert("Please provide your Full Name, Phone Number, and Delivery Address for Cash on Delivery.");
        if (!name) document.getElementById("cartCustomerName")?.focus();
        else if (!phone) document.getElementById("cartCustomerPhone")?.focus();
        else document.getElementById("cartCustomerAddress")?.focus();
        return;
      }

      const orderBtn = document.getElementById("btnCodOrder");
      if (orderBtn) {
        orderBtn.disabled = true;
        orderBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Confirming Order...`;
      }

      const orderId = "DW-ORD-" + Math.floor(100000 + Math.random() * 900000);
      const subtotal = this.getSubtotal();
      const fee = this.getDeliveryFee();
      const total = this.getTotal();

      try {
        await logOrderToPortal(orderId, name, phone, address, branch, notes, "Cash on Delivery (Web)");

        // Show Success Modal
        showOrderSuccessModal(orderId, name, phone, address, total);

        // Clear cart
        this.clear();
        this.closeDrawer();
      } catch (err) {
        console.error("Order submission error:", err);
        alert("There was an issue processing your order. Please try ordering via WhatsApp.");
      } finally {
        if (orderBtn) {
          orderBtn.disabled = false;
          orderBtn.innerHTML = `<i class="fa-solid fa-truck-fast"></i> Cash on Delivery (Confirm Online)`;
        }
      }
    }
  };

  // Helper: Log order to portal inquiries
  async function logOrderToPortal(orderId, name, phone, address, branch, notes, method) {
    try {
      const itemsSummary = cartItems
        .map((i) => `${i.name} (Qty: ${i.qty}, ${i.price})`)
        .join("; ");

      const totalFormatted = `PKR ${DWCart.getTotal().toLocaleString()}`;

      const inquiryObj = {
        id: orderId,
        date: new Date().toISOString(),
        customerName: name,
        phone: phone,
        email: "",
        productName: `Order: ${cartItems.length} Products (${totalFormatted})`,
        price: totalFormatted,
        branch: branch,
        type: "product_order",
        notes: `[Method: ${method}] Items: ${itemsSummary} | Delivery Address: ${address || "N/A"} | Notes: ${notes || "None"}`,
        status: "New Order (Pending Dispatch)",
        items: [...cartItems]
      };

      if (typeof saveCustomerInquiry === "function") {
        await saveCustomerInquiry(inquiryObj);
      } else {
        const stored = JSON.parse(localStorage.getItem("dwatson_customer_inquiries_v2") || "[]");
        stored.unshift(inquiryObj);
        localStorage.setItem("dwatson_customer_inquiries_v2", JSON.stringify(stored.slice(0, 150)));
      }
    } catch (e) {
      console.warn("Could not log order:", e);
    }
  }

  // Toast feedback
  function showToast(message) {
    let toast = document.getElementById("dwCartToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "dwCartToast";
      toast.className = "dw-cart-toast";
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${escapeHtml(message)}</span>`;
    toast.classList.add("show");
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  // Micro-animation for cart badge
  function triggerBadgeBounce() {
    const badge = document.getElementById("dwCartFabBadge");
    if (badge) {
      badge.classList.remove("bounce");
      void badge.offsetWidth;
      badge.classList.add("bounce");
    }
  }

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Render the contents inside the cart drawer
  function renderCartDrawerItems() {
    const listEl = document.getElementById("dwCartItemsList");
    const emptyEl = document.getElementById("dwCartEmptyState");
    const footerEl = document.getElementById("dwCartFooter");
    const countHeader = document.getElementById("dwCartHeaderCount");
    const subtotalEl = document.getElementById("dwCartSubtotal");
    const feeEl = document.getElementById("dwCartFee");
    const totalEl = document.getElementById("dwCartTotal");
    const progressEl = document.getElementById("dwCartProgressFill");
    const progressMsgEl = document.getElementById("dwCartProgressMsg");

    loadCart();
    const count = DWCart.getCount();
    const subtotal = DWCart.getSubtotal();
    const fee = DWCart.getDeliveryFee();
    const total = DWCart.getTotal();

    if (countHeader) countHeader.textContent = `${count} ${count === 1 ? "item" : "items"}`;

    if (!cartItems.length) {
      if (listEl) listEl.style.display = "none";
      if (emptyEl) emptyEl.style.display = "block";
      if (footerEl) footerEl.style.display = "none";
      if (progressEl) progressEl.style.width = "0%";
      if (progressMsgEl) progressMsgEl.innerHTML = `Add items to qualify for <strong>FREE Delivery</strong> across Twin Cities!`;
      return;
    }

    if (listEl) listEl.style.display = "flex";
    if (emptyEl) emptyEl.style.display = "none";
    if (footerEl) footerEl.style.display = "block";

    // Update free delivery bar
    const neededForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
    const progressPct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

    if (progressEl) progressEl.style.width = `${progressPct}%`;
    if (progressMsgEl) {
      if (neededForFree === 0) {
        progressMsgEl.innerHTML = `🎉 <strong>Congratulations!</strong> You qualified for <strong>FREE Delivery</strong>!`;
        progressMsgEl.style.color = "#16A34A";
      } else {
        progressMsgEl.innerHTML = `Add <strong>PKR ${neededForFree.toLocaleString()}</strong> more to unlock <strong>FREE Delivery</strong>!`;
        progressMsgEl.style.color = "#B91C1C";
      }
    }

    // Render items list
    if (listEl) {
      listEl.innerHTML = cartItems
        .map((item) => {
          const lineTotal = item.priceNum
            ? `PKR ${(item.priceNum * item.qty).toLocaleString()}`
            : item.price;
          return `
            <div class="cart-item-card" data-id="${item.id}">
              <img src="${encodeURI(item.image)}" alt="${escapeHtml(item.name)}" class="cart-item-thumb" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
              <div class="cart-item-details">
                <span class="cart-item-brand">${escapeHtml(item.brand)}</span>
                <h4 class="cart-item-name">${escapeHtml(item.name)}</h4>
                <div class="cart-item-price-row">
                  <span class="cart-item-price">${escapeHtml(item.price)}</span>
                  <span class="cart-item-line-total">${lineTotal}</span>
                </div>
                <div class="cart-item-stepper-row">
                  <div class="cart-stepper">
                    <button type="button" class="stepper-btn" onclick="DWCart.updateQty('${item.id}', -1)" aria-label="Decrease quantity">
                      <i class="fa-solid fa-minus"></i>
                    </button>
                    <span class="stepper-qty">${item.qty}</span>
                    <button type="button" class="stepper-btn" onclick="DWCart.updateQty('${item.id}', 1)" aria-label="Increase quantity">
                      <i class="fa-solid fa-plus"></i>
                    </button>
                  </div>
                  <button type="button" class="cart-item-remove-btn" onclick="DWCart.removeItem('${item.id}')" title="Remove item" aria-label="Remove item">
                    <i class="fa-solid fa-trash-can"></i> Remove
                  </button>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    }

    if (subtotalEl) subtotalEl.textContent = `PKR ${subtotal.toLocaleString()}`;
    if (feeEl) {
      if (fee === 0) {
        feeEl.innerHTML = `<span style="color:#16A34A; font-weight:700;">FREE</span>`;
      } else {
        feeEl.textContent = `PKR ${fee}`;
      }
    }
    if (totalEl) totalEl.textContent = `PKR ${total.toLocaleString()}`;
  }

  // Update floating badge and header counts
  function updateCartUI() {
    loadCart();
    const count = DWCart.getCount();
    const badge = document.getElementById("dwCartFabBadge");
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "flex" : "none";
    }

    // Also update any header cart icons if present
    const headerBadges = document.querySelectorAll(".header-cart-badge");
    headerBadges.forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? "inline-flex" : "none";
    });
  }

  // Create Order Confirmation Modal
  function showOrderSuccessModal(orderId, name, phone, address, total) {
    let modal = document.getElementById("dwOrderSuccessModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "dwOrderSuccessModal";
      modal.className = "dw-order-success-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="dw-modal-backdrop" onclick="closeOrderSuccessModal()"></div>
      <div class="dw-order-success-card">
        <div class="order-success-icon-wrap">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <h3 class="order-success-title">Order Confirmed!</h3>
        <p class="order-success-sub">Thank you, <strong>${escapeHtml(name)}</strong>. Your Cash-on-Delivery order has been received by D. Watson Pharmacy Desk.</p>

        <div class="order-id-badge">
          <span>Order ID:</span>
          <strong>${orderId}</strong>
        </div>

        <div class="order-summary-box">
          <div class="order-summary-row">
            <span>Contact Number:</span>
            <strong>${escapeHtml(phone)}</strong>
          </div>
          <div class="order-summary-row">
            <span>Delivery To:</span>
            <span>${escapeHtml(address)}</span>
          </div>
          <div class="order-summary-row" style="border-top:1px dashed #CBD5E1; padding-top:8px; margin-top:8px;">
            <span>Total Payable:</span>
            <strong style="color:#B91C1C; font-size:1.1rem;">PKR ${total.toLocaleString()}</strong>
          </div>
          <div class="order-summary-row">
            <span>Payment Method:</span>
            <strong>Cash on Delivery</strong>
          </div>
        </div>

        <div class="order-success-delivery-notice">
          <i class="fa-solid fa-clock-rotate-left"></i>
          <span>Our pharmacist/rider will call you shortly to confirm stock potency &amp; dispatch timing.</span>
        </div>

        <div class="order-success-actions">
          <button type="button" class="btn btn-primary" onclick="closeOrderSuccessModal()" style="width:100%; justify-content:center;">
            <i class="fa-solid fa-shopping-bag"></i> Continue Shopping
          </button>
        </div>
      </div>
    `;

    modal.classList.add("open");
  }

  window.closeOrderSuccessModal = function () {
    const modal = document.getElementById("dwOrderSuccessModal");
    if (modal) modal.classList.remove("open");
  };

  // Build the complete DOM markup for the Floating Cart Button + Slide-up Drawer
  function injectCartDOM() {
    if (document.getElementById("dwCartFab")) return;

    // 1. Floating Cart Action Button
    const fab = document.createElement("button");
    fab.id = "dwCartFab";
    fab.className = "dw-cart-fab";
    fab.type = "button";
    fab.setAttribute("aria-label", "View Order Bag / Cart");
    fab.onclick = () => DWCart.openDrawer();
    fab.innerHTML = `
      <div class="dw-cart-fab-icon">
        <i class="fa-solid fa-bag-shopping"></i>
        <span class="dw-cart-fab-badge" id="dwCartFabBadge" style="display:none;">0</span>
      </div>
      <span class="dw-cart-fab-label">Order Bag</span>
    `;
    document.body.appendChild(fab);

    // 2. Cart Backdrop
    const backdrop = document.createElement("div");
    backdrop.id = "dwCartBackdrop";
    backdrop.className = "dw-cart-backdrop";
    backdrop.onclick = () => DWCart.closeDrawer();
    document.body.appendChild(backdrop);

    // 3. Slide-up Drawer
    const drawer = document.createElement("div");
    drawer.id = "dwCartDrawer";
    drawer.className = "dw-cart-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", "Shopping Bag");

    drawer.innerHTML = `
      <div class="cart-drawer-header">
        <div class="cart-drawer-header-title">
          <i class="fa-solid fa-bag-shopping" style="color:var(--dw-red);"></i>
          <h3>Your Order Bag</h3>
          <span class="cart-header-count" id="dwCartHeaderCount">0 items</span>
        </div>
        <button type="button" class="cart-drawer-close" onclick="DWCart.closeDrawer()" aria-label="Close Order Bag">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Free Delivery Progress Bar -->
      <div class="cart-progress-wrap">
        <div class="cart-progress-text" id="dwCartProgressMsg">
          Add items to qualify for <strong>FREE Delivery</strong> across Twin Cities!
        </div>
        <div class="cart-progress-bar">
          <div class="cart-progress-fill" id="dwCartProgressFill" style="width:0%;"></div>
        </div>
      </div>

      <!-- Cart Items Body -->
      <div class="cart-drawer-body">
        <!-- Empty State -->
        <div class="cart-empty-state" id="dwCartEmptyState">
          <div class="cart-empty-icon">
            <i class="fa-solid fa-basket-shopping"></i>
          </div>
          <h4>Your Order Bag is Empty</h4>
          <p>Browse 100% authentic medicines, baby formula, luxury cosmetics, and daily healthcare essentials.</p>
          <button type="button" class="btn btn-primary btn-sm" onclick="DWCart.closeDrawer(); if (window.location.pathname.indexOf('shop') === -1) window.location.href='shop.html';">
            <i class="fa-solid fa-arrow-trend-up"></i> Explore Products
          </button>
        </div>

        <!-- Populated Items List -->
        <div class="cart-items-list" id="dwCartItemsList" style="display:none;"></div>
      </div>

      <!-- Cart Drawer Footer & Checkout Form -->
      <div class="cart-drawer-footer" id="dwCartFooter" style="display:none;">
        <!-- Order Bill Summary -->
        <div class="cart-bill-box">
          <div class="bill-row">
            <span>Subtotal</span>
            <span id="dwCartSubtotal">PKR 0</span>
          </div>
          <div class="bill-row">
            <span>Express Delivery Fee</span>
            <span id="dwCartFee">PKR 200</span>
          </div>
          <div class="bill-row total-row">
            <span>Total Payable</span>
            <span class="total-amount" id="dwCartTotal">PKR 0</span>
          </div>
        </div>

        <!-- Quick Delivery Form (Mobile Optimized) -->
        <details class="cart-delivery-details" open>
          <summary class="cart-delivery-summary">
            <span><i class="fa-solid fa-location-dot" style="color:var(--dw-red);"></i> Delivery &amp; Contact Details</span>
            <span class="toggle-icon"><i class="fa-solid fa-chevron-down"></i></span>
          </summary>
          <div class="cart-form-fields">
            <div class="cart-field-row">
              <input type="text" id="cartCustomerName" placeholder="Your Full Name *" required autocomplete="name">
            </div>
            <div class="cart-field-row">
              <input type="tel" id="cartCustomerPhone" placeholder="WhatsApp Number (03XX-XXXXXXX) *" required autocomplete="tel">
            </div>
            <div class="cart-field-row">
              <input type="text" id="cartCustomerAddress" placeholder="Street Address / Sector (e.g. F-7/2, Islamabad) *" required autocomplete="street-address">
            </div>
            <div class="cart-field-row">
            <div class="cart-field-row">
              <select id="cartCustomerBranch" required>
                <option value="" disabled selected>🏥 Select Delivery Branch (Order routed to Branch WhatsApp) *</option>
              </select>
            </div>
            <div class="cart-field-row">
              <input type="text" id="cartCustomerNotes" placeholder="Special Note (e.g. Bring cold ice-pack)">
            </div>
          </div>
        </details>

        <!-- Action Buttons (Branch-Routed WhatsApp Order Only) -->
        <div class="cart-checkout-actions">
          <button type="button" class="btn-checkout-wa" onclick="DWCart.submitWhatsAppOrder(event)" style="width:100%; justify-content:center; padding:15px 20px; font-size:1.02rem; font-weight:800; border-radius:12px; gap:10px;">
            <i class="fa-brands fa-whatsapp" style="font-size:1.35rem;"></i> Order via Branch WhatsApp
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(drawer);
  }

  // Populate branch dropdown showing ONLY branches that allow delivery (admin expressDelivery !== false)
  function populateDeliveryBranchesDropdown() {
    const branchSelect = document.getElementById("cartCustomerBranch");
    if (!branchSelect) return;

    let branches = [];
    try {
      if (typeof getSiteData === "function") {
        const sd = getSiteData();
        if (sd && Array.isArray(sd.branches)) {
          branches = sd.branches;
        }
      }
      if (!branches.length && typeof DEFAULT_SITE_DATA !== "undefined" && Array.isArray(DEFAULT_SITE_DATA.branches)) {
        branches = DEFAULT_SITE_DATA.branches;
      }
    } catch (e) {
      branches = [];
    }

    // Filter ONLY branches that allow delivery (checked from admin panel)
    const deliveryBranches = branches.filter((b) => b.expressDelivery !== false && b.allowsDelivery !== false);

    let html = `<option value="" disabled selected>🏥 Select Delivery Branch (Order routed to Branch WhatsApp) *</option>`;
    if (!deliveryBranches.length) {
      html += `<option value="central_helpline" data-whatsapp="923329716666" data-name="D. Watson Central Delivery Desk" selected>🏥 D. Watson Central Delivery Desk (051-8438111)</option>`;
    } else {
      deliveryBranches.forEach((b) => {
        const badge = b.isFlagship ? "⭐ " : "";
        const wa = b.whatsapp ? String(b.whatsapp).replace(/[^0-9]/g, "") : "923329716666";
        const cleanName = b.name || "D. Watson Branch";
        const city = b.city ? ` [${b.city}]` : "";
        html += `<option value="${escapeHtml(b.id || cleanName)}" data-whatsapp="${escapeHtml(wa)}" data-name="${escapeHtml(cleanName)}" data-city="${escapeHtml(b.city || '')}">${badge}${escapeHtml(cleanName)}${escapeHtml(city)} — Express Delivery</option>`;
      });
    }

    branchSelect.innerHTML = html;
  }

  // Initialize on DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectCartDOM();
      loadCart();
      updateCartUI();
      populateDeliveryBranchesDropdown();
    });
  } else {
    injectCartDOM();
    loadCart();
    updateCartUI();
    populateDeliveryBranchesDropdown();
  }

  // Listen for admin cloud sync updates to refresh branch dropdown live
  window.addEventListener("dwatson_cloud_synced", () => {
    populateDeliveryBranchesDropdown();
  });

  // Listen for storage changes across tabs
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      loadCart();
      updateCartUI();
      if (document.getElementById("dwCartDrawer")?.classList.contains("open")) {
        renderCartDrawerItems();
      }
    }
  });

  // Export to global scope
  window.DWCart = DWCart;
})(window);
