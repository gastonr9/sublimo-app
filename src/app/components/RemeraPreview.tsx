import React from "react";
import remera from "../assets/images/remera.png";
import remeracolor from "../assets/images/remeracolor.png";
import remerahigh from "../assets/images/remerahighlight.png";
import remerablack from "../assets/images/remerablack.png";
import Image from "next/image";

interface Props {
  color: string; // hex del color
  disenoUrl?: string;
}

const RemeraPreview: React.FC<Props> = ({ color, disenoUrl }) => {
  return (
    <div id="remera" className="relative w-40 h-40 mx-auto">
      <div
        className="w-full h-full [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
        style={{
          backgroundColor: color || "#ffffff",
          maskImage: `url(${remeracolor})`,
        }}
      ></div>

      <Image
        src={remera}
        alt="Remera"
        fill
        className="opacity-30 mix-blend-color-burn absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
      ></Image>
      <Image
        src={remerahigh}
        fill
        alt="Remera highlight"
        className="opacity-10 mix-blend-soft-light absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
      ></Image>
      <Image
        fill
        src={remera}
        alt="Remera base"
        className="mix-blend-multiply opacity-100 absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
      ></Image>
      <Image
        fill
        src={remerablack}
        alt="Remera sombra"
        className="opacity-100 mix-blend-screen absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
      ></Image>

      {disenoUrl && (
        <Image
          fill
          src={disenoUrl}
          alt="Diseño aplicado"
          className="absolute z-30 w-full object-contain pointer-events-none"
          style={{
            maxWidth: "70%",
            maxHeight: "50%",
            top: "25%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        ></Image>
      )}
    </div>
  );
};

export default RemeraPreview;
