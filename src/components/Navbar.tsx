import logo from "/sublimo.svg";

function Navbar() {
  return (
    <header className="mb-2 px-4 shadow">
      <div className="relative mx-auto flex max-w-screen-lg flex-col py-4 sm:flex-row sm:items-center sm:justify-between">
        <img className="flex items-center " src={logo} alt="" width="55px" />
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
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 6l16 0" />
            <path d="M4 12l16 0" />
            <path d="M4 18l16 0" />
          </svg>
        </label>
        <nav
          aria-label="Header Navigation"
          className="peer-checked:block hidden pl-2 py-6 sm:block sm:py-0"
        >
          <div className="flex flex-col gap-y-4 sm:flex-row sm:gap-x-8 items-center">
            <a className="text-gray-600 hover:text-blue-600" href="#">
              Generador Mockup 3D
            </a>
            <a className="text-gray-600 hover:text-blue-600" href="#">
              Articulos
            </a>
            <a className="text-gray-600 hover:text-blue-600" href="#">
              Burgon
            </a>
            <div className="mt-2 sm:mt-0">
              <a className=" btn" href="#">
                Acceder
              </a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
