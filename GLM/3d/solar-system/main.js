(function () {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 80, 120);

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.body.prepend(renderer.domElement);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 500;

    var defaultCameraPos = camera.position.clone();
    var defaultCameraTarget = new THREE.Vector3(0, 0, 0);

    var composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    var bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, 0.4, 0.85
    );
    bloomPass.threshold = 0.2;
    bloomPass.strength = 1.8;
    bloomPass.radius = 0.6;
    composer.addPass(bloomPass);

    var pointLight = new THREE.PointLight(0xfff0dd, 2.5, 500);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
    var ambientLight = new THREE.AmbientLight(0x222444, 0.15);
    scene.add(ambientLight);

    (function createStarfield() {
        var count = 3000;
        var positions = new Float32Array(count * 3);
        var colors = new Float32Array(count * 3);
        for (var i = 0; i < count; i++) {
            var r = 400 + Math.random() * 600;
            var theta = Math.random() * Math.PI * 2;
            var phi = Math.acos(2 * Math.random() - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
            var brightness = 0.5 + Math.random() * 0.5;
            var tint = Math.random();
            if (tint < 0.1) {
                colors[i * 3] = brightness * 0.8;
                colors[i * 3 + 1] = brightness * 0.85;
                colors[i * 3 + 2] = brightness;
            } else if (tint < 0.2) {
                colors[i * 3] = brightness;
                colors[i * 3 + 1] = brightness * 0.9;
                colors[i * 3 + 2] = brightness * 0.7;
            } else {
                colors[i * 3] = brightness;
                colors[i * 3 + 1] = brightness;
                colors[i * 3 + 2] = brightness;
            }
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        var mat = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: true
        });
        scene.add(new THREE.Points(geo, mat));
    })();

    var sunGeo = new THREE.SphereGeometry(5, 64, 64);
    var sunMat = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
    var sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    var sunGlowGeo = new THREE.SphereGeometry(6.5, 32, 32);
    var sunGlowMat = new THREE.MeshBasicMaterial({
        color: 0xFFA500,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(sunGlowGeo, sunGlowMat));

    var PLANET_DATA = [
        {
            name: 'Mercury', radius: 0.4, orbitRadius: 10, orbitSpeed: 4.15, rotationSpeed: 0.005,
            color: 0xB5B5B5,
            info: { diameter: '4,879 km', distance: '57.9M km', period: '88 days' }
        },
        {
            name: 'Venus', radius: 0.9, orbitRadius: 15, orbitSpeed: 1.62, rotationSpeed: 0.002,
            color: 0xE8CDA0,
            info: { diameter: '12,104 km', distance: '108.2M km', period: '225 days' }
        },
        {
            name: 'Earth', radius: 1.0, orbitRadius: 20, orbitSpeed: 1.0, rotationSpeed: 0.02,
            color: 0x4B7BE5,
            info: { diameter: '12,756 km', distance: '149.6M km', period: '365 days' },
            hasMoon: true
        },
        {
            name: 'Mars', radius: 0.53, orbitRadius: 27, orbitSpeed: 0.53, rotationSpeed: 0.018,
            color: 0xE27B58,
            info: { diameter: '6,792 km', distance: '227.9M km', period: '687 days' }
        },
        {
            name: 'Jupiter', radius: 2.5, orbitRadius: 40, orbitSpeed: 0.084, rotationSpeed: 0.04,
            color: 0xC88B3A,
            info: { diameter: '142,984 km', distance: '778.6M km', period: '11.9 years' },
            hasStripes: true
        },
        {
            name: 'Saturn', radius: 2.1, orbitRadius: 55, orbitSpeed: 0.034, rotationSpeed: 0.038,
            color: 0xEAD6B8,
            info: { diameter: '120,536 km', distance: '1,433.5M km', period: '29.5 years' },
            hasRings: true
        },
        {
            name: 'Uranus', radius: 1.6, orbitRadius: 70, orbitSpeed: 0.012, rotationSpeed: 0.03,
            color: 0xB2E5E5,
            info: { diameter: '51,118 km', distance: '2,872.5M km', period: '84 years' },
            axialTilt: 97.77 * Math.PI / 180
        },
        {
            name: 'Neptune', radius: 1.5, orbitRadius: 85, orbitSpeed: 0.006, rotationSpeed: 0.032,
            color: 0x3F54BA,
            info: { diameter: '49,528 km', distance: '4,495.1M km', period: '165 years' }
        }
    ];

    var planets = [];
    var orbitLines = [];
    var labels = [];
    var clickTargets = [sunMesh];

    var sunInfo = {
        name: 'Sun', mesh: sunMesh,
        info: { diameter: '1,391,000 km', distance: '0 km (center)', period: 'N/A' }
    };

    function createOrbitLine(radius) {
        var points = [];
        var segments = 128;
        for (var i = 0; i <= segments; i++) {
            var angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
        }
        var geo = new THREE.BufferGeometry().setFromPoints(points);
        var mat = new THREE.LineBasicMaterial({ color: 0x334466, transparent: true, opacity: 0.3 });
        return new THREE.Line(geo, mat);
    }

    function createJupiterTexture() {
        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        var ctx = canvas.getContext('2d');
        var baseColor = new THREE.Color(0xC88B3A);
        ctx.fillStyle = 'rgb(' + Math.floor(baseColor.r * 255) + ',' + Math.floor(baseColor.g * 255) + ',' + Math.floor(baseColor.b * 255) + ')';
        ctx.fillRect(0, 0, 256, 128);
        var bandColors = [
            'rgba(160,100,50,0.5)', 'rgba(200,160,100,0.3)', 'rgba(140,80,30,0.5)',
            'rgba(180,130,70,0.4)', 'rgba(120,70,25,0.6)', 'rgba(200,150,90,0.3)',
            'rgba(160,90,40,0.5)', 'rgba(190,140,80,0.4)'
        ];
        for (var i = 0; i < bandColors.length; i++) {
            var y = (i + 1) * (128 / (bandColors.length + 1));
            ctx.fillStyle = bandColors[i];
            ctx.fillRect(0, y - 4, 256, 8);
        }
        ctx.fillStyle = 'rgba(200,80,50,0.6)';
        ctx.beginPath();
        ctx.ellipse(170, 72, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        var texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        return texture;
    }

    function createEarthMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                lightPosition: { value: new THREE.Vector3(0, 0, 0) },
                dayColor: { value: new THREE.Color(0x4B7BE5) },
                nightColor: { value: new THREE.Color(0x0a0a20) },
                landColor: { value: new THREE.Color(0x2d8a4e) }
            },
            vertexShader: [
                'varying vec3 vNormal;',
                'varying vec3 vWorldPosition;',
                'void main() {',
                '    vNormal = normalize(normalMatrix * normal);',
                '    vec4 worldPos = modelMatrix * vec4(position, 1.0);',
                '    vWorldPosition = worldPos.xyz;',
                '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform vec3 lightPosition;',
                'uniform vec3 dayColor;',
                'uniform vec3 nightColor;',
                'uniform vec3 landColor;',
                'varying vec3 vNormal;',
                'varying vec3 vWorldPosition;',
                'void main() {',
                '    vec3 lightDir = normalize(lightPosition - vWorldPosition);',
                '    float NdotL = dot(vNormal, lightDir);',
                '    float mixFactor = smoothstep(-0.1, 0.3, NdotL);',
                '    vec3 surfaceColor = mix(dayColor, landColor, step(0.55, fract(vWorldPosition.x * 0.8 + vWorldPosition.z * 0.5)));',
                '    surfaceColor = mix(dayColor, surfaceColor, 0.3);',
                '    vec3 finalColor = mix(nightColor, surfaceColor, mixFactor);',
                '    float cityLight = (1.0 - mixFactor) * step(0.8, fract(sin(dot(vWorldPosition.xz * 10.0, vec2(12.9898, 78.233))) * 43758.5453));',
                '    finalColor += vec3(1.0, 0.9, 0.6) * cityLight * 0.3;',
                '    gl_FragColor = vec4(finalColor, 1.0);',
                '}'
            ].join('\n')
        });
    }

    PLANET_DATA.forEach(function (data) {
        var orbitGroup = new THREE.Object3D();
        scene.add(orbitGroup);

        var planetGroup = new THREE.Object3D();
        planetGroup.position.x = data.orbitRadius;
        orbitGroup.add(planetGroup);

        if (data.axialTilt) {
            planetGroup.rotation.z = data.axialTilt;
        }

        var material;
        if (data.name === 'Earth') {
            material = createEarthMaterial();
        } else if (data.hasStripes) {
            material = new THREE.MeshStandardMaterial({ map: createJupiterTexture() });
        } else {
            material = new THREE.MeshStandardMaterial({
                color: data.color,
                roughness: 0.7,
                metalness: 0.1
            });
        }

        var geo = new THREE.SphereGeometry(Math.max(0.01, data.radius), 48, 48);
        var mesh = new THREE.Mesh(geo, material);
        planetGroup.add(mesh);

        if (data.hasRings) {
            var innerR = Math.max(0.01, data.radius * 1.3);
            var outerR = Math.max(innerR + 0.01, data.radius * 2.5);
            var ringGeo = new THREE.RingGeometry(innerR, outerR, 64);
            var ringMat = new THREE.MeshBasicMaterial({
                color: 0xc8b89a,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.5
            });
            var ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            planetGroup.add(ring);
        }

        var moonOrbitGroup = null;
        if (data.hasMoon) {
            moonOrbitGroup = new THREE.Object3D();
            var moonGeo = new THREE.SphereGeometry(0.27, 24, 24);
            var moonMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.9 });
            var moonMesh = new THREE.Mesh(moonGeo, moonMat);
            moonMesh.position.x = 2.2;
            moonOrbitGroup.add(moonMesh);
            planetGroup.add(moonOrbitGroup);
        }

        var orbitLine = createOrbitLine(data.orbitRadius);
        scene.add(orbitLine);
        orbitLines.push(orbitLine);

        var labelEl = document.createElement('div');
        labelEl.className = 'planet-label';
        labelEl.textContent = data.name;
        document.body.appendChild(labelEl);
        labels.push({ element: labelEl, mesh: mesh, planetGroup: planetGroup, orbitGroup: orbitGroup });

        var startAngle = Math.random() * Math.PI * 2;
        orbitGroup.rotation.y = startAngle;

        planets.push({
            name: data.name,
            radius: data.radius,
            orbitRadius: data.orbitRadius,
            orbitSpeed: data.orbitSpeed,
            rotationSpeed: data.rotationSpeed,
            color: data.color,
            info: data.info,
            hasMoon: data.hasMoon,
            hasStripes: data.hasStripes,
            hasRings: data.hasRings,
            axialTilt: data.axialTilt,
            mesh: mesh,
            orbitGroup: orbitGroup,
            planetGroup: planetGroup,
            moonOrbitGroup: moonOrbitGroup,
            angle: startAngle
        });

        clickTargets.push(mesh);
    });

    clickTargets.push(sunMesh);

    var asteroidBelt = (function createAsteroidBelt() {
        var count = 600;
        var positions = new Float32Array(count * 3);
        var innerRadius = 32;
        var outerRadius = 37;
        for (var i = 0; i < count; i++) {
            var angle = Math.random() * Math.PI * 2;
            var r = innerRadius + Math.random() * (outerRadius - innerRadius);
            positions[i * 3] = Math.cos(angle) * r;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
            positions[i * 3 + 2] = Math.sin(angle) * r;
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        var mat = new THREE.PointsMaterial({
            color: 0x888888,
            size: 0.15,
            transparent: true,
            opacity: 0.6
        });
        var points = new THREE.Points(geo, mat);
        scene.add(points);
        return points;
    })();

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var tooltip = document.getElementById('tooltip');

    function getInfoForMesh(mesh) {
        if (mesh === sunMesh) return sunInfo;
        for (var i = 0; i < planets.length; i++) {
            if (planets[i].mesh === mesh) return planets[i];
        }
        return null;
    }

    renderer.domElement.addEventListener('click', function (event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(clickTargets);
        if (intersects.length > 0) {
            var hitMesh = intersects[0].object;
            var data = getInfoForMesh(hitMesh);
            if (data) {
                tooltip.innerHTML =
                    '<div class="planet-name">' + data.name + '</div>' +
                    '<div class="planet-stat">Diameter: <span>' + data.info.diameter + '</span></div>' +
                    '<div class="planet-stat">Distance: <span>' + data.info.distance + '</span></div>' +
                    '<div class="planet-stat">Orbital Period: <span>' + data.info.period + '</span></div>';
                tooltip.style.display = 'block';
                var tx = Math.min(event.clientX + 15, window.innerWidth - 260);
                var ty = Math.min(event.clientY + 15, window.innerHeight - 120);
                tooltip.style.left = tx + 'px';
                tooltip.style.top = ty + 'px';
            }
        } else {
            tooltip.style.display = 'none';
        }
    });

    var speedMultiplier = 1.0;
    var orbitsVisible = true;
    var labelsVisible = true;

    var speedSlider = document.getElementById('speed-slider');
    var speedValue = document.getElementById('speed-value');
    speedSlider.addEventListener('input', function () {
        speedMultiplier = parseFloat(speedSlider.value);
        speedValue.textContent = speedMultiplier.toFixed(1) + 'x';
    });

    document.getElementById('btn-toggle-orbits').addEventListener('click', function () {
        orbitsVisible = !orbitsVisible;
        orbitLines.forEach(function (l) { l.visible = orbitsVisible; });
        this.textContent = orbitsVisible ? 'Hide Orbits' : 'Show Orbits';
    });

    document.getElementById('btn-toggle-labels').addEventListener('click', function () {
        labelsVisible = !labelsVisible;
        labels.forEach(function (l) { l.element.style.display = labelsVisible ? '' : 'none'; });
        this.textContent = labelsVisible ? 'Hide Labels' : 'Show Labels';
    });

    document.getElementById('btn-reset-camera').addEventListener('click', function () {
        camera.position.copy(defaultCameraPos);
        controls.target.copy(defaultCameraTarget);
        controls.update();
    });

    function updateLabels() {
        labels.forEach(function (item) {
            if (!labelsVisible) return;
            var worldPos = new THREE.Vector3();
            item.mesh.getWorldPosition(worldPos);
            var planetData = null;
            for (var i = 0; i < planets.length; i++) {
                if (planets[i].mesh === item.mesh) { planetData = planets[i]; break; }
            }
            worldPos.y += (planetData ? planetData.radius : 1) + 0.8;
            var projected = worldPos.clone().project(camera);
            if (projected.z > 1) {
                item.element.style.display = 'none';
                return;
            }
            item.element.style.display = '';
            var x = (projected.x * 0.5 + 0.5) * window.innerWidth;
            var y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
            item.element.style.left = x + 'px';
            item.element.style.top = y + 'px';
        });
    }

    var clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        var delta = clock.getDelta();
        var elapsed = clock.getElapsedTime();
        var speed = speedMultiplier * delta;

        sunMesh.rotation.y += 0.002 * speedMultiplier;

        planets.forEach(function (planet) {
            planet.orbitGroup.rotation.y += planet.orbitSpeed * speed * 0.1;
            planet.mesh.rotation.y += planet.rotationSpeed * speedMultiplier;
            if (planet.moonOrbitGroup) {
                planet.moonOrbitGroup.rotation.y += 2.5 * speed;
            }
        });

        asteroidBelt.rotation.y += 0.002 * speedMultiplier;

        sunGlowMat.opacity = 0.12 + Math.sin(elapsed * 2) * 0.03;

        controls.update();
        updateLabels();
        composer.render();
    }

    animate();

    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });
})();
