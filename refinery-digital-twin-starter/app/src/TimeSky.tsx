import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMotion } from './motionState';
import { daylight } from './motionMath';
export function TimeSky({ dayTexture, duskTexture }: { dayTexture: THREE.Texture; duskTexture: THREE.Texture }) {
  const { hour } = useMotion(), { day, deepNight } = daylight(hour);
  const mesh = useRef<THREE.Mesh>(null);
  const material = useMemo(() => new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
    uniforms: { dayMap: { value: dayTexture }, duskMap: { value: duskTexture }, daylight: { value: 1 }, deepNight: { value: 0 } },
    vertexShader: 'varying vec3 direction; void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `varying vec3 direction; uniform sampler2D dayMap; uniform sampler2D duskMap; uniform float daylight; uniform float deepNight;
      void main(){vec3 d=normalize(direction);vec2 uv=vec2(atan(d.z,d.x)/6.2831853+.5,asin(d.y)/3.14159265+.5);
      vec3 night=texture2D(duskMap,uv).rgb*mix(.8,.22,deepNight);gl_FragColor=vec4(mix(night,texture2D(dayMap,uv).rgb*.85,daylight),1.);}`,
  }), [dayTexture, duskTexture]);
  useEffect(() => { material.uniforms.daylight.value = day; material.uniforms.deepNight.value = deepNight; }, [material, day, deepNight]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ camera }) => mesh.current?.position.copy(camera.position));
  return <mesh ref={mesh} name="time-of-day-sky" material={material} renderOrder={-1000} raycast={() => undefined}><sphereGeometry args={[4900, 32, 16]} /></mesh>;
}
