import React, { useEffect, useRef } from 'react';

const Background = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let destroyed = false;
    let cleanup = () => {};

    (async () => {
      const mount = mountRef.current;
      if (!mount || destroyed) return;

      let useWebGPU = false;
      let THREE;
      try {
        const webgpuModule = await import('three/webgpu');
        const capModule = await import('three/addons/capabilities/WebGPU.js');
        THREE = webgpuModule;
        useWebGPU = Boolean(capModule?.default?.isAvailable?.());
      } catch {
        useWebGPU = false;
      }

      if (!useWebGPU) {
        try {
          const Three = await import('three');

          const POOL = 1400;
          const LINK_DISTANCE = 1.4;
          const LINK_DISTANCE2 = LINK_DISTANCE * LINK_DISTANCE;
          const MAX_SEGMENTS = POOL * 2;
          const bounds = 10;

          const scene = new Three.Scene();
          const camera = new Three.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
          camera.position.set(0, 0, 14);

          const renderer = new Three.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
          renderer.setClearColor(0x000000, 0);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.setSize(window.innerWidth, window.innerHeight);
          renderer.domElement.style.width = '100%';
          renderer.domElement.style.height = '100%';
          renderer.domElement.style.display = 'block';
          mount.appendChild(renderer.domElement);

          const group = new Three.Group();
          scene.add(group);

          const positions = new Float32Array(POOL * 3);
          const velocities = new Float32Array(POOL * 3);
          const lifes = new Float32Array(POOL);
          const hues = new Float32Array(POOL);
          const colors = new Float32Array(POOL * 3);

          const linePositions = new Float32Array(MAX_SEGMENTS * 2 * 3);
          const lineColors = new Float32Array(MAX_SEGMENTS * 2 * 3);

          const ptsGeo = new Three.BufferGeometry();
          ptsGeo.setAttribute('position', new Three.BufferAttribute(positions, 3));
          ptsGeo.setAttribute('color', new Three.BufferAttribute(colors, 3));

          const ptsMat = new Three.PointsMaterial({
            size: 0.06,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            vertexColors: true,
            blending: Three.AdditiveBlending,
          });

          const pts = new Three.Points(ptsGeo, ptsMat);
          group.add(pts);

          const lnGeo = new Three.BufferGeometry();
          lnGeo.setAttribute('position', new Three.BufferAttribute(linePositions, 3));
          lnGeo.setAttribute('color', new Three.BufferAttribute(lineColors, 3));
          lnGeo.setDrawRange(0, 0);

          const lnMat = new Three.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.28,
            depthWrite: false,
            blending: Three.AdditiveBlending,
          });

          const ln = new Three.LineSegments(lnGeo, lnMat);
          group.add(ln);

          const screenPointer = new Three.Vector2();
          const scenePointer = new Three.Vector3();
          const raycastPlane = new Three.Plane(new Three.Vector3(0, 0, 1), 0);
          const raycaster = new Three.Raycaster();

          const cells = new Map();
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

          let head = 0;
          let last = performance.now();
          let rot = 0;

          for (let i = 0; i < POOL; i++) {
            const i3 = i * 3;
            positions[i3] = 10000;
            positions[i3 + 1] = 10000;
            positions[i3 + 2] = 10000;
            velocities[i3] = 0;
            velocities[i3 + 1] = 0;
            velocities[i3 + 2] = 0;
            lifes[i] = 0;
            hues[i] = Math.random();
            colors[i3] = 0;
            colors[i3 + 1] = 0;
            colors[i3 + 2] = 0;
          }

          const spawn = (x, y, z, dx, dy, dz) => {
            const i = head;
            head = (head + 1) % POOL;
            const i3 = i * 3;

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

            const speed = 3.8;
            const jitter = 0.35;
            velocities[i3] = dx * speed + (Math.random() - 0.5) * jitter;
            velocities[i3 + 1] = dy * speed + (Math.random() - 0.5) * jitter;
            velocities[i3 + 2] = dz * speed + (Math.random() - 0.5) * jitter;

            lifes[i] = 1;
            hues[i] = (hues[i] + 0.08 + Math.random() * 0.1) % 1;
          };

          const updatePointer = () => {
            raycaster.setFromCamera(screenPointer, camera);
            raycaster.ray.intersectPlane(raycastPlane, scenePointer);
          };

          const onPointerMove = (e) => {
            screenPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            screenPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
          };

          const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          };

          window.addEventListener('pointermove', onPointerMove, { passive: true });
          window.addEventListener('resize', onResize);

          const animate = () => {
            const now = performance.now();
            const dt = Math.min(0.033, (now - last) / 1000);
            last = now;

            rot += dt * 0.12;
            camera.position.set(Math.sin(rot) * 12, Math.cos(rot * 0.6) * 2.0, Math.cos(rot) * 12);
            camera.lookAt(0, 0, 0);
            raycastPlane.normal.set(0, 0, 1).applyEuler(camera.rotation);
            updatePointer();

            const tx = scenePointer.x;
            const ty = scenePointer.y;
            const tz = scenePointer.z;

            const spawns = 10;
            for (let s = 0; s < spawns; s++) {
              const a = (s / spawns) * Math.PI * 2;
              const dx = Math.cos(a);
              const dy = Math.sin(a);
              const dz = (Math.random() - 0.5) * 0.4;
              spawn(tx + (Math.random() - 0.5) * 0.06, ty + (Math.random() - 0.5) * 0.06, tz, dx, dy, dz);
            }

            const damping = Math.pow(0.86, dt * 60);

            cells.clear();
            const invCell = 1 / LINK_DISTANCE;
            const alive = [];

            for (let i = 0; i < POOL; i++) {
              let life = lifes[i];
              if (life <= 0) continue;

              life = Math.max(0, life - dt * 2.0);
              lifes[i] = life;

              const i3 = i * 3;
              hues[i] = (hues[i] + dt * 0.22) % 1;
              const [r, g, b] = hslToRgb(hues[i], 0.95, 0.62);
              const a = Math.pow(life, 1.3);
              colors[i3] = r * (0.15 + 0.85 * a);
              colors[i3 + 1] = g * (0.15 + 0.85 * a);
              colors[i3 + 2] = b * (0.15 + 0.85 * a);

              let vx = velocities[i3] * damping;
              let vy = velocities[i3 + 1] * damping;
              let vz = velocities[i3 + 2] * damping;

              const n = now * 0.001;
              vx += Math.sin(n * 1.7 + i * 0.17) * 0.02 * dt;
              vy += Math.cos(n * 1.5 + i * 0.19) * 0.02 * dt;
              vz += Math.sin(n * 1.3 + i * 0.23) * 0.02 * dt;

              velocities[i3] = vx;
              velocities[i3 + 1] = vy;
              velocities[i3 + 2] = vz;

              positions[i3] += vx * dt;
              positions[i3 + 1] += vy * dt;
              positions[i3 + 2] += vz * dt;

              if (positions[i3] > bounds) positions[i3] = -bounds;
              else if (positions[i3] < -bounds) positions[i3] = bounds;
              if (positions[i3 + 1] > bounds) positions[i3 + 1] = -bounds;
              else if (positions[i3 + 1] < -bounds) positions[i3 + 1] = bounds;
              if (positions[i3 + 2] > bounds) positions[i3 + 2] = -bounds;
              else if (positions[i3 + 2] < -bounds) positions[i3 + 2] = bounds;

              alive.push(i);
              const gx = Math.floor(positions[i3] * invCell);
              const gy = Math.floor(positions[i3 + 1] * invCell);
              const gz = Math.floor(positions[i3 + 2] * invCell);
              const k = keyOf(gx, gy, gz);
              const arr = cells.get(k);
              if (arr) arr.push(i);
              else cells.set(k, [i]);
            }

            ptsGeo.attributes.position.needsUpdate = true;
            ptsGeo.attributes.color.needsUpdate = true;

            let seg = 0;
            const maxNeighbors = 2;

            for (let ai = 0; ai < alive.length; ai++) {
              const i = alive[ai];
              const i3 = i * 3;
              const x = positions[i3];
              const y = positions[i3 + 1];
              const z = positions[i3 + 2];
              const gx = Math.floor(x * invCell);
              const gy = Math.floor(y * invCell);
              const gz = Math.floor(z * invCell);

              let best1 = -1;
              let best2 = -1;
              let d1 = 1e9;
              let d2 = 1e9;

              for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                  for (let dz = -1; dz <= 1; dz++) {
                    const list = cells.get(keyOf(gx + dx, gy + dy, gz + dz));
                    if (!list) continue;
                    for (let k = 0; k < list.length; k++) {
                      const j = list[k];
                      if (j === i) continue;
                      const j3 = j * 3;
                      const dx2 = positions[j3] - x;
                      const dy2 = positions[j3 + 1] - y;
                      const dz2 = positions[j3 + 2] - z;
                      const dd = dx2 * dx2 + dy2 * dy2 + dz2 * dz2;
                      if (dd > LINK_DISTANCE2) continue;
                      if (dd < d1) {
                        d2 = d1;
                        best2 = best1;
                        d1 = dd;
                        best1 = j;
                      } else if (dd < d2) {
                        d2 = dd;
                        best2 = j;
                      }
                    }
                  }
                }
              }

              let added = 0;
              if (best1 >= 0 && seg < MAX_SEGMENTS) {
                const j = best1;
                const j3 = j * 3;
                const o = seg * 6;
                linePositions[o] = x;
                linePositions[o + 1] = y;
                linePositions[o + 2] = z;
                linePositions[o + 3] = positions[j3];
                linePositions[o + 4] = positions[j3 + 1];
                linePositions[o + 5] = positions[j3 + 2];
                const a = Math.min(lifes[i], lifes[j]) * 0.7;
                lineColors[o] = colors[i3] * a;
                lineColors[o + 1] = colors[i3 + 1] * a;
                lineColors[o + 2] = colors[i3 + 2] * a;
                lineColors[o + 3] = colors[j3] * a;
                lineColors[o + 4] = colors[j3 + 1] * a;
                lineColors[o + 5] = colors[j3 + 2] * a;
                seg++;
                added++;
              }

              if (best2 >= 0 && seg < MAX_SEGMENTS && added < maxNeighbors) {
                const j = best2;
                const j3 = j * 3;
                const o = seg * 6;
                linePositions[o] = x;
                linePositions[o + 1] = y;
                linePositions[o + 2] = z;
                linePositions[o + 3] = positions[j3];
                linePositions[o + 4] = positions[j3 + 1];
                linePositions[o + 5] = positions[j3 + 2];
                const a = Math.min(lifes[i], lifes[j]) * 0.7;
                lineColors[o] = colors[i3] * a;
                lineColors[o + 1] = colors[i3 + 1] * a;
                lineColors[o + 2] = colors[i3 + 2] * a;
                lineColors[o + 3] = colors[j3] * a;
                lineColors[o + 4] = colors[j3 + 1] * a;
                lineColors[o + 5] = colors[j3 + 2] * a;
                seg++;
              }
            }

            lnGeo.setDrawRange(0, seg * 2);
            lnGeo.attributes.position.needsUpdate = true;
            lnGeo.attributes.color.needsUpdate = true;

            renderer.render(scene, camera);
          };

          renderer.setAnimationLoop(animate);

          cleanup = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('resize', onResize);
            renderer.setAnimationLoop(null);
            ptsGeo.dispose();
            ptsMat.dispose();
            lnGeo.dispose();
            lnMat.dispose();
            renderer.dispose();
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
          };
        } catch {
          cleanup = () => {};
        }

        return;
      }

      const {
        atan,
        color,
        cos,
        deltaTime,
        float,
        Fn,
        hash,
        hue,
        If,
        instanceIndex,
        Loop,
        max,
        min,
        mix,
        mx_fractal_noise_float,
        mx_fractal_noise_vec3,
        pass,
        pcurve,
        PI,
        sin,
        step,
        storage,
        time,
        TWO_PI,
        uniform,
        uv,
        vec2,
        vec3,
      } = await import('three/tsl');

      const { bloom } = await import('three/addons/tsl/display/BloomNode.js');

      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
      camera.position.set(0, 0, 10);

      const scene = new THREE.Scene();

      const renderer = new THREE.WebGPURenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      mount.appendChild(renderer.domElement);

      await renderer.init();
      if (destroyed) return;

      const screenPointer = new THREE.Vector2();
      const scenePointer = new THREE.Vector3();
      const raycastPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const raycaster = new THREE.Raycaster();

      const nbParticles = Math.pow(2, 13);

      const timeScale = uniform(1.0);
      const particleLifetime = uniform(0.5);
      const particleSize = uniform(1.0);
      const linksWidth = uniform(0.005);

      const colorOffset = uniform(0.0);
      const colorVariance = uniform(2.0);
      const colorRotationSpeed = uniform(1.0);

      const spawnIndex = uniform(0);
      const nbToSpawn = uniform(6);
      const spawnPosition = uniform(vec3(0.0));
      const previousSpawnPosition = uniform(vec3(0.0));

      const turbFrequency = uniform(0.5);
      const turbAmplitude = uniform(0.5);
      const turbOctaves = uniform(2);
      const turbLacunarity = uniform(2.0);
      const turbGain = uniform(0.5);
      const turbFriction = uniform(0.01);

      const getInstanceColor = Fn(([i]) => {
        return hue(color(0x0000ff), colorOffset.add(mx_fractal_noise_float(i.toFloat().mul(0.1), 2, 2.0, 0.5, colorVariance)));
      });

      const particlePositions = storage(new THREE.StorageInstancedBufferAttribute(nbParticles, 4), 'vec4', nbParticles);
      const particleVelocities = storage(new THREE.StorageInstancedBufferAttribute(nbParticles, 4), 'vec4', nbParticles);

      renderer.compute(
        Fn(() => {
          particlePositions.element(instanceIndex).xyz.assign(vec3(10000.0));
          particlePositions.element(instanceIndex).w.assign(vec3(-1.0));
        })().compute(nbParticles),
      );

      const particleGeom = new THREE.PlaneGeometry(0.05, 0.05);

      const particleMaterial = new THREE.SpriteNodeMaterial();
      particleMaterial.blending = THREE.AdditiveBlending;
      particleMaterial.depthWrite = false;
      particleMaterial.positionNode = particlePositions.toAttribute();
      particleMaterial.scaleNode = vec2(particleSize);
      particleMaterial.rotationNode = atan(particleVelocities.toAttribute().y, particleVelocities.toAttribute().x);

      particleMaterial.colorNode = Fn(() => {
        const life = particlePositions.toAttribute().w;
        const modLife = pcurve(life.oneMinus(), 8.0, 1.0);
        const pulse = pcurve(sin(hash(instanceIndex).mul(TWO_PI).add(time.mul(0.5).mul(TWO_PI))).mul(0.5).add(0.5), 0.25, 0.25)
          .mul(10.0)
          .add(1.0);

        return getInstanceColor(instanceIndex).mul(pulse.mul(modLife));
      })();

      particleMaterial.opacityNode = Fn(() => {
        const circle = step(uv().xy.sub(0.5).length(), 0.5);
        const life = particlePositions.toAttribute().w;
        return circle.mul(life);
      })();

      const particleMesh = new THREE.InstancedMesh(particleGeom, particleMaterial, nbParticles);
      particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      particleMesh.frustumCulled = false;
      scene.add(particleMesh);

      const linksIndices = [];
      for (let i = 0; i < nbParticles; i++) {
        const baseIndex = i * 8;
        for (let j = 0; j < 2; j++) {
          const offset = baseIndex + j * 4;
          linksIndices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
        }
      }

      const nbVertices = nbParticles * 8;
      const linksVerticesSBA = new THREE.StorageBufferAttribute(nbVertices, 4);
      const linksColorsSBA = new THREE.StorageBufferAttribute(nbVertices, 4);

      const linksGeom = new THREE.BufferGeometry();
      linksGeom.setAttribute('position', linksVerticesSBA);
      linksGeom.setAttribute('color', linksColorsSBA);
      linksGeom.setIndex(linksIndices);

      const linksMaterial = new THREE.MeshBasicNodeMaterial();
      linksMaterial.vertexColors = true;
      linksMaterial.side = THREE.DoubleSide;
      linksMaterial.transparent = true;
      linksMaterial.depthWrite = false;
      linksMaterial.depthTest = false;
      linksMaterial.blending = THREE.AdditiveBlending;
      linksMaterial.opacityNode = storage(linksColorsSBA, 'vec4', linksColorsSBA.count).toAttribute().w;

      const linksMesh = new THREE.Mesh(linksGeom, linksMaterial);
      linksMesh.frustumCulled = false;
      scene.add(linksMesh);

      const updateParticles = Fn(() => {
        const position = particlePositions.element(instanceIndex).xyz;
        const life = particlePositions.element(instanceIndex).w;
        const velocity = particleVelocities.element(instanceIndex).xyz;
        const dt = deltaTime.mul(0.1).mul(timeScale);

        If(life.greaterThan(0.0), () => {
          const localVel = mx_fractal_noise_vec3(position.mul(turbFrequency), turbOctaves, turbLacunarity, turbGain, turbAmplitude).mul(
            life.add(0.01),
          );
          velocity.addAssign(localVel);
          velocity.mulAssign(turbFriction.oneMinus());
          position.addAssign(velocity.mul(dt));

          life.subAssign(dt.mul(particleLifetime.reciprocal()));

          const closestDist1 = float(10000.0).toVar();
          const closestPos1 = vec3(0.0).toVar();
          const closestLife1 = float(0.0).toVar();
          const closestDist2 = float(10000.0).toVar();
          const closestPos2 = vec3(0.0).toVar();
          const closestLife2 = float(0.0).toVar();

          Loop(nbParticles, ({ i }) => {
            const otherPart = particlePositions.element(i);
            If(i.notEqual(instanceIndex).and(otherPart.w.greaterThan(0.0)), () => {
              const otherPosition = otherPart.xyz;
              const dist = position.sub(otherPosition).lengthSq();
              const moreThanZero = dist.greaterThan(0.0);

              If(dist.lessThan(closestDist1).and(moreThanZero), () => {
                closestDist1.assign(dist);
                closestPos1.assign(otherPosition.xyz);
                closestLife1.assign(otherPart.w);
              }).ElseIf(dist.lessThan(closestDist2).and(moreThanZero), () => {
                closestDist2.assign(dist);
                closestPos2.assign(otherPosition.xyz);
                closestLife2.assign(otherPart.w);
              });
            });
          });

          const linksPositions = storage(linksVerticesSBA, 'vec4', linksVerticesSBA.count);
          const linksColors = storage(linksColorsSBA, 'vec4', linksColorsSBA.count);
          const firstLinkIndex = instanceIndex.mul(8);
          const secondLinkIndex = firstLinkIndex.add(4);

          linksPositions.element(firstLinkIndex).xyz.assign(position);
          linksPositions.element(firstLinkIndex).y.addAssign(linksWidth);
          linksPositions.element(firstLinkIndex.add(1)).xyz.assign(position);
          linksPositions.element(firstLinkIndex.add(1)).y.addAssign(linksWidth.negate());
          linksPositions.element(firstLinkIndex.add(2)).xyz.assign(closestPos1);
          linksPositions.element(firstLinkIndex.add(2)).y.addAssign(linksWidth.negate());
          linksPositions.element(firstLinkIndex.add(3)).xyz.assign(closestPos1);
          linksPositions.element(firstLinkIndex.add(3)).y.addAssign(linksWidth);

          linksPositions.element(secondLinkIndex).xyz.assign(position);
          linksPositions.element(secondLinkIndex).y.addAssign(linksWidth);
          linksPositions.element(secondLinkIndex.add(1)).xyz.assign(position);
          linksPositions.element(secondLinkIndex.add(1)).y.addAssign(linksWidth.negate());
          linksPositions.element(secondLinkIndex.add(2)).xyz.assign(closestPos2);
          linksPositions.element(secondLinkIndex.add(2)).y.addAssign(linksWidth.negate());
          linksPositions.element(secondLinkIndex.add(3)).xyz.assign(closestPos2);
          linksPositions.element(secondLinkIndex.add(3)).y.addAssign(linksWidth);

          const linkColor = getInstanceColor(instanceIndex);
          const l1 = max(0.0, min(closestLife1, life)).pow(0.8);
          const l2 = max(0.0, min(closestLife2, life)).pow(0.8);

          Loop(4, ({ i }) => {
            linksColors.element(firstLinkIndex.add(i)).xyz.assign(linkColor);
            linksColors.element(firstLinkIndex.add(i)).w.assign(l1);
            linksColors.element(secondLinkIndex.add(i)).xyz.assign(linkColor);
            linksColors.element(secondLinkIndex.add(i)).w.assign(l2);
          });
        });
      })()
        .compute(nbParticles)
        .setName('Update Particles');

      const spawnParticles = Fn(() => {
        const particleIndex = spawnIndex.add(instanceIndex).mod(nbParticles).toInt();
        const position = particlePositions.element(particleIndex).xyz;
        const life = particlePositions.element(particleIndex).w;
        const velocity = particleVelocities.element(particleIndex).xyz;

        life.assign(1.0);

        const rRange = float(0.01);
        const rTheta = hash(particleIndex).mul(TWO_PI);
        const rPhi = hash(particleIndex.add(1)).mul(PI);
        const rx = sin(rTheta).mul(cos(rPhi));
        const ry = sin(rTheta).mul(sin(rPhi));
        const rz = cos(rTheta);
        const rDir = vec3(rx, ry, rz);

        const pos = mix(previousSpawnPosition, spawnPosition, instanceIndex.toFloat().div(nbToSpawn.sub(1).toFloat()).clamp());
        position.assign(pos.add(rDir.mul(rRange)));

        velocity.assign(rDir.mul(5.0));
      })()
        .compute(nbToSpawn.value)
        .setName('Spawn Particles');

      const renderPipeline = new THREE.RenderPipeline(renderer);
      const scenePass = pass(scene, camera);
      const scenePassColor = scenePass.getTextureNode('output');
      const bloomPass = bloom(scenePassColor, 0.75, 0.1, 0.5);
      renderPipeline.outputNode = scenePassColor.add(bloomPass);

      let last = performance.now();
      let rot = 0;

      const updatePointer = () => {
        raycaster.setFromCamera(screenPointer, camera);
        raycaster.ray.intersectPlane(raycastPlane, scenePointer);
      };

      const onPointerMove = (e) => {
        screenPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        screenPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      };

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('resize', onResize);

      renderer.setAnimationLoop(() => {
        const now = performance.now();
        const dt = Math.min(0.033, (now - last) / 1000);
        last = now;

        rot += dt * 0.12;
        camera.position.set(Math.sin(rot) * 10, Math.cos(rot * 0.6) * 1.5, Math.cos(rot) * 10);
        camera.lookAt(0, 0, 0);

        raycastPlane.normal.set(0, 0, 1).applyEuler(camera.rotation);
        updatePointer();

        previousSpawnPosition.value.copy(spawnPosition.value);
        spawnPosition.value.lerp(scenePointer, 0.1);

        renderer.compute(updateParticles);
        renderer.compute(spawnParticles);
        spawnIndex.value = (spawnIndex.value + nbToSpawn.value) % nbParticles;

        colorOffset.value += dt * colorRotationSpeed.value * timeScale.value;

        renderPipeline.render();
      });

      cleanup = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', onResize);
        renderer.setAnimationLoop(null);
        particleGeom.dispose();
        particleMaterial.dispose();
        linksGeom.dispose();
        linksMaterial.dispose();
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    })();

    return () => {
      destroyed = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />
  );
};

export default Background;
