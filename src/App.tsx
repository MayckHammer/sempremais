import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClientLogin from "./pages/auth/ClientLogin";
import ClientSignup from "./pages/auth/ClientSignup";
import ProviderLogin from "./pages/auth/ProviderLogin";

import ClientDashboard from "./pages/ClientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import RequestService from "./pages/RequestService";
import TrackingService from "./pages/TrackingService";
import ClientRequests from "./pages/ClientRequests";
import GuestRequestService from "./pages/GuestRequestService";
import ClientWallet from "./pages/ClientWallet";
import ClientProfile from "./pages/ClientProfile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminClients from "./pages/admin/AdminClients";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminSBWallets from "./pages/admin/AdminSBWallets";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login/cliente" element={<ClientLogin />} />
            <Route path="/cadastro/cliente" element={<ClientSignup />} />
            <Route path="/login/prestador" element={<ProviderLogin />} />
            
            <Route path="/cliente" element={<ClientDashboard />} />
            <Route path="/cliente/solicitar" element={<RequestService />} />
            <Route path="/cliente/acompanhar/:requestId" element={<TrackingService />} />
            <Route path="/prestador" element={<ProviderDashboard />} />
            <Route path="/cliente/solicitacoes" element={<ClientRequests />} />
            <Route path="/cliente/carteira" element={<ClientWallet />} />
            <Route path="/cliente/perfil" element={<ClientProfile />} />
            <Route path="/assistencia" element={<GuestRequestService />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="providers" element={<AdminProviders />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="pricing" element={<AdminPricing />} />
              <Route path="plans" element={<AdminPlans />} />
              <Route path="wallets" element={<AdminSBWallets />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
