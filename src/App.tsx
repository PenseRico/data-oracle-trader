import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import MarketPage from "./pages/MarketPage.tsx";
import CoinDetail from "./pages/CoinDetail.tsx";
import BuySignals from "./pages/BuySignals.tsx";
import SellSignals from "./pages/SellSignals.tsx";
import CommunityPage from "./pages/CommunityPage.tsx";
import AlertsPage from "./pages/AlertsPage.tsx";
import AcademyPage from "./pages/AcademyPage.tsx";
import MonitorPage from "./pages/MonitorPage.tsx";

const queryClient = new QueryClient();

function ProtectedDashboard({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<ProtectedDashboard><Dashboard /></ProtectedDashboard>} />
            <Route path="/dashboard/market" element={<ProtectedDashboard><MarketPage /></ProtectedDashboard>} />
            <Route path="/dashboard/monitor" element={<ProtectedDashboard><MonitorPage /></ProtectedDashboard>} />
            <Route path="/dashboard/charts" element={<ProtectedDashboard><Dashboard /></ProtectedDashboard>} />
            <Route path="/dashboard/rsi-filters" element={<ProtectedDashboard><MarketPage /></ProtectedDashboard>} />
            <Route path="/dashboard/buy-signals" element={<ProtectedDashboard><BuySignals /></ProtectedDashboard>} />
            <Route path="/dashboard/sell-signals" element={<ProtectedDashboard><SellSignals /></ProtectedDashboard>} />
            <Route path="/dashboard/moving-averages" element={<ProtectedDashboard><MarketPage /></ProtectedDashboard>} />
            <Route path="/dashboard/alerts" element={<ProtectedDashboard><AlertsPage /></ProtectedDashboard>} />
            <Route path="/dashboard/setups" element={<ProtectedDashboard><Dashboard /></ProtectedDashboard>} />
            <Route path="/dashboard/news" element={<ProtectedDashboard><Dashboard /></ProtectedDashboard>} />
            <Route path="/dashboard/community" element={<ProtectedDashboard><CommunityPage /></ProtectedDashboard>} />
            <Route path="/dashboard/academy" element={<ProtectedDashboard><AcademyPage /></ProtectedDashboard>} />
            <Route path="/dashboard/coin/:coinId" element={<ProtectedDashboard><CoinDetail /></ProtectedDashboard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
