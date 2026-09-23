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
      shader.fragmentShader = `varying vec3 terrainPosition;\n${shader.fragmentShader}`.replace('#include <map_fragment>', `#include <map_fragment>
        vec2 detailUv = mat2(.8, -.6, .6, .8) * vMapUv * .73 + vec2(.27, .61);
        vec2 thirdUv = mat2(.28, .96, -.96, .28) * vMapUv * 1.37 + vec2(.63, .19);
        vec3 broadDetail = texture2D(map, detailUv).rgb;
        vec3 thirdDetail = texture2D(map, thirdUv).rgb;
        float blendDetail = .5 + .25 * sin(terrainPosition.x * .038 + sin(terrainPosition.z * .026));
        diffuseColor.rgb = diffuse * mix(mix(sampledDiffuseColor.rgb, broadDetail, blendDetail), thirdDetail, .34);
        float broadVariation = sin(terrainPosition.x * .011 + terrainPosition.z * .009) * sin(terrainPosition.z * .019 - terrainPosition.x * .006);
        diffuseColor.rgb *= 1.0 + broadVariation * .12;`);
    };
    material.customProgramCacheKey = () => 'desert-dual-scale-v1';
    return { terrain, mountains, mountainMaterial, material, context: contextGroup(gltf.scene) };
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
  useEffect(() => () => { resources.terrain.dispose(); resources.mountains.dispose(); resources.mountainMaterial.dispose(); resources.material.dispose(); resources.context.children.forEach(node => (node as THREE.Mesh).geometry.dispose()); }, [resources]);
  return <group visible={enabled} name="photoreal-environment" dispose={null}>
    <mesh geometry={resources.terrain} material={resources.material} receiveShadow userData={{ category: 'ground' }} />
    <mesh geometry={resources.mountains} material={resources.mountainMaterial} userData={{ category: 'ground' }} />
    <primitive object={resources.context} />
  </group>;
}
export function PhotorealEnvironment({ assets }: { assets: Asset[] }) {
  const { look } = useLook();
  const enabled = look.id === 'photoreal';
  const [visited, setVisited] = useState(enabled);
  useEffect(() => { if (enabled) setVisited(true); }, [enabled]);
  return visited ? <Suspense fallback={<LoadingEnvironment />}><LoadedEnvironment assets={assets} enabled={enabled} /></Suspense> : null;
}
