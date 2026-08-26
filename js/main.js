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
  renderProducts(data.products, data.company.whatsapp);
  renderBranches(data.branches);
  renderGallery(data.gallery);
  renderFAQs(data.faqs);
  renderFooter(data.company, data.branches);
  initPrescriptionUploader(data.company.whatsapp);
  initProductZoomEvents();
  initHeaderScroll();
  initMobileMenu();
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
    mobCall.href = `tel:${company.helpline.replace(/[^0-9]/g, '')}`;
  }
  const mobWa = document.getElementById("mobTabWa");
  if (mobWa) {
    mobWa.href = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Hi D.Watson Chemist, I need assistance.")}`;
  }

  // Floating CTA WhatsApp link
  const floatWaBtn = document.getElementById("floatingWaBtn");
  if (floatWaBtn) {
    floatWaBtn.href = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent("Hello D.Watson, I need assistance.")}`;
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
          <div class="slide-actions">
            <a href="${slide.ctaPrimaryLink || '#prescription-box'}" class="btn btn-primary">
              <i class="fa-brands fa-whatsapp"></i> ${escapeHtml(slide.ctaPrimaryText || 'Order on WhatsApp')}
            </a>
            <a href="${slide.ctaSecondaryLink || '#branches'}" class="btn btn-outline-white">
              ${escapeHtml(slide.ctaSecondaryText || 'Find Nearest Branch')} <i class="fa-solid fa-arrow-right"></i>
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
 * Render Department Showcase
 */
function renderDepartments(departments, defaultWhatsApp) {
  const container = document.getElementById("departmentsGrid");
  if (!container || !departments) return;

  container.innerHTML = departments.map((dept) => {
    const waUrl = `https://wa.me/${defaultWhatsApp}?text=${encodeURIComponent(dept.whatsappMsg || `Hi D.Watson, I am inquiring about ${dept.name}.`)}`;
    
    return `
      <div class="department-card" id="dept-${dept.id}">
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
          
          <ul class="dept-features">
            ${(dept.features || []).map(f => `
              <li><i class="fa-solid fa-circle-check"></i> ${escapeHtml(f)}</li>
            `).join("")}
          </ul>

          <div class="dept-card-footer">
            <a href="${waUrl}" target="_blank" class="btn btn-whatsapp btn-sm">
              <i class="fa-brands fa-whatsapp"></i> Inquire on WhatsApp
            </a>
            <a href="#branches" class="btn btn-outline btn-sm">
              Branches <i class="fa-solid fa-location-dot"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
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
  isZoomModalEventsInit = true;

  const viewport = document.getElementById("zoomViewport");
  if (!viewport) return;

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

  if (!currentProductZoomList || !currentProductZoomList.length) {
    const data = getSiteData();
    currentProductZoomList = data.products || [];
  }

  let index = 0;
  if (typeof productIdOrIndex === "number") {
    index = productIdOrIndex;
  } else if (typeof productIdOrIndex === "string") {
    const foundIdx = currentProductZoomList.findIndex(p => p.id === productIdOrIndex);
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
    imgEl.src = p.image || "assets/images/pharmacy.jpg";
    imgEl.alt = p.name;
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
      <img src="${item.image || 'assets/images/pharmacy.jpg'}" alt="${escapeHtml(item.name)}" loading="lazy">
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
    return `
      <div class="branch-mini-item ${isActive ? 'active' : ''}" onclick="selectActiveBranch('${b.id}', true)" id="branch-mini-${b.id}">
        <div class="branch-mini-top">
          <span class="branch-mini-name">${escapeHtml(b.name)}</span>
          <div class="branch-mini-badges">
            ${b.isFlagship ? '<span class="branch-mini-flagship" style="background:#FEF3C7; color:#92400E; font-weight:800; font-size:0.68rem; padding:2px 6px; border-radius:4px; border:1px solid #FCD34D;"><i class="fa-solid fa-star"></i> Flagship</span>' : ''}
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
            <span style="display:inline-flex; align-items:center; gap:6px; background:${b.is24Hours ? 'var(--dw-red)' : '#10B981'}; color:white; font-size:0.75rem; font-weight:800; padding:3px 10px; border-radius:9999px; text-transform:uppercase;">
              <i class="fa-solid fa-circle" style="font-size:0.5rem;"></i> ${b.is24Hours ? 'Open 24 Hours • 7 Days' : 'Open Daily'}
            </span>
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
        ${(b.services || ["Pharmacy", "Cosmetics", "Superstore", "Optics"]).map(srv => `
          <span class="branch-amenity-tag">
            <i class="fa-solid fa-circle-check" style="color:var(--dw-blue); font-size:0.7rem;"></i> ${escapeHtml(srv)}
          </span>
        `).join("")}
        <span class="branch-amenity-tag" style="background:#ECFDF5; color:#059669;">
          <i class="fa-solid fa-truck-fast"></i> Home Delivery
        </span>
        <span class="branch-amenity-tag" style="background:#F8FAFC; color:#475569; border:1px solid #E2E8F0;">
          <i class="fa-solid fa-wheelchair"></i> Accessible
        </span>
      </div>
    </div>

    <div class="branch-action-buttons-hub">
      <a href="${b.mapUrl || `https://maps.google.com/?q=D.+Watson+${encodeURIComponent(b.name)}`}" target="_blank" class="btn btn-outline">
        <i class="fa-solid fa-diamond-turn-right"></i> Google Directions
      </a>
      <a href="tel:${phoneCall}" class="btn btn-blue">
        <i class="fa-solid fa-phone"></i> Call Branch
      </a>
    </div>
  `;
}

window.selectActiveBranch = function(branchId, userTriggered = false) {
  activeBranchId = branchId;
  document.querySelectorAll(".branch-mini-item").forEach(el => el.classList.remove("active"));
  const activeEl = document.getElementById(`branch-mini-${branchId}`);
  if (activeEl) activeEl.classList.add("active");

  const branch = allBranchesData.find(b => b.id === branchId);
  if (branch) {
    renderActiveBranchDetail(branch);
  }

  // If on mobile/tablet and user explicitly tapped a branch, smooth-scroll down to showcase card
  if (userTriggered && window.innerWidth <= 992) {
    const detailPane = document.getElementById("branchDetailPane");
    if (detailPane) {
      const topOffset = detailPane.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  }
};

window.filterBranchesByCity = function(cityOption, btn) {
  document.querySelectorAll("#branchCityPills .branch-pill-btn").forEach(p => p.classList.remove("active"));
  if (btn) btn.classList.add("active");

  const searchInput = document.getElementById("branchSearchInput");
  if (searchInput) searchInput.value = "";
  const clearBtn = document.getElementById("branchSearchClear");
  if (clearBtn) clearBtn.style.display = "none";

  if (cityOption === "all") {
    filteredBranchesData = allBranchesData;
  } else if (cityOption === "flagship") {
    filteredBranchesData = allBranchesData.filter(b => b.isFlagship === true);
  } else if (cityOption === "latenight") {
    filteredBranchesData = allBranchesData.filter(b => b.timings && b.timings.includes("01:00 AM"));
  } else if (cityOption === "Other Cities") {
    filteredBranchesData = allBranchesData.filter(b => b.city.toLowerCase() !== "islamabad" && b.city.toLowerCase() !== "rawalpindi" && b.city.toLowerCase() !== "lahore");
  } else {
    filteredBranchesData = allBranchesData.filter(b => b.city.toLowerCase() === cityOption.toLowerCase());
  }

  renderBranchHub(filteredBranchesData);
  renderBranchCards(filteredBranchesData);
};

window.switchBranchView = function(viewMode) {
  currentBranchView = viewMode;
  const hubLayout = document.getElementById("branchHubLayout");
  const gridLayout = document.getElementById("branchesGrid");
  const btnHub = document.getElementById("viewBtnHub");
  const btnGrid = document.getElementById("viewBtnGrid");

  if (viewMode === "hub") {
    if (hubLayout) hubLayout.style.display = "grid";
    if (gridLayout) gridLayout.style.display = "none";
    if (btnHub) btnHub.classList.add("active");
    if (btnGrid) btnGrid.classList.remove("active");
  } else {
    if (hubLayout) hubLayout.style.display = "none";
    if (gridLayout) gridLayout.style.display = "grid";
    if (btnHub) btnHub.classList.remove("active");
    if (btnGrid) btnGrid.classList.add("active");
  }
};

window.clearBranchSearch = function() {
  const searchInput = document.getElementById("branchSearchInput");
  const clearBtn = document.getElementById("branchSearchClear");
  if (searchInput) searchInput.value = "";
  if (clearBtn) clearBtn.style.display = "none";
  filteredBranchesData = allBranchesData;
  renderBranchHub(filteredBranchesData);
  renderBranchCards(filteredBranchesData);
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

  container.innerHTML = branches.map(b => `
    <div class="branch-card" style="position:relative;">
      <div class="branch-card-header">
        <img src="${encodeURI(b.image || 'assets/images/store_flagship.jpg')}" alt="${escapeHtml(b.name)}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='assets/images/store_flagship.jpg';">
        ${b.isFlagship ? '<span style="position:absolute; top:12px; left:12px; background:linear-gradient(135deg, #F59E0B, #D97706); color:white; font-weight:800; font-size:0.72rem; padding:3px 8px; border-radius:6px; z-index:2; box-shadow:0 2px 6px rgba(0,0,0,0.2);"><i class="fa-solid fa-star"></i> Flagship</span>' : ''}
        ${b.is24Hours ? '<span class="branch-badge-24"><i class="fa-solid fa-clock"></i> 24/7 OPEN</span>' : ''}
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
  `).join("");
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
    footerBranchList.innerHTML = branches.slice(0, 6).map(b => `
      <li><a href="#branches"><i class="fa-solid fa-angle-right"></i> ${escapeHtml(b.name)}</a></li>
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
  // Official GitHub Global CDN Raw Link (permanent, live, public, 100% reliable)
  return `https://raw.githubusercontent.com/wasidevxyz-pixel/dwatson/main/${encodedPath}`;
}

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

function initMobileMenu() {
  const toggle = document.querySelector(".mobile-toggle");
  const menu = document.querySelector(".nav-menu");
  if (!toggle || !menu) return;

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
