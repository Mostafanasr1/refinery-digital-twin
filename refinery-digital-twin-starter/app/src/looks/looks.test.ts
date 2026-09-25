import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { effects, looks, lookFromUrl, lookUrl } from './looks';
import { MaterialCache } from './materials';
describe('look presets', () => {
  it('defines complete data-driven environments and valid materials for both looks', () => {
    for (const [id, look] of Object.entries(looks)) {
      expect(look.id).toBe(id); expect(look.label).toBeTruthy();
      expect(look.environment.background).toMatch(/^#[\da-f]{6}$/);
      expect(look.lighting.sun.position).toHaveLength(3);
      expect(look.lighting.sun.intensity).toBeGreaterThan(0);
      for (const roughness of Object.values(look.materials.roughness)) { expect(roughness).toBeGreaterThanOrEqual(0); expect(roughness).toBeLessThanOrEqual(1); }
    }
    expect(looks.photoreal.environment.grid).toBe(false);
    expect(looks.photoreal.lighting.ambient).toBe(0);
    expect(looks.photoreal.lighting.hemisphere[2]).toBe(0);
    expect(looks.photoreal.lighting.fill.intensity).toBe(0);
    expect(looks.photoreal.lighting.shadows).toBe(true);
  });
  it('preserves the engineering constants from the pre-consolidation scene', () => {
    expect(looks.engineering.environment).toEqual({ background:'#08151e', grid:true, gridColors:['#142c3a','#10232f'], room:true, intensity:.3, site:{base:'#162a35',surface:'#0b1a24',road:'#0c1720',marking:'#6e8591',edge:'#35cddd',pole:'#4b626f',lamp:[2.6,1.9,.8],foundation:'#24333b',baseRoughness:.8,surfaceRoughness:.85,surfaceMetalness:.1,foundationRoughness:.95} });
    expect(looks.engineering.lighting).toEqual({ambient:.25,hemisphere:['#90bed8','#15202a',.4],sun:{position:[30,100,30],intensity:2.1,color:'#ffe0ad'},fill:{position:[150,60,-100],color:'#5bb9ee',intensity:1.3},shadows:true,shadow:{size:[2048,2048],left:-160,right:160,top:130,bottom:-130,far:400,normalBias:.2,bias:-.0002}});
    expect(looks.engineering.post).toEqual({toneMapping:'aces',exposure:.85,bloom:{intensity:.35,radius:.6,threshold:1.1}});
    expect(looks.engineering.materials).toEqual({roughness:{concrete:.92,safety:.4,metal:.32},proxy:{metalness:.45,roughness:.48},pipe:{color:'#7899a2',metalness:.5,roughness:.45}});
  });
  it('persists appearance without losing unrelated query state and supports old study links', () => {
    const url = new URL('https://example.test/next/?measure=1#preview');
    expect(lookFromUrl(url)).toBe('photoreal');
    expect(lookUrl(url, 'engineering').href).toBe('https://example.test/next/?measure=1&look=engineering#demo');
    expect(lookFromUrl(new URL('https://example.test/?look=invalid'))).toBe('engineering');
  });
});
describe('material cache', () => {
  it('restores originals and shared selection/data effects across ten switches without creating geometry or material sets', () => {
    const original = new THREE.MeshStandardMaterial({ color:'#aabbcc' }); original.name='Steel';
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), original);
    const geometry = mesh.geometry, baseColor = original.color.clone(), cache = new MaterialCache(mesh);
    const photo = cache.meshes.get(mesh.uuid)!.photoreal;
    for (let i=0;i<10;i++) {
      cache.apply(looks.photoreal, {active:true}); expect(mesh.material).toBe(photo);
      expect(mesh.material.color.getHexString()).toBe(new THREE.Color(effects.selected).getHexString());
      cache.apply(looks.engineering, {active:false,tint:'#12aa34'}); expect(mesh.material).toBe(original); expect(mesh.material.color.getHexString()).toBe('12aa34');
      cache.apply(looks.engineering, {active:false}); expect(mesh.material.color.equals(baseColor)).toBe(true); expect(mesh.geometry).toBe(geometry); expect(cache.meshes.size).toBe(1);
    }
    cache.dispose(); geometry.dispose();
  });
  it('handles multi-material meshes and restores dimming before selection exactly', () => {
    const original = [new THREE.MeshStandardMaterial({color:'#abcdef'}),new THREE.MeshStandardMaterial({color:'#123456'})]; original[0].name='Concrete';original[1].name='Safety';
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(),original),cache=new MaterialCache(mesh);
    cache.apply(looks.photoreal,{active:true,dim:true}); cache.apply(looks.engineering,{active:false});
    expect(mesh.material).toBe(original); expect(original.map(m=>m.roughness)).toEqual([.92,.4]); expect(original.map(m=>m.color.getHexString())).toEqual(['abcdef','123456']);
    cache.dispose();mesh.geometry.dispose();
  });
});
