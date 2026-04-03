import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * 全屏三维粒子星云启动页
 * - 粒子颜色：#39FF14
 * - 数量：5 万
 * - 旋转：y 轴 0.002 / 帧，x 轴 0.001 / 帧
 * - 交互：鼠标悬停轻微吸附，点击产生粒子爆裂效果
 * - 展示：3 秒后自动淡出
 */
const ParticleNebulaSplash = ({ onFinish, duration = 3000 }) => {
  const mountRef = useRef(null);
  const [done, setDone] = useState(false);
  const MotionDiv = motion.div;
  const skip = () => {
    setDone(true);
    if (onFinish) onFinish();
  };

  useEffect(() => {
    let rafId;
    let cleanup = () => {};
    (async () => {
      const THREE = await import('https://esm.sh/three@0.161.0');
      const mount = mountRef.current;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#0D0D0D');

      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 42;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor('#0D0D0D', 1);
      mount.appendChild(renderer.domElement);

      // 生成粒子（自适配 + 螺旋星云分布）
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const base = 50000;
      const count = dpr > 1.3 || window.innerWidth < 1024 ? Math.floor(base * 0.7) : base;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const color = new THREE.Color('#39FF14');
      const radiusMax = 28;
      const spinFactor = 0.35; // 螺旋紧密度
      const arms = 3;          // 螺旋臂数量
      const rand = 0.8;        // 噪声
      for (let i = 0; i < count; i++) {
        const radius = Math.random() * radiusMax;
        // 基于半径的旋转角
        const spinAngle = radius * spinFactor;
        // 决定该点属于哪条螺旋臂
        const branch = (i % arms) / arms * Math.PI * 2;
        // 引入随机扰动，形成“银河”颗粒感
        const randX = (Math.random() - 0.5) * rand;
        const randY = (Math.random() - 0.5) * rand * 0.6;
        const randZ = (Math.random() - 0.5) * rand;
        const x = Math.cos(branch + spinAngle) * radius + randX;
        const y = randY;
        const z = Math.sin(branch + spinAngle) * radius + randZ;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        // 越靠近中心越亮，形成荧光核
        const centerFactor = 1 - (radius / radiusMax);
        const intensity = 0.5 + centerFactor * 0.5; // 0.5~1.0
        const c = color.clone().multiplyScalar(intensity);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // 交互：鼠标轻吸附（改变整体旋转目标），点击爆裂（短暂随机位移）
      const mouse = new THREE.Vector2(0, 0);
      const targetRot = { x: 0, y: 0 };

      // 交互：鼠标吸附 + 拖拽旋转
      let dragging = false;
      let prev = { x: 0, y: 0 };
      const onMove = (e) => {
        if (dragging) {
          const dx = e.clientX - prev.x;
          const dy = e.clientY - prev.y;
          targetRot.y += dx * 0.003;
          targetRot.x += dy * 0.002;
          prev = { x: e.clientX, y: e.clientY };
          return;
        }
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        targetRot.y = mouse.x * 0.3; // 吸附更明显
        targetRot.x = mouse.y * 0.15;
      };
      const onDown = (e) => {
        dragging = true;
        prev = { x: e.clientX, y: e.clientY };
      };
      const onUp = () => { dragging = false; };
      const onClick = () => {
        const pos = geometry.getAttribute('position');
        for (let i = 0; i < pos.count; i += 50) {
          pos.array[i * 3 + 0] += (Math.random() - 0.5) * 3;
          pos.array[i * 3 + 1] += (Math.random() - 0.5) * 3;
          pos.array[i * 3 + 2] += (Math.random() - 0.5) * 3;
        }
        pos.needsUpdate = true;
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mousedown', onDown);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('click', onClick);

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      const animate = () => {
        rafId = requestAnimationFrame(animate);
        points.rotation.y += 0.002 + (targetRot.y - points.rotation.y) * 0.04;
        points.rotation.x += 0.001 + (targetRot.x - points.rotation.x) * 0.04;
        renderer.render(scene, camera);
      };
      animate();

      const timer = setTimeout(() => {
        setDone(true);
        if (onFinish) onFinish();
      }, duration);

      cleanup = () => {
        clearTimeout(timer);
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mousedown', onDown);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('click', onClick);
        mount.removeChild(renderer.domElement);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      cleanup();
    };
  }, [duration, onFinish]);

  return (
    <AnimatePresence>
      {!done && (
        <MotionDiv
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1 } }}
          className="fixed inset-0 z-50"
          style={{ backgroundColor: '#0D0D0D' }}
        >
          <div ref={mountRef} className="w-full h-full" />
          <button
            onClick={skip}
            className="absolute top-6 right-6 ui-btn px-4 py-2 rounded-md"
            aria-label="Skip intro"
          >
            跳过
          </button>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default ParticleNebulaSplash;
