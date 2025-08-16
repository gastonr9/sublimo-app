import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Producto,  } from '../types';

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
    // Agregar nueva combinación si no existe
    inventario.push({ talla, color, stock: cantidad >= 0 ? cantidad : 0 });
  } else {
    // Actualizar stock
    const nuevoStock = inventario[itemIndex].stock + cantidad;
    if (nuevoStock < 0) throw new Error('Stock insuficiente');
    inventario[itemIndex].stock = nuevoStock;
  }

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