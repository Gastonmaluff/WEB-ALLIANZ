import { NavLink } from "react-router-dom";
import { ROUTES } from "../../router/paths";

const links = [
  { to: ROUTES.adminDashboard, label: "Dashboard" },
  { to: ROUTES.adminProperties, label: "Propiedades" },
  { to: ROUTES.adminTestimonials, label: "Testimonios" },
];

export function AdminSidebar() {
  return (
    <aside className="w-full border-b border-stone bg-paper p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <p className="mb-6 font-display text-3xl">Allianz Admin</p>
      <nav className="grid gap-2">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.adminDashboard}
            className={({ isActive }) =>
              `px-3 py-2 text-sm transition ${isActive ? "bg-ink text-paper" : "text-slate hover:bg-surface"}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
