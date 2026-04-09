import { Link } from "react-router-dom";
import { ROUTES } from "../../router/paths";

export function PublicFooter() {
  const logoMarkSrc = `${import.meta.env.BASE_URL}logo-allianz-mark.png`;
  const logoWordmarkSrc = `${import.meta.env.BASE_URL}logo-allianz-wordmark.png`;

  return (
    <footer className="text-paper">
      <div className="border-t border-paper/10 bg-[#0B182B]">
        <div className="container grid gap-12 py-16 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-5 flex items-center gap-4">
              <img
                src={logoMarkSrc}
                alt="Allianz Bienes Raices"
                className="h-14 w-auto brightness-0 invert"
              />
              <img
                src={logoWordmarkSrc}
                alt=""
                aria-hidden="true"
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="max-w-md text-sm text-stone">
              Curaduria de propiedades residenciales y de inversion para clientes que valoran
              arquitectura, ubicacion y valor patrimonial.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs uppercase tracking-editorial text-stone">Navegacion</p>
            <div className="space-y-2 text-sm">
              <Link className="block text-stone hover:text-paper" to={ROUTES.home}>
                Inicio
              </Link>
              <Link className="block text-stone hover:text-paper" to={ROUTES.properties}>
                Propiedades
              </Link>
              <Link className="block text-stone hover:text-paper" to={ROUTES.rentals}>
                Alquileres
              </Link>
              <Link className="block text-stone hover:text-paper" to={ROUTES.contact}>
                Contacto
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs uppercase tracking-editorial text-stone">Contacto</p>
            <div className="space-y-2 text-sm text-stone">
              <p>+595 981 000000</p>
              <p>hola@allianzbienesraices.com</p>
              <p>Asuncion, Paraguay</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#163649]/80 bg-[#041B2C] py-5">
        <div className="container flex flex-wrap items-center justify-between gap-3 text-xs text-stone">
          <p>(c) 2026 Allianz Bienes Raices. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-paper">
              Privacidad
            </a>
            <a href="#" className="hover:text-paper">
              Terminos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
