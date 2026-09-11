/**
 * D. Watson Chemist & Superstore - Central Data Store
 * Official Data: Heritage, 24+ Branches, Featured Products, Gallery, Helpline & Admin Settings
 * Official Sources: dwatson.co | dwatson.pk | facebook.com/DWatsonChemist
 */

const DEFAULT_SITE_DATA = {
  company: {
    name: "D. Watson Chemist & Superstore",
    shortName: "D. Watson",
    tagline: "Your Trusted Partner in Health, Beauty & Everyday Care",
    badge: "Est. 1978 • Pakistan's Premier Pharmacy & Superstore Chain",
    phone: "051-8438111",
    helpline: "051-8438111",
    whatsapp: "923329716666",
    whatsappDisplay: "0332-9716666",
    messenger: "https://m.me/DWatsonChemist",
    email: "dwatsonconsultation@gmail.com",
    website: "https://dwatson.co",
    address: "Head Office: School Road, Super Market, F-6 Markaz, Islamabad",
    announcement: "✨ 100% Genuine Medicines Guaranteed • 24/7 Universal Helpline: 051-8438111 • WhatsApp Express Delivery: 0332-9716666",
    
    // Heritage, Founders & Family Leadership
    aboutShort: "For nearly five decades, D. Watson has stood as Pakistan's premier healthcare and retail legacy, established by the Bakhtawari family with an unwavering commitment to 100% authentic medicines, global luxury beauty, optics, surgical care, and supermarket convenience.",
    aboutHistory: "The story of D. Watson is rooted in a heartfelt tribute of gratitude. In 1978, three brothers — Chairman Zafar Iqbal Bakhtawari, Co-Chairman Zahid Bakhtawari, and CEO Abid Bakhtawari — established their first pharmacy. The name 'D. Watson' was chosen in deep appreciation of Dr. Watson, the renowned British eye specialist in England who successfully cured Mr. Bakhtawari's eye illness and restored his eyesight during his youth. In 1982, the brothers inaugurated their landmark store in Islamabad's F-6 Super Market, setting a new benchmark for pharmacy retail. The legacy and nationwide expansion continues through the next generation of the Bakhtawari family: Ahsan Zafar Bakhtawari (Managing Director, son of Chairman Zafar Iqbal Bakhtawari), Bilal Zahid Bakhtawari (Director, son of Co-Chairman Zahid Bakhtawari), and Haris Bakhtawari & Salman Bakhtawari (Directors, sons of CEO Abid Bakhtawari) — leading D. Watson across 25+ modern branches in Islamabad, Rawalpindi, Lahore, and Abbottabad.",
    
    // Historical Milestones
    historyTimeline: [
      {
        year: "1978",
        title: "The Genesis & Tribute to Dr. Watson",
        desc: "Founded by three brothers: Chairman Zafar Iqbal Bakhtawari, Co-Chairman Zahid Bakhtawari, and CEO Abid Bakhtawari. Named in gratitude to British ophthalmologist Dr. Watson who cured Mr. Bakhtawari's vision in England."
      },
      {
        year: "1982",
        title: "F-6 Super Market Landmark Opening",
        desc: "Inaugurated Islamabad's first modern pharmacy and retail counter in F-6 Super Market, setting the benchmark for authentic medicine dispensing in the capital."
      },
      {
        year: "1992",
        title: "Blue Area Flagship Mega Superstore",
        desc: "Inaugurated the iconic multi-level flagship store on Jinnah Avenue, Blue Area, creating Islamabad's largest integrated departmental healthcare facility."
      },
      {
        year: "2005",
        title: "Pioneering Departmental Superstore Concept",
        desc: "Integrated specialized divisions for international luxury cosmetics, computerized optics clinics, hospital surgical devices, and gourmet hypermarket groceries under one roof."
      },
      {
        year: "2018",
        title: "Stringent Cold-Chain & Pharmacist Certification",
        desc: "Equipped all pharmacy dispensing stations with computerized cold-chain climate monitors (2°C - 8°C) to guarantee 100% potency for life-saving biologicals and vaccines."
      },
      {
        year: "2026",
        title: "Omnichannel Digital Healthcare Hub",
        desc: "Led by founding brothers Chairman Zafar Iqbal Bakhtawari, Co-Chairman Zahid Bakhtawari, and CEO Abid Bakhtawari, alongside the second-generation leadership: Ahsan Zafar Bakhtawari (Managing Director), Bilal Zahid Bakhtawari (Director), and Haris Bakhtawari & Salman Bakhtawari (Directors) — operating 25+ premier branches with 24/7 express home delivery, digital WhatsApp prescription dispensing, and centralized customer helpline (051-8438111)."
      }
    ],

    stats: [
      { number: "50+", label: "Years of Trust & Legacy", icon: "fa-award" },
      { number: "25+", label: "Official Modern Branches", icon: "fa-building" },
      { number: "100%", label: "Authentic & Genuine Guarantee", icon: "fa-shield-halved" },
      { number: "50k+", label: "Curated Healthcare & Retail SKU's", icon: "fa-boxes-stacked" }
    ],

    social: {
      facebook: "https://www.facebook.com/DWatsonChemist/",
      instagram: "https://www.instagram.com/dwatson_chemist/",
      whatsapp: "https://wa.me/923329716666",
      messenger: "https://m.me/DWatsonChemist"
    },

    // Express Home Delivery Rules & Policies
    deliveryDefaultFee: 200,
    deliveryMinOrder: 1000,
    deliveryFreeThreshold: 3000,

    // Live Chat Configuration (Crisp Advanced Live Chat)
    crispEnabled: true,
    crispWebsiteId: "4ea9bb45-b036-4468-bb27-09fe93c30b3f",

    // Admin Security Credentials (Protected AES Gate)
    adminAuth: {
      username: "admin",
      // SHA-256 hash of "dwatson123"
      passwordHash: "755490408479e09d5a6c117d7ee41f71dfb25a3ea23ff790f9cd3497d51ee910"
    }
  },

  // Board of Directors & Executive Management
  management: [
    {
      id: 1,
      name: "Mr Zafar Bakhtawari",
      role: "CHAIRMAN",
      organization: "D. Watson Group of Pharmacies",
      badge: "Founding Chairman",
      icon: "fa-solid fa-crown",
      bio: "Visionary founder of D. Watson and Former President of ICCI (Islamabad Chamber of Commerce & Industry). Established the healthcare legacy in 1978 built on 100% authentic medicine dispensing and community trust.",
      image: "assets/images/management/zafar-bakhtawari.png",
      order: 1,
      tier: "founders"
    },
    {
      id: 2,
      name: "Mr Zahid Bakhtawari",
      role: "CO-CHAIRMAN",
      organization: "D. Watson Group of Pharmacies",
      badge: "Founding Co-Chairman",
      icon: "fa-solid fa-star",
      bio: "Co-Founder and strategic pillar of D. Watson. Pioneered the network's commercial governance, institutional partnerships, and regional growth across Pakistan.",
      image: "assets/images/management/zahid-bakhtawari.png",
      order: 2,
      tier: "founders"
    },
    {
      id: 3,
      name: "Mr Abid Bakhtawari",
      role: "CEO",
      organization: "D. Watson Group of Pharmacies",
      badge: "Chief Executive Officer",
      icon: "fa-solid fa-user-tie",
      bio: "Co-Founder and Chief Executive Officer. Architect of D. Watson's stringent cold-chain pharmaceutical standards, hospital supplies, and continuous retail modernization.",
      image: "assets/images/management/abid-bakhtawari.png",
      order: 3,
      tier: "founders"
    },
    {
      id: 4,
      name: "Mr Haris Bakhtawari",
      role: "DIRECTOR",
      organization: "D. Watson Group of Pharmacies",
      badge: "Executive Director",
      icon: "fa-solid fa-chart-line",
      bio: "Leading modern retail operations, digital healthcare services, luxury cosmetics sourcing, and customer experience innovation across the 25+ branch ecosystem.",
      image: "assets/images/management/haris-bakhtawari.png",
      order: 4,
      tier: "directors"
    },
    {
      id: 5,
      name: "Mr Salman Bakhtawari",
      role: "DIRECTOR",
      organization: "D. Watson Group of Pharmacies",
      badge: "Executive Director",
      icon: "fa-solid fa-briefcase",
      bio: "Spearheading supply chain logistics, state-of-the-art superstore merchandising, optics clinics, and regional expansion initiatives for D. Watson.",
      image: "assets/images/management/salman-bakhtawari.png",
      order: 5,
      tier: "directors"
    }
  ],

  heroSlides: [
    {
      id: 1,
      tag: "Original Korean Skincare",
      title: "Authentic K-Beauty & Clinical Skincare Revolution",
      subtitle: "Discover viral Korean skincare favorites — COSRX, Anua, Skin1004 Madagascar Centella, Axis-Y & Beauty of Joseon. 100% genuine imported serums, soothing toners, and lightweight sunscreens.",
      image: "assets/images/Slider Image/korean_wide_hero_banner.jpg",
      badgeText: "100% Certified Import",
      ctaPrimaryText: "Explore Skincare",
      ctaPrimaryLink: "#products",
      ctaSecondaryText: "Order on WhatsApp",
      ctaSecondaryLink: "https://wa.me/923329716666?text=Hi%20D.Watson,%20I%20am%20inquiring%20about%20Korean%20Skincare%20products.",
      theme: "blue-red"
    },
    {
      id: 2,
      tag: "Glamour & Beauty Studio",
      title: "Golden Rose Signature Makeup & Color Cosmetics",
      subtitle: "Express your true elegance with long-lasting matte lipsticks, HD foundations, flawless primers, and richly pigmented blushes curated for Pakistani beauty lovers.",
      image: "assets/images/Slider Image/Golden_Rose_Banner_Desktop_2.jpg",
      badgeText: "Exclusive Beauty Collection",
      ctaPrimaryText: "View Cosmetics",
      ctaPrimaryLink: "#departments",
      ctaSecondaryText: "WhatsApp Beauty Desk",
      ctaSecondaryLink: "https://wa.me/923329716666?text=Hi%20D.Watson,%20I%20am%20inquiring%20about%20Golden%20Rose%20Cosmetics.",
      theme: "red-blue"
    },
    {
      id: 3,
      tag: "Salon-Grade Hair Therapy",
      title: "Urban Care & Botanical Hair Repair Treatments",
      subtitle: "Nourish and revitalize your hair with biotin, caffeine, keratin, and natural botanical extracts. Professional shampoos, intense repair masques, and scalp reviving serums.",
      image: "assets/images/Slider Image/Urbancare_Banner_Desktop.jpg",
      badgeText: "Natural & Sulfate-Free",
      ctaPrimaryText: "Discover Haircare",
      ctaPrimaryLink: "#departments",
      ctaSecondaryText: "Inquire on WhatsApp",
      ctaSecondaryLink: "https://wa.me/923329716666?text=Hi%20D.Watson,%20I%20am%20inquiring%20about%20Urban%20Care%20Hair%20Products.",
      theme: "blue-red"
    },
    {
      id: 4,
      tag: "European Fashion Glamour",
      title: "Flormar Cosmetics: Bold Colors & Everyday Radiance",
      subtitle: "From velvety lip colors to water-resistant mascaras and glowing highlighters — premium European beauty essentials available across all D. Watson flagship outlets.",
      image: "assets/images/Slider Image/Flormar_Banner_Desktop.jpg",
      badgeText: "European Quality Standard",
      ctaPrimaryText: "Explore Beauty Lounge",
      ctaPrimaryLink: "#departments",
      ctaSecondaryText: "WhatsApp Delivery",
      ctaSecondaryLink: "https://wa.me/923329716666?text=Hi%20D.Watson,%20I%20want%20to%20order%20Flormar%20Cosmetics.",
      theme: "red-blue"
    },
    {
      id: 5,
      tag: "Pakistan's Most Trusted Pharmacy",
      title: "48+ Years of Uncompromising Healthcare Excellence",
      subtitle: "100% genuine temperature-controlled medicines, surgical hospital supplies, computerized optics clinics, and 24/7 prescription home delivery across 25+ flagship branches.",
      image: "assets/images/Shop Inside/Medicine.jpeg",
      badgeText: "24/7 Cold Chain Pharmacy",
      ctaPrimaryText: "Upload Prescription",
      ctaPrimaryLink: "#prescription-box",
      ctaSecondaryText: "Find Nearest Branch",
      ctaSecondaryLink: "#branches",
      theme: "blue-red"
    }
  ],

  departments: [
    {
      id: "pharmacy",
      name: "Pharmacy & Medicines",
      badge: "Core Specialty",
      tagline: "100% Genuine Prescription & OTC Medicines",
      image: "assets/images/Shop Inside/Medicine.jpeg",
      icon: "fa-solid fa-prescription-bottle-medical",
      description: "Our licensed pharmacies operate under rigorous temperature and quality protocols. We carry rare life-saving drugs, oncology, cardiology, pediatric, and daily wellness medications with certified pharmacist counseling.",
      features: [
        "Temperature-Controlled Storage (2°C - 8°C cold chain)",
        "Qualified Registered Pharmacists on staff 24/7",
        "Direct manufacturer sourcing — Zero counterfeit risk",
        "Instant Prescription WhatsApp dispensing verification"
      ],
      whatsappMsg: "Hi D.Watson, I need assistance with Pharmacy medicines and prescription availability."
    },
    {
      id: "cosmetics",
      name: "Cosmetics & Skincare",
      badge: "Luxury & Dermatological",
      tagline: "International Beauty, Fragrances & Derma Care",
      image: "assets/images/Shop Inside/Cosmetics.jpeg",
      icon: "fa-solid fa-wand-magic-sparkles",
      description: "Step into our prestigious beauty counters featuring authentic international skincare, dermatologist-recommended formulations (La Roche-Posay, CeraVe, Bioderma, Vichy), and iconic beauty brands.",
      features: [
        "100% Original imported skincare & treatments",
        "Dermatologist-recommended clinical derma care",
        "Expert beauty advisors & skin consultation",
        "Premium haircare, nail care & luxury personal care"
      ],
      whatsappMsg: "Hi D.Watson, I am inquiring about Cosmetics and Skincare product availability."
    },
    {
      id: "perfumes",
      name: "Luxury Perfumes & Fragrances",
      badge: "Designer Scents",
      tagline: "100% Original Global Perfume Brands",
      image: "assets/images/Shop Inside/Perfumes.jpeg",
      icon: "fa-solid fa-spray-can-sparkles",
      description: "Explore our exclusive fragrance collection featuring genuine designer perfumes, French colognes, luxury ouds, and signature gift sets directly sourced from authorized brand distributors.",
      features: [
        "100% Guaranteed original brand perfumes",
        "Extensive designer collection for men & women",
        "Specialty Arabian ouds & French Eau de Parfum",
        "Luxury gift boxes & seasonal fragrance sets"
      ],
      whatsappMsg: "Hi D.Watson, I would like to inquire about Luxury Perfumes and Fragrances."
    },
    {
      id: "color_cosmetics",
      name: "Color Cosmetics & Makeup",
      badge: "Glamour & Beauty",
      tagline: "Trending Global Makeup & Beauty Accessories",
      image: "assets/images/Shop Inside/ColorCosmetics.jpeg",
      icon: "fa-solid fa-palette",
      description: "A glamorous beauty station featuring high-definition foundations, lipsticks, eyeshadow palettes, makeup brushes, and professional cosmetic tools from top international beauty houses.",
      features: [
        "Authentic international makeup palettes & foundations",
        "Wide shade selection for all skin tones",
        "Professional application tools, sponges & brushes",
        "Cruelty-free & dermatologist-tested formulations"
      ],
      whatsappMsg: "Hi D.Watson, I am inquiring about Color Cosmetics and Makeup products."
    },
    {
      id: "grocery",
      name: "Superstore & Grocery",
      badge: "Full Hypermarket Range",
      tagline: "Premium Daily Groceries & Imported Goods",
      image: "assets/images/Shop Inside/Grocery.jpeg",
      icon: "fa-solid fa-cart-shopping",
      description: "Our modern superstores offer an extensive variety of daily grocery essentials, imported beverages, organic snacks, baby foods, toiletries, and household supplies organized in spacious aisles.",
      features: [
        "Wide range of imported gourmet & dietary goods",
        "Comprehensive dairy, beverages & household staples",
        "Fresh packaged essentials & confectionery aisles",
        "Express billing counters & dedicated customer assistance"
      ],
      whatsappMsg: "Hi D.Watson, I would like to inquire about Superstore and Grocery items."
    },
    {
      id: "babycare",
      name: "Baby Care & Infant Nutrition",
      badge: "Gentle Care",
      tagline: "Premium Infant Formulas, Diapers & Mother Care",
      image: "assets/images/Shop Inside/BabyCare.jpeg",
      icon: "fa-solid fa-baby",
      description: "Everything for your baby's wellness: certified infant milk formulas, sensitive diapers, organic baby foods, gentle derma lotions, feeding bottles, and maternal care essentials.",
      features: [
        "Certified infant formulas (Aptamil, Similac, Meiji)",
        "Hypoallergenic baby skincare, wipes & diapers",
        "BPA-free feeding bottles, warmers & accessories",
        "Specialized maternal & post-natal wellness products"
      ],
      whatsappMsg: "Hi D.Watson, I am inquiring about Baby Care and Nutrition products."
    },
    {
      id: "crockery",
      name: "Premium Crockery & Homeware",
      badge: "Lifestyle Elegance",
      tagline: "Luxury Tableware, Glassware & Kitchenware",
      image: "assets/images/Shop Inside/Crockery.jpeg",
      icon: "fa-solid fa-utensils",
      description: "Elevate your living space with our refined selection of imported dinner sets, crystal glassware, non-stick cookware, thermo flasks, and decorative household essentials.",
      features: [
        "Imported porcelain & bone china dinner sets",
        "Heat-resistant cookware & kitchen appliances",
        "Crystal glassware, mug sets & vacuum flasks",
        "Elegant gift sets for weddings & celebrations"
      ],
      whatsappMsg: "Hi D.Watson, I want to inquire about Crockery and Homeware items."
    },
    {
      id: "homeo",
      name: "Homeopathic & Natural Care",
      badge: "Natural Wellness",
      tagline: "German & Authentic Homeopathic Remedies",
      image: "assets/images/Shop Inside/Homeo.jpeg",
      icon: "fa-solid fa-leaf",
      description: "Dedicated natural wellness department carrying authentic German Schwabe, Reckeweg, and certified herbal supplements for holistic family healthcare.",
      features: [
        "Authentic German Schwabe & Dr. Reckeweg remedies",
        "Herbal wellness tinctures & natural dietary aids",
        "Organic supplements & therapeutic botanicals",
        "Expert natural care dispensing assistance"
      ],
      whatsappMsg: "Hi D.Watson, I am inquiring about Homeopathic remedies and Natural wellness products."
    },
    {
      id: "hearing_aid",
      name: "Hearing & Diagnostic Aids",
      badge: "Precision Care",
      tagline: "Advanced Hearing Devices & Home Health Monitors",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789110528/vygzs1ggkgyfrafdkt60.jpg",
      icon: "fa-solid fa-ear-listen",
      description: "Modern hearing instruments, digital diagnostic monitors, diabetes care supplies, and personal health testing equipment for seniors and clinical home use.",
      features: [
        "Discreet digital hearing aids & sound amplifiers",
        "Certified blood glucose & cholesterol meters",
        "Automatic digital BP monitors & pulse oximeters",
        "Hearing aid batteries, replacement tips & cleaning kits"
      ],
      whatsappMsg: "Hi D.Watson, I would like to inquire about Hearing Aids and Diagnostic equipment."
    },
    {
      id: "toys",
      name: "Kids World & Educational Toys",
      badge: "Fun & Learning",
      tagline: "Safe Toys, Games & Creative Fun for Children",
      image: "assets/images/Shop Inside/Toys.jpeg",
      icon: "fa-solid fa-gamepad",
      description: "A joyful children's aisle featuring educational STEM games, plush toys, diecast vehicles, creative art kits, and safe developmental toys for kids of all ages.",
      features: [
        "Certified safe, non-toxic educational toys",
        "STEM learning kits, puzzles & board games",
        "Diecast cars, action figures & dolls",
        "Art supplies, coloring sets & seasonal gifts"
      ],
      whatsappMsg: "Hi D.Watson, I want to inquire about Kids Toys and games."
    },
    {
      id: "undergarments",
      name: "Undergarments & Comfort Apparel",
      badge: "Boutique Collection",
      tagline: "High-Quality Innerwear & Loungewear",
      image: "assets/images/Shop Inside/Undergarments.jpeg",
      icon: "fa-solid fa-shirt",
      description: "A private, comfortable shopping section offering top local and international innerwear, shapewear, thermal wear, and loungewear crafted with breathable, skin-friendly fabrics for the entire family.",
      features: [
        "Leading brand collections (Triumph, Jockey, IFG, and more)",
        "Dedicated private fitting assistance and sizing guides",
        "Premium cotton innerwear for men, women, and kids",
        "Seasonal thermal wear, socks, sleepwear & loungewear"
      ],
      whatsappMsg: "Hi D.Watson, I want to inquire about Undergarments and Comfort apparel."
    },
    {
      id: "optics",
      name: "Optics & Eye Care",
      badge: "Vision Clinic",
      tagline: "Computerized Testing & Designer Eyewear",
      image: "assets/images/optics.jpg",
      icon: "fa-solid fa-glasses",
      description: "Our in-house vision clinics are equipped with high-precision optical diagnostic machines and certified optometrists. Choose from high-fashion designer frames, sunglasses, and anti-glare prescription lenses.",
      features: [
        "Free computerized eye examinations with qualified optometrists",
        "Designer frames & polarized sunglasses collection",
        "Blue-cut, progressive, and photochromic high-index lenses",
        "Premium contact lenses & specialized lens solutions"
      ],
      whatsappMsg: "Hi D.Watson, I would like to inquire about Optics frames, lenses, or eye testing."
    },
    {
      id: "surgical",
      name: "Surgical & Hospital Equipment",
      badge: "Clinical Grade",
      tagline: "Hospital Supplies, Diagnostics & Rehab Aids",
      image: "assets/images/surgical.jpg",
      icon: "fa-solid fa-stethoscope",
      description: "Providing patients, clinics, and hospitals with top-tier diagnostic devices, mobility aids (wheelchairs, walkers), orthopedic braces, and sterile surgical disposables.",
      features: [
        "Digital BP monitors, pulse oximeters & nebulizers (Omron, Beurer)",
        "Orthopedic supports, knee braces, cervical collars & belts",
        "Standard & motorized wheelchairs, walking sticks, commodes",
        "Sterile surgical instruments, gloves, and wound dressings"
      ],
      whatsappMsg: "Hi D.Watson, I am looking for Surgical equipment and healthcare supplies."
    }
  ],

  // Featured Products Showcase — Permanently hardcoded real product catalog
  products: [
    {
      id: "p1",
      name: "Samyang Buldak all Flav Ramen Noodles",
      category: "grocery",
      categoryName: "Baby Care & Supermarket",
      brand: "Samyang Buldak",
      price: "PKR 490",
      tag: "Verified Genuine",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789036124/m0k4bj9oxmhgfxwogmz2.jpg",
      description: "Spicy Korean-style instant ramen noodles with a rich, savory hot chicken flavor and signature Buldak sauce. Perfect for spice lovers and easy to prepare in just a few minutes.",
      inStock: true
    },
    {
      id: "p2",
      name: "CODL Omega-3 Fish Oil 1000mg",
      category: "pharmacy",
      categoryName: "Medicines & Supplements",
      brand: "BIOLIFE",
      price: "PKR 1,990",
      tag: "Verified Genuine",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789036146/q57j8z9ijuuw07wlo7qh.jpg",
      description: "BIOLIFE CODL Omega-3 Fish Oil 1000mg Softgels are a dietary supplement containing omega-3 fish oil. Formulated to support cardiovascular health, brain and eye health, bones and joints, and overall wellness.",
      inStock: true
    },
    {
      id: "p3",
      name: "Myotin Sachet",
      category: "pharmacy",
      categoryName: "Medicines & Supplements",
      brand: "MEDI GREEN",
      price: "PKR 1,150",
      tag: "Verified Genuine",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789036161/umu4cfnchzwmlwcepijr.jpg",
      description: "MEDI GREEN Myotin is a dietary supplement designed specifically for women's reproductive health and wellness. Features Myo-Inositol, Folic Acid, and D-Chiro Inositol to support hormonal balance, PCOS management, and fertility.",
      inStock: true
    },
    {
      id: "p4",
      name: "Osteowhiz",
      category: "pharmacy",
      categoryName: "Medicines & Supplements",
      brand: "NutraWhiz",
      price: "PKR 1,150",
      tag: "Verified Genuine",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789037342/rg9ingqxnal1skszkuna.jpg",
      description: "NutraWhiz Osteowhiz is a comprehensive dietary supplement formulated for men and women of all ages to support strong bones, joint health, and overall skeletal strength.",
      inStock: true
    },
    {
      id: "p5",
      name: "Avoglo",
      category: "pharmacy",
      categoryName: "Medicines & Supplements",
      brand: "NutraWhiz",
      price: "PKR 4500",
      tag: "Verified Genuine",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789037941/jeg1heemytrcxdfdkxil.png",
      description: "NutraWhiz Avoglo is a revitalizing food supplement formulated to promote powerful antioxidant activity and enhance skin complexion.",
      inStock: true
    },
    {
      id: "p6",
      name: "Magnibase Magnesium Glycinate 500mg",
      category: "pharmacy",
      categoryName: "Medicines & Supplements",
      brand: "NutriBase",
      price: "PKR 2,495",
      tag: "Verified Genuine",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789038344/gpnlsaigcqb4usufpkyp.png",
      description: "NutriBase Magnibase Magnesium Glycinate 500mg is a high-absorption dietary supplement formulated to support relaxation, restful sleep, and overall bodily wellness.",
      inStock: true
    },
    {
      id: "p7",
      name: "First Infant Milk (Stage 1)",
      category: "grocery",
      categoryName: "Baby Care & Supermarket",
      brand: "Kendamil",
      price: "PKR 9,950",
      tag: "Verified Genuine",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789038824/z86e3yeizdcif2p4qqxj.jpg",
      description: "Kendamil First Infant Milk is a premium, whole-milk baby formula crafted in the UK Lake District, suitable for babies from birth.",
      inStock: true
    },
    {
      id: "p8",
      name: "Cow & Gate First Infant Milk (Stage 1)",
      category: "grocery",
      categoryName: "Baby Care & Supermarket",
      brand: "Cow & Gate",
      price: "PKR 9,700",
      tag: "Verified Genuine",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789039001/m1qfr2nnciwnyvlp6a43.jpg",
      description: "Cow & Gate First Infant Milk is a nutritionally complete breastmilk substitute, suitable from birth. Formulated with care, it features milk from grass-fed cows, contains no palm oil, and provides essential nutrients to support your baby's early development.",
      inStock: true
    },
    {
      id: "p9",
      name: "Aptamil Advance Junior 3 (Growing Up Formula)",
      category: "grocery",
      categoryName: "Baby Care & Supermarket",
      brand: "Nutricia",
      price: "PKR 7,100",
      tag: "Verified Genuine",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789039356/wogso2pebwwpp9idquso.jpg",
      description: "Aptamil Advance Junior 3 is a premium growing-up formula based on cow's milk, specifically tailored for toddlers aged 1 to 3 years. Formulated with Nutricia's Pronutra-ADVANCE combination.",
      inStock: true
    },
    {
      id: "p10",
      name: "Aptamil Advance 1 (Infant Formula)",
      category: "grocery",
      categoryName: "Baby Care & Supermarket",
      brand: "Nutricia",
      price: "PKR 7,650",
      tag: "Verified Genuine",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789039555/gnuvyvl01ytjreyjpcla.jpg",
      description: "Aptamil Advance 1 is a scientifically formulated infant milk formula based on cow's milk, specifically designed for babies from 0 to 6 months.",
      inStock: true
    },
    {
      id: "p11",
      name: "Omron M2 Basic Digital BP Monitor",
      category: "surgical",
      categoryName: "Surgical & Health Devices",
      brand: "Omron Healthcare",
      price: "PKR 9,850",
      tag: "Clinical Accuracy",
      image: "assets/images/Omron M2 Basic Digital BP Monitor.jpg",
      description: "Fully automatic upper arm blood pressure monitor with Intellisense technology and irregular heartbeat detector.",
      inStock: true
    },
    {
      id: "p12",
      name: "Accu-Chek Instant Blood Glucose Meter",
      category: "surgical",
      categoryName: "Surgical & Health Devices",
      brand: "Roche Diagnostics",
      price: "PKR 3,950",
      tag: "Instant Diabetes Check",
      image: "assets/images/Accu-Chek Instant Blood Glucose Meter.jpg",
      description: "Wireless blood glucose monitoring system with target range indicator and test strip ejector.",
      inStock: true
    },
    {
      id: "p13",
      name: "Ray-Ban Aviator Classic Polarized",
      category: "optics",
      categoryName: "Optics & Eyewear",
      brand: "Ray-Ban Official",
      price: "PKR 8500",
      tag: "100% UV400 Protection",
      image: "assets/images/Ray-Ban Aviator Classic Polarized.jpg",
      description: "Iconic gold frame with polarized green classic G-15 crystal lenses.",
      inStock: true
    },
    {
      id: "p14",
      name: "Aptamil Advance Infant Formula 1",
      category: "grocery",
      categoryName: "Baby Care & Supermarket",
      brand: "NUTRICIA",
      price: "PKR 3,150",
      tag: "Verified Genuine",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789039941/w3o0qof0knr2qscc2yhj.jpg",
      description: "Aptamil Advance 1 is a patented next-generation formula suitable for babies from birth to 6 months. This 400g pack is inspired by 40 years of pioneering research in early life nutrition.",
      inStock: true
    },
    {
      id: "p15",
      name: "Seven Seas Cod Liver Oil + Omega 3 (500ml)",
      category: "pharmacy",
      categoryName: "Medicines & Supplements",
      brand: "Seven Seas UK",
      price: "PKR 4,800",
      tag: "Immune & Brain Support",
      image: "assets/images/seven-seas-cod-liver-oil-omega-3.jpg",
      description: "Rich in natural Vitamins A, D and essential Omega-3 fatty acids EPA and DHA.",
      inStock: true
    },
    {
      id: "p16",
      name: "Aptamil 3 Toddler Milk (Fortified Milk Drink, 1-2 Years)",
      category: "pharmacy",
      categoryName: "Medicines & Supplements",
      brand: "Aptamil",
      price: "PKR 9,950",
      tag: "Verified Genuine",
      image: "https://res.cloudinary.com/bempxyod/image/upload/v1789040179/lac0kucyt9f0x2dbkk8f.jpg",
      description: "Aptamil 3 Toddler Milk is a fortified milk drink specially tailored for toddlers aged 1 to 2 years. Enriched with essential vitamins (A, C, D), Iron, and Calcium.",
      inStock: true
    }
  ],

  // Complete Official D. Watson Branch Network - Focused Flagship Outlets
  branches: [
    // === ⭐ ABID BAKHTAWARI FLAGSHIP BRANCHES (7 PRIMARY OUTLETS) ===
    {
      id: "b_f6",
      name: "D. Watson Branch No. 1 - F-6 Super Market (Flagship)",
      city: "Islamabad",
      area: "Sector F-6",
      address: "School Road, Super Market, F-6 Markaz, Islamabad",
      phone: "051-8438111 / 051-2827534",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      isFlagship: true,
      expressDelivery: true,
      deliveryFee: 200,
      minOrderAmount: 1000,
      flagshipBadge: "⭐ Flagship Branch #1",
      image: "assets/images/branches/D-Watson_f6.jpg",
      services: ["Pharmacy", "Luxury Cosmetics", "Grocery Essentials", "Optics", "Undergarments", "Surgical"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+F-6+Super+Market+Islamabad",
      whatsapp: "923329716666"
    },
    {
      id: "b_pwd",
      name: "D. Watson PWD Main Boulevard (Flagship)",
      city: "Islamabad",
      area: "PWD / Pakistan Town",
      address: "Main PWD Road, Block B, PWD Society, Islamabad",
      phone: "051-5156072 / 051-5156062",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      isFlagship: true,
      expressDelivery: true,
      deliveryFee: 200,
      minOrderAmount: 1000,
      flagshipBadge: "⭐ Flagship Branch",
      image: "assets/images/branches/pwd.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Baby Care", "Surgical Supplies"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+PWD+Islamabad",
      whatsapp: "923329716662"
    },
    {
      id: "b_ghauri",
      name: "D. Watson Ghouri Town Branch (Flagship)",
      city: "Islamabad",
      area: "Ghouri Town",
      address: "Zohaib Arcade, Main Double Road, Phase 5-A, Ghauri Town, Islamabad",
      phone: "051-8438111",
      timings: "08:00 AM - 12:00 AM Daily",
      is24Hours: false,
      isFlagship: true,
      expressDelivery: true,
      deliveryFee: 200,
      minOrderAmount: 1000,
      flagshipBadge: "⭐ Flagship Branch",
      image: "assets/images/branches/ghauri-town.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Personal Care"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Ghauri+Town+Islamabad",
      whatsapp: "923329716663"
    },
    {
      id: "b_chandni",
      name: "D. Watson Chandni Chowk Branch (Flagship)",
      city: "Rawalpindi",
      area: "Chandni Chowk",
      address: "Al-Fateh Plaza, Chandni Chowk, Murree Road, Rawalpindi",
      phone: "051-4571471 / 051-4571472",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      isFlagship: true,
      expressDelivery: true,
      deliveryFee: 200,
      minOrderAmount: 1000,
      flagshipBadge: "⭐ Flagship Branch",
      image: "assets/images/branches/chandni-chowk.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Surgical Supplies", "Optics"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Chandni+Chowk+Rawalpindi",
      whatsapp: "923329716664"
    },
    {
      id: "b_gujar_khan",
      name: "D. Watson Gujar Khan Branch (Flagship)",
      city: "Other Cities",
      area: "Gujar Khan",
      address: "Ward No. 2, New Barki Jadeed, Main G.T. Road, Gujar Khan",
      phone: "051-3511111 / 051-8438111",
      timings: "08:00 AM - 11:00 PM Daily",
      is24Hours: false,
      isFlagship: true,
      expressDelivery: true,
      deliveryFee: 200,
      minOrderAmount: 1000,
      flagshipBadge: "⭐ Flagship Branch",
      image: "assets/images/branches/gujar-khan.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Baby Care", "Surgical"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Gujar+Khan",
      whatsapp: "923329716665"
    },
    {
      id: "b_g15",
      name: "D. Watson G-15 Markaz Branch (Flagship)",
      city: "Islamabad",
      area: "Sector G-15",
      address: "Commercial Market, JK Housing Society, G-15 Markaz, Islamabad",
      phone: "051-8438111",
      timings: "08:00 AM - 11:00 PM Daily",
      is24Hours: false,
      isFlagship: true,
      expressDelivery: true,
      deliveryFee: 200,
      minOrderAmount: 1000,
      flagshipBadge: "⭐ Flagship Branch",
      image: "assets/images/branches/g15-markaz.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Baby Care"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+G-15+Markaz+Islamabad",
      whatsapp: "923329716667"
    },
    {
      id: "b_attock",
      name: "D. Watson Attock City Branch (Flagship)",
      city: "Other Cities",
      area: "Attock",
      address: "Al Kareem Plaza, Near DHQ Hospital, Attock City",
      phone: "057-2611111 / 051-8438111",
      timings: "08:00 AM - 11:00 PM Daily",
      is24Hours: false,
      isFlagship: true,
      expressDelivery: true,
      deliveryFee: 200,
      minOrderAmount: 1000,
      flagshipBadge: "⭐ Flagship Branch",
      image: "assets/images/branches/attock.jpg",
      services: ["Pharmacy", "Surgical Supplies", "Cosmetics", "Grocery"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Attock",
      whatsapp: "923329716668"
    },

    // === ADDITIONAL NETWORK OUTLETS ===
    {
      id: "b_blue_area",
      name: "Blue Area Mega Flagship Store",
      city: "Islamabad",
      area: "Blue Area",
      address: "94-West, Jinnah Avenue, Block I, Blue Area (Opposite Saudi Pak Tower), Islamabad",
      phone: "051-8438111 / 051-2822222",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      isFlagship: false,
      expressDelivery: true,
      deliveryFee: 200,
      minOrderAmount: 1000,
      flagshipBadge: "⭐ Premier Mega Store",
      image: "assets/images/branches/blue-area.jpg",
      services: ["Pharmacy", "Cosmetics Studio", "Mega Superstore", "Optics Clinic", "Surgical Supplies", "Undergarments"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Blue+Area+Islamabad",
      whatsapp: "923329716669"
    },
    {
      id: "b_f7",
      name: "F-7 Markaz (Din Pavilion)",
      city: "Islamabad",
      area: "Sector F-7",
      address: "Din Pavilion, College Road, F-7 Markaz, Islamabad",
      phone: "051-8444479 / 051-2270425",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/f7-markaz.jpg",
      services: ["Pharmacy", "Luxury Cosmetics", "Personal Care", "Optics"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+F-7+Markaz+Islamabad",
      whatsapp: "923329716671"
    },
    {
      id: "b_f10",
      name: "F-10 Markaz Mega Branch",
      city: "Islamabad",
      area: "Sector F-10",
      address: "Plot 14, Main Double Road, F-10 Markaz, Islamabad",
      phone: "051-2215784 / 051-8438111",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/f10-markaz.jpg",
      services: ["Pharmacy", "Cosmetics Counter", "Superstore", "Optics Clinic", "Surgical Dept"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+F-10+Markaz+Islamabad",
      whatsapp: "923329716672"
    },
    {
      id: "b_f11",
      name: "F-11 Markaz Branch",
      city: "Islamabad",
      area: "Sector F-11",
      address: "Time Square Plaza, Hilal Road, F-11 Markaz, Islamabad",
      phone: "051-8441791 / 051-2102882",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/f11-markaz.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Optics"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+F-11+Markaz+Islamabad",
      whatsapp: "923329716673"
    },
    {
      id: "b_g9",
      name: "G-9 Markaz (Karachi Company)",
      city: "Islamabad",
      area: "Sector G-9",
      address: "Commercial Center, G-9 Markaz, Islamabad",
      phone: "051-2852211 / 051-2852233",
      timings: "08:00 AM - 12:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/g9-markaz.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Surgical Supplies"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+G-9+Markaz+Islamabad",
      whatsapp: "923329716674"
    },
    {
      id: "b_g11",
      name: "G-11 Markaz Branch",
      city: "Islamabad",
      area: "Sector G-11",
      address: "Al-Hameed Center, Main Double Road, G-11 Markaz, Islamabad",
      phone: "051-8438111",
      timings: "08:00 AM - 12:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/g11-markaz.jpg",
      services: ["Pharmacy", "Cosmetics", "Superstore Essentials"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+G-11+Markaz+Islamabad",
      whatsapp: "923329716675"
    },
    {
      id: "b_i8",
      name: "I-8 Markaz Branch",
      city: "Islamabad",
      area: "Sector I-8",
      address: "Pakland Plaza, I-8 Markaz, Islamabad",
      phone: "051-8487354 / 051-8438111",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/i8-markaz.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Optics"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+I-8+Markaz+Islamabad",
      whatsapp: "923329716676"
    },
    {
      id: "b_i10",
      name: "I-10 Markaz Branch",
      city: "Islamabad",
      area: "Sector I-10",
      address: "Al-Aseel Plaza, Korang Road, I-10 Markaz, Islamabad",
      phone: "051-4867777 / 051-8438111",
      timings: "08:00 AM - 12:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/i10-markaz.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Surgical"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+I-10+Markaz+Islamabad",
      whatsapp: "923329716677"
    },
    {
      id: "b_dha",
      name: "DHA Phase 2 Central Branch",
      city: "Islamabad",
      area: "DHA / Bahria",
      address: "Main Commercial Boulevard, Sector A, DHA Phase 2, Islamabad",
      phone: "051-6101287 / 051-8438111",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/dha-phase2.jpg",
      services: ["Pharmacy", "Cosmetics", "Superstore", "Optics", "Surgical"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+DHA+Phase+2+Islamabad",
      whatsapp: "923329716678"
    },
    {
      id: "b_gulberg_isb",
      name: "Gulberg Greens Branch",
      city: "Islamabad",
      area: "Gulberg Greens",
      address: "Business Avenue, Block B, Gulberg Greens, Islamabad",
      phone: "051-8438111",
      timings: "08:00 AM - 12:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/gulberg-greens.jpg",
      services: ["Pharmacy", "Cosmetics Studio", "Superstore", "Optics"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Gulberg+Greens+Islamabad",
      whatsapp: "923329716679"
    },
    {
      id: "b_saddar",
      name: "Saddar Cantonment Branch",
      city: "Rawalpindi",
      area: "Saddar",
      address: "Al-Amin Plaza, Bank Road, Saddar Cantt, Rawalpindi",
      phone: "051-5701070 / 051-5701071",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/saddar-rawalpindi.jpg",
      services: ["Pharmacy", "Optics Lab", "Surgical Hub", "Cosmetics", "Undergarments"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Saddar+Rawalpindi",
      whatsapp: "923329716670"
    },
    {
      id: "b_bahria4",
      name: "Bahria Town Phase 4 Civic Center",
      city: "Rawalpindi",
      area: "Bahria Town",
      address: "Civic Center, Main Boulevard, Phase 4, Bahria Town, Rawalpindi",
      phone: "051-5739999 / 051-8438111",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/bahria-phase4.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Optics Boutique"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Bahria+Town+Phase+4+Rawalpindi",
      whatsapp: "923329716666"
    },
    {
      id: "b_bahria6",
      name: "Bahria Town Phase 6 Branch",
      city: "Rawalpindi",
      area: "Bahria Town",
      address: "Fortune Arcade, Main Boulevard, Phase 6, Bahria Town, Rawalpindi",
      phone: "051-8770601 / 051-8770603",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/bahria-phase6.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Optics"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Bahria+Town+Phase+6",
      whatsapp: "923329716666"
    },
    {
      id: "b_chaklala",
      name: "Chaklala Scheme 3 Branch",
      city: "Rawalpindi",
      area: "Chaklala",
      address: "Commercial Market, Main Road, Chaklala Scheme 3, Rawalpindi",
      phone: "051-5766257 / 051-8438111",
      timings: "08:00 AM - 12:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/chaklala.jpg",
      services: ["Pharmacy", "Cosmetics", "Superstore Essentials"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Chaklala+Scheme+3",
      whatsapp: "923329716666"
    },
    {
      id: "b_lahore",
      name: "Gulberg III Mega Center",
      city: "Lahore",
      area: "Gulberg",
      address: "Main Boulevard, Gulberg III (Near MM Alam Road), Lahore",
      phone: "042-35712345 / 051-8438111",
      timings: "08:00 AM - 01:00 AM Daily",
      is24Hours: false,
      image: "assets/images/branches/gulberg-lahore.jpg",
      services: ["Pharmacy", "Luxury Cosmetics", "Gourmet Supermarket", "Optics", "Surgical"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Gulberg+Lahore",
      whatsapp: "923329716666"
    },
    {
      id: "b_abbottabad",
      name: "Abbottabad Central Branch",
      city: "Other Cities",
      area: "Abbottabad",
      address: "Main Mansehra Road, Near DHQ Hospital, Abbottabad",
      phone: "0992-381111 / 051-8438111",
      timings: "08:00 AM - 11:00 PM Daily",
      is24Hours: false,
      image: "assets/images/branches/abbottabad.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Surgical"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Abbottabad",
      whatsapp: "923329716666"
    },
    {
      id: "b_swat",
      name: "Swat Mingora Branch",
      city: "Other Cities",
      area: "Swat",
      address: "Near Balogram Ground, Main Airport Road, Mingora, Swat",
      phone: "0946-721111 / 051-8438111",
      timings: "08:00 AM - 10:00 PM Daily",
      is24Hours: false,
      image: "assets/images/branches/swat.jpg",
      services: ["Pharmacy", "Superstore", "Cosmetics", "Optics"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Swat",
      whatsapp: "923329716666"
    },
    {
      id: "b_mansehra",
      name: "Mansehra Bypass Branch",
      city: "Other Cities",
      area: "Mansehra",
      address: "Opposite Food Hut, Township Bypass Chowk, Mansehra",
      phone: "0997-301111 / 051-8438111",
      timings: "08:00 AM - 10:00 PM Daily",
      is24Hours: false,
      image: "assets/images/branches/mansehra.jpg",
      services: ["Pharmacy", "Cosmetics", "Superstore", "Surgical"],
      mapUrl: "https://maps.google.com/?q=D.+Watson+Mansehra",
      whatsapp: "923329716666"
    }
  ],

  gallery: [
    {
      id: "g1",
      title: "Store Interior & Product Aisles",
      category: "stores",
      categoryName: "Store Interior",
      image: "assets/images/Shop Inside/gallery-9.jpg",
      description: "Organized, spacious shopping aisles with curated international health and beauty products."
    },
    {
      id: "g2",
      title: "Luxury Cosmetics & Skincare Display",
      category: "cosmetics",
      categoryName: "Cosmetics & Derma",
      image: "assets/images/Shop Inside/gallery-10.jpg",
      description: "Authentic imported skincare, serums, and French dermatologist-recommended derma counters."
    },
    {
      id: "g3",
      title: "Superstore Gourmet Confectionery & Grocery",
      category: "grocery",
      categoryName: "Gourmet Grocery",
      image: "assets/images/Shop Inside/gallery-11.jpg",
      description: "Premium imported confectionery, chocolates, snacks, and daily household groceries."
    },
    {
      id: "g4",
      title: "Personal Care & Infant Essentials Aisle",
      category: "baby",
      categoryName: "Baby & Personal",
      image: "assets/images/Shop Inside/gallery-13.jpg",
      description: "Comprehensive baby nutrition, sensitive wipes, diapers, and gentle infant care products."
    },
    {
      id: "g5",
      title: "24/7 Clinical Pharmacy Dispensing Counter",
      category: "pharmacy",
      categoryName: "Pharmacy & Labs",
      image: "assets/images/Shop Inside/gallery-14.jpg",
      description: "Certified pharmacist dispensing station with strict cold chain storage for life-saving biologicals."
    },
    {
      id: "g6",
      title: "Dermatological Care & Beauty Lounge",
      category: "cosmetics",
      categoryName: "Cosmetics & Derma",
      image: "assets/images/Shop Inside/gallery-15.jpg",
      description: "Dedicated beauty advisors providing personalized skin type matching and original imports."
    },
    {
      id: "g7",
      title: "Haircare, Bath & Body Care Aisle",
      category: "stores",
      categoryName: "Store Interior",
      image: "assets/images/Shop Inside/gallery-16.jpg",
      description: "Top international shampoo, conditioner, body wash, and organic botanical care products."
    },
    {
      id: "g8",
      title: "Original Designer Fragrances & Perfume Bar",
      category: "cosmetics",
      categoryName: "Fragrances & Scents",
      image: "assets/images/Shop Inside/gallery-17.jpg",
      description: "100% original French perfumes, luxury Arabian ouds, and signature colognes."
    },
    {
      id: "g9",
      title: "Hypermarket Snacks & Daily Provisions",
      category: "grocery",
      categoryName: "Gourmet Grocery",
      image: "assets/images/Shop Inside/gallery-18.jpg",
      description: "Wide variety of breakfast cereals, organic beverages, baking supplies, and pantry goods."
    },
    {
      id: "g10",
      title: "Vitamins, Supplements & Wellness Section",
      category: "pharmacy",
      categoryName: "Pharmacy & Wellness",
      image: "assets/images/Shop Inside/gallery-19.jpg",
      description: "Authentic imported multivitamins, immunity boosters, sports nutrition, and herbal remedies."
    },
    {
      id: "g11",
      title: "Household & Lifestyle Essentials Counter",
      category: "stores",
      categoryName: "Store Interior",
      image: "assets/images/Shop Inside/gallery-20.jpg",
      description: "Everyday household convenience goods, toiletries, and cleaning care supplies."
    },
    {
      id: "g12",
      title: "Kids Toys & Educational Games Gallery",
      category: "baby",
      categoryName: "Kids World",
      image: "assets/images/Shop Inside/gallery-22.jpg",
      description: "Safe educational toys, board games, creative art supplies, and children's gifts."
    },
    {
      id: "g13",
      title: "Golden Rose Color Cosmetics Collection",
      category: "cosmetics",
      categoryName: "Color Cosmetics",
      image: "assets/images/Shop Inside/GoldenRose-179.jpg",
      description: "Flawless pigments, silky blushes, and velvet matte lip products."
    },
    {
      id: "g14",
      title: "Anua Korean Skincare & Heartleaf Toners",
      category: "cosmetics",
      categoryName: "K-Beauty",
      image: "assets/images/Shop Inside/Section-Image-anua.jpg",
      description: "Soothing natural heartleaf Korean skincare formulas for sensitive skin."
    },
    {
      id: "g15",
      title: "COSRX Snail Mucin & Derm Essentials",
      category: "cosmetics",
      categoryName: "K-Beauty",
      image: "assets/images/Shop Inside/Section-Image-cosrx.jpg",
      description: "World-famous Korean COSRX Advanced Snail 96 Mucin Power Essence & barrier repair."
    },
    {
      id: "g16",
      title: "Skin1004 Madagascar Centella Serums",
      category: "cosmetics",
      categoryName: "K-Beauty",
      image: "assets/images/Shop Inside/Section-Image-madagascar-centella.jpg",
      description: "Pure Madagascar Centella Asiatica ampoules and gentle soothing formulations."
    },
    {
      id: "g17",
      title: "Maru Derm Active Skincare Range",
      category: "cosmetics",
      categoryName: "Derma Care",
      image: "assets/images/Shop Inside/Maru_Derm_Category_Image.jpg",
      description: "High-performance clinical serums, barrier creams, and clarifying toners."
    },
    {
      id: "g18",
      title: "Urban Care Botanical Haircare Lounge",
      category: "cosmetics",
      categoryName: "Hair Care",
      image: "assets/images/Shop Inside/Urban_Care_Category_Image.jpg",
      description: "Biotin, caffeine, and keratin specialized hair therapies for volume and damage repair."
    },
    {
      id: "g19",
      title: "The Purest Solutions High-Potency Serums",
      category: "cosmetics",
      categoryName: "Derma Care",
      image: "assets/images/Shop Inside/The_Purest_Solutions_Category_Image.jpg",
      description: "Niacinamide, Caffeine, Hyaluronic Acid, and Vitamin C super-charged skin solutions."
    },
    {
      id: "g20",
      title: "Comfort Lingerie & Innerwear Boutique",
      category: "stores",
      categoryName: "Apparel Lounge",
      image: "assets/images/Shop Inside/collection-banner-lingerie.jpg",
      description: "Premium imported women's innerwear, comfort loungewear, and daily soft apparel."
    },
    {
      id: "g21",
      title: "Makeup & Beauty Counter Highlights",
      category: "cosmetics",
      categoryName: "Beauty Bar",
      image: "assets/images/Shop Inside/Makeup_1.jpg",
      description: "Latest seasonal collections from European and American beauty houses."
    },
    {
      id: "g22",
      title: "Original Luxury Fragrance Collection",
      category: "cosmetics",
      categoryName: "Fragrances",
      image: "assets/images/Shop Inside/Perfume_1.jpg",
      description: "Signature designer perfumes, concentrated attars, and luxury ouds."
    },
    {
      id: "g23",
      title: "Bioblas Organic Botanical Hair Therapy",
      category: "cosmetics",
      categoryName: "Hair Care",
      image: "assets/images/Shop Inside/15.BIOBLAS-ONARICI-REPAIRING-VOLUMIZING-SHAMPOO-360ML.jpg",
      description: "Herbal anti-hair loss and restorative botanical shampoos."
    },
    {
      id: "g24",
      title: "L'Oreal Professional Hair Repair Masques",
      category: "cosmetics",
      categoryName: "Hair Care",
      image: "assets/images/Shop Inside/34.LOREAL-PRO-ABSOLUT-REPAIR-MASQUE-250ML-PROTEIN_OMEGA-9-Specs.png",
      description: "Deep nourishing protein masques for chemically treated and dry hair."
    },
    {
      id: "g25",
      title: "Lifestyle Accessories & Premium Watches",
      category: "stores",
      categoryName: "Lifestyle",
      image: "assets/images/Shop Inside/watches_1.jpg",
      description: "Elegant wristwatches, sunglasses, and personal lifestyle gifts."
    },
    {
      id: "g26",
      title: "Superstore Department Floor Overview",
      category: "stores",
      categoryName: "Store Interior",
      image: "assets/images/Shop Inside/gallery-25.jpg",
      description: "Modern retail environment designed for seamless family shopping across departments."
    },
    {
      id: "g27",
      title: "Flagship Mega Store Architecture",
      category: "stores",
      categoryName: "Store Facade",
      image: "assets/images/store_flagship.jpg",
      description: "D. Watson's multi-level flagship superstore in Jinnah Avenue, Blue Area Islamabad."
    },
    {
      id: "g28",
      title: "Optics Clinic & Designer Eyewear Boutique",
      category: "stores",
      categoryName: "Optics & Eye Care",
      image: "assets/images/optics.jpg",
      description: "Equipped with computerized refraction autorefractometers and trending designer frames."
    }
  ],

  // 8 Official Popular Categories
  categories: [
    {
      id: "cat_medicines",
      name: "Medicines & Pharmacy",
      icon: "fa-solid fa-pills",
      colorClass: "cat-medicines",
      link: "departments.html?dept=pharmacy",
      deptId: "pharmacy"
    },
    {
      id: "cat_vitamins",
      name: "Vitamins & Nutrition",
      icon: "fa-solid fa-bottle-droplet",
      colorClass: "cat-supplements",
      link: "departments.html?dept=supplements",
      deptId: "supplements"
    },
    {
      id: "cat_babycare",
      name: "Baby & Mother Care",
      icon: "fa-solid fa-baby",
      colorClass: "cat-baby",
      link: "departments.html?dept=babycare",
      deptId: "babycare"
    },
    {
      id: "cat_skincare",
      name: "Cosmetics & Skincare",
      icon: "fa-solid fa-wand-magic-sparkles",
      colorClass: "cat-skincare",
      link: "departments.html?dept=cosmetics",
      deptId: "cosmetics"
    },
    {
      id: "cat_optics",
      name: "Optics & Eyewear",
      icon: "fa-solid fa-glasses",
      colorClass: "cat-devices",
      link: "departments.html?dept=optics",
      deptId: "optics"
    },
    {
      id: "cat_surgical",
      name: "Hospital & Surgical",
      icon: "fa-solid fa-stethoscope",
      colorClass: "cat-personal",
      link: "departments.html?dept=surgical",
      deptId: "surgical"
    },
    {
      id: "cat_perfumes",
      name: "Luxury Fragrances",
      icon: "fa-solid fa-spray-can-sparkles",
      colorClass: "cat-fragrances",
      link: "departments.html?dept=perfumes",
      deptId: "perfumes"
    },
    {
      id: "cat_superstore",
      name: "Gourmet Superstore",
      icon: "fa-solid fa-basket-shopping",
      colorClass: "cat-superstore",
      link: "departments.html?dept=grocery",
      deptId: "grocery"
    }
  ],

  // Official Trusted Partner Brands
  trustedBrands: [
    {
      id: "tb_abbott",
      name: "Abbott",
      category: "Nutrition & Pharma",
      icon: "fa-solid fa-capsules",
      isVerified: true
    },
    {
      id: "tb_gsk",
      name: "GSK",
      category: "Global Healthcare",
      icon: "fa-solid fa-shield-virus",
      isVerified: true
    },
    {
      id: "tb_cerave",
      name: "CeraVe",
      category: "Dermatological Care",
      icon: "fa-solid fa-spa",
      isVerified: true
    },
    {
      id: "tb_getz",
      name: "Getz Pharma",
      category: "Generic & Branded Rx",
      icon: "fa-solid fa-tablets",
      isVerified: true
    },
    {
      id: "tb_cetaphil",
      name: "Cetaphil",
      category: "Sensitive Skincare",
      icon: "fa-solid fa-droplet",
      isVerified: true
    },
    {
      id: "tb_ordinary",
      name: "The Ordinary",
      category: "Clinical Formulations",
      icon: "fa-solid fa-vial",
      isVerified: true
    },
    {
      id: "tb_hilton",
      name: "Hilton Pharma",
      category: "Therapeutic Medicines",
      icon: "fa-solid fa-prescription-bottle-medical",
      isVerified: true
    },
    {
      id: "tb_aveeno",
      name: "Aveeno",
      category: "Active Naturals Care",
      icon: "fa-solid fa-seedling",
      isVerified: true
    },
    {
      id: "tb_beurer",
      name: "Beurer",
      category: "German Health Devices",
      icon: "fa-solid fa-heart-pulse",
      isVerified: true
    },
    {
      id: "tb_nutraxin",
      name: "Nutraxin",
      category: "Vitamins & Wellness",
      icon: "fa-solid fa-apple-whole",
      isVerified: true
    }
  ],

  faqs: [
    {
      q: "How can I verify medicine availability or send my prescription?",
      a: "You can click the 'Upload Prescription' button on our website or text our WhatsApp team directly at 0332-9716666. Our registered pharmacists will verify stock immediately and assist you with fast home delivery.",
      cat: "Pharmacy"
    },
    {
      q: "Are all medicines, skincare, and perfumes 100% genuine at D. Watson?",
      a: "Absolutely. D. Watson has maintained an uncompromising zero-tolerance counterfeit policy for over 50 years. We source pharmaceuticals and cosmetics directly from authorized global manufacturers and licensed national distributors under strict cold-chain compliance.",
      cat: "Authenticity"
    },
    {
      q: "Which D. Watson branches operate 24 Hours a day?",
      a: "Our Blue Area Flagship, F-6 Super Market, F-10 Markaz, F-11 Markaz, DHA Phase 2 Islamabad, Saddar Rawalpindi, Chandni Chowk Rawalpindi, and Gulberg Lahore branches operate 24 hours a day, 7 days a week, including all public holidays.",
      cat: "Branches"
    },
    {
      q: "Do you offer express home delivery for medicines and superstore goods?",
      a: "Yes! We offer prompt home delivery across Islamabad, Rawalpindi, and Lahore. Simply place your order via WhatsApp (0332-9716666) or call our centralized helpline (051-8438111).",
      cat: "Delivery"
    },
    {
      q: "Can I get a computerized eye exam at D. Watson Optics?",
      a: "Yes, our certified optometrists provide free computerized eye refractions and precision vision testing at our optical branches. You can walk in anytime or reserve an appointment via WhatsApp.",
      cat: "Optics"
    }
  ]
};

// LocalStorage Storage Key (v19 - Master Stable Storage Key)
const STORAGE_KEY = "dwatson_site_data_v19";

/**
 * Get current site data (from LocalStorage or fallback to default)
 */
function getSiteData() {
  try {
    // 1. One-time eviction of stale legacy storage keys to free browser quota (5MB limit)
    // and permanently prevent old 46 products from ever resurrecting.
    try {
      const staleKeys = [
        "dwatson_site_data_v18", "dwatson_site_data_v17", "dwatson_site_data_v16",
        "dwatson_site_data_v15", "dwatson_site_data_v14", "dwatson_site_data_v13",
        "dwatson_site_data_v12", "dwatson_site_data_v11", "dwatson_site_data_v10",
        "dwatson_site_data_v9", "dwatson_site_data_v8", "dwatson_site_data_v7",
        "dwatson_site_data_v6", "dwatson_site_data_v5", "dwatson_site_data_v4",
        "dwatson_site_data_v3", "dwatson_site_data_v2", "dwatson_site_data_v1",
        "dwatson_site_data"
      ];
      for (const k of staleKeys) {
        if (typeof localStorage !== "undefined" && localStorage.getItem(k) !== null) {
          localStorage.removeItem(k);
        }
      }
    } catch (evictErr) {}

    let saved = (typeof localStorage !== "undefined") ? localStorage.getItem(STORAGE_KEY) : null;
    if (!saved && typeof localStorage !== "undefined") {
      try {
        const cc = localStorage.getItem("dwatson_cloud_cache_v1");
        if (cc) {
          const parsedCc = JSON.parse(cc);
          if (parsedCc && parsedCc.data) {
            saved = JSON.stringify(parsedCc.data);
            localStorage.setItem(STORAGE_KEY, saved);
          }
        }
      } catch (e) {}
    }

    if (saved) {
      const parsed = JSON.parse(saved);

      // Products: use saved products if they exist, otherwise always fall back to the hardcoded defaults.
      // Admin-deleted products are honoured only when localStorage actually has a non-empty products array.
      const savedProducts = Array.isArray(parsed.products) ? parsed.products : null;
      const resolvedProducts = (savedProducts && savedProducts.length > 0)
        ? savedProducts
        : DEFAULT_SITE_DATA.products;

      return {
        ...DEFAULT_SITE_DATA,
        ...parsed,
        company: { 
          ...DEFAULT_SITE_DATA.company, 
          ...(parsed.company || {}),
          deliveryDefaultFee: (parsed.company && parsed.company.deliveryDefaultFee !== undefined) ? parsed.company.deliveryDefaultFee : DEFAULT_SITE_DATA.company.deliveryDefaultFee,
          deliveryMinOrder: (parsed.company && parsed.company.deliveryMinOrder !== undefined) ? parsed.company.deliveryMinOrder : DEFAULT_SITE_DATA.company.deliveryMinOrder,
          deliveryFreeThreshold: (parsed.company && parsed.company.deliveryFreeThreshold !== undefined) ? parsed.company.deliveryFreeThreshold : DEFAULT_SITE_DATA.company.deliveryFreeThreshold,
          historyTimeline: Array.isArray(parsed.company && parsed.company.historyTimeline) && parsed.company.historyTimeline.length ? parsed.company.historyTimeline : DEFAULT_SITE_DATA.company.historyTimeline,
          adminAuth: {
            ...DEFAULT_SITE_DATA.company.adminAuth,
            ...((parsed.company && parsed.company.adminAuth) || {})
          }
        },
        heroSlides: (Array.isArray(parsed.heroSlides) && parsed.heroSlides.length) ? parsed.heroSlides : DEFAULT_SITE_DATA.heroSlides,
        management: (Array.isArray(parsed.management) && parsed.management.length) ? parsed.management : DEFAULT_SITE_DATA.management,
        departments: (Array.isArray(parsed.departments) && parsed.departments.length) ? parsed.departments.map(d => {
          const def = DEFAULT_SITE_DATA.departments.find(dd => dd.id === d.id);
          return {
            ...(def || {}),
            ...d,
            image: d.image || (def ? def.image : "assets/images/Shop Inside/Medicine.jpeg")
          };
        }) : DEFAULT_SITE_DATA.departments,
        categories: (Array.isArray(parsed.categories) && parsed.categories.length) ? parsed.categories : DEFAULT_SITE_DATA.categories,
        brands: (Array.isArray(parsed.brands) && parsed.brands.length) ? parsed.brands : (DEFAULT_SITE_DATA.brands || []),
        // PRODUCTS: Admin changes in localStorage take priority.
        // If localStorage products array is empty/missing, always show the hardcoded defaults.
        products: resolvedProducts,
        // STRICT USER AUTHORITY FOR BRANCHES:
        // Strictly honor the saved image and branch properties without any overriding harvester.
        branches: Array.isArray(parsed.branches) && parsed.branches.length ? parsed.branches.map(b => {
          const def = DEFAULT_SITE_DATA.branches.find(db => db.id === b.id);
          return {
            ...b,
            image: b.image || (def ? def.image : "assets/images/store_flagship.jpg"),
            expressDelivery: b.expressDelivery !== undefined ? b.expressDelivery : (def ? def.expressDelivery : Boolean(b.isFlagship)),
            deliveryFee: b.deliveryFee !== undefined ? b.deliveryFee : (def?.deliveryFee || 200),
            minOrderAmount: b.minOrderAmount !== undefined ? b.minOrderAmount : (def?.minOrderAmount || 1000)
          };
        }) : DEFAULT_SITE_DATA.branches,
        gallery: Array.isArray(parsed.gallery) && parsed.gallery.length ? parsed.gallery : DEFAULT_SITE_DATA.gallery,
        faqs: Array.isArray(parsed.faqs) && parsed.faqs.length ? parsed.faqs : DEFAULT_SITE_DATA.faqs
      };
    }
  } catch (e) {
    console.warn("Error loading site data from localStorage, using default:", e);
  }
  return DEFAULT_SITE_DATA;
}

/**
 * Save updated site data to LocalStorage AND push to JSONBin cloud.
 * Cloud (JSONBin) is now the master — all devices get the update.
 */
function saveSiteData(data) {
  try {
    data.lastModified = Date.now();
    const jsonStr = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, jsonStr);
    window.dispatchEvent(new Event("siteDataUpdated"));

    // Push to JSONBin cloud so ALL devices get the update immediately
    if (typeof window.CloudDB !== "undefined" && typeof window.CloudDB.saveAllData === "function") {
      window.CloudDB.saveAllData(data).catch(err => {
        console.warn("Cloud push failed (data still saved locally):", err);
      });
    } else {
      // Fallback: push via /api/site-data if CloudDB not loaded yet
      fetch("/api/site-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: data }),
        keepalive: true
      }).catch(() => null);
    }
    return true;
  } catch (e) {
    console.error("Failed to save site data:", e);
    if (e.name === "QuotaExceededError" || e.code === 22 || e.code === 1014) {
      if (typeof showToast === "function") {
        showToast("Storage quota reached! Please use Cloudinary image URLs instead of local images.", "error");
      }
    }
    return false;
  }
}

/**
 * Fetch latest site data from JSONBin cloud and sync to localStorage.
 * Cloud is always the master — localStorage is just a local cache.
 */
async function fetchSiteDataFromCloud() {
  try {
    // Use CloudDB if available (loaded via cloud-db.js)
    if (typeof window.CloudDB !== "undefined" && typeof window.CloudDB.syncCloudToLocal === "function") {
      await window.CloudDB.syncCloudToLocal();
      return;
    }

    // Fallback: fetch via /api/site-data proxy
    const res = await fetch("/api/site-data").catch(() => null);
    if (res && res.ok) {
      const json = await res.json().catch(() => null);
      if (json && json.success && json.data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
        window.dispatchEvent(new Event("siteDataUpdated"));
        console.log("☁️ Site data synced from cloud.");
      }
    }
  } catch (e) {
    // Silent — page still works from localStorage cache
  }
}

// Auto-sync cloud data on every page load
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchSiteDataFromCloud);
  } else {
    fetchSiteDataFromCloud();
  }
}

/**
 * Universal Cloudinary & Custom Storage Scanner
 * Scans all historical localStorage & sessionStorage slots to recover ANY lost products,
 * branch photos, hero slides, or departments uploaded to Cloudinary.
 */
function scanAllStorageForCloudinaryAssets() {
  const recovered = {
    products: [],
    branches: [],
    heroSlides: [],
    departments: []
  };

  const seenProdIds = new Set();
  const seenProdImages = new Set();
  const seenBranchImages = new Map();

  function inspectCandidate(obj, keyName) {
    if (!obj || typeof obj !== "object") return;

    // Check products
    if (Array.isArray(obj.products)) {
      obj.products.forEach(p => {
        if (!p || !p.name) return;
        const img = p.image || "";
        const isCloudinary = typeof img === "string" && (img.includes("cloudinary.com") || img.includes("iili.io") || img.includes("imgur.com"));
        const isCustom = !/^p([1-9]|[1-4][0-9])$/.test(p.id) || p.isCustom;
        if ((isCloudinary || isCustom) && !seenProdIds.has(p.id) && !seenProdImages.has(img)) {
          seenProdIds.add(p.id);
          if (img) seenProdImages.add(img);
          recovered.products.push({ ...p, sourceKey: keyName });
        }
      });
    }

    // Check branches
    if (Array.isArray(obj.branches)) {
      obj.branches.forEach(b => {
        if (!b || !b.id) return;
        const img = b.image || "";
        const isCloudinary = typeof img === "string" && (img.includes("cloudinary.com") || img.includes("iili.io") || img.includes("imgur.com"));
        if (isCloudinary && !seenBranchImages.has(b.id)) {
          seenBranchImages.set(b.id, img);
          recovered.branches.push({ id: b.id, name: b.name, image: img, sourceKey: keyName });
        }
      });
    }

    // Check hero slides
    if (Array.isArray(obj.heroSlides)) {
      obj.heroSlides.forEach((s, idx) => {
        if (!s) return;
        const img = s.image || "";
        if (typeof img === "string" && img.includes("cloudinary.com")) {
          recovered.heroSlides.push({ ...s, sourceKey: keyName });
        }
      });
    }

    // Check departments
    if (Array.isArray(obj.departments)) {
      obj.departments.forEach(d => {
        if (!d) return;
        const img = d.image || "";
        if (typeof img === "string" && img.includes("cloudinary.com")) {
          recovered.departments.push({ ...d, sourceKey: keyName });
        }
      });
    }
  }

  try {
    // Scan localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith("dwatson") || k.includes("site_data") || k.includes("custom"))) {
        try {
          const raw = localStorage.getItem(k);
          if (raw) inspectCandidate(JSON.parse(raw), k);
        } catch (e) {}
      }
    }

    // Scan sessionStorage
    if (typeof sessionStorage !== "undefined") {
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && (k.startsWith("dwatson") || k.includes("site_data"))) {
          try {
            const raw = sessionStorage.getItem(k);
            if (raw) inspectCandidate(JSON.parse(raw), "sessionStorage:" + k);
          } catch (e) {}
        }
      }
    }
  } catch (err) {
    console.warn("Storage scan notice:", err);
  }

  return recovered;
}

if (typeof window !== "undefined") {
  window.scanAllStorageForCloudinaryAssets = scanAllStorageForCloudinaryAssets;
}

/**
 * Reset site data to factory defaults
 */
function resetSiteData() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("siteDataUpdated"));
}

function exportSiteDataAsCode() {
  const data = getSiteData();
  const code = `/**\n * D. Watson Chemist & Superstore - Central Data Store\n * Auto-generated from Admin Studio on ${new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })}\n */\n\nconst DEFAULT_SITE_DATA = ${JSON.stringify(data, null, 2)};\n`;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      if (typeof showToast === "function") {
        showToast("Code copied to clipboard! You can paste into js/data.js.", "success");
      } else {
        alert("Site Data code copied to clipboard! You can paste it directly into js/data.js.");
      }
    }).catch(() => {
      downloadCodeAsFile(code);
    });
  } else {
    downloadCodeAsFile(code);
  }
}

function downloadCodeAsFile(code) {
  const blob = new Blob([code], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `data-backup-${new Date().toISOString().slice(0, 10)}.js`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export site data as JSON string or download file
 */
function exportSiteDataJSON() {
  const data = getSiteData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dwatson-site-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import site data from JSON string
 */
function importSiteDataJSON(jsonStr) {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.company || !data.heroSlides || !data.branches) {
      throw new Error("Invalid format: Required fields are missing.");
    }
    saveSiteData(data);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Unified Inquiries, Product Orders & Prescription Storage Helpers
 */
const INQUIRIES_STORAGE_KEY = "dwatson_all_inquiries";
const PRESCRIPTION_STORAGE_KEY = "dwatson_prescription_orders";

function getCustomerInquiries() {
  try {
    const raw = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {
    console.warn("Error reading inquiries records:", e);
  }

  // Fallback: check legacy prescription storage if new storage is empty
  const legacyRx = getPrescriptionsData();
  if (legacyRx && legacyRx.length) {
    return legacyRx.map(item => ({
      ...item,
      type: item.type || "prescription"
    }));
  }

  return [];
}

/**
 * Real-time Cloud Sync Configuration
 */
const CLOUD_SYNC_TOPIC = "dwatson_pharmacy_inquiries_2026";
const CLOUD_SYNC_URL = `https://ntfy.sh/${CLOUD_SYNC_TOPIC}`;

async function pushInquiryToCloud(inquiry) {
  try {
    const isProduct = inquiry.type === "product";
    const titleText = isProduct 
      ? `New Product Order: ${inquiry.productName} (${inquiry.price || 'Inquire'})` 
      : `New Prescription: ${inquiry.name || 'Customer'} (${inquiry.branch || 'Branch'})`;

    const headers = {
      "Title": titleText.replace(/[^\x00-\x7F]/g, ""),
      "Priority": "high",
      "Tags": isProduct ? "shopping_bags,package" : "pill,medical_symbol"
    };

    if (inquiry.photoUrl) {
      headers["Click"] = inquiry.photoUrl;
      headers["Attach"] = inquiry.photoUrl;
    }

    const payload = JSON.stringify(inquiry);

    // Use fetch with keepalive for guaranteed mobile delivery during page switch
    const res = await fetch(CLOUD_SYNC_URL, {
      method: "POST",
      headers: headers,
      body: payload,
      keepalive: true
    });
    console.log("Inquiry pushed to Real-Time Cloud Sync:", inquiry.id);
    return res.ok;
  } catch (err) {
    console.warn("Cloud sync push error:", err);
    return false;
  }
}

async function saveCustomerInquiry(item) {
  try {
    const list = getCustomerInquiries();
    list.unshift(item);
    // Keep up to 150 recent records
    const trimmed = list.slice(0, 150);
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(trimmed));
    
    window.dispatchEvent(new Event("inquiriesDataUpdated"));
    window.dispatchEvent(new Event("prescriptionDataUpdated"));

    // Broadcast live across all devices via Cloud Database Sync
    await pushInquiryToCloud(item);
    return true;
  } catch (e) {
    console.error("Error saving customer inquiry:", e);
    return false;
  }
}

const DELETED_INQUIRIES_KEY = "dwatson_deleted_inquiries";

function getDeletedInquiryIds() {
  try {
    const raw = localStorage.getItem(DELETED_INQUIRIES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) {}
  return [];
}

function markInquiryDeleted(id) {
  if (!id) return;
  try {
    const deleted = getDeletedInquiryIds();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(DELETED_INQUIRIES_KEY, JSON.stringify(deleted.slice(-300)));
    }
  } catch (e) {}
}

function isDeletedInquiry(id) {
  if (!id) return false;
  const deleted = getDeletedInquiryIds();
  return deleted.includes(id);
}

function deleteCustomerInquiry(id) {
  try {
    markInquiryDeleted(id);
    let list = getCustomerInquiries();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(list));
    
    // Also remove from legacy prescription list if exists
    let rxList = getPrescriptionsData();
    rxList = rxList.filter(item => item.id !== id);
    localStorage.setItem(PRESCRIPTION_STORAGE_KEY, JSON.stringify(rxList));

    window.dispatchEvent(new Event("inquiriesDataUpdated"));
    window.dispatchEvent(new Event("prescriptionDataUpdated"));
    return true;
  } catch (e) {
    console.error("Error deleting inquiry:", e);
    return false;
  }
}

function clearAllCustomerInquiries() {
  try {
    const list = getCustomerInquiries();
    list.forEach(item => {
      if (item.id) markInquiryDeleted(item.id);
    });
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(PRESCRIPTION_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event("inquiriesDataUpdated"));
    window.dispatchEvent(new Event("prescriptionDataUpdated"));
    return true;
  } catch (e) {
    console.error("Error clearing inquiries:", e);
    return false;
  }
}

// Legacy wrappers for prescription backward compatibility
function getPrescriptionsData() {
  try {
    const raw = localStorage.getItem(PRESCRIPTION_STORAGE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {
    console.warn("Error reading prescription records:", e);
  }
  return [];
}

async function savePrescriptionOrder(order) {
  try {
    const list = getPrescriptionsData();
    list.unshift(order);
    const trimmed = list.slice(0, 100);
    localStorage.setItem(PRESCRIPTION_STORAGE_KEY, JSON.stringify(trimmed));
    
    // Also save in unified inquiries & push to cloud sync
    await saveCustomerInquiry({
      ...order,
      type: "prescription"
    });

    window.dispatchEvent(new Event("prescriptionDataUpdated"));
    return true;
  } catch (e) {
    console.error("Error saving prescription order:", e);
    return false;
  }
}

function deletePrescriptionOrder(orderId) {
  deleteCustomerInquiry(orderId);
  try {
    let list = getPrescriptionsData();
    list = list.filter(item => item.id !== orderId);
    localStorage.setItem(PRESCRIPTION_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("prescriptionDataUpdated"));
    return true;
  } catch (e) {
    console.error("Error deleting prescription order:", e);
    return false;
  }
}

