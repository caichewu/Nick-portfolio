import React, { useEffect, useRef, useState } from 'react';

/**
 * 分阶段 3D 粒子宇宙（暗黑 + 荧光绿）
 * - 阶段1：整体形态（球面成型）
 * - 阶段2：打散为随机星空
 * - 阶段3：汇聚螺旋星云（组合）
 * - 阶段4：浮现交互节点（hover 高亮 + 简易弹窗）
 * - 阶段5：展开知识图谱（连线 + 粒子向节点聚集）
 * 说明：为避免本地依赖阻塞，运行时动态加载 three 与 OrbitControls
 */
const CosmicStages = ({ onClose }) => {
  const mountRef = useRef(null);
  const popupRef = useRef(null);
  const [stage, setStage] = useState(0);
  const stageRef = useRef(0);
  const applyStageRef = useRef(null);
  const [boxMode, setBoxMode] = useState(false);
  const boxModeRef = useRef(false);
  const boxToggleRef = useRef(null);
  const boxEnterRef = useRef(null);
  const [rollMode, setRollMode] = useState(false);
  const rollModeRef = useRef(false);
  const rollEnterRef = useRef(null);
  const rollToggleRef = useRef(null);

  useEffect(() => {
    let THREE;
    let OrbitControls;
    let raf;
    let cleanup = () => {};

    (async () => {
      // 动态加载 three 与控制器
      THREE = await import('https://esm.sh/three@0.161.0');
      ({ OrbitControls } = await import('https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js'));

      // 基本场景
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#0D0D0D');
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
      camera.position.z = 150;
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);

      // 控制器
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 50;
      controls.maxDistance = 300;

      // 粒子
      const TOTAL_PARTICLES = 60000;
      const positions = new Float32Array(TOTAL_PARTICLES * 3);
      const colors = new Float32Array(TOTAL_PARTICLES * 3);
      const velocities = new Float32Array(TOTAL_PARTICLES * 3); // 爆炸速度
      let boxTargets = null;
      let scatterTargets = null;
      const morphDelays = new Float32Array(TOTAL_PARTICLES); // 形变延迟，制造有机错峰
      for (let i = 0; i < TOTAL_PARTICLES; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 800;
        positions[i3 + 1] = (Math.random() - 0.5) * 800;
        positions[i3 + 2] = (Math.random() - 0.5) * 800;
        // 预生成爆炸速度（随机方向，幅度适中）
        velocities[i3] = (Math.random() - 0.5) * 80;
        velocities[i3 + 1] = (Math.random() - 0.5) * 80;
        velocities[i3 + 2] = (Math.random() - 0.5) * 80;
        morphDelays[i] = Math.random() * 0.6; // 0~0.6s 错峰
        const d = Math.hypot(positions[i3], positions[i3 + 1], positions[i3 + 2]);
        const b = 1 - Math.min(1, d / 800);
        colors[i3] = 0.1 * b;
        colors[i3 + 1] = 1.0 * b;
        colors[i3 + 2] = 0.2 * b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const mat = new THREE.PointsMaterial({
        size: 0.5,
        transparent: true,
        opacity: 0.9,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const particles = new THREE.Points(geo, mat);
      scene.add(particles);

      // 节点与连线（默认隐藏）
      const TOTAL_NODES = 8;
      const nodeGroup = new THREE.Group();
      const lineGroup = new THREE.Group();
      const nodeGeom = new THREE.SphereGeometry(2, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xEAEAEA, transparent: true, opacity: 0.9 });
      const ringGeom = new THREE.RingGeometry(2.5, 3, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x39FF14, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
      for (let i = 0; i < TOTAL_NODES; i++) {
        const g = new THREE.Group();
        const angle = (i / TOTAL_NODES) * Math.PI * 2;
        const radius = 60;
        g.position.set(Math.cos(angle) * radius, Math.sin(angle * 2) * 20, Math.sin(angle) * radius);
        g.userData = { id: i };
        const sphere = new THREE.Mesh(nodeGeom, nodeMat.clone());
        const ring = new THREE.Mesh(ringGeom, ringMat.clone());
        ring.rotation.x = Math.PI / 2;
        g.add(sphere);
        g.add(ring);
        nodeGroup.add(g);
      }
      // 连线
      const lineMat = new THREE.LineBasicMaterial({ color: 0x39FF14, transparent: true, opacity: 0.3 });
      for (let i = 0; i < TOTAL_NODES; i++) {
        const a = nodeGroup.children[i].position;
        const b = nodeGroup.children[(i + 1) % TOTAL_NODES].position;
        const lgeo = new THREE.BufferGeometry().setFromPoints([a.clone(), b.clone()]);
        const line = new THREE.Line(lgeo, lineMat);
        lineGroup.add(line);
      }
      nodeGroup.visible = false;
      lineGroup.visible = false;
      scene.add(nodeGroup);
      scene.add(lineGroup);

      // 射线 hover 弹窗
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      const onMouseMove = (e) => {
        if (stage < 3) return;
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const ixs = raycaster.intersectObjects(nodeGroup.children, true);
        nodeGroup.children.forEach((g) => {
          g.children[0].material.opacity = 0.9;
          g.children[1].material.opacity = 0.6;
        });
        if (ixs.length) {
          const g = ixs[0].object.parent;
          g.children[0].material.opacity = 1;
          g.children[1].material.opacity = 1;
          if (popupRef.current) {
            popupRef.current.style.left = `${e.clientX + 12}px`;
            popupRef.current.style.top = `${e.clientY + 12}px`;
            popupRef.current.classList.add('opacity-100', 'pointer-events-auto');
          }
        } else {
          if (popupRef.current) {
            popupRef.current.classList.remove('opacity-100', 'pointer-events-auto');
          }
        }
      };
      window.addEventListener('mousemove', onMouseMove);

      // 阶段切换逻辑
      const resetToStarfield = () => {
        const arr = geo.getAttribute('position').array;
        for (let i = 0; i < TOTAL_PARTICLES; i++) {
          const i3 = i * 3;
          arr[i3] = (Math.random() - 0.5) * 800;
          arr[i3 + 1] = (Math.random() - 0.5) * 800;
          arr[i3 + 2] = (Math.random() - 0.5) * 800;
        }
        geo.getAttribute('position').needsUpdate = true;
      };

      // 生成长方体表面目标坐标（点云方盒：均匀分布在6个面上）
      const buildBoxTargets = () => {
        const arr = new Float32Array(TOTAL_PARTICLES * 3);
        const w = 180, h = 90, d = 90;
        for (let i = 0; i < TOTAL_PARTICLES; i++) {
          const i3 = i * 3;
          const face = i % 6; // 6个面轮询
          let x = (Math.random() - 0.5) * w;
          let y = (Math.random() - 0.5) * h;
          let z = (Math.random() - 0.5) * d;
          if (face === 0) x = -w / 2;
          if (face === 1) x = w / 2;
          if (face === 2) y = -h / 2;
          if (face === 3) y = h / 2;
          if (face === 4) z = -d / 2;
          if (face === 5) z = d / 2;
          arr[i3] = x; arr[i3 + 1] = y; arr[i3 + 2] = z;
        }
        return arr;
      };

      // 生成打散目标（大范围随机星空）
      const buildScatterTargets = () => {
        const arr = new Float32Array(TOTAL_PARTICLES * 3);
        for (let i = 0; i < TOTAL_PARTICLES; i++) {
          const i3 = i * 3;
          arr[i3] = (Math.random() - 0.5) * 900;
          arr[i3 + 1] = (Math.random() - 0.5) * 900;
          arr[i3 + 2] = (Math.random() - 0.5) * 900;
        }
        return arr;
      };

      // 粒子坐标插值至目标
      const morphTo = (target, step = 0.06) => {
        const arr = geo.getAttribute('position').array;
        let p = 0;
        const animate = () => {
          p = Math.min(1, p + step);
          for (let i = 0; i < TOTAL_PARTICLES; i++) {
            const i3 = i * 3;
            // 错峰 + 缓动（easeOutCubic）
            const delay = morphDelays[i];
            let local = Math.max(0, (p - delay) / (1 - 0.6));
            local = 1 - Math.pow(1 - Math.min(1, local), 3);
            arr[i3] = arr[i3] + (target[i3] - arr[i3]) * (0.08 + 0.2 * local);
            arr[i3 + 1] = arr[i3 + 1] + (target[i3 + 1] - arr[i3 + 1]) * (0.08 + 0.2 * local);
            arr[i3 + 2] = arr[i3 + 2] + (target[i3 + 2] - arr[i3 + 2]) * (0.08 + 0.2 * local);
          }
          geo.getAttribute('position').needsUpdate = true;
          if (p < 1) requestAnimationFrame(animate);
        };
        animate();
      };

      // 打散：从当前姿态爆炸至外层（基于预生成速度向量）
      const toExplode = () => {
        const start = geo.getAttribute('position').array.slice();
        const arr = geo.getAttribute('position').array;
        let p = 0;
        const amp = 1.0;
        const step = () => {
          p = Math.min(1, p + 0.02);
          for (let i = 0; i < TOTAL_PARTICLES; i++) {
            const i3 = i * 3;
            const tx = start[i3] + velocities[i3] * amp;
            const ty = start[i3 + 1] + velocities[i3 + 1] * amp;
            const tz = start[i3 + 2] + velocities[i3 + 2] * amp;
            arr[i3] = THREE.MathUtils.lerp(start[i3], tx, p);
            arr[i3 + 1] = THREE.MathUtils.lerp(start[i3 + 1], ty, p);
            arr[i3 + 2] = THREE.MathUtils.lerp(start[i3 + 2], tz, p);
          }
          geo.getAttribute('position').needsUpdate = true;
          if (p < 1) requestAnimationFrame(step);
        };
        step();
      };

      const toSpiral = () => {
        const arr = geo.getAttribute('position').array;
        let p = 0;
        const step = () => {
          p = Math.min(1, p + 0.01);
          for (let i = 0; i < TOTAL_PARTICLES; i++) {
            const i3 = i * 3;
            const r = Math.random() * 70 * p;
            const a = r * 0.4;
            const x = Math.cos(a) * r;
            const z = Math.sin(a) * r;
            const y = (Math.random() - 0.5) * 30 * p;
            arr[i3] = THREE.MathUtils.lerp(arr[i3], x, 0.02);
            arr[i3 + 1] = THREE.MathUtils.lerp(arr[i3 + 1], y, 0.02);
            arr[i3 + 2] = THREE.MathUtils.lerp(arr[i3 + 2], z, 0.02);
          }
          geo.getAttribute('position').needsUpdate = true;
          if (p < 1) requestAnimationFrame(step);
        };
        step();
      };

      // 整体形态：球面成型（Fibonacci sphere）
      const toSphere = () => {
        const arr = geo.getAttribute('position').array;
        const R = 90;
        let p = 0;
        const PHI = Math.PI * (3 - Math.sqrt(5)); // golden angle
        const step = () => {
          p = Math.min(1, p + 0.012);
          for (let i = 0; i < TOTAL_PARTICLES; i++) {
            const i3 = i * 3;
            const y = 1 - (i / (TOTAL_PARTICLES - 1)) * 2; // -1..1
            const radius = Math.sqrt(1 - y * y);
            const theta = PHI * i;
            const tx = Math.cos(theta) * radius * R;
            const ty = y * R * 0.65; // 稍微压扁增强纵深
            const tz = Math.sin(theta) * radius * R;
            arr[i3] = THREE.MathUtils.lerp(arr[i3], tx, 0.025);
            arr[i3 + 1] = THREE.MathUtils.lerp(arr[i3 + 1], ty, 0.025);
            arr[i3 + 2] = THREE.MathUtils.lerp(arr[i3 + 2], tz, 0.025);
          }
          geo.getAttribute('position').needsUpdate = true;
          if (p < 1) requestAnimationFrame(step);
        };
        step();
      };

      const toNodes = () => {
        const arr = geo.getAttribute('position').array;
        let p = 0;
        const perNode = Math.floor(TOTAL_PARTICLES / TOTAL_NODES);
        const step = () => {
          p = Math.min(1, p + 0.01);
          for (let i = 0; i < TOTAL_PARTICLES; i++) {
            const i3 = i * 3;
            const idx = Math.floor(i / perNode);
            const n = nodeGroup.children[idx % TOTAL_NODES].position;
            const tx = n.x + (Math.random() - 0.5) * 20;
            const ty = n.y + (Math.random() - 0.5) * 20;
            const tz = n.z + (Math.random() - 0.5) * 20;
            arr[i3] = THREE.MathUtils.lerp(arr[i3], tx, 0.02);
            arr[i3 + 1] = THREE.MathUtils.lerp(arr[i3 + 1], ty, 0.02);
            arr[i3 + 2] = THREE.MathUtils.lerp(arr[i3 + 2], tz, 0.02);
          }
          geo.getAttribute('position').needsUpdate = true;
          if (p < 1) requestAnimationFrame(step);
        };
        step();
      };

      const applyStage = (s) => {
        if (s === 1) {
          toSphere();                  // 整体形态
          nodeGroup.visible = false;
          lineGroup.visible = false;
        } else if (s === 2) {
          toExplode();                 // 打散（爆炸）
          nodeGroup.visible = false;
          lineGroup.visible = false;
        } else if (s === 3) {
          resetToStarfield();          // 转入随机星空（游移）
          nodeGroup.visible = false;
          lineGroup.visible = false;
        } else if (s === 4) {
          toSpiral();                  // 组合为螺旋星云
          nodeGroup.visible = false;
          lineGroup.visible = false;
        } else if (s === 5) {
          nodeGroup.visible = true;    // 浮现交互节点
          lineGroup.visible = false;
        } else if (s === 6) {
          nodeGroup.visible = true;    // 展开知识图谱
          lineGroup.visible = true;
          toNodes();
        }
      };
      applyStage(stage);
      applyStageRef.current = applyStage;

      // 方体模式：进入与切换
      boxEnterRef.current = () => {
        boxModeRef.current = true;
        if (!boxTargets) boxTargets = buildBoxTargets();
        morphTo(boxTargets);
      };
      boxToggleRef.current = () => {
        if (!boxModeRef.current) return;
        if (!boxTargets) boxTargets = buildBoxTargets();
        if (!scatterTargets) scatterTargets = buildScatterTargets();
        // 判断当前朝向，估算与boxTargets的距离来决定去向
        const arr = geo.getAttribute('position').array;
        let sample = 0, dist = 0;
        for (let i = 0; i < 100; i++) {
          const idx = (Math.floor(Math.random() * TOTAL_PARTICLES)) * 3;
          const dx = arr[idx] - boxTargets[idx];
          const dy = arr[idx + 1] - boxTargets[idx + 1];
          const dz = arr[idx + 2] - boxTargets[idx + 2];
          dist += Math.sqrt(dx * dx + dy * dy + dz * dz);
          sample++;
        }
        const avg = dist / Math.max(1, sample);
        if (avg < 30) {
          morphTo(scatterTargets); // 由箱体 -> 散开
        } else {
          morphTo(boxTargets); // 由散开 -> 箱体
        }
      };

      // 球体滚动模式
      let rollStart = 0;
      const sphereRadius = 90; // 与 toSphere 保持一致
      rollEnterRef.current = () => {
        rollModeRef.current = true;
        toSphere();
        rollStart = performance.now() / 1000;
        particles.position.set(0, 0, 0);
        particles.rotation.set(0, 0, 0);
      };
      rollToggleRef.current = () => {
        rollModeRef.current = !rollModeRef.current;
        if (rollModeRef.current) {
          rollEnterRef.current();
        } else {
          particles.position.set(0, 0, 0);
          particles.rotation.set(0, 0, 0);
        }
      };

      // 进入即展示：默认开启球体滚动，确保“肉眼可见”的变化
      setRollMode(true);
      rollEnterRef.current();

      // 动画循环
      const tick = () => {
        raf = requestAnimationFrame(tick);
        const t = performance.now() * 0.0012;
        const pulse = 1 + 0.03 * Math.sin(t * 1.8);
        particles.rotation.y += 0.001;
        particles.rotation.x += 0.00035;
        // 呼吸脉动（全局轻微缩放）
        particles.scale.set(pulse, pulse, pulse);
        // 球体滚动：沿 X 方向往复移动并按“无滑动滚动”旋转
        if (rollModeRef.current) {
          const now = performance.now() / 1000;
          const elapsed = now - rollStart;
          const amplitude = 140;      // 滚动范围
          const speed = 0.6;          // 位移速度
          const cx = amplitude * Math.sin(speed * elapsed);
          const theta = cx / sphereRadius; // 近似“无滑动”角度
          particles.position.x = cx;
          particles.position.y = 0;
          particles.rotation.set(0, 0, -theta);
        }
        // 方体模式下持续慢速自转
        if (boxModeRef.current) {
          particles.rotation.y += 0.0035;
          // 方体表面流动感：对少量粒子加切线位移
          const arr = geo.getAttribute('position').array;
          for (let i = 0; i < TOTAL_PARTICLES; i += 30) {
            const i3 = i * 3;
            const x = arr[i3], _y = arr[i3 + 1], z = arr[i3 + 2];
            const s = 0.3 + 0.2 * Math.sin((x + z) * 0.02 + t * 2.0);
            arr[i3] += (-z) * 0.002 * s;
            arr[i3 + 2] += (x) * 0.002 * s;
          }
          geo.getAttribute('position').needsUpdate = true;
        }
        // 星空游移
        if (stageRef.current === 3) {
          const arr = geo.getAttribute('position').array;
          for (let i = 0; i < TOTAL_PARTICLES; i += 20) {
            const i3 = i * 3;
            // 使用简化“向量场”驱动，形成连贯流动
            const nx = Math.sin(arr[i3] * 0.005 + t) * 0.6;
            const ny = Math.cos(arr[i3 + 1] * 0.004 + t * 0.9) * 0.5;
            const nz = Math.sin((arr[i3] + arr[i3 + 2]) * 0.004 + t * 1.1) * 0.6;
            arr[i3] += nx;
            arr[i3 + 1] += ny;
            arr[i3 + 2] += nz;
          }
          geo.getAttribute('position').needsUpdate = true;
          const col = geo.getAttribute('color').array;
          const time = Date.now() * 0.002;
          for (let i = 0; i < TOTAL_PARTICLES; i += 60) {
            const gi = i * 3 + 1;
            col[gi] = 0.85 + 0.15 * (0.5 + 0.5 * Math.sin(time + i * 0.03));
          }
          geo.getAttribute('color').needsUpdate = true;
        }
        if (stageRef.current === 4) {
          // 螺旋阶段：增强旋转 + 半径呼吸
          particles.rotation.y += 0.005;
        }
        if (nodeGroup.visible) {
          nodeGroup.children.forEach((g) => {
            const scale = 1 + Math.sin(Date.now() * 0.001 + g.userData.id) * 0.1;
            g.scale.set(scale, scale, scale);
          });
        }
        controls.update();
        renderer.render(scene, camera);
      };
      tick();

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('mousemove', onMouseMove);
        mountRef.current && mountRef.current.removeChild(renderer.domElement);
        renderer.dispose();
        geo.dispose();
        mat.dispose();
      };

      // 监听阶段变化
      const obs = new MutationObserver(() => applyStage(stage));
      obs.observe(document.body, { attributes: false, childList: false, subtree: false });
    })();

    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    stageRef.current = stage;
    if (applyStageRef.current) {
      applyStageRef.current(stage);
    }
    document.body.dataset.cosmicStage = String(stage);
  }, [stage]);

  const stageTitle = {
    0: '阶段0：初始大球体（奇点）',
    1: '阶段1：整体形态（球面）',
    2: '阶段2：爆炸打散',
    3: '阶段3：星空漫游',
    4: '阶段4：组合成螺旋',
    5: '阶段5：浮现交互节点',
    6: '阶段6：展开知识图谱',
  }[stage];

  return (
    <div className="fixed inset-0 z-[60] bg-black/95">
      {/* 3D 容器 */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* 顶部信息与关闭 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md border border-ui-border text-dark-text bg-dark-card/70 backdrop-blur-[6px]">
        {stageTitle}
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={() => {
          setBoxMode((v) => {
            const next = !v;
            boxModeRef.current = next;
            if (next && boxEnterRef.current) boxEnterRef.current();
            if (next) {
              // 进入方体时关闭滚动模式
              rollModeRef.current = false;
              setRollMode(false);
            }
            return next;
          });
        }} className="ui-btn px-4 py-2 rounded-md">{boxMode ? '退出方体' : '方体模式'}</button>
        <button onClick={() => {
          setRollMode((v) => {
            const next = !v;
            rollModeRef.current = next;
            if (rollToggleRef.current) rollToggleRef.current();
            // 进入滚动时关闭方体模式
            if (next) {
              boxModeRef.current = false;
              setBoxMode(false);
            }
            return next;
          });
        }} className="ui-btn px-4 py-2 rounded-md">{rollMode ? '停止滚动' : '球体滚动'}</button>
        <button onClick={onClose} className="ui-btn px-4 py-2 rounded-md">退出</button>
      </div>
      {boxMode && (
        <div className="absolute top-16 right-4 text-dark-subtext">
          点击画面：散开/集合
        </div>
      )}
      {/* 捕获点击切换散开/集合（仅方体模式） */}
      {boxMode && (
        <div className="absolute inset-0" onClick={() => boxToggleRef.current && boxToggleRef.current()} />
      )}

      {/* 悬停弹窗 */}
      <div ref={popupRef} className="absolute px-3 py-2 rounded-md border border-ui-border bg-dark-card/80 text-dark-text opacity-0 pointer-events-none transition-opacity duration-200">
        核心节点 · 代表能力/业务模块
      </div>

      {/* 底部阶段控制 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        <button className="ui-btn px-4 py-2 rounded-md" onClick={() => setStage((s) => Math.max(0, s - 1))}>上一阶段</button>
        <button className="ui-btn px-4 py-2 rounded-md" onClick={() => setStage((s) => Math.min(6, s + 1))}>下一阶段</button>
      </div>
    </div>
  );
};

export default CosmicStages;
