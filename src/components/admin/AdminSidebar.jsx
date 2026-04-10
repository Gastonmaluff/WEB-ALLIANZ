import { NavLink } from "react-router-dom";
import { ROUTES } from "../../router/paths";

export const adminNavLinks = [
  { to: ROUTES.adminDashboard, label: "Dashboard" },
  { to: ROUTES.adminProperties, label: "Propiedades" },
  { to: ROUTES.adminTestimonials, label: "Testimonios" },
];

export function AdminSidebar({ onNavigate, compact = false }) {
  const logoMarkSrc = `${import.meta.env.BASE_URL}logo-allianz-mark.png`;
  const logoWordmarkSrc = `${import.meta.env.BASE_URL}logo-allianz-wordmark.png`;

  return (
    <aside className="h-full bg-[#041B2C] text-white">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-5 py-6">
          <div className="flex items-center gap-3">
            <img src={logoMarkSrc} alt="Allianz" className="h-11 w-auto" />
            <img src={logoWordmarkSrc} alt="" aria-hidden="true" className="h-6 w-auto brightness-0 invert" />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-editorial text-white/65">
            Panel privado Allianz
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {adminNavLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.adminDashboard}
              onClick={onNavigate}
              className={({ isActive }) =>
                `block rounded-sm px-3 py-3 text-sm transition ${
                  isActive
                    ? "bg-white/14 text-white"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-[11px] uppercase tracking-editorial text-white/55">Proximamente</p>
          <p className="mt-2 text-sm text-white/70">
            Leads, reportes y automatizaciones comerciales.
          </p>
          {compact ? null : (
            <p className="mt-5 text-xs text-white/45">Allianz Bienes Raices · Admin</p>
          )}
        </div>
      </div>
    </aside>
  );
}
