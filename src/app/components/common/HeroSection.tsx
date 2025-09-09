import Link from "next/link";
import camiseta from "../../assets/images/camiseta.png";
import Image from "next/image";
export default function HeroSection() {
  return (
    <div className=" px-4 grid grid-cols-1 md:grid-cols-2 relative items-center justify-self-center py-10 gap-4  ">
      {/* info */}
      <div className="flex flex-col justify-center items-center justify-self-center w-80 ">
        <div className="text-center  md:text-left space-y-6">
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
          <Link href="generador">
            <button className=" btn-secondary slot w-[150px]">Crear</button>
          </Link>
        </div>
      </div>
      {/* img */}
      <div className="justify-self-center">
        <Image src={camiseta} alt="Sublimo-app"></Image>
      </div>
    </div>
  );
}
