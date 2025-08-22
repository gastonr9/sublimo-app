import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Generador from "./pages/Generador";
import Articulos from "./pages/Articulos";
import Burgon from "./components/SelectProductSection";
import Login from "./pages/Login";
import Inventario from "./components/Inventario";
import Panel from "./components/AdminControl";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generador" element={<Generador />} />
        <Route path="/articulos" element={<Articulos />} />
        <Route path="/burgon" element={<Burgon />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inventario" element={  <Inventario />} />
        <Route path="/panel" element={  <Panel />} />
      </Routes>
    </>
  );
}

export default App;
