// src/services/inventario.ts
import { supabase } from "../lib/supabaseClient";

import { Producto, Inventario, Color } from '../types/types';
// =========================
// Productos
// =========================
export const obtenerProductos = async (): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*, inventario(*)')
    .order('fecha_actualizacion', { ascending: false });

  if (error) throw error;

  return data as Producto[];
};

export const obtenerProductoPorId = async (id: string): Promise<Producto | null> => {
  const { data, error } = await supabase
    .from('productos')
    .select('*, inventario(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  return data as Producto;
};

export const agregarProducto = async (producto: Omit<Producto, 'id' | 'fechaActualizacion' | 'inventario'>) => {
  const { data, error } = await supabase
    .from('productos')
    .insert([producto])
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const actualizarProducto = async (id: string, producto: Partial<Producto>) => {
  const { error } = await supabase
    .from('productos')
    .update({
      ...producto,
      fecha_actualizacion: new Date(),
    })
    .eq('id', id);

  if (error) throw error;
};

export const eliminarProducto = async (id: string) => {
  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) throw error;
};

// =========================
// Inventario (talle + color)
// =========================
export const actualizarStock = async (
  productoId: string,
  talla: string,
  color: string,
  cantidad: number
) => {
  // Buscar si ya existe esa combinación
  const { data: existente, error: fetchError } = await supabase
    .from('inventario')
    .select('*')
    .eq('producto_id', productoId)
    .eq('talla', talla)
    .eq('color', color)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (!existente) {
    // Insertar nuevo registro
    const { error } = await supabase.from('inventario').insert([
      {
        producto_id: productoId,
        talla,
        color,
        stock: cantidad >= 0 ? cantidad : 0,
      },
    ]);
    if (error) throw error;
  } else {
    // Actualizar stock existente
    const nuevoStock = existente.stock + cantidad;
    if (nuevoStock < 0) throw new Error('Stock insuficiente');
    const { error } = await supabase
      .from('inventario')
      .update({ stock: nuevoStock })
      .eq('id', existente.id);
    if (error) throw error;
  }
};

export const eliminarCombinacion = async (
  productoId: string,
  talla: string,
  color: string
) => {
  const { error } = await supabase
    .from('inventario')
    .delete()
    .eq('producto_id', productoId)
    .eq('talla', talla)
    .eq('color', color);

  if (error) throw error;
};

// =========================
// Colores
// =========================
export const obtenerColoresDisponibles = async (): Promise<Color[]> => {
  const { data, error } = await supabase.from('colores_fijos').select('*');
  if (error) throw error;
  return data as Color[];
};

// Obtener colores válidos para un talle específico
export const obtenerColoresPorTalle = async (
  productoId: string,
  talla: string
): Promise<Color[]> => {
  const { data, error } = await supabase
    .from('inventario')
    .select('color')
    .eq('producto_id', productoId)
    .eq('talla', talla)
    .gt('stock', 0);

  if (error) throw error;

  const coloresUnicos = Array.from(new Set(data.map((i) => i.color)));

  const { data: coloresFijos } = await supabase
    .from('colores_fijos')
    .select('*')
    .in('nombre', coloresUnicos);

  return coloresFijos || [];
};

// =========================
// Talles
// =========================
export const obtenerTallesDisponibles = async (
  productoId: string
): Promise<string[]> => {
  const { data, error } = await supabase
    .from('inventario')
    .select('talla')
    .eq('producto_id', productoId)
    .gt('stock', 0);

  if (error) throw error;

  return Array.from(new Set(data.map((i) => i.talla))).sort();
};

export const obtenerColoresFijos = async (): Promise<Color[]> => {
  const { data, error } = await supabase
    .from("colores_fijos")
    .select("nombre, hex");

  if (error) {
    console.error("Error obteniendo colores fijos:", error.message);
    return [];
  }

  return data as Color[];
};
