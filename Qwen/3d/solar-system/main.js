// ============================================================
// 3D Solar System — main.js
// Uses Three.js r148 loaded via classic <script> tags
// Works directly from file:// — no server needed
// ============================================================

// ============================================================
// 1. PLANET DATA
// Sizes, orbital radii, speeds are artistically scaled for visual appeal
// while maintaining correct relative ordering.
// ============================================================

const PLANET_DATA = [
  {
    name: 'Mercury',
    radius: 0.35,
    orbitRadius: 8,
    orbitSpeed: 4.15,
    rotationSpeed: 0.005,
    color: 0xb0a090,
    tilt: 0.03,
    info: { diameter: '4,879 km', distance: '57.9M km', period: '88 days' }
  },
  {
    name: 'Venus',
    radius: 0.6,
    orbitRadius: 12,
    orbitSpeed: 1.62,
    rotationSpeed: -0.002,
    color: 0xe8c87a,
    tilt: 177.4 * Math.PI / 180,
    info: { diameter: '12,104 km', distance: '108.2M km', period: '225 days' }
  },
  {
    name: 'Earth',
    radius: 0.65,
    orbitRadius: 16,
    orbitSpeed: 1.0,
    rotationSpeed: 0.02,
    color: 0x4488cc,
    tilt: 23.4 * Math.PI / 180,
    info: { diameter: '12,756 km', distance: '149.6M km', period: '365.25 days' }
  },
  {
    name: 'Mars',
    radius: 0.45,
    orbitRadius: 21,
    orbitSpeed: 0.53,
    rotationSpeed: 0.019,
    color: 0xcc5533,
    tilt: 25.2 * Math.PI / 180,
    info: { diameter: '6,792 km', distance: '227.9M km', period: '687 days' }
  },
  {
    name: 'Jupiter',
    radius: 2.2,
    orbitRadius: 32,
    orbitSpeed: 0.084,
    rotationSpeed: 0.04,
    color: 0xd4a46a,
    tilt: 3.1 * Math.PI / 180,
    info: { diameter: '142,984 km', distance: '778.6M km', period: '11.86 years' }
  },
  {
    name: 'Saturn',
    radius: 1.8,
    orbitRadius: 44,
    orbitSpeed: 0.034,
    rotationSpeed: 0.038,
    color: 0xe8d5a0,
    tilt: 26.7 * Math.PI / 180,
    hasRings: true,
    info: { diameter: '120,536 km', distance: '1,433.5M km', period: '29.46 years' }
  },
  {
    name: 'Uranus',
    radius: 1.2,
    orbitRadius: 56,
    orbitSpeed: 0.012,
    rotationSpeed: 0.03,
    color: 0x88ccdd,
    tilt: 97.8 * Math.PI / 180,
    info: { diameter: '51,118 km', distance: '2,872.5M km', period: '84.01 years' }
  },
  {
    name: 'Neptune',
    radius: 1.15,
    orbitRadius: 66,
    orbitSpeed: 0.006,
    rotationSpeed: 0.028,
    color: 0x3355bb,
    tilt: 28.3 * Math.PI / 180,
    info: { diameter: '49,528 km', distance: '4,495.1M km', period: '164.8 years' }
  }
];

// ============================================================
// 2. GLOBALS
// ============================================================

let scene, camera, renderer, controls, composer;
let sun, sunGlow;
let planets = [];
let orbitLinesGroup;
let asteroidBelt;
let moon, moonOrbitAngle = 0;

let speedMultiplier = 1.0;
let paused = false;
let showOrbits = true;
let showLabels = true;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const tooltipEl = document.getElementById('planet-tooltip');
const tooltipName = document.getElementById('tooltip-name');
const tooltipStats = document.getElementById('tooltip-stats');
const labelsContainer = document.getElementById('labels-container');

const clock = new THREE.Clock();

// ============================================================
// 3. PROCEDURAL TEXTURE GENERATORS
// ============================================================

function createSunTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, '#fff8e0');
  grad.addColorStop(0.3, '#ffcc33');
  grad.addColorStop(0.7, '#ff8800');
  grad.addColorStop(1, '#cc4400');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 4 + 1;
    const alpha = Math.random() * 0.3;
    ctx.fillStyle = `rgba(255, ${150 + Math.random() * 100}, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function createEarthTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a4488';
  ctx.fillRect(0, 0, size, size / 2);

  const continents = [
    { x: 140, y: 80, w: 80, h: 60, c: '#338833' },
    { x: 150, y: 140, w: 50, h: 70, c: '#447733' },
    { x: 280, y: 80, w: 100, h: 80, c: '#338833' },
    { x: 380, y: 100, w: 60, h: 50, c: '#338833' },
    { x: 360, y: 160, w: 40, h: 70, c: '#447733' },
    { x: 420, y: 180, w: 50, h: 40, c: '#cc8844' },
  ];

  continents.forEach(c => {
    ctx.fillStyle = c.c;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, Math.random() * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#ddeeff';
  ctx.fillRect(0, 0, size, 15);
  ctx.fillRect(0, size / 2 - 15, size, 15);

  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(Math.random() * size, Math.random() * size / 2, Math.random() * 30 + 10, Math.random() * 8 + 2, Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function createJupiterTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d');

  const bands = [
    '#d4a46a', '#c89050', '#e0b878', '#b87840',
    '#d0a060', '#c08848', '#e8c888', '#a86830',
    '#d4a46a', '#c89050', '#e0b878', '#b87840',
    '#d0a060', '#c08848', '#e8c888', '#a86830',
  ];

  const bandH = (size / 2) / bands.length;
  bands.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, i * bandH, size, bandH + 1);
  });

  for (let i = 0; i < 800; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size / 2;
    const r = Math.random() * 6 + 1;
    ctx.fillStyle = `rgba(${180 + Math.random() * 75}, ${120 + Math.random() * 60}, ${50 + Math.random() * 50}, ${Math.random() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#cc5533';
  ctx.beginPath();
  ctx.ellipse(size * 0.6, size * 0.32, 25, 15, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#dd6644';
  ctx.beginPath();
  ctx.ellipse(size * 0.6, size * 0.32, 18, 10, 0.1, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function createMarsTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#cc5533';
  ctx.fillRect(0, 0, size, size / 2);

  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size / 2;
    const r = Math.random() * 8 + 1;
    const shade = Math.random();
    if (shade < 0.3) {
      ctx.fillStyle = `rgba(180, 60, 30, ${Math.random() * 0.4})`;
    } else if (shade < 0.6) {
      ctx.fillStyle = `rgba(220, 100, 50, ${Math.random() * 0.3})`;
    } else {
      ctx.fillStyle = `rgba(150, 50, 20, ${Math.random() * 0.3})`;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(230, 230, 240, 0.6)';
  ctx.fillRect(0, 0, size, 18);
  ctx.fillRect(0, size / 2 - 18, size, 18);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function createGenericTexture(baseColor, variation = 30) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext('2d');

  const r = (baseColor >> 16) & 0xff;
  const g = (baseColor >> 8) & 0xff;
  const b = baseColor & 0xff;

  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, size, size / 2);

  for (let i = 0; i < 600; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size / 2;
    const rad = Math.random() * 5 + 1;
    const dr = (Math.random() - 0.5) * variation;
    const dg = (Math.random() - 0.5) * variation;
    const db = (Math.random() - 0.5) * variation;
    ctx.fillStyle = `rgba(${Math.max(0, Math.min(255, r + dr))}, ${Math.max(0, Math.min(255, g + dg))}, ${Math.max(0, Math.min(255, b + db))}, ${Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function createSaturnRingTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, 64);

  for (let x = 0; x < size; x++) {
    const t = x / size;
    let alpha = 0;
    let brightness = 0;

    if (t > 0.0 && t < 0.2) {
      alpha = 0.3;
      brightness = 160;
    } else if (t > 0.2 && t < 0.5) {
      alpha = 0.8;
      brightness = 200;
    } else if (t > 0.5 && t < 0.55) {
      alpha = 0.05;
      brightness = 100;
    } else if (t > 0.55 && t < 0.8) {
      alpha = 0.6;
      brightness = 180;
    } else if (t > 0.8 && t < 0.82) {
      alpha = 0.05;
      brightness = 100;
    } else if (t > 0.82 && t < 0.9) {
      alpha = 0.3;
      brightness = 170;
    }

    alpha += (Math.random() - 0.5) * 0.1;
    alpha = Math.max(0, Math.min(1, alpha));

    ctx.fillStyle = `rgba(${brightness + 30}, ${brightness + 10}, ${brightness - 20}, ${alpha})`;
    ctx.fillRect(x, 0, 1, 64);
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// ============================================================
// 4. INIT
// ============================================================

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(30, 50, 70);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 10;
  controls.maxDistance = 200;
  controls.target.set(0, 0, 0);

  // Post-processing: bloom
  composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene, camera));

  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
  );
  composer.addPass(bloomPass);

  setupLighting();
  createStarfield();
  createSun();
  createPlanets();
  createAsteroidBelt();

  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('click', onCanvasClick);
  setupHUD();

  animate();
}

// ============================================================
// 5. LIGHTING
// ============================================================

function setupLighting() {
  const sunLight = new THREE.PointLight(0xffffff, 3, 300, 0.5);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  const ambient = new THREE.AmbientLight(0x222233, 0.4);
  scene.add(ambient);
}

// ============================================================
// 6. STARFIELD
// ============================================================

function createStarfield() {
  const count = 6000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 500 + Math.random() * 300;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const colorChoice = Math.random();
    if (colorChoice < 0.6) {
      colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 1;
    } else if (colorChoice < 0.8) {
      colors[i * 3] = 0.8; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 1;
    } else {
      colors[i * 3] = 1; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 0.8;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
  });

  scene.add(new THREE.Points(geometry, material));
}

// ============================================================
// 7. SUN
// ============================================================

function createSun() {
  const sunGeo = new THREE.SphereGeometry(4, 64, 64);
  const sunTex = createSunTexture();
  const sunMat = new THREE.MeshBasicMaterial({ map: sunTex, color: 0xffcc44 });
  sun = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sun);

  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 256;
  glowCanvas.height = 256;
  const ctx = glowCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 200, 80, 0.6)');
  grad.addColorStop(0.3, 'rgba(255, 150, 30, 0.3)');
  grad.addColorStop(0.7, 'rgba(255, 100, 0, 0.1)');
  grad.addColorStop(1, 'rgba(255, 50, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const glowTex = new THREE.CanvasTexture(glowCanvas);
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  sunGlow = new THREE.Sprite(glowMat);
  sunGlow.scale.set(22, 22, 1);
  sun.add(sunGlow);
}

// ============================================================
// 8. PLANETS
// ============================================================

function createPlanets() {
  orbitLinesGroup = new THREE.Group();
  scene.add(orbitLinesGroup);

  PLANET_DATA.forEach((data, index) => {
    const planetGroup = new THREE.Group();

    const geo = new THREE.SphereGeometry(data.radius, 48, 48);

    let texture;
    if (data.name === 'Earth') {
      texture = createEarthTexture();
    } else if (data.name === 'Jupiter') {
      texture = createJupiterTexture();
    } else if (data.name === 'Mars') {
      texture = createMarsTexture();
    } else {
      texture = createGenericTexture(data.color);
    }

    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.1
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = { planetIndex: index, planetData: data };
    mesh.rotation.z = data.tilt || 0;
    planetGroup.add(mesh);

    if (data.hasRings) {
      const ringGeo = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.5, 128);
      fixRingUV(ringGeo);
      const ringTex = createSaturnRingTexture();
      const ringMat = new THREE.MeshBasicMaterial({
        map: ringTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      planetGroup.add(ring);
    }

    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * data.orbitRadius;
    const z = Math.sin(angle) * data.orbitRadius;
    planetGroup.position.set(x, 0, z);

    scene.add(planetGroup);

    // Orbit line
    const orbitCurve = new THREE.EllipseCurve(0, 0, data.orbitRadius, data.orbitRadius, 0, 2 * Math.PI, false, 0);
    const orbitPoints = orbitCurve.getPoints(256);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
    );
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x4466aa,
      transparent: true,
      opacity: 0.25
    });
    const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
    orbitLinesGroup.add(orbitLine);

    // DOM label
    const labelEl = document.createElement('div');
    labelEl.className = 'planet-label';
    labelEl.textContent = data.name;
    labelsContainer.appendChild(labelEl);

    planets.push({ mesh, group: planetGroup, orbitLine, data, angle, labelEl });
  });

  createMoon();
}

function fixRingUV(geometry) {
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const dist = Math.sqrt(x * x + y * y);
    const u = (dist - 1.4) / (2.5 - 1.4);
    uv.setXY(i, u, 0.5);
  }
  uv.needsUpdate = true;
}

// ============================================================
// 9. MOON
// ============================================================

function createMoon() {
  const moonGeo = new THREE.SphereGeometry(0.18, 32, 32);
  const moonMat = new THREE.MeshStandardMaterial({
    color: 0xbbbbbb,
    roughness: 0.9,
    metalness: 0.0
  });
  moon = new THREE.Mesh(moonGeo, moonMat);
  moonOrbitAngle = 0;
  scene.add(moon);
}

// ============================================================
// 10. ASTEROID BELT
// ============================================================

function createAsteroidBelt() {
  const count = 2000;
  const positions = new Float32Array(count * 3);

  const innerR = 24;
  const outerR = 29;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = innerR + Math.random() * (outerR - innerR);
    const y = (Math.random() - 0.5) * 1.5;

    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * r;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0x888877,
    size: 0.25,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
  });

  asteroidBelt = new THREE.Points(geo, mat);
  scene.add(asteroidBelt);
}

// ============================================================
// 11. HUD CONTROLS
// ============================================================

function setupHUD() {
  const speedSlider = document.getElementById('speed-slider');
  const speedValue = document.getElementById('speed-value');
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');
  const btnToggleOrbits = document.getElementById('btn-toggle-orbits');
  const btnToggleLabels = document.getElementById('btn-toggle-labels');

  speedSlider.addEventListener('input', () => {
    speedMultiplier = parseFloat(speedSlider.value);
    speedValue.textContent = speedMultiplier.toFixed(1) + 'x';
  });

  btnPause.addEventListener('click', () => {
    paused = !paused;
    btnPause.textContent = paused ? 'Play' : 'Pause';
  });

  btnReset.addEventListener('click', () => {
    camera.position.set(30, 50, 70);
    controls.target.set(0, 0, 0);
    controls.update();
  });

  btnToggleOrbits.addEventListener('click', () => {
    showOrbits = !showOrbits;
    orbitLinesGroup.visible = showOrbits;
    btnToggleOrbits.textContent = showOrbits ? 'Orbits: ON' : 'Orbits: OFF';
    btnToggleOrbits.classList.toggle('active', showOrbits);
  });

  btnToggleLabels.addEventListener('click', () => {
    showLabels = !showLabels;
    labelsContainer.style.display = showLabels ? 'block' : 'none';
    btnToggleLabels.textContent = showLabels ? 'Labels: ON' : 'Labels: OFF';
    btnToggleLabels.classList.toggle('active', showLabels);
  });
}

// ============================================================
// 12. RAYCASTING
// ============================================================

function onCanvasClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const meshes = planets.map(p => p.mesh);
  meshes.push(sun);
  const intersects = raycaster.intersectObjects(meshes);

  if (intersects.length > 0) {
    const hit = intersects[0].object;

    if (hit === sun) {
      showTooltip(event.clientX, event.clientY, 'Sun', {
        diameter: '1,391,000 km',
        distance: '0 km (center)',
        period: 'N/A'
      });
    } else if (hit.userData.planetData) {
      const d = hit.userData.planetData;
      showTooltip(event.clientX, event.clientY, d.name, d.info);
    }
  } else {
    hideTooltip();
  }
}

function showTooltip(x, y, name, info) {
  tooltipName.textContent = name;
  tooltipStats.innerHTML =
    `<span>Diameter:</span> ${info.diameter}<br>` +
    `<span>Distance from Sun:</span> ${info.distance}<br>` +
    `<span>Orbital Period:</span> ${info.period}`;

  tooltipEl.classList.remove('hidden');

  const tw = 220;
  const th = 120;
  let tx = x + 15;
  let ty = y - 10;
  if (tx + tw > window.innerWidth) tx = x - tw - 15;
  if (ty + th > window.innerHeight) ty = y - th - 10;
  tooltipEl.style.left = tx + 'px';
  tooltipEl.style.top = ty + 'px';
}

function hideTooltip() {
  tooltipEl.classList.add('hidden');
}

// ============================================================
// 13. RESIZE
// ============================================================

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================================
// 14. ANIMATION LOOP
// ============================================================

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (!paused) {
    const dt = delta * speedMultiplier;

    sun.rotation.y += dt * 0.1;

    planets.forEach((planet) => {
      planet.angle += planet.data.orbitSpeed * dt * 0.15;
      const x = Math.cos(planet.angle) * planet.data.orbitRadius;
      const z = Math.sin(planet.angle) * planet.data.orbitRadius;
      planet.group.position.set(x, 0, z);
      planet.mesh.rotation.y += planet.data.rotationSpeed * speedMultiplier;
    });

    // Moon orbiting Earth
    const earthPlanet = planets[2];
    if (earthPlanet) {
      moonOrbitAngle += dt * 2.5;
      const moonDist = 2.0;
      const earthPos = earthPlanet.group.position;
      moon.position.set(
        earthPos.x + Math.cos(moonOrbitAngle) * moonDist,
        0.3,
        earthPos.z + Math.sin(moonOrbitAngle) * moonDist
      );
    }

    if (asteroidBelt) {
      asteroidBelt.rotation.y += dt * 0.005;
    }
  }

  controls.update();
  updateLabels();
  composer.render();
}

// ============================================================
// 15. LABEL POSITIONING
// ============================================================

function updateLabels() {
  planets.forEach((planet) => {
    const pos = planet.group.position.clone();
    pos.y += planet.data.radius + 0.8;

    pos.project(camera);

    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;

    if (pos.z > 1) {
      planet.labelEl.style.opacity = '0';
      return;
    }

    planet.labelEl.style.left = x + 'px';
    planet.labelEl.style.top = y + 'px';
    planet.labelEl.style.opacity = showLabels ? '1' : '0';
  });
}

// ============================================================
// 16. START
// ============================================================

init();
