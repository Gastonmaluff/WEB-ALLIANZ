import { Link, NavLink } from "react-router-dom";
import { ROUTES } from "../../router/paths";

const navItems = [
  { label: "Inicio", to: ROUTES.home },
  { label: "Propiedades", to: ROUTES.properties },
  { label: "Contacto", to: ROUTES.contact },
];

export function PublicHeader() {
  const logoMarkSrc = `${import.meta.env.BASE_URL}logo-allianz-mark.png`;
  const logoWordmarkSrc = `${import.meta.env.BASE_URL}logo-allianz-wordmark.png`;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#163649]/80 bg-[#041B2C]/95 backdrop-blur">
      <div className="container flex h-20 items-center justify-between">
        <Link to={ROUTES.home} className="flex items-center gap-3">
          <img src={logoMarkSrc} alt="Allianz Bienes Raices" className="h-11 w-auto sm:h-12" />
          <img
            src={logoWordmarkSrc}
            alt=""
            aria-hidden="true"
            className="h-6 w-auto brightness-0 invert sm:h-7"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/595981000000"
            target="_blank"
            rel="noreferrer"
            className="hidden border border-white/30 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:border-white md:inline-flex"
          >
            WhatsApp
          </a>
          <Link
            to={ROUTES.adminLogin}
            aria-label="Ingresar al panel admin"
            className="inline-flex h-9 w-9 items-center justify-center border border-white/30 text-white/90 transition hover:border-white"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
