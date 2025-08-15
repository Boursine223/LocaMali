import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ClientRegistration from "./pages/ClientRegistration";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AddVendeur from "./pages/AddVendeur";
import ClientsList from "./pages/ClientsList";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const queryClient = new QueryClient();

const App = () => {
  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const [status, setStatus] = useState<'loading' | 'ok' | 'no'>('loading');
    useEffect(() => {
      let mounted = true;
      api.get('/session')
        .then(() => mounted && setStatus('ok'))
        .catch(() => mounted && setStatus('no'));
      return () => { mounted = false };
    }, []);
    if (status === 'loading') return <div />; // minimal skeleton
    return status === 'ok' ? children : <Navigate to="/admin/login" replace />;
  };
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/localiser/:lienUnique" element={<ClientRegistration />} />
            <Route path="/l/:lienUnique" element={<ClientRegistration />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/add" element={<ProtectedRoute><AddVendeur /></ProtectedRoute>} />
            <Route path="/admin/clients" element={<ProtectedRoute><ClientsList /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
