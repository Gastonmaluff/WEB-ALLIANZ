import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ROUTES } from "../../router/paths";

const navItems = [
  { label: "Inicio", to: ROUTES.home },
  { label: "Propiedades", to: ROUTES.properties },
  { label: "Alquileres", to: ROUTES.rentals },
  { label: "Contacto", to: ROUTES.contact },
];

const SCROLL_RANGE = 80;
const FINAL_LOGO_OFFSET = 10;

export function PublicHeader() {
  const logoAnchorRef = useRef(null);
  const logoIconRef = useRef(null);
  const location = useLocation();
  const [centerOffset, setCenterOffset] = useState(0);
  const [interactive, setInteractive] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const logoMarkSrc = `${import.meta.env.BASE_URL}logo-allianz-mark.png`;
  const logoWordmarkSrc = `${import.meta.env.BASE_URL}logo-allianz-wordmark.png`;

  const logoX = useTransform(scrollY, [0, SCROLL_RANGE], [centerOffset, FINAL_LOGO_OFFSET]);
  const revealOpacity = useTransform(scrollY, [8, SCROLL_RANGE], [0, 1]);
  const revealY = useTransform(scrollY, [0, SCROLL_RANGE], [8, 0]);
  const wordmarkOpacity = useTransform(scrollY, [14, SCROLL_RANGE], [0, 1]);
  const wordmarkX = useTransform(scrollY, [0, SCROLL_RANGE], [-8, 0]);

  useEffect(() => {
    const calculateOffset = () => {
      if (!logoAnchorRef.current || !logoIconRef.current) return;

      const anchorRect = logoAnchorRef.current.getBoundingClientRect();
      const iconWidth = logoIconRef.current.offsetWidth || 0;
      const iconCenterFromLeft = anchorRect.left + iconWidth / 2;
      const viewportCenter = window.innerWidth / 2;
      setCenterOffset(viewportCenter - iconCenterFromLeft);
    };

    calculateOffset();
    window.addEventListener("resize", calculateOffset);
    return () => window.removeEventListener("resize", calculateOffset);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setInteractive(latest > 28);
    setHasScrolled(latest > 12);
  });

  useEffect(() => {
    setInteractive(window.scrollY > 28);
    setHasScrolled(window.scrollY > 12);
  }, []);

  useEffect(() => {
    if (!interactive) setMobileMenuOpen(false);
  }, [interactive]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 h-20">
      <motion.div
        className="absolute inset-0 border-b border-[#163649]/80 bg-[#041B2C]/95 backdrop-blur"
        animate={
          reduceMotion
            ? {}
            : {
                boxShadow:
                  hasScrolled
                    ? "0 12px 30px -22px rgba(2, 10, 22, 0.9)"
                    : "0 0 0 0 rgba(2, 10, 22, 0)",
              }
        }
        transition={{ duration: 0.35, ease: "easeOut" }}
      />

      <div className="relative mx-auto h-20 w-full max-w-[1360px] px-4 md:px-8 xl:px-10">
        <div ref={logoAnchorRef} className="absolute left-2 top-1/2 -translate-y-1/2 md:left-4">
          <motion.div className="relative flex items-center" style={reduceMotion ? {} : { x: logoX }}>
            <Link to={ROUTES.home} aria-label="Ir al inicio" className="inline-flex">
              <img
                ref={logoIconRef}
                src={logoMarkSrc}
                alt="Allianz Bienes Raices"
                className="h-11 w-auto sm:h-12"
              />
            </Link>

            <motion.img
              src={logoWordmarkSrc}
              alt=""
              aria-hidden="true"
              className="ml-2 h-5 w-[148px] object-contain brightness-0 invert sm:ml-3 sm:h-7 sm:w-[178px]"
              style={reduceMotion ? {} : { opacity: wordmarkOpacity, x: wordmarkX }}
            />

            <motion.button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="ml-2 inline-flex h-9 w-9 items-center justify-center border border-white/30 text-white/90 transition hover:border-white lg:hidden"
              style={
                reduceMotion
                  ? { opacity: interactive ? 1 : 0, pointerEvents: interactive ? "auto" : "none" }
                  : { opacity: revealOpacity, y: revealY, pointerEvents: interactive ? "auto" : "none" }
              }
              tabIndex={interactive ? 0 : -1}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                {mobileMenuOpen ? (
                  <path
                    d="M6 6l12 12M18 6l-12 12"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </motion.button>
          </motion.div>
        </div>

        <motion.nav
          className="absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex"
          style={reduceMotion ? {} : { opacity: revealOpacity, y: revealY }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                }`
              }
              style={{ pointerEvents: interactive ? "auto" : "none" }}
              tabIndex={interactive ? 0 : -1}
            >
              {item.label}
            </NavLink>
          ))}
        </motion.nav>

        <motion.div
          className="absolute inset-y-0 right-2 flex items-center gap-3 md:right-4"
          style={reduceMotion ? {} : { opacity: revealOpacity, y: revealY }}
        >
          <a
            href="https://wa.me/595981000000"
            target="_blank"
            rel="noreferrer"
            aria-label="Contactar por WhatsApp"
            className="inline-flex border border-white/30 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white transition hover:border-white md:hidden"
            style={{ pointerEvents: interactive ? "auto" : "none" }}
            tabIndex={interactive ? 0 : -1}
          >
            WhatsApp
          </a>
          <a
            href="https://wa.me/595981000000"
            target="_blank"
            rel="noreferrer"
            className="hidden border border-white/30 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:border-white md:inline-flex"
            style={{ pointerEvents: interactive ? "auto" : "none" }}
            tabIndex={interactive ? 0 : -1}
          >
            WhatsApp
          </a>

          <Link
            to={ROUTES.adminLogin}
            aria-label="Ingresar al panel admin"
            className="inline-flex h-9 w-9 items-center justify-center border border-white/30 text-white/90 transition hover:border-white"
            style={{ pointerEvents: interactive ? "auto" : "none" }}
            tabIndex={interactive ? 0 : -1}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </Link>
        </motion.div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full border-b border-[#163649]/80 bg-[#041B2C]/98 lg:hidden"
          >
            <div className="mx-auto w-full max-w-[1360px] px-4 pb-4 md:px-8 xl:px-10">
              <nav className="grid gap-1 border border-white/15 bg-[#0A2539] p-2">
                {navItems.map((item) => (
                  <NavLink
                    key={`mobile-${item.to}`}
                    to={item.to}
                    className={({ isActive }) =>
                      `px-3 py-3 text-sm transition-colors ${
                        isActive ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
