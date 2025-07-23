// components/ColorPicker.tsx
import React from "react";

type Props = {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
};

const ColorPicker = ({ selectedColor, setSelectedColor }: Props) => {
  return (
    <div className="flex flex-col items-start gap-2">
      <label htmlFor="colorPicker" className="font-medium">
        Elegí un color:
      </label>
      <input
        id="colorPicker"
        type="color"
        value={selectedColor}
        onChange={(e) => setSelectedColor(e.target.value)}
        className="w-10 h-10 border-none outline-none cursor-pointer"
      />
    </div>
  );
};

export default ColorPicker;
