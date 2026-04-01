const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 180, 300);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 30;
controls.maxDistance = 800;
controls.enablePan = false;

const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);
const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.7;
bloomPass.strength = 1.2;
bloomPass.radius = 0.6;
composer.addPass(bloomPass);

const ambientLight = new THREE.AmbientLight(0x222233, 0.15);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2.5, 2000);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const planets = [];
const orbitLines = [];
const planetMeshes = [];
let speedMultiplier = 1.0;
let isPaused = false;

const PLANET_DATA = {
    Sun: {
        radius: 12,
        color: 0xffdd44,
        emissive: 0xffaa00,
        orbitRadius: 0,
        speed: 0,
        rotationSpeed: 0.001,
        diameter: '1,392,700 km',
        distance: '0 km',
        period: 'N/A',
        isSun: true
    },
    Mercury: {
        radius: 1.2,
        color: 0xaaaaaa,
        orbitRadius: 25,
        speed: 0.025,
        rotationSpeed: 0.005,
        diameter: '4,879 km',
        distance: '57.9 million km',
        period: '88 days'
    },
    Venus: {
        radius: 2.0,
        color: 0xddaa55,
        orbitRadius: 38,
        speed: 0.018,
        rotationSpeed: 0.002,
        diameter: '12,104 km',
        distance: '108.2 million km',
        period: '225 days'
    },
    Earth: {
        radius: 2.2,
        color: 0x4488ff,
        orbitRadius: 52,
        speed: 0.014,
        rotationSpeed: 0.01,
        diameter: '12,742 km',
        distance: '149.6 million km',
        period: '365 days',
        hasMoon: true
    },
    Mars: {
        radius: 1.6,
        color: 0xcc4422,
        orbitRadius: 68,
        speed: 0.011,
        rotationSpeed: 0.009,
        diameter: '6,779 km',
        distance: '227.9 million km',
        period: '687 days'
    },
    Jupiter: {
        radius: 6.5,
        color: 0xd4a574,
        orbitRadius: 105,
        speed: 0.005,
        rotationSpeed: 0.02,
        diameter: '139,820 km',
        distance: '778.5 million km',
        period: '11.9 years'
    },
    Saturn: {
        radius: 5.5,
        color: 0xeebb77,
        orbitRadius: 145,
        speed: 0.004,
        rotationSpeed: 0.018,
        diameter: '116,460 km',
        distance: '1.43 billion km',
        period: '29.5 years',
        hasRings: true
    },
    Uranus: {
        radius: 3.5,
        color: 0x88ccdd,
        orbitRadius: 185,
        speed: 0.003,
        rotationSpeed: 0.012,
        diameter: '50,724 km',
        distance: '2.87 billion km',
        period: '84 years',
        axialTilt: Math.PI / 2.5
    },
    Neptune: {
        radius: 3.3,
        color: 0x3355ee,
        orbitRadius: 220,
        speed: 0.002,
        rotationSpeed: 0.011,
        diameter: '49,244 km',
        distance: '4.5 billion km',
        period: '165 years'
    }
};

function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const count = 6000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const r = 800 + Math.random() * 1200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const brightness = 0.5 + Math.random() * 0.5;
        colors[i * 3] = brightness;
        colors[i * 3 + 1] = brightness;
        colors[i * 3 + 2] = brightness + Math.random() * 0.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

function createSun(data) {
    const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
    const material = new THREE.MeshBasicMaterial({
        color: data.color
    });
    const sun = new THREE.Mesh(geometry, material);
    sun.userData = { ...data, name: 'Sun', angle: 0 };
    scene.add(sun);
    planets.push(sun);
    planetMeshes.push(sun);

    const glowGeometry = new THREE.SphereGeometry(data.radius * 1.3, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sun.add(glow);

    const glow2Geometry = new THREE.SphereGeometry(data.radius * 1.8, 32, 32);
    const glow2Material = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide
    });
    const glow2 = new THREE.Mesh(glow2Geometry, glow2Material);
    sun.add(glow2);
}

function createOrbit(radius) {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(128);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0x444477,
        transparent: true,
        opacity: 0.25
    });
    const orbit = new THREE.LineLoop(geometry, material);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
    orbitLines.push(orbit);
}

function createPlanet(name, data) {
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.8,
        metalness: 0.1
    });
    const planet = new THREE.Mesh(geometry, material);

    const pivot = new THREE.Object3D();
    scene.add(pivot);
    planet.position.x = data.orbitRadius;
    pivot.add(planet);

    if (data.axialTilt) {
        planet.rotation.z = data.axialTilt;
    }

    planet.userData = { ...data, name: name, angle: Math.random() * Math.PI * 2, pivot: pivot };
    planets.push(planet);
    planetMeshes.push(planet);

    if (data.orbitRadius > 0) {
        createOrbit(data.orbitRadius);
    }

    if (data.hasRings) {
        const innerRadius = data.radius * 1.4;
        const outerRadius = data.radius * 2.4;
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0xccaa88,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
    }

    if (data.hasMoon) {
        const moonGeometry = new THREE.SphereGeometry(data.radius * 0.27, 16, 16);
        const moonMaterial = new THREE.MeshStandardMaterial({
            color: 0x999999,
            roughness: 0.9
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        const moonPivot = new THREE.Object3D();
        planet.add(moonPivot);
        moon.position.x = data.radius * 3.5;
        moonPivot.add(moon);
        planet.userData.moon = { pivot: moonPivot, speed: 0.05, angle: 0 };
    }

    return planet;
}

function createAsteroidBelt() {
    const geometry = new THREE.BufferGeometry();
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const innerRadius = 82;
    const outerRadius = 92;

    for (let i = 0; i < count; i++) {
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const theta = Math.random() * Math.PI * 2;
        const spread = (Math.random() - 0.5) * 4;

        positions[i * 3] = radius * Math.cos(theta);
        positions[i * 3 + 1] = spread;
        positions[i * 3 + 2] = radius * Math.sin(theta);

        const gray = 0.3 + Math.random() * 0.3;
        colors[i * 3] = gray;
        colors[i * 3 + 1] = gray * 0.9;
        colors[i * 3 + 2] = gray * 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });

    const asteroids = new THREE.Points(geometry, material);
    scene.add(asteroids);
}

createStarfield();
createSun(PLANET_DATA.Sun);

Object.entries(PLANET_DATA).forEach(function(entry) {
    var name = entry[0];
    var data = entry[1];
    if (name !== 'Sun') {
        createPlanet(name, data);
    }
});

createAsteroidBelt();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        const planet = intersects[0].object;
        showPlanetInfo(planet.userData);
    }
}

function showPlanetInfo(data) {
    document.getElementById('info-name').textContent = data.name;
    document.getElementById('info-diameter').textContent = data.diameter;
    document.getElementById('info-distance').textContent = data.distance;
    document.getElementById('info-period').textContent = data.period;
    document.getElementById('planet-info').classList.remove('hidden');
}

function hidePlanetInfo() {
    document.getElementById('planet-info').classList.add('hidden');
}

document.addEventListener('click', onMouseClick);
document.getElementById('info-close').addEventListener('click', hidePlanetInfo);

document.getElementById('speed-slider').addEventListener('input', function(e) {
    speedMultiplier = parseFloat(e.target.value);
    document.getElementById('speed-value').textContent = speedMultiplier.toFixed(1) + 'x';
});

document.getElementById('pause-btn').addEventListener('click', function() {
    isPaused = !isPaused;
    document.getElementById('pause-btn').textContent = isPaused ? '▶ Play' : '⏸ Pause';
});

document.getElementById('reset-cam-btn').addEventListener('click', function() {
    controls.reset();
    camera.position.set(0, 180, 300);
    controls.update();
});

document.getElementById('orbit-toggle').addEventListener('change', function(e) {
    orbitLines.forEach(function(orbit) { orbit.visible = e.target.checked; });
});

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);

    if (!isPaused) {
        planets.forEach(function(planet) {
            const data = planet.userData;

            if (data.isSun) {
                planet.rotation.y += data.rotationSpeed;
            } else {
                data.angle += data.speed * speedMultiplier * 0.1;
                data.pivot.rotation.y = data.angle;
                planet.rotation.y += data.rotationSpeed * (speedMultiplier > 0 ? speedMultiplier : 0);

                if (data.moon) {
                    data.moon.angle += data.moon.speed * speedMultiplier * 0.1;
                    data.moon.pivot.rotation.y = data.moon.angle;
                }
            }
        });
    }

    controls.update();
    composer.render();
}

animate();
