const productos = [
  {
    id: 1,
    nombre: "Camiseta Básica",
    imagen: `${import.meta.env.BASE_URL}images/camiseta.png`, // usa ruta relativa desde /public
    modeloGlb: "/models/tshirt.glb",
  },
  // puedes agregar más productos
];

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
