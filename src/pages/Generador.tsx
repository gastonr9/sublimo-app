/**
 * @file Generador.tsx
 * @description Este archivo define la página "Generador", que es la interfaz principal para la personalización de productos en 3D.
 * @module pages/Generador
 */

import Canvas3D from "../components/sublimo/Canvas3D";

/**
 * @function Generador
 * @description Un componente de React que renderiza la página "Generador".
 * Esta página contiene el componente `Canvas3D`, que proporciona el entorno de visualización y personalización 3D.
 * @returns {JSX.Element} El componente de la página "Generador".
 */
function Generador() {
  return (
    <div>
      <Canvas3D />
    </div>
  );
}

export default Generador;
