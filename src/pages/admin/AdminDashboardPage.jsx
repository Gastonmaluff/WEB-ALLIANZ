import { MetricCard } from "../../components/admin/MetricCard";
import { MOCK_PROPERTIES } from "../../mocks/properties";
import { MOCK_TESTIMONIALS } from "../../mocks/testimonials";

export function AdminDashboardPage() {
  const available = MOCK_PROPERTIES.filter((item) => item.estado === "disponible").length;
  const featured = MOCK_PROPERTIES.filter((item) => item.destacadaEnPortada).length;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-editorial text-slate">Resumen</p>
        <h1 className="font-display text-5xl">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Propiedades" value={MOCK_PROPERTIES.length} />
        <MetricCard title="Disponibles" value={available} />
        <MetricCard title="En portada" value={featured} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="admin-card">
          <h2 className="mb-4 font-display text-3xl">Estado rapido</h2>
          <ul className="space-y-2 text-sm text-slate">
            <li>Testimonios cargados: {MOCK_TESTIMONIALS.length}</li>
            <li>Publicaciones nuevas este mes: 4</li>
            <li>Pendientes de revision: 2</li>
          </ul>
        </article>

        <article className="admin-card">
          <h2 className="mb-4 font-display text-3xl">Siguiente paso</h2>
          <p className="text-sm text-slate">
            Conectar `useAuthSession` con Firebase Auth y reemplazar los mocks por consultas de
            Firestore.
          </p>
        </article>
      </div>
    </section>
  );
}
