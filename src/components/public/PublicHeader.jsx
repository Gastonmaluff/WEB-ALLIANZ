import { Link, NavLink } from "react-router-dom";
import { ROUTES } from "../../router/paths";

const navItems = [
  { label: "Inicio", to: ROUTES.home },
  { label: "Propiedades", to: ROUTES.properties },
  { label: "Contacto", to: ROUTES.contact },
];

export function PublicHeader() {
  const logoMarkSrc = `${import.meta.env.BASE_URL}logo-allianz-mark.png`;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-stone/70 bg-paper/90 backdrop-blur">
      <div className="container flex h-20 items-center justify-between">
        <Link to={ROUTES.home} className="flex items-center">
          <img src={logoMarkSrc} alt="Allianz Bienes Raices" className="h-12 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${isActive ? "text-ink" : "text-slate hover:text-ink"}`
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
            className="hidden border border-stone px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-ink transition hover:border-ink md:inline-flex"
          >
            WhatsApp
          </a>
          <Link
            to={ROUTES.adminLogin}
            aria-label="Ingresar al panel admin"
            className="inline-flex h-9 w-9 items-center justify-center border border-stone text-ink transition hover:border-ink"
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
