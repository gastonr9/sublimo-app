import { Object3DNode } from "@react-three/fiber";
import * as THREE from "three";

declare module "@react-three/fiber" {
  interface ThreeElements {
    group: Object3DNode<THREE.Group, typeof THREE.Group>;
    mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>;
    ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>;
    pointLight: Object3DNode<THREE.PointLight, typeof THREE.PointLight>;
  }
}
