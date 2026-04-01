import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PLANET_DATA = [
    { name: 'Mercury', radius: 0.8, distance: 28, color: 0xb5b5b5, speed: 0.04, rotationSpeed: 0.005, diameter: '4,879 km', distanceFromSun: '58M km', orbitalPeriod: '88 days' },
    { name: 'Venus', radius: 1.2, distance: 36, color: 0xe6c87a, speed: 0.015, rotationSpeed: 0.002, diameter: '12,104 km', distanceFromSun: '108M km', orbitalPeriod: '225 days' },
    { name: 'Earth', radius: 1.3, distance: 46, color: 0x4a90d9, speed: 0.01, rotationSpeed: 0.02, diameter: '12,742 km', distanceFromSun: '150M km', orbitalPeriod: '365 days', hasMoon: true },
    { name: 'Mars', radius: 1.0, distance: 60, color: 0xc1440e, speed: 0.008, rotationSpeed: 0.018, diameter: '6,779 km', distanceFromSun: '228M km', orbitalPeriod: '687 days' },
    { name: 'Jupiter', radius: 5.0, distance: 90, color: 0xd4a574, speed: 0.002, rotationSpeed: 0.04, diameter: '139,820 km', distanceFromSun: '778M km', orbitalPeriod: '4,333 days' },
    { name: 'Saturn', radius: 4.2, distance: 130, color: 0xf4d59e, speed: 0.0009, rotationSpeed: 0.035, diameter: '116,460 km', distanceFromSun: '1.4B km', orbitalPeriod: '10,759 days', hasRings: true },
    { name: 'Uranus', radius: 2.5, distance: 165, color: 0xb5e3e3, speed: 0.0004, rotationSpeed: 0.03, diameter: '50,724 km', distanceFromSun: '2.8B km', orbitalPeriod: '30,687 days', axialTilt: true },
    { name: 'Neptune', radius: 2.3, distance: 195, color: 0x4b70dd, speed: 0.0001, rotationSpeed: 0.028, diameter: '49,244 km', distanceFromSun: '4.5B km', orbitalPeriod: '60,190 days' }
];

let scene, camera, renderer, controls;
let planets = [];
let orbits = [];
let labels = [];
let moonMesh = null;
let asteroidBelt = null;
let speedMultiplier = 3;
let orbitsVisible = true;
let labelsVisible = true;
let raycaster, mouse;
let hoveredPlanet = null;
const clock = new THREE.Clock();

const tooltip = document.getElementById('tooltip');
const tooltipName = document.getElementById('tooltip-name');
const tooltipStats = document.getElementById('tooltip-stats');

const initialCameraPosition = new THREE.Vector3(0, 150, 250);
const initialControlsTarget = new THREE.Vector3(0, 0, 0);

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020210);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.copy(initialCameraPosition);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.copy(initialControlsTarget);

    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 2;
    mouse = new THREE.Vector2();

    createStarfield();
    createLighting();
    createSun();
    createPlanets();
    createAsteroidBelt();
    setupEventListeners();
    animate();
}

function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    const starColors = [];

    for (let i = 0; i < 4000; i++) {
        const radius = 800 + Math.random() * 400;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        starPositions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );

        const brightness = 0.5 + Math.random() * 0.5;
        const tint = Math.random();
        if (tint < 0.1) {
            starColors.push(brightness, brightness * 0.8, brightness * 0.6);
        } else if (tint < 0.2) {
            starColors.push(brightness * 0.8, brightness * 0.9, brightness);
        } else {
            starColors.push(brightness, brightness, brightness);
        }
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const starsMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.9
    });

    const starfield = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starfield);
}

function createLighting() {
    const ambientLight = new THREE.AmbientLight(0x222244, 0.3);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffeecc, 2.5, 800);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
}

function createSun() {
    const sunGeometry = new THREE.SphereGeometry(15, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa33
    });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sunMesh);

    const glowGeometry = new THREE.SphereGeometry(18, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8822,
        transparent: true,
        opacity: 0.3
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);

    const outerGlowGeometry = new THREE.SphereGeometry(22, 32, 32);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.15
    });
    const outerGlowMesh = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    scene.add(outerGlowMesh);
}

function createPlanets() {
    PLANET_DATA.forEach((data, index) => {
        const planetGroup = new THREE.Group();

        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: data.color,
            roughness: 0.7,
            metalness: 0.1
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = { planetIndex: index, isPlanet: true };
        planetGroup.add(mesh);

        if (data.hasRings) {
            const ringGeometry = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.5, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xc9b896,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2.3;
            planetGroup.add(ring);
        }

        if (data.axialTilt) {
            planetGroup.rotation.z = Math.PI * 0.4;
        }

        planetGroup.userData = {
            angle: Math.random() * Math.PI * 2,
            speed: data.speed,
            distance: data.distance,
            rotationSpeed: data.rotationSpeed,
            data: data
        };

        scene.add(planetGroup);
        planets.push(planetGroup);

        createOrbit(data.distance);
        createLabel(data.name, planetGroup, data.radius);
    });

    createMoon();
}

function createMoon() {
    const moonGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const moonMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 0.9,
        metalness: 0
    });
    moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moonMesh);
}

function createOrbit(distance) {
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitPoints = [];
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        orbitPoints.push(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
        );
    }

    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));

    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x334466,
        transparent: true,
        opacity: 0.4
    });

    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    orbit.userData.isOrbit = true;
    scene.add(orbit);
    orbits.push(orbit);
}

function createLabel(name, planetGroup, radius) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;

    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'bold 24px Courier New';
    context.fillStyle = '#aaccff';
    context.textAlign = 'center';
    context.fillText(name, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(15, 4, 1);
    sprite.position.y = radius + 3;
    sprite.userData.isLabel = true;

    planetGroup.add(sprite);
    labels.push(sprite);
}

function createAsteroidBelt() {
    const asteroidGeometry = new THREE.BufferGeometry();
    const asteroidPositions = [];
    const asteroidColors = [];

    for (let i = 0; i < 1000; i++) {
        const radius = 70 + Math.random() * 15;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 3;

        asteroidPositions.push(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );

        const brightness = 0.3 + Math.random() * 0.3;
        asteroidColors.push(brightness, brightness, brightness * 0.9);
    }

    asteroidGeometry.setAttribute('position', new THREE.Float32BufferAttribute(asteroidPositions, 3));
    asteroidGeometry.setAttribute('color', new THREE.Float32BufferAttribute(asteroidColors, 3));

    const asteroidMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    asteroidBelt = new THREE.Points(asteroidGeometry, asteroidMaterial);
    asteroidBelt.userData.isAsteroidBelt = true;
    scene.add(asteroidBelt);
}

function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);

    document.getElementById('speed-slider').addEventListener('input', (e) => {
        speedMultiplier = parseFloat(e.target.value);
        document.getElementById('speed-value').textContent = speedMultiplier.toFixed(1) + 'x';
    });

    document.getElementById('toggle-orbits').addEventListener('click', () => {
        orbitsVisible = !orbitsVisible;
        orbits.forEach(orbit => orbit.visible = orbitsVisible);
    });

    document.getElementById('toggle-labels').addEventListener('click', () => {
        labelsVisible = !labelsVisible;
        labels.forEach(label => label.visible = labelsVisible);
    });

    document.getElementById('reset-camera').addEventListener('click', () => {
        camera.position.copy(initialCameraPosition);
        controls.target.copy(initialControlsTarget);
        controls.update();
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const planetMeshes = [];
    planets.forEach(group => {
        group.traverse(child => {
            if (child.isMesh && child.userData.isPlanet) {
                planetMeshes.push(child);
            }
        });
    });

    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        const planetIndex = intersects[0].object.userData.planetIndex;
        showPlanetInfo(PLANET_DATA[planetIndex]);
    } else {
        hideTooltip();
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function showPlanetInfo(data) {
    tooltipName.textContent = data.name;
    tooltipStats.innerHTML = `
        Diameter: <span>${data.diameter}</span><br>
        Distance from Sun: <span>${data.distanceFromSun}</span><br>
        Orbital Period: <span>${data.orbitalPeriod}</span>
    `;
    tooltip.classList.remove('hidden');
    tooltip.style.left = (mouse.clientX + 20) + 'px';
    tooltip.style.top = (mouse.clientY + 20) + 'px';
}

function hideTooltip() {
    tooltip.classList.add('hidden');
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    planets.forEach((group, index) => {
        const userData = group.userData;
        userData.angle += userData.speed * delta * speedMultiplier;

        group.position.x = Math.cos(userData.angle) * userData.distance;
        group.position.z = Math.sin(userData.angle) * userData.distance;

        group.traverse(child => {
            if (child.isMesh && child.userData.isPlanet) {
                child.rotation.y += userData.rotationSpeed * delta * speedMultiplier;
            }
        });
    });

    const earthGroup = planets[2];
    if (moonMesh && earthGroup) {
        const moonAngle = clock.getElapsedTime() * 0.5 * speedMultiplier;
        moonMesh.position.x = earthGroup.position.x + Math.cos(moonAngle) * 3.5;
        moonMesh.position.z = earthGroup.position.z + Math.sin(moonAngle) * 3.5;
        moonMesh.position.y = 0;
    }

    if (asteroidBelt) {
        asteroidBelt.rotation.y += 0.0001 * delta * speedMultiplier;
    }

    controls.update();
    renderer.render(scene, camera);
}

init();