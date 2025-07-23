// components/Sidebar.tsx
import React from "react";
import ColorPicker from "./ColorPicker";

type Props = {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
};

const Sidebar = ({ selectedColor, setSelectedColor }: Props) => {
  return (
    <aside className="fixed top-20 left-0 w-60 p-4 bg-white shadow-lg z-50">
      <h2 className="text-xl font-bold mb-4">Personalización</h2>
      <ColorPicker
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />
    </aside>
  );
};

export default Sidebar;
