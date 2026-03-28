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
import ProviderSignup from "./pages/auth/ProviderSignup";
import ClientDashboard from "./pages/ClientDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import RequestService from "./pages/RequestService";

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
            <Route path="/cadastro/prestador" element={<ProviderSignup />} />
            <Route path="/cliente" element={<ClientDashboard />} />
            <Route path="/cliente/solicitar" element={<RequestService />} />
            <Route path="/prestador" element={<ProviderDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
