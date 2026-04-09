import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminTopbar } from "../components/admin/AdminTopbar";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface md:flex">
      <AdminSidebar />
      <div className="flex-1">
        <AdminTopbar />
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
