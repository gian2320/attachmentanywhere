const fs = require('fs');
const content = fs.readFileSync('order.html', 'utf8');

console.log('=== ORDER.HTML AUDIT ===');
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

// Check if any script references missing DOM elements or dead functions
console.log('\n5. Scripts inspection in order.html:');
const scriptMatches = content.match(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi) || [];
scriptMatches.forEach((s, idx) => {
  console.log(`  Script #${idx + 1} length: ${s.length} chars`);
});
