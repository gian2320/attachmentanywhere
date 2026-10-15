---
name: layered-parallax-hero
description: Build a layered parallax hero section (stacked-PNG scene with mouse + scroll parallax, vanilla JS, no library). MUST USE when the user says "use brewed parallax" or "brewed parallax". Also use when the user asks for a parallax hero, layered hero, "depth" hero scene, or a hero like the Vanlife Blueprint page. Includes an asset-requirements intake that tells the user exactly which images to prepare, in order, based on the scene they describe.
---

# Layered Parallax Hero

Recreates the stacked-PNG parallax hero pattern (reverse-engineered from the Vanlife Blueprint page, an Astro + Tailwind build). One hero section, 8-10 absolutely positioned layers, a ~20-line vanilla JS engine driving mouse + scroll parallax on `translate3d` only. No GSAP, no canvas, no library.

## Step 0 - Intake: derive the asset list from the user's scene

Before writing any code, ask the user to describe the scene (or read their brief) and translate it into this asset checklist. Give it to them in this exact order, because each asset depends on the previous one's composition:

1. **Background plate (required first)** - the deepest layer: sky, ocean, space, city haze, whatever sits "at infinity". Full-bleed image, no transparency needed. Must be composed so its center ~86% is the visible area, because it will be rendered at `scale(1.14)` to hide parallax drift at the edges. Ask: "What is at the very back of your scene?"
2. **Midground cutout (required second)** - the terrain/skyline/silhouette layer: mountains, city skyline, forest line, waves. **PNG with a transparent sky/top** - this transparency is the entire trick; the background and everything animated shows through the cutout. It must include the scene's "ground" (lake, street, floor) because it sits `bottom-0` and anchors the composition. Export ~112% of the viewport width. Ask: "What silhouette separates the background from the foreground?"
3. **Foreground hero object (required third)** - the product/subject: van, car, laptop, bottle, character. PNG with full transparency around it. This layer gets NO parallax, only an idle bob, so it reads as the stable subject. Ask: "What is the one object the visitor should look at?"
4. **Optional atmosphere (no image needed)** - stars, snow, dust, fog, glow. These are generated in code (positioned spans + blurred ellipse divs), not images. Only ask what mood fits the scene.
5. **Logo / favicon** - last, cosmetic.

If the user's scene has no natural midground silhouette (e.g. a plain studio product shot), tell them this pattern loses its magic - the headline-behind-terrain trick needs a cutout. Offer a simpler two-layer version instead.

Deliverable spec to give the user: background JPEG/PNG >= 2400px wide; midground and hero object as transparent PNGs (or WebP with alpha); all shot/rendered under the same lighting direction or the composite looks pasted.

## The layer stack (bottom to top)

One parent section:

```html
<section id="hero" class="relative isolate h-[100svh] min-h-[640px] w-full overflow-hidden bg-[#0D1C2F]">
```

`relative isolate overflow-hidden` is mandatory: isolate creates a stacking context so z-indices stay local; overflow-hidden clips the oversized layers. Background color = the plate's dominant color, so nothing flashes white while images load.

| z | Layer | Content | data-depth-x | data-depth-y | data-scroll |
|---|---|---|---|---|---|
| 0 | Background plate | `<img>` full-bleed, `scale-[1.14] object-cover` | 12 | 8 | -5 |
| 3 | Rotating field (optional) | 130vmax x 130vmax square of dot spans, pure CSS 220s spin | - | - | - |
| 4 | Tight ridge glow (optional) | blurred ellipse div, `blur-[100px]` opacity-20 | 6 | 3 | -7 |
| 5 | Wide atmosphere glow (optional) | blurred ellipse div, `blur-[130px]` opacity-40 | 8 | 4 | -8 |
| 6 | Twinkling particles (optional) | inline-styled spans, opacity keyframes | 16 | 9 | -10 |
| 7 | Streaks / shooting stars (optional) | gradient streak divs, keyframed | - | - | - |
| 10 | **Giant headline** | h1, huge clamp() type | 20 | 10 | **-26** |
| 20 | **Midground cutout** | `<img>` `bottom-0`, `w-[112%] -ml-[6%]` | 30 | **0** | **0** |
| 30 | **Hero object** | `<img>` + hotspots, idle bob only | - | - | - |
| 40 | Copy + CTAs | `pointer-events-none` wrapper, re-enabled on buttons | - | - | - |

Non-negotiable rules baked into those numbers:

- **The headline sits BETWEEN atmosphere (z<=7) and the midground cutout (z=20).** Text sliding behind terrain is the single biggest trick - it makes the scene read as a layered world, not text on an image. Its `data-scroll="-26"` (largest magnitude) makes it sink behind the ridge fastest on scroll.
- **Midground vertical parallax is deliberately OFF** (`data-depth-y="0" data-scroll="0"`). It sits `bottom-0`; any vertical movement opens a background-colored seam at the section's bottom edge.
- **depth-x increases toward the viewer**: background 12, particles 16, headline 20, midground 30. Nearer layers move more under the cursor - that gradient is what sells 3D.
- **Every drifting layer is oversized** so movement never exposes an edge: background `scale-[1.14]`, midground `w-[112%] -ml-[6%]`.
- **The hero object gets no parallax.** It idle-bobs only. A moving subject reads as unstable; a still subject in a drifting world reads as depth.

## The engine (complete, vanilla JS)

Each `.parallax` element carries `data-depth-x`, `data-depth-y`, `data-scroll` (scroll is a percentage: -26 means "translate up by 26% of scrollY"). One rAF loop, lerp-smoothed:

```html
<script type="module">
const hero = document.getElementById("hero");
const layers = Array.from(document.querySelectorAll("#hero .parallax"));
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (hero && layers.length && !reduced) {
  let tx = 0, ty = 0;      // target (raw pointer, -0.5..0.5)
  let cx = 0, cy = 0;      // current (lerped)
  let scrollY = window.scrollY;

  window.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
  }, { passive: true });

  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

  const map = layers.map((el) => ({
    el,
    dx: parseFloat(el.dataset.depthX || "0"),
    dy: parseFloat(el.dataset.depthY || "0"),
    ds: parseFloat(el.dataset.scroll || "0") / 100,
  }));

  const frame = () => {
    cx += (tx - cx) * 0.07;   // 0.07 lerp = the inertia; layers glide, never snap
    cy += (ty - cy) * 0.07;
    for (const l of map) {
      const x = -cx * l.dx;
      const y = -cy * l.dy + scrollY * l.ds;
      l.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
</script>
```

Details that matter:

- Pointer position is normalized to **-0.5..0.5** relative to the hero rect, so depth values are literal max pixel offsets.
- Translation is **negated** (`-cx * dx`): layers drift away from the cursor, which reads as looking around a 3D scene.
- Mouse and scroll combine into ONE translate per layer per frame. Never two competing transforms.
- `translate3d` (GPU compositing), transform/opacity only, entire engine gated behind `prefers-reduced-motion`. The section works perfectly with JS off - parallax is enhancement.

## Layer markup patterns

Background plate (deepest, moves least):

```html
<div class="parallax absolute inset-0 z-0" data-depth-x="12" data-depth-y="8" data-scroll="-5">
  <img src="/images/sky.png" alt="" aria-hidden="true"
       class="h-full w-full scale-[1.14] object-cover object-center">
</div>
```

Headline (behind the midground):

```html
<div class="parallax pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-[22vh]"
     data-depth-x="20" data-depth-y="10" data-scroll="-26">
  <h1 class="font-display font-extrabold uppercase leading-[0.85] tracking-tight
             text-[clamp(2rem,8.5vw,11rem)] [text-shadow:0_8px_40px_rgba(4,11,22,0.45)]">
    Van Lifestyle
  </h1>
</div>
```

Midground cutout (transparent sky, pinned to bottom, horizontal drift only):

```html
<div class="parallax absolute inset-x-0 bottom-0 z-20" data-depth-x="30" data-depth-y="0" data-scroll="0">
  <img src="/images/mountains.png" alt="" aria-hidden="true"
       class="-ml-[6%] w-[112%] max-w-none object-contain">
</div>
```

Hero object (no parallax, idle bob, optional hotspots):

```html
<div class="absolute bottom-0 right-[-3%] z-30 w-[clamp(360px,62vw,1180px)]">
  <div class="van-bob relative w-full">
    <img src="/images/van.png" alt="Adventure-ready camper van" class="w-full">
    <button type="button" class="hotspot" style="left:42%; top:51%" aria-label="Slide the door, step into home">
      <span class="hotspot-ping"></span><span class="hotspot-dot"></span>
      <span class="hotspot-label">Slide the door, step into home</span>
    </button>
  </div>
</div>
```

Copy + CTA layer (in front of everything, transparent to clicks except the buttons):

```html
<div class="pointer-events-none absolute inset-x-0 bottom-0 z-40">
  <div class="mx-auto max-w-7xl px-6 pb-24">
    <!-- eyebrow, paragraph, then: -->
    <a href="#pricing" class="pointer-events-auto ...">Get the Course</a>
  </div>
</div>
```

`pointer-events-none` on the wrapper + `pointer-events-auto` on each button is what lets the hero-object hotspots underneath stay clickable.

## Atmosphere layers (all code, no images)

**Rotating star field** - a square sized `130vmax` (so its corners never show while rotating), centered on the hero, spun by CSS. Sits BEHIND the midground so stars vanish at the ridge:

```html
<div class="pointer-events-none absolute left-1/2 top-1/2 z-[3] h-[130vmax] w-[130vmax]
            -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
  <div class="spin-sky absolute inset-0"><!-- ~180 .sky-star spans --></div>
</div>
```

```css
.spin-sky { transform-origin: 50% 50%; will-change: transform; animation: spin-sky 220s linear infinite; }
@keyframes spin-sky { to { transform: rotate(360deg); } }
.sky-star { position: absolute; border-radius: 9999px; background: #CFE6FF; box-shadow: 0 0 3px #B4D6F78C; }
```

**Twinkling stars** - separate spans with per-star randomized delay/duration:

```css
.star {
  position: absolute; border-radius: 9999px; background: #CFE6FF;
  opacity: var(--star-op, .7); will-change: opacity, transform;
  box-shadow: 0 0 4px 1px #9CC4ECD9, 0 0 9px 2px #9CC4EC73;
  animation: star-twinkle ease-in-out infinite; /* delay + duration inline per star */
}
```

**Shooting stars** - gradient streaks, `width:150px; height:2px; background:linear-gradient(90deg,transparent,#B4D6F7D9 72%,#fff)`, `filter:drop-shadow(0 0 6px #9CC4ECE6)`, keyframed diagonally, placed at z-[7] so they die behind the ridge.

Stars are generated at build time (Astro/JSX loop or a small Node script), each span getting inline `left/top/width/height/opacity` plus `animation-delay/duration` from `Math.random()`. ~180 for the rotating field, ~60 for twinkle. Never generate them at runtime on every render.

**Haze/glow** - no image, just huge blurred ellipses parked on the ridgeline:

```html
<div class="parallax pointer-events-none absolute inset-x-0 bottom-[30%] z-[5] h-[42%]"
     data-depth-x="8" data-depth-y="4" data-scroll="-8">
  <div class="mx-auto h-full w-[88%] rounded-[100%] bg-[#9CC4EC] opacity-40 blur-[130px]"></div>
</div>
```

Two of these at different sizes/blurs (one tight at 55% width blur-100px opacity-20, one wide at 88% blur-130px opacity-40) fakes atmospheric perspective.

## Supporting animations

```css
.van-bob { animation: van-bob 6s ease-in-out infinite; }
@keyframes van-bob {
  0%, 100% { transform: translateY(0) rotate(0); }
  50%      { transform: translateY(-1.1%) rotate(-.25deg); }
}
@keyframes float-in { /* entrance for copy, staggered via animation-delay */
  0%  { opacity: 0; transform: translateY(12px); }
  to  { opacity: 1; transform: translateY(0); }
}
```

The bob's -0.25deg rotate is what makes it feel physical instead of a sine loop.

## Adaptation map

When the user's scene is not "van at night", keep every mechanic and swap content:

| Slot | Vanlife original | Any other scene |
|---|---|---|
| Background plate | Night sky | Sunset gradient, ocean, nebula, city dusk |
| Rotating field | Stars | Drifting clouds (slow translateX loop instead of rotate), snow, embers |
| Haze ellipses | Blue mist on ridge | Warm sun glow, fog bank, neon city glow |
| Midground cutout | Mountains + lake | Skyline, dunes, forest line, wave crest |
| Hero object | Van + hotspots | Product render, car, character, device |
| Headline behind cutout | VAN LIFESTYLE | Always keep - this is the signature move |

## Checklist before calling it done

- [ ] Headline visibly slides behind the midground cutout on scroll
- [ ] No edge/seam appears at any cursor position or scroll depth (oversize check)
- [ ] Midground base stays flush to section bottom while scrolling
- [ ] Hero object hotspots clickable through the copy layer
- [ ] `prefers-reduced-motion` kills the engine and all infinite animations
- [ ] Only transform/opacity animate; no layout properties
- [ ] Decorative images have `alt="" aria-hidden="true"`; hotspots have aria-labels
- [ ] Section uses `100svh` (not `h-screen`) with a `min-h` floor for short viewports
