import React from "react";
import remera from "/public/images/remera.png";
import remeracolor from "/public/images/remeracolor.png";
import remerahigh from "/public/images/remerahighlight.png";
import remerablack from "/public/images/remerablack.png";

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

      <img
        src={remera}
        alt="Remera"
        className="opacity-30 mix-blend-color-burn absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
      />
      <img
        src={remerahigh}
        alt="Remera highlight"
        className="opacity-10 mix-blend-soft-light absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
      />
      <img
        src={remera}
        alt="Remera base"
        className="mix-blend-multiply opacity-100 absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
      />
      <img
        src={remerablack}
        alt="Remera sombra"
        className="opacity-100 mix-blend-screen absolute inset-0 z-20 w-full h-full object-contain pointer-events-none"
      />

      {disenoUrl && (
        <img
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
        />
      )}
    </div>
  );
};

export default RemeraPreview;
