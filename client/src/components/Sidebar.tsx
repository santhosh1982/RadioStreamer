import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type { Recording } from "@shared/schema";
import { 
  Radio, 
  Home, 
  List, 
  Clock, 
  Mic, 
  Heart, 
  Download, 
  Settings,
  User
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: recordings = [] } = useQuery<Recording[]>({
    queryKey: ["/api/recordings"],
    enabled: !!user,
  });

  const navItems = [
    { href: "/", icon: Home, label: "Discover", section: "Browse" },
    { href: "/stations", icon: List, label: "My Stations", section: "Browse" },
    { href: "/recent", icon: Clock, label: "Recent", section: "Browse" },
    { href: "/recordings", icon: Mic, label: "Recordings", section: "Library", badge: recordings.length },
    { href: "/favorites", icon: Heart, label: "Favorites", section: "Library" },
    { href: "/downloads", icon: Download, label: "Downloads", section: "Library" },
  ];

  const sections = navItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navItems>);

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Radio className="text-primary-foreground w-4 h-4" />
          </div>
          <span className="text-xl font-semibold">RadioWave</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {Object.entries(sections).map(([sectionName, items]) => (
          <div key={sectionName} className="space-y-1">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {sectionName}
            </h3>
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="user-name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">Premium</p>
          </div>
          <button 
            className="text-muted-foreground hover:text-foreground"
            data-testid="settings-button"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
