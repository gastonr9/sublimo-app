/**
 * @file Articulos.tsx
 * @description Este archivo define la página de artículos, que muestra una lista de productos disponibles para personalizar.
 * @module pages/Articulos
 */

/**
 * @typedef {object} Producto
 * @property {number} id - El identificador único del producto.
 * @property {string} nombre - El nombre del producto.
 * @property {string} imagen - La ruta a la imagen de vista previa del producto.
 * @property {string} modeloGlb - La ruta al modelo 3D del producto en formato GLB.
 */

/**
 * @const {Producto[]} productos
 * @description Un array de objetos que representa los productos disponibles. Cada objeto contiene detalles como id, nombre, imagen y la ruta al modelo 3D.
 */
const productos = [
  {
    id: 1,
    nombre: "Camiseta Básica",
    imagen: `${import.meta.env.BASE_URL}images/camiseta.png`, // usa ruta relativa desde /public
    modeloGlb: "/models/tshirt.glb",
  },
  // puedes agregar más productos
];

/**
 * @function ListaProductos
 * @description Un componente de React que renderiza una lista de productos en una cuadrícula.
 * Cada producto se muestra como una tarjeta con su imagen, nombre y un botón para personalizar.
 * @returns {JSX.Element} El componente que muestra la lista de productos.
 */
const ListaProductos = () => {
  return (
    <div>
      <div className="grid-container">
        {productos.map((producto) => (
          <div key={producto.id} className="producto-card">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="producto-imagen"
            />
            <h3>{producto.nombre}</h3>
            <button className="personalizar-btn">Customizar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaProductos;
