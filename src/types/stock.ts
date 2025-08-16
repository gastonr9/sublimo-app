export interface BurgonStock {
  id?: string;
  talle: string;         // "S", "M", "L", etc.
  colorNombre: string;   // "Rojo", "Negro", etc.
  colorHex: string;      // "#ff0000"
  stock: number;         // cantidad disponible
}
