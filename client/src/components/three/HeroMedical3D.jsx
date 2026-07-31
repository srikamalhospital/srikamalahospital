import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * WebGL medical hero scene — rotating DNA double helix, floating medical
 * crosses, and a soft particle field. Mouse parallax + scroll fade.
 * Colors follow the hospital teal/green palette and adapt to theme.
 */
const HeroMedical3D = ({ className = '' }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = mount.clientWidth || 1;
    let height = mount.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const TEAL = new THREE.Color(0x0891b2);
    const GREEN = new THREE.Color(0x16a34a);
    const LIGHT = new THREE.Color(0x67e8f9);

    // ---------- DNA double helix ----------
    const helix = new THREE.Group();
    scene.add(helix);

    const RUNGS = 26;
    const RADIUS = 1.5;
    const HEIGHT = 7;
    const sphereGeo = new THREE.SphereGeometry(0.14, 14, 14);
    const matA = new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.9 });
    const matB = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.9 });
    const rungMat = new THREE.LineBasicMaterial({ color: LIGHT, transparent: true, opacity: 0.45 });

    for (let i = 0; i < RUNGS; i += 1) {
      const t = i / (RUNGS - 1);
      const angle = t * Math.PI * 3.4;
      const y = (t - 0.5) * HEIGHT;

      const ax = Math.cos(angle) * RADIUS;
      const az = Math.sin(angle) * RADIUS;
      const bx = Math.cos(angle + Math.PI) * RADIUS;
      const bz = Math.sin(angle + Math.PI) * RADIUS;

      const a = new THREE.Mesh(sphereGeo, matA);
      a.position.set(ax, y, az);
      helix.add(a);

      const b = new THREE.Mesh(sphereGeo, matB);
      b.position.set(bx, y, bz);
      helix.add(b);

      const rungGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(ax, y, az),
        new THREE.Vector3(bx, y, bz),
      ]);
      helix.add(new THREE.Line(rungGeo, rungMat));
    }
    helix.rotation.z = 0.35;
    helix.position.x = 2.2;

    // ---------- Floating medical crosses ----------
    const crossGroup = new THREE.Group();
    scene.add(crossGroup);

    const crossShape = new THREE.Shape();
    const s = 0.22;
    crossShape.moveTo(-s, -3 * s);
    crossShape.lineTo(s, -3 * s);
    crossShape.lineTo(s, -s);
    crossShape.lineTo(3 * s, -s);
    crossShape.lineTo(3 * s, s);
    crossShape.lineTo(s, s);
    crossShape.lineTo(s, 3 * s);
    crossShape.lineTo(-s, 3 * s);
    crossShape.lineTo(-s, s);
    crossShape.lineTo(-3 * s, s);
    crossShape.lineTo(-3 * s, -s);
    crossShape.lineTo(-s, -s);
    crossShape.closePath();

    const crossGeo = new THREE.ExtrudeGeometry(crossShape, { depth: 0.16, bevelEnabled: false });
    const crosses = [];
    for (let i = 0; i < 6; i += 1) {
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? TEAL : GREEN,
        transparent: true,
        opacity: 0.28,
        wireframe: i % 3 === 0,
      });
      const cross = new THREE.Mesh(crossGeo, mat);
      cross.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 7, -2 - Math.random() * 4);
      cross.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      const scale = 0.5 + Math.random() * 0.7;
      cross.scale.set(scale, scale, scale);
      crossGroup.add(cross);
      crosses.push({
        mesh: cross,
        speed: 0.15 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        baseY: cross.position.y,
      });
    }

    // ---------- Soft particle field ----------
    const COUNT = 420;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const palette = [TEAL, GREEN, LIGHT];
    for (let i = 0; i < COUNT; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = -1 - Math.random() * 7;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        size: 0.06,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      })
    );
    scene.add(particles);

    // ---------- Interaction ----------
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      width = mount.clientWidth || 1;
      height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let raf = 0;
    let running = true;

    const render = () => {
      if (!running) return;
      const t = clock.getElapsedTime();

      helix.rotation.y = t * 0.35;
      helix.position.y = Math.sin(t * 0.6) * 0.25;

      crosses.forEach((c) => {
        c.mesh.rotation.x += 0.003 * c.speed * 4;
        c.mesh.rotation.y += 0.004 * c.speed * 4;
        c.mesh.position.y = c.baseY + Math.sin(t * c.speed + c.phase) * 0.6;
      });

      particles.rotation.y = t * 0.015;

      camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0.8, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };

    if (prefersReduced) renderer.render(scene, camera);
    else raf = requestAnimationFrame(render);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!prefersReduced) {
        running = true;
        clock.getDelta();
        raf = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden />;
};

export default HeroMedical3D;
