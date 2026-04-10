import { useNavigate } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";
import { ROUTES } from "../../router/paths";

const pageMap = [
  { key: "/admin/propiedades/nueva", label: "Nueva Propiedad" },
  { key: "/admin/propiedades/", label: "Editar Propiedad" },
  { key: "/admin/propiedades", label: "Propiedades" },
  { key: "/admin/testimonios", label: "Testimonios" },
  { key: "/admin", label: "Dashboard" },
];

function resolveTitle(pathname) {
  return pageMap.find((item) => pathname.startsWith(item.key))?.label || "Panel Admin";
}

export function AdminTopbar({ pathname, onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, logoutMock } = useAuthSession();
  const pageTitle = resolveTitle(pathname);

  const handleLogout = () => {
    logoutMock();
    navigate(ROUTES.adminLogin);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-stone/70 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center border border-stone bg-white text-ink lg:hidden"
            aria-label="Abrir menu de navegacion"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div>
            <p className="text-[11px] uppercase tracking-editorial text-slate">Panel privado</p>
            <h1 className="text-lg font-semibold text-ink md:text-xl">{pageTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs uppercase tracking-editorial text-slate">Usuario</p>
            <p className="text-sm text-ink">{user?.displayName || user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center justify-center gap-2 border border-stone bg-white px-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:border-ink"
          >
            <span className="hidden sm:inline">Cerrar sesion</span>
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M9 4H5v16h4M14 8l5 4-5 4M19 12H9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
