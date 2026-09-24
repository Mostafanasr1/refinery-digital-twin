import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { useLook } from './looks/LookProvider';
import { looks, type DesertEnvironment } from './looks/looks';
import type { Asset } from './data/loader';

function LoadingEnvironment() {
  const gl = useThree(state => state.gl);
  const { setEnvironmentLoading } = useLook();
  useEffect(() => { gl.domElement.dataset.environmentReady = 'false'; setEnvironmentLoading(true); return () => setEnvironmentLoading(false); }, [gl, setEnvironmentLoading]);
  return null;
}
function terrainGeometry(assets: Asset[], config: DesertEnvironment) {
  const xs = assets.map(asset => asset.position.x), zs = assets.map(asset => -asset.position.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  const halfWidth = (Math.max(...xs) - Math.min(...xs)) / 2 + 30, halfDepth = (Math.max(...zs) - Math.min(...zs)) / 2 + 30;
  const geometry = new THREE.PlaneGeometry(config.terrain.size, config.terrain.size, config.terrain.segments, config.terrain.segments);
  geometry.rotateX(-Math.PI / 2); geometry.translate(cx, -.55, cz);
  const positions = geometry.getAttribute('position');
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), z = positions.getZ(i);
    const distance = Math.max(Math.abs(x - cx) - halfWidth, Math.abs(z - cz) - halfDepth, 0);
    const ramp = THREE.MathUtils.smoothstep(distance, 0, 180);
    const undulation = Math.sin(x * .014 + z * .008) * .48 + Math.sin(z * .021 - x * .006) * .32 + Math.cos(x * .033 + z * .026) * .2;
    positions.setY(i, -.55 + ramp * config.terrain.height * undulation);
  }
  geometry.computeVertexNormals(); return geometry;
}
/** Deterministic procedural dressing; no downloaded assets or canonical plant objects. */
function desertScatter(terrain: THREE.BufferGeometry, assets: Asset[], config: DesertEnvironment) {
  let seed = 739391;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const positions = terrain.getAttribute('position'), segments = config.terrain.segments;
  const step = config.terrain.size / segments, x0 = positions.getX(0), z0 = positions.getZ(0);
  // Sample the actual two triangles of each terrain grid cell, avoiding floating props.
  const heightAt = (x: number, z: number) => {
    const gx = (x - x0) / step, gz = (z - z0) / step;
    const ix = Math.floor(gx), iz = Math.floor(gz), u = gx - ix, v = gz - iz;
    const a = ix + iz * (segments + 1), b = a + segments + 1, d = a + 1, c = b + 1;
    return u + v <= 1 ? positions.getY(a) * (1 - u - v) + positions.getY(d) * u + positions.getY(b) * v
      : positions.getY(c) * (u + v - 1) + positions.getY(b) * (1 - u) + positions.getY(d) * (1 - v);
  };
  const xs = assets.map(asset => asset.position.x), zs = assets.map(asset => -asset.position.y);
  const minX = Math.min(...xs) - 36, maxX = Math.max(...xs) + 36, minZ = Math.min(...zs) - 36, maxZ = Math.max(...zs) + 36;
  const centerX = (minX + maxX) / 2, centerZ = (minZ + maxZ) / 2;
  const rockGeometry = new THREE.IcosahedronGeometry(1, 0);
  const rockPositions = rockGeometry.getAttribute('position');
  for (let i = 0; i < rockPositions.count; i++) {
    const x = rockPositions.getX(i), y = rockPositions.getY(i), z = rockPositions.getZ(i);
    const uneven = 1 + .18 * Math.sin(x * 8 + z * 5);
    rockPositions.setXYZ(i, x * uneven, y * .55 * uneven + .42, z * uneven);
  }
  rockGeometry.computeVertexNormals();
  const twigs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 11; i++) {
    const angle = i * 2.39996, length = .6 + random() * .5;
    const branch = new THREE.CylinderGeometry(.012, .035, length, 4, 1);
    const direction = new THREE.Vector3(Math.cos(angle) * .65, .65 + random() * .45, Math.sin(angle) * .65).normalize();
    branch.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction));
    branch.translate(direction.x * length / 2, direction.y * length / 2, direction.z * length / 2); twigs.push(branch);
  }
  const scrubGeometry = mergeGeometries(twigs)!; twigs.forEach(geometry => geometry.dispose());
  const group = new THREE.Group(); group.name = 'procedural-desert-dressing';
  const transform = new THREE.Object3D(), tint = new THREE.Color();
  for (const [name, geometry, count, color] of [
    ['rocks', rockGeometry, config.scatter.rocks, config.scatter.rockColor],
    ['dry-scrub', scrubGeometry, config.scatter.scrub, config.scatter.scrubColor],
  ] as const) {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 1 });
    const mesh = new THREE.InstancedMesh(geometry, material, count); mesh.name = name; mesh.userData.category = 'ground'; mesh.receiveShadow = true;
    let placed = 0;
    for (let attempt = 0; placed < count && attempt < count * 100; attempt++) {
      const x = centerX + (random() - .5) * 1400, z = centerZ + (random() - .5) * 1400;
      if (x > minX && x < maxX && z > minZ && z < maxZ) continue;
      const edgeDistance = Math.hypot(Math.max(minX - x, x - maxX, 0), Math.max(minZ - z, z - maxZ, 0));
      if (random() > Math.exp(-edgeDistance / config.scatter.falloff)) continue;
      const alongTrack = Math.max(0, config.track.gate[0] - x);
      const trackZ = config.track.gate[1] + alongTrack * .14 + Math.sin(alongTrack * .003) * 25;
      if (x < config.track.gate[0] && Math.abs(z - trackZ) < config.track.width + 2) continue;
      const scale = name === 'rocks' ? .25 + Math.pow(random(), 3) * 2.2 : .4 + random() * .85;
      transform.position.set(x, heightAt(x, z) - .025, z);
      transform.rotation.set(0, random() * Math.PI * 2, 0); transform.scale.set(scale, scale * (.75 + random() * .5), scale * (.8 + random() * .6)); transform.updateMatrix();
      mesh.setMatrixAt(placed, transform.matrix); tint.setScalar(.65 + random() * .6); mesh.setColorAt(placed, tint); placed++;
    }
    mesh.count = placed; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere(); group.add(mesh);
  }
  return group;
}
function mountainGeometry(config: DesertEnvironment, center: THREE.Vector3) {
  const segments = 320, rings = 19, vertices: number[] = [], indices: number[] = [], colors: number[] = [];
  const earth = new THREE.Color(config.mountains.color);
  for (let ring = 0; ring < rings; ring++) {
    const t = ring / (rings - 1);
    for (let segment = 0; segment <= segments; segment++) {
      const angle = segment / segments * Math.PI * 2;
      const ridge = .63 + .19 * Math.sin(angle * 7 + .9) + .12 * Math.sin(angle * 17 - .6) + .06 * Math.cos(angle * 43);
      const radial = config.mountains.radius + t * 430 + Math.sin(angle * 19 + t * 3) * 22 * Math.sin(t * Math.PI);
      const profile = Math.pow(Math.sin(t * Math.PI), 1.2);
      const folded = 1 + .15 * Math.sin(angle * 83 + t * 9) + .09 * Math.sin(angle * 137 - t * 17);
      const height = -3 + ridge * config.mountains.height * profile * folded;
      vertices.push(center.x + Math.cos(angle) * radial, height, center.z + Math.sin(angle) * radial);
      const strata = .83 + .09 * Math.sin(height * .09 + angle * 13) + .08 * Math.cos(angle * 61 + t * 12);
      colors.push(earth.r * strata, earth.g * strata, earth.b * strata);
    }
  }
  for (let ring = 0; ring < rings - 1; ring++) for (let segment = 0; segment < segments; segment++) {
    const a = ring * (segments + 1) + segment, b = a + segments + 1;
    indices.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}
/** Context meshes are non-selectable and merged by their Blender material. */
function contextGroup(source: THREE.Group) {
  source.updateMatrixWorld(true);
  const groups = new Map<THREE.Material, THREE.BufferGeometry[]>();
  source.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    const sourceGeometry = node.geometry.index ? node.geometry.toNonIndexed() : node.geometry.clone();
    const segments = Array.isArray(node.material) ? node.geometry.groups : [{ start: 0, count: sourceGeometry.getAttribute('position').count, materialIndex: 0 }];
    for (const segment of segments) {
      const material = materials[segment.materialIndex ?? 0], geometry = new THREE.BufferGeometry();
      for (const name of ['position', 'normal', 'uv']) {
        const attribute = sourceGeometry.getAttribute(name);
        if (attribute) geometry.setAttribute(name, new THREE.BufferAttribute(new Float32Array(attribute.array.slice(segment.start * attribute.itemSize, (segment.start + segment.count) * attribute.itemSize)), attribute.itemSize));
      }
      geometry.applyMatrix4(node.matrixWorld);
      const parts = groups.get(material) ?? []; parts.push(geometry); groups.set(material, parts);
    }
    sourceGeometry.dispose();
  });
  const group = new THREE.Group(); group.name = 'photoreal-site-context';
  groups.forEach((parts, material) => { const mesh = new THREE.Mesh(mergeGeometries(parts)!, material); parts.forEach(part => part.dispose()); mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.category = 'ground'; group.add(mesh); });
  return group;
}
function LoadedEnvironment({ assets, enabled }: { assets: Asset[]; enabled: boolean }) {
  const config = looks.photoreal.environment.desert!;
  const { gl, scene, camera, invalidate } = useThree();
  const hdr = useLoader(RGBELoader, `${import.meta.env.BASE_URL}${config.assets.sky}`);
  const textures = useLoader(THREE.TextureLoader, [config.assets.color, config.assets.normal, config.assets.roughness].map(path => `${import.meta.env.BASE_URL}${path}`));
  const gltf = useLoader(GLTFLoader, `${import.meta.env.BASE_URL}${config.assets.context}`, loader => loader.setMeshoptDecoder(MeshoptDecoder));
  const environmentTarget = useRef<THREE.WebGLRenderTarget | null>(null);
  useEffect(() => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    const generator = new THREE.PMREMGenerator(gl), target = generator.fromEquirectangular(hdr); generator.dispose();
    environmentTarget.current = target;
    return () => { environmentTarget.current = null; target.dispose(); };
  }, [gl, hdr]);
  const resources = useMemo(() => {
    textures.forEach(texture => { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.setScalar(config.terrain.size / config.terrain.tileMetres); texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy()); });
    textures[0].colorSpace = THREE.SRGBColorSpace;
    const terrain = terrainGeometry(assets, config);
    terrain.computeBoundingBox(); const center = terrain.boundingBox!.getCenter(new THREE.Vector3());
    const mountains = mountainGeometry(config, center);
    const mountainMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide });
    const material = new THREE.MeshStandardMaterial({ color: config.terrain.color, map: textures[0], normalMap: textures[1], roughnessMap: textures[2], roughness: 1, normalScale: new THREE.Vector2(config.terrain.normalScale, config.terrain.normalScale) });
    material.onBeforeCompile = shader => {
      shader.vertexShader = `varying vec3 terrainPosition;\n${shader.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\nterrainPosition = position;');
      shader.uniforms.sandDarkTint = { value: new THREE.Color(config.terrain.darkTint) };
      shader.uniforms.trackGate = { value: new THREE.Vector2(...config.track.gate) };
      shader.uniforms.trackWidth = { value: config.track.width };
      shader.fragmentShader = `varying vec3 terrainPosition;
        uniform vec3 sandDarkTint;
        uniform vec2 trackGate;
        uniform float trackWidth;
        float desertHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float desertNoise(vec2 p) {
          vec2 cell = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(desertHash(cell), desertHash(cell + vec2(1, 0)), f.x), mix(desertHash(cell + vec2(0, 1)), desertHash(cell + vec2(1, 1)), f.x), f.y);
        }
        ${shader.fragmentShader}`.replace('#include <map_fragment>', `#include <map_fragment>
        vec2 detailUv = mat2(.8, -.6, .6, .8) * vMapUv * .73 + vec2(.27, .61);
        vec2 thirdUv = mat2(.28, .96, -.96, .28) * vMapUv * 1.37 + vec2(.63, .19);
        vec3 broadDetail = texture2D(map, detailUv).rgb;
        vec3 thirdDetail = texture2D(map, thirdUv).rgb;
        float blendDetail = .5 + .25 * sin(terrainPosition.x * .038 + sin(terrainPosition.z * .026));
        diffuseColor.rgb = diffuse * mix(mix(sampledDiffuseColor.rgb, broadDetail, blendDetail), thirdDetail, .34);
        float macro = desertNoise(terrainPosition.xz * .009) * .7 + desertNoise(terrainPosition.xz * .027 + 19.0) * .3;
        float darkPatch = smoothstep(.27, .75, macro);
        diffuseColor.rgb *= mix(vec3(1.1, 1.06, .99), sandDarkTint, darkPatch * .72);
        float alongTrack = max(0.0, trackGate.x - terrainPosition.x);
        float trackCenter = trackGate.y + alongTrack * .14 + sin(alongTrack * .003) * 25.0;
        float trackOffset = abs(terrainPosition.z - trackCenter);
        float edgeNoise = desertNoise(terrainPosition.xz * .16) * .65;
        float track = (1.0 - smoothstep(trackWidth * .5 - .5, trackWidth * .5 + .7, trackOffset + edgeNoise)) * step(terrainPosition.x, trackGate.x);
        float ruts = 1.0 - smoothstep(.18, .46, abs(trackOffset - trackWidth * .27));
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(.75, .71, .63) * (1.0 - ruts * .13), track * .7);`);
    };
    material.customProgramCacheKey = () => 'desert-macro-track-v2';
    return { terrain, mountains, mountainMaterial, material, context: contextGroup(gltf.scene), scatter: desertScatter(terrain, assets, config) };
  }, [assets, config, gl, gltf, hdr, textures]);
  useEffect(() => {
    if (!enabled) return;
    const previousFar = camera.far;
    scene.environment = environmentTarget.current!.texture; scene.environmentIntensity = config.intensity;
    scene.background = hdr; scene.backgroundIntensity = config.backgroundIntensity;
    scene.environmentRotation.set(0, config.rotation, 0); scene.backgroundRotation.set(0, config.rotation, 0);
    scene.fog = new THREE.Fog(config.fog.color, config.fog.near, config.fog.far);
    camera.far = Math.max(previousFar, 6000); camera.updateProjectionMatrix(); gl.domElement.dataset.environmentReady = 'true'; invalidate();
    return () => {
      if (scene.environment === environmentTarget.current?.texture) scene.environment = null;
      if (scene.background === hdr) scene.background = new THREE.Color(looks.engineering.environment.background);
      scene.environmentRotation.set(0, 0, 0); scene.backgroundRotation.set(0, 0, 0); scene.backgroundIntensity = 1;
      scene.fog = null; camera.far = previousFar; camera.updateProjectionMatrix(); invalidate();
    };
  }, [camera, config, enabled, gl, hdr, invalidate, resources, scene]);
  useEffect(() => () => { resources.terrain.dispose(); resources.mountains.dispose(); resources.mountainMaterial.dispose(); resources.material.dispose(); resources.context.children.forEach(node => (node as THREE.Mesh).geometry.dispose()); resources.scatter.children.forEach(node => { const mesh = node as THREE.InstancedMesh; mesh.dispose(); mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); }); }, [resources]);
  return <group visible={enabled} name="photoreal-environment" dispose={null}>
    <mesh geometry={resources.terrain} material={resources.material} receiveShadow userData={{ category: 'ground' }} />
    <mesh geometry={resources.mountains} material={resources.mountainMaterial} userData={{ category: 'ground' }} />
    <primitive object={resources.context} />
    <primitive object={resources.scatter} />
  </group>;
}
export function PhotorealEnvironment({ assets }: { assets: Asset[] }) {
  const { look } = useLook();
  const enabled = look.id === 'photoreal';
  const [visited, setVisited] = useState(enabled);
  useEffect(() => { if (enabled) setVisited(true); }, [enabled]);
  return visited ? <Suspense fallback={<LoadingEnvironment />}><LoadedEnvironment assets={assets} enabled={enabled} /></Suspense> : null;
}
