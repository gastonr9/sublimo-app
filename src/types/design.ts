export interface BurgonDesign {
  id?: string;
  nombre: string;        // nombre del diseño
  imagenUrl: string;     // URL de la imagen en Firebase Storage
  stock: number;         // cantidad disponible de este diseño
}
