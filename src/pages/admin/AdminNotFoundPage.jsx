import { AppButton } from "../../components/common/AppButton";
import { ROUTES } from "../../router/paths";

export function AdminNotFoundPage() {
  return (
    <section className="admin-card">
      <p className="text-xs uppercase tracking-editorial text-slate">404</p>
      <h1 className="mb-3 font-display text-5xl">Ruta admin no encontrada</h1>
      <p className="mb-4 text-sm text-slate">La seccion solicitada no existe dentro del panel.</p>
      <AppButton to={ROUTES.adminDashboard}>Volver al dashboard</AppButton>
    </section>
  );
}
