"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeBackground() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")
      .matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight),
      0.1,
      50
    );
    camera.position.z = 4.2;

    const geometry = new THREE.IcosahedronGeometry(1.05, 6);
    const material = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      roughness: 0.55,
      metalness: 0.08,
      emissive: 0x1b1234,
      emissiveIntensity: 0.6,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const ambient = new THREE.AmbientLight(0x6ee7ff, 0.35);
    scene.add(ambient);

    const dir1 = new THREE.DirectionalLight(0xff7ad9, 0.75);
    dir1.position.set(-2, 2, 2);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x38bdf8, 0.65);
    dir2.position.set(2, -1, 2);
    scene.add(dir2);

    const starCount = 140;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 10 * Math.random();
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xe9d5ff,
      size: 0.03,
      transparent: true,
      opacity: 0.85,
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    host.appendChild(renderer.domElement);

    const resize = () => {
      const w = Math.max(1, host.clientWidth);
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    resize();

    let raf = 0;
    const start = performance.now();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = (performance.now() - start) / 1000;

      if (!reduceMotion) {
        mesh.rotation.x = t * 0.35;
        mesh.rotation.y = t * 0.55;
        mesh.position.y = Math.sin(t * 0.8) * 0.07;
        stars.rotation.y = t * 0.05;
      }

      renderer.render(scene, camera);
    };

    tick();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      starsGeo.dispose();
      starsMat.dispose();
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={hostRef} className="absolute inset-0 z-0" />;
}

