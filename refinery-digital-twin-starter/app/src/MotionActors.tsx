import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Asset } from './data/loader';
import { useLook } from './looks/LookProvider';
import { motionTime, useMotion } from './motionState';
import { circuitLength, daylight, roadPose } from './motionMath';
import config from '../../data/presentation/motion.json';

function painted(geometry: THREE.BufferGeometry, color: string) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry.clone(); geometry.dispose();
  g.deleteAttribute('uv'); const rgb = new THREE.Color(color), colors = new Float32Array(g.getAttribute('position').count * 3);
  for (let i = 0; i < colors.length; i += 3) rgb.toArray(colors, i);
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3)); return g;
}
function vehicleGeometry(spec: typeof config.vehicles[number]) {
  const pieces: THREE.BufferGeometry[] = [];
  const box = (s: number[], p: number[], c: string) => pieces.push(painted(new THREE.BoxGeometry(...s as [number, number, number]).translate(...p as [number, number, number]), c));
  const tanker = spec.kind === 'tanker', { length, width } = spec;
  box([length, .4, width], [0, .65, 0], '#30383b');
  box([1.8, 1.4, width * .92], [length / 2 - 1, 1.5, 0], tanker ? '#cfaa62' : '#d7d9cd');
  box([.03, .55, width * .8], [length / 2 - .08, 1.78, 0], '#18383f');
  for (const side of [-1, 1]) box([1.15, .55, .03], [length / 2 - 1, 1.78, side * width * .466], '#18383f');
  if (tanker) {
    const tank = new THREE.CylinderGeometry(1.05, 1.05, 5.5, 24).rotateZ(Math.PI / 2).translate(-1, 1.7, 0);
    pieces.push(painted(tank, '#c5cbc9'));
    for (const x of [-3, 1]) pieces.push(painted(new THREE.TorusGeometry(1.06, .05, 6, 24).rotateY(Math.PI / 2).translate(x, 1.7, 0), '#606c70'));
  } else {
    box([2.8, .15, width], [-1.1, 1, 0], '#858e8b');
    for (const side of [-1, 1]) box([2.8, .55, .12], [-1.1, 1.25, side * (width / 2 - .06)], '#d7d9cd');
    box([.12, .55, width], [-length / 2 + .06, 1.25, 0], '#d7d9cd');
  }
  for (const x of tanker ? [-3, -1.8, 3] : [-1.8, 1.8]) for (const side of [-1, 1]) {
    pieces.push(painted(new THREE.CylinderGeometry(.47, .47, .24, 12).rotateX(Math.PI / 2).translate(x, .47, side * (width / 2 - .12)), '#182025'));
  }
  const result = mergeGeometries(pieces)!; pieces.forEach(p => p.dispose()); return result;
}
/** Original procedural presentation actors; none have asset identities or raycasts. */
export function MotionActors({ assets }: { assets: Asset[] }) {
  const { look } = useLook(), { hour } = useMotion();
  const scene = useThree(s => s.scene);
  const enabled = look.id !== 'engineering';
  const resources = useMemo(() => {
    const group = new THREE.Group(); group.name = 'presentation-motion';
    const vehicles = config.vehicles.map(spec => {
      const mesh = new THREE.InstancedMesh(vehicleGeometry(spec), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .65, metalness: .2 }), 1);
      mesh.name = `moving-${spec.kind}`; mesh.frustumCulled = false; mesh.castShadow = true; group.add(mesh); return { mesh, spec };
    });
    const centers: { position: THREE.Vector3; radius: number }[] = [];
    for (const asset of assets.filter(a => config.fans.types.includes(a.type))) {
      const d = asset.dimensions, tower = asset.type === 'cooling_tower', count = tower ? 2 : Math.max(1, Math.round(d.length / Math.max(d.width, 1)));
      for (let i = 0; i < count; i++) {
        const position = new THREE.Vector3(-d.length / 2 + (i + .5) * d.length / count, d.height + (tower ? 1.04 : -.59), 0);
        position.applyEuler(new THREE.Euler(-asset.rotation.x, asset.rotation.z, -asset.rotation.y)).add(new THREE.Vector3(asset.position.x, asset.position.z, -asset.position.y));
        centers.push({ position, radius: tower ? d.width / 3 * .9 : Math.min(d.width, d.length / count) * .4 });
      }
    }
    const discs = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#111d22', roughness: .95 }), centers.length);
    const parts = [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].map(a => new THREE.BoxGeometry(1.8, .04, .14).rotateY(a));
    const rotorGeometry = mergeGeometries(parts)!; parts.forEach(p => p.dispose());
    const rotors = new THREE.InstancedMesh(rotorGeometry, new THREE.MeshStandardMaterial({ color: '#8c9b9c', metalness: .4, roughness: .6 }), centers.length);
    discs.name = 'fan-insets'; rotors.name = 'rotating-fans'; rotors.frustumCulled = false;
    const pose = new THREE.Object3D();
    centers.forEach((c, i) => { pose.position.copy(c.position); pose.position.y -= .06; pose.scale.set(c.radius, 1, c.radius); pose.updateMatrix(); discs.setMatrixAt(i, pose.matrix); });
    discs.computeBoundingSphere(); group.add(discs, rotors);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.065, .1, config.flag.mastHeight, 8), new THREE.MeshStandardMaterial({ color: '#9da9ab', metalness: .6, roughness: .45 }));
    mast.position.set(config.flag.position[0], config.flag.mastHeight / 2, config.flag.position[2]); group.add(mast);
    const flagGeometry = new THREE.PlaneGeometry(config.flag.width, config.flag.height, 18, 8); flagGeometry.translate(config.flag.width / 2, 0, 0);
    const flag = new THREE.Mesh(flagGeometry, new THREE.MeshStandardMaterial({ color: '#217d90', side: THREE.DoubleSide, roughness: .8 }));
    flag.position.copy(mast.position).setY(config.flag.mastHeight - config.flag.height / 2); flag.name = 'gate-flag'; group.add(flag);
    const dust = new THREE.InstancedMesh(new THREE.PlaneGeometry(config.dust.widthMetres, config.dust.heightMetres), new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
      uniforms: { opacity: { value: config.dust.opacity } },
      vertexShader: 'varying vec2 p;void main(){p=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec2 p;uniform float opacity;void main(){float a=pow(max(0.,1.-dot(p,p)),3.)*opacity;gl_FragColor=vec4(.64,.53,.39,a);}',
    }), config.dust.count); dust.name = 'day-dust'; dust.frustumCulled = false; group.add(dust);
    group.traverse(node => { node.raycast = () => undefined; node.userData.category = 'helpers'; });
    return { group, vehicles, discs, rotors, centers, flag, dust, pose };
  }, [assets]);
  useEffect(() => { resources.group.visible = enabled; resources.dust.material.uniforms.opacity.value = config.dust.opacity * daylight(hour).day; }, [resources, enabled, hour]);
  useFrame(({ camera }) => {
    if (!enabled) return;
    const time = motionTime(), pose = resources.pose;
    for (const { mesh, spec } of resources.vehicles) {
      const p = roadPose(time * config.road.speedMetresPerSecond + circuitLength * spec.phase);
      pose.position.set(p.x, -.349, p.z); pose.rotation.set(0, p.heading, 0); pose.scale.setScalar(1); pose.updateMatrix(); mesh.setMatrixAt(0, pose.matrix); mesh.instanceMatrix.needsUpdate = true;
    }
    resources.centers.forEach((c, i) => { pose.position.copy(c.position); pose.rotation.set(0, time * config.fans.radiansPerSecond + i, 0); pose.scale.set(c.radius, 1, c.radius); pose.updateMatrix(); resources.rotors.setMatrixAt(i, pose.matrix); }); resources.rotors.instanceMatrix.needsUpdate = true;
    const vertices = resources.flag.geometry.getAttribute('position');
    for (let i = 0; i < vertices.count; i++) { const x = vertices.getX(i); vertices.setZ(i, Math.sin(x * 2.4 - time * 2 + vertices.getY(i)) * .2 * x / config.flag.width); }
    vertices.needsUpdate = true; resources.flag.geometry.computeVertexNormals();
    for (let i = 0; i < config.dust.count; i++) {
      pose.position.set(-10 + ((i * 23 + time * .6) % 260), .6 + (i % 3) * .3, -120 + (i * 47) % 150);
      pose.quaternion.copy(camera.quaternion); pose.scale.setScalar(1); pose.updateMatrix(); resources.dust.setMatrixAt(i, pose.matrix);
    } resources.dust.instanceMatrix.needsUpdate = true;
  });
  useEffect(() => {
    if (new URLSearchParams(location.search).get('measure') !== '1') return;
    const target = window as unknown as Record<string, unknown>;
    target.__refineryMotionActors = () => {
      const atmosphere = scene.getObjectByName('plant-atmosphere');
      const flows: number[][] = [];
      scene.traverseVisible(node => { if (node.name === 'travelling-flow-pulses' && node instanceof THREE.InstancedMesh) flows.push(Array.from(node.instanceMatrix.array)); });
      return { visible: resources.group.visible, vehicles: resources.vehicles.map(v => Array.from(v.mesh.instanceMatrix.array)), fans: Array.from(resources.rotors.instanceMatrix.array), flag: Array.from(resources.flag.geometry.getAttribute('position').array), dust: Array.from(resources.dust.instanceMatrix.array),
        aviation: scene.getObjectByName('aviation-warning-lights')?.visible,
        steam: atmosphere?.children.filter(n => n instanceof THREE.Sprite).map(n => n.position.toArray()), flows };
    };
    return () => { delete target.__refineryMotionActors; };
  }, [resources, scene]);
  useEffect(() => () => { resources.group.traverse(node => { if (node instanceof THREE.Mesh) { node.geometry.dispose(); (node.material as THREE.Material).dispose(); if (node instanceof THREE.InstancedMesh) node.dispose(); } }); }, [resources]);
  return <primitive object={resources.group} />;
}
