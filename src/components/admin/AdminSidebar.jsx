import { NavLink } from "react-router-dom";
import { ROUTES } from "../../router/paths";

export const adminNavLinks = [
  {
    to: ROUTES.adminDashboard,
    label: "Resumen general",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M4 5h7v6H4V5Zm9 0h7v4h-7V5ZM4 13h7v6H4v-6Zm9-2h7v8h-7v-8Z" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    to: ROUTES.adminHero,
    label: "Portada",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M4 7h16M4 17h10M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: ROUTES.adminProperties,
    label: "Propiedades",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M4 20V9l8-5 8 5v11M9 20v-5h6v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: ROUTES.adminTestimonials,
    label: "Testimonios",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M5 6h14v10H8l-3 3V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function AdminSidebar({ onNavigate, compact = false }) {
  const logoMarkSrc = `${import.meta.env.BASE_URL}logo-allianz-mark.png`;
  const logoWordmarkSrc = `${import.meta.env.BASE_URL}logo-allianz-wordmark.png`;

  return (
    <aside className="h-full bg-gradient-to-b from-[#051F33] via-[#041B2C] to-[#041728] text-white">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-white/10 px-5 py-6">
          <div className="rounded-sm border border-white/10 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-3">
              <img src={logoMarkSrc} alt="Allianz" className="h-11 w-auto" />
              <img src={logoWordmarkSrc} alt="" aria-hidden="true" className="h-6 w-auto brightness-0 invert" />
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-editorial text-white/65">
              Panel privado Allianz
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4">
          <p className="px-3 text-[11px] uppercase tracking-editorial text-white/45">Navegacion</p>
          {adminNavLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.adminDashboard}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-sm border px-3 py-3 text-sm transition ${
                  isActive
                    ? "border-white/20 bg-white/14 text-white shadow-[0_14px_30px_-22px_rgba(0,0,0,0.75)]"
                    : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/8 hover:text-white"
                }`
              }
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-white/15 bg-white/[0.03] text-white/75 group-hover:text-white">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="rounded-sm border border-white/10 bg-white/[0.02] px-4 py-4">
            <p className="text-[11px] uppercase tracking-editorial text-white/55">Proximamente</p>
            <p className="mt-2 text-sm text-white/70">
              Leads, reportes y automatizaciones comerciales.
            </p>
          </div>
          {compact ? null : (
            <p className="mt-5 text-xs text-white/45">Allianz Bienes Raices - Admin</p>
          )}
        </div>
      </div>
    </aside>
  );
}

