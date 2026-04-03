import React, { useEffect, useRef } from 'react';

const POOL = 800;
const LINK_DISTANCE = 3;
const LINK_DISTANCE2 = LINK_DISTANCE * LINK_DISTANCE;
const MAX_SEGMENTS = 14000;

const PreIntroCosmos = ({ onFinish }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    let THREE;
    let renderer;
    let scene;
    let camera;
    let group;
    let pointsGeo;
    let pointsMat;
    let linesGeo;
    let linesMat;
    let points;
    let lines;

    const positions = new Float32Array(POOL * 3);
    const colors = new Float32Array(POOL * 3);
    const sizes = new Float32Array(POOL);
    const alphas = new Float32Array(POOL);
    const velocities = new Float32Array(POOL * 3);
    const lifes = new Float32Array(POOL);
    const ttls = new Float32Array(POOL);
    const hues = new Float32Array(POOL);
    const kinds = new Uint8Array(POOL);
    const origins = new Float32Array(POOL * 3);
    const expands = new Float32Array(POOL * 3);
    const twists = new Float32Array(POOL * 3);
    const expandScales = new Float32Array(POOL);
    const splitAts = new Float32Array(POOL);

    const linePositions = new Float32Array(MAX_SEGMENTS * 2 * 3);
    const lineColors = new Float32Array(MAX_SEGMENTS * 2 * 3);
    const active = new Uint16Array(POOL);
    const cells = new Map();

    let head = 0;
    let lineAcc = 0;
    let lastT = performance.now();
    let destroyed = false;
    let mountEl = null;

    const cursor = { x: 0, y: 0, active: false };
    const ndc = { x: 0, y: 0 };
    let vCam;
    let vWorld;
    let vDir;
    let vLocal;
    let vPrev;
    let vCurr;

    const finish = () => onFinish && onFinish();
    const keyOf = (x, y, z) => `${x},${y},${z}`;

    const hslToRgb = (h, s, l) => {
      const hue2rgb = (p, q, t) => {
        let tt = t;
        if (tt < 0) tt += 1;
        if (tt > 1) tt -= 1;
        if (tt < 1 / 6) return p + (q - p) * 6 * tt;
        if (tt < 1 / 2) return q;
        if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
        return p;
      };
      if (s === 0) return [l, l, l];
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
    };

    const spawn = (x, y, z, dirX, dirY, dirZ, speed, hue, kind) => {
      const i = head;
      head = (head + 1) % POOL;
      const i3 = i * 3;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      const jitter = kind === 1 ? 0.7 : 0.16;
      velocities[i3] = dirX * speed + (Math.random() - 0.5) * jitter;
      velocities[i3 + 1] = dirY * speed + (Math.random() - 0.5) * jitter;
      velocities[i3 + 2] = dirZ * speed + (Math.random() - 0.5) * jitter;

      const ttl = kind === 1 ? 1.7 : 2.1;
      lifes[i] = ttl;
      ttls[i] = ttl;
      hues[i] = hue;
      sizes[i] = kind === 1 ? 3.5 + Math.random() * 2.5 : 5.5 + Math.random() * 3.0;
      alphas[i] = 1;
      kinds[i] = kind;

      origins[i3] = x;
      origins[i3 + 1] = y;
      origins[i3 + 2] = z;

      let ex = (Math.random() - 0.5) * 2;
      let ey = (Math.random() - 0.5) * 2;
      let ez = (Math.random() - 0.5) * 2;
      const el = 1 / (Math.hypot(ex, ey, ez) + 1e-6);
      ex *= el;
      ey *= el;
      ez *= el;
      expands[i3] = ex;
      expands[i3 + 1] = ey;
      expands[i3 + 2] = ez;

      let tx = (Math.random() - 0.5) * 2;
      let ty = (Math.random() - 0.5) * 2;
      let tz = (Math.random() - 0.5) * 2;
      const tl = 1 / (Math.hypot(tx, ty, tz) + 1e-6);
      tx *= tl;
      ty *= tl;
      tz *= tl;
      twists[i3] = tx;
      twists[i3 + 1] = ty;
      twists[i3 + 2] = tz;

      expandScales[i] = 0.65 + Math.random() * 0.75;
      splitAts[i] = Math.min(ttl - 0.45, 1.05 + Math.random() * 0.55);
    };

    const updateCursorLocal = () => {
      if (!cursor.active || !camera || !group || !THREE) return false;
      ndc.x = cursor.x;
      ndc.y = cursor.y;
      const camPos = vCam.setFromMatrixPosition(camera.matrixWorld);
      vWorld.set(ndc.x, ndc.y, 0.5).unproject(camera);
      vDir.copy(vWorld).sub(camPos).normalize();
      const denom = vDir.z;
      if (Math.abs(denom) < 1e-6) return false;
      const t = -camPos.z / denom;
      vWorld.copy(camPos).add(vDir.multiplyScalar(t));
      vLocal.copy(vWorld);
      group.worldToLocal(vLocal);
      return true;
    };

    const rebuildLinks = (activeCount) => {
      cells.clear();
      const invCell = 1 / LINK_DISTANCE;
      let linkableCount = 0;
      for (let ai = 0; ai < activeCount; ai++) {
        const idx = active[ai];
        if (kinds[idx] !== 0) continue;
        active[linkableCount] = idx;
        linkableCount++;
        const i3 = idx * 3;
        const gx = Math.floor(positions[i3] * invCell);
        const gy = Math.floor(positions[i3 + 1] * invCell);
        const gz = Math.floor(positions[i3 + 2] * invCell);
        const k = keyOf(gx, gy, gz);
        const arr = cells.get(k);
        if (arr) arr.push(idx);
        else cells.set(k, [idx]);
      }

      let seg = 0;
      const maxNeighbors = 16;
      for (let ai = 0; ai < linkableCount; ai++) {
        const i = active[ai];
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        const gx = Math.floor(x * invCell);
        const gy = Math.floor(y * invCell);
        const gz = Math.floor(z * invCell);

        let neighbors = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dz = -1; dz <= 1; dz++) {
              const list = cells.get(keyOf(gx + dx, gy + dy, gz + dz));
              if (!list) continue;
              for (let k = 0; k < list.length; k++) {
                const j = list[k];
                if (j <= i) continue;
                const j3 = j * 3;
                const dx2 = positions[j3] - x;
                const dy2 = positions[j3 + 1] - y;
                const dz2 = positions[j3 + 2] - z;
                const d2 = dx2 * dx2 + dy2 * dy2 + dz2 * dz2;
                if (d2 > LINK_DISTANCE2) continue;
                if (seg >= MAX_SEGMENTS) break;

                const o = seg * 6;
                linePositions[o] = x;
                linePositions[o + 1] = y;
                linePositions[o + 2] = z;
                linePositions[o + 3] = positions[j3];
                linePositions[o + 4] = positions[j3 + 1];
                linePositions[o + 5] = positions[j3 + 2];

                const d = Math.sqrt(d2);
                const fall = 1 - d / LINK_DISTANCE;
                const a = Math.min(alphas[i], alphas[j]) * fall * fall;
                const mix = 0.5;
                const r1 = colors[i3];
                const g1 = colors[i3 + 1];
                const b1 = colors[i3 + 2];
                const r2 = colors[j3];
                const g2 = colors[j3 + 1];
                const b2 = colors[j3 + 2];
                lineColors[o] = (r1 * (1 - mix) + r2 * mix) * a;
                lineColors[o + 1] = (g1 * (1 - mix) + g2 * mix) * a;
                lineColors[o + 2] = (b1 * (1 - mix) + b2 * mix) * a;
                lineColors[o + 3] = (r2 * (1 - mix) + r1 * mix) * a;
                lineColors[o + 4] = (g2 * (1 - mix) + g1 * mix) * a;
                lineColors[o + 5] = (b2 * (1 - mix) + b1 * mix) * a;

                seg++;
                neighbors++;
                if (neighbors >= maxNeighbors) break;
              }
              if (neighbors >= maxNeighbors) break;
            }
            if (neighbors >= maxNeighbors) break;
          }
          if (neighbors >= maxNeighbors) break;
        }
      }

      linesGeo.setDrawRange(0, seg * 2);
      linesGeo.attributes.position.needsUpdate = true;
      linesGeo.attributes.color.needsUpdate = true;
    };

    const animate = () => {
      raf = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min(0.033, (now - lastT) / 1000);
      lastT = now;

      const hasCursor = updateCursorLocal();
      if (hasCursor && vPrev.x > 100) vPrev.copy(vLocal);
      if (hasCursor) {
        vCurr.copy(vLocal);
        const dx = vCurr.x - vPrev.x;
        const dy = vCurr.y - vPrev.y;
        const dz = vCurr.z - vPrev.z;
        const dist = Math.hypot(dx, dy, dz);
        if (dist > 0.02) {
          const steps = Math.max(1, Math.min(14, Math.floor(dist * 10)));
          const hueBase = (now * 0.00008) % 1;
          const inv = 1 / (dist + 1e-6);
          const dirX = dx * inv;
          const dirY = dy * inv;
          const dirZ = dz * inv;
          const sp = 3.0 * dist + 0.45;

          for (let s = 0; s < steps; s++) {
            const t = steps === 1 ? 1 : s / (steps - 1);
            const px = vPrev.x + dx * t;
            const py = vPrev.y + dy * t;
            const pz = vPrev.z + dz * t + (Math.random() - 0.5) * 0.6;
            const hue = (hueBase + s * 0.045) % 1;
            spawn(px, py, pz, dirX, dirY, dirZ, sp, hue, 0);
          }
        }
        vPrev.copy(vCurr);
      }

      const decayTrail = 0.34;
      const decayScatter = 0.36;
      const damping = Math.pow(0.88, dt * 60);

      let activeCount = 0;
      for (let i = 0; i < POOL; i++) {
        let life = lifes[i];
        if (life <= 0) {
          alphas[i] = 0;
          continue;
        }

        life = Math.max(0, life - dt * (kinds[i] === 1 ? decayScatter : decayTrail));
        lifes[i] = life;

        if (life > 0.03) {
          active[activeCount] = i;
          activeCount++;
        }

        const age = ttls[i] - life;
        const i3 = i * 3;
        if (kinds[i] === 0) {
          const hold = 0.22;
          const expandDur = 0.65;
          const t0 = Math.min(1, Math.max(0, (age - hold) / expandDur));
          const ease = 1 - Math.pow(1 - t0, 3);
          const maxR = 2.6 + 3.4 * expandScales[i];
          const radius = maxR * ease;
          const tx = origins[i3] + expands[i3] * radius;
          const ty = origins[i3 + 1] + expands[i3 + 1] * radius;
          const tz = origins[i3 + 2] + expands[i3 + 2] * radius;
          const stick = 0.05 + 0.08 * ease;
          positions[i3] += (tx - positions[i3]) * stick;
          positions[i3 + 1] += (ty - positions[i3 + 1]) * stick;
          positions[i3 + 2] += (tz - positions[i3 + 2]) * stick;

          const preWin = 0.18;
          const pre = Math.min(1, Math.max(0, (age - (splitAts[i] - preWin)) / preWin));
          if (pre > 0) {
            const kick = pre * pre * dt * (2.2 + 2.6 * expandScales[i]);
            velocities[i3] += twists[i3] * kick;
            velocities[i3 + 1] += twists[i3 + 1] * kick;
            velocities[i3 + 2] += twists[i3 + 2] * kick;
          }

          if (age >= splitAts[i]) {
            kinds[i] = 1;
            const burst = 4.4 + Math.random() * 3.4;
            velocities[i3] += expands[i3] * burst + twists[i3] * (burst * 0.55);
            velocities[i3 + 1] += expands[i3 + 1] * burst + twists[i3 + 1] * (burst * 0.55);
            velocities[i3 + 2] += expands[i3 + 2] * burst + twists[i3 + 2] * (burst * 0.55);
            sizes[i] = 2.0 + Math.random() * 1.8;
            lifes[i] = Math.max(life, 0.9);
          }
        }

        const a = Math.min(1, life) * Math.min(1, life);
        alphas[i] = a;
        sizes[i] = (kinds[i] === 1 ? 4 : 5) + a * (kinds[i] === 1 ? 10 : 14);

        hues[i] = (hues[i] + dt * 0.18) % 1;
        const [r, g, b] = hslToRgb(hues[i], 0.95, 0.62);
        colors[i3] = r * (0.25 + 0.75 * a);
        colors[i3 + 1] = g * (0.25 + 0.75 * a);
        colors[i3 + 2] = b * (0.25 + 0.75 * a);

        let vx = velocities[i3] * damping;
        let vy = velocities[i3 + 1] * damping;
        let vz = velocities[i3 + 2] * damping;

        const n = now * 0.001;
        const wobble = kinds[i] === 1 ? 0.0019 : 0.0011;
        vx += Math.sin(n * 1.3 + i * 0.13) * wobble;
        vy += Math.cos(n * 1.2 + i * 0.17) * wobble;
        vz += Math.sin(n * 1.1 + i * 0.11) * wobble;

        velocities[i3] = vx;
        velocities[i3 + 1] = vy;
        velocities[i3 + 2] = vz;

        positions[i3] += vx * dt * 9;
        positions[i3 + 1] += vy * dt * 9;
        positions[i3 + 2] += vz * dt * 9;
      }

      pointsGeo.attributes.position.needsUpdate = true;
      pointsGeo.attributes.aColor.needsUpdate = true;
      pointsGeo.attributes.aAlpha.needsUpdate = true;
      pointsGeo.attributes.aSize.needsUpdate = true;

      group.rotation.y += 0.00055;
      group.rotation.x += 0.00022;

      lineAcc += dt;
      if (lineAcc >= 1 / 40) {
        lineAcc = 0;
        rebuildLinks(activeCount);
      }

      renderer.render(scene, camera);
    };

    const init = async () => {
      try {
        THREE = await import('three');
      } catch {
        THREE = await import('https://esm.sh/three@0.161.0');
      }

      if (destroyed) return;
      const mount = mountRef.current;
      if (!mount) return;
      mountEl = mount;

      scene = new THREE.Scene();
      scene.background = null;

      camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 28;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      mount.appendChild(renderer.domElement);

      vCam = new THREE.Vector3();
      vWorld = new THREE.Vector3();
      vDir = new THREE.Vector3();
      vLocal = new THREE.Vector3();
      vPrev = new THREE.Vector3(999, 999, 0);
      vCurr = new THREE.Vector3();

      group = new THREE.Group();
      scene.add(group);

      pointsGeo = new THREE.BufferGeometry();
      pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pointsGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
      pointsGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      pointsGeo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

      pointsMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: `
          attribute vec3 aColor;
          attribute float aSize;
          attribute float aAlpha;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vColor = aColor;
            vAlpha = aAlpha;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float s = aSize * (35.0 / max(1.0, -mvPosition.z));
            gl_PointSize = clamp(s, 1.0, 8.0);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vec2 uv = gl_PointCoord.xy - vec2(0.5);
            float d = length(uv);
            float m = smoothstep(0.5, 0.0, d);
            float a = vAlpha * m;
            gl_FragColor = vec4(vColor, a);
          }
        `,
      });

      points = new THREE.Points(pointsGeo, pointsMat);
      group.add(points);

      linesGeo = new THREE.BufferGeometry();
      linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      linesGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
      linesGeo.setDrawRange(0, 0);

      linesMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      lines = new THREE.LineSegments(linesGeo, linesMat);
      group.add(lines);

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      const onMove = (e) => {
        cursor.active = true;
        cursor.x = (e.clientX / window.innerWidth) * 2 - 1;
        cursor.y = -(e.clientY / window.innerHeight) * 2 + 1;
        if (vPrev.x > 100) {
          if (updateCursorLocal()) vPrev.copy(vLocal);
        }
      };

      const onLeave = () => {
        cursor.active = false;
        vPrev.set(999, 999, 0);
      };

      const onKey = (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') finish();
      };

      window.addEventListener('resize', onResize);
      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('mouseleave', onLeave);
      window.addEventListener('keydown', onKey);
      window.addEventListener('dblclick', finish);

      animate();

      return () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseleave', onLeave);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('dblclick', finish);
      };
    };

    let detach = () => {};
    init().then((fn) => {
      if (typeof fn === 'function') detach = fn;
    });

    return () => {
      destroyed = true;
      detach();
      if (raf) cancelAnimationFrame(raf);
      if (mountEl && renderer?.domElement && mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
      pointsGeo?.dispose?.();
      linesGeo?.dispose?.();
      pointsMat?.dispose?.();
      linesMat?.dispose?.();
      renderer?.dispose?.();
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[70] bg-transparent" onClick={onFinish}>
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  );
};

export default PreIntroCosmos;
