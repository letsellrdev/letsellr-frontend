import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/SearchPage";
import PropertyPage from "./pages/PropertyPage";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminPropertiesPage from "./pages/Admin/AdminPropertyPage";
import AdminPropertyFormPage from "./pages/Admin/AdminPropertyFormPage";
import AdminReviewsPage from "./pages/Admin/AdminReviewsPage";
import AdminLocationPage from "./pages/Admin/AdminLocationPage";
import AdminPropertyTypePage from "./pages/Admin/AdminPropertyTypePage";

import AdminSetupPage from "./pages/Admin/AdminSetupPage";
import AdminTestimonialsPage from "./pages/Admin/AdminTestimonialsPage";
import AdminCategoryPage from "./pages/Admin/AdminCategoryPage";
import AdminRegistrationPage from "./pages/Admin/AdminRegistrationPage";
import { PropertyProvider } from "./contexts/PropertyContext";
import FloatingContactIcons from "./components/FloatingContactIcons";
import { useSeoPreload } from "./hooks/useSeoPreload";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

const adminOnlyRoles = ["superadmin", "admin"];
const superAdminOnlyRoles = ["superadmin"];
const allAdminRoles = ["superadmin", "admin", "manager"];

const App = () => (
  useSeoPreload(),
  <PropertyProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter>
        <FloatingContactIcons />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/property/:propertyId" element={<PropertyPage />} />

          {/* Admin Layout with Nested Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={
              <RoleProtectedRoute allowedRoles={allAdminRoles}>
                <AdminDashboardPage />
              </RoleProtectedRoute>
            } />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="properties/add" element={<AdminPropertyFormPage />} />
            <Route path="properties/edit/:id" element={<AdminPropertyFormPage />} />
            <Route path="locations" element={
              <RoleProtectedRoute allowedRoles={adminOnlyRoles}>
                <AdminLocationPage />
              </RoleProtectedRoute>
            } />
            <Route
              path="property-types"
              element={
                <RoleProtectedRoute allowedRoles={adminOnlyRoles}>
                  <AdminPropertyTypePage />
                </RoleProtectedRoute>
              }
            />
            <Route path="reviews" element={
              <RoleProtectedRoute allowedRoles={allAdminRoles}>
                <AdminReviewsPage />
              </RoleProtectedRoute>
            } />
            <Route path="setup" element={
              <RoleProtectedRoute allowedRoles={adminOnlyRoles}>
                <AdminSetupPage />
              </RoleProtectedRoute>
            } />

            <Route path="testimonials" element={
              <RoleProtectedRoute allowedRoles={allAdminRoles}>
                <AdminTestimonialsPage />
              </RoleProtectedRoute>
            } />
            <Route path="categories" element={
              <RoleProtectedRoute allowedRoles={adminOnlyRoles}>
                <AdminCategoryPage />
              </RoleProtectedRoute>
            } />
            <Route path="register" element={
              <RoleProtectedRoute allowedRoles={superAdminOnlyRoles}>
                <AdminRegistrationPage />
              </RoleProtectedRoute>
            } />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </PropertyProvider>
);

export default App;
