import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { MacroBar } from "./MacroBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** When true the main area fills 100% height with no padding (for chart pages) */
  fullHeight?: boolean;
  /** Hide the persistent macro bar */
  hideMacroBar?: boolean;
}

export function DashboardLayout({ children, fullHeight = false, hideMacroBar = false }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-background overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <DashboardHeader />
          {!hideMacroBar && <MacroBar />}
          <main
            className={
              fullHeight
                ? "flex-1 flex flex-col overflow-hidden w-full"
                : "flex-1 flex flex-col overflow-y-auto overflow-x-hidden w-full max-w-full"
            }
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
