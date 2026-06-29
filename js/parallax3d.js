/**
 * Deep Public School — Three.js 3D Parallax Engine
 * Creates an immersive 3D floating geometry scene behind the hero section
 * with mouse-driven parallax depth and scroll-based camera movement.
 */

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // Guard: only run on desktop (performance)
  // ─────────────────────────────────────────────
  if (window.innerWidth < 768) return;

  // ─────────────────────────────────────────────
  // Wait for THREE to be available
  // ─────────────────────────────────────────────
  const waitForThree = (cb, tries = 0) => {
    if (typeof THREE !== 'undefined') { cb(); return; }
    if (tries > 40) { console.warn('[Parallax3D] THREE.js not loaded'); return; }
    setTimeout(() => waitForThree(cb, tries + 1), 100);
  };

  waitForThree(initParallax3D);

  function initParallax3D() {

    // ───────────────────────────────────────────
    // Setup: canvas mount inside hero section
    // ───────────────────────────────────────────
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    // Remove the old 2D canvas particle system — Three.js takes over
    const oldCanvas = document.getElementById('heroParticles');
    if (oldCanvas) oldCanvas.style.display = 'none';

    // Create a new canvas for Three.js
    const canvas = document.createElement('canvas');
    canvas.id = 'threeParallaxCanvas';
    canvas.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 2;
      pointer-events: none;
      opacity: 0;
      transition: opacity 1.2s ease;
    `;
    hero.insertBefore(canvas, hero.firstChild);

    // ───────────────────────────────────────────
    // Renderer
    // ───────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(hero.clientWidth, hero.clientHeight);
    renderer.setClearColor(0x000000, 0);

    // ───────────────────────────────────────────
    // Scene & Camera
    // ───────────────────────────────────────────
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      hero.clientWidth / hero.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 18);

    // ───────────────────────────────────────────
    // Lighting
    // ───────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Blue point light (school brand color)
    const blueLight = new THREE.PointLight(0x1e6ef5, 3.5, 60);
    blueLight.position.set(-10, 8, 10);
    scene.add(blueLight);

    // Gold point light (school brand color)
    const goldLight = new THREE.PointLight(0xf5b301, 2.8, 50);
    goldLight.position.set(12, -5, 8);
    scene.add(goldLight);

    // Subtle fill light
    const fillLight = new THREE.PointLight(0x4fc3f7, 1.2, 40);
    fillLight.position.set(0, -10, 5);
    scene.add(fillLight);

    // ───────────────────────────────────────────
    // Materials
    // ───────────────────────────────────────────
    const blueMat = new THREE.MeshStandardMaterial({
      color: 0x1a5fd1,
      emissive: 0x0a2f7a,
      emissiveIntensity: 0.4,
      metalness: 0.7,
      roughness: 0.2,
      transparent: true,
      opacity: 0.75,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf5b301,
      emissive: 0x7a5800,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.80,
    });

    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x4fc3f7,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });

    const goldWireMat = new THREE.MeshBasicMaterial({
      color: 0xf5b301,
      wireframe: true,
      transparent: true,
      opacity: 0.10,
    });

    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x4fc3f7,
      emissive: 0x4fc3f7,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.35,
      metalness: 0.0,
      roughness: 1.0,
    });

    // ───────────────────────────────────────────
    // Floating Objects — parallax "depth layers"
    // Layer -1 (far):  big, slow
    // Layer 0 (mid):   medium, normal speed
    // Layer +1 (near): small, fast (pop out)
    // ───────────────────────────────────────────

    const objects = []; // { mesh, layer, basePos, rotSpeed, floatSpeed, floatOffset }

    const addObject = (mesh, layer, x, y, z, rx = 0, ry = 0, rz = 0) => {
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      scene.add(mesh);
      objects.push({
        mesh,
        layer,
        basePos: new THREE.Vector3(x, y, z),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.004,
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.003
        ),
        floatSpeed: 0.4 + Math.random() * 0.6,
        floatOffset: Math.random() * Math.PI * 2,
        floatAmplitude: 0.15 + Math.random() * 0.25,
      });
    };

    // ── FAR LAYER (layer = -1): Large wireframe geometries ──

    // Large icosahedron wireframe (far-left, deep)
    addObject(
      new THREE.Mesh(new THREE.IcosahedronGeometry(3.5, 1), wireframeMat),
      -1, -12, 3, -8, 0.3, 0.5, 0
    );

    // Large torus wireframe (far-right)
    addObject(
      new THREE.Mesh(new THREE.TorusGeometry(4, 0.15, 12, 60), wireframeMat),
      -1, 13, -2, -10, Math.PI / 4, 0, Math.PI / 6
    );

    // Giant low-poly sphere wireframe (far-center-top)
    addObject(
      new THREE.Mesh(new THREE.OctahedronGeometry(5, 2), wireframeMat),
      -1, 0, 6, -15, 0, 0.2, 0
    );

    // ── MID LAYER (layer = 0): Solid glowing objects ──

    // Blue dodecahedron (mid-left)
    addObject(
      new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), blueMat),
      0, -6, 1.5, -4
    );

    // Gold tetrahedron (mid-right)
    addObject(
      new THREE.Mesh(new THREE.TetrahedronGeometry(1.3, 0), goldMat),
      0, 7, -1, -3, 0.5, 0.2, 0
    );

    // Blue small torus (mid-center-right)
    addObject(
      new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.3, 16, 40), blueMat),
      0, 4, 2.5, -2, Math.PI / 3, 0.4, 0
    );

    // Gold octahedron (mid-left-down)
    addObject(
      new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), goldMat),
      0, -8, -3, -1
    );

    // Glow sphere — ambient sky accent
    addObject(
      new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), glowMat),
      0, 2, 4, -1.5
    );

    // Small gold torus knot (mid)
    const torusKnotMat = new THREE.MeshStandardMaterial({
      color: 0xf5b301,
      emissive: 0x5a3c00,
      emissiveIntensity: 0.5,
      metalness: 0.85,
      roughness: 0.15,
      transparent: true,
      opacity: 0.7,
    });
    addObject(
      new THREE.Mesh(new THREE.TorusKnotGeometry(0.7, 0.2, 80, 16), torusKnotMat),
      0, -3.5, -2, -2.5
    );

    // ── NEAR LAYER (layer = +1): Small, high contrast, "popping out" ──

    // Gold small icosahedron (near, upper-left)
    addObject(
      new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), goldMat),
      1, -2, 3.5, 2
    );

    // Blue cone (near, lower-right)
    addObject(
      new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.2, 6), blueMat),
      1, 5, -3, 3, 0, 0, 0.3
    );

    // Tiny gold wireframe torus (near, top-right)
    addObject(
      new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.15, 8, 24), goldWireMat),
      1, 6, 4, 4, Math.PI / 2, 0, 0
    );

    // Small blue box (near, lower-left)
    addObject(
      new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), blueMat),
      1, -7, -3, 3, 0.5, 0.5, 0.5
    );

    // ── PARTICLES SYSTEM: GPU Point Cloud ──
    const PARTICLE_COUNT = 320;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleColors    = new Float32Array(PARTICLE_COUNT * 3);
    const particleSizes     = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      particlePositions[i3]     = (Math.random() - 0.5) * 40;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 30;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 20 - 5;

      // 30% gold, 70% sky-blue
      const isGold = Math.random() < 0.30;
      if (isGold) {
        particleColors[i3]     = 0.961; // R
        particleColors[i3 + 1] = 0.702; // G
        particleColors[i3 + 2] = 0.004; // B
      } else {
        particleColors[i3]     = 0.31;
        particleColors[i3 + 1] = 0.765;
        particleColors[i3 + 2] = 0.969;
      }

      particleSizes[i] = Math.random() * 2.5 + 0.5;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color',    new THREE.BufferAttribute(particleColors, 3));
    particleGeo.setAttribute('size',     new THREE.BufferAttribute(particleSizes, 1));

    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    particles.userData.layer = -0.5; // between far and mid for parallax
    scene.add(particles);

    // ───────────────────────────────────────────
    // Mouse Tracking (normalized -1 → +1)
    // ───────────────────────────────────────────
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }; // tx/ty = target (raw), x/y = eased

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.tx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouse.ty = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      mouse.tx = 0;
      mouse.ty = 0;
    }, { passive: true });

    // ───────────────────────────────────────────
    // Scroll tracking
    // ───────────────────────────────────────────
    let scrollY = 0;
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
    }, { passive: true });

    // ───────────────────────────────────────────
    // Resize Handler
    // ───────────────────────────────────────────
    const onResize = () => {
      const w = hero.clientWidth;
      const h = hero.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ───────────────────────────────────────────
    // Layer parallax coefficients
    // layer -1 (far)   → moves LEAST on mouse (appears far)
    // layer  0 (mid)   → moves moderately
    // layer +1 (near)  → moves MOST (appears close / pop-out)
    // ───────────────────────────────────────────
    const layerMouseStrength  = { '-1': 0.6,  '0': 1.8,  '1': 3.5 };
    const layerScrollStrength = { '-1': 0.003, '0': 0.008, '1': 0.018 };

    // ───────────────────────────────────────────
    // Animation Loop
    // ───────────────────────────────────────────
    let time = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      time += delta;

      // Ease mouse
      mouse.x += (mouse.tx - mouse.x) * 0.055;
      mouse.y += (mouse.ty - mouse.y) * 0.055;

      // Animate each floating object
      objects.forEach(obj => {
        const { mesh, layer, basePos, rotSpeed, floatSpeed, floatOffset, floatAmplitude } = obj;

        // Floating bob
        const floatY = Math.sin(time * floatSpeed + floatOffset) * floatAmplitude;

        // Parallax displacement from mouse
        const ms = layerMouseStrength[layer.toString()] ?? 1.5;
        const ss = layerScrollStrength[layer.toString()] ?? 0.006;

        const px = mouse.x * ms;
        const py = -mouse.y * ms;
        const pz = scrollY * ss * -1; // scroll pushes objects away

        mesh.position.set(
          basePos.x + px,
          basePos.y + py + floatY,
          basePos.z + pz,
        );

        // Self-rotation
        mesh.rotation.x += rotSpeed.x;
        mesh.rotation.y += rotSpeed.y;
        mesh.rotation.z += rotSpeed.z;
      });

      // Particle parallax — mid-far layer
      particles.position.x = mouse.x * 1.2;
      particles.position.y = -mouse.y * 1.2;
      particles.rotation.y = time * 0.015;

      // Camera subtle sway with mouse (adds extra depth)
      camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      // Light colors pulsate for atmosphere
      const pulse = Math.sin(time * 0.6) * 0.5 + 0.5;
      blueLight.intensity = 3.0 + pulse * 1.0;
      goldLight.intensity = 2.5 + (1 - pulse) * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    // Fade in canvas gracefully after a short delay
    setTimeout(() => {
      canvas.style.opacity = '1';
    }, 400);

    // ───────────────────────────────────────────
    // Expose cleanup for SPA if needed
    // ───────────────────────────────────────────
    window.__parallax3d = {
      renderer,
      scene,
      camera,
      dispose() {
        renderer.dispose();
        window.removeEventListener('resize', onResize);
        canvas.remove();
      }
    };
  }

})();
