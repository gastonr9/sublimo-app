import Link from "next/link";
import camiseta from "../../assets/images/camiseta.png";
import Image from "next/image";
export default function HeroSection() {
  return (
    <div className=" px-4 grid grid-cols-1 md:grid-cols-2 relative items-center justify-self-center py-10 gap-4  ">
      {/* info */}
      <div className="flex flex-col justify-center items-center justify-self-center w-80 ">
        <div className="text-center  md:text-left gap-5">
          <h1 className="text-nowrap text-5xl lg:text-6xl">
            Personalizá. <br />
            Visualizá <br />
            Imprimí.
          </h1>
          <h2 className="my-5">
            Crea tus diseños y miralos en tiempo real sobre prendas 3D antes de
            producirlos. Ahorra tiempo y mostrale a tus clientes exactamente
            cómo quedará el resultado final.
          </h2>
          <Link href="generador" className="">
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
