/**
 * =========================================================================
 * ATTACHMENT ANYWHERE // UNIFIED CORE OPERATING SYSTEM (v2.5)
 * Cross-Application Reactive Event Bus & State Synchronization Engine
 * (Storefront <-> Stealth Back-Office Meadhall Operations)
 * =========================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const core = factory();
    root.AttachmentAnywhereCore = core;
    root.AACore = core;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // --- STORAGE KEYS ---
  const KEYS = {
    CATALOG: 'aa_catalog_v2',
    ORDERS: 'aa_orders_v2',
    REVIEWS: 'aa_reviews_v2',
    LEADS: 'aa_b2b_event_leads',
    // Backward compatibility mirrors
    LEGACY_ORDERS: 'attachment_meadhall_orders',
    LEGACY_SERIALS: 'attachment_meadhall_serials',
    LEGACY_FEEDBACK: 'aa_feedback',
    LEGACY_CATALOG: 'aa_catalog_settings',
    LEGACY_CONFIG: 'aa_meadhall_config',
    LEGACY_AUDIT: 'attachment_meadhall_audit_logs',
    CART: 'attachment_cart'
  };

  // --- DEFAULT DATA SEEDS ---
  const DEFAULT_CATALOG = [
    {
      id: 'executive',
      name: 'Executive NFC Card',
      subtitle: 'Matte Black Contactless Smart Card',
      chip: 'NXP NTAG213',
      basePrice: 900,
      variants: [
        { name: 'Original Design', price: 900 },
        { name: 'Custom Artwork', price: 1200 }
      ],
      stock: 142,
      status: 'in_stock', // 'in_stock' | 'sold_out'
      category: 'Cards',
      description: 'Matte black PVC card with embedded high-frequency NTAG213 silicon and anti-metal shielding.'
    },
    {
      id: 'reviewshield',
      name: 'Compact NFC Keychain',
      subtitle: 'Tap-to-Review Counter & Pocket Puck',
      chip: 'NTAG213 + Ferrite',
      basePrice: 350,
      variants: [
        { name: 'Original Design', price: 350 },
        { name: 'Store Branding', price: 600 }
      ],
      stock: 89,
      status: 'in_stock',
      category: 'Keychains',
      description: 'Anti-metal shielded contactless tap keychain designed for instant Google Review collection.'
    },
    {
      id: 'hub',
      name: 'Business Desk Puck',
      subtitle: 'Weighted Acrylic Countertop Smart Stand',
      chip: 'Ferrite Shielded Dual-Coil',
      basePrice: 2000,
      variants: [
        { name: 'Original Design', price: 2000 },
        { name: 'Full Store Branding', price: 2500 }
      ],
      stock: 35,
      status: 'in_stock',
      category: 'Stands',
      description: 'Architectural weighted counter stand bridging offline foot traffic to your digital hub.'
    }
  ];

  const DEFAULT_ORDERS = [
    {
      ref: "AA-260901",
      date: "Today, 10:14 AM",
      customer: {
        name: "Shawn Rivera",
        phone: "0917-882-9102",
        address: "Unit 402, Avant Residences, 26th St, BGC, Taguig"
      },
      product: "Executive NFC Card",
      variant: "Custom Artwork",
      qty: 1,
      total: 1200,
      shipping: "Standard Metro Manila (+₱100)",
      status: "QUEUED",
      specs: {
        brand: "Shawn Rivera Photography",
        targetUrl: "https://attachmentanywhere.com/c/aa260901sr01"
      }
    },
    {
      ref: "AA-260902",
      date: "Today, 09:42 AM",
      customer: {
        name: "Chester Joseph Villanueva",
        phone: "0918-223-9941",
        address: "74 General Luna St, Intramuros, Manila"
      },
      product: "Compact NFC Keychain",
      variant: "Original Design",
      qty: 2,
      total: 700,
      shipping: "Express Dispatch (+₱150)",
      status: "BURNED",
      specs: {
        brand: "Mama Bean Coffee Club",
        targetUrl: "https://attachmentanywhere.com/c/aa260902mb02"
      }
    },
    {
      ref: "AA-260903",
      date: "Yesterday, 04:15 PM",
      customer: {
        name: "Kaizer Nicole Mangsal",
        phone: "0920-551-7733",
        address: "12 Topaz Rd, Ortigas Center, Pasig"
      },
      product: "Executive NFC Card",
      variant: "Original Design",
      qty: 1,
      total: 900,
      shipping: "Standard Metro Manila (+₱100)",
      status: "QC PASSED",
      specs: {
        brand: "Kaizer Nicole Studio",
        targetUrl: "https://attachmentanywhere.com/c/aa260903kn03"
      }
    },
    {
      ref: "AA-260904",
      date: "Oct 10, 02:30 PM",
      customer: {
        name: "Marcus Vance",
        phone: "0917-334-1189",
        address: "Badshot Coffee, Aguirre Ave, BF Homes, Parañaque"
      },
      product: "Business Desk Puck",
      variant: "Full Store Branding",
      qty: 1,
      total: 2500,
      shipping: "Store Pickup / Express Courier (+₱100)",
      status: "SHIPPED",
      specs: {
        brand: "Badshot Coffee",
        targetUrl: "https://attachmentanywhere.com/c/badshotcoffee"
      }
    }
  ];

  const DEFAULT_REVIEWS = [
    {
      id: "FB-01",
      type: "Review",
      sender: "Marcus Vance : Badshot Coffee",
      message: "The acrylic counter puck doubled our Google reviews in 2 weeks. Zero tap failures on metal counter.",
      rating: "5.0 ★",
      status: "VERIFIED",
      approved_for_site: true,
      date: "2026-10-07"
    },
    {
      id: "FB-02",
      type: "Suggestion",
      sender: "Alyssa Lim : 1319 Cafe",
      message: "Could you add frosted acrylic options for the counter stands? Clear is great, but frosted fits our interior.",
      rating: "N/A",
      status: "OPEN",
      approved_for_site: false,
      date: "2026-10-06"
    },
    {
      id: "FB-03",
      type: "Issue",
      sender: "David Tan : Retail Founder",
      message: "First tap took 2 tries through a thick Otterbox case on iPhone SE. Bare phone connects instantly.",
      rating: "4.0 ★",
      status: "INVESTIGATING",
      approved_for_site: false,
      date: "2026-10-05"
    },
    {
      id: "FB-04",
      type: "Review",
      sender: "Shawn Rivera : Pop-up Shop",
      message: "Matte black card finish looks premium. Tap speed is instant on both iOS and Android.",
      rating: "5.0 ★",
      status: "VERIFIED",
      approved_for_site: true,
      date: "2026-10-04"
    }
  ];

  const DEFAULT_LEADS = [
    {
      id: 1,
      timestamp: "2026-10-12T08:00:00.000Z",
      eventName: "Tech Summit Manila 2026",
      dateVenue: "SMX Convention Center, Pasay • Nov 5–7, 2026",
      timelineUrgency: "In 3 Weeks",
      targetRole: "Booth Directors & Startup Founders",
      hardware: "Executive NFC Card",
      pitch: "Hey [Name], saw you're exhibiting at Tech Summit Manila. Instead of 500 paper cards getting tossed into lanyards, our matte black NFC cards beam your deck and contact into investor phones with one tap. Can I drop off a demo card before Nov 5?",
      linkedInUrl: "https://www.linkedin.com/search/results/people/?keywords=Tech%20Summit%20Manila%20Founder",
      status: "Ready to DM",
      notes: "Priority lead for SMX exhibition floor."
    },
    {
      id: 2,
      timestamp: "2026-10-12T08:15:00.000Z",
      eventName: "Philippine Retail Leaders Summit",
      dateVenue: "Shangri-La The Fort, BGC • Nov 14, 2026",
      timelineUrgency: "In 4 Weeks",
      targetRole: "Managing Directors & Retail Operators",
      hardware: "Compact NFC Keychain",
      pitch: "Hi [Name], quick question ahead of Retail Leaders Summit at Shangri-La. Our anti-metal shielded NFC keychains let store managers tap Google review collection or loyalty links instantly. Would love to send you a sample for your BGC stores.",
      linkedInUrl: "https://www.linkedin.com/search/results/people/?keywords=Retail%20Managing%20Director%20Philippines",
      status: "Ready to DM",
      notes: "Key chain hardware target for retail chains."
    },
    {
      id: 3,
      timestamp: "2026-10-12T08:30:00.000Z",
      eventName: "Manila F&B Expo & Franchise Con",
      dateVenue: "World Trade Center, Pasay • Nov 21–23, 2026",
      timelineUrgency: "In 5 Weeks",
      targetRole: "Franchise Directors & Cafe Brand Owners",
      hardware: "Compact NFC Keychain",
      pitch: "Hey [Name], preparing for the World Trade Center F&B Expo? Our acrylic counter hubs and tap keychains are already deployed at Badshot Coffee and 1319 Cafe to 3x review velocity. Can I bring a sample puck to your booth?",
      linkedInUrl: "https://www.linkedin.com/search/results/people/?keywords=Franchise%20Director%20Manila%20FB",
      status: "Ready to DM",
      notes: "Hospitality and cafe expansion focus."
    },
    {
      id: 4,
      timestamp: "2026-10-12T08:45:00.000Z",
      eventName: "Fintech Nexus Philippines",
      dateVenue: "Marriott Grand Ballroom, Pasay • Dec 2–3, 2026",
      timelineUrgency: "In 7 Weeks",
      targetRole: "Chief Technology Officers & VP Partnerships",
      hardware: "Executive NFC Card",
      pitch: "Hi [Name], saw you're on the leadership panel for Fintech Nexus at Marriott. We engineer custom NTAG215 PVC cards for executive teams with zero-app instant contact sync and bank-grade anti-metal shielding. Sending over brief specs if open.",
      linkedInUrl: "https://www.linkedin.com/search/results/people/?keywords=Fintech%20CTO%20Philippines",
      status: "Contacted",
      notes: "Follow-up scheduled after keynote."
    },
    {
      id: 5,
      timestamp: "2026-10-12T09:00:00.000Z",
      eventName: "Healthcare & MedTech Summit Asia",
      dateVenue: "EDSA Shangri-La, Mandaluyong • Dec 10, 2026",
      timelineUrgency: "In 8 Weeks",
      targetRole: "Hospital Directors & Health IT Leaders",
      hardware: "Executive NFC Card",
      pitch: "Hello [Name], noticed your attendance at the MedTech Summit. As a DOH data encoder and hardware builder, I design contactless credential cards compliant with RA 10173 data privacy protocols for medical staff. Open to a 2-minute intro?",
      linkedInUrl: "https://www.linkedin.com/search/results/people/?keywords=Hospital%20Director%20Philippines",
      status: "Drafted",
      notes: "Health tech outreach angle aligned with DOH expertise."
    },
    {
      id: 6,
      timestamp: "2026-10-12T09:15:00.000Z",
      eventName: "PropTech & Real Estate Summit Manila",
      dateVenue: "New World Makati Hotel • Dec 16, 2026",
      timelineUrgency: "In 9 Weeks",
      targetRole: "Sales Directors & Brokerage Heads",
      hardware: "Executive NFC Card",
      pitch: "Hi [Name], saw your brokers are attending the PropTech Summit. One tap of our smart matte cards beams 3D property tours and contact details directly into buyers' contact books. Can I courier 2 demo cards to your office?",
      linkedInUrl: "https://www.linkedin.com/search/results/people/?keywords=Real%20Estate%20Sales%20Director%20Makati",
      status: "Ready to DM",
      notes: "High-ticket real estate sales teams."
    }
  ];

  // --- REACTIVE BROADCAST EVENT BUS ---
  const listeners = {};
  let broadcastChannel = null;

  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('aa_core_bus');
      broadcastChannel.onmessage = function (ev) {
        if (ev && ev.data && ev.data.event) {
          triggerLocal(ev.data.event, ev.data.payload);
        }
      };
    }
  } catch (e) {
    console.warn('[AACore] BroadcastChannel unavailable, falling back to storage events:', e);
  }

  // Cross-tab storage event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', function (e) {
      if (!e.key) return;
      if (e.key === KEYS.ORDERS || e.key === KEYS.LEGACY_ORDERS) {
        triggerLocal('ORDERS_UPDATED', { key: e.key });
      } else if (e.key === KEYS.CATALOG || e.key === KEYS.LEGACY_CATALOG) {
        triggerLocal('CATALOG_UPDATED', { key: e.key });
      } else if (e.key === KEYS.REVIEWS || e.key === KEYS.LEGACY_FEEDBACK) {
        triggerLocal('REVIEWS_UPDATED', { key: e.key });
      } else if (e.key === KEYS.LEADS) {
        triggerLocal('LEADS_UPDATED', { key: e.key });
      }
    });
  }

  function triggerLocal(event, payload) {
    if (listeners[event]) {
      listeners[event].forEach(fn => {
        try { fn(payload); } catch (err) { console.error('[AACore] Listener error:', err); }
      });
    }
    if (listeners['*']) {
      listeners['*'].forEach(fn => {
        try { fn(event, payload); } catch (err) { console.error('[AACore] Wildcard listener error:', err); }
      });
    }
  }

  function emit(event, payload) {
    triggerLocal(event, payload);
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ event, payload });
      } catch (err) {
        console.warn('[AACore] postMessage error:', err);
      }
    }
  }

  function on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    return function unsubscribe() {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    };
  }

  // Safe LocalStorage helpers with memory fallback
  const memStorage = {};
  function getRaw(key, defaultVal) {
    try {
      if (typeof localStorage !== 'undefined') {
        const v = localStorage.getItem(key);
        if (v) return JSON.parse(v);
      } else if (memStorage[key]) {
        return JSON.parse(memStorage[key]);
      }
    } catch (e) {}
    return defaultVal;
  }

  function setRaw(key, val) {
    const serialized = JSON.stringify(val);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, serialized);
      } else {
        memStorage[key] = serialized;
      }
    } catch (e) {
      memStorage[key] = serialized;
    }
  }

  // Audio synthesizer chime for Loop A (New Order Alert)
  function playExecutiveChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      
      // Dual-tone high-frequency executive bell (D5 587.33Hz -> A5 880Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.08);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
    } catch (e) {
      // Browsers may block audio before first user gesture
    }
  }

  // --- CATALOG API ---
  function getCatalog() {
    let catalog = getRaw(KEYS.CATALOG, null);
    if (!catalog || !Array.isArray(catalog) || catalog.length === 0) {
      // Check legacy catalog settings
      const legacy = getRaw(KEYS.LEGACY_CATALOG, null);
      if (legacy && Array.isArray(legacy) && legacy.length > 0) {
        catalog = DEFAULT_CATALOG.map(def => {
          const match = legacy.find(l => l.id === def.id || (l.name && l.name.toLowerCase().includes(def.id)));
          if (match) {
            return {
              ...def,
              basePrice: match.price || def.basePrice,
              stock: typeof match.stock === 'number' ? match.stock : def.stock,
              status: match.status === 'OUT_OF_STOCK' || match.stock === 0 ? 'sold_out' : 'in_stock'
            };
          }
          return def;
        });
      } else {
        catalog = DEFAULT_CATALOG;
      }
      setRaw(KEYS.CATALOG, catalog);
    }
    return catalog;
  }

  function saveCatalog(catalog) {
    setRaw(KEYS.CATALOG, catalog);
    // Mirror to legacy catalog settings
    try {
      const legacy = catalog.map((p, idx) => ({
        id: 'PRD-0' + (idx + 1),
        name: p.name,
        chip: p.chip || 'NTAG213',
        price: p.basePrice,
        stock: p.stock,
        status: p.status === 'sold_out' || p.stock === 0 ? 'OUT_OF_STOCK' : 'ACTIVE'
      }));
      setRaw(KEYS.LEGACY_CATALOG, legacy);
    } catch (e) {}

    emit('CATALOG_UPDATED', { catalog });
  }

  function getProduct(productId) {
    const list = getCatalog();
    return list.find(p => p.id === productId) || null;
  }

  function updateProduct(productId, updates) {
    const list = getCatalog();
    const idx = list.findIndex(p => p.id === productId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      saveCatalog(list);
      return list[idx];
    }
    return null;
  }

  // --- ORDERS API (LOOP A) ---
  function getOrders() {
    let orders = getRaw(KEYS.ORDERS, null);
    if (!orders || !Array.isArray(orders)) {
      // Check legacy orders
      const legacy = getRaw(KEYS.LEGACY_ORDERS, null);
      if (legacy && Array.isArray(legacy) && legacy.length > 0) {
        orders = legacy;
      } else {
        orders = DEFAULT_ORDERS;
      }
      setRaw(KEYS.ORDERS, orders);
      setRaw(KEYS.LEGACY_ORDERS, orders);
    }
    return orders;
  }

  function saveOrders(orders) {
    setRaw(KEYS.ORDERS, orders);
    setRaw(KEYS.LEGACY_ORDERS, orders);
    emit('ORDERS_UPDATED', { orders });
  }

  function generateSerialCode() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randomHex = Math.random().toString(16).substr(2, 6).toLowerCase();
    return `aa${yy}${mm}${dd}${randomHex}`;
  }

  function createOrder(orderInput) {
    const orders = getOrders();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const refId = 'AA-' + Math.floor(100000 + Math.random() * 900000);
    const serial = generateSerialCode();
    const targetUrl = `https://attachmentanywhere.com/c/${serial}`;

    const newOrder = {
      ref: refId,
      serial: serial,
      date: `Today, ${timeStr}`,
      timestamp: now.toISOString(),
      customer: {
        name: orderInput.name || 'Valued Client',
        phone: orderInput.phone || '',
        address: orderInput.address || ''
      },
      product: orderInput.product || 'Executive NFC Card',
      variant: orderInput.variant || 'Original Design',
      qty: Number(orderInput.qty) || 1,
      total: Number(orderInput.total) || 900,
      shipping: orderInput.shipping || 'Standard Metro Manila (+₱100)',
      status: 'QUEUED',
      specs: {
        brand: orderInput.brand || orderInput.name || 'Attachment Anywhere',
        targetUrl: targetUrl,
        notes: orderInput.notes || '',
        ...orderInput.specs
      }
    };

    orders.unshift(newOrder);
    saveOrders(orders);

    // Mirror to legacy serial table for card writer dock
    try {
      const serials = getRaw(KEYS.LEGACY_SERIALS, []);
      serials.unshift({
        serial: serial,
        name: newOrder.customer.name,
        client: newOrder.customer.name,
        brand: newOrder.specs.brand,
        url: targetUrl,
        targetUrl: targetUrl,
        localUrl: `${serial}.html`,
        chip: 'NTAG213',
        status: 'PENDING',
        created: now.toISOString().split('T')[0]
      });
      setRaw(KEYS.LEGACY_SERIALS, serials);
    } catch (e) {}

    // Mirror to audit log
    try {
      const audit = getRaw(KEYS.LEGACY_AUDIT, []);
      audit.unshift({
        timestamp: timeStr,
        action: 'ORDER_CREATED',
        details: `Order ${refId} (${newOrder.product}) submitted by ${newOrder.customer.name} (₱${newOrder.total.toLocaleString()})`
      });
      setRaw(KEYS.LEGACY_AUDIT, audit.slice(0, 150));
    } catch (e) {}

    // Deduct chip inventory
    try {
      const cfg = getRaw(KEYS.LEGACY_CONFIG, { inventory: { ntag213: 250 }, pricing: {} });
      if (cfg.inventory && typeof cfg.inventory.ntag213 === 'number') {
        cfg.inventory.ntag213 = Math.max(0, cfg.inventory.ntag213 - (newOrder.qty || 1));
        setRaw(KEYS.LEGACY_CONFIG, cfg);
      }
    } catch (e) {}

    // Broadcast ORDER_CREATED event across all tabs
    emit('ORDER_CREATED', { order: newOrder });

    return newOrder;
  }

  function updateOrderStatus(orderRef, newStatus) {
    const orders = getOrders();
    const order = orders.find(o => o.ref.toLowerCase() === orderRef.toLowerCase());
    if (order) {
      const oldStatus = order.status;
      order.status = newStatus;
      saveOrders(orders);
      emit('ORDER_UPDATED', { order, oldStatus, newStatus });
      return order;
    }
    return null;
  }

  // --- REVIEWS & FEEDBACK API (LOOP C) ---
  function getReviews() {
    let reviews = getRaw(KEYS.REVIEWS, null);
    if (!reviews || !Array.isArray(reviews)) {
      const legacy = getRaw(KEYS.LEGACY_FEEDBACK, null);
      if (legacy && Array.isArray(legacy) && legacy.length > 0) {
        reviews = legacy.map(item => ({
          ...item,
          approved_for_site: typeof item.approved_for_site === 'boolean' 
            ? item.approved_for_site 
            : (item.status === 'VERIFIED')
        }));
      } else {
        reviews = DEFAULT_REVIEWS;
      }
      setRaw(KEYS.REVIEWS, reviews);
      setRaw(KEYS.LEGACY_FEEDBACK, reviews);
    }
    return reviews;
  }

  function getApprovedReviews() {
    return getReviews().filter(r => r.approved_for_site === true);
  }

  function saveReviews(reviews) {
    setRaw(KEYS.REVIEWS, reviews);
    setRaw(KEYS.LEGACY_FEEDBACK, reviews);
    emit('REVIEWS_UPDATED', { reviews, approved: reviews.filter(r => r.approved_for_site) });
  }

  function addReview(reviewInput) {
    const reviews = getReviews();
    const id = 'FB-' + String(reviews.length + 1).padStart(2, '0');
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const newReview = {
      id: id,
      type: reviewInput.type || 'Review',
      sender: reviewInput.sender || 'Storefront Visitor',
      message: reviewInput.message || '',
      rating: reviewInput.rating ? `${reviewInput.rating}.0 ★` : '5.0 ★',
      status: 'Pending',
      approved_for_site: false, // Moderated by owner in Meadhall
      date: dateStr
    };

    reviews.unshift(newReview);
    saveReviews(reviews);

    emit('REVIEW_SUBMITTED', { review: newReview });
    return newReview;
  }

  function approveReview(reviewId, isApproved = true) {
    const reviews = getReviews();
    const item = reviews.find(r => r.id === reviewId);
    if (item) {
      item.approved_for_site = Boolean(isApproved);
      if (item.approved_for_site && item.status === 'Pending') {
        item.status = 'VERIFIED';
      }
      saveReviews(reviews);
      return item;
    }
    return null;
  }

  // --- B2B EVENT RADAR API ---
  function getLeads() {
    let leads = getRaw(KEYS.LEADS, null);
    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      leads = DEFAULT_LEADS;
      setRaw(KEYS.LEADS, leads);
    }
    return leads;
  }

  function saveLeads(leads) {
    setRaw(KEYS.LEADS, leads);
    emit('LEADS_UPDATED', { leads });
  }

  function updateLeadStatus(id, newStatus) {
    const leads = getLeads();
    const lead = leads.find(l => l.id === id);
    if (lead) {
      lead.status = newStatus;
      saveLeads(leads);
      return lead;
    }
    return null;
  }

  // --- EXPORT UNIFIED CORE ---
  return {
    version: '2.5.0',
    KEYS: KEYS,
    on: on,
    emit: emit,
    playChime: playExecutiveChime,


    // Catalog APIs
    getCatalog: getCatalog,
    saveCatalog: saveCatalog,
    getProduct: getProduct,
    updateProduct: updateProduct,
    updateCatalogItem: updateProduct,

    // Orders APIs (Loop A)
    getOrders: getOrders,
    saveOrders: saveOrders,
    createOrder: createOrder,
    updateOrderStatus: updateOrderStatus,
    generateSerialCode: generateSerialCode,

    // Reviews APIs (Loop C)
    getReviews: getReviews,
    getApprovedReviews: getApprovedReviews,
    saveReviews: saveReviews,
    addReview: addReview,
    approveReview: approveReview,

    // B2B Event Intelligence
    getLeads: getLeads,
    saveLeads: saveLeads,
    updateLeadStatus: updateLeadStatus
  };
});
