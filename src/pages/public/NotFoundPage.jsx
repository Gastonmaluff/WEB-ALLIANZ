import { AppButton } from "../../components/common/AppButton";
import { ROUTES } from "../../router/paths";

export function NotFoundPage() {
  return (
    <section className="section-wrap pt-32">
      <div className="container max-w-2xl border-fine bg-paper p-10 text-center">
        <p className="mb-3 text-xs uppercase tracking-editorial text-slate">404</p>
        <h1 className="mb-3 font-display text-6xl">Pagina no encontrada</h1>
        <p className="mb-6 text-slate">La ruta solicitada no existe.</p>
        <AppButton to={ROUTES.home}>Volver al inicio</AppButton>
      </div>
    </section>
  );
}
