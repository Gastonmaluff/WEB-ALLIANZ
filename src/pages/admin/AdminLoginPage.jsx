import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";
import { ROUTES } from "../../router/paths";
import { AppButton } from "../../components/common/AppButton";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginMock } = useAuthSession();
  const [form, setForm] = useState({ email: "", password: "" });

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
    <section className="flex min-h-screen items-center justify-center bg-surface p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md border-fine bg-paper p-8">
        <p className="mb-2 text-xs uppercase tracking-editorial text-slate">Panel admin</p>
        <h1 className="mb-6 font-display text-5xl">Iniciar sesion</h1>
        <div className="grid gap-3">
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={onChange}
            placeholder="Email"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <AppButton type="submit" className="w-full">
            Entrar
          </AppButton>
        </div>
      </form>
    </section>
  );
}
