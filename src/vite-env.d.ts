/// <reference types="vite/client" />

// Declaraciones de tipos para React Three Fiber
declare global {
  namespace JSX {
    interface IntrinsicElements {
      primitive: any;
      ambientLight: any;
      pointLight: any;
      directionalLight: any;
      spotLight: any;
      mesh: any;
      geometry: any;
      material: any;
      group: any;
    }
  }
}

export {};
