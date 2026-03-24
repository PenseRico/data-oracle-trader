import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/market" element={<MarketPage />} />
          <Route path="/dashboard/monitor" element={<MonitorPage />} />
          <Route path="/dashboard/charts" element={<Dashboard />} />
          <Route path="/dashboard/rsi-filters" element={<MarketPage />} />
          <Route path="/dashboard/buy-signals" element={<BuySignals />} />
          <Route path="/dashboard/sell-signals" element={<SellSignals />} />
          <Route path="/dashboard/moving-averages" element={<MarketPage />} />
          <Route path="/dashboard/alerts" element={<AlertsPage />} />
          <Route path="/dashboard/setups" element={<Dashboard />} />
          <Route path="/dashboard/news" element={<Dashboard />} />
          <Route path="/dashboard/community" element={<CommunityPage />} />
          <Route path="/dashboard/academy" element={<AcademyPage />} />
          <Route path="/dashboard/coin/:coinId" element={<CoinDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
