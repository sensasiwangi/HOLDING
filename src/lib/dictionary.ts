// ═══════════════════════════════════════════════════════════════
// Bilingual Dictionary - PT Sensasi Wangi Indonesia
// ═══════════════════════════════════════════════════════════════

export type Lang = "id" | "en";

export const dict = {
  // ── Navigation ───────────────────────────────────────────────
  nav: {
    about: { id: "Tentang", en: "About" },
    divisions: { id: "Divisi", en: "Divisions" },
    brands: { id: "Brand", en: "Brands" },
    events: { id: "Event", en: "Events" },
    marketplace: { id: "Marketplace", en: "Marketplace" },
    investor: { id: "Investor", en: "Investor" },
    dashboard: { id: "Dashboard", en: "Dashboard" },
    contact: { id: "Kontak", en: "Contact" },
    downloadPdf: { id: "Unduh PDF", en: "Download PDF" },
  },

  // ── Hero Section ─────────────────────────────────────────────
  hero: {
    eyebrow: {
      id: "Fragrance commerce, experience, and ecosystem",
      en: "Fragrance commerce, experience, and ecosystem",
    },
    title: {
      id: "Holding parfum Indonesia yang menghubungkan produk, pengalaman, event, dan digital marketplace.",
      en: "Indonesian fragrance holding that connects products, experiences, events, and a digital marketplace.",
    },
    subtitle: {
      id: "PT Sensasi Wangi Indonesia mengembangkan ekosistem fragrance melalui SWI Store, Fragrantions, brand parfum, produksi, edukasi, komunitas, dan marketplace sensasiwangi.id.",
      en: "PT Sensasi Wangi Indonesia develops a fragrance ecosystem through SWI Store, Fragrantions, perfume brands, production, education, community, and the sensasiwangi.id marketplace.",
    },
    ctaInvestor: { id: "Lihat Peluang Investor", en: "View Investor Opportunity" },
    ctaDivisions: { id: "Lihat Struktur Holding", en: "View Holding Structure" },
  },

  // ── Signal Cards ─────────────────────────────────────────────
  signal: {
    tag: { id: "Company Profile", en: "Company Profile" },
    title: { id: "Satu holding, beberapa mesin pertumbuhan.", en: "One holding, multiple growth engines." },
    subtitle: {
      id: "SWI dirancang agar retail offline, event, brand, marketplace, dan data customer saling memperkuat.",
      en: "SWI is designed so offline retail, events, brands, marketplace, and customer data reinforce each other.",
    },
    store: { id: "Experience dan transaksi offline", en: "Offline experience & transactions" },
    event: { id: "Komunitas dan partnership", en: "Community & partnerships" },
    brand: { id: "Produk dan produksi", en: "Products & production" },
    web: { id: "Marketplace dan repeat order", en: "Marketplace & repeat orders" },
  },

  // ── About Section ────────────────────────────────────────────
  about: {
    eyebrow: { id: "Tentang Perusahaan", en: "About the Company" },
    title: { id: "Membangun Ekosistem Parfum Indonesia", en: "Building the Indonesian Fragrance Ecosystem" },
    p1: {
      id: "PT Sensasi Wangi Indonesia (SWI) adalah holding company yang mengintegrasikan seluruh rantai nilai industri parfum — dari produksi dan brand, pengalaman retail dan edukasi, event nasional, hingga marketplace digital.",
      en: "PT Sensasi Wangi Indonesia (SWI) is a holding company that integrates the entire fragrance industry value chain — from production and branding, retail and education experiences, national events, to a digital marketplace.",
    },
    p2: {
      id: "Didirikan dengan visi menjadikan Indonesia sebagai pemain utama di industri fragrance global, SWI membangun sinergi antar divisi untuk menciptakan pengalaman parfum yang autentik dan berkelanjutan.",
      en: "Founded with a vision to position Indonesia as a major player in the global fragrance industry, SWI builds cross-division synergy to create authentic and sustainable fragrance experiences.",
    },
    mission: { id: "Misi Kami", en: "Our Mission" },
    missionText: {
      id: "Menjadikan Indonesia sebagai hub kreasi parfum melalui inovasi produk, edukasi, dan teknologi.",
      en: "To establish Indonesia as a fragrance creation hub through product innovation, education, and technology.",
    },
    vision: { id: "Visi Kami", en: "Our Vision" },
    visionText: {
      id: "Ekosistem parfum terdepan di Asia Tenggara yang menghubungkan kreator, penggemar, dan investor.",
      en: "The leading fragrance ecosystem in Southeast Asia connecting creators, enthusiasts, and investors.",
    },
  },

  // ── Divisions Section ────────────────────────────────────────
  divisions: {
    eyebrow: { id: "Struktur Holding", en: "Holding Structure" },
    title: { id: "Enam Divisi, Satu Ekosistem", en: "Six Divisions, One Ecosystem" },
    subtitle: {
      id: "Setiap divisi beroperasi sebagai unit bisnis mandiri namun saling terhubung dalam ekosistem yang memperkuat.",
      en: "Each division operates as an independent business unit yet is interconnected within a reinforcing ecosystem.",
    },
    office: { id: "Holding Office", en: "Holding Office" },
    officeDesc: {
      id: "Legal perusahaan, keuangan, business plan, strategi korporat, brand assets, dan investor relations.",
      en: "Corporate legal, finance, business plan, corporate strategy, brand assets, and investor relations.",
    },
    store: { id: "SWI Store & Pengalaman Offline", en: "SWI Store & Offline Experience" },
    storeDesc: {
      id: "Toko retail parfum, kelas parfumer, kelas regular, customer experience, dan AI Mix.",
      en: "Perfume retail store, perfumery classes, regular classes, customer experience, and AI Mix.",
    },
    event: { id: "Event Organizer & Fragrantions", en: "Event Organizer & Fragrantions" },
    eventDesc: {
      id: "Pameran dan roadshow parfum nasional — Fragrantions Expo, Road to Fragrantions, sponsor, tenant, dan partnership.",
      en: "National fragrance expos & roadshows — Fragrantions Expo, Road to Fragrantions, sponsors, tenants, and partnerships.",
    },
    production: { id: "Production & Brands", en: "Production & Brands" },
    productionDesc: {
      id: "Larc-en-Scent, Nuscentza, Pixel Potion, pengembangan produk, bahan baku, formula, packaging, dan katalog.",
      en: "Larc-en-Scent, Nuscentza, Pixel Potion, product development, raw materials, formulas, packaging, and catalog.",
    },
    digital: { id: "Digital Systems & AI", en: "Digital Systems & AI" },
    digitalDesc: {
      id: "AppSheet, Google AI Studio, AI perfume profile, internal automation, database customer, dan dashboard data.",
      en: "AppSheet, Google AI Studio, AI perfume profile, internal automation, customer database, and data dashboard.",
    },
    marketing: { id: "Marketing & Community", en: "Marketing & Community" },
    marketingDesc: {
      id: "WhatsApp Channel, Podcast, quisioner, media sosial, dan program loyalitas komunitas parfum.",
      en: "WhatsApp Channel, Podcast, questionnaires, social media, and fragrance community loyalty programs.",
    },
    webMarketplace: { id: "WEB Marketplace", en: "WEB Marketplace" },
    webMarketplaceDesc: {
      id: "Platform marketplace sensasiwangi.id: katalog produk, booking, checkout, customer support, analytics, dan growth.",
      en: "sensasiwangi.id marketplace platform: product catalog, bookings, checkout, customer support, analytics, and growth.",
    },
  },

  // ── Brands Section ───────────────────────────────────────────
  brands: {
    eyebrow: { id: "Portfolio Brand", en: "Brand Portfolio" },
    title: { id: "Brand Parfum Buatan Sendiri", en: "In-House Perfume Brands" },
    subtitle: {
      id: "Tiga brand parfum yang dikembangkan dengan karakter unik dan positioning berbeda.",
      en: "Three perfume brands developed with unique characters and different positioning.",
    },
    larcName: { id: "L'arc~en~Scent", en: "L'arc~en~Scent" },
    larcDesc: {
      id: "Brand parfum premium yang terinspirasi dari seni dan kreativitas. Menghadirkan fragrance experience yang personal dan artistik.",
      en: "A premium perfume brand inspired by art and creativity. Delivering a personal and artistic fragrance experience.",
    },
    nuscentzaName: { id: "Nuscentza", en: "Nuscentza" },
    nuscentzaDesc: {
      id: "Brand parfum dengan konsep keindahan Nusantara. Menggabungkan kekayaan aroma lokal Indonesia dengan teknologi modern.",
      en: "A perfume brand with a Nusantara beauty concept. Combining the richness of Indonesian local aromas with modern technology.",
    },
    pixelPotionName: { id: "Pixel Potion", en: "Pixel Potion" },
    pixelPotionDesc: {
      id: "Brand parfum berbasis AI — teknologi kecerdasan buatan yang menganalisis preferensi aroma dan merekomendasikan parfum personal.",
      en: "An AI-based perfume brand — artificial intelligence technology that analyzes scent preferences and recommends personalized perfumes.",
    },
  },

  // ── Events Section ───────────────────────────────────────────
  events: {
    eyebrow: { id: "Event & Ekosistem", en: "Events & Ecosystem" },
    title: { id: "Fragrantions — Festival Parfum Indonesia", en: "Fragrantions — Indonesia's Perfume Festival" },
    subtitle: {
      id: "Fragrantions adalah festival parfum terbesar di Indonesia yang menghubungkan brand, kreator, edukator, dan penggemar parfum.",
      en: "Fragrantions is Indonesia's largest fragrance festival connecting brands, creators, educators, and fragrance enthusiasts.",
    },
    expo2026: { id: "Fragrantions Expo 2026", en: "Fragrantions Expo 2026" },
    expo2026Date: { id: "15–16 Agustus 2026", en: "August 15–16, 2026" },
    expo2026Desc: {
      id: "Pameran parfum nasional di Taman Mini Indonesia Indah, Jakarta — menampilkan 50+ brand parfum, workshop, talkshow, dan kolaborasi internasional.",
      en: "National perfume expo at Taman Mini Indonesia Indah, Jakarta — featuring 50+ fragrance brands, workshops, talkshows, and international collaborations.",
    },
    roadJuly: { id: "Road to Fragrantions Vol 2", en: "Road to Fragrantions Vol 2" },
    roadJulyDate: { id: "Juli 2026", en: "July 2026" },
    roadJulyDesc: {
      id: "Roadshow pra-event yang mengunjungi kota-kota besar di Indonesia untuk promosi Fragrantions Expo 2026 dan rekrutment tenant.",
      en: "Pre-event roadshow visiting major Indonesian cities to promote Fragrantions Expo 2026 and recruit tenants.",
    },
  },

  // ── Marketplace Section ──────────────────────────────────────
  marketplace: {
    eyebrow: { id: "Digital Marketplace", en: "Digital Marketplace" },
    title: { id: "sensasiwangi.id", en: "sensasiwangi.id" },
    subtitle: {
      id: "Marketplace digital yang menghubungkan produk SWI Store dengan pelanggan di seluruh Indonesia.",
      en: "A digital marketplace connecting SWI Store products with customers across Indonesia.",
    },
    feature1: { id: "Katalog Produk", en: "Product Catalog" },
    feature1Desc: { id: "Jelajahi seluruh produk brand SWI dengan informasi detail.", en: "Browse the complete SWI brand product catalog with detailed information." },
    feature2: { id: "Booking & Checkout", en: "Booking & Checkout" },
    feature2Desc: { id: "Pesan kelas, workshop, atau produk parfum secara online.", en: "Book classes, workshops, or order perfume products online." },
    feature3: { id: "AI Scent Recommendation", en: "AI Scent Recommendation" },
    feature3Desc: { id: "Rekomendasi parfum personal berdasarkan AI analysis.", en: "Personalized perfume recommendations based on AI analysis." },
    feature4: { id: "Customer Support", en: "Customer Support" },
    feature4Desc: { id: "Layanan pelanggan 24/7 melalui WhatsApp dan chat.", en: "24/7 customer service via WhatsApp and chat." },
    visitCta: { id: "Kunjungi Marketplace", en: "Visit Marketplace" },
  },

  // ── Investor Section ─────────────────────────────────────────
  investor: {
    eyebrow: { id: "Investor Relations", en: "Investor Relations" },
    title: { id: "Peluang Investasi", en: "Investment Opportunity" },
    subtitle: {
      id: "Mencari mitra strategis dan investor untuk mempercepat pertumbuhan ekosistem parfum Indonesia.",
      en: "Seeking strategic partners and investors to accelerate the growth of Indonesia's fragrance ecosystem.",
    },
    narrative: { id: "Narasi Bisnis", en: "Business Narrative" },
    narrativeDesc: {
      id: "Holding parfum terintegrasi pertama di Indonesia yang menggabungkan retail, edukasi, event, produksi, dan marketplace digital dalam satu ekosistem.",
      en: "Indonesia's first integrated fragrance holding combining retail, education, events, production, and digital marketplace in one ecosystem.",
    },
    market: { id: "Market Opportunity", en: "Market Opportunity" },
    marketDesc: {
      id: "Industri parfum Indonesia tumbuh 12% per tahun. Pasar fragrances di Asia Tenggara diproyeksikan mencapai USD 8.2 miliar pada 2028.",
      en: "The Indonesian perfume industry grows 12% annually. The Southeast Asian fragrance market is projected to reach USD 8.2 billion by 2028.",
    },
    traction: { id: "Traction & Milestone", en: "Traction & Milestones" },
    tractionDesc: {
      id: "Store operational di TIM, 2 batch kelas parfumer, pertama Fragrantions Expo 2025 sukses, 3 brand parfum aktif produksi.",
      en: "Store operational at TIM, 2 perfumery class batches, inaugural Fragrantions Expo 2025 succeeded, 3 perfume brands in active production.",
    },
    ask: { id: "Funding Ask", en: "Funding Ask" },
    askDesc: {
      id: "Mencari pendanaan strategis untuk ekspansi store, pengembangan platform digital, dan produksi skala besar.",
      en: "Seeking strategic funding for store expansion, digital platform development, and large-scale production.",
    },
    contactInvestor: { id: "Hubungi Tim Investor", en: "Contact Investor Team" },
    downloadDeck: { id: "Unduh Investor Deck (PDF)", en: "Download Investor Deck (PDF)" },
  },

  // ── Footer ───────────────────────────────────────────────────
  footer: {
    copyright: {
      id: "© 2026 PT Sensasi Wangi Indonesia. Hak cipta dilindungi.",
      en: "© 2026 PT Sensasi Wangi Indonesia. All rights reserved.",
    },
    address: { id: "Taman Mini Indonesia Indah, Jakarta", en: "Taman Mini Indonesia Indah, Jakarta" },
    social: { id: "Media Sosial", en: "Social Media" },
  },

  // ── Dashboard ────────────────────────────────────────────────
  dashboard: {
    title: { id: "Dashboard Holding SWI", en: "SWI Holding Dashboard" },
    loginTitle: { id: "Masuk ke Dashboard", en: "Login to Dashboard" },
    loginSubtitle: { id: "PT Sensasi Wangi Indonesia — Internal Dashboard", en: "PT Sensasi Wangi Indonesia — Internal Dashboard" },
    username: { id: "ID Pengguna", en: "User ID" },
    password: { id: "Kata Sandi", en: "Password" },
    loginBtn: { id: "Masuk", en: "Login" },
    logout: { id: "Keluar", en: "Logout" },
    invalidCredentials: { id: "ID atau kata sandi salah", en: "Invalid ID or password" },
    overview: { id: "Ringkasan", en: "Overview" },
    finance: { id: "Keuangan", en: "Finance" },
    legal: { id: "Legal & HKI", en: "Legal & IP" },
    investor: { id: "Investor Readiness", en: "Investor Readiness" },
    weekly: { id: "Agenda Mingguan", en: "Weekly Agenda" },
    driveFiles: { id: "File Google Drive", en: "Google Drive Files" },
    totalDivisions: { id: "Unit Bisnis", en: "Business Units" },
    investorReadiness: { id: "Investor Readiness", en: "Investor Readiness" },
    legalStatus: { id: "Legal / HKI", en: "Legal / IP" },
    financeModel: { id: "Finance Model", en: "Finance Model" },
    percent: { id: "%", en: "%" },
    priorities: { id: "Prioritas 7 Hari", en: "7-Day Priorities" },
    prioritiesList: {
      id: [
        "Lengkapi PIC dan deadline setiap divisi",
        "Satukan file legal PT, NIB, rekening, pajak, dan dokumen perusahaan",
        "Buat daftar status merek/HKI untuk semua brand",
        "Isi angka keuangan aktual: kas, omzet, biaya tetap, dan CAPEX",
        "Pilih materi publik yang aman ditampilkan di frontpage",
      ],
      en: [
        "Complete PIC and deadline for each division",
        "Consolidate legal documents: PT, NIB, bank accounts, taxes",
        "Create brand/IP status list for all brands",
        "Fill in actual financial figures: cash, revenue, fixed costs, CAPEX",
        "Select public materials safe for the frontpage",
      ],
    },
    tracker: { id: "Tracker Kerja", en: "Work Tracker" },
    name: { id: "Nama", en: "Name" },
    status: { id: "Status", en: "Status" },
    progress: { id: "Progress", en: "Progress" },
    pic: { id: "PIC", en: "PIC" },
    deadline: { id: "Deadline", en: "Deadline" },
    notes: { id: "Catatan", en: "Notes" },
    revenue: { id: "Revenue Stream", en: "Revenue Stream" },
    capex: { id: "CAPEX", en: "CAPEX" },
    opex: { id: "OPEX", en: "OPEX" },
    revenuePotential: { id: "Omzet Potensial", en: "Revenue Potential" },
    payback: { id: "Payback Period", en: "Payback Period" },
    weeks: { id: "minggu", en: "weeks" },
  },
};

export function t(key: string, lang: Lang): string {
  const keys = key.split(".");
  let val: any = dict;
  for (const k of keys) {
    val = val?.[k];
    if (!val) return key;
  }
  if (typeof val === "object" && val[lang]) return val[lang];
  if (typeof val === "string") return val;
  return key;
}
