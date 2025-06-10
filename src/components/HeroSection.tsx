import camiseta from "../assets/images/camiseta.png";
export default function HeroSection() {
  return (
    <div className="container grid grid-cols-1 md:grid-cols-2 relative items-center justify-self-center py-20">
      {/* info */}
      <div className="flex flex-col justify-center items-center    ">
        <div className="text-center px-40 md:text-left space-y-6">
          <h1 className="text-nowrap text-5xl lg:text-6xl">
            Mockups 3D <br />
            animados en <br />
            segundos.
          </h1>
          <h2>
            Transforma tus diseños 2D en impresionantes 3D, con efectos de
            viento, animaciones de desplazamiento y exportaciones de vídeo
            fluidas.
          </h2>
          <button className="btn btn-neutral w-[150px]">Crear</button>
        </div>
        {/* img */}
      </div>
      <div className="justify-self-center">
        <img src={camiseta} alt="" className="" />
      </div>
    </div>
  );
}
