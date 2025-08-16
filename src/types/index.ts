import { Timestamp } from 'firebase/firestore';

export interface Inventario {
  talla: string; // Ej. "S", "M", "L", "XL", "XXL"
  color: string; // Ej. "Blanco", "Negro", "Rojo"
  stock: number; // Ej. 50, 30, 20
}

export interface Producto {
  id: string; // Ej. "producto_1"
  nombre: string; // Ej. "Camiseta Básica"
  precio: number; // Ej. 15.99
  descripcion?: string; // Opcional
  inventario: Inventario[];
  fechaActualizacion: Timestamp;
}

export interface Color {
  nombre: string; // Ej. "Blanco"
  hex: string; // Ej. "#ffffff"
}