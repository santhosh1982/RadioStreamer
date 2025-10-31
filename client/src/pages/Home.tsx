import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import StationGrid from "@/components/StationGrid";
import RecordingPanel from "@/components/RecordingPanel";
import AIAssistant from "@/components/AIAssistant";
import type { RadioStation } from "@shared/schema";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Bot, 
  Circle,
  User,
  Settings
} from "lucide-react";

interface HomeProps {
  onSelectStation: (station: RadioStation) => void;
}

export default function Home({ onSelectStation }: HomeProps) {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const { data: activeRecordings = [] } = useQuery({
    queryKey: ["/api/recordings/active"],
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: !!user,
  });

  const handleAIStationSelect = (stationName: string) => {
    // This would typically search for the station and select it
    console.log("AI recommended station:", stationName);
    setIsAIOpen(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const userName = user?.firstName || user?.email?.split('@')[0] || "there";

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="w-8 h-8"
                  data-testid="back-button"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="w-8 h-8"
                  data-testid="forward-button"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  type="text" 
                  placeholder="Search stations, genres, or ask AI..."
                  className="pl-10 pr-4 bg-secondary border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-input"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* AI Chat Toggle */}
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setIsAIOpen(true)}
                data-testid="ai-assistant-button"
              >
                <Bot className="w-4 h-4" />
                <span className="text-sm font-medium">AI Assistant</span>
              </Button>
              
              {/* Recording Status */}
              {(activeRecordings as any[]).length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-destructive/20 text-destructive rounded-lg">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  <span className="text-sm font-medium">
                    Recording {(activeRecordings as any[]).length}
                  </span>
                </div>
              )}

              {/* User Menu */}
              <Button 
                variant="outline" 
                size="icon"
                className="w-8 h-8"
                data-testid="user-menu-button"
              >
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2" data-testid="welcome-message">
                {getGreeting()}, {userName}!
              </h1>
              <p className="text-muted-foreground">
                Discover new stations or continue listening to your favorites
              </p>
            </div>

            {/* Station Grid */}
            <StationGrid
              onStationSelect={onSelectStation}
              selectedStationId={undefined} // This needs to be implemented
            />
          </div>
        </main>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onStationSelect={handleAIStationSelect}
      />
    </div>
  );
}
