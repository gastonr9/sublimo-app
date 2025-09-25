import React from "react";
import remera from "../assets/images/remera.png";
import remeracolor from "../assets/images/remeracolor.png";
import remerahigh from "../assets/images/remerahighlight.png";
import remerablack from "../assets/images/remerablack.png";
import Image from "next/image";

interface Props {
  color: string; // hex del color
  estampaUrl?: string;
}

const RemeraPreview: React.FC<Props> = ({ color, estampaUrl }) => {
  return (
    <div id="remera" className="relative w-40 h-40 mx-auto">
      <div
        className="w-full h-full absolute inset-0"
        style={{
          backgroundColor: color,
          maskImage: `url(${remeracolor.src})`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
        }}
      ></div>

      <Image
        src={remera}
        alt="Remera"
        fill
        className="opacity-30 mix-blend-color-burn absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
      />
      <Image
        src={remerahigh}
        fill
        alt="Remera highlight"
        className="opacity-10 mix-blend-soft-light absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
      />
      <Image
        fill
        src={remera}
        alt="Remera base"
        className="mix-blend-multiply opacity-100 absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
      />
      <Image
        fill
        src={remerablack}
        alt="Remera sombra"
        className="opacity-100 mix-blend-screen absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
      />

      {estampaUrl && (
        <Image
          fill
          src={estampaUrl}
          alt="Estampa aplicado"
          className="absolute z-30 w-full object-contain pointer-events-none"
          style={{
            maxWidth: "70%",
            maxHeight: "50%",
            top: "25%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      )}
    </div>
  );
};

export default RemeraPreview;
