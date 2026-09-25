import { assetUrl } from '../loading';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { useLook } from './LookProvider';

export type Surface = { color: string; metalness: number; roughness: number; tileMetres: number; maps: { color: string; normal: string; roughness: string }; map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture };
export type MaterialPack = Record<string, Surface>;
const Context = createContext<MaterialPack | null>(null);
export const useMaterialPack = () => useContext(Context);

export function MaterialPackProvider({ children }: { children: ReactNode }) {
  const { gl, invalidate } = useThree();
  const { look, setMaterialLoading } = useLook();
  const [pack, setPack] = useState<MaterialPack | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const pending = useRef<Promise<MaterialPack> | null>(null);
  const owned = useRef<MaterialPack | null>(null);
  const lifecycle = useRef(0);
  const textures = useRef(new Set<THREE.Texture>());
  const released = useRef(false);
  const loader = useMemo(() => new KTX2Loader().setTranscoderPath(`${import.meta.env.BASE_URL}assets/materials/`).detectSupport(gl), [gl]);
  useEffect(() => {
    if (look.id === 'engineering') return;
    let active = true;
    setMaterialLoading(!owned.current);
    gl.domElement.dataset.materialsReady = 'false';
    pending.current ??= (async () => {
      const response = await fetch(assetUrl(`${import.meta.env.BASE_URL}assets/materials/manifest.json`));
      if (!response.ok) throw new Error(`Material manifest: HTTP ${response.status}`);
      const manifest = await response.json() as { materials: Record<string, Omit<Surface, 'map' | 'normalMap' | 'roughnessMap'>> };
      const result: MaterialPack = {};
      await Promise.all(Object.entries(manifest.materials).map(async ([role, spec]) => {
        const [map, normalMap, roughnessMap] = await Promise.all([spec.maps.color, spec.maps.normal, spec.maps.roughness].map(async path => {
          const texture = await loader.loadAsync(import.meta.env.BASE_URL + path);
          if (released.current) { texture.dispose(); throw new Error('Material load cancelled on unmount'); }
          textures.current.add(texture); return texture;
        }));
        for (const texture of [map, normalMap, roughnessMap]) { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy()); }
        map.colorSpace = THREE.SRGBColorSpace;
        normalMap.colorSpace = roughnessMap.colorSpace = THREE.NoColorSpace;
        result[role] = { ...spec, map, normalMap, roughnessMap };
      }));
      owned.current = result;
      return result;
    })();
    pending.current.then(result => { if (active) { setPack(result); setMaterialLoading(false); gl.domElement.dataset.materialsReady = 'true'; invalidate(); } }).catch(reason => { if (active) { setMaterialLoading(false); setError(reason instanceof Error ? reason : new Error(String(reason))); } });
    return () => { active = false; setMaterialLoading(false); };
  }, [look.id, gl, loader, invalidate, setMaterialLoading]);
  useEffect(() => {
    const token = ++lifecycle.current;
    const ownedTextures = textures.current;
    return () => queueMicrotask(() => {
      // React's development effect replay retains this owner; a true unmount does not.
      if (lifecycle.current !== token) return;
      released.current = true;
      ownedTextures.forEach(texture => texture.dispose()); ownedTextures.clear(); loader.dispose();
    });
  }, [loader]);
  if (error) throw error;
  return <Context.Provider value={pack}>{children}</Context.Provider>;
}

/** World-scale projected UVs affect only textured Photoreal; positions stay intact. */
export function materialUVs(geometry: THREE.BufferGeometry, metres: number) {
  const position = geometry.getAttribute('position'), normal = geometry.getAttribute('normal');
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    const nx = Math.abs(normal.getX(i)), ny = Math.abs(normal.getY(i)), nz = Math.abs(normal.getZ(i));
    uv[i * 2] = (nx > ny && nx > nz ? position.getZ(i) : position.getX(i)) / metres;
    uv[i * 2 + 1] = (ny > nx && ny > nz ? position.getZ(i) : position.getY(i)) / metres;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}
