import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "U";
  const initials = username.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="h-14 border-b border-white/[0.04] bg-[#0A0A0A]/40 backdrop-blur-2xl flex items-center px-6 gap-6 shrink-0 z-50">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-primary transition-colors h-9 w-9" />
        <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
        <div className="hidden md:flex items-center gap-2">
           <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Live Stream: ACTIVE 1ms</span>
        </div>
      </div>

      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar ativos, zonas de liquidez..." className="pl-9 h-9 bg-black/40 border-white/10 text-sm focus:border-primary/50 transition-all" />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary" onClick={() => navigate("/dashboard/alerts")}>
          <Bell className="h-4 w-4" />
        </Button>
        <div className="h-4 w-[1px] bg-white/10" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary group-hover:bg-primary/20 transition-all">
                {initials}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-[10px] font-black uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors">PRO Account</div>
                <div className="text-[8px] text-muted-foreground uppercase font-mono">{username}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#0D0D0D] border-white/10 shadow-2xl">
            <DropdownMenuItem className="text-xs text-muted-foreground cursor-default flex items-center gap-2"><div className="h-1 w-1 bg-green-500 rounded-full" /> {user?.email}</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer hover:bg-destructive/10">
              <LogOut className="h-3.5 w-3.5 mr-2" /> Encerrar Sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
