import * as THREE from 'three';
import config from '../../../data/presentation/slice.json';

/** Procedural metre-space patina. Installed only on photoreal-owned materials. */
export function surfaceWear(material: THREE.MeshStandardMaterial, role: string, ground = false) {
  const previous = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey();
  const amount = ground ? config.ground.strength : (config.wear as Record<string, number>)[role] ?? .15;
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    shader.vertexShader = `varying vec3 wearPosition;\n${shader.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\nwearPosition = position;');
    shader.fragmentShader = `varying vec3 wearPosition;
      float wearHash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float wearNoise(vec2 p) { vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(wearHash(i),wearHash(i+vec2(1,0)),f.x),mix(wearHash(i+vec2(0,1)),wearHash(i+vec2(1,1)),f.x),f.y); }
      ${shader.fragmentShader}`.replace('#include <color_fragment>', `#include <color_fragment>
      ${ground ? `
        float macroWear = wearNoise(wearPosition.xz / ${config.ground.macroMetres.toFixed(1)});
        vec2 jointDistance = abs(fract(wearPosition.xz / ${config.ground.jointMetres.toFixed(1)}) - .5);
        float joints = smoothstep(.486,.5,max(jointDistance.x,jointDistance.y));
        float trackOffset = abs(wearPosition.z - ${config.ground.trackZ.toFixed(1)});
        float tyre = (1.0-smoothstep(.10,.22,abs(trackOffset-1.1))) * smoothstep(${config.ground.trackX[0].toFixed(1)},${(config.ground.trackX[0]+10).toFixed(1)},wearPosition.x) * (1.0-smoothstep(${(config.ground.trackX[1]-25).toFixed(1)},${config.ground.trackX[1].toFixed(1)},wearPosition.x));
        float grain = wearNoise(wearPosition.xz*22.0);
        diffuseColor.rgb *= 1.0 - ${amount.toFixed(3)} * (macroWear + joints * .65 + tyre * 1.2) + (grain-.5)*.065;
      ` : `
        float streak = wearNoise(vec2(wearPosition.x * 2.7 + wearPosition.z * 3.1, wearPosition.y * .13));
        float broad = wearNoise(vec2(wearPosition.x + wearPosition.z,wearPosition.y) * .28);
        float baseDirt = exp(-max(wearPosition.y,0.0)*.35);
        diffuseColor.rgb *= 1.0 - ${amount.toFixed(3)} * (streak*.6 + broad*.4 + baseDirt*.5);
      `}`);
  };
  material.customProgramCacheKey = () => `${previousKey}/slice-wear/${role}/${ground}/${amount}`;
}
