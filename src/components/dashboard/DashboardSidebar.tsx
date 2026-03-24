import {
  BarChart3, TrendingUp, TrendingDown, Activity, Filter,
  LayoutDashboard, LineChart, Newspaper, MessageSquare,
  Zap, Target, ArrowLeftRight, BookOpen, Monitor,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Signal Engine", url: "/dashboard", icon: LayoutDashboard },
  { title: "Mercado", url: "/dashboard/market", icon: BarChart3 },
  { title: "Monitoramento", url: "/dashboard/monitor", icon: Monitor },
  { title: "Gráficos", url: "/dashboard/charts", icon: LineChart },
];

const filterItems = [
  { title: "Filtros RSI", url: "/dashboard/rsi-filters", icon: Activity },
  { title: "Oportunidades de Compra", url: "/dashboard/buy-signals", icon: TrendingUp },
  { title: "Sinais de Venda", url: "/dashboard/sell-signals", icon: TrendingDown },
  { title: "Médias Móveis", url: "/dashboard/moving-averages", icon: ArrowLeftRight },
];

const toolItems = [
  { title: "Alertas", url: "/dashboard/alerts", icon: Zap },
  { title: "Setups", url: "/dashboard/setups", icon: Target },
  { title: "Notícias", url: "/dashboard/news", icon: Newspaper },
  { title: "Comunidade", url: "/dashboard/community", icon: MessageSquare },
  { title: "Academy", url: "/dashboard/academy", icon: BookOpen },
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
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg text-foreground tracking-tight">CryptoEdge</span>
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
          <div className="text-xs text-muted-foreground/50 text-center">v0.2.0 beta</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
