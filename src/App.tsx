import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/SearchPage";
import PropertyPage from "./pages/PropertyPage";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminPropertiesPage from "./pages/Admin/AdminPropertyPage";
import AdminReviewsPage from "./pages/Admin/AdminReviewsPage";
import AdminLocationPage from "./pages/Admin/AdminLocationPage";
import AdminPropertyTypePage from "./pages/Admin/AdminPropertyTypePage";

import AdminSetupPage from "./pages/Admin/AdminSetupPage";
import AdminStatisticsPage from "./pages/Admin/AdminStatisticsPage";
import AdminTestimonialsPage from "./pages/Admin/AdminTestimonialsPage";
import AdminCategoryPage from "./pages/Admin/AdminCategoryPage";
import { PropertyProvider } from "./contexts/PropertyContext";
// import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import FloatingContactIcons from "./components/FloatingContactIcons";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PropertyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
              <Route index element={<AdminDashboardPage />} />
              <Route path="properties" element={<AdminPropertiesPage />} />
              <Route path="locations" element={<AdminLocationPage />} />
              <Route
                path="property-types"
                element={<AdminPropertyTypePage />}
              />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="setup" element={<AdminSetupPage />} />
              <Route path="statistics" element={<AdminStatisticsPage />} />
              <Route path="testimonials" element={<AdminTestimonialsPage />} />
              {/* <Route path="users" element={<AdminUsersPage />} /> */}
              <Route path="categories" element={<AdminCategoryPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PropertyProvider>
  </QueryClientProvider>
);

export default App;
