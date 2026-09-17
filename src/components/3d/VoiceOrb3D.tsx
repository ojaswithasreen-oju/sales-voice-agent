import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Volume2, Sparkles, Activity, RefreshCw } from 'lucide-react';

interface VoiceOrb3DProps {
  isPlaying?: boolean;
  intensity?: number;
  className?: string;
  themeColor?: 'indigo' | 'emerald' | 'violet' | 'amber';
}

export const VoiceOrb3D: React.FC<VoiceOrb3DProps> = ({
  isPlaying = false,
  intensity = 1.0,
  className = '',
  themeColor = 'indigo',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [activeMode, setActiveMode] = useState<'neural' | 'particles' | 'harmonic'>('neural');
  const [isInteracting, setIsInteracting] = useState(false);

  // References for animation
  const orbMeshRef = useRef<THREE.Mesh | null>(null);
  const innerCoreRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const outerRingsRef = useRef<THREE.Group | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const intensityRef = useRef(intensity);

  isPlayingRef.current = isPlaying;
  intensityRef.current = intensity;

  // Colors config
  const colorPalettes = {
    indigo: {
      primary: 0x6366f1, // indigo-500
      secondary: 0x818cf8, // indigo-400
      core: 0xa5b4fc, // indigo-300
      particle: 0xc7d2fe,
      glow: 'rgba(99, 102, 241, 0.4)',
    },
    emerald: {
      primary: 0x10b981,
      secondary: 0x34d399,
      core: 0x6ee7b7,
      particle: 0xa7f3d0,
      glow: 'rgba(16, 185, 129, 0.4)',
    },
    violet: {
      primary: 0x8b5cf6,
      secondary: 0xa78bfa,
      core: 0xc4b5fd,
      particle: 0xddd6fe,
      glow: 'rgba(139, 92, 246, 0.4)',
    },
    amber: {
      primary: 0xf59e0b,
      secondary: 0xfbbf24,
      core: 0xfcd34d,
      particle: 0xfef3c7,
      glow: 'rgba(245, 158, 11, 0.4)',
    },
  };

  const currentPalette = colorPalettes[themeColor] || colorPalettes.indigo;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7.5;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(currentPalette.primary, 3, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(currentPalette.secondary, 2, 50);
    pointLight2.position.set(-5, -5, -2);
    scene.add(pointLight2);

    // 5. Main Neural Orb Mesh (Icosahedron with wireframe + custom vertex displacement)
    const orbGeometry = new THREE.IcosahedronGeometry(2.0, 4);
    // Keep original positions for displacement
    const originalPositions = orbGeometry.attributes.position.clone();

    const orbMaterial = new THREE.MeshStandardMaterial({
      color: currentPalette.primary,
      wireframe: true,
      emissive: currentPalette.primary,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const orbMesh = new THREE.Mesh(orbGeometry, orbMaterial);
    scene.add(orbMesh);
    orbMeshRef.current = orbMesh;

    // 6. Glowing Inner Core Sphere
    const innerGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: currentPalette.core,
      transparent: true,
      opacity: 0.45,
      wireframe: false,
    });
    const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerCore);
    innerCoreRef.current = innerCore;

    // 7. Surrounding 3D Floating Particle Swarm
    const particleCount = 700;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      particleScales[i] = Math.random() * 0.06 + 0.02;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.4, 'rgba(165, 180, 252, 0.8)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.09,
      color: currentPalette.particle,
      map: particleTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // 8. Outer Harmonic Gimbal Rings (Audio Latency Orbits)
    const ringsGroup = new THREE.Group();
    for (let r = 0; r < 3; r++) {
      const ringRadius = 2.9 + r * 0.45;
      const ringGeom = new THREE.RingGeometry(ringRadius, ringRadius + 0.015, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: currentPalette.secondary,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.28 - r * 0.06,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / (2 + r);
      ring.rotation.y = (r * Math.PI) / 3;
      ringsGroup.add(ring);
    }
    scene.add(ringsGroup);
    outerRingsRef.current = ringsGroup;

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.7;
      targetY = y * 0.7;
      setIsInteracting(true);
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
      setIsInteracting(false);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      const activePlaying = isPlayingRef.current;
      const mult = activePlaying ? 2.4 * intensityRef.current : 1.0;

      // Rotate Orb
      if (orbMesh) {
        orbMesh.rotation.y += 0.006 * mult;
        orbMesh.rotation.x = mouseY * 0.4 + Math.sin(elapsedTime * 0.4) * 0.1;
        orbMesh.rotation.z = mouseX * 0.4;

        // Dynamic vertex displacement wave (Simulate speech frequency modulation)
        const posAttr = orbGeometry.attributes.position;
        const origPos = originalPositions.array;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < posAttr.count; i++) {
          const u = i * 3;
          const ox = origPos[u];
          const oy = origPos[u + 1];
          const oz = origPos[u + 2];

          // Compute distance from origin
          const baseDist = Math.sqrt(ox * ox + oy * oy + oz * oz);

          // Audio harmonic wave disturbance
          const frequency = activePlaying ? 4.5 : 2.0;
          const waveAmp = activePlaying ? 0.35 : 0.08;
          const noise =
            Math.sin(ox * frequency + elapsedTime * (activePlaying ? 6 : 2)) *
            Math.cos(oy * frequency + elapsedTime * (activePlaying ? 5 : 2)) *
            Math.sin(oz * frequency + elapsedTime * 3) *
            waveAmp;

          const factor = 1 + noise / baseDist;
          posArray[u] = ox * factor;
          posArray[u + 1] = oy * factor;
          posArray[u + 2] = oz * factor;
        }
        posAttr.needsUpdate = true;
      }

      // Inner Core Pulsing
      if (innerCore) {
        const pulse = Math.sin(elapsedTime * (activePlaying ? 8 : 2)) * 0.15;
        const baseScale = activePlaying ? 1.3 : 1.0;
        innerCore.scale.set(baseScale + pulse, baseScale + pulse, baseScale + pulse);
      }

      // Rotate Particles Swarm
      if (particles) {
        particles.rotation.y -= 0.003 * mult;
        particles.rotation.x += 0.001 * mult;
      }

      // Rotate Harmonic Rings
      if (ringsGroup) {
        ringsGroup.rotation.z += 0.004 * mult;
        ringsGroup.rotation.y -= 0.002 * mult;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (rendererRef.current?.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [themeColor]);

  // Update wireframe/mode on state change
  useEffect(() => {
    if (!orbMeshRef.current || !particlesRef.current || !innerCoreRef.current) return;
    if (activeMode === 'neural') {
      orbMeshRef.current.visible = true;
      particlesRef.current.visible = true;
      innerCoreRef.current.visible = true;
    } else if (activeMode === 'particles') {
      orbMeshRef.current.visible = false;
      particlesRef.current.visible = true;
      innerCoreRef.current.visible = true;
    } else if (activeMode === 'harmonic') {
      orbMeshRef.current.visible = true;
      particlesRef.current.visible = false;
      innerCoreRef.current.visible = true;
    }
  }, [activeMode]);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[360px] sm:min-h-[440px] cursor-grab active:cursor-grabbing flex items-center justify-center"
      />

      {/* Floating 3D HUD Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 text-xs text-slate-200 shadow-xl">
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-indigo-400 animate-pulse'}`} />
        <span className="font-mono text-[11px] tracking-wide">
          {isPlaying ? 'VOICE SYNTHESIS ACTIVE (24kHz)' : 'NEURAL SUB-400MS ENGINE'}
        </span>
      </div>

      {/* Interactive Mode Switcher at bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/70 shadow-2xl">
        <button
          onClick={() => setActiveMode('neural')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeMode === 'neural'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Neural Mesh</span>
        </button>
        <button
          onClick={() => setActiveMode('particles')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeMode === 'particles'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>Particle Cloud</span>
        </button>
        <button
          onClick={() => setActiveMode('harmonic')}
          className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeMode === 'harmonic'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Volume2 className="w-3 h-3" />
          <span>Harmonic Rings</span>
        </button>
      </div>
    </div>
  );
};
