import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, deleteDoc, Timestamp } from 'firebase/firestore';
import { Producto, Inventario, Color } from '../types';

// Lista de talles permitidos
const tallesBase: string[] = ['S', 'M', 'L', 'XL', 'XXL'];

// Lista fija de 10 colores predefinidos para el select en Inventario.tsx
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

export const agregarProducto = async (producto: Omit<Producto, 'id' | 'fechaActualizacion'>) => {
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
  const productoRef = doc(db, 'productos', idProducto);
  const productosSnapshot = await getDocs(
    query(collection(db, 'productos'), where('__name__', '==', idProducto))
  );

  if (productosSnapshot.empty) throw new Error('Producto no encontrado');

  const producto = productosSnapshot.docs[0].data() as Producto;
  const inventario = producto.inventario;
  const itemIndex = inventario.findIndex(
    (item) => item.talla === talla && item.color === color
  );

  if (itemIndex === -1) {
    if (!tallesBase.includes(talla)) throw new Error('Talla no válida');
    if (!coloresFijos.some((c) => c.nombre === color)) throw new Error('Color no válido');
    inventario.push({ talla, color, stock: cantidad >= 0 ? cantidad : 0 });
  } else {
    const nuevoStock = inventario[itemIndex].stock + cantidad;
    if (nuevoStock < 0) throw new Error('Stock insuficiente');
    inventario[itemIndex].stock = nuevoStock;
  }

  await updateDoc(productoRef, {
    inventario,
    fechaActualizacion: Timestamp.fromDate(new Date()),
  });
};

export const actualizarProducto = async (id: string, producto: Partial<Producto>) => {
  const productoRef = doc(db, 'productos', id);
  await updateDoc(productoRef, {
    ...producto,
    fechaActualizacion: Timestamp.fromDate(new Date()),
  });
};

export const eliminarProducto = async (id: string) => {
  const productoRef = doc(db, 'productos', id);
  await deleteDoc(productoRef);
};

export const eliminarCombinacion = async (idProducto: string, talla: string, color: string) => {
  const productoRef = doc(db, 'productos', idProducto);
  const productosSnapshot = await getDocs(
    query(collection(db, 'productos'), where('__name__', '==', idProducto))
  );

  if (productosSnapshot.empty) throw new Error('Producto no encontrado');

  const producto = productosSnapshot.docs[0].data() as Producto;
  const inventario = producto.inventario.filter(
    (item) => !(item.talla === talla && item.color === color)
  );

  await updateDoc(productoRef, {
    inventario,
    fechaActualizacion: Timestamp.fromDate(new Date()),
  });
};

export const obtenerProductos = async (): Promise<Producto[]> => {
  const snapshot = await getDocs(collection(db, 'productos'));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    fechaActualizacion: doc.data().fechaActualizacion.toDate(),
  })) as Producto[];
};

export const obtenerTallesDisponibles = async (): Promise<string[]> => {
  const snapshot = await getDocs(collection(db, 'productos'));
  const talles = new Set<string>();
  snapshot.docs.forEach((doc) => {
    const producto = doc.data() as Producto;
    producto.inventario.forEach((item) => {
      if (tallesBase.includes(item.talla)) talles.add(item.talla);
    });
  });
  return Array.from(talles).sort();
};

export const obtenerColoresDisponibles = async (): Promise<Color[]> => {
  const snapshot = await getDocs(collection(db, 'productos'));
  const colores = new Set<string>();
  snapshot.docs.forEach((doc) => {
    const producto = doc.data() as Producto;
    producto.inventario.forEach((item) => colores.add(item.color));
  });
  return Array.from(colores)
    .map((nombre) => ({
      nombre,
      hex: getDefaultHex(nombre),
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
};

// Nueva función para obtener colores disponibles por talle
export const obtenerColoresPorTalle = async (talle: string): Promise<Color[]> => {
  const snapshot = await getDocs(collection(db, 'productos'));
  const colores = new Set<string>();
  snapshot.docs.forEach((doc) => {
    const producto = doc.data() as Producto;
    producto.inventario.forEach((item) => {
      if (item.talla === talle && item.stock > 0) { // Solo colores con stock disponible
        colores.add(item.color);
      }
    });
  });
  return Array.from(colores)
    .map((nombre) => ({
      nombre,
      hex: getDefaultHex(nombre),
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
};

// Función para asignar hex por defecto basado en el nombre del color
const getDefaultHex = (nombre: string): string => {
  const coloresConocidos: { [key: string]: string } = {
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
  return coloresConocidos[nombre] || '#000000'; // Hex por defecto si no está en la lista
};