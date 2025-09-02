import { Link, useNavigate } from "react-router-dom";
import logo from "/sublimo.svg";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="relative w-full z-50 bg-white shadow-md">
      <div className="relative mx-auto flex max-w-screen-lg flex-col py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="contents">
          <img
            className="flex items-center"
            src={logo}
            alt="sublimo-logo"
            width="55px"
          />
        </Link>

        {/* Botón hamburguesa móvil */}
        <input className="peer hidden" type="checkbox" id="navbar-open" />
        <label
          className="self-end top-7 absolute cursor-pointer text-xl sm:hidden"
          htmlFor="navbar-open"
        >
          <span className="sr-only">Alternar navegación</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000000"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6l16 0" />
            <path d="M4 12l16 0" />
            <path d="M4 18l16 0" />
          </svg>
        </label>

        {/* Navegación */}
        <nav
          aria-label="Header Navigation"
          className="peer-checked:block hidden pl-2 py-6 sm:block sm:py-0"
        >
          <div className="flex flex-col gap-y-4 sm:flex-row sm:gap-x-8 items-center">
            <Link to="/generador" className="text-gray-600 hover:text-blue-600">
              Generador Mockup 3D
            </Link>
            {/* <Link to="/articulos" className="text-gray-600 hover:text-blue-600">
              Artículos
            </Link> */}

            {/* Solo master o empleado pueden ver Burgon y Panel */}
            {(role === "master" || role === "empleado") && (
              <>
                <Link
                  to="/burgon"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Burgon
                </Link>
                <Link to="/panel" className="text-gray-600 hover:text-blue-600">
                  Panel
                </Link>
              </>
            )}

            {/* Botón Acceder o menú de usuario */}
            <div className="mt-2 sm:mt-0">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 text-sm">
                    {user.email} ({role})
                  </span>
                  <button onClick={handleLogout} className=" btn slot">
                    Salir
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn">
                  Acceder
                </Link>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
