// src/services/inventario.ts
import { db } from '../firebase/config';
import {
  collection, addDoc, updateDoc, doc, getDocs, getDoc,
  query, where, deleteDoc, Timestamp
} from 'firebase/firestore';
import type { Producto, Color } from '../types';

const tallesBase: string[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const coloresFijos: Color[] = [
  { nombre: 'Blanco', hex: '#ffffff' },
  { nombre: 'Negro', hex: '#000000' },
  { nombre: 'Rojo', hex: '#ff0000' },
  { nombre: 'Azul', hex: '#0000ff' },
  { nombre: 'Verde', hex: '#008000' },
  { nombre: 'Amarillo', hex: '#ffff00' },
  { nombre: 'Gris', hex: '#808080' },
  { nombre: 'Rosa', hex: '#ff69b4' },
  { nombre: 'Naranja', hex: '#ffa500' },
  { nombre: 'Morado', hex: '#800080' },
];

export const agregarProducto = async (
  producto: Omit<Producto, 'id' | 'fechaActualizacion'>
) => {
  const docRef = await addDoc(collection(db, 'productos'), {
    ...producto,
    fechaActualizacion: Timestamp.fromDate(new Date()),
  });
  return docRef.id;
};

export const actualizarStock = async (
  idProducto: string,
  talla: string,
  color: string,
  cantidad: number
) => {
  if (!idProducto) throw new Error('idProducto vacío');

  const productoRef = doc(db, 'productos', idProducto);
  const snap = await getDoc(productoRef);
  if (!snap.exists()) throw new Error('Producto no encontrado');

  const producto = snap.data() as Producto;
  const inventario = (producto.inventario || []).slice();

  const idx = inventario.findIndex(i => i.talla === talla && i.color === color);

  if (idx === -1) {
    if (!tallesBase.includes(talla)) throw new Error('Talla no válida');
    if (!coloresFijos.some(c => c.nombre === color)) throw new Error('Color no válido');
    inventario.push({ talla, color, stock: Math.max(0, cantidad) });
  } else {
    const nuevoStock = inventario[idx].stock + cantidad;
    if (nuevoStock < 0) throw new Error('Stock insuficiente');
    inventario[idx].stock = nuevoStock;
  }

  await updateDoc(productoRef, {
    inventario,
    fechaActualizacion: Timestamp.fromDate(new Date()),
  });
};

export const actualizarProducto = async (id: string, producto: Partial<Producto>) => {
  if (!id) throw new Error('id vacío');
  const productoRef = doc(db, 'productos', id);
  await updateDoc(productoRef, {
    ...producto,
    fechaActualizacion: Timestamp.fromDate(new Date()),
  });
};

export const eliminarProducto = async (id: string) => {
  if (!id) throw new Error('id vacío');
  await deleteDoc(doc(db, 'productos', id));
};

export const eliminarCombinacion = async (idProducto: string, talla: string, color: string) => {
  if (!idProducto) throw new Error('idProducto vacío');
  const productoRef = doc(db, 'productos', idProducto);
  const snap = await getDoc(productoRef);
  if (!snap.exists()) throw new Error('Producto no encontrado');

  const producto = snap.data() as Producto;
  const inventario = (producto.inventario || []).filter(
    i => !(i.talla === talla && i.color === color)
  );

  await updateDoc(productoRef, {
    inventario,
    fechaActualizacion: Timestamp.fromDate(new Date()),
  });
};

export const obtenerProductos = async (): Promise<Producto[]> => {
  const snapshot = await getDocs(collection(db, 'productos'));
  return snapshot.docs.map(d => {
    const data = d.data() as any;
    return {
      id: d.id,
      ...data,
      fechaActualizacion: data.fechaActualizacion?.toDate
        ? data.fechaActualizacion.toDate()
        : new Date(),
    } as Producto;
  });
};

export const obtenerTallesDisponibles = async (): Promise<string[]> => {
  const snapshot = await getDocs(collection(db, 'productos'));
  const talles = new Set<string>();
  snapshot.docs.forEach(d => {
    const p = d.data() as Producto;
    (p.inventario || []).forEach(i => {
      if (tallesBase.includes(i.talla)) talles.add(i.talla);
    });
  });
  return Array.from(talles).sort();
};

export const obtenerColoresDisponibles = async (): Promise<Color[]> => {
  const snapshot = await getDocs(collection(db, 'productos'));
  const colores = new Set<string>();
  snapshot.docs.forEach(d => {
    const p = d.data() as Producto;
    (p.inventario || []).forEach(i => colores.add(i.color));
  });
  return Array.from(colores)
    .map(nombre => ({ nombre, hex: getDefaultHex(nombre) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
};

export const obtenerColoresPorTalle = async (talle: string): Promise<Color[]> => {
  const snapshot = await getDocs(collection(db, 'productos'));
  const colores = new Set<string>();
  snapshot.docs.forEach(d => {
    const p = d.data() as Producto;
    (p.inventario || []).forEach(i => {
      if (i.talla === talle && i.stock > 0) colores.add(i.color);
    });
  });
  return Array.from(colores)
    .map(nombre => ({ nombre, hex: getDefaultHex(nombre) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
};

export const obtenerProductoPorId = async (id: string): Promise<Producto | null> => {
  if (!id) return null;
  const snap = await getDoc(doc(db, 'productos', id));
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return {
    id: snap.id,
    ...data,
    fechaActualizacion: data.fechaActualizacion?.toDate
      ? data.fechaActualizacion.toDate()
      : new Date(),
  } as Producto;
};

const getDefaultHex = (nombre: string): string => {
  const m: Record<string, string> = {
    Blanco: '#ffffff',
    Negro: '#000000',
    Rojo: '#ff0000',
    Azul: '#0000ff',
    Verde: '#008000',
    Amarillo: '#ffff00',
    Gris: '#808080',
    Rosa: '#ff69b4',
    Naranja: '#ffa500',
    Morado: '#800080',
  };
  return m[nombre] || '#000000';
};
