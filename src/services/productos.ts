import { supabase } from '../supabaseClient/supabaseClient'

export const obtenerProductos = async () => {
  const { data, error } = await supabase.from('productos').select('*').order('fecha_actualizacion', { ascending: false })
  if (error) throw error
  return data
}

export const agregarProducto = async (producto: { nombre: string, descripcion?: string, precio: number }) => {
  const { data, error } = await supabase.from('productos').insert([producto]).select().single()
  if (error) throw error
  return data
}

export const eliminarProducto = async (id: string) => {
  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) throw error
}
