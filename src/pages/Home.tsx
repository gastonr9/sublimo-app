/**
 * @file Home.tsx
 * @description Este archivo define la página de inicio de la aplicación.
 * @module pages/Home
 */

import HeroSection from "../components/common/HeroSection";

/**
 * @function Home
 * @description Un componente de React que renderiza la página de inicio.
 * Esta página contiene el componente `HeroSection`, que es la sección principal de bienvenida.
 * @returns {JSX.Element} El componente de la página de inicio.
 */
function Home() {
  return (
    <>
      <HeroSection />
    </>
  );
}

export default Home;
