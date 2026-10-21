"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const finishColorMap = {
  YG: { color: 0xE5B824, metalness: 0.92, roughness: 0.16 }, // Yellow Gold
  WG: { color: 0xF0F2F5, metalness: 0.95, roughness: 0.14 }, // White Gold / Platinum
  RG: { color: 0xDB7F3E, metalness: 0.90, roughness: 0.18 }, // Rose Gold
  BLK: { color: 0x2A2E33, metalness: 0.85, roughness: 0.25 }, // Black Ruthenium
};

export default function ThreeDModelViewer({ 
  modelUrl, 
  productName = "Jewelry Piece", 
  finishCode = "WG", 
  className = "" 
}) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const loadedModelRef = useRef(null);

  // Normalize url to avoid CORS
  const cleanUrl = modelUrl ? modelUrl.replace(/^https?:\/\/(127\.0\.0\.1|localhost):8000\//, '/') : '';

  useEffect(() => {
    if (!cleanUrl || !containerRef.current) return;

    let isMounted = true;
    setLoading(true);
    setLoadError(null);

    const container = containerRef.current;
    const width = container.clientWidth || 440;
    const height = container.clientHeight || 440;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF8F8F7);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 1000);
    camera.position.set(0, 0, 5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.8;
    controls.enablePan = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 20;

    // Stop auto-rotation when user starts interacting
    controls.addEventListener('start', () => {
      controls.autoRotate = false;
      setAutoRotate(false);
    });

    // 5. Studio Lighting for Jewelry Sparkle
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFFFF, 2.2);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xE2E8F0, 1.2);
    fillLight.position.set(-6, -2, -4);
    scene.add(fillLight);

    const topRimLight = new THREE.DirectionalLight(0xFDF8E2, 1.5);
    topRimLight.position.set(0, 8, -5);
    scene.add(topRimLight);

    const frontSpecular = new THREE.PointLight(0xFFFFFF, 1.0, 50);
    frontSpecular.position.set(0, 2, 5);
    scene.add(frontSpecular);

    // Ground Shadow Plane
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Helper to get active material based on finish
    const activeCfg = finishColorMap[finishCode] || finishColorMap.WG;
    const jewelryMaterial = new THREE.MeshStandardMaterial({
      color: activeCfg.color,
      metalness: activeCfg.metalness,
      roughness: activeCfg.roughness,
      envMapIntensity: 1.5,
    });

    // Helper: auto-center and fit model into camera view
    const fitCameraToObject = (object) => {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Center object
      object.position.x += (object.position.x - center.x);
      object.position.y += (object.position.y - center.y);
      object.position.z += (object.position.z - center.z);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.8; // padding factor

      camera.position.set(0, maxDim * 0.4, cameraZ);
      camera.lookAt(0, 0, 0);

      controls.target.set(0, 0, 0);
      controls.minDistance = maxDim * 0.5;
      controls.maxDistance = maxDim * 5;
      ground.position.y = -size.y / 2;

      controls.update();
    };

    const isObj = cleanUrl.toLowerCase().includes('.obj');

    if (isObj) {
      // 6A. Load OBJ Model directly
      const objLoader = new OBJLoader();
      objLoader.load(
        cleanUrl,
        (obj) => {
          if (!isMounted) return;
          obj.traverse((child) => {
            if (child.isMesh) {
              child.material = jewelryMaterial;
              child.castShadow = true;
              child.receiveShadow = true;
              child.geometry.computeVertexNormals();
            }
          });
          scene.add(obj);
          loadedModelRef.current = obj;
          fitCameraToObject(obj);
          setLoading(false);
        },
        undefined,
        (err) => {
          if (!isMounted) return;
          console.warn('OBJ Loading Error:', err);
          setLoadError("Unable to parse 3D CAD mesh.");
          setLoading(false);
        }
      );
    } else {
      // 6B. Load GLB/GLTF Model
      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
        cleanUrl,
        (gltf) => {
          if (!isMounted) return;
          const root = gltf.scene || gltf.scenes[0];
          root.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (!child.material || child.material.roughness === undefined) {
                child.material = jewelryMaterial;
              }
            }
          });
          scene.add(root);
          loadedModelRef.current = root;
          fitCameraToObject(root);
          setLoading(false);
        },
        undefined,
        (err) => {
          if (!isMounted) return;
          console.warn('GLB Loading Error:', err);
          setLoadError("Unable to load 3D GLB model.");
          setLoading(false);
        }
      );
    }

    // 7. Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 8. Responsive Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.clear();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [cleanUrl]);

  // Update material color when finish option changes dynamically
  useEffect(() => {
    if (!loadedModelRef.current) return;
    const activeCfg = finishColorMap[finishCode] || finishColorMap.WG;
    loadedModelRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.color.setHex(activeCfg.color);
        child.material.metalness = activeCfg.metalness;
        child.material.roughness = activeCfg.roughness;
        child.material.needsUpdate = true;
      }
    });
  }, [finishCode]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '440px', background: '#F8F8F7' }} className={className}>
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: '100%', minHeight: '440px', cursor: 'grab' }} 
        onMouseDown={(e) => (e.currentTarget.style.cursor = 'grabbing')}
        onMouseUp={(e) => (e.currentTarget.style.cursor = 'grab')}
      />

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(248, 248, 247, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          zIndex: 5,
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '2px solid #E2E8F0',
            borderTopColor: '#111827',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
            Rendering Live 3D Model...
          </span>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Load Error Fallback */}
      {loadError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#F8F8F7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          zIndex: 6,
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📐</div>
          <h4 style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', margin: '0 0 6px', color: '#111' }}>
            3D Preview Unavailable
          </h4>
          <p style={{ fontSize: '12px', color: '#64748B', maxWidth: '280px', margin: '0 0 16px' }}>
            {loadError}
          </p>
          <a
            href={cleanUrl}
            download
            style={{
              padding: '8px 16px',
              background: '#111',
              color: '#FFF',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '2px',
            }}
          >
            Download 3D File
          </a>
        </div>
      )}

    </div>
  );
}
