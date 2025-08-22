import React, { useState } from "react";
import Inventario from "./Inventario";
import Disenos from "./Disenos";
import Designs from "./Designs";
// import Usuarios from "./Usuarios";

const AdminControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState("inventario");

  const renderContent = () => {
    switch (activeTab) {
      case "inventario":
        return <Inventario />;
      case "disenos":
        return <Disenos />;
      case "designs":
        return <Designs />;
      case "usuarios":
        return <Usuarios />;
      default:
        return <Inventario />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-md flex flex-col">
        <div className="p-4 text-2xl font-bold text-blue-600">AdminPanel</div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("inventario")}
            className={`block w-full text-left px-4 py-2 rounded-lg transition ${
              activeTab === "inventario"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Inventario
          </button>
          <button
            onClick={() => setActiveTab("disenos")}
            className={`block w-full text-left px-4 py-2 rounded-lg transition ${
              activeTab === "disenos"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Diseños
          </button>
          <button
            onClick={() => setActiveTab("designs")}
            className={`block w-full text-left px-4 py-2 rounded-lg transition ${
              activeTab === "designs"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Designs
          </button>
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`block w-full text-left px-4 py-2 rounded-lg transition ${
              activeTab === "usuarios"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Usuarios
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default AdminControl;
