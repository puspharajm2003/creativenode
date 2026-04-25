import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedAdmin } from "@/components/ProtectedAdmin";
import Landing from "./pages/Landing.tsx";
import Deck from "./pages/Index.tsx";
import Clients from "./pages/Clients.tsx";
import Websites from "./pages/Websites.tsx";
import Login from "./pages/Login.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/portfolio" element={<Deck />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/websites" element={<Websites />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedAdmin><Admin /></ProtectedAdmin>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
