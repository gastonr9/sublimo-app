// src/types.ts

// =======================
// Colores
// =======================
export interface Color {
  id?: string; // UUID de la tabla colores_fijos
  nombre: string; // Ej: "Rojo"
  hex: string; // Ej: "#ff0000"
}

// =======================
// Inventario (stock por talle y color)
// =======================
export interface Inventario {
  id: string; // UUID
  producto_id: string; // FK -> productos.id
  talla: string; // Ej: "M"
  color: string; // nombre del color (ej: "Rojo")
  stock: number; // cantidad
}

// =======================
// Productos (camisetas u otros)
// =======================
export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  fecha_actualizacion?: string; //  opcional
  inventario: Inventario[];
}

// =======================
// estampas predefinidos
// =======================
export interface Diseno {
  id: string; // UUID
  nombre: string; // Ej: "Logo Burgon"
  imagen_url: string; // URL de la imagen
  stock: number; // Stock disponible del estampa
}

// =======================
// Pedidos
// =======================
export interface Pedido {
  id: string; // UUID
  cliente_nombre: string;
  cliente_apellido: string;
  producto_id: string; // FK -> productos.id
  talla: string;
  color: string; // nombre del color (ej: "Negro")
  diseno_id: string; // FK -> estampas.id
  precio: number;
  fecha: string; // ISO date string
}

export type UserProfile = {
  id: string;
  nombre_completo?: string | null;
  email: string | null;
  avatar_url?: string | null;
  role: "admin" | "empleado";
};
