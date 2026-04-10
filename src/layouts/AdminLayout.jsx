import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminTopbar } from "../components/admin/AdminTopbar";

export function AdminLayout() {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex w-full max-w-[1540px]">
        <aside className="hidden w-72 border-r border-[#163649] lg:block">
          <AdminSidebar />
        </aside>

        <div className="min-w-0 flex-1">
          <AdminTopbar pathname={location.pathname} onToggleSidebar={() => setMobileSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-[1240px] p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <AnimatePresence>
        {mobileSidebarOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Cerrar menu"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute inset-0 bg-[#020A16]/45 backdrop-blur-[1px]"
            />

            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 h-full w-[290px] border-r border-[#163649]"
            >
              <div className="absolute right-3 top-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center border border-white/25 text-white"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path
                      d="M6 6l12 12M18 6l-12 12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <AdminSidebar onNavigate={() => setMobileSidebarOpen(false)} compact />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
