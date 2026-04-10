import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground({ theme }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Scene & Camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 4;

        // ─── Particle System 1: Main field ───
        const count = window.innerWidth < 768 ? 1200 : 2500;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

            // Purple-cyan gradient
            const t = Math.random();
            colors[i * 3] = 0.48 + t * 0.02;  // R
            colors[i * 3 + 1] = 0.23 + t * 0.48;  // G
            colors[i * 3 + 2] = 0.93 - t * 0.1;   // B

            sizes[i] = Math.random() * 2 + 0.5;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            transparent: true,
            opacity: theme === 'light' ? 0.5 : 0.8,
            sizeAttenuation: true,
        });

        const particles = new THREE.Points(geo, mat);
        scene.add(particles);

        // ─── Particle System 2: Floating orbs ───
        const orbCount = 60;
        const orbGeo = new THREE.BufferGeometry();
        const orbPos = new Float32Array(orbCount * 3);
        for (let i = 0; i < orbCount; i++) {
            orbPos[i * 3] = (Math.random() - 0.5) * 16;
            orbPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
            orbPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
        }
        orbGeo.setAttribute('position', new THREE.BufferAttribute(orbPos, 3));
        const orbMat = new THREE.PointsMaterial({
            size: 0.12,
            color: new THREE.Color(theme === 'light' ? 0x6d28d9 : 0x7C3AED),
            transparent: true,
            opacity: theme === 'light' ? 0.35 : 0.6,
        });
        const orbs = new THREE.Points(orbGeo, orbMat);
        scene.add(orbs);

        // ─── Mouse interaction ───
        const mouse = new THREE.Vector2();
        const handleMouse = (e) => {
            mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', handleMouse);

        // ─── Animation loop ───
        let frame = 0;
        let rafId;
        const animate = () => {
            rafId = requestAnimationFrame(animate);
            frame++;

            const t = frame * 0.001;
            particles.rotation.y = t * 0.05 + mouse.x * 0.05;
            particles.rotation.x = t * 0.02 + mouse.y * 0.03;

            orbs.rotation.y = -t * 0.08 + mouse.x * 0.08;
            orbs.rotation.x = t * 0.04 + mouse.y * 0.04;

            // Float y
            const pos = geo.attributes.position.array;
            for (let i = 1; i < count * 3; i += 3) {
                pos[i] += Math.sin(t + i) * 0.0002;
            }
            geo.attributes.position.needsUpdate = true;

            // Camera subtle drift
            camera.position.x += (mouse.x * 0.3 - camera.position.x) * 0.02;
            camera.position.y += (mouse.y * 0.2 - camera.position.y) * 0.02;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };
        animate();

        // ─── Resize handler ───
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', handleMouse);
            window.removeEventListener('resize', handleResize);
            geo.dispose();
            mat.dispose();
            orbGeo.dispose();
            orbMat.dispose();
            renderer.dispose();
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0, left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    );
}
