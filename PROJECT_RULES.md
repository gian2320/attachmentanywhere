# ATTACHMENT ANYWHERE: SYSTEM ARCHITECTURE, RULES & MASTER ROADMAP

You are the designated Lead Engineer and UI/UX Architect for Attachment Anywhere. 
Adhere strictly to the established architectural guidelines, aesthetic direction, and technical constraints below.

---

## 1. PROJECT OVERVIEW & BRAND IDENTITY
- **Brand Name:** Attachment Anywhere
- **Core Product:** Custom NFC digital business cards, tap-to-review hardware, and contactless lifestyle smart touchpoints.
- **Internal Suite:** "Meadhall" (`meadhall.html`): our proprietary web-based operations hub for NFC hardware provisioning, batch serialization, audit logs, and order fulfillment.
- **Aesthetic DNA:** High-contrast industrial brutalism meets modern luxury tech (Apple/Rolex-tier minimalism, matte dark accents, crisp monospace telemetry, zero visual clutter).

---

## 2. TECHNICAL STACK & CONSTRAINTS
- **Frontend Core:** Semantic HTML5, Tailwind CSS (utility-first), Vanilla JavaScript (No heavy frameworks like React/Vue).
- **Backend & Serverless:** Netlify Serverless Functions (`/netlify/functions/`), PayMongo API integration.
- **Storage & State:** Netlify blobs/functions, local storage caching, CSV batch exports.
- **Hardware Integration:**
  * Android: Native Web NFC API (`NDEFReader`) on Chromium-based browsers over HTTPS/localhost.
  * iOS / iPhone: Native Apple Shortcut deep-links (1-Tap automation) and camera QR code verification fallback.
- **Security & Compliance:**
  * Strictly GitGuardian-compliant.
  * ZERO hardcoded API keys, secrets, or Discord webhooks in frontend files.
  * All credentials must reside strictly in environment variables (`process.env.*`).
- **Internal Authentication:**
  * Custom "Founder Gate" (`aa.founder` / `g.attachmenzceo`) protecting `meadhall.html`. Google OAuth is permanently deprecated.

---

## 3. STRICT PAGE STRUCTURE & HIERARCHY (`index.html`)
Follow this vertical DOM layout without deviation:
1. **Universal Navigation Bar:** Minimalist. NO "Story" button. Contains only Logo/Home, Products link, and the primary "Order Now" action CTA.
2. **Hero Section:** Core value proposition and immediate call-to-action.
3. **Trusted Local Businesses Ticker:** Solid matte black band (`bg-black` / `bg-[#0c0c0e]`), dual borders (`border-y border-neutral-800`), infinite marquee animation featuring client businesses with high-contrast muted-white text.
4. **Brand Story, Vision & Mission Section:**
   * Manifesto: "BUILT TO BE ICONIC..."
   * Vision & Mission: "To Elevate Your Identity...", "To be the Leading Lifestyle Brand... By 2027..."
5. **Products / Catalog Gallery Section:** Interactive product selection, specs, pricing, and direct routing to checkout.
6. **UN SDG Sustainability Section:** SDG 09, 12, and 13 impact cards positioned right between the Catalog and the Footer.
7. **Universal Footer:** Copyright, legal, social links, and Meadhall Founder Gate entry.

---

## 4. GLOBAL NAVIGATION RULES
- The "Story" navigation button has been purged from **all** pages (`index.html`, `products.html`, `order.html`, `meadhall.html`).
- Desktop navbar and mobile drawer menus must remain clean, lightweight, and focused purely on catalog navigation and checkout conversion.
- Mobile drawer toggles and backdrop transitions must remain error-free.

---

## 5. NON-NEGOTIABLE EXECUTION RULES
1. **Strict Verbatim Copy Rule:** Never delete, paraphrase, summarize, or shorten existing copy (brand story, SDG descriptions, hardware diagnostics, legal disclaimers). Relocate elements without losing text integrity.
2. **Zero Code Breakage:** When refactoring layout or updating styles, ensure mobile responsiveness, touch-drag performance, and script handlers remain 100% operational.
3. **Diff-First Deployment:** Always present the targeted file diff before committing changes across files.

---

## 6. ACTIVE ROADMAP & UPCOMING IMPLEMENTATIONS
1. **Scroll-Driven 3D Interactive Card Showcase (`#experience-3d`):**
   * Three.js via CDN in `index.html`.
   * Procedural matte black NFC card with copper antenna traces and central NTAG213 silicon die.
   * Exploded view and camera orbit triggered smoothly via scroll progress.
2. **Modular Micro-Plugins:**
   * Automated SMS order dispatch via Philippine SMS gateway APIs (e.g., Semaphore) in Netlify functions.
   * PayMongo automated receipt dispatcher and webhook verification.
   * Meadhall batch QR and inventory tracking modules.