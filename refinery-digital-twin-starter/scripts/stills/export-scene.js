import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {decompress} from 'three/addons/utils/WebGLTextureUtils.js';
const textureCache=new Map(),geometryCache=new Map();
function geometry(source){if(!geometryCache.has(source.uuid)){const copy=source.clone();for(const key of Object.keys(copy.attributes))if(!["position","normal","uv","uv1","color","tangent"].includes(key))copy.deleteAttribute(key);geometryCache.set(source.uuid,copy)}return geometryCache.get(source.uuid)}
const union=new Map(),presets={},materialCache=new Map();
function visible(n){for(let p=n;p;p=p.parent)if(!p.visible)return false;return true}
function ancestry(n){const a=[];for(let p=n;p;p=p.parent)a.unshift(p.name||p.type);return a.join('/')}
function material(m){
 if(materialCache.has(m.uuid))return materialCache.get(m.uuid);
 const copy=m.clone();
 for(const key of ['map','normalMap','roughnessMap','metalnessMap','emissiveMap','alphaMap','aoMap']){
  let t=copy[key];
  if(t?.isCompressedTexture){
   if(!textureCache.has(t.uuid)){const readable=decompress(t);readable.repeat.copy(t.repeat);readable.offset.copy(t.offset);readable.rotation=t.rotation;readable.flipY=t.flipY;textureCache.set(t.uuid,readable)}
   copy[key]=textureCache.get(t.uuid);t=copy[key];
  }
  if(t?.image?.data){
   const {width,height,data}=t.image,channels=data.length/(width*height);const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d'),pixels=ctx.createImageData(width,height);
   for(let i=0;i<width*height;i++)for(let k=0;k<4;k++)pixels.data[i*4+k]=k===3&&channels<4?255:Math.round(data[i*channels+Math.min(k,channels-1)]*(data instanceof Float32Array?255:1));
   ctx.putImageData(pixels,0,0);const texture=new THREE.CanvasTexture(c);texture.colorSpace=t.colorSpace;texture.flipY=t.flipY;texture.wrapS=t.wrapS;texture.wrapT=t.wrapT;texture.repeat.copy(t.repeat);texture.offset.copy(t.offset);texture.rotation=t.rotation;copy[key]=texture;
  }
 }
 copy.name='material_'+m.uuid;copy.userData={originalName:m.name,program:m.customProgramCacheKey()};materialCache.set(m.uuid,copy);return copy;
}
function state(m){return {name:m.name,color:m.color?.toArray(),emissive:m.emissive?.toArray(),emissiveIntensity:m.emissiveIntensity??0,roughness:m.roughness,metalness:m.metalness,opacity:m.opacity,basic:!!m.isMeshBasicMaterial}}
export function capture(preset){
 const scene=window.__heroScene;scene.updateMatrixWorld(true);const objects={},lights=[],steam=[],omitted=[];let duskSky;
 scene.traverse(n=>{
  if(!visible(n))return;
  if(n.isLight){lights.push({type:n.type,name:n.name,color:n.color.toArray(),intensity:n.intensity,position:n.getWorldPosition(new THREE.Vector3()).toArray(),target:n.target?.getWorldPosition(new THREE.Vector3()).toArray(),angle:n.angle,penumbra:n.penumbra,distance:n.distance});return}
  if(n.isSprite){steam.push({position:n.getWorldPosition(new THREE.Vector3()).toArray(),scale:n.scale.toArray(),opacity:n.material.opacity});return}
  if(!n.isMesh)return;
  if(n.name==='time-of-day-sky'){duskSky=n.material.uniforms.duskMap.value.image.toDataURL('image/png');omitted.push('shader sky: source HDR and captured procedural dusk texture in Cycles world');return}
  const mats=Array.isArray(n.material)?n.material:[n.material];
  if(mats.some(m=>m.isShaderMaterial)){omitted.push({name:n.name,ancestry:ancestry(n),position:n.getWorldPosition(new THREE.Vector3()).toArray(),scale:n.scale.toArray(),reason:n.name==='day-dust'?'day dust excluded from the frozen offline still; physical atmospheric haze retained':'flare shader reconstructed as emissive geometry offline'});return}
  const id='hero_'+n.uuid;
  objects[id]={name:n.name,ancestry:ancestry(n),materials:mats.map(state),programs:mats.map(m=>m.customProgramCacheKey()),count:n.isInstancedMesh?n.count:1};
  if(!union.has(id)){
   const converted=mats.map(material);let out;
   if(n.isInstancedMesh){out=new THREE.InstancedMesh(geometry(n.geometry),converted.length===1?converted[0]:converted,n.count);out.instanceMatrix=n.instanceMatrix.clone();if(n.instanceColor)out.instanceColor=n.instanceColor.clone()}
   else out=new THREE.Mesh(geometry(n.geometry),converted.length===1?converted[0]:converted);
   out.name=id;out.userData={sourceId:id,originalName:n.name,ancestry:ancestry(n)};out.matrix.copy(n.matrixWorld);out.matrix.decompose(out.position,out.quaternion,out.scale);union.set(id,out);
  }
 });presets[preset]={objects,lights,steam,omitted,duskSky};return {objects:Object.keys(objects).length,instances:Object.values(objects).reduce((s,n)=>s+n.count,0),lights:lights.length,steam:steam.length,omitted};
}
export async function save(){
 const scene=new THREE.Scene();for(const mesh of union.values())scene.add(mesh);
 const bytes=await new GLTFExporter().parseAsync(scene,{binary:true,onlyVisible:true,includeCustomExtensions:true});
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'}));a.download='hero-source.glb';a.click();return {presets,meshes:union.size,bytes:bytes.byteLength};
}
