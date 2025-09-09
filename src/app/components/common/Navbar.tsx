import Link from "next/link";
import logo from "../../assets/sublimo.svg";
import Image from "next/image";

function Navbar() {
  return (
    <header className="relative w-full z-50 bg-white shadow-md">
      <div className="relative mx-auto flex max-w-screen-lg flex-col py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="contents">
          <Image
            src={logo}
            className="flex items-center"
            alt="sublimo-logo"
            width="55"
          ></Image>
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
          <ul className="flex flex-col gap-y-4 sm:flex-row sm:gap-x-8 items-center">
            <li>
              <Link
                href="generador"
                className="text-gray-600 hover:text-blue-600"
              >
                Generador Mockup 3D
              </Link>
            </li>
            <li>
              <Link href="burgon" className="text-gray-600 hover:text-blue-600">
                Burgon
              </Link>
            </li>
            <li>
              {" "}
              <Link href="/panel" className="text-gray-600 hover:text-blue-600">
                Panel
              </Link>
            </li>
            <li>
              <Link href="/login" className="btn-secondary slot ">
                Acceder
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
