/**
 * 3D Solar System Simulation
 * Built with Three.js
 */

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

// Planet data with scaled values for visualization
const PLANET_DATA = {
    Sun: {
        radius: 8,
        distance: 0,
        speed: 0,
        rotationSpeed: 0.002,
        color: 0xFFAA00,
        emissive: 0xFF5500,
        diameter: "1,392,700 km",
        distanceFromSun: "0 km",
        period: "N/A",
        hasRings: false
    },
    Mercury: {
        radius: 1.2,
        distance: 18,
        speed: 0.04,
        rotationSpeed: 0.005,
        color: 0xA5A5A5,
        diameter: "4,879 km",
        distanceFromSun: "57.9 million km",
        period: "88 days",
        hasRings: false
    },
    Venus: {
        radius: 1.8,
        distance: 26,
        speed: 0.015,
        rotationSpeed: 0.002,
        color: 0xE6B87D,
        diameter: "12,104 km",
        distanceFromSun: "108.2 million km",
        period: "225 days",
        hasRings: false
    },
    Earth: {
        radius: 1.9,
        distance: 36,
        speed: 0.01,
        rotationSpeed: 0.02,
        color: 0x2288CC,
        diameter: "12,742 km",
        distanceFromSun: "149.6 million km",
        period: "365.25 days",
        hasRings: false,
        hasMoon: true
    },
    Mars: {
        radius: 1.4,
        distance: 48,
        speed: 0.008,
        rotationSpeed: 0.018,
        color: 0xCC4422,
        diameter: "6,779 km",
        distanceFromSun: "227.9 million km",
        period: "687 days",
        hasRings: false
    },
    Jupiter: {
        radius: 5,
        distance: 70,
        speed: 0.004,
        rotationSpeed: 0.04,
        color: 0xD4A574,
        diameter: "139,820 km",
        distanceFromSun: "778.5 million km",
        period: "11.9 years",
        hasRings: false
    },
    Saturn: {
        radius: 4.2,
        distance: 95,
        speed: 0.003,
        rotationSpeed: 0.038,
        color: 0xE8D4A8,
        diameter: "116,460 km",
        distanceFromSun: "1.43 billion km",
        period: "29.5 years",
        hasRings: true
    },
    Uranus: {
        radius: 3,
        distance: 120,
        speed: 0.002,
        rotationSpeed: 0.03,
        color: 0x88DDDD,
        diameter: "50,724 km",
        distanceFromSun: "2.87 billion km",
        period: "84 years",
        hasRings: false,
        tilt: 0.7 // Axial tilt
    },
    Neptune: {
        radius: 2.9,
        distance: 145,
        speed: 0.001,
        rotationSpeed: 0.032,
        color: 0x4466DD,
        diameter: "49,244 km",
        distanceFromSun: "4.5 billion km",
        period: "164.8 years",
        hasRings: false
    }
};

// Simulation state
let scene, camera, renderer, controls;
let planets = [];
let orbits = [];
let asteroidBelt;
let moon;
let speedMultiplier = 1;
let showOrbits = true;
let showLabels = false;
let raycaster, mouse;
let labels = [];
let labelElements = {};

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0005);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );
    camera.position.set(0, 80, 150);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Create orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 500;

    // Set up raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Create scene elements
    createStarfield();
    createLighting();
    createSun();
    createPlanets();
    createAsteroidBelt();
    createLabels();

    // Set up event listeners
    setupEventListeners();

    // Start animation loop
    animate();
}

// ============================================
// SCENE CREATION FUNCTIONS
// ============================================

function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 8000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;

        // Random position in sphere
        const radius = 500 + Math.random() * 1000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        // Star colors (mostly white with slight variations)
        const color = new THREE.Color();
        const temp = Math.random();
        if (temp < 0.7) {
            color.setHSL(0, 0, 0.8 + Math.random() * 0.2); // White
        } else if (temp < 0.85) {
            color.setHSL(0.6, 0.3, 0.8); // Blue-ish
        } else {
            color.setHSL(0.1, 0.3, 0.8); // Yellow-ish
        }
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    const starfield = new THREE.Points(starGeometry, starMaterial);
    scene.add(starfield);
}

function createLighting() {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Point light from the Sun
    const sunLight = new THREE.PointLight(0xFFFFFF, 2, 400);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);
}

function createSun() {
    const sunData = PLANET_DATA.Sun;

    // Sun geometry and material
    const geometry = new THREE.SphereGeometry(sunData.radius, 64, 64);
    const material = new THREE.MeshBasicMaterial({
        color: sunData.color,
        emissive: sunData.emissive,
        emissiveIntensity: 0.5
    });

    const sun = new THREE.Mesh(geometry, material);
    sun.name = 'Sun';
    scene.add(sun);

    // Glow effect using larger sphere with transparent material
    const glowGeometry = new THREE.SphereGeometry(sunData.radius * 1.3, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFAA00,
        transparent: true,
        opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sun.add(glow);

    // Outer glow
    const outerGlowGeometry = new THREE.SphereGeometry(sunData.radius * 1.6, 32, 32);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF8800,
        transparent: true,
        opacity: 0.1
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    sun.add(outerGlow);

    // Store sun data
    sun.userData = sunData;
    planets.push(sun);
}

function createPlanets() {
    Object.keys(PLANET_DATA).forEach(name => {
        if (name === 'Sun') return;

        const data = PLANET_DATA[name];

        // Create planet group for orbital rotation
        const planetGroup = new THREE.Group();
        scene.add(planetGroup);

        // Create planet mesh
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: data.color,
            shininess: 30
        });

        const planet = new THREE.Mesh(geometry, material);
        planet.position.x = data.distance;
        planet.name = name;
        planet.userData = data;
        planet.castShadow = true;
        planet.receiveShadow = true;

        // Apply axial tilt for Uranus
        if (data.tilt) {
            planet.rotation.z = data.tilt;
        }

        planetGroup.add(planet);

        // Store planet reference
        planets.push(planet);

        // Create orbital path
        createOrbit(data.distance);

        // Create Saturn's rings
        if (data.hasRings) {
            createSaturnRings(planet, data.radius);
        }

        // Create Earth's moon
        if (data.hasMoon) {
            createMoon(planet, data.radius);
        }
    });
}

function createOrbit(distance) {
    const curve = new THREE.EllipseCurve(
        0, 0,
        distance, distance,
        0, 2 * Math.PI,
        false,
        0
    );

    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
    );

    const material = new THREE.LineBasicMaterial({
        color: 0x4466AA,
        transparent: true,
        opacity: 0.3
    });

    const orbit = new THREE.Line(geometry, material);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
    orbits.push(orbit);
}

function createSaturnRings(planet, planetRadius) {
    const innerRadius = planetRadius * 1.4;
    const outerRadius = planetRadius * 2.2;

    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    const material = new THREE.MeshPhongMaterial({
        color: 0xC4A77D,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });

    const rings = new THREE.Mesh(geometry, material);
    rings.rotation.x = Math.PI / 2;
    planet.add(rings);
}

function createMoon(earthPlanet, earthRadius) {
    const moonRadius = earthRadius * 0.27;
    const moonDistance = earthRadius * 4;

    const geometry = new THREE.SphereGeometry(moonRadius, 16, 16);
    const material = new THREE.MeshPhongMaterial({
        color: 0xDDDDDD,
        shininess: 10
    });

    moon = new THREE.Mesh(geometry, material);
    moon.position.x = moonDistance;
    moon.name = 'Moon';
    moon.userData = {
        diameter: "3,474 km",
        distanceFromSun: "149.6 million km (orbits Earth)",
        period: "27.3 days",
        orbitDistance: moonDistance,
        orbitSpeed: 0.05
    };

    earthPlanet.add(moon);
}

function createAsteroidBelt() {
    const asteroidCount = 300;
    const innerRadius = 55;
    const outerRadius = 65;

    const asteroidGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const asteroidMaterial = new THREE.MeshPhongMaterial({
        color: 0x666666,
        shininess: 5
    });

    asteroidBelt = new THREE.Group();

    for (let i = 0; i < asteroidCount; i++) {
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 4;

        asteroid.position.x = Math.cos(angle) * radius;
        asteroid.position.z = Math.sin(angle) * radius;
        asteroid.position.y = height;

        asteroid.rotation.x = Math.random() * Math.PI;
        asteroid.rotation.y = Math.random() * Math.PI;

        asteroidBelt.add(asteroid);
    }

    scene.add(asteroidBelt);
}

function createLabels() {
    Object.keys(PLANET_DATA).forEach(name => {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'planet-label hidden';
        labelDiv.textContent = name;
        document.body.appendChild(labelDiv);
        labelElements[name] = labelDiv;
    });

    // Add Moon label
    const moonLabel = document.createElement('div');
    moonLabel.className = 'planet-label hidden';
    moonLabel.textContent = 'Moon';
    document.body.appendChild(moonLabel);
    labelElements['Moon'] = moonLabel;
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', onWindowResize, false);

    // Mouse click for planet selection
    renderer.domElement.addEventListener('click', onMouseClick, false);

    // Speed slider
    const speedSlider = document.getElementById('speed-slider');
    speedSlider.addEventListener('input', (e) => {
        speedMultiplier = parseFloat(e.target.value);
        document.getElementById('speed-value').textContent = speedMultiplier + 'x';
    });

    // Toggle orbits button
    document.getElementById('toggle-orbits').addEventListener('click', () => {
        showOrbits = !showOrbits;
        orbits.forEach(orbit => {
            orbit.visible = showOrbits;
        });
        document.getElementById('toggle-orbits').textContent =
            showOrbits ? 'Hide Orbits' : 'Show Orbits';
    });

    // Toggle labels button
    document.getElementById('toggle-labels').addEventListener('click', () => {
        showLabels = !showLabels;
        Object.values(labelElements).forEach(label => {
            label.classList.toggle('hidden', !showLabels);
        });
        document.getElementById('toggle-labels').textContent =
            showLabels ? 'Hide Labels' : 'Show Labels';
    });

    // Reset camera button
    document.getElementById('reset-camera').addEventListener('click', () => {
        camera.position.set(0, 80, 150);
        controls.target.set(0, 0, 0);
        controls.update();
        hidePlanetInfo();
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    // Find intersections with planets
    const intersects = raycaster.intersectObjects(planets);

    if (intersects.length > 0) {
        const planet = intersects[0].object;
        showPlanetInfo(planet, event.clientX, event.clientY);
    } else {
        // Check for moon intersection
        if (moon) {
            const moonIntersects = raycaster.intersectObject(moon);
            if (moonIntersects.length > 0) {
                showPlanetInfo(moon, event.clientX, event.clientY);
            } else {
                hidePlanetInfo();
            }
        } else {
            hidePlanetInfo();
        }
    }
}

function showPlanetInfo(planet, x, y) {
    const info = document.getElementById('planet-info');
    const data = planet.userData;

    document.getElementById('planet-name').textContent = planet.name;
    document.getElementById('planet-diameter').textContent = data.diameter;
    document.getElementById('planet-distance').textContent = data.distanceFromSun;
    document.getElementById('planet-period').textContent = data.period;

    // Position tooltip near click but keep on screen
    const offsetX = x + 20 > window.innerWidth - 250 ? x - 260 : x + 20;
    const offsetY = y + 20 > window.innerHeight - 150 ? y - 160 : y + 20;

    info.style.left = offsetX + 'px';
    info.style.top = offsetY + 'px';
    info.classList.remove('hidden');
}

function hidePlanetInfo() {
    document.getElementById('planet-info').classList.add('hidden');
}

// ============================================
// ANIMATION LOOP
// ============================================

function animate() {
    requestAnimationFrame(animate);

    // Rotate planets around their axes and around the Sun
    planets.forEach(planet => {
        const data = planet.userData;

        // Self-rotation
        planet.rotation.y += data.rotationSpeed * speedMultiplier;

        // Orbital revolution (except for Sun)
        if (data.distance > 0) {
            const time = Date.now() * 0.001;
            const angle = time * data.speed * speedMultiplier;
            planet.position.x = Math.cos(angle) * data.distance;
            planet.position.z = Math.sin(angle) * data.distance;
        }
    });

    // Animate moon
    if (moon) {
        const moonData = moon.userData;
        const time = Date.now() * 0.001;
        const moonAngle = time * moonData.orbitSpeed * speedMultiplier;
        moon.position.x = Math.cos(moonAngle) * moonData.orbitDistance;
        moon.position.z = Math.sin(moonAngle) * moonData.orbitDistance;
        moon.rotation.y += 0.01 * speedMultiplier;
    }

    // Rotate asteroid belt slowly
    if (asteroidBelt) {
        asteroidBelt.rotation.y += 0.0005 * speedMultiplier;
    }

    // Update labels position
    if (showLabels) {
        updateLabels();
    }

    controls.update();
    renderer.render(scene, camera);
}

function updateLabels() {
    planets.forEach(planet => {
        const label = labelElements[planet.name];
        if (label) {
            const position = planet.position.clone();
            position.y += planet.userData.radius + 2;
            position.project(camera);

            const x = (position.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-(position.y * 0.5) + 0.5) * window.innerHeight;

            label.style.left = x + 'px';
            label.style.top = y + 'px';
        }
    });

    // Update moon label
    if (moon && labelElements['Moon']) {
        const worldPosition = new THREE.Vector3();
        moon.getWorldPosition(worldPosition);
        worldPosition.y += moon.userData.orbitDistance * 0.3;
        worldPosition.project(camera);

        const x = (worldPosition.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(worldPosition.y * 0.5) + 0.5) * window.innerHeight;

        labelElements['Moon'].style.left = x + 'px';
        labelElements['Moon'].style.top = y + 'px';
    }
}

// ============================================
// START THE SIMULATION
// ============================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
