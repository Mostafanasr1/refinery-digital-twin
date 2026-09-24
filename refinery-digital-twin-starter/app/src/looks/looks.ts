export type LookId = 'engineering' | 'photoreal';
type Vec3 = [number, number, number];
export interface DesertEnvironment {
  assets: { sky: string; color: string; normal: string; roughness: string; context: string };
  terrain: { size: number; segments: number; tileMetres: number; height: number; color: string; pad: string; normalScale: number; darkTint: string };
  scatter: { rocks: number; scrub: number; falloff: number; rockColor: string; scrubColor: string };
  track: { gate: [number, number]; width: number };
  fog: { color: string; near: number; far: number };
  mountains: { radius: number; height: number; color: string };
  intensity: number; backgroundIntensity: number; rotation: number;
}
export interface Look {
  id: LookId;
  label: string;
  detailLevel: 0 | 1;
  materials: { roughness: { concrete: number; safety: number; metal: number }; proxy: { metalness: number; roughness: number }; pipe: { color: string; metalness: number; roughness: number } };
  environment: { desert?: DesertEnvironment; background: string; grid: boolean; gridColors: [string, string]; room: boolean; intensity: number; site: { base: string; surface: string; road: string; marking: string; edge: string; pole: string; lamp: Vec3; foundation: string; baseRoughness: number; surfaceRoughness: number; surfaceMetalness: number; foundationRoughness: number } };
  lighting: { ambient: number; hemisphere: [string, string, number]; sun: { position: Vec3; color: string; intensity: number }; fill: { position: Vec3; color: string; intensity: number }; shadows: boolean; shadow: { size: [number, number]; left: number; right: number; top: number; bottom: number; far: number; normalBias: number; bias: number } };
  post: { toneMapping: 'aces'; exposure: number; bloom: { intensity: number; radius: number; threshold: number } };
}
const engineering: Look = {
  id: 'engineering', label: 'Engineering', detailLevel: 0,
  materials: { roughness: { concrete: .92, safety: .4, metal: .32 }, proxy: { metalness: .45, roughness: .48 }, pipe: { color: '#7899a2', metalness: .5, roughness: .45 } },
  environment: { background: '#08151e', grid: true, gridColors: ['#142c3a', '#10232f'], room: true, intensity: .3,
    site: { base: '#162a35', surface: '#0b1a24', road: '#0c1720', marking: '#6e8591', edge: '#35cddd', pole: '#4b626f', lamp: [2.6,1.9,.8], foundation: '#24333b', baseRoughness: .8, surfaceRoughness: .85, surfaceMetalness: .1, foundationRoughness: .95 } },
  lighting: { ambient: .25, hemisphere: ['#90bed8','#15202a',.4], sun: { position: [30,100,30], intensity: 2.1, color: '#ffe0ad' }, fill: { position: [150,60,-100], color: '#5bb9ee', intensity: 1.3 }, shadows: true, shadow: { size: [2048,2048], left: -160, right: 160, top: 130, bottom: -130, far: 400, normalBias: .2, bias: -.0002 } },
  post: { toneMapping: 'aces', exposure: .85, bloom: { intensity: .35, radius: .6, threshold: 1.1 } },
};
export const looks: Record<LookId, Look> = {
  engineering,
  photoreal: { ...engineering, id: 'photoreal', label: 'Photoreal', detailLevel: 1,
    materials: { roughness: { concrete: .95, safety: .65, metal: .6 }, proxy: { metalness: .25, roughness: .65 }, pipe: { color: '#7899a2', metalness: .4, roughness: .6 } },
    environment: { ...engineering.environment, background: '#a9c9df', grid: false, room: false, intensity: 0,
      desert: { assets: { sky: 'assets/env/sky.hdr', color: 'assets/env/sand-color.webp', normal: 'assets/env/sand-normal.webp', roughness: 'assets/env/sand-rough.webp', context: 'assets/env/context.glb' }, terrain: { size: 4200, segments: 160, tileMetres: 11, height: 4.5, color: '#e1ccb0', pad: '#aaa18e', normalScale: .24, darkTint: '#b9a58d' }, scatter: { rocks: 900, scrub: 650, falloff: 160, rockColor: '#a28d70', scrubColor: '#655a36' }, track: { gate: [-26, 37], width: 7 }, fog: { color: '#c8d4d5', near: 550, far: 3400 }, mountains: { radius: 650, height: 180, color: '#74634f' }, intensity: .65, backgroundIntensity: .85, rotation: 0 },
      site: { base: '#aa9678', surface: '#c8b48f', road: '#b6a382', marking: '#e3d4ac', edge: '#99896e', pole: '#666b6b', lamp: [1, .95, .8], foundation: '#aca695', baseRoughness: .9, surfaceRoughness: .95, surfaceMetalness: 0, foundationRoughness: .95 } },
    lighting: { ...engineering.lighting, ambient: 0, hemisphere: ['#a9c9df','#c8b48f',0], sun: { position: [118.1919,136.3448,86.2599], color: '#fff1d4', intensity: 3 }, fill: { ...engineering.lighting.fill, intensity: 0 }, shadow: { ...engineering.lighting.shadow, left: -190, right: 190, top: 160, bottom: -160, normalBias: .22, bias: -.0004 } },
    post: { toneMapping: 'aces', exposure: .85, bloom: { intensity: 0, radius: .6, threshold: 1.1 } },
  },
};
// Operating overlays are shared plant state, not look-specific material values.
export const effects = { selected: '#4ed9e8', emissive: '#197688', proxyEmissive: '#167382', off: '#000000', dim: .32, proxyDim: '#26353d', pipeActive: '#f0b55e', proxyRack: '#536b77', proxyHeater: '#b99671', proxyDefault: '#a9bcc4' };
export function lookFromUrl(url: URL): LookId { return url.searchParams.get('look') === 'photoreal' || (!url.searchParams.has('look') && url.hash === '#preview') ? 'photoreal' : 'engineering'; }
export function lookUrl(url: URL, id: LookId): URL { const next = new URL(url); next.searchParams.set('look', id); if (next.hash === '#preview') next.hash = '#demo'; return next; }
