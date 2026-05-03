import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedAdmin } from "@/components/ProtectedAdmin";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { MobileNav } from "@/components/MobileNav";
import Landing from "./pages/Landing.tsx";
import Deck from "./pages/Index.tsx";
import Clients from "./pages/Clients.tsx";
import Websites from "./pages/Websites.tsx";
import Plan from "./pages/Plan.tsx";
import Login from "./pages/Login.tsx";
import UserProfile from "./pages/UserProfile.tsx";
import Admin from "./pages/Admin.tsx";
import Collections from "./pages/Collections.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AnalyticsTracker />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/portfolio" element={<Deck />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/websites" element={<Websites />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/admin" element={<ProtectedAdmin><Admin /></ProtectedAdmin>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MobileNav />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
