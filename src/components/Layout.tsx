import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Award, User as UserIcon, Share2, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session && location.pathname !== "/auth") {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session && location.pathname !== "/auth") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Share2, label: "Share", path: "/share" },
    { icon: TrendingUp, label: "Stats", path: "/stats" },
    { icon: Award, label: "Achievements", path: "/achievements" },
    { icon: UserIcon, label: "Profile", path: "/profile" },
  ];

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="font-bold text-lg hidden sm:inline">Coaster Center</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    location.pathname === item.path && "bg-gradient-primary"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card animate-fade-in">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full justify-start",
                    location.pathname === item.path && "bg-gradient-primary"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
              <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex-col h-auto py-2 px-3",
                location.pathname === item.path && "text-primary"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                location.pathname === item.path && "text-primary"
              )} />
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
};

export default Layout;
