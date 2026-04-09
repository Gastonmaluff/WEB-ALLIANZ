import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { HomePage } from "../pages/public/HomePage";
import { PropertiesPage } from "../pages/public/PropertiesPage";
import { PropertyDetailPage } from "../pages/public/PropertyDetailPage";
import { ContactPage } from "../pages/public/ContactPage";
import { NotFoundPage } from "../pages/public/NotFoundPage";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminPropertiesPage } from "../pages/admin/AdminPropertiesPage";
import { AdminPropertyFormPage } from "../pages/admin/AdminPropertyFormPage";
import { AdminTestimonialsPage } from "../pages/admin/AdminTestimonialsPage";
import { AdminNotFoundPage } from "../pages/admin/AdminNotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "propiedades", element: <PropertiesPage /> },
      { path: "propiedades/:slug", element: <PropertyDetailPage /> },
      { path: "contacto", element: <ContactPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "propiedades", element: <AdminPropertiesPage /> },
          { path: "propiedades/nueva", element: <AdminPropertyFormPage /> },
          { path: "propiedades/:slug/editar", element: <AdminPropertyFormPage /> },
          { path: "testimonios", element: <AdminTestimonialsPage /> },
          { path: "*", element: <AdminNotFoundPage /> },
        ],
      },
    ],
  },
]);
