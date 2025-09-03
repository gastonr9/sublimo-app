import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Generador from "./pages/Generador";
import Burgon from "./components/Burgon";
import Login from "./pages/Login";
import Panel from "./components/AdminControl";
import Header from "./components/common/Header";
import PublicRoute from "./components/PublicRoute";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generador" element={<Generador />} />
        {/* <Route path="/articulos" element={<Articulos />} /> */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protegidas */}
        <Route
          path="/burgon"
          element={
            <PrivateRoute rolesPermitidos={["master", "empleado"]}>
              <Burgon />
            </PrivateRoute>
          }
        />
        <Route
          path="/panel/*"
          element={
            <PrivateRoute rolesPermitidos={["master", "empleado"]}>
              <Panel />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
