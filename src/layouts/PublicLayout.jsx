import { Outlet } from "react-router-dom";
import { PublicHeader } from "../components/public/PublicHeader";
import { PublicFooter } from "../components/public/PublicFooter";
import { ScrollToTop } from "../router/ScrollToTop";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <ScrollToTop />
      <PublicHeader />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
