import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Code2, Briefcase, GraduationCap, Bot, UserCircle, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Skills", href: "/skills", icon: Code2 },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Applications", href: "/applications", icon: GraduationCap },
  { name: "AI Mentor", href: "/ai-mentor", icon: Bot },
  { name: "Profile", href: "/profile", icon: UserCircle },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile Nav Toggle */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-xl bg-card border border-border text-foreground shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-card/50 backdrop-blur-2xl border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="text-white" size={24} />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Career AI</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-inner" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                )}
              >
                <item.icon size={20} className={cn(isActive ? "text-primary" : "opacity-70")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 p-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/30 blur-3xl rounded-full" />
            <h3 className="font-display font-semibold text-foreground relative z-10">Hackathon Ready</h3>
            <p className="text-sm text-muted-foreground mt-1 relative z-10">Supercharge your career journey with AI.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full relative">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt=""
            className="fixed inset-0 w-full h-full object-cover opacity-20 pointer-events-none mix-blend-screen"
            style={{ zIndex: -1 }}
          />
          {children}
        </div>
      </main>
    </div>
  );
}
