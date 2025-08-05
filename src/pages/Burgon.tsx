/**
 * @file Burgon.tsx
 * @description Este archivo define la página "Burgon", que es una sección de la aplicación para seleccionar productos.
 * @module pages/Burgon
 */

import SelectProductSection from "../components/burgon/SelectProductSection";

/**
 * @function Burgon
 * @description Un componente de React que renderiza la página "Burgon".
 * Esta página contiene el componente `SelectProductSection`, que permite a los usuarios seleccionar un producto.
 * @returns {JSX.Element} El componente de la página "Burgon".
 */
function Burgon() {
  return (
    <div className="w-max-[900px] flex flex-col justify-self-center items-center">
      <SelectProductSection />
    </div>
  );
}

export default Burgon;
