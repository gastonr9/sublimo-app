import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Generador from "./pages/Generador";
import Articulos from "./pages/Articulos";
import Burgon from "./pages/Burgon";
import Login from "./pages/Login";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generador" element={<Generador />} />
        <Route path="/articulos" element={<Articulos />} />
        <Route path="/burgon" element={<Burgon />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
