import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Públicas
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const GuestRequestService = lazy(() => import("./pages/GuestRequestService"));

// Auth
const ClientLogin = lazy(() => import("./pages/auth/ClientLogin"));
const ClientSignup = lazy(() => import("./pages/auth/ClientSignup"));
const ProviderLogin = lazy(() => import("./pages/auth/ProviderLogin"));
const ProviderSignup = lazy(() => import("./pages/auth/ProviderSignup"));
const PartnerSignup = lazy(() => import("./pages/auth/PartnerSignup"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));

// Cliente
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const RequestService = lazy(() => import("./pages/RequestService"));
const TrackingService = lazy(() => import("./pages/TrackingService"));
const ClientRequests = lazy(() => import("./pages/ClientRequests"));
const ClientWallet = lazy(() => import("./pages/ClientWallet"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));

// Prestador
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));

// Parceiro
const PartnerDashboard = lazy(() => import("./pages/PartnerDashboard"));

// Admin
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const AdminProviders = lazy(() => import("./pages/admin/AdminProviders"));
const AdminPartners = lazy(() => import("./pages/admin/AdminPartners"));
const AdminRequests = lazy(() => import("./pages/admin/AdminRequests"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminSBWallets = lazy(() => import("./pages/admin/AdminSBWallets"));
const AdminPlans = lazy(() => import("./pages/admin/AdminPlans"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminTicketDetail = lazy(() => import("./pages/admin/AdminTicketDetail"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              {/* Públicas */}
              <Route path="/" element={<Index />} />
              <Route path="/assistencia" element={<GuestRequestService />} />

              {/* Auth */}
              <Route path="/login/cliente" element={<ClientLogin />} />
              <Route path="/cadastro/cliente" element={<ClientSignup />} />
              <Route path="/login/prestador" element={<ProviderLogin />} />
              <Route path="/cadastro/prestador" element={<ProviderSignup />} />
              <Route path="/cadastro/parceiro" element={<PartnerSignup />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Cliente (protegido) */}
              <Route element={<ProtectedRoute allowedRoles={["client"]} redirectTo="/login/cliente" />}>
                <Route path="/cliente" element={<ClientDashboard />} />
                <Route path="/cliente/solicitar" element={<RequestService />} />
                <Route path="/cliente/acompanhar/:requestId" element={<TrackingService />} />
                <Route path="/cliente/solicitacoes" element={<ClientRequests />} />
                <Route path="/cliente/carteira" element={<ClientWallet />} />
                <Route path="/cliente/perfil" element={<ClientProfile />} />
              </Route>

              {/* Prestador (protegido) */}
              <Route element={<ProtectedRoute allowedRoles={["provider"]} redirectTo="/login/prestador" />}>
                <Route path="/prestador" element={<ProviderDashboard />} />
              </Route>

              {/* Parceiro (protegido) */}
              <Route element={<ProtectedRoute allowedRoles={["client"]} redirectTo="/login/cliente" />}>
                <Route path="/parceiro" element={<PartnerDashboard />} />
              </Route>

              {/* Admin (protegido) */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login" />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminHome />} />
                  <Route path="clients" element={<AdminClients />} />
                  <Route path="providers" element={<AdminProviders />} />
                  <Route path="partners" element={<AdminPartners />} />
                  <Route path="requests" element={<AdminRequests />} />
                  <Route path="pricing" element={<AdminPricing />} />
                  <Route path="plans" element={<AdminPlans />} />
                  <Route path="wallets" element={<AdminSBWallets />} />
                  <Route path="support" element={<AdminSupport />} />
                  <Route path="support/:ticketId" element={<AdminTicketDetail />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
