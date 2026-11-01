// Interior (driver's) view: a cockpit attached to the camera.
import * as THREE from "three";
import { steeringWheelAngle } from "./steering";

export type CameraMode = "chase" | "interior";

export class Cockpit {
  readonly group = new THREE.Group();
  private wheel = new THREE.Group();
  private angle = 0;

  constructor() {
    const g = this.group;
    const dark = new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.85 });
    const alcantara = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 1 });
    const carbon = new THREE.MeshStandardMaterial({ color: 0x151618, roughness: 0.5, metalness: 0.3 });
    const accent = new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.4, metalness: 0.5 });
    const screen = new THREE.MeshStandardMaterial({ color: 0x0a0f14, emissive: 0x1f6fb0, emissiveIntensity: 0.6 });

    // Dashboard (low, so the road stays visible)
    const dash = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 0.55), alcantara);
    dash.position.set(0.35, -0.5, -0.85);
    g.add(dash);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.03, 0.08), carbon);
    lip.position.set(0.35, -0.41, -1.1);
    g.add(lip);
    // Instrument cluster
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.09, 0.22), dark);
    hood.position.set(0, -0.39, -0.82);
    g.add(hood);
    const cluster = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.11), screen);
    cluster.position.set(0, -0.42, -0.705);
    cluster.rotation.x = -0.25;
    g.add(cluster);
    // Center screen
    const center = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.15), screen);
    center.position.set(0.42, -0.47, -0.6);
    center.rotation.set(-0.5, -0.2, 0);
    g.add(center);
    // A-pillars + roof edge
    for (const side of [-1, 1]) {
      const x = side < 0 ? -0.62 : 1.32;
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.95, 0.07), dark);
      pillar.position.set(x, -0.05, -0.95);
      pillar.rotation.set(-0.55, 0, side * -0.35);
      g.add(pillar);
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.12, 0.5), dark);
    roof.position.set(0.35, 0.75, -0.4);
    g.add(roof);
    // Door sills
    for (const x of [-0.75, 1.45]) {
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 1.4), alcantara);
      door.position.set(x, -0.5, -0.3);
      g.add(door);
    }

    // Steering wheel
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.022, 10, 32), alcantara);
    this.wheel.add(rim);
    for (const a of [0, Math.PI * 0.5, Math.PI]) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.025, 0.015), carbon);
      spoke.position.set(Math.cos(a + Math.PI) * 0.08, Math.sin(a + Math.PI) * 0.08 * (a === Math.PI * 0.5 ? 1 : 0), 0);
      spoke.rotation.z = a === Math.PI * 0.5 ? Math.PI / 2 : 0;
      if (a === Math.PI * 0.5) spoke.position.set(0, -0.085, 0);
      this.wheel.add(spoke);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16), carbon);
    hub.rotation.x = Math.PI / 2;
    this.wheel.add(hub);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.03), accent);
    top.position.set(0, 0.17, 0.005);
    this.wheel.add(top);
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.3, 10), dark);
    column.rotation.x = Math.PI / 2;
    column.position.z = -0.15;
    this.wheel.add(column);
    const mount = new THREE.Group();
    mount.position.set(0, -0.3, -0.78);
    mount.rotation.x = -0.35;
    mount.add(this.wheel);
    g.add(mount);
    g.visible = false;
  }

  update(rot: number, dt: number) {
    const target = steeringWheelAngle(rot);
    this.angle += (target - this.angle) * (1 - Math.exp(-12 * dt));
    this.wheel.rotation.z = this.angle;
  }

  get wheelAngle() {
    return this.angle;
  }
}
