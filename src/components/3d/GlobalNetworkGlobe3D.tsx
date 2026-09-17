import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Globe, Radio, Shield, Zap, MapPin } from 'lucide-react';

interface CityNode {
  name: string;
  lat: number;
  lng: number;
  region: string;
  latencyMs: number;
  carrier: string;
  activeCalls: number;
}

const GLOBAL_HUBS: CityNode[] = [
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, region: 'US West', latencyMs: 12, carrier: 'Telnyx / Level 3', activeCalls: 1420 },
  { name: 'New York', lat: 40.7128, lng: -74.006, region: 'US East', latencyMs: 14, carrier: 'Twilio / Lumen', activeCalls: 2180 },
  { name: 'London', lat: 51.5074, lng: -0.1278, region: 'EU West', latencyMs: 18, carrier: 'Colt / British Telecom', activeCalls: 1890 },
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821, region: 'EU Central', latencyMs: 16, carrier: 'Deutsche Telekom / Equinix', activeCalls: 1640 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, region: 'APAC North', latencyMs: 24, carrier: 'NTT Comms / KDDI', activeCalls: 1310 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'APAC South', latencyMs: 21, carrier: 'Singtel / Tata Comms', activeCalls: 980 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, region: 'Oceania', latencyMs: 32, carrier: 'Telstra / Optus', activeCalls: 650 },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, region: 'LATAM', latencyMs: 28, carrier: 'Embratel / Vivo', activeCalls: 490 },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const GlobalNetworkGlobe3D: React.FC<{ className?: string }> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityNode>(GLOBAL_HUBS[0]);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 420;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 5.8);

    // 3. Renderer
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.5);
    dirLight1.position.set(5, 3, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.8);
    dirLight2.position.set(-5, -2, -5);
    scene.add(dirLight2);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeRadius = 2.0;

    // 5. Globe Sphere (Wireframe grid + inner atmospheric glow)
    const sphereGeom = new THREE.SphereGeometry(globeRadius, 48, 48);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
      wireframe: false,
    });
    const baseSphere = new THREE.Mesh(sphereGeom, sphereMat);
    globeGroup.add(baseSphere);

    // Latitude & Longitude lines (Wireframe grid overlay)
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x312e81,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const gridSphere = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius * 1.002, 28, 28),
      gridMat
    );
    globeGroup.add(gridSphere);

    // Glowing Atmospheric Shell
    const glowGeom = new THREE.SphereGeometry(globeRadius * 1.05, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(glowGeom, glowMat);
    globeGroup.add(atmosphere);

    // 6. Dot Constellation (Landmass Points simulation)
    const dotCount = 1200;
    const dotGeom = new THREE.BufferGeometry();
    const dotPositions = new Float32Array(dotCount * 3);

    for (let i = 0; i < dotCount; i++) {
      const lat = (Math.random() - 0.5) * 160;
      const lng = (Math.random() - 0.5) * 360;
      const vec = latLngToVector3(lat, lng, globeRadius * 1.01);
      dotPositions[i * 3] = vec.x;
      dotPositions[i * 3 + 1] = vec.y;
      dotPositions[i * 3 + 2] = vec.z;
    }
    dotGeom.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));

    const dotMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0x818cf8,
      transparent: true,
      opacity: 0.6,
    });
    const dotsMesh = new THREE.Points(dotGeom, dotMat);
    globeGroup.add(dotsMesh);

    // 7. City Markers on the Globe
    const hubMarkers: THREE.Mesh[] = [];
    GLOBAL_HUBS.forEach((city) => {
      const pos = latLngToVector3(city.lat, city.lng, globeRadius * 1.02);

      // Node pin
      const markerGeom = new THREE.SphereGeometry(0.065, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0x34d399, // emerald bright
      });
      const marker = new THREE.Mesh(markerGeom, markerMat);
      marker.position.copy(pos);
      marker.userData = { city };
      globeGroup.add(marker);
      hubMarkers.push(marker);

      // Pulsing beacon ring
      const ringGeom = new THREE.RingGeometry(0.07, 0.12, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos);
      ring.lookAt(0, 0, 0);
      globeGroup.add(ring);
    });

    // 8. 3D Great Circle Arcs connecting hubs
    const arcCurves: THREE.QuadraticBezierCurve3[] = [];
    const packetMeshes: THREE.Mesh[] = [];

    const connections = [
      [0, 1], // SF to NY
      [1, 2], // NY to London
      [2, 3], // London to Frankfurt
      [3, 4], // Frankfurt to Tokyo
      [4, 5], // Tokyo to Singapore
      [5, 6], // Singapore to Sydney
      [1, 7], // NY to Sao Paulo
      [0, 4], // SF to Tokyo (Transpacific)
    ];

    connections.forEach(([i, j]) => {
      const c1 = GLOBAL_HUBS[i];
      const c2 = GLOBAL_HUBS[j];
      const p1 = latLngToVector3(c1.lat, c1.lng, globeRadius * 1.02);
      const p2 = latLngToVector3(c2.lat, c2.lng, globeRadius * 1.02);

      // Midpoint pulled outward
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const distance = p1.distanceTo(p2);
      mid.normalize().multiplyScalar(globeRadius * 1.02 + distance * 0.28);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      arcCurves.push(curve);

      const points = curve.getPoints(36);
      const arcGeom = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.5,
      });
      const arcLine = new THREE.Line(arcGeom, arcMat);
      globeGroup.add(arcLine);

      // Traveling data packet
      const packetGeom = new THREE.SphereGeometry(0.04, 12, 12);
      const packetMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const packet = new THREE.Mesh(packetGeom, packetMat);
      globeGroup.add(packet);
      packetMeshes.push(packet);
    });

    // Interactive Dragging
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.006;
      globeGroup.rotation.x += deltaY * 0.006;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize
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
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (autoRotate && !isDragging) {
        globeGroup.rotation.y += 0.0025;
      }

      // Animate packets along arcs
      packetMeshes.forEach((mesh, idx) => {
        const curve = arcCurves[idx];
        if (curve) {
          const t = (elapsed * 0.4 + idx * 0.15) % 1;
          const pos = curve.getPoint(t);
          mesh.position.copy(pos);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (rendererRef.current?.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [autoRotate]);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[380px] sm:min-h-[440px] cursor-grab active:cursor-grabbing flex items-center justify-center"
      />

      {/* Top Floating Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/70 text-xs text-slate-200 shadow-xl">
        <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="font-mono text-[11px]">GLOBAL TELEPHONY EDGE: 8 POPS ACTIVE</span>
      </div>

      {/* City Latency HUD Card */}
      <div className="absolute bottom-4 right-4 z-10 max-w-xs bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-2xl text-left">
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-xs text-white">{selectedCity.name}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {selectedCity.latencyMs}ms Latency
          </span>
        </div>

        <div className="space-y-1.5 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Edge Gateway:</span>
            <span className="text-slate-200 font-mono">{selectedCity.region}</span>
          </div>
          <div className="flex justify-between">
            <span>Carrier Peering:</span>
            <span className="text-indigo-300 truncate max-w-[130px]">{selectedCity.carrier}</span>
          </div>
          <div className="flex justify-between">
            <span>Concurrent Streams:</span>
            <span className="text-emerald-400 font-mono">{selectedCity.activeCalls.toLocaleString()}</span>
          </div>
        </div>

        {/* City Selectors */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
          {GLOBAL_HUBS.slice(0, 4).map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedCity(c)}
              className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                selectedCity.name === c.name
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
