import config from '../../data/presentation/motion.json';
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export function daylight(hour: number) {
  const elevation = Math.sin((hour - 6) * Math.PI / 12);
  const day = clamp((elevation + .12) / .72);
  return { elevation, day: day * day * (3 - 2 * day), deepNight: clamp(-elevation / .55) };
}
const road = { ...config.road, far: config.road.far - config.road.farLaneOffset };
const w = road.right - road.left - 2 * road.cornerRadius, h = road.near - road.far - 2 * road.cornerRadius;
const arc = Math.PI * road.cornerRadius / 2;
export const circuitLength = 2 * w + 2 * h + 4 * arc;
/** Exact straight segments and tangent circular corners: constant distance speed. */
export function roadPose(distance: number) {
  let s = ((distance % circuitLength) + circuitLength) % circuitLength;
  const r = road.cornerRadius;
  const segments = [w, arc, h, arc, w, arc, h, arc];
  let part = 0;
  while (s >= segments[part] && part < 7) s -= segments[part++];
  let x: number, z: number, tx: number, tz: number;
  if (part % 2) {
    const i = (part - 1) / 2;
    const centers = [[road.right - r, road.near - r], [road.right - r, road.far + r], [road.left + r, road.far + r], [road.left + r, road.near - r]];
    const theta = Math.PI / 2 - i * Math.PI / 2 - s / r;
    x = centers[i][0] + r * Math.cos(theta); z = centers[i][1] + r * Math.sin(theta);
    tx = Math.sin(theta); tz = -Math.cos(theta);
  } else {
    const poses = [[road.left + r + s, road.near, 1, 0], [road.right, road.near - r - s, 0, -1], [road.right - r - s, road.far, -1, 0], [road.left, road.far + r + s, 0, 1]];
    [x, z, tx, tz] = poses[part / 2];
  }
  return { x, z, heading: Math.atan2(-tz, tx), tx, tz };
}
