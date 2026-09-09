/**
 * D. Watson Chemist & Superstore - Core Application Logic
 * Official Portal Controller for Heritage, Products, 24+ Branches & Inquiry Handlers
 * Pure JavaScript, clean architecture, high performance
 */

// Global Product Slider Controls (Available immediately)
window.slideProducts = function(direction) {
  const track = document.getElementById("productsGrid");
  if (!track) return;

  const firstCard = track.querySelector(".product-card");
  const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 310;
  const maxScroll = track.scrollWidth - track.clientWidth - 10;

  if (direction > 0 && track.scrollLeft >= maxScroll) {
    track.scrollTo({ left: 0, behavior: "smooth" });
  } else if (direction < 0 && track.scrollLeft <= 10) {
    track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
  } else {
    track.scrollBy({ left: cardWidth * direction, behavior: "smooth" });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initWebsite();
  initOrderBranchSelector();

  // Listen for real-time site data updates from the Admin Portal
  window.addEventListener("siteDataUpdated", () => {
    initWebsite();
  });
});

let sliderInterval = null;
let currentSlideIndex = 0;
let progressInterval = null;
let currentGalleryIndex = 0;
let activeGalleryItems = [];
let allBranchesData = [];
let allProductsData = [];

// Product Deep-Zoom & Modal State
let currentProductZoomList = [];
let currentProductZoomIndex = 0;
let currentZoomScale = 1;
let panOffsetX = 0;
let panOffsetY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let isZoomModalEventsInit = false;

// Product Auto-Slide State
let productAutoSlideTimer = null;
let isProductCarouselHovered = false;
let isProductCarouselControlsInit = false;

/**
 * Main Initialization
 */
function initWebsite() {
  const data = getSiteData();

  renderHeaderAndCompanyInfo(data.company);
  renderHeroSlider(data.heroSlides);
  renderTrustStats(data.company.stats);
  renderAboutAndTimeline(data.company);
  renderLeadership(data.management);
  renderDepartments(data.departments, data.company.whatsapp);
  renderHomeDepartments(data.departments);
  renderProducts(data.products, data.company.whatsapp);
  renderHomeProducts(data.products, data.company.whatsapp);
  renderBranches(data.branches);
  renderHomeFlagshipBranches(data.branches, 'all');
  renderGallery(data.gallery);
  renderFAQs(data.faqs);
  renderFooter(data.company, data.branches);
  renderBrandsMarquee();
  initPrescriptionBranchSelector();
  initPrescriptionUploader(data.company.whatsapp);
  initProductZoomEvents();
  initHeaderScroll();
  initMobileMenu();
  initGlobalSearch();
  initHelplineDropdown();
  initPWAInstall();
  initTawkToLiveChat();
  initFloatingBranchMessenger();
  setupCustomerInfoAutoSync();
}

/**
 * Auto-persist and prefill customer contact info across forms and chat
 */
function setupCustomerInfoAutoSync() {
  const fields = [
    { id: "rxPatientName", key: "dw_customer_name" },
    { id: "rxPatientPhone", key: "dw_customer_phone" },
    { id: "contactName", key: "dw_customer_name" },
    { id: "contactEmail", key: "dw_customer_email" }
  ];
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (!el) return;
    const saved = localStorage.getItem(f.key);
    if (saved && !el.value) el.value = saved;
    const persist = () => {
      const val = el.value.trim();
      if (val) localStorage.setItem(f.key, val);
    };
    el.addEventListener("change", persist);
    el.addEventListener("blur", persist);
  });
}

/**
 * Render Header & Topbar info
 */
function renderHeaderAndCompanyInfo(company) {
  const announcementEl = document.getElementById("topAnnouncement");
  if (announcementEl) announcementEl.textContent = company.announcement;

  const phoneTopEl = document.getElementById("topPhone");
  if (phoneTopEl) {
    phoneTopEl.href = `tel:${company.helpline.replace(/[^0-9]/g, '')}`;
    phoneTopEl.innerHTML = `<i class="fa-solid fa-phone"></i> Helpline: ${company.helpline}`;
  }

  const waTopEl = document.getElementById("topWhatsApp");
  if (waTopEl) {
    waTopEl.href = `https://wa.me/${company.whatsapp}`;
    waTopEl.innerHTML = `<i class="fa-brands fa-whatsapp"></i> WhatsApp: ${company.whatsappDisplay}`;
  }

  // Mobile bottom bar links
  const mobCall = document.getElementById("mobTabCall");
  if (mobCall) {
    mobCall.onclick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (typeof openFlagshipCallModal === "function") {
        openFlagshipCallModal();
      }
    };
  }
  const mobWa = document.getElementById("mobTabWa");
  if (mobWa) {
    mobWa.href = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Hi D.Watson Chemist, I need assistance.")}`;
    mobWa.onclick = function(e) {
      if (typeof window.openBranchMessengerCard === "function") {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        window.openBranchMessengerCard();
        return false;
      }
    };
  }

  // Floating CTA WhatsApp link
  const floatWaBtn = document.getElementById("floatingWaBtn");
  if (floatWaBtn) {
    floatWaBtn.href = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Hello D.Watson, I need assistance.")}`;
    floatWaBtn.onclick = function(e) {
      if (typeof window.openBranchMessengerCard === "function") {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        window.openBranchMessengerCard();
        return false;
      }
    };
  }
}

/**
 * Render Hero Slider (With Mobile Touch Swipe Gestures)
 */
function renderHeroSlider(slides) {
  const sliderContainer = document.getElementById("heroSliderWrapper");
  const dotsContainer = document.getElementById("heroSliderDots");
  if (!sliderContainer || !slides || !slides.length) return;

  sliderContainer.innerHTML = "";
  if (dotsContainer) dotsContainer.innerHTML = "";

  slides.forEach((slide, index) => {
    const slideDiv = document.createElement("div");
    slideDiv.className = `hero-slide ${index === 0 ? 'active' : ''}`;
    slideDiv.style.backgroundImage = `url("${encodeURI(slide.image)}")`;

    slideDiv.innerHTML = `
      <div class="hero-slide-overlay"></div>
      <div class="container">
        <div class="hero-content">
          <div class="slide-tag">
            <i class="fa-solid fa-certificate"></i> ${escapeHtml(slide.tag || "D. Watson Verified")}
          </div>
          <h1 class="slide-title">${escapeHtml(slide.title)}</h1>
          <p class="slide-subtitle">${escapeHtml(slide.subtitle)}</p>
          <div class="slide-actions hero-cta-group-mockup">
            <a href="prescription.html" class="btn-hero-gold">
              <i class="fa-solid fa-arrow-up-from-bracket"></i> Upload Prescription
            </a>
            <a href="departments.html" class="btn-hero-teal">
              <i class="fa-solid fa-store"></i> Explore Store
            </a>
          </div>
        </div>
      </div>
    `;
    sliderContainer.appendChild(slideDiv);

    if (dotsContainer) {
      const dot = document.createElement("button");
      dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute("aria-label", `Slide ${index + 1}`);
      dot.addEventListener("click", () => goToSlide(index));
      dotsContainer.appendChild(dot);
    }
  });

  // Touch Swipe Gesture Detection for Mobile Browsers
  let touchStartX = 0;
  let touchEndX = 0;

  sliderContainer.addEventListener("touchstart", (e) => {
    if (e.changedTouches && e.changedTouches.length) {
      touchStartX = e.changedTouches[0].screenX;
    }
  }, { passive: true });

  sliderContainer.addEventListener("touchend", (e) => {
    if (e.changedTouches && e.changedTouches.length) {
      touchEndX = e.changedTouches[0].screenX;
      const diffX = touchEndX - touchStartX;
      if (diffX < -45) {
        nextSlide(); // Swiped left -> next
      } else if (diffX > 45) {
        prevSlide(); // Swiped right -> prev
      }
    }
  }, { passive: true });

  currentSlideIndex = 0;
  startSliderAutoplay(slides.length);
}

/**
 * Slider Autoplay Controller
 */
function startSliderAutoplay(totalSlides) {
  if (sliderInterval) clearInterval(sliderInterval);
  if (progressInterval) clearInterval(progressInterval);

  const progressBar = document.getElementById("sliderProgressBar");
  let progress = 0;
  const slideDuration = 6000;
  const stepTime = 50;

  progressInterval = setInterval(() => {
    progress += (stepTime / slideDuration) * 100;
    if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;

    if (progress >= 100) {
      progress = 0;
      goToSlide((currentSlideIndex + 1) % totalSlides);
    }
  }, stepTime);
}

function goToSlide(index) {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".slider-dot");
  const progressBar = document.getElementById("sliderProgressBar");

  if (!slides.length) return;

  slides.forEach((s) => s.classList.remove("active"));
  dots.forEach((d) => d.classList.remove("active"));

  currentSlideIndex = (index + slides.length) % slides.length;

  slides[currentSlideIndex].classList.add("active");
  if (dots[currentSlideIndex]) dots[currentSlideIndex].classList.add("active");

  if (progressBar) progressBar.style.width = "0%";
}

function nextSlide() {
  const slides = document.querySelectorAll(".hero-slide");
  goToSlide(currentSlideIndex + 1);
}

function prevSlide() {
  const slides = document.querySelectorAll(".hero-slide");
  goToSlide(currentSlideIndex - 1);
}

document.getElementById("sliderPrevBtn")?.addEventListener("click", prevSlide);
document.getElementById("sliderNextBtn")?.addEventListener("click", nextSlide);

/**
 * Render Trust & Stats Bar
 */
function renderTrustStats(stats) {
  const container = document.getElementById("trustGrid");
  if (!container || !stats) return;

  container.innerHTML = stats.map(stat => `
    <div class="trust-item">
      <div class="trust-icon">
        <i class="fa-solid ${stat.icon || 'fa-check'}"></i>
      </div>
      <div>
        <div class="trust-number">${escapeHtml(stat.number)}</div>
        <div class="trust-label">${escapeHtml(stat.label)}</div>
      </div>
    </div>
  `).join("");
}

/**
 * Render About & Heritage Timeline
 */
function renderAboutAndTimeline(company) {
  const shortEl = document.getElementById("aboutShortText");
  if (shortEl) shortEl.textContent = company.aboutShort;

  const histEl = document.getElementById("aboutHistoryText");
  if (histEl) histEl.textContent = company.aboutHistory;

  const timelineContainer = document.getElementById("timelineGrid");
  if (!timelineContainer) return;

  const milestones = company.historyTimeline || [];
  timelineContainer.innerHTML = milestones.map((m, idx) => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <span class="timeline-year">${escapeHtml(m.year)}</span>
        <h4 class="timeline-title">${escapeHtml(m.title)}</h4>
        <p class="timeline-desc">${escapeHtml(m.desc)}</p>
      </div>
    </div>
  `).join("");
}

/**
 * Render Board of Directors & Executive Management
 */
function renderLeadership(management) {
  const container = document.getElementById("leadershipGrid");
  if (!container) return;

  const members = (management && management.length) ? management : (DEFAULT_SITE_DATA.management || []);
  
  container.innerHTML = members.map((member, idx) => {
    const roleUpper = (member.role || "").toUpperCase();
    const isChairman = roleUpper.includes("CHAIRMAN") && !roleUpper.includes("CO-");
    const isCoChairman = roleUpper.includes("CO-CHAIRMAN");
    const isCEO = roleUpper.includes("CEO");
    
    let tierClass = "leader-director-card";
    let accentBadge = "Executive Director";
    if (isChairman) {
      tierClass = "leader-chairman-card";
      accentBadge = "Founding Chairman";
    } else if (isCoChairman) {
      tierClass = "leader-cochairman-card";
      accentBadge = "Founding Co-Chairman";
    } else if (isCEO) {
      tierClass = "leader-ceo-card";
      accentBadge = "Chief Executive Officer";
    }

    return `
      <div class="leader-card ${tierClass}" data-id="${member.id || idx}">
        <div class="leader-card-inner">
          <div class="leader-avatar-wrap">
            <div class="avatar-ring-glow"></div>
            <img src="${encodeURI(member.image)}" alt="${escapeHtml(member.name)}" class="leader-avatar" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='assets/images/management/zafar-bakhtawari.png';">
            <div class="leader-icon-badge" title="${escapeHtml(member.role)}">
              <i class="${member.icon || 'fa-solid fa-award'}"></i>
            </div>
          </div>
          
          <div class="leader-info">
            <div class="leader-header-row">
              <span class="leader-badge-pill">${escapeHtml(member.badge || accentBadge)}</span>
            </div>
            
            <h3 class="leader-name">${escapeHtml(member.name)}</h3>
            <div class="leader-role-wrap">
              <span class="leader-role">${escapeHtml(member.role)}</span>
              <div class="leader-role-divider"></div>
            </div>
            <div class="leader-org">
              <i class="fa-solid fa-building-shield"></i> ${escapeHtml(member.organization || "D. Watson Group of Pharmacies")}
            </div>
            
            ${member.bio ? `<p class="leader-bio">${escapeHtml(member.bio)}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/**
/**
 * Render Department Showcase with Multi-Category Filtering & Mobile Drawers
 */
let allDepartmentsData = [];
let allDepartmentsWhatsApp = "923329716666";

const DEPT_CATEGORY_MAP = {
  pharmacy: "healthcare",
  optics: "healthcare",
  surgical: "healthcare",
  hearing_aids: "healthcare",
  homeopathy: "healthcare",
  cosmetics: "beauty",
  perfumes: "beauty",
  color_cosmetics: "beauty",
  baby_care: "motherbaby",
  toys: "motherbaby",
  superstore: "superstore",
  crockery: "superstore",
  garments: "superstore"
};

/**
 * Render Homepage Featured Departments (Generous Visual Cards with Auto-Slider)
 */
let deptAutoSlideTimer = null;
let isDeptCarouselHovered = false;
let isDeptCarouselControlsInit = false;

function renderHomeDepartments(departments) {
  const container = document.getElementById("homeDeptCarousel");
  if (!container || !departments || !departments.length) return;

  container.innerHTML = departments.map((dept) => {
    return `
      <a href="departments.html?dept=${dept.id}" class="home-dept-card" title="Explore ${escapeHtml(dept.name)}">
        <div class="home-dept-img-wrap">
          <img src="${encodeURI(dept.image)}" alt="${escapeHtml(dept.name)}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
          <span class="home-dept-badge">${escapeHtml(dept.badge || "Featured")}</span>
        </div>
        <div class="home-dept-body">
          <h4 class="home-dept-name">${escapeHtml(dept.name)}</h4>
          <p class="home-dept-sub">${escapeHtml(dept.tagline || "Official D. Watson Healthcare & Retail")}</p>
          <span class="home-dept-link">Explore Department <i class="fa-solid fa-arrow-right"></i></span>
        </div>
      </a>
    `;
  }).join("");

  initDepartmentAutoSlider();
}

/**
 * Auto-Slide Controller for Homepage Featured Departments
 */
function initDepartmentAutoSlider() {
  const track = document.getElementById("homeDeptCarousel");
  if (!track) return;

  if (deptAutoSlideTimer) {
    clearInterval(deptAutoSlideTimer);
    deptAutoSlideTimer = null;
  }

  if (!isDeptCarouselControlsInit) {
    track.addEventListener("mouseenter", () => { isDeptCarouselHovered = true; });
    track.addEventListener("mouseleave", () => { isDeptCarouselHovered = false; });
    track.addEventListener("touchstart", () => { isDeptCarouselHovered = true; }, { passive: true });
    track.addEventListener("touchend", () => {
      setTimeout(() => { isDeptCarouselHovered = false; }, 2000);
    }, { passive: true });
    isDeptCarouselControlsInit = true;
  }

  deptAutoSlideTimer = setInterval(() => {
    if (isDeptCarouselHovered) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 10) return;

    if (track.scrollLeft >= maxScroll - 15) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      const scrollStep = Math.max(280, Math.floor(track.clientWidth * 0.7));
      track.scrollBy({ left: scrollStep, behavior: "smooth" });
    }
  }, 3600);
}

/**
 * Render Homepage Interactive Flagship Outlets (Full Width Grid & Filterable)
 */
function renderHomeFlagshipBranches(branches, filter = "all") {
  const container = document.getElementById("homeFlagshipBranchesContainer");
  if (!container) return;

  const branchList = (branches && branches.length) ? branches : (allBranchesData || []);
  if (!branchList.length) return;

  let displayList = [];

  if (filter === "islamabad") {
    displayList = branchList.filter(b => (b.city || "").toLowerCase() === "islamabad");
  } else if (filter === "rawalpindi") {
    displayList = branchList.filter(b => (b.city || "").toLowerCase() === "rawalpindi");
  } else {
    displayList = branchList.filter(b => b.isFlagship);
    if (!displayList.length) displayList = branchList;
  }

  // Display all official flagship branches in full-width responsive grid
  const selectedBranches = displayList;

  container.innerHTML = selectedBranches.map((b) => {
    const rawPhone = (b.phone || "051-8438111").split("/")[0].replace(/[^0-9]/g, "");
    const waNum = b.whatsapp || "923329716666";
    const waText = `Hi D.Watson Chemist (${b.name}), I am inquiring about medicine stock and express delivery.`;
    const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}`;
    const mapUrl = b.mapUrl || `https://maps.google.com/?q=${encodeURIComponent("D. Watson " + b.name)}`;

    return `
      <div class="home-flagship-item">
        <div class="home-flagship-thumb">
          <img src="${encodeURI(b.image || 'assets/images/store_flagship.jpg')}" alt="${escapeHtml(b.name)}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
          <span class="mockup-flagship-badge">${escapeHtml(b.flagshipBadge || '⭐ Flagship Branch')}</span>
          <span class="home-flagship-live-status"><span class="live-dot-green"></span> ${escapeHtml(b.timings || "Open 24/7")}</span>
        </div>
        <div class="home-flagship-detail">
          <div class="home-flagship-text-wrap">
            <span class="home-flagship-city-tag"><i class="fa-solid fa-city"></i> ${escapeHtml(b.city || "Twin Cities")}</span>
            <h4 class="home-flagship-name">${escapeHtml(b.name)}</h4>
            <p class="home-flagship-addr"><i class="fa-solid fa-location-dot" style="color:var(--dw-red);"></i> ${escapeHtml(b.address || b.city)}</p>
          </div>
          <div class="home-flagship-btn-group">
            <a href="tel:${rawPhone}" class="btn-flagship-call" title="Call Branch"><i class="fa-solid fa-phone"></i> Call</a>
            <a href="${mapUrl}" target="_blank" class="btn-flagship-dir" title="Google Maps Directions"><i class="fa-solid fa-location-arrow"></i> Directions</a>
            <a href="${waUrl}" target="_blank" class="btn-flagship-wa" title="WhatsApp Order"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

window.filterHomeFlagshipBranches = function(filter, btnEl) {
  if (btnEl) {
    const parent = btnEl.closest(".mockup-filter-chips");
    if (parent) {
      parent.querySelectorAll(".mockup-chip").forEach(c => c.classList.remove("active"));
      btnEl.classList.add("active");
    }
  }
  renderHomeFlagshipBranches(allBranchesData, filter);
};

window.locateHomeNearestBranch = function(btnEl) {
  if (btnEl) {
    const parent = btnEl.closest(".mockup-filter-chips");
    if (parent) {
      parent.querySelectorAll(".mockup-chip").forEach(c => c.classList.remove("active"));
      btnEl.classList.add("active");
    }
  }
  if (!navigator.geolocation) {
    if (typeof showToast === "function") showToast("Geolocation is not supported by your browser.", "info");
    renderHomeFlagshipBranches(allBranchesData, "all");
    return;
  }
  btnEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Locating...`;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      btnEl.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> Nearest to Me`;
      renderHomeFlagshipBranches(allBranchesData, "all");
      if (typeof showToast === "function") showToast("Showing nearest Twin Cities flagship branches!", "success");
    },
    (err) => {
      btnEl.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> Nearest to Me`;
      if (typeof showToast === "function") showToast("Location unavailable. Showing premier flagship stores.", "info");
      renderHomeFlagshipBranches(allBranchesData, "all");
    },
    { timeout: 6000 }
  );
};

/**
 * Render Homepage Trending Products (Generous Cards with Brand, Price & WhatsApp Buy)
 */
function renderHomeProducts(products, defaultWhatsApp) {
  const container = document.getElementById("homeProductsCarousel");
  if (!container || !products || !products.length) return;

  const waNum = defaultWhatsApp || "923329716666";

  container.innerHTML = products.map((p) => {
    const fullImgUrl = (typeof getFullImageUrl === "function") ? getFullImageUrl(p.image) : (p.image || "");
    let waText = `*--- D. WATSON QUICK ORDER ---*\n🛍️ *Product:* ${p.name}\n💰 *Price:* ${p.price || 'Inquire'}\n🏷️ *Brand:* ${p.brand || 'D. Watson'}\n`;
    if (fullImgUrl) {
      waText += `📸 *Product Photo Link:* ${fullImgUrl}\n`;
    }
    waText += `\nHi D.Watson Chemist, please confirm stock availability and express delivery.`;
    const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}`;

    return `
      <div class="home-product-card" data-product-id="${p.id}" onclick="openProductZoomModal('${p.id}')">
        <div class="home-product-img-wrap" title="Inspect &amp; Zoom ${escapeHtml(p.name)}">
          <img src="${encodeURI(p.image || 'assets/images/pharmacy.jpg')}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
          <span class="product-zoom-pill"><i class="fa-solid fa-magnifying-glass-plus"></i> Zoom</span>
        </div>
        <div class="home-product-info">
          <span class="home-product-brand">${escapeHtml(p.brand || 'D. Watson')}</span>
          <h4 class="home-product-title" title="Click to Zoom ${escapeHtml(p.name)}">${escapeHtml(p.name)}</h4>
          <div class="home-product-price">${escapeHtml(p.price || 'Inquire')}</div>
          <div class="home-product-btn-row">
            <button type="button" class="btn-zoom-trigger" onclick="event.stopPropagation(); openProductZoomModal('${p.id}')" title="Zoom &amp; Details">
              <i class="fa-solid fa-magnifying-glass-plus"></i> Zoom
            </button>
            <a href="${waUrl}" target="_blank" onclick="event.stopPropagation();" class="home-product-buy-btn" title="Order ${escapeHtml(p.name)} via WhatsApp">
              <i class="fa-brands fa-whatsapp"></i> Buy
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Start auto-slider
  initProductAutoSlider();
}

/**
 * Carousel Horizontal Scrolling Controller
 */
window.scrollCarouselTrack = function(trackId, direction) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const scrollAmount = (track.clientWidth * 0.75) * direction;
  track.scrollBy({ left: scrollAmount, behavior: "smooth" });
};

/**
 * Auto-Slide Controller for Homepage Trending Products
 */
function initProductAutoSlider() {
  const track = document.getElementById("homeProductsCarousel");
  if (!track) return;

  if (productAutoSlideTimer) {
    clearInterval(productAutoSlideTimer);
    productAutoSlideTimer = null;
  }

  if (!isProductCarouselControlsInit) {
    track.addEventListener("mouseenter", () => { isProductCarouselHovered = true; });
    track.addEventListener("mouseleave", () => { isProductCarouselHovered = false; });
    track.addEventListener("touchstart", () => { isProductCarouselHovered = true; }, { passive: true });
    track.addEventListener("touchend", () => {
      setTimeout(() => { isProductCarouselHovered = false; }, 2000);
    }, { passive: true });
    isProductCarouselControlsInit = true;
  }

  productAutoSlideTimer = setInterval(() => {
    if (isProductCarouselHovered) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 10) return;

    if (track.scrollLeft >= maxScroll - 15) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      const scrollStep = Math.max(260, Math.floor(track.clientWidth * 0.7));
      track.scrollBy({ left: scrollStep, behavior: "smooth" });
    }
  }, 3500);
}

function renderDepartments(departments, defaultWhatsApp) {
  const container = document.getElementById("departmentsGrid");
  if (!container || !departments) return;

  allDepartmentsData = departments;
  if (defaultWhatsApp) allDepartmentsWhatsApp = defaultWhatsApp;

  // Check URL query parameters or hash for deep linking (e.g. ?dept=pharmacy or #dept-pharmacy)
  const urlParams = new URLSearchParams(window.location.search);
  const targetDept = urlParams.get("dept") || urlParams.get("cat") || (window.location.hash ? window.location.hash.replace("#dept-", "").replace("#", "") : "");

  if (targetDept && targetDept !== "all") {
    spotlightDepartment(targetDept);
  } else {
    renderDepartmentCards(allDepartmentsData);
  }
}

function spotlightDepartment(rawDeptId) {
  if (!allDepartmentsData || !allDepartmentsData.length) return;
  const container = document.getElementById("departmentsGrid");
  const filterBar = document.getElementById("deptFilterBar");
  if (!container) return;

  // Map alternative category aliases to canonical department IDs
  const aliasMap = {
    medicine: "pharmacy",
    medicines: "pharmacy",
    rx: "pharmacy",
    supplements: "homeo",
    skincare: "cosmetics",
    fragrances: "perfumes",
    fragrance: "perfumes",
    makeup: "color_cosmetics",
    superstore: "grocery",
    baby: "babycare",
    mothercare: "babycare",
    hearing: "hearing_aid",
    diagnostics: "hearing_aid",
    glasses: "optics",
    eyewear: "optics",
    hospital: "surgical"
  };

  const cleanId = (rawDeptId || "").toLowerCase().trim();
  const canonicalId = aliasMap[cleanId] || cleanId;
  
  let selectedDept = allDepartmentsData.find(d => d.id.toLowerCase() === canonicalId);
  if (!selectedDept) {
    selectedDept = allDepartmentsData.find(d => d.name.toLowerCase().includes(cleanId) || (d.tagline && d.tagline.toLowerCase().includes(cleanId)));
  }
  if (!selectedDept) {
    selectedDept = allDepartmentsData[0];
  }

  // Hide filter bar in spotlight mode
  if (filterBar) {
    filterBar.style.display = "none";
  }

  const waMsg = selectedDept.whatsappMsg || `Hi D.Watson, I would like to inquire about ${selectedDept.name} products.`;
  const waUrl = `https://wa.me/${allDepartmentsWhatsApp}?text=${encodeURIComponent(waMsg)}`;
  const isPharmacy = selectedDept.id === "pharmacy";

  container.innerHTML = `
    <div class="dept-spotlight-wrap" id="deptSpotlightSection">
      <div class="dept-spotlight-topbar">
        <button type="button" class="dept-spotlight-back-btn" onclick="showAllDepartments(event)">
          <i class="fa-solid fa-arrow-left"></i> View All 13 Departments
        </button>
        <span class="badge-mini" style="font-size:0.82rem; padding:6px 14px; background:#EFF6FF; color:#2563EB; border-radius:9999px; font-weight:800;">
          <i class="fa-solid fa-certificate"></i> Official D. Watson Specialty
        </span>
      </div>

      <div class="dept-spotlight-grid">
        <div class="dept-spotlight-media">
          <img src="${encodeURI(selectedDept.image)}" alt="${escapeHtml(selectedDept.name)}" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
          <span class="dept-spotlight-badge">
            <i class="${selectedDept.icon || 'fa-solid fa-star'}"></i> ${escapeHtml(selectedDept.badge || "Featured Specialty")}
          </span>
        </div>

        <div class="dept-spotlight-content">
          <span class="dept-spotlight-tagline">${escapeHtml(selectedDept.tagline)}</span>
          <h2 class="dept-spotlight-title">${escapeHtml(selectedDept.name)}</h2>
          <p class="dept-spotlight-desc">${escapeHtml(selectedDept.description)}</p>

          <div class="dept-spotlight-features-title">
            <i class="fa-solid fa-list-check" style="color:var(--dw-red);"></i> Key Department Specialties &amp; Standards
          </div>
          <div class="dept-spotlight-features-grid">
            ${(selectedDept.features || []).map(f => `
              <div class="dept-spotlight-feature-card">
                <i class="fa-solid fa-circle-check"></i>
                <span>${escapeHtml(f)}</span>
              </div>
            `).join("")}
          </div>

          <div class="dept-spotlight-cta-row">
            <a href="${waUrl}" target="_blank" class="btn btn-whatsapp">
              <i class="fa-brands fa-whatsapp"></i> Inquire on WhatsApp
            </a>
            ${isPharmacy ? `
              <a href="prescription.html" class="btn btn-primary">
                <i class="fa-solid fa-file-prescription"></i> Upload Prescription
              </a>
            ` : ""}
            <a href="branches.html" class="btn btn-outline">
              <i class="fa-solid fa-location-dot"></i> Available at 25+ Branches
            </a>
            <a href="tel:0518438111" class="btn btn-outline" style="border-color:#CBD5E1;">
              <i class="fa-solid fa-phone"></i> Helpline: 051-8438111
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Switch Strip: All other departments accessible in 1 tap -->
      <div class="dept-spotlight-other-strip">
        <div class="dept-spotlight-other-title">
          <i class="fa-solid fa-arrows-split-up-and-left" style="color:var(--dw-red);"></i> Switch to Another Department:
        </div>
        <div class="dept-spotlight-other-pills">
          ${allDepartmentsData.map(d => {
            const isActive = d.id === selectedDept.id;
            return `
              <button type="button" class="dept-spotlight-pill ${isActive ? 'active' : ''}" onclick="switchSpotlightDept('${d.id}')">
                <i class="${d.icon || 'fa-solid fa-boxes-stacked'}"></i> ${escapeHtml(d.name.split('&')[0].trim())}
              </button>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;

  // Smooth scroll to top of showcase
  const el = document.getElementById("deptSpotlightSection");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function switchSpotlightDept(deptId) {
  if (window.history && window.history.pushState) {
    window.history.pushState(null, "", `departments.html?dept=${deptId}`);
  }
  spotlightDepartment(deptId);
}

function showAllDepartments(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (window.history && window.history.pushState) {
    window.history.pushState(null, "", "departments.html");
  }
  const filterBar = document.getElementById("deptFilterBar");
  if (filterBar) filterBar.style.display = "flex";
  renderDepartmentCards(allDepartmentsData);
}

function renderDepartmentCards(deptList) {
  const container = document.getElementById("departmentsGrid");
  if (!container) return;

  if (!deptList || deptList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: #FFFFFF; border-radius: 16px; border: 1px dashed #CBD5E1;">
        <i class="fa-solid fa-boxes-stacked" style="font-size: 2.5rem; color: #94A3B8; margin-bottom: 12px;"></i>
        <h4 style="font-size: 1.15rem; color: var(--dw-navy); margin-bottom: 6px;">No departments match your search</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Try searching for "medicine", "skincare", "optics", or "baby care".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = deptList.map((dept) => {
    const waUrl = `https://wa.me/${allDepartmentsWhatsApp}?text=${encodeURIComponent(dept.whatsappMsg || `Hi D.Watson, I am inquiring about ${dept.name}.`)}`;
    const cat = DEPT_CATEGORY_MAP[dept.id] || "superstore";
    
    return `
      <div class="department-card" id="dept-${dept.id}" data-category="${cat}">
        <div class="dept-img-wrap">
          <img src="${encodeURI(dept.image)}" alt="${escapeHtml(dept.name)}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
          <span class="dept-badge">${escapeHtml(dept.badge || "Featured")}</span>
          <div class="dept-icon-floating">
            <i class="${dept.icon || 'fa-solid fa-star'}"></i>
          </div>
        </div>
        <div class="dept-body">
          <h3 class="dept-title">${escapeHtml(dept.name)}</h3>
          <div class="dept-tagline">${escapeHtml(dept.tagline)}</div>
          <p class="dept-desc">${escapeHtml(dept.description)}</p>
          
          <!-- Mobile Expandable Specialties Drawer Toggle -->
          <button type="button" class="dept-features-toggle" onclick="toggleDeptFeatures('${dept.id}', this)" aria-expanded="false">
            <span><i class="fa-solid fa-list-check"></i> Key Specialties (${(dept.features || []).length})</span>
            <i class="fa-solid fa-chevron-down"></i>
          </button>

          <ul class="dept-features" id="deptFeatures-${dept.id}">
            ${(dept.features || []).map(f => `
              <li><i class="fa-solid fa-circle-check"></i> ${escapeHtml(f)}</li>
            `).join("")}
          </ul>

          <div class="dept-card-footer">
            <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-sm">
              <i class="fa-brands fa-whatsapp"></i> Inquire on WhatsApp
            </a>
            <a href="branches.html" class="btn btn-outline btn-sm">
              Branches <i class="fa-solid fa-location-dot"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function filterDepartments(categoryKey, clickedBtn) {
  if (clickedBtn) {
    const filterBar = clickedBtn.closest(".dept-filter-bar");
    if (filterBar) {
      filterBar.querySelectorAll(".dept-pill-btn").forEach(b => b.classList.remove("active"));
      clickedBtn.classList.add("active");
    }
  }

  if (categoryKey === "all") {
    renderDepartmentCards(allDepartmentsData);
  } else {
    const filtered = allDepartmentsData.filter(d => DEPT_CATEGORY_MAP[d.id] === categoryKey);
    renderDepartmentCards(filtered);
  }
}

function filterDepartmentsSearch(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) {
    renderDepartmentCards(allDepartmentsData);
    return;
  }

  const filtered = allDepartmentsData.filter(d => {
    const nameMatch = (d.name || "").toLowerCase().includes(q);
    const tagMatch = (d.tagline || "").toLowerCase().includes(q);
    const descMatch = (d.description || "").toLowerCase().includes(q);
    const featMatch = (d.features || []).some(f => f.toLowerCase().includes(q));
    return nameMatch || tagMatch || descMatch || featMatch;
  });

  renderDepartmentCards(filtered);
}

function toggleDeptFeatures(deptId, btn) {
  const featEl = document.getElementById(`deptFeatures-${deptId}`);
  if (!featEl) return;
  const isOpen = featEl.classList.toggle("open");
  if (btn) {
    btn.classList.toggle("open", isOpen);
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }
}

/**
 * Render Featured Products Sliding Showcase & Interactive Carousel
 */
let currentProductCategory = "all";

function renderProducts(products, defaultWhatsApp) {
  allProductsData = products || [];
  const container = document.getElementById("productsGrid");
  const filterContainer = document.getElementById("productFilters");
  if (!container || !allProductsData.length) return;

  const categories = [
    { key: "all", label: "🌟 All Featured" },
    { key: "cosmetics", label: "💄 K-Beauty & Skincare" },
    { key: "haircare", label: "💇 Hair Therapy & Shampoos" },
    { key: "pharmacy", label: "💊 Medicines & Vitamins" },
    { key: "surgical", label: "🩺 Surgical & BP Monitors" },
    { key: "optics", label: "👓 Optics & Designer Eyewear" },
    { key: "grocery", label: "🛒 Baby Care & Gourmet" }
  ];

  if (filterContainer) {
    filterContainer.innerHTML = categories.map((cat, idx) => `
      <button class="prod-category-pill ${idx === 0 ? 'active' : ''}" onclick="filterProductsCategory('${cat.key}', this)">
        ${escapeHtml(cat.label)}
      </button>
    `).join("");
  }

  renderProductCards(allProductsData, defaultWhatsApp);
  initProductCarouselControls();
}

function renderProductCards(products, defaultWhatsApp) {
  const container = document.getElementById("productsGrid");
  if (!container) return;

  currentProductZoomList = products || [];
  const waNum = defaultWhatsApp || "923329716666";

  if (currentProductZoomList.length === 0) {
    container.innerHTML = `
      <div style="width: 100%; text-align: center; padding: 40px; color: #64748B;">
        <i class="fa-solid fa-box-open" style="font-size: 2.5rem; color: #CBD5E1; margin-bottom: 10px;"></i>
        <h4 style="color: #475569;">No products in this category</h4>
        <p style="font-size: 0.85rem;">Select another category tab to view products.</p>
      </div>
    `;
    updateProductCarouselDots();
    return;
  }

  container.innerHTML = currentProductZoomList.map((p, idx) => {
    const fullImgUrl = getFullImageUrl(p.image);
    let waText = `*--- D. WATSON PRODUCT INQUIRY & ORDER ---*\n🛍️ *Product:* ${p.name}\n🏷️ *Brand:* ${p.brand || 'D. Watson'}\n💰 *Price:* ${p.price || 'Inquire'}\n📂 *Category:* ${p.categoryName || p.category}\n`;
    if (fullImgUrl) {
      waText += `📸 *Product Photo Link:* ${fullImgUrl}\n`;
    }
    waText += `\n📝 *Inquiry Note:* Hi D.Watson Chemist, please confirm stock availability and express delivery.`;
    const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}`;

    return `
      <div class="product-card" data-product-id="${p.id}">
        <div class="product-img-wrap" onclick="openProductZoomModal('${p.id}')" title="Click to inspect & zoom ${escapeHtml(p.name)}">
          <img src="${encodeURI(p.image || 'assets/images/pharmacy.jpg')}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
          <span class="product-badge-tag">${escapeHtml(p.tag || "100% Genuine")}</span>
          <span class="product-instock-badge"><i class="fa-solid fa-circle-check"></i> In Stock</span>
          <div class="product-zoom-hint-btn">
            <i class="fa-solid fa-magnifying-glass-plus"></i>
            <span>Click to Zoom &amp; Details</span>
          </div>
        </div>
        <div class="product-body">
          <span class="product-brand">${escapeHtml(p.brand || 'D. Watson')}</span>
          <h4 class="product-title" onclick="openProductZoomModal('${p.id}')" title="Click to inspect">${escapeHtml(p.name)}</h4>
          <p class="product-desc">${escapeHtml(p.description || '')}</p>
          
          <div class="product-footer">
            <div class="product-price">${escapeHtml(p.price || 'Inquire')}</div>
            <a href="${waUrl}" target="_blank" onclick="handleProductOrderClick(event, '${p.id}', '${waUrl}')" class="btn btn-whatsapp btn-sm" title="Order via WhatsApp">
              <i class="fa-brands fa-whatsapp"></i> Inquire / Order
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Reset scroll to left
  container.scrollLeft = 0;
  updateProductCarouselDots();
}

/**
 * Multi-Card Carousel Slider Controls & Auto-Slide Engine
 */
function startProductAutoSlide() {
  stopProductAutoSlide();
  // Auto-slide every 3.5 seconds
  productAutoSlideTimer = setInterval(() => {
    if (isProductCarouselHovered) return;
    const track = document.getElementById("productsGrid");
    if (!track) return;
    
    const maxScroll = track.scrollWidth - track.clientWidth - 10;
    if (track.scrollLeft >= maxScroll) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      slideProducts(1);
    }
  }, 3500);
}

function stopProductAutoSlide() {
  if (productAutoSlideTimer) {
    clearInterval(productAutoSlideTimer);
    productAutoSlideTimer = null;
  }
}

function initProductCarouselControls() {
  const track = document.getElementById("productsGrid");
  const carouselContainer = document.querySelector(".products-carousel-container");
  if (!track || isProductCarouselControlsInit) return;
  isProductCarouselControlsInit = true;

  // Scroll listener for dot indicators
  track.addEventListener("scroll", () => {
    updateActiveDot();
  }, { passive: true });

  // Hover & Touch listeners to pause auto-sliding
  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", () => {
      isProductCarouselHovered = true;
    });
    carouselContainer.addEventListener("mouseleave", () => {
      isProductCarouselHovered = false;
    });
    carouselContainer.addEventListener("touchstart", () => {
      isProductCarouselHovered = true;
    }, { passive: true });
    carouselContainer.addEventListener("touchend", () => {
      setTimeout(() => {
        isProductCarouselHovered = false;
      }, 3000);
    }, { passive: true });
  }

  // Prev / Next button direct event handlers (redundancy for onclick)
  const prevBtn = document.getElementById("prodPrevBtn");
  const nextBtn = document.getElementById("prodNextBtn");
  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      slideProducts(-1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      slideProducts(1);
    });
  }

  // Start auto slide timer
  startProductAutoSlide();
}

function updateProductCarouselDots() {
  const dotsContainer = document.getElementById("productCarouselDots");
  const track = document.getElementById("productsGrid");
  if (!dotsContainer || !track) return;

  const cards = track.querySelectorAll(".product-card");
  const count = Math.ceil(cards.length / 2);

  if (count <= 1) {
    dotsContainer.innerHTML = "";
    return;
  }

  dotsContainer.innerHTML = Array.from({ length: count }).map((_, idx) => `
    <div class="prod-dot ${idx === 0 ? 'active' : ''}" onclick="goToProductSlide(${idx})" title="Slide ${idx + 1}"></div>
  `).join("");
}

window.goToProductSlide = function(index) {
  const track = document.getElementById("productsGrid");
  if (!track) return;
  const firstCard = track.querySelector(".product-card");
  const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 310;
  track.scrollTo({ left: cardWidth * index * 2, behavior: "smooth" });
};

function updateActiveDot() {
  const track = document.getElementById("productsGrid");
  const dots = document.querySelectorAll("#productCarouselDots .prod-dot");
  if (!track || !dots.length) return;

  const firstCard = track.querySelector(".product-card");
  const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 310;
  const activeIdx = Math.min(dots.length - 1, Math.round(track.scrollLeft / (cardWidth * 2)));

  dots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === activeIdx);
  });
}

window.filterProductsCategory = function(catKey, btn) {
  document.querySelectorAll("#productFilters .prod-category-pill").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  currentProductCategory = catKey;
  const data = getSiteData();
  if (catKey === "all") {
    renderProductCards(data.products, data.company.whatsapp);
  } else {
    const filtered = (data.products || []).filter(p => p.category === catKey);
    renderProductCards(filtered, data.company.whatsapp);
  }

  // Restart auto-slide on category change
  startProductAutoSlide();
};

/**
 * ==========================================================================
 * Product Zoom Modal Controller & Deep-Zoom Engine
 * ==========================================================================
 */
function initProductZoomEvents() {
  if (isZoomModalEventsInit) return;
  const viewport = document.getElementById("zoomViewport");
  if (!viewport) return;
  isZoomModalEventsInit = true;

  // Drag & Pan with Mouse
  viewport.addEventListener("mousedown", (e) => {
    if (e.button !== 0 || currentZoomScale <= 1) return;
    isPanning = true;
    panStartX = e.clientX - panOffsetX;
    panStartY = e.clientY - panOffsetY;
    viewport.classList.add("dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!isPanning || currentZoomScale <= 1) return;
    panOffsetX = e.clientX - panStartX;
    panOffsetY = e.clientY - panStartY;
    applyProductZoomTransform();
  });

  window.addEventListener("mouseup", () => {
    if (isPanning) {
      isPanning = false;
      viewport.classList.remove("dragging");
    }
  });

  // Touch Drag & Pan on Mobile
  viewport.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1 && currentZoomScale > 1) {
      isPanning = true;
      panStartX = e.touches[0].clientX - panOffsetX;
      panStartY = e.touches[0].clientY - panOffsetY;
    }
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    if (isPanning && e.touches.length === 1 && currentZoomScale > 1) {
      e.preventDefault();
      panOffsetX = e.touches[0].clientX - panStartX;
      panOffsetY = e.touches[0].clientY - panStartY;
      applyProductZoomTransform();
    }
  }, { passive: false });

  viewport.addEventListener("touchend", () => {
    isPanning = false;
  });

  // Mouse Wheel to Zoom in / out smoothly
  viewport.addEventListener("wheel", (e) => {
    const modal = document.getElementById("productZoomModal");
    if (!modal || !modal.classList.contains("active")) return;
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomInProduct();
    } else {
      zoomOutProduct();
    }
  }, { passive: false });

  // Double Click Toggle Zoom
  viewport.addEventListener("dblclick", (e) => {
    const modal = document.getElementById("productZoomModal");
    if (!modal || !modal.classList.contains("active")) return;
    e.preventDefault();
    if (currentZoomScale > 1) {
      resetProductZoom();
    } else {
      currentZoomScale = 2.2;
      applyProductZoomTransform();
    }
  });

  // Global Keyboard Navigation
  document.addEventListener("keydown", (e) => {
    const modal = document.getElementById("productZoomModal");
    if (!modal || !modal.classList.contains("active")) return;

    if (e.key === "Escape") closeProductZoomModal();
    if (e.key === "ArrowRight") nextProductZoom();
    if (e.key === "ArrowLeft") prevProductZoom();
    if (e.key === "+" || e.key === "=") zoomInProduct();
    if (e.key === "-" || e.key === "_") zoomOutProduct();
    if (e.key === "0" || e.key === "r" || e.key === "R") resetProductZoom();
    if (e.key === "f" || e.key === "F") toggleProductZoomFullscreen();
  });
}

function applyProductZoomTransform() {
  const img = document.getElementById("zoomModalImg");
  const badge = document.getElementById("zoomLevelBadge");
  if (!img) return;

  // Constrain pan offsets based on zoom scale
  if (currentZoomScale <= 1) {
    panOffsetX = 0;
    panOffsetY = 0;
  } else {
    const maxOffset = (currentZoomScale - 1) * 320;
    panOffsetX = Math.max(-maxOffset, Math.min(maxOffset, panOffsetX));
    panOffsetY = Math.max(-maxOffset, Math.min(maxOffset, panOffsetY));
  }

  img.style.transform = `translate(${panOffsetX}px, ${panOffsetY}px) scale(${currentZoomScale})`;
  if (badge) {
    badge.textContent = `${Math.round(currentZoomScale * 100)}%`;
  }
}

window.openProductZoomModal = function(productIdOrIndex) {
  initProductZoomEvents();

  const data = getSiteData();
  const allProds = data.products || [];

  if (!currentProductZoomList || !currentProductZoomList.length) {
    currentProductZoomList = allProds;
  }

  let index = 0;
  if (typeof productIdOrIndex === "number") {
    index = productIdOrIndex;
  } else if (typeof productIdOrIndex === "string") {
    let foundIdx = currentProductZoomList.findIndex(p => p.id === productIdOrIndex);
    if (foundIdx === -1) {
      const foundInAll = allProds.findIndex(p => p.id === productIdOrIndex);
      if (foundInAll !== -1) {
        currentProductZoomList = allProds;
        foundIdx = foundInAll;
      }
    }
    index = foundIdx !== -1 ? foundIdx : 0;
  }

  currentProductZoomIndex = Math.max(0, Math.min(currentProductZoomList.length - 1, index));
  updateProductZoomDisplay();

  const modal = document.getElementById("productZoomModal");
  if (modal) {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }
  document.body.style.overflow = "hidden";
};

function updateProductZoomDisplay() {
  if (!currentProductZoomList || !currentProductZoomList.length) return;
  const p = currentProductZoomList[currentProductZoomIndex];
  if (!p) return;

  const data = getSiteData();
  const waNum = data.company && data.company.whatsapp ? data.company.whatsapp : "923329716666";

  const catEl = document.getElementById("zoomModalCategory");
  const counterEl = document.getElementById("zoomModalCounter");
  const imgEl = document.getElementById("zoomModalImg");
  const brandEl = document.getElementById("zoomModalBrand");
  const titleEl = document.getElementById("zoomModalTitle");
  const tagEl = document.getElementById("zoomModalTag");
  const priceEl = document.getElementById("zoomModalPrice");
  const descEl = document.getElementById("zoomModalDesc");
  const waBtn = document.getElementById("zoomModalWhatsApp");

  if (catEl) catEl.textContent = p.categoryName || p.category || "Healthcare Essential";
  if (counterEl) counterEl.textContent = `${currentProductZoomIndex + 1} / ${currentProductZoomList.length}`;
  if (imgEl) {
    imgEl.src = encodeURI(p.image || "assets/images/pharmacy.jpg");
    imgEl.alt = p.name;
    imgEl.onerror = function() {
      this.onerror = null;
      this.src = "assets/images/pharmacy.jpg";
    };
  }
  if (brandEl) brandEl.textContent = p.brand || "D. Watson Certified";
  if (titleEl) titleEl.textContent = p.name;
  if (tagEl) tagEl.textContent = p.tag || "100% Genuine Guaranteed";
  if (priceEl) priceEl.textContent = p.price || "Inquire for Price";
  if (descEl) descEl.textContent = p.description || "Authentic pharmaceutical grade product, direct from official distributor with temperature-controlled handling.";

  if (waBtn) {
    const fullImgUrl = getFullImageUrl(p.image);
    let waText = `*--- D. WATSON PRODUCT INQUIRY & ORDER ---*\n🛍️ *Product:* ${p.name}\n🏷️ *Brand:* ${p.brand || 'D. Watson'}\n💰 *Price:* ${p.price || 'Inquire'}\n📂 *Category:* ${p.categoryName || p.category}\n`;
    if (fullImgUrl) {
      waText += `📸 *Product Photo Link:* ${fullImgUrl}\n`;
    }
    waText += `\n📝 *Inquiry Note:* Hi D.Watson Chemist, please confirm stock availability and express delivery to my location.`;
    const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}`;
    waBtn.href = waUrl;
    waBtn.onclick = function(e) {
      handleProductOrderClick(e, p.id, waUrl);
    };
  }

  resetProductZoom();
  renderProductZoomThumbs();
}

function renderProductZoomThumbs() {
  const container = document.getElementById("zoomThumbsStrip");
  if (!container || !currentProductZoomList.length) return;

  container.innerHTML = currentProductZoomList.map((item, idx) => `
    <div class="zoom-thumb-item ${idx === currentProductZoomIndex ? 'active' : ''}" onclick="goToProductZoom(${idx})" title="${escapeHtml(item.name)}">
      <img src="${encodeURI(item.image || 'assets/images/pharmacy.jpg')}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
    </div>
  `).join("");
}

window.goToProductZoom = function(index) {
  if (index < 0 || index >= currentProductZoomList.length) return;
  currentProductZoomIndex = index;
  updateProductZoomDisplay();
};

window.nextProductZoom = function() {
  if (!currentProductZoomList.length) return;
  currentProductZoomIndex = (currentProductZoomIndex + 1) % currentProductZoomList.length;
  updateProductZoomDisplay();
};

window.prevProductZoom = function() {
  if (!currentProductZoomList.length) return;
  currentProductZoomIndex = (currentProductZoomIndex - 1 + currentProductZoomList.length) % currentProductZoomList.length;
  updateProductZoomDisplay();
};

window.zoomInProduct = function() {
  currentZoomScale = Math.min(4, Math.round((currentZoomScale + 0.35) * 100) / 100);
  applyProductZoomTransform();
};

window.zoomOutProduct = function() {
  currentZoomScale = Math.max(1, Math.round((currentZoomScale - 0.35) * 100) / 100);
  if (currentZoomScale === 1) {
    panOffsetX = 0;
    panOffsetY = 0;
  }
  applyProductZoomTransform();
};

window.resetProductZoom = function() {
  currentZoomScale = 1;
  panOffsetX = 0;
  panOffsetY = 0;
  applyProductZoomTransform();
};

window.toggleProductZoomFullscreen = function() {
  const modal = document.getElementById("productZoomModal");
  if (!modal) return;

  if (!document.fullscreenElement) {
    if (modal.requestFullscreen) {
      modal.requestFullscreen();
    } else if (modal.webkitRequestFullscreen) {
      modal.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

window.closeProductZoomModal = function() {
  const modal = document.getElementById("productZoomModal");
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
  document.body.style.overflow = "";
  resetProductZoom();
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
};

/**
 * ==========================================================================
 * Real-Time Branch Operating Status & GPS Branch Locator Engine
 * ==========================================================================
 */
const BRANCH_GPS_COORDINATES = {
  "b_f6": { lat: 33.7297, lng: 73.0746 },
  "b_pwd": { lat: 33.5855, lng: 73.1554 },
  "b_ghauri": { lat: 33.6267, lng: 73.1360 },
  "b_chandni": { lat: 33.6231, lng: 73.0694 },
  "b_gujar_khan": { lat: 33.2556, lng: 73.3039 },
  "b_g15": { lat: 33.6421, lng: 72.9325 },
  "b_f10": { lat: 33.6931, lng: 73.0076 },
  "b_f11": { lat: 33.6845, lng: 72.9885 },
  "b_bluearea": { lat: 33.7103, lng: 73.0571 },
  "b_saddar": { lat: 33.5975, lng: 73.0543 },
  "b_bahria": { lat: 33.5353, lng: 73.1195 },
  "b_dha": { lat: 33.5283, lng: 73.1492 },
  "b_peshawar": { lat: 34.0151, lng: 71.5249 },
  "b_abbottabad": { lat: 34.1688, lng: 73.2215 },
  "b_lahore": { lat: 31.5204, lng: 74.3587 }
};

// Returns accurate live open/closed status using Pakistan Standard Time (Asia/Karachi UTC+5)
function getBranchLiveStatus(timingsStr, is24Hours) {
  if (is24Hours) {
    return {
      isOpen: true,
      label: "Open 24/7",
      badge: `<span class="badge-live-open"><i class="fa-solid fa-circle"></i> Open 24/7</span>`
    };
  }

  // Calculate current hour and minute in Pakistan Standard Time (UTC+5)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const pktDate = new Date(utc + (3600000 * 5));
  const currentMinutes = pktDate.getHours() * 60 + pktDate.getMinutes();

  const isTill1AM = (timingsStr || "").includes("01:00 AM") || (timingsStr || "").includes("1:00 AM");
  const isTillMidnight = (timingsStr || "").includes("12:00 AM");

  const openMinute = 8 * 60; // 08:00 AM = 480
  let closeMinute = 23 * 60; // default 11:00 PM = 1380
  let closeDisplay = "11:00 PM";

  if (isTill1AM) {
    closeMinute = 25 * 60; // 01:00 AM next day = 1500
    closeDisplay = "1:00 AM";
  } else if (isTillMidnight) {
    closeMinute = 24 * 60; // 12:00 AM midnight = 1440
    closeDisplay = "Midnight";
  }

  let testMinute = currentMinutes;
  if (isTill1AM && currentMinutes < 8 * 60) {
    testMinute = currentMinutes + 24 * 60;
  }

  const isOpen = (testMinute >= openMinute && testMinute < closeMinute);

  if (isOpen) {
    return {
      isOpen: true,
      label: `Open Now • Closes ${closeDisplay}`,
      badge: `<span class="badge-live-open"><i class="fa-solid fa-circle"></i> Open Now &bull; Closes ${closeDisplay}</span>`
    };
  } else {
    return {
      isOpen: false,
      label: "Closed • Opens 8:00 AM",
      badge: `<span class="badge-live-closed"><i class="fa-solid fa-circle"></i> Closed &bull; Opens 8:00 AM</span>`
    };
  }
}

// Haversine formula to compute great-circle distance in kilometers
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getFallbackBranchCoords(b) {
  const city = (b.city || "").toLowerCase();
  if (city.includes("islamabad")) return { lat: 33.6844, lng: 73.0479 };
  if (city.includes("rawalpindi")) return { lat: 33.5973, lng: 73.0479 };
  if (city.includes("lahore")) return { lat: 31.5204, lng: 74.3587 };
  if (city.includes("peshawar")) return { lat: 34.0151, lng: 71.5249 };
  if (city.includes("abbottabad")) return { lat: 34.1688, lng: 73.2215 };
  return { lat: 33.7297, lng: 73.0746 };
}

window.findNearestBranchGPS = function() {
  const btn = document.getElementById("gpsLocateBtn");
  const origHtml = btn ? btn.innerHTML : "";

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your mobile browser. Please search branches by sector or city name.");
    return;
  }

  if (btn) {
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Locating You...</span>`;
    btn.disabled = true;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      allBranchesData.forEach(b => {
        const coords = BRANCH_GPS_COORDINATES[b.id] || getFallbackBranchCoords(b);
        b.distanceKm = haversineDistanceKm(userLat, userLng, coords.lat, coords.lng);
      });

      filteredBranchesData.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
      const closest = filteredBranchesData[0];

      if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Nearest: ${closest.name.split('-')[0].trim()} (${closest.distanceKm.toFixed(1)} km)</span>`;
        btn.classList.add("located");
        btn.disabled = false;
      }

      renderNearestBranchBanner(closest);
      activeBranchId = closest.id;

      renderBranchHub(filteredBranchesData);
      renderBranchCards(filteredBranchesData);

      const branchSec = document.getElementById("branches");
      if (branchSec) {
        branchSec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    (err) => {
      if (btn) {
        btn.innerHTML = origHtml;
        btn.disabled = false;
      }
      let errNote = "Unable to retrieve your location. Please check your device location settings.";
      if (err.code === 1) errNote = "Location permission denied. Please allow location access in your browser to find the nearest branch.";
      alert(errNote);
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
  );
};

function renderNearestBranchBanner(closestBranch) {
  let banner = document.getElementById("nearestBranchBanner");
  const toolbar = document.querySelector(".branch-toolbar");
  if (!toolbar) return;

  if (!banner) {
    banner = document.createElement("div");
    banner.id = "nearestBranchBanner";
    banner.className = "nearest-branch-banner";
    toolbar.parentNode.insertBefore(banner, toolbar.nextSibling);
  }

  const phoneCall = getBranchPhone(closestBranch.phone);
  const mapUrl = closestBranch.mapUrl || `https://maps.google.com/?q=D.+Watson+${encodeURIComponent(closestBranch.name)}`;

  banner.innerHTML = `
    <div class="nearest-branch-info">
      <div class="nearest-branch-badge"><i class="fa-solid fa-location-crosshairs"></i> Nearest Branch to Your Current Location</div>
      <h3 style="margin:4px 0 2px; font-size:1.1rem; color:#0F172A;">${escapeHtml(closestBranch.name)}</h3>
      <p style="margin:0; font-size:0.85rem; color:#64748B;"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(closestBranch.address)} &bull; <strong>${closestBranch.distanceKm.toFixed(1)} km away</strong></p>
    </div>
    <div class="nearest-branch-actions" style="display:flex; gap:8px; flex-wrap:wrap;">
      <a href="${mapUrl}" target="_blank" class="btn btn-outline-primary btn-sm btn-nearest-action">
        <i class="fa-solid fa-diamond-turn-right"></i> Get Directions
      </a>
      <a href="tel:${phoneCall}" class="btn btn-primary btn-sm btn-nearest-action">
        <i class="fa-solid fa-phone"></i> Call Outlet
      </a>
    </div>
  `;
  banner.style.display = "flex";
}

/**
 * Interactive Master-Detail Branches Locator & Directory (25+ Network)
 */
let activeBranchId = null;
function renderBranches(branches) {
  allBranchesData = branches || [];
  filteredBranchesData = allBranchesData;

  const hubContainer = document.getElementById("branchHubLayout");
  const pillsContainer = document.getElementById("branchCityPills");
  if (!allBranchesData.length) return;

  // Render City Pills with actual counts
  const flagshipCount = allBranchesData.filter(b => b.isFlagship).length;
  const isbCount = allBranchesData.filter(b => b.city.toLowerCase() === "islamabad").length;
  const rwpCount = allBranchesData.filter(b => b.city.toLowerCase() === "rawalpindi").length;
  const otherCount = allBranchesData.filter(b => b.city.toLowerCase() !== "islamabad" && b.city.toLowerCase() !== "rawalpindi" && b.city.toLowerCase() !== "lahore").length;
  const lateNightCount = allBranchesData.filter(b => b.timings && b.timings.includes("01:00 AM")).length;

  const cityOptions = [
    { key: "all", label: `All Outlets (${allBranchesData.length})` },
    { key: "flagship", label: `⭐ Flagship Branches (${flagshipCount})` },
    { key: "Islamabad", label: `Islamabad (${isbCount})` },
    { key: "Rawalpindi", label: `Rawalpindi (${rwpCount})` },
    { key: "Other Cities", label: `Regional Hubs (${otherCount})` },
    { key: "latenight", label: `🌙 Open Till 1 AM (${lateNightCount})` }
  ];

  if (pillsContainer) {
    pillsContainer.innerHTML = cityOptions.map((opt, idx) => `
      <button class="branch-pill-btn ${idx === 0 ? 'active' : ''}" onclick="filterBranchesByCity('${opt.key}', this)">
        ${escapeHtml(opt.label)}
      </button>
    `).join("");
  }

  // Set default active branch to first flagship branch (F-6 Super Market)
  activeBranchId = allBranchesData[0].id;

  renderBranchHub(filteredBranchesData);
  renderBranchCards(filteredBranchesData);

  // Search Input Handler
  const searchInput = document.getElementById("branchSearchInput");
  const clearBtn = document.getElementById("branchSearchClear");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      if (clearBtn) clearBtn.style.display = term ? "block" : "none";

      filteredBranchesData = allBranchesData.filter(b => 
        b.name.toLowerCase().includes(term) ||
        b.address.toLowerCase().includes(term) ||
        b.city.toLowerCase().includes(term) ||
        (b.area && b.area.toLowerCase().includes(term))
      );

      renderBranchHub(filteredBranchesData);
      renderBranchCards(filteredBranchesData);
    });
  }
}

// Returns the branch-specific phone number, preferring the dedicated PTCL/branch line
function getBranchPhone(phoneStr) {
  if (!phoneStr) return "0518438111";
  const CENTRAL_HELPLINE = "0518438111";
  const numbers = phoneStr.split("/").map(n => n.trim());
  const own = numbers.find(n => n.replace(/[^0-9]/g, "") !== CENTRAL_HELPLINE);
  return (own || numbers[0]).replace(/[^0-9]/g, "");
}

/**
 * Render Master-Detail Interactive Hub View
 */
function renderBranchHub(branches) {
  const scrollList = document.getElementById("branchScrollList");
  const countText = document.getElementById("branchCountText");
  const detailPane = document.getElementById("branchDetailPane");

  if (!scrollList || !detailPane) return;

  if (countText) {
    countText.textContent = `Showing ${branches.length} ${branches.length === 1 ? 'Branch' : 'Branches'}`;
  }

  if (branches.length === 0) {
    scrollList.innerHTML = `
      <div style="text-align: center; padding: 40px 14px; color: #64748B;">
        <i class="fa-solid fa-map-location-dot" style="font-size: 2rem; color: #CBD5E1; margin-bottom: 8px;"></i>
        <p style="font-weight: 700; font-size: 0.9rem; margin-bottom: 2px;">No Matching Branches</p>
        <small>Try searching another sector or city.</small>
      </div>
    `;
    detailPane.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; color: #94A3B8; padding: 40px;">
        <i class="fa-solid fa-store-slash" style="font-size: 3rem; margin-bottom: 12px; color: #CBD5E1;"></i>
        <h3 style="color: #475569; font-size: 1.1rem; margin-bottom: 6px;">No Branch Selected</h3>
        <p style="font-size: 0.85rem;">Clear your search filter to see available branch locations.</p>
      </div>
    `;
    return;
  }

  // Ensure active branch exists in filtered list
  const activeExists = branches.some(b => b.id === activeBranchId);
  if (!activeExists) {
    activeBranchId = branches[0].id;
  }

  scrollList.innerHTML = branches.map(b => {
    const isActive = b.id === activeBranchId;
    const liveStatus = getBranchLiveStatus(b.timings, b.is24Hours);
    const distBadge = (typeof b.distanceKm === "number") ? `<span style="background:#EFF6FF; color:#1D4ED8; font-weight:700; font-size:0.68rem; padding:2px 6px; border-radius:4px; border:1px solid #BFDBFE;"><i class="fa-solid fa-location-arrow"></i> ${b.distanceKm.toFixed(1)} km</span>` : '';
    return `
      <div class="branch-mini-item ${isActive ? 'active' : ''}" onclick="selectActiveBranch('${b.id}', true)" id="branch-mini-${b.id}">
        <div class="branch-mini-top">
          <span class="branch-mini-name">${escapeHtml(b.name)}</span>
          <div class="branch-mini-badges">
            ${b.isFlagship ? '<span class="branch-mini-flagship" style="background:#FEF3C7; color:#92400E; font-weight:800; font-size:0.68rem; padding:2px 6px; border-radius:4px; border:1px solid #FCD34D;"><i class="fa-solid fa-star"></i> Flagship</span>' : ''}
            ${distBadge}
            <span class="branch-mini-city">${escapeHtml(b.city)}</span>
            ${b.is24Hours ? '<span class="branch-mini-24">24/7</span>' : ''}
          </div>
        </div>
        <div class="branch-mini-address">
          <i class="fa-solid fa-location-dot"></i>
          <span>${escapeHtml(b.address)}</span>
        </div>
        <div class="branch-mini-footer">
          <span><i class="fa-regular fa-clock"></i> ${escapeHtml(b.timings)}</span>
          <span style="color: var(--dw-blue); font-weight: 700;">View <i class="fa-solid fa-arrow-right" style="font-size:0.7rem;"></i></span>
        </div>
      </div>
    `;
  }).join("");

  // Render the currently active branch detail
  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0];
  renderActiveBranchDetail(activeBranch);
}

/**
 * Render Right Pane: Active Branch Showcase
 */
function renderActiveBranchDetail(b) {
  const detailPane = document.getElementById("branchDetailPane");
  if (!detailPane || !b) return;

  const phoneCall = getBranchPhone(b.phone);
  const waNumber = b.whatsapp || "923329716666";
  const waMsg = encodeURIComponent(`Hi D. Watson ${b.name}, I need assistance with medicine availability / delivery.`);
  const liveStatus = getBranchLiveStatus(b.timings, b.is24Hours);
  const distBadge = (typeof b.distanceKm === "number") ? `
    <span style="display:inline-flex; align-items:center; gap:5px; background:#EFF6FF; color:#1D4ED8; font-size:0.75rem; font-weight:800; padding:3px 10px; border-radius:9999px; text-transform:uppercase; border:1px solid #BFDBFE;">
      <i class="fa-solid fa-location-arrow"></i> ${b.distanceKm.toFixed(1)} km away
    </span>
  ` : '';

  detailPane.innerHTML = `
    <div class="branch-detail-hero">
      <img src="${encodeURI(b.image || 'assets/images/store_flagship.jpg')}" alt="${escapeHtml(b.name)}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='assets/images/store_flagship.jpg';">
      <div class="branch-detail-hero-overlay">
        <div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px;">
            ${b.isFlagship ? `
              <span style="display:inline-flex; align-items:center; gap:5px; background:linear-gradient(135deg, #F59E0B, #D97706); color:white; font-size:0.75rem; font-weight:800; padding:3px 10px; border-radius:9999px; text-transform:uppercase; box-shadow:0 2px 6px rgba(0,0,0,0.2);">
                <i class="fa-solid fa-star"></i> Flagship Branch
              </span>
            ` : ''}
            ${distBadge}
            ${liveStatus.badge}
          </div>
          <h3 class="branch-detail-hero-title">${escapeHtml(b.name)}</h3>
        </div>
        <span class="branch-detail-hero-city"><i class="fa-solid fa-map-pin"></i> ${escapeHtml(b.city)}</span>
      </div>
    </div>

    <div class="branch-detail-info-grid">
      <div class="branch-info-box">
        <div class="branch-info-box-title">
          <i class="fa-solid fa-location-dot"></i> Complete Branch Address
        </div>
        <div class="branch-info-box-val">
          ${escapeHtml(b.address)}
        </div>
      </div>

      <div class="branch-info-box">
        <div class="branch-info-box-title">
          <i class="fa-solid fa-phone"></i> Dedicated Phone / Helpline
        </div>
        <div class="branch-info-box-val">
          <a href="tel:${phoneCall}" style="color:var(--dw-blue); text-decoration:none;">
            ${escapeHtml(b.phone)}
          </a>
        </div>
      </div>
    </div>

    <div class="branch-info-box" style="margin-bottom: 20px;">
      <div class="branch-info-box-title">
        <i class="fa-regular fa-clock"></i> Operating Hours
      </div>
      <div class="branch-info-box-val" style="color:#0F172A;">
        ${escapeHtml(b.timings)}
      </div>
    </div>

    <div class="branch-amenities">
      <div class="branch-amenities-title">Available Departments &amp; Services</div>
      <div class="branch-amenities-tags">
        ${(b.services || []).map(s => `<span class="branch-amenity-tag">${escapeHtml(s)}</span>`).join("")}
      </div>
    </div>

    <div class="branch-detail-actions">
      <a href="${b.mapUrl || `https://maps.google.com/?q=D.+Watson+${encodeURIComponent(b.name)}`}" target="_blank" class="btn btn-outline" style="flex:1;">
        <i class="fa-solid fa-location-arrow"></i> Google Maps Directions
      </a>
      <a href="https://wa.me/${waNumber}?text=${waMsg}" target="_blank" class="btn btn-whatsapp" style="flex:1;">
        <i class="fa-brands fa-whatsapp"></i> Chat on WhatsApp
      </a>
      <a href="tel:${phoneCall}" class="btn btn-primary" style="padding:10px 18px;">
        <i class="fa-solid fa-phone"></i>
      </a>
    </div>
  `;
}

/**
 * Filter Branches by City Pill
 */
window.filterBranchesByCity = function(cityKey, btn) {
  document.querySelectorAll("#branchCityPills .branch-pill-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  const data = getSiteData();
  const allBranches = data.branches || [];

  if (cityKey === "all") {
    filteredBranchesData = allBranches;
  } else if (cityKey === "flagship") {
    filteredBranchesData = allBranches.filter(b => b.isFlagship);
  } else if (cityKey === "latenight") {
    filteredBranchesData = allBranches.filter(b => b.timings && b.timings.includes("01:00 AM"));
  } else if (cityKey === "Other Cities") {
    filteredBranchesData = allBranches.filter(b => 
      b.city.toLowerCase() !== "islamabad" && 
      b.city.toLowerCase() !== "rawalpindi" && 
      b.city.toLowerCase() !== "lahore"
    );
  } else {
    filteredBranchesData = allBranches.filter(b => b.city.toLowerCase() === cityKey.toLowerCase());
  }

  // Preserve distance sorting if GPS was run
  if (allBranchesData[0] && typeof allBranchesData[0].distanceKm === "number") {
    filteredBranchesData.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
  }

  renderBranchHub(filteredBranchesData);
  renderBranchCards(filteredBranchesData);
};

window.switchBranchView = function(viewType) {
  const hub = document.getElementById("branchHubLayout");
  const grid = document.getElementById("branchesGrid");
  const btnHub = document.getElementById("viewBtnHub");
  const btnGrid = document.getElementById("viewBtnGrid");

  if (viewType === "hub") {
    if (hub) hub.style.display = "grid";
    if (grid) grid.style.display = "none";
    if (btnHub) btnHub.classList.add("active");
    if (btnGrid) btnGrid.classList.remove("active");
  } else {
    if (hub) hub.style.display = "none";
    if (grid) grid.style.display = "grid";
    if (btnHub) btnHub.classList.remove("active");
    if (btnGrid) btnGrid.classList.add("active");
  }
};

window.clearBranchSearch = function() {
  const searchInput = document.getElementById("branchSearchInput");
  const clearBtn = document.getElementById("branchSearchClear");
  if (searchInput) {
    searchInput.value = "";
    if (clearBtn) clearBtn.style.display = "none";
    filteredBranchesData = allBranchesData;
    renderBranchHub(filteredBranchesData);
    renderBranchCards(filteredBranchesData);
  }
};

window.selectActiveBranch = function(branchId, shouldScroll) {
  activeBranchId = branchId;
  const branch = allBranchesData.find(b => b.id === branchId);

  // Update mini list highlight
  document.querySelectorAll(".branch-mini-item").forEach(el => el.classList.remove("active"));
  const activeMini = document.getElementById(`branch-mini-${branchId}`);
  if (activeMini) {
    activeMini.classList.add("active");
    if (shouldScroll) {
      activeMini.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  if (branch) {
    renderActiveBranchDetail(branch);
  }
};

function renderBranchCards(branches) {
  const container = document.getElementById("branchesGrid");
  if (!container) return;

  if (branches.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: white; border-radius: 16px; border: 1px dashed #CBD5E1;">
        <i class="fa-solid fa-map-location-dot" style="font-size: 3rem; color: #94A3B8; margin-bottom: 12px;"></i>
        <h3 style="color: #0F172A; margin-bottom: 6px;">No Branches Found</h3>
        <p style="color: #64748B;">Try a different search keyword or city filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = branches.map(b => {
    const liveStatus = getBranchLiveStatus(b.timings, b.is24Hours);
    const distBadge = (typeof b.distanceKm === "number") ? `<span class="branch-gps-distance-badge"><i class="fa-solid fa-location-arrow"></i> ${b.distanceKm.toFixed(1)} km</span>` : '';
    return `
    <div class="branch-card" style="position:relative;">
      <div class="branch-card-header">
        <img src="${encodeURI(b.image || 'assets/images/store_flagship.jpg')}" alt="${escapeHtml(b.name)}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='assets/images/store_flagship.jpg';">
        ${b.isFlagship ? '<span style="position:absolute; top:12px; left:12px; background:linear-gradient(135deg, #F59E0B, #D97706); color:white; font-weight:800; font-size:0.72rem; padding:3px 8px; border-radius:6px; z-index:2; box-shadow:0 2px 6px rgba(0,0,0,0.2);"><i class="fa-solid fa-star"></i> Flagship</span>' : ''}
        ${distBadge}
        ${liveStatus.badge}
        <span class="branch-city-badge">${escapeHtml(b.city)}</span>
      </div>
      <div class="branch-card-body">
        <h3 class="branch-card-name">${escapeHtml(b.name)}</h3>
        <p class="branch-card-address"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(b.address)}</p>
        <p class="branch-card-timings"><i class="fa-regular fa-clock"></i> ${escapeHtml(b.timings)}</p>
        <div class="branch-card-tags">
          ${(b.services || []).slice(0, 3).map(s => `<span class="branch-tag">${escapeHtml(s)}</span>`).join("")}
        </div>
      </div>
      <div class="branch-card-footer">
        <a href="${b.mapUrl || `https://maps.google.com/?q=D.+Watson+${encodeURIComponent(b.name)}`}" target="_blank" class="btn btn-outline btn-sm">
          <i class="fa-solid fa-location-arrow"></i> Map
        </a>
        <a href="tel:${getBranchPhone(b.phone)}" class="btn btn-primary btn-sm">
          <i class="fa-solid fa-phone"></i> Call
        </a>
      </div>
    </div>
  `;
  }).join("");
}

/**
 * Image Gallery & Lightbox
 */
function renderGallery(galleryItems) {
  activeGalleryItems = galleryItems || [];
  const container = document.getElementById("galleryGrid");
  if (!container || !activeGalleryItems.length) return;

  renderGalleryGrid(activeGalleryItems);
}

function renderGalleryGrid(items) {
  const container = document.getElementById("galleryGrid");
  if (!container) return;

  activeGalleryItems = items || [];

  container.innerHTML = activeGalleryItems.map((item, index) => `
    <div class="gallery-item" onclick="openLightbox(${index})">
      <img src="${encodeURI(item.image)}" alt="${escapeHtml(item.title || 'D. Watson Photo')}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
      <div class="gallery-overlay">
        <span class="gallery-zoom-icon"><i class="fa-solid fa-expand"></i></span>
        <h4 class="gallery-overlay-title">${escapeHtml(item.title || 'D. Watson Photo')}</h4>
        ${item.description ? `<p style="font-size:0.8rem; color:#E2E8F0; margin-top:4px; opacity:0.9;">${escapeHtml(item.description)}</p>` : ''}
      </div>
    </div>
  `).join("");
}

/**
 * Lightbox Modal Logic
 */
window.openLightbox = function(index) {
  if (!activeGalleryItems || !activeGalleryItems[index]) return;
  currentGalleryIndex = index;
  const modal = document.getElementById("lightboxModal");
  const img = document.getElementById("lightboxImage");
  const caption = document.getElementById("lightboxCaption");

  if (!modal || !img) return;

  img.src = activeGalleryItems[index].image;
  if (caption) {
    caption.innerHTML = `<strong>${escapeHtml(activeGalleryItems[index].title)}</strong><br><span style="font-size:0.85rem; color:#94A3B8;">${escapeHtml(activeGalleryItems[index].description || '')}</span>`;
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeLightbox = function() {
  const modal = document.getElementById("lightboxModal");
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "";
};

window.nextLightbox = function() {
  if (!activeGalleryItems.length) return;
  currentGalleryIndex = (currentGalleryIndex + 1) % activeGalleryItems.length;
  openLightbox(currentGalleryIndex);
};

window.prevLightbox = function() {
  if (!activeGalleryItems.length) return;
  currentGalleryIndex = (currentGalleryIndex - 1 + activeGalleryItems.length) % activeGalleryItems.length;
  openLightbox(currentGalleryIndex);
};

document.addEventListener("keydown", (e) => {
  const modal = document.getElementById("lightboxModal");
  if (modal && modal.classList.contains("active")) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextLightbox();
    if (e.key === "ArrowLeft") prevLightbox();
  }
});

/**
 * Render FAQ Accordion
 */
function renderFAQs(faqs) {
  const container = document.getElementById("faqAccordion");
  if (!container || !faqs) return;

  container.innerHTML = faqs.map((faq, idx) => `
    <div class="faq-card ${idx === 0 ? 'open' : ''}">
      <div class="faq-header" onclick="toggleFaq(this)">
        <span>${escapeHtml(faq.q)}</span>
        <i class="fa-solid fa-chevron-down"></i>
      </div>
      <div class="faq-body">
        <p>${escapeHtml(faq.a)}</p>
      </div>
    </div>
  `).join("");
}

window.toggleFaq = function(headerEl) {
  const card = headerEl.parentElement;
  const wasOpen = card.classList.contains("open");

  document.querySelectorAll(".faq-card").forEach(c => c.classList.remove("open"));
  if (!wasOpen) card.classList.add("open");
};

/**
 * Render Footer Links & Details
 */
function renderFooter(company, branches) {
  const footerAbout = document.getElementById("footerAboutText");
  if (footerAbout) footerAbout.textContent = company.aboutShort;

  const footerHelpline = document.getElementById("footerHelpline");
  if (footerHelpline) footerHelpline.textContent = company.helpline;

  const footerEmail = document.getElementById("footerEmail");
  if (footerEmail) footerEmail.textContent = company.email;

  const channelEmailLink = document.getElementById("channelEmailLink");
  if (channelEmailLink) channelEmailLink.href = `mailto:${company.email}`;

  const channelEmailDesc = document.getElementById("channelEmailDesc");
  if (channelEmailDesc) channelEmailDesc.textContent = `${company.email} • Direct consultation & inquiries.`;

  const footerAddress = document.getElementById("footerAddress");
  if (footerAddress) footerAddress.textContent = company.address;

  const footerBranchList = document.getElementById("footerBranchList");
  if (footerBranchList && branches) {
    const isSubpage = window.location.pathname.includes("departments") || 
                      window.location.pathname.includes("branches") || 
                      window.location.pathname.includes("prescription") || 
                      window.location.pathname.includes("journey") || 
                      window.location.pathname.includes("contact") ||
                      window.location.pathname.includes("privacy") ||
                      window.location.pathname.includes("terms");
    const branchPrefix = isSubpage ? "branches.html" : "branches.html";
    const flagshipBranches = branches.filter(b => b.isFlagship);
    const displayBranches = (flagshipBranches.length >= 7 ? flagshipBranches.slice(0, 7) : branches.slice(0, 7));
    footerBranchList.innerHTML = displayBranches.map(b => `
      <li><a href="${branchPrefix}"><i class="fa-solid fa-angle-right"></i> ${escapeHtml(b.name)}</a></li>
    `).join("");
  }
}

/**
 * Helper: Resolve relative image path to direct GitHub Raw CDN public URL
 * Always accessible anywhere in the world with HTTP 200 OK, zero 404s, zero ads
 */
function getFullImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  
  const cleanPath = imagePath.replace(/^\.?\//, "");
  const encodedPath = encodeURI(cleanPath).replace(/\+/g, "%2B");
  
  // Prefer live site origin if available, otherwise default to https://www.dwatson.co
  let origin = "https://www.dwatson.co";
  if (typeof window !== "undefined" && window.location && window.location.origin && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1")) {
    origin = window.location.origin;
  }
  return `${origin}/${encodedPath}`;
}
window.getFullImageUrl = getFullImageUrl;


let activeOrderProduct = null;

window.openBranchSelectorModal = function(product) {
  activeOrderProduct = product;
  
  const data = getSiteData();
  const branches = data.branches || [];
  const flagshipBranches = branches.filter(b => b.isFlagship);
  
  const selectEl = document.getElementById("orderBranchSelect");
  if (selectEl) {
    if (flagshipBranches.length > 0) {
      selectEl.innerHTML = flagshipBranches.map((b, idx) => `
        <option value="${escapeHtml(b.name)}" ${idx === 0 ? 'selected' : ''}>${escapeHtml(b.name)}</option>
      `).join("");
    } else {
      selectEl.innerHTML = `<option value="D. Watson General Pharmacy">D. Watson General Pharmacy</option>`;
    }
  }
  
  const modal = document.getElementById("branchSelectorModal");
  if (modal) {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }
  document.body.style.overflow = "hidden";
};

window.closeBranchSelectorModal = function() {
  const modal = document.getElementById("branchSelectorModal");
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
  document.body.style.overflow = "";
  activeOrderProduct = null;
};

/**
 * Handle Product Order Click: Awaits Real-Time Cloud Sync & opens WhatsApp
 */
window.handleProductOrderClick = async function(event, productId, waUrl) {
  if (event) event.preventDefault();

  const p = (allProductsData || []).find(item => item.id === productId) || (currentProductZoomList || []).find(item => item.id === productId);
  if (!p) {
    if (waUrl) window.open(waUrl, "_blank");
    return;
  }

  openBranchSelectorModal(p);
};

let selectedPrescriptionBase64 = null;
let selectedPrescriptionFileName = "";
let uploadedCleanPhotoUrl = null;
let isCleanPhotoUploading = false;
let cleanPhotoUploadPromise = null;

/**
 * Helper: Upload image to 100% clean, ad-free direct image host
 * Returns direct raw image URL (e.g. https://files.catbox.moe/xyz.jpg)
 */
async function uploadImageToCleanHost(file) {
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", file);

  try {
    const res = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData
    });
    if (res.ok) {
      const urlText = await res.text();
      if (urlText && urlText.trim().startsWith("https://files.catbox.moe/")) {
        return urlText.trim();
      }
    }
  } catch (err) {
    console.warn("Direct image host error:", err);
  }
  return null;
}

/**
 * Prescription & Inquiry Uploader Form logic
 */
function initPrescriptionUploader(whatsappNumber) {
  const fileInput = document.getElementById("prescriptionFileInput");
  const dropzone = document.getElementById("prescriptionDropzone");
  const previewBox = document.getElementById("prescriptionPreview");
  const previewImg = document.getElementById("previewImg");
  const fileNameTxt = document.getElementById("prescriptionFileName");
  const uploadStatus = document.getElementById("prescriptionUploadStatus");
  const form = document.getElementById("prescriptionForm");
  const selectEl = document.getElementById("custBranch");

  const escapeHtml = (str) => (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  // Load and filter branches dynamically
  const data = getSiteData();
  const branches = data.branches || [];
  const flagshipBranches = branches.filter(b => b.isFlagship);

  // Populate select options dynamically
  if (selectEl) {
    if (flagshipBranches.length > 0) {
      selectEl.innerHTML = flagshipBranches.map((b, idx) => `
        <option value="${escapeHtml(b.name)}" ${idx === 0 ? 'selected' : ''}>${escapeHtml(b.name)}</option>
      `).join("");
    } else {
      selectEl.innerHTML = `<option value="D. Watson General Pharmacy">D. Watson General Pharmacy</option>`;
    }
  }

  if (!dropzone || !fileInput) return;

  const submitBtn = form ? form.querySelector("button[type='submit']") : null;

  // Dynamically update submit button WhatsApp display
  function updateWhatsappBtnText() {
    if (!selectEl || !submitBtn) return;
    const selectedBranchName = selectEl.value;
    const selectedBranch = branches.find(b => b.name === selectedBranchName);
    const activeWa = selectedBranch && selectedBranch.whatsapp ? selectedBranch.whatsapp : whatsappNumber;

    let displayWa = activeWa;
    if (activeWa && activeWa.startsWith("92")) {
      displayWa = "0" + activeWa.slice(2, 5) + "-" + activeWa.slice(5);
    }
    submitBtn.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Send to Pharmacy Desk on WhatsApp (${displayWa})`;
  }

  if (selectEl) {
    selectEl.addEventListener("change", updateWhatsappBtnText);
    updateWhatsappBtnText();
  }

  dropzone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedPrescriptionFileName = file.name;
      uploadedCleanPhotoUrl = null;
      if (fileNameTxt) fileNameTxt.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
      
      const reader = new FileReader();
      reader.onload = async function(evt) {
        selectedPrescriptionBase64 = evt.target.result;
        if (previewImg) previewImg.src = selectedPrescriptionBase64;
        if (previewBox) previewBox.classList.add("active");

        if (uploadStatus) {
          uploadStatus.innerHTML = `<span style="color:#2563EB; display:inline-flex; align-items:center; gap:6px;"><i class="fa-solid fa-spinner fa-spin"></i> Generating direct photo link (No ads)...</span>`;
        }

        // Auto-copy image to clipboard so user can also press Ctrl+V in WhatsApp
        if (navigator.clipboard && window.ClipboardItem && file.type.startsWith("image/")) {
          try {
            await navigator.clipboard.write([new ClipboardItem({ [file.type]: file })]);
          } catch (clipErr) {
            // Optional clipboard support
          }
        }
      };
      reader.readAsDataURL(file);

      // Upload to clean, 100% ad-free raw image CDN
      isCleanPhotoUploading = true;
      cleanPhotoUploadPromise = uploadImageToCleanHost(file).then(url => {
        uploadedCleanPhotoUrl = url;
        isCleanPhotoUploading = false;
        if (uploadStatus) {
          if (url) {
            uploadStatus.innerHTML = `<span style="color:#16A34A; display:inline-flex; align-items:center; gap:6px;"><i class="fa-solid fa-circle-check"></i> Direct Photo Link Ready (Ad-Free)</span>`;
          } else {
            uploadStatus.innerHTML = `<span style="color:#16A34A; display:inline-flex; align-items:center; gap:6px;"><i class="fa-solid fa-circle-check"></i> Photo Ready &amp; Saved to Portal</span>`;
          }
        }
        return url;
      });
    }
  });

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector("button[type='submit']");
      const origBtnHtml = submitBtn ? submitBtn.innerHTML : "";

      if (isCleanPhotoUploading && cleanPhotoUploadPromise) {
        if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Preparing Direct Photo Link...`;
        try {
          await Promise.race([cleanPhotoUploadPromise, new Promise(res => setTimeout(res, 2500))]);
        } catch (err) {}
        if (submitBtn) submitBtn.innerHTML = origBtnHtml;
      }

      const name = document.getElementById("custName")?.value.trim() || "";
      const phone = document.getElementById("custPhone")?.value.trim() || "";
      const branch = document.getElementById("custBranch")?.value || "Nearest Branch";
      const notes = document.getElementById("custNotes")?.value.trim() || "";
      const fulfillmentMode = document.querySelector("input[name='fulfillmentMode']:checked")?.value || "delivery";
      const deliveryAddress = document.getElementById("custAddress")?.value.trim() || "";

      // Generate unique Reference Code
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const refId = `DW-RX-${randomCode}`;
      const timestamp = new Date().toLocaleString();

      // Save order to D. Watson Portal Studio database (100% clean, no ads, permanent)
      if (typeof savePrescriptionOrder === "function") {
        try {
          await savePrescriptionOrder({
            id: refId,
            name: name,
            phone: phone,
            fulfillmentMode: fulfillmentMode,
            address: deliveryAddress,
            branch: branch,
            notes: notes,
            photoUrl: uploadedCleanPhotoUrl || "",
            imageBase64: selectedPrescriptionBase64 || "",
            fileName: selectedPrescriptionFileName || "prescription.jpg",
            date: timestamp
          });
        } catch (e) {
          console.warn("Prescription save error:", e);
        }
      }

      let msg = `*--- D. WATSON PRESCRIPTION & MEDICINE ORDER ---*\n`;
      msg += `👤 *Customer Name:* ${name}\n`;
      msg += `📞 *Contact Phone:* ${phone}\n`;
      if (fulfillmentMode === "delivery") {
        msg += `🚚 *Fulfillment:* 🏠 Express Home Delivery\n`;
        if (deliveryAddress) msg += `🏠 *Delivery Address:* ${deliveryAddress}\n`;
      } else {
        msg += `🚚 *Fulfillment:* 🏬 Branch Self-Pickup\n`;
      }
      msg += `📍 *Selected Branch:* ${branch}\n`;
      msg += `🆔 *Prescription Ref ID:* ${refId}\n`;
      if (notes) msg += `📝 *Prescription / Medicine Details:* ${notes}\n`;
      
      if (uploadedCleanPhotoUrl) {
        msg += `📷 *Prescription Photo Link:* ${uploadedCleanPhotoUrl}\n`;
      } else {
        msg += `📎 *Prescription Photo:* Attached in chat & registered in D. Watson Portal Desk (${refId}).\n`;
      }
      msg += `✅ *Please verify stock and send price & delivery confirmation.*`;

      // Get selected branch's custom WhatsApp number
      const selectedBranchObj = branches.find(b => b.name === branch);
      const activeWa = selectedBranchObj && selectedBranchObj.whatsapp ? selectedBranchObj.whatsapp : whatsappNumber;

      const waUrl = `https://wa.me/${activeWa}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");
    });
  }
}

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("contactName")?.value?.trim() || "";
      const email = document.getElementById("contactEmail")?.value?.trim() || "";
      const dept = document.getElementById("contactDept")?.value || "General Inquiry";
      const message = document.getElementById("contactMessage")?.value?.trim() || "";
      const submitBtn = document.getElementById("contactSubmitBtn") || contactForm.querySelector('button[type="submit"]');
      const statusMsg = document.getElementById("inquiryStatusMsg");

      if (!name || !email || !message) {
        if (statusMsg) {
          statusMsg.style.display = "block";
          statusMsg.style.background = "#FEE2E2";
          statusMsg.style.color = "#991B1B";
          statusMsg.style.border = "1px solid #F87171";
          statusMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please fill out all required fields.';
        }
        return;
      }

      localStorage.setItem("dw_customer_name", name);
      localStorage.setItem("dw_customer_email", email);

      // Set Loading state
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '<i class="fa-solid fa-paper-plane"></i> Submit Inquiry';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Inquiry via Email...';
      }

      if (statusMsg) {
        statusMsg.style.display = "block";
        statusMsg.style.background = "#EFF6FF";
        statusMsg.style.color = "#1E40AF";
        statusMsg.style.border = "1px solid #93C5FD";
        statusMsg.innerHTML = '<i class="fa-solid fa-paper-plane fa-fade"></i> Dispatching notification to D. Watson desk...';
      }

      try {
        // Save locally to Admin Dashboard
        const inquiryId = "INQ-" + Math.floor(100000 + Math.random() * 900000);
        if (typeof saveCustomerInquiry === "function") {
          await saveCustomerInquiry({
            id: inquiryId,
            type: "product",
            name: name,
            email: email,
            productName: `Direct Inquiry: ${dept}`,
            price: "Inquiry Desk",
            brand: "D. Watson Portal",
            category: dept,
            notes: `[Email: ${email} | Dept: ${dept}] ${message}`,
            date: new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
          });
        }

        let emailSuccess = false;

        // Try using EmailJS if configured
        if (window.DW_CONFIG && window.DW_CONFIG.EMAILJS_PUBLIC_KEY && window.DW_CONFIG.EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY" && window.DW_CONFIG.EMAILJS_PUBLIC_KEY.trim() !== "") {
          // Initialize EmailJS
          emailjs.init(window.DW_CONFIG.EMAILJS_PUBLIC_KEY);

          const templateParams = {
            name: name,
            email: email,
            department: dept,
            message: message,
            now: new Date().toLocaleString("en-US", {
              timeZone: "Asia/Karachi",
              dateStyle: "full",
              timeStyle: "medium"
            })
          };

          // Send both templates concurrently
          await Promise.all([
            emailjs.send(window.DW_CONFIG.EMAILJS_SERVICE_ID, window.DW_CONFIG.EMAILJS_TEMPLATE_ADMIN, templateParams),
            emailjs.send(window.DW_CONFIG.EMAILJS_SERVICE_ID, window.DW_CONFIG.EMAILJS_TEMPLATE_CUSTOMER, templateParams)
          ]);
          
          emailSuccess = true;
        } else {
          // Fallback to legacy server API call (useful for local development or Vercel serverless functions)
          const backendBase = (window.DW_CONFIG && typeof window.DW_CONFIG.getBackendUrl === "function")
            ? window.DW_CONFIG.getBackendUrl()
            : "";
          const endpoint = `${backendBase}/api/send-inquiry`;

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, department: dept, message })
          });

          const result = await response.json().catch(() => ({}));

          if (response.ok && result.success) {
            emailSuccess = true;
          } else {
            throw new Error(result.error || "Email server error");
          }
        }

        if (emailSuccess) {
          if (statusMsg) {
            statusMsg.style.display = "block";
            statusMsg.style.background = "#F0FDF4";
            statusMsg.style.color = "#166534";
            statusMsg.style.border = "1px solid #86EFAC";
            statusMsg.innerHTML = `
              <div style="font-weight: 700; margin-bottom: 3px;">
                <i class="fa-solid fa-circle-check" style="color:#16A34A;"></i> Inquiry Dispatched Successfully!
              </div>
              <div style="font-size: 0.82rem; color: #15803D;">
                A confirmation has been sent to <strong>${email}</strong>. Our <strong>${dept}</strong> team will reply to your email shortly.
              </div>
            `;
          }
          contactForm.reset();
        } else {
          throw new Error(result.error || "Email server error");
        }
      } catch (err) {
        console.warn("Direct Inquiry Email Error:", err);
        if (statusMsg) {
          statusMsg.style.display = "block";
          statusMsg.style.background = "#FEF3C7";
          statusMsg.style.color = "#92400E";
          statusMsg.style.border = "1px solid #FCD34D";
          statusMsg.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 4px;">
              <i class="fa-solid fa-circle-check" style="color:#16A34A;"></i> Inquiry Logged in Portal
            </div>
            <div style="font-size: 0.82rem; color: #B45309; margin-bottom: 8px;">
              Your inquiry has been recorded in D. Watson Portal Desk. For instant urgent response, you can also forward to WhatsApp:
            </div>
            <a href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`*--- D. WATSON INQUIRY ---*\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n🏢 *Dept:* ${dept}\n💬 *Message:* ${message}`)}" target="_blank" class="btn btn-whatsapp btn-sm" style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; font-size:0.8rem; text-decoration:none; color:white; background:#16A34A; border-radius:6px;">
              <i class="fa-brands fa-whatsapp"></i> Open WhatsApp Chat
            </a>
          `;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }

/**
 * Header Scroll & Mobile Navigation
 */
/**
 * Header Scroll & Mobile Navigation
 */
function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  const mobTabs = {
    home: document.getElementById("mobTabHome"),
    rx: document.getElementById("mobTabRx"),
    branches: document.getElementById("mobTabBranches")
  };

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;

    if (scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }

    // Dynamic Mobile Bottom Bar Active Pill Indicator
    const rxSec = document.getElementById("prescription-box");
    const branchSec = document.getElementById("branches");

    const rxTop = rxSec ? rxSec.offsetTop - 150 : 99999;
    const branchTop = branchSec ? branchSec.offsetTop - 150 : 99999;

    if (scrollY >= branchTop && scrollY < branchTop + (branchSec?.offsetHeight || 600)) {
      mobTabs.home?.classList.remove("active");
      mobTabs.rx?.classList.remove("active");
      mobTabs.branches?.classList.add("active");
    } else if (scrollY >= rxTop && scrollY < rxTop + (rxSec?.offsetHeight || 600)) {
      mobTabs.home?.classList.remove("active");
      mobTabs.branches?.classList.remove("active");
      mobTabs.rx?.classList.add("active");
    } else {
      mobTabs.branches?.classList.remove("active");
      mobTabs.rx?.classList.remove("active");
      mobTabs.home?.classList.add("active");
    }
  }, { passive: true });
}

function openMobileMenu() {
  const drawer = document.getElementById("mobileNavDrawer");
  if (drawer) {
    drawer.classList.add("active");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
}

function closeMobileMenu() {
  const drawer = document.getElementById("mobileNavDrawer");
  if (drawer) {
    drawer.classList.remove("active");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}

function toggleMobileMenu() {
  const drawer = document.getElementById("mobileNavDrawer");
  if (!drawer) return;
  if (drawer.classList.contains("active")) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function initMobileMenu() {
  const toggle = document.querySelector(".mobile-toggle");
  const menu = document.querySelector(".nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.innerHTML = isOpen 
        ? '<i class="fa-solid fa-xmark"></i>' 
        : '<i class="fa-solid fa-bars"></i>';
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        menu.classList.remove("open");
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  // Handle Escape key to close mobile drawer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu();
    }
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initOrderBranchSelector() {
  const confirmBtn = document.getElementById("confirmOrderBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      if (!activeOrderProduct) return;
      
      const selectEl = document.getElementById("orderBranchSelect");
      const selectedBranchName = selectEl ? selectEl.value : "";
      
      const data = getSiteData();
      const branches = data.branches || [];
      const selectedBranchObj = branches.find(b => b.name === selectedBranchName);
      const activeWa = selectedBranchObj && selectedBranchObj.whatsapp ? selectedBranchObj.whatsapp : data.company.whatsapp;
      
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const refId = `DW-ORD-${randomCode}`;
      const timestamp = new Date().toLocaleString();
      const fullImgUrl = getFullImageUrl(activeOrderProduct.image);
      
      if (typeof saveCustomerInquiry === "function") {
        try {
          await saveCustomerInquiry({
            id: refId,
            type: "product",
            productName: activeOrderProduct.name,
            brand: activeOrderProduct.brand || "D. Watson Certified",
            price: activeOrderProduct.price || "Inquire",
            category: activeOrderProduct.categoryName || activeOrderProduct.category || "General Essential",
            photoUrl: fullImgUrl,
            image: fullImgUrl,
            customerName: "Online WhatsApp Customer",
            notes: `Product inquiry for ${activeOrderProduct.name} (${activeOrderProduct.price || 'Inquire'}) via branch: ${selectedBranchName}`,
            date: timestamp,
            status: "New Product Order"
          });
        } catch (e) {
          console.warn("Inquiry sync error:", e);
        }
      }
      
      let msg = `*--- D. WATSON PRODUCT INQUIRY & ORDER ---*\n`;
      msg += `🛍️ *Product:* ${activeOrderProduct.name}\n`;
      msg += `🏷️ *Brand:* ${activeOrderProduct.brand || 'D. Watson'}\n`;
      msg += `💰 *Price:* ${activeOrderProduct.price || 'Inquire'}\n`;
      msg += `📂 *Category:* ${activeOrderProduct.categoryName || activeOrderProduct.category}\n`;
      msg += `📍 *Selected Branch:* ${selectedBranchName}\n`;
      if (fullImgUrl) {
        msg += `📸 *Product Photo Link:* ${fullImgUrl}\n`;
      }
      msg += `\n📝 *Inquiry Note:* Hi D.Watson Chemist, please confirm stock availability and express delivery.`;
      
      const waUrl = `https://wa.me/${activeWa}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");
      
      closeBranchSelectorModal();
    });
  }
}

/**
 * ==========================================================================
 * Global Instant Product & Medicine Search Modal Controller
 * ==========================================================================
 */
let isGlobalSearchInit = false;
let globalSearchDebounce = null;

function initGlobalSearch() {
  if (isGlobalSearchInit) return;
  isGlobalSearchInit = true;

  const input = document.getElementById("globalSearchInput");
  const clearBtn = document.getElementById("globalSearchClear");

  if (input) {
    input.addEventListener("input", (e) => {
      const term = e.target.value.trim();
      if (clearBtn) clearBtn.style.display = term ? "flex" : "none";

      clearTimeout(globalSearchDebounce);
      globalSearchDebounce = setTimeout(() => {
        renderGlobalSearchResults(term);
      }, 180);
    });
  }

  // Keyboard shortcut listener: Esc to close, '/' to open
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeGlobalSearch();
    } else if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openGlobalSearch();
    }
  });
}

window.openGlobalSearch = function() {
  initGlobalSearch();
  const modal = document.getElementById("globalSearchModal");
  const input = document.getElementById("globalSearchInput");
  if (!modal) return;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (input) {
    setTimeout(() => input.focus(), 80);
    renderGlobalSearchResults(input.value.trim());
  }
};

window.closeGlobalSearch = function() {
  const modal = document.getElementById("globalSearchModal");
  if (!modal) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

/**
 * Flagship Branch Call Modal Handler (Mobile 1-Tap Branch Dialing)
 */
window.openFlagshipCallModal = function() {
  const modal = document.getElementById("flagshipCallModal");
  if (!modal) return;

  const callList = document.getElementById("flagshipCallList");
  if (callList) {
    const siteData = typeof getSiteData === "function" ? getSiteData() : null;
    const branches = (siteData && siteData.branches) ? siteData.branches : (allBranchesData || []);
    const flagshipList = branches.filter(b => b.isFlagship);
    const displayList = flagshipList.length ? flagshipList : branches.slice(0, 7);

    callList.innerHTML = displayList.map(b => {
      const rawPhone = (b.phone || "051-8438111").split("/")[0].replace(/[^0-9]/g, "");
      const cleanPhone = (b.phone || "051-8438111").split("/")[0].trim();
      return `
        <div class="flagship-call-card">
          <div class="flagship-call-details">
            <span class="flagship-call-city-badge"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(b.city || "Islamabad")}</span>
            <h4 class="flagship-call-title">${escapeHtml(b.name)}</h4>
            <p class="flagship-call-meta"><i class="fa-regular fa-clock"></i> ${escapeHtml(b.timings || "Open Daily")}</p>
          </div>
          <a href="tel:${rawPhone}" class="flagship-dial-btn" aria-label="Call ${escapeHtml(b.name)}">
            <i class="fa-solid fa-phone"></i>
            <span>${escapeHtml(cleanPhone)}</span>
          </a>
        </div>
      `;
    }).join("");
  }

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

window.closeFlagshipCallModal = function() {
  const modal = document.getElementById("flagshipCallModal");
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

/**
 * Interactive Topbar Helpline Dropdown with Click-to-Call
 */
function initHelplineDropdown() {
  const dropdownWrap = document.getElementById("topHelplineDropdownWrap");
  const dropdownList = document.getElementById("helplineDropdownList");
  if (!dropdownWrap || !dropdownList) return;

  const siteData = typeof getSiteData === "function" ? getSiteData() : null;
  const branches = (siteData && siteData.branches) ? siteData.branches : (allBranchesData || []);
  const flagshipList = branches.filter(b => b.isFlagship);
  const displayList = flagshipList.length ? flagshipList : branches.slice(0, 7);

  dropdownList.innerHTML = displayList.map(b => {
    const rawPhone = (b.phone || "051-8438111").split("/")[0].replace(/[^0-9]/g, "");
    const cleanPhone = (b.phone || "051-8438111").split("/")[0].trim();
    return `
      <a href="tel:${rawPhone}" class="helpline-dropdown-item">
        <div class="helpline-branch-info">
          <strong class="helpline-branch-name">${escapeHtml(b.name)}</strong>
          <small class="helpline-branch-time"><i class="fa-regular fa-clock"></i> ${escapeHtml(b.timings || "Daily")}</small>
        </div>
        <span class="helpline-dial-pill"><i class="fa-solid fa-phone"></i> ${escapeHtml(cleanPhone)}</span>
      </a>
    `;
  }).join("");

  const toggleBtn = document.getElementById("topPhoneBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownWrap.classList.toggle("open");
    });
  }

  document.addEventListener("click", (e) => {
    if (!dropdownWrap.contains(e.target)) {
      dropdownWrap.classList.remove("open");
    }
  });
}

window.clearGlobalSearch = function() {
  const input = document.getElementById("globalSearchInput");
  const clearBtn = document.getElementById("globalSearchClear");
  if (input) {
    input.value = "";
    input.focus();
  }
  if (clearBtn) clearBtn.style.display = "none";
  renderGlobalSearchResults("");
};

window.searchByChip = function(query) {
  openGlobalSearch();
  const input = document.getElementById("globalSearchInput");
  const clearBtn = document.getElementById("globalSearchClear");
  if (input) {
    input.value = query;
    if (clearBtn) clearBtn.style.display = "flex";
    renderGlobalSearchResults(query);
  }
};

function renderGlobalSearchResults(term) {
  const container = document.getElementById("globalSearchResults");
  if (!container) return;

  const data = getSiteData();
  const products = data.products || [];
  const query = (term || "").toLowerCase();

  if (!query) {
    const recommended = products.slice(0, 8);
    container.innerHTML = `
      <div style="font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#94A3B8; margin-bottom:10px; padding:0 4px;">
        <i class="fa-solid fa-sparkles" style="color:var(--dw-red);"></i> Recommended Products &amp; Medicines
      </div>
      ${recommended.map(p => renderSearchResultItem(p, data.company.whatsapp)).join("")}
    `;
    return;
  }

  const matches = products.filter(p => {
    return (p.name && p.name.toLowerCase().includes(query)) ||
           (p.brand && p.brand.toLowerCase().includes(query)) ||
           (p.categoryName && p.categoryName.toLowerCase().includes(query)) ||
           (p.category && p.category.toLowerCase().includes(query)) ||
           (p.description && p.description.toLowerCase().includes(query)) ||
           (p.tag && p.tag.toLowerCase().includes(query));
  });

  if (matches.length === 0) {
    container.innerHTML = `
      <div class="search-empty-state" style="text-align:center; padding:40px 16px; color:#64748B;">
        <i class="fa-solid fa-magnifying-glass-arrow-right" style="font-size: 2.4rem; color: #CBD5E1; margin-bottom: 12px; display:block;"></i>
        <h4 style="color:#0F172A; margin:0 0 6px; font-size:1.1rem;">No Direct Matches for "${escapeHtml(term)}"</h4>
        <p style="font-size:0.85rem; max-width:400px; margin:0 auto 16px; line-height:1.5;">Can't find your specific medicine or cosmetic product? Send us a quick inquiry directly on WhatsApp — we stock 20,000+ items across our network.</p>
        <a href="https://wa.me/${data.company.whatsapp}?text=${encodeURIComponent(`Hi D.Watson Chemist, I am searching for "${term}". Is this product available in stock?`)}" target="_blank" class="btn btn-whatsapp" style="display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:10px; font-weight:700; text-decoration:none; color:white; background:#16A34A;">
          <i class="fa-brands fa-whatsapp"></i> Ask Pharmacist on WhatsApp
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#64748B; margin-bottom:10px; padding:0 4px;">
      Found ${matches.length} ${matches.length === 1 ? 'Product' : 'Products'}
    </div>
    ${matches.map(p => renderSearchResultItem(p, data.company.whatsapp)).join("")}
  `;
}

function renderSearchResultItem(p, fallbackWa) {
  const pName = escapeHtml(p.name);
  const pBrand = escapeHtml(p.brand || "D. Watson Certified");
  const pPrice = escapeHtml(p.price || "Inquire");
  const pCat = escapeHtml(p.categoryName || p.category || "Healthcare");
  const pImg = encodeURI(p.image || "assets/images/pharmacy.jpg");
  const waMsg = encodeURIComponent(`Hi D. Watson Chemist, I would like to order: ${p.name} (${p.price || 'Inquire'}). Please confirm stock and delivery.`);
  const waUrl = `https://wa.me/${fallbackWa}?text=${waMsg}`;

  return `
    <div class="search-result-item" onclick="closeGlobalSearch(); openProductZoomModal('${p.id}')">
      <img src="${pImg}" alt="${pName}" class="search-result-img" loading="lazy" onerror="this.onerror=null; this.src='assets/images/pharmacy.jpg';">
      <div class="search-result-info">
        <div class="search-result-title">${pName}</div>
        <div class="search-result-meta">${pBrand} &bull; ${pCat}</div>
        <div class="search-result-price">${pPrice}</div>
      </div>
      <a href="${waUrl}" target="_blank" class="btn-search-wa" onclick="event.stopPropagation();" title="Order on WhatsApp">
        <i class="fa-brands fa-whatsapp"></i> <span>WhatsApp</span>
      </a>
    </div>
  `;
}

/**
 * ==========================================================================
 * Prescription Fulfillment Selector (Home Delivery vs Branch Self-Pickup)
 * ==========================================================================
 */
window.setRxFulfillmentMode = function(mode) {
  const deliveryLabel = document.getElementById("modeDeliveryLabel");
  const pickupLabel = document.getElementById("modePickupLabel");
  const addressRow = document.getElementById("deliveryAddressRow");
  const addressInput = document.getElementById("custAddress");

  if (mode === "delivery") {
    if (deliveryLabel) deliveryLabel.classList.add("active");
    if (pickupLabel) pickupLabel.classList.remove("active");
    if (addressRow) addressRow.style.display = "block";
    if (addressInput) addressInput.required = true;
  } else {
    if (pickupLabel) pickupLabel.classList.add("active");
    if (deliveryLabel) deliveryLabel.classList.remove("active");
    if (addressRow) addressRow.style.display = "none";
    if (addressInput) addressInput.required = false;
  }
};

/**
 * ==========================================================================
 * Progressive Web App (PWA) Service Worker & Mobile Install Controller
 * ==========================================================================
 */
let deferredPwaPrompt = null;

function initPWAInstall() {
  if ("serviceWorker" in navigator) {
    // If testing on localhost, unregister any stale service workers immediately so browser loads fresh assets
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
      if (window.caches) {
        caches.keys().then((keys) => {
          for (let key of keys) caches.delete(key);
        });
      }
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then((reg) => {
          console.log("🟢 D. Watson PWA Service Worker Registered", reg.scope);
          if (reg.update) reg.update();
        })
        .catch((err) => {
          console.warn("PWA Service Worker Registration notice:", err);
        });
    });
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;

    const dismissed = localStorage.getItem("dw_pwa_dismissed");
    const banner = document.getElementById("pwaInstallBanner");
    if (banner && !dismissed) {
      banner.style.display = "flex";
    }
  });

  const installBtn = document.getElementById("btnPwaInstall");
  const dismissBtn = document.getElementById("btnPwaDismiss");
  const banner = document.getElementById("pwaInstallBanner");

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPwaPrompt) return;
      deferredPwaPrompt.prompt();
      const { outcome } = await deferredPwaPrompt.userChoice;
      console.log(`PWA Install Outcome: ${outcome}`);
      deferredPwaPrompt = null;
      if (banner) banner.style.display = "none";
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => {
      if (banner) banner.style.display = "none";
      localStorage.setItem("dw_pwa_dismissed", Date.now().toString());
    });
  }

  window.addEventListener("appinstalled", () => {
    console.log("🟢 D. Watson PWA App Installed Successfully");
    if (banner) banner.style.display = "none";
    deferredPwaPrompt = null;
  });
}

/**
 * PWA Native App Launch Splash Screen Controller (Completely Removed as Requested)
 * Zero splash delay: App opens instantly with direct website content.
 */
function initAppSplashScreen() {
  const existingSplash = document.getElementById('pwaAppSplash');
  if (existingSplash) existingSplash.remove();
}

/**
 * ==========================================================================
 * Subpage Helpers (Prescription, Branches, Contact)
 * ==========================================================================
 */
let rxSelectedFile = null;
let rxFulfillmentMode = "delivery";

function initPrescriptionBranchSelector() {
  const branchSelect = document.getElementById("rxSelectedBranch");
  if (!branchSelect) return;

  // Guarantee dropzone preview is completely reset and hidden on page load / refresh
  if (typeof removeRxFile === "function" && !rxSelectedFile) {
    removeRxFile();
  }

  const data = typeof getSiteData === "function" ? getSiteData() : null;
  if (!data || !data.branches || !data.branches.length) return;

  // Show ONLY the official flagship (flashtag) branches for both home delivery & branch pickup
  const flagships = data.branches.filter(b => b.isFlagship);
  const displayList = flagships.length ? flagships : data.branches.slice(0, 7);

  const prevSelected = branchSelect.value;
  const isPickup = rxFulfillmentMode === "pickup";
  const groupLabel = isPickup ? "⭐ Official Flagship Branches (Free Branch Pickup Points)" : "⭐ Official Flagship Outlets (Express Home Delivery Hubs)";
  const tagText = isPickup ? "[🏬 Free Branch Pickup]" : "[⚡ Express Delivery Hub]";

  let html = `<optgroup label="${groupLabel}">`;
  html += displayList.map((b, i) => {
    const isSelected = prevSelected ? (b.id === prevSelected || b.name === prevSelected) : (i === 0);
    return `
      <option value="${escapeHtml(b.id || b.name)}" data-express="${b.expressDelivery !== false ? '1' : '0'}" data-fee="${b.deliveryFee || 200}" data-min="${b.minOrderAmount || 1000}" ${isSelected ? 'selected' : ''}>
        ${escapeHtml(b.name)} ${tagText}
      </option>
    `;
  }).join("");
  html += `</optgroup>`;

  branchSelect.innerHTML = html;
  updateBranchDeliveryStatus();
}

function getSelectedPrescriptionBranch() {
  const branchSelect = document.getElementById("rxSelectedBranch");
  if (!branchSelect) return null;
  const val = branchSelect.value;
  const data = typeof getSiteData === "function" ? getSiteData() : null;
  if (!data || !data.branches) return null;
  return data.branches.find(b => (b.id === val || b.name === val)) || data.branches[0];
}

function handleBranchDeliveryChange() {
  updateBranchDeliveryStatus();
  handleOrderAmountInput();
}

function updateBranchDeliveryStatus() {
  const card = document.getElementById("rxDeliveryStatusCard");
  if (!card) return;

  const branch = getSelectedPrescriptionBranch();
  const data = typeof getSiteData === "function" ? getSiteData() : null;
  const company = data?.company || {};
  const defaultFee = company.deliveryDefaultFee !== undefined ? company.deliveryDefaultFee : 200;
  const defaultMin = company.deliveryMinOrder !== undefined ? company.deliveryMinOrder : 1000;
  const freeThreshold = company.deliveryFreeThreshold !== undefined ? company.deliveryFreeThreshold : 3000;

  if (!branch) {
    card.innerHTML = "";
    return;
  }

  const isExpress = branch.expressDelivery !== false;
  const fee = branch.deliveryFee !== undefined ? branch.deliveryFee : defaultFee;
  const minOrder = branch.minOrderAmount !== undefined ? branch.minOrderAmount : defaultMin;

  if (rxFulfillmentMode === "pickup") {
    card.innerHTML = `
      <div class="delivery-badge-card available">
        <div class="delivery-badge-header">
          <div class="delivery-badge-title">
            <i class="fa-solid fa-store" style="color:#2563EB; font-size:1.2rem;"></i>
            <span>In-Store Pickup: ${escapeHtml(branch.name)}</span>
          </div>
          <span class="delivery-badge-pill" style="background:#2563EB; color:#fff;">Free Pickup</span>
        </div>
        <div style="font-size:0.85rem; color:#475569; line-height:1.5;">
          📍 <strong>Address:</strong> ${escapeHtml(branch.address)}<br>
          📞 <strong>Contact:</strong> ${escapeHtml(branch.phone)} • ⏰ <strong>Hours:</strong> ${escapeHtml(branch.timings)}
        </div>
      </div>
    `;
    return;
  }

  // Home Delivery Mode
  if (isExpress) {
    card.innerHTML = `
      <div class="delivery-badge-card available">
        <div class="delivery-badge-header">
          <div class="delivery-badge-title">
            <i class="fa-solid fa-circle-check" style="color:#16A34A; font-size:1.25rem;"></i>
            <span>Express Home Delivery Available from ${escapeHtml(branch.name)}</span>
          </div>
          <span class="delivery-badge-pill"><i class="fa-solid fa-bolt"></i> 60-Min Dispatch</span>
        </div>
        <div class="delivery-policy-grid">
          <div class="policy-grid-item">
            <span class="policy-label">Standard Delivery Fee</span>
            <span class="policy-value">PKR ${fee}</span>
          </div>
          <div class="policy-grid-item">
            <span class="policy-label">Minimum Purchase</span>
            <span class="policy-value">PKR ${minOrder}</span>
          </div>
          <div class="policy-grid-item">
            <span class="policy-label">Free Delivery Over</span>
            <span class="policy-value">PKR ${freeThreshold}</span>
          </div>
        </div>
      </div>
    `;
  } else {
    card.innerHTML = `
      <div class="delivery-badge-card unavailable">
        <div class="delivery-badge-header">
          <div class="delivery-badge-title">
            <i class="fa-solid fa-triangle-exclamation" style="color:#D97706; font-size:1.25rem;"></i>
            <span>Express Home Delivery Not Available from this Branch</span>
          </div>
          <span class="delivery-badge-pill">In-Store Pickup Only</span>
        </div>
        <p style="font-size:0.85rem; margin:0; line-height:1.4;">
          This regional location currently only supports <strong>In-Store Pickup</strong>. For rapid doorstep delivery, please select one of our <strong>⭐ Flagship Outlets</strong> (e.g. F-6 Super Market, Blue Area Mega Store, Saddar Rawalpindi, PWD) in the branch dropdown above.
        </p>
      </div>
    `;
  }
}

function handleOrderAmountInput() {
  const input = document.getElementById("rxOrderAmount");
  const feedback = document.getElementById("rxOrderAmountFeedback");
  if (!input || !feedback) return;

  const rawVal = input.value.trim();
  if (!rawVal) {
    feedback.style.display = "none";
    feedback.className = "rx-amount-feedback";
    feedback.textContent = "";
    return;
  }

  const amount = parseFloat(rawVal) || 0;
  const branch = getSelectedPrescriptionBranch();
  const data = typeof getSiteData === "function" ? getSiteData() : null;
  const company = data?.company || {};
  const defaultFee = company.deliveryDefaultFee !== undefined ? company.deliveryDefaultFee : 200;
  const minOrder = (branch && branch.minOrderAmount !== undefined) ? branch.minOrderAmount : (company.deliveryMinOrder || 1000);
  const freeThreshold = company.deliveryFreeThreshold !== undefined ? company.deliveryFreeThreshold : 3000;
  const fee = (branch && branch.deliveryFee !== undefined) ? branch.deliveryFee : defaultFee;

  if (rxFulfillmentMode === "pickup") {
    feedback.style.display = "block";
    feedback.className = "rx-amount-feedback valid";
    feedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> Estimated Bill: PKR ${amount.toLocaleString()} (Free Branch Pickup).`;
    return;
  }

  const isExpress = branch ? (branch.expressDelivery !== false) : true;
  if (!isExpress) {
    feedback.style.display = "block";
    feedback.className = "rx-amount-feedback warning";
    feedback.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Home Delivery unavailable for this branch. Please choose a Flagship Hub or In-Store Pickup.`;
    return;
  }

  if (amount >= freeThreshold) {
    feedback.style.display = "block";
    feedback.className = "rx-amount-feedback valid";
    feedback.innerHTML = `🎉 <strong>Free Express Delivery Applied!</strong> Delivery Fee: PKR 0 (Total: PKR ${amount.toLocaleString()}).`;
  } else if (amount >= minOrder) {
    feedback.style.display = "block";
    feedback.className = "rx-amount-feedback valid";
    feedback.innerHTML = `✓ Meets minimum order requirement (PKR ${minOrder}). Delivery Fee: PKR ${fee} (Total: PKR ${(amount + fee).toLocaleString()}).`;
  } else {
    feedback.style.display = "block";
    feedback.className = "rx-amount-feedback warning";
    feedback.innerHTML = `⚠️ Order is below minimum PKR ${minOrder} required for home delivery dispatch. Add essentials or choose In-Store Pickup.`;
  }
}

function setFulfillmentMode(mode) {
  rxFulfillmentMode = mode;
  const btnHome = document.getElementById("btnHomeDelivery");
  const btnPickup = document.getElementById("btnStorePickup");
  const addrGroup = document.getElementById("rxAddressGroup");

  if (mode === "delivery") {
    if (btnHome) btnHome.classList.add("active");
    if (btnPickup) btnPickup.classList.remove("active");
    if (addrGroup) addrGroup.style.display = "block";
  } else {
    if (btnPickup) btnPickup.classList.add("active");
    if (btnHome) btnHome.classList.remove("active");
    if (addrGroup) addrGroup.style.display = "none";
  }

  // Refresh branch dropdown labels for chosen fulfillment mode
  initPrescriptionBranchSelector();
  updateBranchDeliveryStatus();
  handleOrderAmountInput();
}

/**
 * Format Short Filename for responsive mobile displays
 */
function formatShortFileName(name, maxLen = 18) {
  if (!name) return "";
  if (name.length <= maxLen) return name;
  const dotIdx = name.lastIndexOf(".");
  const ext = dotIdx !== -1 ? name.slice(dotIdx) : "";
  const base = dotIdx !== -1 ? name.slice(0, dotIdx) : name;
  const keep = Math.max(4, maxLen - ext.length - 3);
  return base.slice(0, keep) + "..." + ext;
}

/**
 * Canvas Image Compressor for Prescription Uploads
 */
function compressRxImageFile(file, maxDim = 1200, quality = 0.82) {
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
 * Upload Prescription Image to Direct Cloud CDN (ImgBB)
 */
let rxUploadedImageUrl = "";
let rxUploadingPromise = null;

async function uploadPrescriptionImage(file) {
  if (!file) return "";
  if (rxUploadedImageUrl && rxUploadedImageUrl.startsWith("http")) {
    return rxUploadedImageUrl;
  }
  if (!file.type || !file.type.startsWith("image/")) {
    return "Document: " + (file.name || "prescription.pdf");
  }

  const directImgbbKey = (window.DW_CONFIG && window.DW_CONFIG.IMGBB_API_KEY) || localStorage.getItem("dw_imgbb_api_key") || "5d369a9387210e1432e7018b92d3d0e8";

  // Strategy 1: Direct File upload to ImgBB
  try {
    const formData = new FormData();
    formData.append("key", directImgbbKey);
    formData.append("image", file, file.name || "prescription.jpg");

    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json && json.data && json.data.url) {
      rxUploadedImageUrl = json.data.url;
      return json.data.url;
    }
  } catch (imgbbErr) {
    console.warn("Direct file upload to ImgBB notice:", imgbbErr.message);
  }

  // Strategy 2: Compress canvas Blob upload to ImgBB
  try {
    const compressed = await compressRxImageFile(file, 1400, 0.85);
    if (compressed && compressed.blob) {
      const formData = new FormData();
      formData.append("key", directImgbbKey);
      formData.append("image", compressed.blob, file.name || "prescription.jpg");

      const res = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json && json.data && json.data.url) {
        rxUploadedImageUrl = json.data.url;
        return json.data.url;
      }
    }
  } catch (compressErr) {
    console.warn("Compressed blob upload to ImgBB notice:", compressErr);
  }

  // Strategy 3: Serverless /api/upload
  try {
    const uploadUrl = (window.DW_CONFIG && typeof window.DW_CONFIG.getUploadUrl === "function") 
      ? window.DW_CONFIG.getUploadUrl() 
      : "/api/upload";

    const compressed = await compressRxImageFile(file, 1200, 0.80);
    if (compressed && compressed.dataUrl) {
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressed.dataUrl, filename: file.name })
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json && json.success && json.url) {
        rxUploadedImageUrl = json.url;
        return json.url;
      }
    }
  } catch (cdnErr) {
    console.warn("Cloud CDN prescription fallback notice:", cdnErr.message);
  }

  return "";
}

function handleRxFileSelect(input) {
  if (!input || !input.files || !input.files[0]) return;
  const file = input.files[0];
  rxSelectedFile = file;
  rxUploadedImageUrl = "";

  const previewWrap = document.getElementById("rxDropPreview");
  const defaultWrap = document.getElementById("rxDropDefault");
  const previewImg = document.getElementById("rxPreviewImg");
  const fileNameEl = document.getElementById("rxFileName");

  if (fileNameEl) {
    fileNameEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${formatShortFileName(file.name, 18)} (Uploading...)`;
    fileNameEl.title = file.name;
  }

  if (file.type && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (previewImg) {
        previewImg.src = e.target.result;
        previewImg.style.display = "block";
      }
      if (previewWrap) {
        previewWrap.classList.add("active");
        previewWrap.style.display = "flex";
      }
      if (defaultWrap) {
        defaultWrap.classList.add("hidden");
        defaultWrap.style.display = "none";
      }
    };
    reader.readAsDataURL(file);
  } else {
    if (previewImg) {
      previewImg.src = "assets/images/logo-official.png";
      previewImg.style.display = "block";
    }
    if (previewWrap) {
      previewWrap.classList.add("active");
      previewWrap.style.display = "flex";
    }
    if (defaultWrap) {
      defaultWrap.classList.add("hidden");
      defaultWrap.style.display = "none";
    }
  }

  // Pre-upload in background immediately so the live link is ready before user clicks submit
  rxUploadingPromise = uploadPrescriptionImage(file).then(url => {
    if (url && url.startsWith("http")) {
      rxUploadedImageUrl = url;
      if (fileNameEl) {
        fileNameEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#10B981;"></i> ${formatShortFileName(file.name, 18)} (Ready)`;
      }
    }
    return url;
  }).catch(() => "");
}

function removeRxFile(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  rxSelectedFile = null;
  rxUploadedImageUrl = "";
  rxUploadingPromise = null;
  const input = document.getElementById("rxFileInput");
  if (input) input.value = "";
  const previewImg = document.getElementById("rxPreviewImg");
  if (previewImg) {
    previewImg.src = "";
    previewImg.style.display = "none";
  }
  const fileNameEl = document.getElementById("rxFileName");
  if (fileNameEl) {
    fileNameEl.innerHTML = "";
    fileNameEl.title = "";
  }
  const previewWrap = document.getElementById("rxDropPreview");
  const defaultWrap = document.getElementById("rxDropDefault");
  if (previewWrap) {
    previewWrap.classList.remove("active");
    previewWrap.style.display = "none";
  }
  if (defaultWrap) {
    defaultWrap.classList.remove("hidden");
    defaultWrap.style.display = "block";
  }
}

function dispatchRxWhatsApp(prescriptionPhotoUrl = "") {
  const name = (document.getElementById("rxPatientName")?.value || "").trim() || "Valued Patient";
  const phone = (document.getElementById("rxPatientPhone")?.value || "").trim();
  const address = (document.getElementById("rxPatientAddress")?.value || "").trim();
  const branch = getSelectedPrescriptionBranch();
  const branchName = branch ? branch.name : "D. Watson F-6 Super Market";
  const isExpress = branch ? (branch.expressDelivery !== false) : true;
  const branchFee = branch?.deliveryFee !== undefined ? branch.deliveryFee : 200;
  const minOrder = branch?.minOrderAmount !== undefined ? branch.minOrderAmount : 1000;
  const orderAmount = parseFloat(document.getElementById("rxOrderAmount")?.value || 0);

  const notes = (document.getElementById("rxNotes")?.value || "").trim();
  const refId = "DW-RX-" + Math.floor(100000 + Math.random() * 900000);

  let msg = `🏥 *D. WATSON PRESCRIPTION DISPATCH*\n`;
  msg += `📋 *Ref:* ${refId}\n`;
  msg += `👤 *Patient:* ${name}\n`;
  if (phone) msg += `📞 *Contact:* ${phone}\n`;
  msg += `📍 *Selected Branch:* ${branchName}\n`;

  if (rxFulfillmentMode === "delivery") {
    msg += `🚚 *Fulfillment:* Express Home Delivery\n`;
    msg += `⚡ *Branch Delivery Status:* ${isExpress ? "AVAILABLE" : "UNAVAILABLE (In-Store Pickup Only)"}\n`;
    if (isExpress) {
      const isFree = orderAmount >= 3000;
      msg += `💵 *Delivery Charges:* PKR ${isFree ? "0 (Free Delivery Applied)" : branchFee}\n`;
      msg += `📌 *Min Order Requirement:* PKR ${minOrder}\n`;
    }
    if (orderAmount > 0) {
      msg += `💰 *Estimated Order Value:* PKR ${orderAmount.toLocaleString()}\n`;
    }
    if (address) {
      msg += `🏠 *Delivery Address:* ${address}\n`;
    }
  } else {
    msg += `🏬 *Fulfillment:* In-Store Branch Pickup (${branchName})\n`;
    if (orderAmount > 0) {
      msg += `💰 *Estimated Order Value:* PKR ${orderAmount.toLocaleString()}\n`;
    }
  }

  if (notes) {
    msg += `📝 *Notes:* ${notes}\n`;
  }

  const activePhotoUrl = (prescriptionPhotoUrl && prescriptionPhotoUrl.startsWith("http")) 
    ? prescriptionPhotoUrl 
    : (rxUploadedImageUrl && rxUploadedImageUrl.startsWith("http") ? rxUploadedImageUrl : "");

  if (activePhotoUrl) {
    msg += `\n📸 *Prescription Photo Link:* ${activePhotoUrl}\n`;
  } else {
    msg += `\n📸 _Attaching prescription photo now for verification._`;
  }

  const waNumber = (branch && branch.whatsapp) ? branch.whatsapp : "923329716666";
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, "_blank");
}

async function handlePrescriptionSubmit(e, mode = "all") {
  if (e) e.preventDefault();

  const nameInput = document.getElementById("rxPatientName");
  const phoneInput = document.getElementById("rxPatientPhone");
  const addressInput = document.getElementById("rxPatientAddress");

  const name = (nameInput?.value || "").trim();
  const phone = (phoneInput?.value || "").trim();
  const address = (addressInput?.value || "").trim();

  if (!name) {
    alert("Please enter the patient's full name.");
    if (nameInput) nameInput.focus();
    return;
  }
  if (!phone) {
    alert("Please enter your mobile / WhatsApp contact number.");
    if (phoneInput) phoneInput.focus();
    return;
  }

  localStorage.setItem("dw_customer_name", name);
  localStorage.setItem("dw_customer_phone", phone);
  if (rxFulfillmentMode === "delivery" && !address) {
    alert("Please enter your complete delivery address for express home delivery.");
    if (addressInput) addressInput.focus();
    return;
  }

  const branch = getSelectedPrescriptionBranch();
  const branchName = branch ? branch.name : "D. Watson F-6 Super Market";
  const isExpress = branch ? (branch.expressDelivery !== false) : true;
  const branchFee = branch?.deliveryFee !== undefined ? branch.deliveryFee : 200;
  const minOrder = branch?.minOrderAmount !== undefined ? branch.minOrderAmount : 1000;
  const orderAmount = parseFloat(document.getElementById("rxOrderAmount")?.value || 0);
  const notes = (document.getElementById("rxNotes")?.value || "").trim();
  const refId = "DW-RX-" + Math.floor(100000 + Math.random() * 900000);

  if (rxFulfillmentMode === "delivery" && !isExpress) {
    const proceed = confirm(`Notice: Express Home Delivery is not available from ${branchName}. Would you like to submit this order for In-Store Pickup at this branch, or choose a Flagship Delivery Hub? Click OK for In-Store Pickup.`);
    if (!proceed) return;
  }

  const submitBtn = document.getElementById("rxSubmitBtn");
  const waBtn = document.querySelector(".btn-whatsapp.btn-lg");
  const origBtnText = submitBtn ? submitBtn.innerHTML : "";
  const origWaBtnText = waBtn ? waBtn.innerHTML : "";

  // 1. Upload prescription image to generate direct live link
  let prescriptionImageUrl = rxUploadedImageUrl || "";
  if (rxSelectedFile && (!prescriptionImageUrl || !prescriptionImageUrl.startsWith("http"))) {
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading Prescription Image...`;
      }
      if (waBtn) {
        waBtn.disabled = true;
        waBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading Photo...`;
      }

      if (rxUploadingPromise) {
        prescriptionImageUrl = await rxUploadingPromise;
      } else {
        prescriptionImageUrl = await uploadPrescriptionImage(rxSelectedFile);
      }
    } catch (err) {
      console.warn("Prescription photo upload notice:", err);
    }
  }

  // 2. Record into Admin Orders & Inquiries Desk with photo preview
  if (typeof saveCustomerInquiry === "function") {
    try {
      await saveCustomerInquiry({
        id: refId,
        type: "prescription",
        name: name,
        phone: phone,
        branch: branchName,
        fulfillment: rxFulfillmentMode,
        address: address,
        deliveryFee: rxFulfillmentMode === "delivery" ? (orderAmount >= 3000 ? 0 : branchFee) : 0,
        minOrderAmount: minOrder,
        estimatedAmount: orderAmount,
        prescription_image: prescriptionImageUrl,
        image: prescriptionImageUrl,
        photoUrl: prescriptionImageUrl,
        imageBase64: prescriptionImageUrl,
        notes: notes,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }),
        status: "New Prescription Order"
      });
    } catch (err) {
      console.warn("Could not save prescription inquiry locally:", err);
    }
  }

  // 3. EmailJS transmission with explicit image parameters & link in notes
  if (window.emailjs && window.DW_CONFIG && window.DW_CONFIG.EMAILJS_PUBLIC_KEY && window.DW_CONFIG.EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    try {
      if (submitBtn) {
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending Confirmation Email...`;
      }
      emailjs.init(window.DW_CONFIG.EMAILJS_PUBLIC_KEY);

      const formattedNotes = [
        notes || "",
        prescriptionImageUrl ? `📷 Prescription Photo Link: ${prescriptionImageUrl}` : ""
      ].filter(Boolean).join("\n\n") || "None";

      const templateParams = {
        ref_id: refId,
        name: name,
        phone: phone,
        branch: branchName,
        fulfillment: rxFulfillmentMode === "delivery" ? "Express Home Delivery" : "In-Store Pickup",
        delivery_status: isExpress ? "Available" : "Pickup Only",
        delivery_fee: `PKR ${branchFee}`,
        order_amount: orderAmount > 0 ? `PKR ${orderAmount}` : "Pending Verification",
        address: address || "In-Store Pickup",
        notes: formattedNotes,
        prescription_image: prescriptionImageUrl || "None",
        image_url: prescriptionImageUrl || "None",
        photo_url: prescriptionImageUrl || "None",
        prescription_url: prescriptionImageUrl || "None",
        attachment: prescriptionImageUrl || "None",
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
      };
      await emailjs.send(window.DW_CONFIG.EMAILJS_SERVICE_ID, window.DW_CONFIG.EMAILJS_TEMPLATE_ADMIN, templateParams).catch(err => console.warn("EmailJS admin send notice:", err));
    } catch (e) {
      console.warn("EmailJS dispatch warning:", e);
    }
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = origBtnText;
  }
  if (waBtn) {
    waBtn.disabled = false;
    waBtn.innerHTML = origWaBtnText;
  }

  // 4. Open WhatsApp with complete details & photo link
  dispatchRxWhatsApp(prescriptionImageUrl);

  // 5. Alert user and refresh page cleanly as requested
  alert(`✅ Prescription Order (${refId}) Submitted Successfully!\n\nOur clinical pharmacist at ${branchName} has received your prescription details and photo. The page will now refresh.`);

  setTimeout(() => {
    window.location.reload();
  }, 1200);
}

/**
 * Continuous Marquee Slider for Trusted Partner Brands
 */
function renderBrandsMarquee() {
  const track = document.getElementById("topBrandsMarqueeTrack") || document.querySelector(".top-brands-marquee-track");
  if (!track) return;
  const siteData = typeof getSiteData === "function" ? getSiteData() : null;
  const brands = siteData?.trustedBrands || [];
  if (!brands.length) return;

  const renderCard = (b) => `
    <div class="top-brand-slide-card">
      <div class="top-brand-icon-wrap" style="color:#A50505;"><i class="${escapeHtml(b.icon || 'fa-solid fa-capsules')}"></i></div>
      <div class="top-brand-info">
        <span class="top-brand-name">${escapeHtml(b.name)}</span>
        <span class="top-brand-tag">${escapeHtml(b.category || 'Pharmaceutical')}</span>
        <span class="top-brand-verified"><i class="fa-solid fa-circle-check"></i> ${b.isVerified ? '100% Authentic' : 'Official Partner'}</span>
      </div>
    </div>
  `;

  // Render Set 1 and Set 2 for seamless infinite marquee loop
  track.innerHTML = brands.map(renderCard).join("") + brands.map(renderCard).join("");
}

function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("contactName")?.value || "Customer";
  const phone = document.getElementById("contactPhone")?.value || "";
  const subject = document.getElementById("contactSubject")?.value || "General Inquiry";
  const message = document.getElementById("contactMessage")?.value || "";

  let waMsg = `💬 *D. WATSON CUSTOMER INQUIRY*\n`;
  waMsg += `👤 *From:* ${name} (${phone})\n`;
  waMsg += `📌 *Topic:* ${subject}\n`;
  waMsg += `📝 *Message:* ${message}\n`;

  const waUrl = `https://wa.me/923329716666?text=${encodeURIComponent(waMsg)}`;
  window.open(waUrl, "_blank");
}

function filterBranchesSearch(query) {
  const q = (query || "").trim().toLowerCase();
  const container = document.getElementById("branchesGrid");
  if (!container || !allBranchesData) return;

  if (!q) {
    renderBranchCards(allBranchesData);
    return;
  }

  const filtered = allBranchesData.filter(b => {
    const nameMatch = (b.name || "").toLowerCase().includes(q);
    const addrMatch = (b.address || "").toLowerCase().includes(q);
    const cityMatch = (b.city || "").toLowerCase().includes(q);
    return nameMatch || addrMatch || cityMatch;
  });

  renderBranchCards(filtered);
}

/* ==========================================================================
   MULTI-BRANCH LIVE CHAT & MESSENGER SYSTEM (TAWK.TO + BRANCH WHATSAPP)
   ========================================================================== */

/**
 * Initialize Tawk.to Live Chat Embed with Multi-Agent Branch Support
 */
function initTawkToLiveChat() {
  if (!window.DW_CONFIG || !window.DW_CONFIG.isTawkToEnabled()) return;
  const propertyId = window.DW_CONFIG.getTawkToPropertyId();
  const widgetId = window.DW_CONFIG.getTawkToWidgetId() || "default";

  // If no property ID is set yet, we allow our unified Branch Messenger to use direct branch WhatsApp fallback
  if (!propertyId || !propertyId.trim()) return;

  // Prevent duplicate script injection
  if (document.getElementById("tawktoScriptEmbed")) return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  // Pre-load known customer profile into Tawk session if available
  const savedName = localStorage.getItem("dw_customer_name");
  const savedPhone = localStorage.getItem("dw_customer_phone");
  const savedEmail = localStorage.getItem("dw_customer_email");
  if (savedName) {
    window.Tawk_API.visitor = {
      name: savedName,
      email: savedEmail || (savedPhone ? `${savedPhone.replace(/[^0-9]/g, "")}@customer.dwatson.co` : "")
    };
  }

  // Hide Tawk's default round bubble so it NEVER collides with our single unified icon!
  const suppressTawkBubble = function() {
    try {
      if (window.Tawk_API && typeof window.Tawk_API.hideWidget === "function") {
        window.Tawk_API.hideWidget();
      }
    } catch (e) {}
  };

  window.Tawk_API.onBeforeLoad = suppressTawkBubble;
  window.Tawk_API.onLoad = suppressTawkBubble;

  window.Tawk_API.onChatMaximized = function() {
    // Hide our background popover card immediately so it never shows behind Tawk!
    if (typeof window.closeBranchMessengerCard === "function") {
      window.closeBranchMessengerCard();
    }
    const card = document.getElementById("branchMessengerCard");
    if (card) {
      card.classList.remove("active");
      card.setAttribute("aria-hidden", "true");
    }
    const trigger = document.getElementById("branchMessengerTrigger");
    if (trigger) trigger.style.display = "none";
  };

  window.Tawk_API.onChatMinimized = function() {
    suppressTawkBubble();
    const card = document.getElementById("branchMessengerCard");
    if (card) {
      card.classList.remove("active");
      card.setAttribute("aria-hidden", "true");
    }
    const trigger = document.getElementById("branchMessengerTrigger");
    if (trigger) trigger.style.display = "flex";
  };

  window.Tawk_API.onChatHidden = function() {
    suppressTawkBubble();
    const card = document.getElementById("branchMessengerCard");
    if (card) {
      card.classList.remove("active");
      card.setAttribute("aria-hidden", "true");
    }
    const trigger = document.getElementById("branchMessengerTrigger");
    if (trigger) trigger.style.display = "flex";
  };

  // Periodically suppress during initial 6 seconds to eliminate any initial bubble flash
  const tawkTimer = setInterval(suppressTawkBubble, 150);
  setTimeout(() => clearInterval(tawkTimer), 6000);

  const s1 = document.createElement("script");
  s1.id = "tawktoScriptEmbed";
  s1.async = true;
  s1.src = `https://embed.tawk.to/${encodeURIComponent(propertyId.trim())}/${encodeURIComponent(widgetId.trim())}`;
  s1.charset = "UTF-8";
  s1.setAttribute("crossorigin", "*");
  document.head.appendChild(s1);
}

/**
 * Synchronize full customer profile, branch, page and context with Tawk.to
 */
function sendCustomerInfoToTawk(branch, customerInfo) {
  if (!window.Tawk_API) return;

  const finalName = (customerInfo && customerInfo.name) || localStorage.getItem("dw_customer_name") || "";
  const finalPhone = (customerInfo && customerInfo.phone) || localStorage.getItem("dw_customer_phone") || "";
  const finalEmail = (customerInfo && customerInfo.email) || localStorage.getItem("dw_customer_email") || "";

  // 1. Identify customer in Tawk
  if (finalName) {
    window.Tawk_API.visitor = {
      name: finalName,
      email: finalEmail || (finalPhone ? `${finalPhone.replace(/[^0-9]/g, "")}@customer.dwatson.co` : "")
    };
  }

  // 2. Build full metadata attributes for agent view
  const bName = (branch && branch.name) ? branch.name : "D. Watson Chemist";
  const bCity = (branch && branch.city) ? branch.city : "Islamabad";
  const bPhone = (branch && branch.phone) ? branch.phone : "";
  const bWa = (branch && branch.whatsapp) ? branch.whatsapp : "923329716666";
  const pageTitle = document.title ? document.title.split(" - ")[0].trim() : "Store Page";

  const attrs = {
    'SelectedBranch': bName,
    'City': bCity,
    'BranchCity': bCity,
    'BranchPhone': bPhone,
    'BranchWhatsApp': bWa,
    'CurrentPage': pageTitle,
    'PageURL': window.location.href,
    'Country': 'Pakistan',
    'Platform': /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile Web' : 'Desktop Web',
    'ContactTime': new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
  };

  if (finalName) {
    attrs['name'] = finalName;
    attrs['CustomerName'] = finalName;
  }
  if (finalPhone) {
    attrs['Phone'] = finalPhone;
    attrs['WhatsApp'] = finalPhone;
    attrs['CustomerPhone'] = finalPhone;
  }
  if (finalEmail) {
    attrs['email'] = finalEmail;
  }

  try {
    if (typeof window.Tawk_API.setAttributes === "function") {
      window.Tawk_API.setAttributes(attrs, function() {});
    }
  } catch (e) {
    console.warn("Tawk setAttributes error:", e);
  }

  // 3. Highlighted tags that appear on the conversation ticket
  try {
    const cleanBranch = bName.replace(/^D\.\s*Watson\s*/i, "");
    const tags = [bCity, cleanBranch, pageTitle];
    if (finalName) tags.unshift(finalName);
    if (finalPhone) tags.unshift(finalPhone);

    if (typeof window.Tawk_API.addTags === "function") {
      window.Tawk_API.addTags(tags, function() {});
    }
  } catch (e) {
    console.warn("Tawk addTags error:", e);
  }
}

/**
 * Launch Branch Live Web Chat (with Photo / Prescription Upload Capability)
 */
function launchBranchLiveChat(branch, customerInfo) {
  // Hide background branch selection card immediately
  const card = document.getElementById("branchMessengerCard");
  if (card) {
    card.classList.remove("active");
    card.setAttribute("aria-hidden", "true");
    card.style.display = "none";
  }
  if (typeof window.closeBranchMessengerCard === "function") {
    window.closeBranchMessengerCard();
  }

  if (!branch) {
    const data = getSiteData();
    branch = (data && data.branches && data.branches.length) ? data.branches[0] : null;
  }
  if (!branch) return;

  const propId = (window.DW_CONFIG && typeof window.DW_CONFIG.getTawkToPropertyId === "function")
    ? window.DW_CONFIG.getTawkToPropertyId()
    : "6aa0ffd7317f5f3442e34ee4";

  if (propId && propId.trim()) {
    // If Tawk API is loaded and ready
    if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
      try {
        if (typeof window.Tawk_API.showWidget === "function") {
          window.Tawk_API.showWidget();
        }
        sendCustomerInfoToTawk(branch, customerInfo);
      } catch (e) {
        console.warn("Tawk attribute error:", e);
      }
      window.Tawk_API.maximize();
      const trigger = document.getElementById("branchMessengerTrigger");
      if (trigger) trigger.style.display = "none";

      const cName = (customerInfo && customerInfo.name) || localStorage.getItem("dw_customer_name");
      const msg = cName
        ? `Connected to ${branch.name} Live Helpdesk as ${cName}.`
        : `Connected to ${branch.name} Live Helpdesk.`;
      if (typeof showToast === "function") {
        showToast(msg);
      }
      return;
    }

    // If script is still initializing, poll for up to 3 seconds
    if (document.getElementById("tawktoScriptEmbed") || document.querySelector('script[src*="embed.tawk.to"]')) {
      if (typeof showToast === "function") {
        showToast(`Opening Live Chat for ${branch.name}...`);
      }
      let attempts = 0;
      const pollTimer = setInterval(() => {
        attempts++;
        if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
          clearInterval(pollTimer);
          launchBranchLiveChat(branch, customerInfo);
        } else if (attempts > 12) {
          clearInterval(pollTimer);
          const waNum = branch.whatsapp || "923329716666";
          const cName = (customerInfo && customerInfo.name) || localStorage.getItem("dw_customer_name") || "";
          const msg = cName
            ? `Hello D.Watson ${branch.name} Counter Staff, this is ${cName}. I need live assistance with medicine / prescription / stock inquiry.`
            : `Hello D.Watson ${branch.name} Counter Staff, I need live assistance with medicine / prescription / stock inquiry.`;
          window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, "_blank");
        }
      }, 250);
      return;
    }
  }

  // Graceful fallback to dedicated branch counter WhatsApp
  if (typeof showToast === "function") {
    showToast(`Connecting to ${branch.name} Counter Desk...`);
  }
  const waNum = branch.whatsapp || "923329716666";
  const cName = (customerInfo && customerInfo.name) || localStorage.getItem("dw_customer_name") || "";
  const msg = cName
    ? `Hello D.Watson ${branch.name} Counter Staff, this is ${cName}. I need live assistance with medicine / prescription / stock inquiry.`
    : `Hello D.Watson ${branch.name} Counter Staff, I need live assistance with medicine / prescription / stock inquiry.`;
  const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, "_blank");
}

/**
 * Initialize Floating Branch Messenger Dock across the entire website
 */
function initFloatingBranchMessenger() {
  if (document.getElementById("branchMessengerDock")) return;

  // Suppress old static floating WhatsApp widget if present to prevent clash
  const oldWidgets = document.querySelectorAll(".floating-widget-wrapper, #floatingPopup");
  oldWidgets.forEach(w => {
    w.style.display = "none";
  });

  const siteData = getSiteData();
  const branches = (siteData && siteData.branches && siteData.branches.length) ? siteData.branches : [];
  if (!branches.length) return;

  // Group branches by City for clean UI dropdown
  const citiesMap = {};
  branches.forEach(b => {
    const city = b.city || "Islamabad";
    if (!citiesMap[city]) citiesMap[city] = [];
    citiesMap[city].push(b);
  });

  // Resolve initial selected branch (from localStorage or default to 1)
  let savedId = parseInt(localStorage.getItem("dw_messenger_branch_id"), 10);
  let activeBranch = branches.find(b => b.id === savedId) || branches[0];

  // Build Branch Selector Options
  let selectOptionsHtml = "";
  Object.keys(citiesMap).forEach(city => {
    selectOptionsHtml += `<optgroup label="📍 ${escapeHtml(city)}">`;
    citiesMap[city].forEach(b => {
      const isSel = (b.id === activeBranch.id) ? "selected" : "";
      selectOptionsHtml += `<option value="${b.id}" ${isSel}>${escapeHtml(b.name)}</option>`;
    });
    selectOptionsHtml += `</optgroup>`;
  });

  const dock = document.createElement("div");
  dock.className = "branch-messenger-dock";
  dock.id = "branchMessengerDock";
  dock.setAttribute("aria-label", "D. Watson Customer Helpdesk");

  dock.innerHTML = `
    <!-- Interactive Popover Card -->
    <div class="branch-messenger-card" id="branchMessengerCard" role="dialog" aria-modal="false" aria-hidden="true">
      <!-- Header -->
      <div class="bmc-header">
        <div class="bmc-header-brand">
          <img src="assets/images/logo-emblem.png" alt="D. Watson Emblem" class="bmc-logo-emblem" onerror="this.src='assets/images/favicon.png'">
          <div class="bmc-header-info">
            <h4>Customer Care &amp; Chat</h4>
            <span class="bmc-online-status">Pharmacist Active &amp; Ready</span>
          </div>
        </div>
        <button type="button" class="bmc-close-btn" id="bmcCloseBtn" aria-label="Close branch messenger">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="bmc-body">
        <!-- Panel 1: Main Selection View -->
        <div class="bmc-panel-main" id="bmcPanelMain">
          <!-- Known Customer Badge if name is saved -->
          <div class="bmc-known-customer" id="bmcKnownCustomer" style="display:none;">
            <div>
              <i class="fa-solid fa-circle-user" style="color:#0F766E;"></i>
              <span>Chatting as: <strong id="bmcKnownName"></strong></span>
            </div>
            <button type="button" class="bmc-known-edit-btn" id="bmcEditProfileBtn">Change</button>
          </div>

          <!-- Branch Selector -->
          <div class="bmc-field-group">
            <label class="bmc-field-label" for="bmcBranchSelect">
              <span>Select Your Branch</span>
              <small style="color:#10B981; font-weight:700;"><i class="fa-solid fa-location-dot"></i> 20+ Outlets</small>
            </label>
            <div class="bmc-branch-select-wrap">
              <select id="bmcBranchSelect" class="bmc-branch-select">
                ${selectOptionsHtml}
              </select>
              <i class="fa-solid fa-chevron-down bmc-select-chevron"></i>
            </div>
          </div>

          <!-- Active Branch Info Box -->
          <div class="bmc-branch-card" id="bmcBranchPreview">
            <div class="bmc-bc-title">
              <span id="bmcPName">${escapeHtml(activeBranch.name)}</span>
              <span class="bmc-bc-badge" id="bmcPBadge">${escapeHtml(activeBranch.badge || 'Flagship')}</span>
            </div>
            <div class="bmc-bc-detail">
              <i class="fa-solid fa-map-pin"></i>
              <span id="bmcPAddress">${escapeHtml(activeBranch.address || '')}</span>
            </div>
            <div class="bmc-bc-contacts">
              <div class="bmc-bc-contact-item">
                <span class="bmc-bc-contact-label">WhatsApp Counter</span>
                <span class="bmc-bc-contact-val" id="bmcPWa" style="color:#16A34A;">${escapeHtml(activeBranch.whatsapp || '923329716666')}</span>
              </div>
              <div class="bmc-bc-contact-item">
                <span class="bmc-bc-contact-label">Counter Direct Phone</span>
                <span class="bmc-bc-contact-val" id="bmcPPhone">${escapeHtml(activeBranch.phone || '')}</span>
              </div>
            </div>
          </div>

          <!-- The 2 Prominent Options -->
          <div class="bmc-options-grid">
            <!-- Option 1: Live Web Chat -->
            <div class="bmc-option-card bmc-option-chat" id="bmcLiveChatBtn" role="button" tabindex="0">
              <div class="bmc-opt-icon-chat">
                <i class="fa-solid fa-comments"></i>
              </div>
              <div class="bmc-opt-content">
                <div class="bmc-opt-header">
                  <span class="bmc-opt-title">1. Live Web Chat</span>
                  <span class="bmc-opt-badge bmc-opt-badge-chat">Online</span>
                </div>
                <span class="bmc-opt-desc">Chat live • Send prescription &amp; medicine photos</span>
              </div>
              <i class="fa-solid fa-chevron-right bmc-opt-arrow"></i>
            </div>

            <!-- Option 2: WhatsApp Chat -->
            <a href="#" target="_blank" class="bmc-option-card bmc-option-wa" id="bmcWhatsAppBtn">
              <div class="bmc-opt-icon-wa">
                <i class="fa-brands fa-whatsapp"></i>
              </div>
              <div class="bmc-opt-content">
                <div class="bmc-opt-header">
                  <span class="bmc-opt-title">2. WhatsApp Branch Chat</span>
                  <span class="bmc-opt-badge bmc-opt-badge-wa">Direct</span>
                </div>
                <span class="bmc-opt-desc">Chat directly with branch counter staff on WhatsApp</span>
              </div>
              <i class="fa-solid fa-chevron-right bmc-opt-arrow"></i>
            </a>
          </div>

          <!-- Optional Direct Call -->
          <a href="#" class="bmc-btn-phone" id="bmcCallBtn">
            <i class="fa-solid fa-phone"></i>
            <span>Prefer a phone call? Dial Branch Counter Directly</span>
          </a>

          <!-- Prescription & Image Attachment Notice -->
          <div class="bmc-note">
            <i class="fa-solid fa-camera"></i>
            <span><strong>Photo Support:</strong> You can attach prescriptions and product photos in both Live Chat and WhatsApp.</span>
          </div>
        </div>

        <!-- Panel 2: Customer Identity Form (Prompts when customer hasn't provided name/phone yet) -->
        <div class="bmc-customer-step" id="bmcCustomerStep" style="display:none;">
          <div class="bmc-step-header">
            <button type="button" class="bmc-step-back" id="bmcStepBackBtn" title="Back to Options">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <div>
              <h5 style="margin:0; font-size:0.95rem; font-weight:800; color:#0F172A;">Customer Information</h5>
              <span style="font-size:0.75rem; color:#64748B;" id="bmcStepBranchLabel">Connecting to pharmacist</span>
            </div>
          </div>

          <p style="font-size:0.8rem; color:#475569; margin:4px 0 6px 0; line-height:1.45;">
            Please enter your name &amp; mobile number so our branch pharmacist can identify you and address your inquiry:
          </p>

          <div class="bmc-field-group">
            <label class="bmc-field-label" for="bmcCustName">Your Full Name *</label>
            <div class="bmc-input-icon-wrap">
              <i class="fa-solid fa-user"></i>
              <input type="text" id="bmcCustName" placeholder="e.g. Muhammad Ali" autocomplete="name">
            </div>
          </div>

          <div class="bmc-field-group">
            <label class="bmc-field-label" for="bmcCustPhone">Mobile / WhatsApp Number *</label>
            <div class="bmc-input-icon-wrap">
              <i class="fa-solid fa-phone"></i>
              <input type="tel" id="bmcCustPhone" placeholder="e.g. 0300-1234567" autocomplete="tel">
            </div>
          </div>

          <button type="button" class="bmc-btn-connect-chat" id="bmcSubmitChatBtn">
            <i class="fa-solid fa-comments"></i> Start Live Chat Now
          </button>

          <button type="button" class="bmc-btn-skip-chat" id="bmcSkipChatBtn">
            Skip &amp; Continue as Anonymous Guest
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Launcher Trigger Button (1 Single Clean Floating Action Icon) -->
    <button type="button" class="branch-messenger-trigger" id="branchMessengerTrigger" aria-label="Customer Helpdesk &amp; Live Chat" title="D. Watson Live Help &amp; WhatsApp">
      <i class="fa-solid fa-comments"></i>
      <span class="bm-trigger-live-dot"></span>
    </button>
  `;

  document.body.appendChild(dock);

  // Helper to update dynamic branch card
  function updateBranchCard(branch) {
    if (!branch) return;
    activeBranch = branch;
    localStorage.setItem("dw_messenger_branch_id", branch.id);

    const nameEl = document.getElementById("bmcPName");
    const badgeEl = document.getElementById("bmcPBadge");
    const addrEl = document.getElementById("bmcPAddress");
    const waEl = document.getElementById("bmcPWa");
    const phoneEl = document.getElementById("bmcPPhone");
    const waBtn = document.getElementById("bmcWhatsAppBtn");
    const callBtn = document.getElementById("bmcCallBtn");

    if (nameEl) nameEl.textContent = branch.name;
    if (badgeEl) badgeEl.textContent = branch.badge || "Verified Outlet";
    if (addrEl) addrEl.textContent = branch.address || "";
    if (waEl) waEl.textContent = branch.whatsapp || "923329716666";
    if (phoneEl) phoneEl.textContent = branch.phone || "";

    if (waBtn) {
      const waNum = branch.whatsapp || "923329716666";
      const waMsg = `Hello D.Watson ${branch.name} Counter Desk, I would like to inquire about medicines / prescription availability.`;
      waBtn.href = `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`;
    }

    if (callBtn) {
      callBtn.href = `tel:${(branch.phone || "").replace(/[^0-9]/g, "")}`;
    }
  }

  // Initial update
  updateBranchCard(activeBranch);

  // Helper to update known customer badge
  function updateKnownCustomerBadge() {
    const badge = document.getElementById("bmcKnownCustomer");
    const nameEl = document.getElementById("bmcKnownName");
    const savedName = localStorage.getItem("dw_customer_name");
    const savedPhone = localStorage.getItem("dw_customer_phone");
    if (badge && nameEl) {
      if (savedName) {
        badge.style.display = "flex";
        nameEl.textContent = savedPhone ? `${savedName} (${savedPhone})` : savedName;
      } else {
        badge.style.display = "none";
      }
    }
  }
  updateKnownCustomerBadge();

  // Switch to Customer Identification view
  function showCustomerPrompt() {
    const panelMain = document.getElementById("bmcPanelMain");
    const panelCust = document.getElementById("bmcCustomerStep");
    const custNameInput = document.getElementById("bmcCustName");
    const custPhoneInput = document.getElementById("bmcCustPhone");
    const branchLabel = document.getElementById("bmcStepBranchLabel");

    if (branchLabel && activeBranch) {
      branchLabel.textContent = `Connecting to ${activeBranch.name} (${activeBranch.city || 'Islamabad'})`;
    }
    if (custNameInput) custNameInput.value = localStorage.getItem("dw_customer_name") || "";
    if (custPhoneInput) custPhoneInput.value = localStorage.getItem("dw_customer_phone") || "";

    if (panelMain) panelMain.style.display = "none";
    if (panelCust) {
      panelCust.style.display = "flex";
      setTimeout(() => {
        if (custNameInput && !custNameInput.value) custNameInput.focus();
        else if (custPhoneInput && !custPhoneInput.value) custPhoneInput.focus();
      }, 100);
    }
  }

  function hideCustomerPrompt() {
    const panelMain = document.getElementById("bmcPanelMain");
    const panelCust = document.getElementById("bmcCustomerStep");
    if (panelMain) panelMain.style.display = "flex";
    if (panelCust) panelCust.style.display = "none";
  }

  // Wire Branch Select change
  const branchSelect = document.getElementById("bmcBranchSelect");
  if (branchSelect) {
    branchSelect.addEventListener("change", function(e) {
      const bId = parseInt(e.target.value, 10);
      const chosen = branches.find(b => b.id === bId);
      if (chosen) updateBranchCard(chosen);
    });
  }

  // Toggle Popover Card
  const triggerBtn = document.getElementById("branchMessengerTrigger");
  const card = document.getElementById("branchMessengerCard");
  const closeBtn = document.getElementById("bmcCloseBtn");

  function toggleCard(forceOpen) {
    if (!card) return;
    const shouldOpen = (forceOpen !== undefined) ? forceOpen : !card.classList.contains("active");
    if (shouldOpen) {
      card.classList.add("active");
      card.setAttribute("aria-hidden", "false");
      card.style.display = "flex";
    } else {
      card.classList.remove("active");
      card.setAttribute("aria-hidden", "true");
      card.style.display = "none";
      hideCustomerPrompt();
    }
  }

  // Wire Live Chat Button (Option 1)
  const liveChatBtn = document.getElementById("bmcLiveChatBtn");
  if (liveChatBtn) {
    const handleChatClick = function(e) {
      if (e) e.stopPropagation();
      const savedName = localStorage.getItem("dw_customer_name");
      const savedPhone = localStorage.getItem("dw_customer_phone");
      if (savedName && savedPhone) {
        toggleCard(false);
        launchBranchLiveChat(activeBranch, { name: savedName, phone: savedPhone });
      } else {
        showCustomerPrompt();
      }
    };
    liveChatBtn.addEventListener("click", handleChatClick);
    liveChatBtn.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleChatClick(e);
      }
    });
  }

  // Wire Customer Form submission
  const submitChatBtn = document.getElementById("bmcSubmitChatBtn");
  if (submitChatBtn) {
    submitChatBtn.addEventListener("click", function(e) {
      if (e) e.stopPropagation();
      const nameInput = document.getElementById("bmcCustName");
      const phoneInput = document.getElementById("bmcCustPhone");
      const name = (nameInput ? nameInput.value : "").trim();
      const phone = (phoneInput ? phoneInput.value : "").trim();

      if (!name) {
        if (typeof showToast === "function") showToast("Please enter your name.");
        else alert("Please enter your name.");
        if (nameInput) nameInput.focus();
        return;
      }
      if (!phone) {
        if (typeof showToast === "function") showToast("Please enter your phone / WhatsApp number.");
        else alert("Please enter your phone / WhatsApp number.");
        if (phoneInput) phoneInput.focus();
        return;
      }

      localStorage.setItem("dw_customer_name", name);
      localStorage.setItem("dw_customer_phone", phone);
      updateKnownCustomerBadge();
      hideCustomerPrompt();
      toggleCard(false);
      launchBranchLiveChat(activeBranch, { name: name, phone: phone });
    });
  }

  // Wire Skip / Anonymous Guest
  const skipChatBtn = document.getElementById("bmcSkipChatBtn");
  if (skipChatBtn) {
    skipChatBtn.addEventListener("click", function(e) {
      if (e) e.stopPropagation();
      hideCustomerPrompt();
      toggleCard(false);
      launchBranchLiveChat(activeBranch, { guest: true });
    });
  }

  // Wire Step Back button
  const stepBackBtn = document.getElementById("bmcStepBackBtn");
  if (stepBackBtn) {
    stepBackBtn.addEventListener("click", function(e) {
      if (e) e.stopPropagation();
      hideCustomerPrompt();
    });
  }

  // Wire Edit Profile button
  const editProfileBtn = document.getElementById("bmcEditProfileBtn");
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", function(e) {
      if (e) e.stopPropagation();
      showCustomerPrompt();
    });
  }

  // Wire WhatsApp Button (Option 2)
  const waBtn = document.getElementById("bmcWhatsAppBtn");
  if (waBtn) {
    waBtn.addEventListener("click", function() {
      toggleCard(false);
    });
  }

  // Wire Direct Call Button
  const callBtn = document.getElementById("bmcCallBtn");
  if (callBtn) {
    callBtn.addEventListener("click", function() {
      toggleCard(false);
    });
  }

  if (triggerBtn) {
    triggerBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleCard();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleCard(false);
    });
  }

  // Close when clicking outside
  document.addEventListener("click", function(e) {
    if (card && card.classList.contains("active")) {
      if (!card.contains(e.target) && !triggerBtn.contains(e.target)) {
        toggleCard(false);
      }
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && card && card.classList.contains("active")) {
      toggleCard(false);
    }
  });

  // Close card when user interacts with an iframe (such as Tawk.to chat window)
  window.addEventListener("blur", function() {
    setTimeout(() => {
      if (document.activeElement && document.activeElement.tagName === "IFRAME") {
        toggleCard(false);
      }
    }, 100);
  });

  // Global methods
  window.openBranchMessengerCard = function(branchId) {
    if (branchId) {
      const b = branches.find(item => item.id === branchId);
      if (b) {
        if (branchSelect) branchSelect.value = b.id;
        updateBranchCard(b);
      }
    }
    toggleCard(true);
  };

  window.closeBranchMessengerCard = function() {
    toggleCard(false);
  };
}

