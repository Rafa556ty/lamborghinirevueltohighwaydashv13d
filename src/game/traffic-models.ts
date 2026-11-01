// Bespoke metre-scale traffic meshes. The compact is inspired by a Fox, not a licensed replica.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export type TrafficModelKey = 'fox' | 'sedan' | 'suv' | 'pickup' | 'bus';
export const VEHICLE_FINISH = { paint: 0xb9c6ce, sedan: 0x879e98, suv: 0xd4d0c7, pickup: 0x8b343e, bus: 0xf5f5ef, glass: 0x182d37, rubber: 0x18191b, trim: 0x272b2e, chrome: 0xbfc6cb, head: 0xf3edd3, tail: 0xac171d };

export function createTrafficModel(kind: TrafficModelKey): THREE.Group {
  const root = new THREE.Group();
  const bus = kind === 'bus', pickup = kind === 'pickup', suv = kind === 'suv';
  const length = bus ? 10.8 : pickup ? 5.1 : suv ? 4.65 : kind === 'sedan' ? 4.55 : 3.85;
  const width = bus ? 2.5 : pickup || suv ? 1.92 : kind === 'sedan' ? 1.82 : 1.7;
  const wheel = bus ? .49 : pickup || suv ? .39 : .32;
  const belt = bus ? 1.38 : suv ? 1.16 : pickup ? 1.08 : .91;
  const roof = bus ? 3.25 : suv ? 1.76 : pickup ? 1.72 : kind === 'sedan' ? 1.46 : 1.53;
  const paint = new THREE.MeshStandardMaterial({color: kind === 'fox' ? VEHICLE_FINISH.paint : VEHICLE_FINISH[kind], metalness:.48,roughness:.28});
  const glass = new THREE.MeshStandardMaterial({color:VEHICLE_FINISH.glass,metalness:.65,roughness:.14});
  const rubber = new THREE.MeshStandardMaterial({color:VEHICLE_FINISH.rubber,roughness:.92});
  const trim = new THREE.MeshStandardMaterial({color:VEHICLE_FINISH.trim,roughness:.55});
  const chrome = new THREE.MeshStandardMaterial({color:VEHICLE_FINISH.chrome,metalness:.86,roughness:.2});
  const head = new THREE.MeshStandardMaterial({color:VEHICLE_FINISH.head,emissive:VEHICLE_FINISH.head,emissiveIntensity:.35});
  const tail = new THREE.MeshStandardMaterial({color:VEHICLE_FINISH.tail,emissive:VEHICLE_FINISH.tail,emissiveIntensity:.55});
  function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x=0,y=0,z=0) {
    const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); root.add(m); return m;
  }
  function box(w:number,h:number,l:number,mat:THREE.Material,x:number,y:number,z:number,r=.035) {
    return mesh(new RoundedBoxGeometry(w,h,l,2,r),mat,x,y,z);
  }
  // Contoured lower shell: wheel wells are cut into the actual body profile.
  const axleFront=-length*.30, axleRear=length*.30;
  const profile=new THREE.Shape();
  profile.moveTo(-length/2+.12,.43); profile.lineTo(-length/2,.58); profile.lineTo(-length/2+.12,belt-.08);
  profile.lineTo(-length*.30,belt); profile.lineTo(length*.37,belt); profile.lineTo(length/2-.04,belt-.07);
  profile.lineTo(length/2,.45);
  for(const axle of [axleRear,axleFront]) {
    profile.lineTo(axle+wheel+.07,.43);
    profile.absarc(axle,wheel,wheel+.07,0,Math.PI,false);
    profile.lineTo(axle-wheel-.07,.43);
  }
  profile.closePath();
  const shell=new THREE.ExtrudeGeometry(profile,{depth:width-.10,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.05,bevelThickness:.05});
  // Shape X is longitudinal; extrude axis becomes the vehicle width.
  shell.rotateY(-Math.PI/2); shell.translate(width/2-.05,0,0); mesh(shell,paint);
  box(width*.9,.18,length*.89,trim,0,.38,0);
  // Sloped cabin loft (roof, windscreen, rear hatch) rather than stacked cubes.
  const bottomFront=bus ? -length*.45 : -length*.17;
  const bottomRear=bus ? length*.45 : pickup ? length*.06 : kind==='sedan' ? length*.21 : length*.38;
  const roofFront=bus ? bottomFront+.10 : bottomFront+.44;
  const roofRear=bus ? bottomRear-.08 : bottomRear-.27;
  const wide=width*.46, narrow=width*.40;
  const vertices=[[-wide,belt,bottomFront],[wide,belt,bottomFront],[-narrow,roof,roofFront],[narrow,roof,roofFront],[-narrow,roof,roofRear],[narrow,roof,roofRear],[-wide,belt,bottomRear],[wide,belt,bottomRear]];
  function face(ids:number[],mat:THREE.Material,offset=0) {
    const values:number[]=[];
    for(let i=1;i<ids.length-1;i++) for(const id of [ids[0],ids[i],ids[i+1]]) {
      const v=vertices[id ?? 0]; if(v) values.push(v[0] ?? 0,(v[1] ?? 0)+offset,v[2] ?? 0);
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(values,3));geo.computeVertexNormals();
    const m=mesh(geo,mat);m.material.side=THREE.DoubleSide;return m;
  }
  face([2,3,5,4],paint);face([0,1,3,2],glass);face([4,5,7,6],glass);
  face([0,2,4,6],glass);face([1,7,5,3],glass);
  // Painted pillars, door frames, handles and panel seams.
  for(const side of [-1,1]) {
    box(.055,.09,bottomRear-bottomFront,paint,side*wide,belt+.04,(bottomFront+bottomRear)/2);
    const pillars=bus ? 9 : 3;
    for(let i=0;i<pillars;i++) {
      const z=roofFront+(roofRear-roofFront)*i/(pillars-1);
      box(.055,roof-belt,.07,paint,side*(wide+narrow)/2,(roof+belt)/2,z);
    }
    for(const z of bus ? [-3.6,3.3] : [-.12,.75]) {
      box(.018,.23,.018,trim,side*(width/2+.014),belt-.16,z);
      box(.025,.035,.17,chrome,side*(width/2+.02),belt-.10,z+.14);
    }
    const mirror=box(.17,.13,.23,paint,side*(width/2+.10),belt+.13,bottomFront+.14);
    box(.02,.09,.15,glass,mirror.position.x+side*.087,mirror.position.y,mirror.position.z);
  }
  if(pickup) {
    box(width*.80,.06,length*.35,trim,0,belt-.08,length*.26);
    for(const side of [-1,1]) box(.09,.16,length*.35,paint,side*width*.44,belt+.025,length*.26);
    box(width*.9,.15,.09,paint,0,belt+.02,length/2-.10);
  }
  if(suv) for(const side of [-1,1]) box(.055,.055,(roofRear-roofFront)*.88,chrome,side*width*.32,roof+.055,(roofRear+roofFront)/2);
  for(const side of [-1,1]) for(const axle of [axleFront,axleRear]) {
    const x=side*(width/2-.05);
    const tire=mesh(new THREE.CylinderGeometry(wheel,wheel,.23,20),rubber,x,wheel,axle);tire.rotation.z=Math.PI/2;
    const rim=mesh(new THREE.CylinderGeometry(wheel*.69,wheel*.69,.245,16),chrome,x,wheel,axle);rim.rotation.z=Math.PI/2;
    const hub=mesh(new THREE.CylinderGeometry(wheel*.24,wheel*.24,.25,12),trim,x,wheel,axle);hub.rotation.z=Math.PI/2;
    for(let spoke=0;spoke<5;spoke++) {
      const a=spoke*Math.PI*2/5;
      const m=box(.012,wheel*.98,.045,trim,x+side*.128,wheel,axle);m.rotation.x=a;
    }
  }
  for(const side of [-1,1]) {
    box(width*.22,bus ? .18 : .13,.05,head,side*width*.32,belt-.16,-length/2-.015);
    box(bus ? .15 : width*.18,bus ? .48 : .20,.05,tail,side*width*.36,belt-.16,length/2+.015);
  }
  box(width*.40,.18,.055,trim,0,belt-.18,-length/2-.03);
  for(let i=0;i<4;i++) box(width*.37,.012,.012,chrome,0,belt-.23+i*.037,-length/2-.06);
  for(const z of [-length/2,length/2]) {
    box(width*.95,.10,.08,trim,0,.47,z);
    box(.34,.10,.012,chrome,0,.63,z+Math.sign(z)*.056);
  }
  if(bus) {
    box(width*.7,.14,3.2,paint,0,roof+.04,.7);
    for(const side of [-1,1]) box(.025,.10,length*.87,chrome,side*width*.503,1.18,0);
  }
  root.updateMatrixWorld(true);
  const batches=new Map<THREE.Material,THREE.BufferGeometry[]>();
  root.traverse(o=>{
    if(!(o instanceof THREE.Mesh)||Array.isArray(o.material))return;
    const g=o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();g.applyMatrix4(o.matrixWorld);
    g.deleteAttribute('uv'); const list=batches.get(o.material)??[];list.push(g);batches.set(o.material,list);
  });
  const result=new THREE.Group();result.name=kind;
  for(const [mat,geos] of batches){const geo=mergeGeometries(geos);if(geo)result.add(new THREE.Mesh(geo,mat));for(const g of geos)g.dispose();}
  return result;
}