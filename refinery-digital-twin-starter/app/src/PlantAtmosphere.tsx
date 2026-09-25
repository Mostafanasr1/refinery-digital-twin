import { motionTime, useMotion } from './motionState';
import { daylight } from './motionMath';
import motionConfig from '../../data/presentation/motion.json';
import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useLook } from './looks/LookProvider';
import type { Asset } from './data/loader';
import config from '../../data/presentation/atmosphere.json';

/** Presentation-only effects derived from plant types; no asset or telemetry changes. */
export function PlantAtmosphere({ assets }: { assets: Asset[] }) {
  const { look } = useLook();
  const enabled = look.id !== 'engineering';
  const { hour } = useMotion();
  const dark = 1 - daylight(hour).day;
  const { camera, invalidate } = useThree();
  const resources = useMemo(() => {
    const group = new THREE.Group(); group.name = 'plant-atmosphere';
    const flames: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = [];
    for (const asset of assets.filter(asset => asset.type === 'flare')) {
      const material = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { time: {value:0} },
        vertexShader: 'varying vec2 uvFlame; void main(){uvFlame=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader: `varying vec2 uvFlame; uniform float time;
          float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
          float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
          void main(){float y=uvFlame.y; float n=noise(vec2(uvFlame.x*7.,y*9.-time*4.));
            float bend=sin(y*8.-time*3.)*.07*y; float width=(1.-y)*.42;
            float edge=width-abs(uvFlame.x-.5-bend)+(n-.5)*.18;
            float alpha=smoothstep(-.03,.07,edge)*smoothstep(0.,.08,y)*(1.-smoothstep(.78,1.,y));
            vec3 color=mix(vec3(7.,1.1,.08),vec3(12.,8.,2.5),smoothstep(.05,.32,edge)*(1.-y));
            gl_FragColor=vec4(color,alpha*.85);}` });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(config.flame.widthMetres, config.flame.heightMetres), material);
      mesh.position.set(asset.position.x, asset.position.z + asset.dimensions.height + 2 + config.flame.heightMetres / 2, -asset.position.y);
      mesh.userData.category = 'helpers'; mesh.raycast = () => undefined; group.add(mesh); flames.push(mesh);
    }
    const canvas = document.createElement('canvas'); canvas.width=128; canvas.height=128;
    const ctx=canvas.getContext('2d')!, gradient=ctx.createRadialGradient(64,64,0,64,64,64);
    gradient.addColorStop(0,'rgba(230,234,235,.45)'); gradient.addColorStop(.5,'rgba(220,225,230,.18)'); gradient.addColorStop(1,'rgba(220,225,230,0)');
    ctx.fillStyle=gradient; ctx.fillRect(0,0,128,128);
    const steamTexture=new THREE.CanvasTexture(canvas); steamTexture.colorSpace=THREE.SRGBColorSpace;
    const steam: {sprite:THREE.Sprite; origin:THREE.Vector3; phase:number}[]=[];
    for (const asset of assets.filter(asset=>config.steam.types.includes(asset.type)).slice(0,config.steam.maxSources)) {
      const origin=new THREE.Vector3(asset.position.x,asset.position.z+asset.dimensions.height,-asset.position.y);
      for(let i=0;i<config.steam.particlesPerSource;i++) {
        const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:steamTexture,transparent:true,depthWrite:false,opacity:.3,color:'#d2d6db'}));
        sprite.raycast=()=>undefined; sprite.userData.category='helpers'; group.add(sprite);
        steam.push({sprite,origin,phase:i/config.steam.particlesPerSource});
      }
    }
    const transforms:THREE.Matrix4[]=[];
    for(const asset of assets.filter(asset=>config.platformLamps.types.includes(asset.type))) {
      const {x,y,z}=asset.position, h=asset.dimensions.height;
      if(asset.type==='pipe_rack') for(let i=0;i<5;i++) transforms.push(new THREE.Matrix4().makeTranslation(x-asset.dimensions.length/2+i*asset.dimensions.length/4,z+h+.7,-y+asset.dimensions.width/2));
      else for(const fraction of [.25,.5,.75]) for(const side of [-1,1]) transforms.push(new THREE.Matrix4().makeTranslation(x+side*(asset.dimensions.diameter/2+.7),z+h*fraction+1.1,-y));
    }
    // Distributed roof/platform lamps, including storage and secondary units.
    for(const asset of assets.filter(asset=>!config.platformLamps.types.includes(asset.type))) {
      const {x,y,z}=asset.position, h=asset.dimensions.height;
      const width=Math.max(asset.dimensions.width,asset.dimensions.diameter);
      const tank=['storage_tank','floating_roof_tank','sphere_tank'].includes(asset.type);
      for(const side of [-1,1]) transforms.push(new THREE.Matrix4().makeTranslation(x+side*(tank?width*.5+.3:width*.35),z+h+(tank?.8:.2),-y));
    }
    const nightExtras=new THREE.Group();nightExtras.name='distributed-night-lighting';group.add(nightExtras);
    const xs=assets.map(a=>a.position.x), zs=assets.map(a=>-a.position.y);
    const x0=Math.min(...xs)-26,x1=Math.max(...xs)+26,z0=Math.min(...zs)-26,z1=Math.max(...zs)+26;
    // Existing perimeter road poles receive brighter heads; low emissive bollards
    // make the inner road edges legible without additional shadow maps.
    for(const z of [z0+9,z1-9]) for(let x=x0+10;x<x1-5;x+=12) transforms.push(new THREE.Matrix4().makeTranslation(x,.8,z));
    for(const unit of new Set(assets.map(asset=>asset.unit_id))) {
      const members=assets.filter(asset=>asset.unit_id===unit);
      const center=new THREE.Vector3(members.reduce((sum,a)=>sum+a.position.x,0)/members.length,config.nightLighting.poolHeightMetres,-members.reduce((sum,a)=>sum+a.position.y,0)/members.length);
      const light=new THREE.PointLight('#ffc27b',config.nightLighting.poolIntensity,config.nightLighting.poolRangeMetres,2);
      light.position.copy(center);light.castShadow=false;nightExtras.add(light);
    }
    const warningPositions=assets.filter(a=>['stack','flare','cylindrical_heater','fired_heater'].includes(a.type)).map(asset=>{
      const top=asset.dimensions.height+(asset.type==='fired_heater'?12:asset.type==='cylindrical_heater'?asset.dimensions.height*.4:asset.type==='flare'?1:0);
      const radius=asset.type==='fired_heater'?1.1:asset.type==='cylindrical_heater'?asset.dimensions.diameter*.15:asset.type==='stack'?asset.dimensions.diameter*.35:asset.dimensions.diameter*.5;
      const offset=new THREE.Vector3(radius+.15,top+.15,0).applyEuler(new THREE.Euler(-asset.rotation.x,asset.rotation.z,-asset.rotation.y));
      return new THREE.Matrix4().makeTranslation(asset.position.x+offset.x,asset.position.z+offset.y,-asset.position.y+offset.z);
    });
    const warnings=new THREE.InstancedMesh(new THREE.SphereGeometry(.35,10,6),new THREE.MeshBasicMaterial({color:new THREE.Color(...config.nightLighting.warningColor as [number,number,number])}),warningPositions.length);
    warnings.name='aviation-warning-lights';
    warningPositions.forEach((matrix,index)=>warnings.setMatrixAt(index,matrix));warnings.computeBoundingSphere();warnings.raycast=()=>undefined;warnings.userData.category='lamps';group.add(warnings);
    const lamps=new THREE.InstancedMesh(new THREE.BoxGeometry(.6,.25,.6),new THREE.MeshBasicMaterial({color:new THREE.Color(...config.platformLamps.color as [number,number,number])}),transforms.length);
    transforms.forEach((matrix,index)=>lamps.setMatrixAt(index,matrix)); lamps.computeBoundingSphere(); lamps.userData.category='lamps'; lamps.raycast=()=>undefined; group.add(lamps);
    const center=new THREE.Vector3(assets.reduce((sum,a)=>sum+a.position.x,0)/assets.length,0,-assets.reduce((sum,a)=>sum+a.position.y,0)/assets.length);
    const target=new THREE.Object3D(); target.position.copy(center); group.add(target);
    const flood=new THREE.SpotLight(config.floodlight.color,config.floodlight.intensity,240,Math.PI/3,.7,2);
    const mount=assets.find(asset=>asset.type===config.floodlight.mountType);
    if(mount) flood.position.set(mount.position.x+mount.dimensions.diameter/2+.7,mount.position.z+mount.dimensions.height*config.floodlight.mountFraction+1.1,-mount.position.y);
    else flood.position.copy(center).add(new THREE.Vector3(0,20,20)); flood.target=target; flood.castShadow=true;
    flood.shadow.mapSize.setScalar(config.floodlight.shadowSize); flood.shadow.normalBias=.12; flood.shadow.bias=-.0002; group.add(flood);
    const flareLights=flames.map(flame=>{const light=new THREE.PointLight('#ff9f44',config.flame.lightIntensity,config.flame.lightRangeMetres,2);light.position.copy(flame.position);group.add(light);return light;});
    return {group,flames,steam,steamTexture,lamps,flood,flareLights,nightExtras,warnings};
  },[assets]);
  useEffect(()=>{
    resources.group.visible=enabled; resources.flood.visible=dark > .001; resources.flood.intensity=config.floodlight.intensity*dark;
    resources.flareLights.forEach(light=>{light.visible=dark>.001;light.intensity=config.flame.lightIntensity*dark;});
    resources.nightExtras.visible=dark>.001; resources.nightExtras.children.forEach(node=>{if(node instanceof THREE.PointLight)node.intensity=config.nightLighting.poolIntensity*dark;});
    resources.lamps.visible=dark>.001;(resources.lamps.material as THREE.MeshBasicMaterial).color.setRGB(...config.platformLamps.color as [number,number,number]).multiplyScalar(dark); invalidate();
  },[resources,enabled,dark,invalidate]);
  useFrame(()=>{
    if(!enabled)return;
    const time=motionTime();
    resources.warnings.visible=(time % motionConfig.aviation.periodSeconds)/motionConfig.aviation.periodSeconds < motionConfig.aviation.onFraction;
    resources.flames.forEach(flame=>{flame.quaternion.copy(camera.quaternion);flame.material.uniforms.time.value=time;});
    resources.steam.forEach(({sprite,origin,phase})=>{const age=(time/config.steam.periodSeconds+phase)%1; sprite.position.copy(origin).add(new THREE.Vector3(age*3+Math.sin(time*.1)*motionConfig.wind.x*10,age*config.steam.riseMetres,age*1.5+Math.sin(time*.08)*motionConfig.wind.z*10));sprite.scale.setScalar(2+age*7);sprite.material.opacity=.32*Math.sin(age*Math.PI);});
  });
  useEffect(()=>()=>{
    resources.flames.forEach(mesh=>{mesh.geometry.dispose();mesh.material.dispose();});
    resources.steam.forEach(({sprite})=>sprite.material.dispose());resources.steamTexture.dispose();
    resources.warnings.geometry.dispose();(resources.warnings.material as THREE.Material).dispose();resources.warnings.dispose();resources.nightExtras.children.forEach(node=>{if(node instanceof THREE.PointLight)node.dispose();});
    resources.lamps.geometry.dispose();(resources.lamps.material as THREE.Material).dispose();resources.lamps.dispose();resources.flood.dispose();resources.flareLights.forEach(light=>light.dispose());
  },[resources]);
  return <primitive object={resources.group} />;
}
