import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";
import { ROUTES } from "../../router/paths";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginMock } = useAuthSession();
  const [form, setForm] = useState({ email: "", password: "" });

  const logoMarkSrc = `${import.meta.env.BASE_URL}logo-allianz-mark.png`;
  const logoWordmarkSrc = `${import.meta.env.BASE_URL}logo-allianz-wordmark.png`;

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    loginMock(form.email || "admin@allianz.com");
    navigate(ROUTES.adminDashboard);
  };

  return (
    <section className="min-h-screen bg-surface">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] lg:grid-cols-2">
        <article className="hidden border-r border-[#163649]/35 bg-[#041B2C] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-4">
            <img src={logoMarkSrc} alt="Allianz" className="h-14 w-auto" />
            <img src={logoWordmarkSrc} alt="" aria-hidden="true" className="h-8 w-auto brightness-0 invert" />
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-editorial text-white/70">Panel privado</p>
            <h1 className="max-w-lg font-display text-6xl leading-[0.95]">
              Gestion premium para Allianz Bienes Raices.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70">
              Acceso exclusivo para administrar propiedades, testimonios y contenido destacado del
              sitio.
            </p>
          </div>

          <p className="text-xs text-white/55">Uso interno · Allianz Bienes Raices</p>
        </article>

        <div className="flex items-center justify-center p-5 sm:p-8">
          <form onSubmit={onSubmit} className="w-full max-w-lg border-fine bg-paper p-6 sm:p-10">
            <div className="mb-8 flex items-center gap-4 lg:hidden">
              <img src={logoMarkSrc} alt="Allianz" className="h-12 w-auto" />
              <img src={logoWordmarkSrc} alt="" aria-hidden="true" className="h-7 w-auto" />
            </div>

            <p className="mb-2 text-xs uppercase tracking-editorial text-slate">Acceso privado</p>
            <h2 className="mb-6 font-display text-5xl leading-none text-ink">Iniciar sesion</h2>

            <div className="grid gap-4">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-editorial text-slate">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={onChange}
                  className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none transition focus:border-ink"
                  placeholder="admin@allianz.com"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-editorial text-slate">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={onChange}
                  className="w-full border border-stone bg-surface px-4 py-3 text-sm outline-none transition focus:border-ink"
                  placeholder="********"
                />
              </label>

              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center bg-[#041B2C] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#163649]"
              >
                Ingresar al panel
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
