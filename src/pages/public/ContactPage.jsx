import { SectionHeading } from "../../components/common/SectionHeading";
import { AppButton } from "../../components/common/AppButton";

export function ContactPage() {
  return (
    <section className="section-wrap pt-32">
      <div className="container grid gap-8 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Contacto"
            title="Asesoria inmobiliaria premium"
            description="Escribinos y un asesor del equipo se comunicara contigo para ayudarte a concretar la mejor operacion."
          />
          <div className="mt-8 space-y-2 text-sm text-slate">
            <p>Telefono: +595 981 000000</p>
            <p>Email: hola@allianzbienesraices.com</p>
            <p>Oficina: Av. Santa Teresa, Asuncion</p>
          </div>
        </div>

        <form className="border-fine bg-paper p-6">
          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Nombre completo"
              className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <input
              type="email"
              placeholder="Correo electronico"
              className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <input
              type="text"
              placeholder="Telefono"
              className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <textarea
              rows="5"
              placeholder="Contanos que tipo de propiedad estas buscando"
              className="border border-stone bg-surface px-4 py-3 text-sm outline-none focus:border-ink"
            />
            <AppButton type="submit">Enviar consulta</AppButton>
          </div>
        </form>
      </div>
    </section>
  );
}
