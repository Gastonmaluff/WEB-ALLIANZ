import { AppButton } from "../common/AppButton";

export function ContactSection() {
  return (
    <section className="section-wrap bg-ink text-paper">
      <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-editorial text-stone">Asesoria personalizada</p>
          <h2 className="mb-4 font-display text-5xl leading-[0.95]">Conversemos sobre tu proxima propiedad</h2>
          <p className="max-w-lg text-sm leading-relaxed text-stone md:text-base">
            Te acompaniamos en todo el proceso: seleccion, visita, negociacion y cierre.
          </p>
        </div>

        <form className="grid gap-3 border border-paper/20 p-6">
          <input
            type="text"
            placeholder="Nombre"
            className="border border-paper/20 bg-transparent px-4 py-3 text-sm text-paper outline-none placeholder:text-stone focus:border-paper"
          />
          <input
            type="email"
            placeholder="Email"
            className="border border-paper/20 bg-transparent px-4 py-3 text-sm text-paper outline-none placeholder:text-stone focus:border-paper"
          />
          <textarea
            rows="4"
            placeholder="Mensaje"
            className="border border-paper/20 bg-transparent px-4 py-3 text-sm text-paper outline-none placeholder:text-stone focus:border-paper"
          />
          <AppButton variant="light" type="submit">
            Solicitar contacto
          </AppButton>
        </form>
      </div>
    </section>
  );
}
