import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Asset, NormalizedData } from './data/loader';
import config from '../../data/presentation/slice.json';

/** Conservative rotated equipment bounds; decorative skids never become registry assets. */
export function dressingSites(assets: Asset[]) {
  const c = config.dressing;
  const [w, d] = c.moduleSize;
  const sites: { x: number; z: number; kind: number }[] = [];
  for (let z = c.zRange[0]; z <= c.zRange[1]; z += c.spacing[1]) {
    for (let x = c.xRange[0]; x <= c.xRange[1]; x += c.spacing[0]) {
      const clear = assets.every(a => {
        const halfX = Math.max(a.dimensions.length, a.dimensions.diameter) / 2;
        const halfZ = Math.max(a.dimensions.width, a.dimensions.diameter) / 2;
        const cosine = Math.abs(Math.cos(a.rotation.z)), sine = Math.abs(Math.sin(a.rotation.z));
        return Math.abs(x - a.position.x) > halfX * cosine + halfZ * sine + w / 2 + c.clearance ||
          Math.abs(z + a.position.y) > halfX * sine + halfZ * cosine + d / 2 + c.clearance;
      });
      if (clear && sites.length < c.maxModules) sites.push({ x, z, kind: sites.length % 6 });
    }
  }
  return sites;
}

/** Merge procedural static parts into one mesh per material; no pointer targets. */
export function buildSliceDressing(assets: Asset[], connections: NormalizedData['connections'] = []) {
  type Role = keyof typeof config.dressing.palette;
  const parts = new Map<Role, THREE.BufferGeometry[]>();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 12);
  const up = new THREE.Vector3(0, 1, 0);
  const add = (geometry: THREE.BufferGeometry, role: Role, p: number[], scale: number[], rotation = new THREE.Quaternion()) => {
    const g = geometry.clone();
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p), rotation, new THREE.Vector3(...scale)));
    const list = parts.get(role) ?? []; list.push(g); parts.set(role, list);
  };
  const beam = (role: Role, a: number[], b: number[], radius: number) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), delta = end.clone().sub(start);
    add(cylinder, role, start.add(end).multiplyScalar(.5).toArray(), [radius, delta.length(), radius], new THREE.Quaternion().setFromUnitVectors(up, delta.normalize()));
  };
  const sites = dressingSites(assets);
  for (const { x, z, kind } of sites) {
    const cube = (role: Role, px: number, py: number, pz: number, sx: number, sy: number, sz: number) => add(box, role, [x + px, py, z + pz], [sx, sy, sz]);
    if (kind < 3) {
      for (const dx of [-5.5, 0, 5.5]) for (const dz of [-3, 3]) {
        cube('concrete', dx, -.1, dz, .9, .7, .9);
        const height = Math.max(...config.dressing.levels);
        cube('steel', dx, height / 2, dz, .22, height, .22);
      }
      for (const y of config.dressing.levels) {
        for (const dx of [-5.5, 0, 5.5]) cube('steel', dx, y, 0, .18, .3, 6.4);
        for (let i = 0; i < config.dressing.pipeCount; i++) {
          const dz = -2.5 + i * .55, radius = i % 3 === 0 ? .18 : .095;
          beam('pipe', [x - 6, y + .35, z + dz], [x + 6, y + .35, z + dz], radius);
          for (const dx of [-3.5, 3.5]) beam('steel', [x + dx - .07, y + .35, z + dz], [x + dx + .07, y + .35, z + dz], radius * 1.6);
        }
        for (const dz of [3.1, 3.6]) cube('steel', 0, y + .55, dz, 12, .22, .045);
        for (let dx = -5.5; dx < 6; dx += .6) cube('steel', dx, y + .47, 3.35, .04, .04, .5);
      }
      for (const dz of [-3, 3]) beam('steel', [x - 5.5, .2, z + dz], [x, 4.5, z + dz], .065);
      // One gate valve on each rack, handwheel above the line.
      beam('dark', [x, 7.55, z], [x, 8.1, z], .12);
      beam('rail', [x, 8.1, z], [x, 8.16, z], .3);
    } else if (kind === 3) {
      // Secondary vessels with their own skid, access deck and switchback stairs.
      cube('concrete', 0, -.12, 0, 11, .6, 8);
      for (const dx of [-3, 1]) {
        add(cylinder, 'pipe', [x + dx, 4.5, z], [1.1, 8, 1.1]);
        for (const y of [1, 3, 5, 7.5]) add(cylinder, 'steel', [x + dx, y, z], [1.14, .07, 1.14]);
        beam('pipe', [x + dx, 7, z], [x + dx, 7, z + 2], .18);
        beam('pipe', [x + dx, 7, z + 2], [x + dx, .8, z + 2], .18);
      }
      for (const y of [3, 6]) {
        cube('steel', 0, y, -2, 10, .15, 1.3);
        for (const dx of [-5, -3, -1, 1, 3, 5]) cube('rail', dx, y + .5, -2.6, .045, 1, .045);
        cube('rail', 0, y + 1, -2.6, 10, .045, .045);
      }
      for (let i = 0; i < 12; i++) {
        cube('steel', 3.5, .25 + i * .25, -1.7 + i * .27, .9, .08, .28);
        cube('steel', 4.5, 3.25 + i * .25, 1.27 - i * .27, .9, .08, .28);
      }
      cube('steel', 4, 3, 1.8, 2, .15, .8);
      cube('steel', 4, 6, -2, 2, .15, 1.1);
      for (const dx of [3, 5]) {
        cube('steel', dx, 3, 1.8, .12, 6, .12);
        beam('rail', [x + dx, 1.1, z - 1.7], [x + dx, 4.1, z + 1.27], .035);
        beam('rail', [x + dx, 4.1, z + 1.27], [x + dx, 7.1, z - 1.7], .035);
      }
    } else if (kind === 4) {
      // Laydown supplies: stored pipe, cable reels and pallets below the skyline.
      for (let i = 0; i < 10; i++) beam('dark', [x - 4.5, .3 + Math.floor(i / 5) * .3, z - 1 + i % 5 * .38], [x + 3, .3 + Math.floor(i / 5) * .3, z - 1 + i % 5 * .38], .14);
      for (const dx of [-3, 2]) cube('concrete', dx, -.1, 0, .25, .35, 3);
      for (const dx of [-3, 0, 3]) {
        beam('dark', [x + dx, .6, z - 3], [x + dx, .6, z - 2], .5);
        for (const dz of [-3, -2]) beam('rail', [x + dx, .6, z + dz], [x + dx, .6, z + dz + .1], .65);
      }
    } else {
      // Parked maintenance truck; separate from the moving road actors.
      cube('dark', 0, .35, 0, 5.8, .3, 2.2);
      cube('pipe', -1.7, 1.25, 0, 2, 1.6, 2.1);
      cube('glass', -1.7, 1.65, 0, 2.05, .65, 2.12);
      cube('pipe', 1, .8, 0, 3.2, .35, 2.1);
      for (const dx of [-1.8, 1.8]) for (const dz of [-1.05, 1.05]) beam('dark', [x + dx, .03, z + dz - .18], [x + dx, .03, z + dz + .18], .48);
      cube('steel', 4, 4, 3, .16, 8.8, .16);
      cube('dark', 4, 8.4, 2.5, 1, .18, 1.2);
    }
  }
  // Surface fittings follow existing route points; no new connection or topology.
  for (const connection of connections) {
    const points = connection.route_points?.map(p => new THREE.Vector3(p.x, p.z, -p.y));
    if (!points) continue;
    const radius = (connection.diameter ?? .6) / 2;
    for (let i = 1; i < points.length; i++) {
      const start = points[i - 1], delta = points[i].clone().sub(start), length = delta.length();
      if (length < 2) continue;
      const direction = delta.clone().normalize();
      for (let distance = 1; distance < length - .5; distance += 6) {
        const center = start.clone().addScaledVector(direction, distance);
        beam('steel', center.clone().addScaledVector(direction, -.08).toArray(), center.clone().addScaledVector(direction, .08).toArray(), radius * 1.45);
      }
      if (Math.abs(direction.y) < .1 && length > 8) {
        const center = start.clone().addScaledVector(direction, length / 2);
        beam('dark', center.toArray(), center.clone().add(new THREE.Vector3(0, radius + .5, 0)).toArray(), .08);
        beam('rail', center.clone().add(new THREE.Vector3(0, radius + .5, 0)).toArray(), center.clone().add(new THREE.Vector3(0, radius + .56, 0)).toArray(), .26);
      }
    }
  }
  const group = new THREE.Group(); group.name = 'non-canonical-slice-dressing';
  group.userData = { category: 'ground', presentationOnly: true, moduleCount: sites.length, sites };
  for (const [role, geometries] of parts) {
    const geometry = mergeGeometries(geometries)!; geometries.forEach(g => g.dispose());
    const material = new THREE.MeshStandardMaterial({ color: config.dressing.palette[role], roughness: role === 'glass' ? .25 : .68, metalness: ['steel', 'pipe', 'rail'].includes(role) ? .5 : .05 });
    const mesh = new THREE.Mesh(geometry, material); mesh.name = `slice-${role}`;
    mesh.raycast = () => undefined; mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData.category = 'ground'; group.add(mesh);
  }
  box.dispose(); cylinder.dispose(); return group;
}
