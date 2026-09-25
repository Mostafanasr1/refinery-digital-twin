import { Color } from 'three';
import { daylight } from '../motionMath';
import { looks, type Look, type LookId } from './looks';
import slice from '../../../data/presentation/slice.json';
export function timeLook(id: LookId, hour: number): Look {
  if (id === 'engineering') return looks.engineering;
  const { day, elevation } = daylight(hour), night = 1 - day;
  const base = looks[id], d = looks.photoreal, n = looks['photoreal-night'];
  const mix = (a: number, b: number) => a * day + b * night;
  const color = (a: string, b: string) => `#${new Color(a).lerp(new Color(b), night).getHexString()}`;
  return { ...base,
    environment: { ...base.environment, site: { ...base.environment.site, lamp: d.environment.site.lamp.map((v, i) => mix(v, n.environment.site.lamp[i])) as [number, number, number] } },
    lighting: { ...base.lighting,
      shadow: { ...base.lighting.shadow, normalBias: mix(slice.day.shadowNormalBias, n.lighting.shadow.normalBias), bias: mix(slice.day.shadowBias, n.lighting.shadow.bias) },
      sun: { position: [Math.cos((hour - 6) * Math.PI / 12) * 180, elevation * 180, 90], color: color('#fff1d4', '#ff9955'), intensity: slice.day.sunIntensity * Math.max(0, elevation) },
      hemisphere: [color(d.lighting.hemisphere[0], n.lighting.hemisphere[0]), color(d.lighting.hemisphere[1], n.lighting.hemisphere[1]), night * .25] },
    post: { ...base.post, exposure: mix(slice.day.exposure, 1.1), bloom: { ...base.post.bloom, intensity: mix(slice.day.bloom, .3), radius: mix(.35, .45) } },
  };
}
