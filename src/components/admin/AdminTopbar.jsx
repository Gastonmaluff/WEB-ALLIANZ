import { useNavigate } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";
import { AppButton } from "../common/AppButton";
import { ROUTES } from "../../router/paths";

export function AdminTopbar() {
  const navigate = useNavigate();
  const { user, logoutMock } = useAuthSession();

  const handleLogout = () => {
    logoutMock();
    navigate(ROUTES.adminLogin);
  };

  return (
    <header className="border-b border-stone bg-paper px-4 py-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-editorial text-slate">Panel privado</p>
          <p className="text-sm text-ink">{user?.email}</p>
        </div>
        <AppButton variant="ghost" onClick={handleLogout} className="px-4 py-2">
          Cerrar sesion
        </AppButton>
      </div>
    </header>
  );
}
