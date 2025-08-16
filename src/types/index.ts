export interface Inventario {
  talla: string;
  color: string;
  stock: number;
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  inventario: Inventario[];
  fechaActualizacion: Date;
}

