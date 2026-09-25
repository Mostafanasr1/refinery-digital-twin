import { describe, it, expect } from 'vitest';
import assets from '../../data/normalized/assets.json';
import config from '../../data/presentation/motion.json';
import { roadPose, circuitLength, daylight } from './motionMath';
import { advanceMotion, motionSnapshot, motionTime, setCycle, setHour, setMotion, pauseCycle } from './motionState';

describe('presentation motion boundaries', () => {
  it('freezes motion and time, completes a four minute day, and pauses on input', () => {
    setMotion(true); setHour(12); setCycle(true); advanceMotion(120); expect(motionSnapshot().hour).toBeCloseTo(0);
    advanceMotion(120); expect(motionSnapshot().hour).toBeCloseTo(12);
    setMotion(false); const t = motionTime(); advanceMotion(10); expect(motionTime()).toBe(t); expect(motionSnapshot().hour).toBe(12);
    setMotion(true); setCycle(true); pauseCycle(); advanceMotion(1); expect(motionSnapshot().hour).toBe(12);
    expect(daylight(12).day).toBe(1); expect(daylight(22).day).toBe(0);
  });
  it('closes the vehicle circuit without positional or tangent discontinuities', () => {
    expect(roadPose(0)).toEqual(roadPose(circuitLength));
    for (let d = 0; d < circuitLength; d += .5) {
      const a = roadPose(d), b = roadPose(d + .01);
      expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeCloseTo(.01, 4);
      expect(a.tx * b.tx + a.tz * b.tz).toBeGreaterThan(.999);
    }
  });
  it('keeps complete vehicle footprints inside the roads and outside equipment and cabins', () => {
    const r = config.road;
    const obstacles = assets.map(a => {
      const halfX = Math.max(a.dimensions.length, a.dimensions.diameter) / 2;
      const halfZ = Math.max(a.dimensions.width, a.dimensions.diameter) / 2;
      const c = Math.abs(Math.cos(a.rotation.z)), s = Math.abs(Math.sin(a.rotation.z));
      return { name: a.tag, x: a.position.x, z: -a.position.y, hx: c * halfX + s * halfZ, hz: s * halfX + c * halfZ };
    });
    for (const x of [-5, 12, 29]) obstacles.push({ name: 'cabin slab', x, z: 25, hx: 6.25, hz: 2.25 });
    // Dense perimeter and interior samples test the swept body, not just its centre.
    let posesChecked = 0;
    for (const vehicle of config.vehicles) for (let d = 0; d < circuitLength; d += .25) {
      const p = roadPose(d); posesChecked++;
      for (let u = -vehicle.length / 2; u <= vehicle.length / 2 + .001; u += vehicle.length / 8) for (let v = -vehicle.width / 2; v <= vehicle.width / 2 + .001; v += vehicle.width / 4) {
        const x = p.x + p.tx * u - p.tz * v, z = p.z + p.tz * u + p.tx * v;
        const onHorizontal = x >= -21 && x <= 261 && (Math.abs(z - r.near) <= 4 || Math.abs(z - r.far) <= 4);
        const onConnector = z >= r.far && z <= r.near && (Math.abs(x - r.left) <= 4 || Math.abs(x - r.right) <= 4);
        if (!onHorizontal && !onConnector) throw new Error(`${vehicle.kind} off road at ${x},${z}`);
        if (!(x > -26 && x < 266 && z > -144 && z < 46)) throw new Error('fence clearance');
      }
      // Separating axes for the rotated full vehicle rectangle against conservative equipment AABBs.
      for (const o of obstacles) {
        const dx = p.x - o.x, dz = p.z - o.z, hx = vehicle.length / 2, hz = vehicle.width / 2;
        const separated = Math.abs(dx) > o.hx + Math.abs(p.tx) * hx + Math.abs(p.tz) * hz
          || Math.abs(dz) > o.hz + Math.abs(p.tz) * hx + Math.abs(p.tx) * hz
          || Math.abs(dx * p.tx + dz * p.tz) > hx + o.hx * Math.abs(p.tx) + o.hz * Math.abs(p.tz)
          || Math.abs(-dx * p.tz + dz * p.tx) > hz + o.hx * Math.abs(p.tz) + o.hz * Math.abs(p.tx);
        if (!separated) throw new Error(`${vehicle.kind} overlaps ${o.name} at ${d}m`);
      }
    }
    expect(posesChecked).toBeGreaterThan(6000);
  }, 30000);
});
