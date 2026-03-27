import {
  BarChart3, TrendingUp, TrendingDown, Activity, Filter,
  LayoutDashboard, LineChart, Newspaper, MessageSquare,
  Zap, Target, ArrowLeftRight, BookOpen, Monitor, User, Calculator,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Terminal de Comando", url: "/dashboard", icon: LayoutDashboard },
  { title: "Radar Elite", url: "/dashboard/signals", icon: Zap },
  { title: "Rastro de Liquidez", url: "/dashboard/liquidity", icon: Target },
  { title: "Simulador de Risco", url: "/dashboard/leverage", icon: Calculator },
  { title: "Panorama de Mercado", url: "/dashboard/market", icon: BarChart3 },
];

const filterItems = [
  { title: "Mapa de Calor Pro", url: "/dashboard/rsi", icon: Activity },
  { title: "Setup Ignição (Buy)", url: "/dashboard/buy-signals", icon: TrendingUp },
  { title: "Setup Exaustão (Sell)", url: "/dashboard/sell-signals", icon: TrendingDown },
];

const toolItems = [
  { title: "Alertas", url: "/dashboard/alerts", icon: Zap },
  { title: "Configuração Setup", url: "/dashboard/setups", icon: Target },
  { title: "Terminal Notícias", url: "/dashboard/news", icon: Newspaper },
  { title: "Mesa de Operações", url: "/dashboard/community", icon: MessageSquare },
  { title: "Formação Academy", url: "/dashboard/academy", icon: BookOpen },
  { title: "Perfil Analista", url: "/dashboard/profile", icon: User },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
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
            <span className="font-display font-bold text-lg text-foreground tracking-tight">Data Oracle <span className="text-primary">Hub</span></span>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("Principal", mainItems)}
        {renderGroup("Filtros & Sinais", filterItems, <Filter className="h-3 w-3 mr-1 inline" />)}
        {renderGroup("Ferramentas", toolItems)}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="text-[10px] text-muted-foreground/50 text-center uppercase tracking-widest font-mono">v0.6.0 Alpha</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
