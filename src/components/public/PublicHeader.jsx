import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ROUTES } from "../../router/paths";

const navItems = [
  { label: "Inicio", to: ROUTES.home },
  { label: "Propiedades", to: ROUTES.properties },
  { label: "Alquileres", to: ROUTES.rentals },
  { label: "Contacto", to: ROUTES.contact },
];

export function PublicHeader() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const logoMarkSrc = `${import.meta.env.BASE_URL}logo-allianz-mark.png`;
  const logoWordmarkSrc = `${import.meta.env.BASE_URL}logo-allianz-wordmark.png`;

  useEffect(() => {
    setIsExpanded(window.scrollY > 40);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsExpanded(latest > 40);
  });

  return (
    <header className="sticky top-0 z-50 h-20">
      <motion.div
        className="absolute inset-0 border-b border-[#163649]/80 bg-[#041B2C]/95 backdrop-blur"
        animate={
          reduceMotion
            ? {}
            : {
                boxShadow: isExpanded
                  ? "0 10px 30px -20px rgba(2, 10, 22, 0.8)"
                  : "0 0 0 0 rgba(2, 10, 22, 0)",
              }
        }
        transition={{ duration: 0.35, ease: "easeOut" }}
      />

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={
          reduceMotion
            ? { opacity: isExpanded ? 0 : 1 }
            : { opacity: isExpanded ? 0 : 1, y: isExpanded ? -10 : 0, scale: isExpanded ? 0.92 : 1 }
        }
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ pointerEvents: isExpanded ? "none" : "auto" }}
      >
        <Link to={ROUTES.home} className="inline-flex">
          <img src={logoMarkSrc} alt="Allianz Bienes Raices" className="h-12 w-auto" />
        </Link>
      </motion.div>

      <motion.div
        className="absolute inset-0"
        animate={
          reduceMotion
            ? { opacity: isExpanded ? 1 : 0 }
            : { opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 8 }
        }
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ pointerEvents: isExpanded ? "auto" : "none" }}
      >
        <div className="container flex h-20 items-center justify-between">
          <Link to={ROUTES.home} className="flex items-center gap-3">
            <img src={logoMarkSrc} alt="Allianz Bienes Raices" className="h-11 w-auto sm:h-12" />
            <img
              src={logoWordmarkSrc}
              alt=""
              aria-hidden="true"
              className="hidden h-6 w-auto brightness-0 invert sm:block sm:h-7"
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm transition-colors ${
                    isActive ? "text-white" : "text-white/70 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/595981000000"
              target="_blank"
              rel="noreferrer"
              aria-label="Contactar por WhatsApp"
              className="inline-flex h-9 w-9 items-center justify-center border border-white/30 text-white/90 transition hover:border-white md:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M12 4a7 7 0 0 0-6.176 10.3L5 20l5.835-.806A7 7 0 1 0 12 4Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M9.5 10.5c.5 1.5 1.5 2.5 3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </a>
            <a
              href="https://wa.me/595981000000"
              target="_blank"
              rel="noreferrer"
              className="hidden border border-white/30 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:border-white md:inline-flex"
            >
              WhatsApp
            </a>
            <Link
              to={ROUTES.adminLogin}
              aria-label="Ingresar al panel admin"
              className="inline-flex h-9 w-9 items-center justify-center border border-white/30 text-white/90 transition hover:border-white"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </Link>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
