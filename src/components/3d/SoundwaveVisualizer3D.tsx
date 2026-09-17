import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SoundwaveVisualizer3DProps {
  isPlaying?: boolean;
  barCount?: number;
  className?: string;
  color?: string;
}

export const SoundwaveVisualizer3D: React.FC<SoundwaveVisualizer3DProps> = ({
  isPlaying = false,
  barCount = 48,
  className = '',
  color = '#6366f1',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 160;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.8, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x818cf8, 2, 20);
    pointLight.position.set(0, 3, 3);
    scene.add(pointLight);

    // Create 3D cylindrical sound wave ring
    const ringRadius = 1.6;
    const bars: THREE.Mesh[] = [];
    const barsGroup = new THREE.Group();
    scene.add(barsGroup);

    const barGeom = new THREE.BoxGeometry(0.04, 1, 0.04);
    const threeColor = new THREE.Color(color);

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;

      const barMat = new THREE.MeshStandardMaterial({
        color: threeColor,
        roughness: 0.3,
        metalness: 0.7,
        emissive: threeColor,
        emissiveIntensity: 0.25,
      });

      const bar = new THREE.Mesh(barGeom, barMat);
      bar.position.set(x, 0, z);
      bar.rotation.y = -angle;
      barsGroup.add(bar);
      bars.push(bar);
    }

    // Inner glowing ring floor
    const floorGeom = new THREE.RingGeometry(ringRadius - 0.1, ringRadius + 0.1, 48);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x4338ca,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const floorRing = new THREE.Mesh(floorGeom, floorMat);
    floorRing.rotation.x = Math.PI / 2;
    barsGroup.add(floorRing);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const active = isPlayingRef.current;

      barsGroup.rotation.y += 0.01;

      bars.forEach((bar, idx) => {
        const factor = active ? 1.0 : 0.25;
        const wave =
          Math.sin(elapsed * 6 + idx * 0.4) *
          Math.cos(elapsed * 4 + idx * 0.2) *
          factor;
        const scaleY = Math.max(0.12, Math.abs(wave) * 1.8 + (active ? 0.3 : 0.1));
        bar.scale.y = scaleY;
        bar.position.y = scaleY / 2;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [barCount, color]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[140px] flex items-center justify-center ${className}`}
    />
  );
};
