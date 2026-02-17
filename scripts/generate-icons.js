const sharp = require('sharp');
const path = require('path');

// Stylized atom logo SVG — gold orbits + nucleus on dark background
const createAtomSVG = (size, padding = 0) => {
  const viewBox = size;
  const cx = viewBox / 2;
  const cy = viewBox / 2;
  const nucleusR = viewBox * 0.06;
  const orbitRx = viewBox * 0.32;
  const orbitRy = viewBox * 0.12;
  const electronR = viewBox * 0.03;
  const strokeW = viewBox * 0.018;

  // Electron positions along each orbit (parametric angle)
  const electrons = [
    { angle: 45, rotation: 0 },
    { angle: 200, rotation: 60 },
    { angle: 320, rotation: -60 },
  ];

  const electronDots = electrons.map(({ angle, rotation }) => {
    const rad = (angle * Math.PI) / 180;
    const ex = cx + orbitRx * Math.cos(rad);
    const ey = cy + orbitRy * Math.sin(rad);
    // Rotate the point around center
    const rotRad = (rotation * Math.PI) / 180;
    const dx = ex - cx;
    const dy = ey - cy;
    const rx = dx * Math.cos(rotRad) - dy * Math.sin(rotRad) + cx;
    const ry = dx * Math.sin(rotRad) + dy * Math.cos(rotRad) + cy;
    return `<circle cx="${rx}" cy="${ry}" r="${electronR}" fill="#E8C97A" />`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${viewBox}" height="${viewBox}" viewBox="0 0 ${viewBox} ${viewBox}">
  <rect width="${viewBox}" height="${viewBox}" fill="#1A1A2E" rx="${viewBox * 0.18}"/>

  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8C97A"/>
      <stop offset="50%" stop-color="#D4A44C"/>
      <stop offset="100%" stop-color="#C25B28"/>
    </linearGradient>
    <linearGradient id="nucleusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8C97A"/>
      <stop offset="100%" stop-color="#D4A44C"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="${viewBox * 0.008}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Orbit 1: horizontal -->
  <ellipse cx="${cx}" cy="${cy}" rx="${orbitRx}" ry="${orbitRy}"
    fill="none" stroke="url(#goldGrad)" stroke-width="${strokeW}"
    opacity="0.7" transform="rotate(0 ${cx} ${cy})" filter="url(#glow)"/>

  <!-- Orbit 2: rotated 60deg -->
  <ellipse cx="${cx}" cy="${cy}" rx="${orbitRx}" ry="${orbitRy}"
    fill="none" stroke="url(#goldGrad)" stroke-width="${strokeW}"
    opacity="0.7" transform="rotate(60 ${cx} ${cy})" filter="url(#glow)"/>

  <!-- Orbit 3: rotated -60deg -->
  <ellipse cx="${cx}" cy="${cy}" rx="${orbitRx}" ry="${orbitRy}"
    fill="none" stroke="url(#goldGrad)" stroke-width="${strokeW}"
    opacity="0.7" transform="rotate(-60 ${cx} ${cy})" filter="url(#glow)"/>

  <!-- Nucleus -->
  <circle cx="${cx}" cy="${cy}" r="${nucleusR}" fill="url(#nucleusGrad)" filter="url(#glow)"/>
  <circle cx="${cx}" cy="${cy}" r="${nucleusR * 0.5}" fill="#1A1A2E" opacity="0.3"/>

  <!-- Electrons -->
  ${electronDots.join('\n  ')}
</svg>`;
};

// Favicon variant — no rounded corners, smaller
const createFaviconSVG = (size) => {
  const svg = createAtomSVG(size);
  // Replace the rounded rect with a plain rect for favicon
  return svg.replace(`rx="${size * 0.18}"`, 'rx="0"');
};

async function generate() {
  const outDir = path.join(__dirname, '..', 'assets', 'images');

  // icon.png — 1024x1024
  await sharp(Buffer.from(createAtomSVG(1024)))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outDir, 'icon.png'));
  console.log('Generated icon.png (1024x1024)');

  // adaptive-icon.png — 1024x1024 (Android adaptive, same design)
  await sharp(Buffer.from(createAtomSVG(1024)))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outDir, 'adaptive-icon.png'));
  console.log('Generated adaptive-icon.png (1024x1024)');

  // splash-icon.png — 1024x1024
  await sharp(Buffer.from(createAtomSVG(1024)))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outDir, 'splash-icon.png'));
  console.log('Generated splash-icon.png (1024x1024)');

  // favicon.png — 48x48
  await sharp(Buffer.from(createFaviconSVG(512)))
    .resize(48, 48)
    .png()
    .toFile(path.join(outDir, 'favicon.png'));
  console.log('Generated favicon.png (48x48)');
}

generate().catch(console.error);
