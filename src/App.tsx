import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProGate } from "@/components/ProGate";
import { LandingPage } from "./pages/LandingPage.tsx";
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
import ProfilePage from "./pages/ProfilePage.tsx";
import LiquidityPage from "./pages/LiquidityPage.tsx";
import LeveragePage from "./pages/LeveragePage.tsx";
import OrderBookPage from "./pages/OrderBookPage.tsx";
import AssetAnalysisPage from "./pages/AssetAnalysisPage.tsx";
import ChartsPage from "./pages/ChartsPage.tsx";
import TradingViewPage from "./pages/TradingViewPage.tsx";
import RsiHeatmapPage from "./pages/RsiHeatmapPage.tsx";
import ShortTermSetup from "./pages/ShortTermSetup.tsx";
import LongTermSetup from "./pages/LongTermSetup.tsx";
import NewsPage from "./pages/NewsPage.tsx";
import MarketHeatmapPage from "./pages/MarketHeatmapPage.tsx";
import OnChainAnalyticsPage from "./pages/OnChainAnalyticsPage.tsx";
import SignalCentralPage from "./pages/SignalCentralPage.tsx";
import BotSwingTradePage from "./pages/BotSwingTradePage.tsx";
import ScalpBotPage from "./pages/ScalpBotPage.tsx";
import MinhaCarteiraPage from "./pages/MinhaCarteiraPage.tsx";
import ManualPage from "./pages/ManualPage.tsx";

const queryClient = new QueryClient();

function ProtectedDashboard({ children }: { children: React.ReactNode }) {
  // Exige login. Depois de logar, o plano é "pro" por padrão (tudo liberado p/ testes).
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
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/manual" element={<ManualPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedDashboard><Dashboard /></ProtectedDashboard>} />
            <Route path="/dashboard/signals" element={<ProtectedDashboard><Dashboard initialTab="signals" /></ProtectedDashboard>} />
            <Route path="/dashboard/rsi" element={<ProtectedDashboard><RsiHeatmapPage /></ProtectedDashboard>} />
            <Route path="/dashboard/on-chain" element={<ProtectedDashboard><OnChainAnalyticsPage /></ProtectedDashboard>} />
            <Route path="/dashboard/central" element={<ProtectedDashboard><ProGate feature="A Central de Sinais"><SignalCentralPage /></ProGate></ProtectedDashboard>} />
            <Route path="/dashboard/bot" element={<ProtectedDashboard><ProGate feature="O Bot Swing Trade"><BotSwingTradePage /></ProGate></ProtectedDashboard>} />
            <Route path="/dashboard/scalp" element={<ProtectedDashboard><ProGate feature="O Bot Scalping"><ScalpBotPage /></ProGate></ProtectedDashboard>} />
            <Route path="/dashboard/carteira" element={<ProtectedDashboard><ProGate feature="A Minha Carteira"><MinhaCarteiraPage /></ProGate></ProtectedDashboard>} />
            <Route path="/dashboard/liquidity" element={<ProtectedDashboard><LiquidityPage /></ProtectedDashboard>} />
            <Route path="/dashboard/orderbook" element={<ProtectedDashboard><OrderBookPage /></ProtectedDashboard>} />
            <Route path="/dashboard/leverage" element={<ProtectedDashboard><LeveragePage /></ProtectedDashboard>} />
            <Route path="/dashboard/market" element={<ProtectedDashboard><MarketPage /></ProtectedDashboard>} />
            <Route path="/dashboard/charts" element={<ProtectedDashboard><ChartsPage /></ProtectedDashboard>} />
            <Route path="/dashboard/buy-signals" element={<ProtectedDashboard><ProGate feature="Os Sinais de Compra"><BuySignals /></ProGate></ProtectedDashboard>} />
            <Route path="/dashboard/sell-signals" element={<ProtectedDashboard><ProGate feature="Os Sinais de Venda"><SellSignals /></ProGate></ProtectedDashboard>} />
            <Route path="/dashboard/short-term" element={<ProtectedDashboard><ProGate feature="O Setup Curto Prazo"><ShortTermSetup /></ProGate></ProtectedDashboard>} />
            <Route path="/dashboard/long-term" element={<ProtectedDashboard><ProGate feature="O Setup Longo Prazo"><LongTermSetup /></ProGate></ProtectedDashboard>} />
            <Route path="/dashboard/alerts" element={<ProtectedDashboard><AlertsPage /></ProtectedDashboard>} />
            <Route path="/dashboard/news" element={<ProtectedDashboard><NewsPage /></ProtectedDashboard>} />
            <Route path="/dashboard/community" element={<ProtectedDashboard><CommunityPage /></ProtectedDashboard>} />
            <Route path="/dashboard/academy" element={<ProtectedDashboard><AcademyPage /></ProtectedDashboard>} />
            <Route path="/dashboard/profile" element={<ProtectedDashboard><ProfilePage /></ProtectedDashboard>} />
            <Route path="/dashboard/coin/:coinId" element={<ProtectedDashboard><CoinDetail /></ProtectedDashboard>} />
            <Route path="/dashboard/analysis/:symbol" element={<ProtectedDashboard><AssetAnalysisPage /></ProtectedDashboard>} />
            <Route path="/dashboard/heatmap" element={<ProtectedDashboard><MarketHeatmapPage /></ProtectedDashboard>} />
            <Route path="/dashboard/tradingview" element={<ProtectedDashboard><TradingViewPage /></ProtectedDashboard>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
