const fs = require('fs');
const content = fs.readFileSync('products.html', 'utf8');

console.log('=== PRODUCTS.HTML AUDIT ===');
// Viewport
const vp = content.match(/<meta[^>]*name=["']viewport["'][^>]*>/i);
console.log('1. Viewport Meta:', vp ? vp[0] : 'MISSING');

// Shadows & Gradients
console.log('\n2. Shadows & Gradients:');
const shadowMatches = content.match(/class=["'][^"']*(?:shadow-(?:2xl|xl|lg|md)|drop-shadow|bg-gradient)[^"']*["']/gi) || [];
shadowMatches.forEach(m => console.log('  ', m));

// Copywriting checks
console.log('\n3. Copy Analysis:');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (/(seamless|cutting-edge|game-changing|ultimate|revolutionary|elevate|exclusive|pivotal|effortless|unlock|unleash|empower|future of|transform)/i.test(l)) {
    console.log(`  Line ${idx + 1}: ${l.trim()}`);
  }
});

// Interactive elements & dead scripts
console.log('\n4. Buttons, Links & Listeners:');
const btns = content.match(/<button[^>]*>/gi) || [];
btns.forEach(b => {
  const hasAction = /onclick|id=["']|type=["']submit["']/.test(b);
  if (!hasAction) {
    const classMatch = b.match(/class=["']([^"']+)["']/);
    console.log('  Button without inline action:', classMatch ? classMatch[1].slice(0, 50) : b.slice(0, 50));
  }
});

const links = content.match(/<a[^>]*>/gi) || [];
links.forEach(a => {
  const hrefMatch = a.match(/href=["']([^"']*)["']/);
  const href = hrefMatch ? hrefMatch[1] : '';
  if (!href || href === '#' || href === 'javascript:void(0)') {
    console.log('  Dead/empty link:', a);
  }
});
