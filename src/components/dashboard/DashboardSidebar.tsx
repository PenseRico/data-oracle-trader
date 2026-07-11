import {
  BarChart3, TrendingUp, TrendingDown, Activity, Filter,
  LayoutDashboard, LineChart, Newspaper, MessageSquare,
  Zap, Target, ArrowLeftRight, BookOpen, Monitor, User, Calculator,
  Globe2, Eye, MapPin, Link2, Crosshair, Bot, Flame, Wallet,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { usePlan, setPlan } from "@/lib/plan";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Terminal de Comando", url: "/dashboard", icon: LayoutDashboard },
  { title: "Minha Carteira", url: "/dashboard/carteira", icon: Wallet },
  { title: "Market Matrix", url: "/dashboard/market", icon: Globe2 },
  { title: "Heatmap + Calendário", url: "/dashboard/heatmap", icon: MapPin },
  { title: "Dados On-Chain", url: "/dashboard/on-chain", icon: Link2 },
  { title: "TradingView Pro", url: "/dashboard/tradingview", icon: LineChart },
  { title: "Painel de Gráficos", url: "/dashboard/charts", icon: BarChart3 },
  { title: "Livro de Ordens", url: "/dashboard/orderbook", icon: Monitor },
  { title: "Mapa de Liquidez", url: "/dashboard/liquidity", icon: Target },
  { title: "Simulador de Risco", url: "/dashboard/leverage", icon: Calculator },
];

const filterItems = [
  { title: "Bot Swing Trade", url: "/dashboard/bot", icon: Bot },
  { title: "Bot Scalping", url: "/dashboard/scalp", icon: Flame },
  { title: "Central de Sinais (MTF RSI)", url: "/dashboard/central", icon: Crosshair },
  { title: "Sinais de Compra", url: "/dashboard/buy-signals", icon: TrendingUp },
  { title: "Sinais de Venda", url: "/dashboard/sell-signals", icon: TrendingDown },
  { title: "Exaustão RSI", url: "/dashboard/rsi", icon: Activity },
  { title: "Setup Curto Prazo (Intraday)", url: "/dashboard/short-term", icon: ArrowLeftRight },
  { title: "Setup Longo Prazo (Swing)", url: "/dashboard/long-term", icon: Zap },
];

const toolItems = [
  { title: "Monitor", url: "/dashboard/monitor", icon: Eye },
  { title: "Alertas", url: "/dashboard/alerts", icon: Zap },
  { title: "Terminal Notícias", url: "/dashboard/news", icon: Newspaper },
  { title: "Mesa de Operações", url: "/dashboard/community", icon: MessageSquare },
  { title: "Formação Academy", url: "/dashboard/academy", icon: BookOpen },
  { title: "Perfil Analista", url: "/dashboard/profile", icon: User },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const plan = usePlan();
  const isActive = (path: string) => location.pathname === path;

  const renderGroup = (label: string, items: typeof mainItems, icon?: React.ReactNode) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/60">
        {icon}{label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink to={item.url} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-primary font-medium">
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 shadow-glow">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-display font-black text-xl text-foreground tracking-tighter"><span className="text-primary">Matrix</span></span>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("Principal", mainItems)}
        {renderGroup("Filtros & Sinais", filterItems, <Filter className="h-3 w-3 mr-1 inline" />)}
        {renderGroup("Ferramentas", toolItems)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-2">
        {!collapsed && (
          <>
            <div className="flex items-center gap-1 rounded-lg bg-black/40 border border-white/5 p-1">
              <span className="text-[8px] uppercase tracking-widest text-muted-foreground/50 font-mono px-1">Ver como</span>
              <button
                onClick={() => setPlan("free")}
                className={`flex-1 rounded-md py-1 text-[9px] font-black uppercase tracking-widest transition-colors ${plan === "free" ? "bg-white/10 text-white" : "text-muted-foreground/50 hover:text-white"}`}
              >
                Free
              </button>
              <button
                onClick={() => setPlan("pro")}
                className={`flex-1 rounded-md py-1 text-[9px] font-black uppercase tracking-widest transition-colors ${plan === "pro" ? "bg-primary/20 text-primary" : "text-muted-foreground/50 hover:text-white"}`}
              >
                Pro
              </button>
            </div>
            <div className="text-[9px] text-muted-foreground/40 text-center uppercase tracking-widest font-mono">preview de plano · Matrix</div>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
