import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import StationGrid from "@/components/StationGrid";
import RadioPlayer from "@/components/RadioPlayer";
import RecordingPanel from "@/components/RecordingPanel";
import AIAssistant from "@/components/AIAssistant";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Bot, 
  Circle,
  User,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Station {
  id: string;
  name: string;
  url: string;
  genre: string;
  description?: string;
  city?: string;
  country?: string;
  listenerCount: number;
  isActive: boolean;
}

export default function Home() {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const { data: activeRecordings = [] } = useQuery({
    queryKey: ["/api/recordings/active"],
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: !!user,
  });

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRecord = () => {
    if (!selectedStation) return;
    setIsRecording(!isRecording);
    // Recording logic will be handled by WebSocket in RadioPlayer
  };

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
              {activeRecordings.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-destructive/20 text-destructive rounded-lg">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  <span className="text-sm font-medium">
                    Recording {activeRecordings.length}
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Button
                variant="outline"
                className="p-4 h-auto justify-start hover:border-primary group"
                onClick={() => selectedStation && handlePlayPause()}
                disabled={!selectedStation}
                data-testid="continue-playing-action"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <span className="text-primary text-lg">▶</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Continue Playing</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedStation?.name || "No station selected"}
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="p-4 h-auto justify-start hover:border-accent group"
                onClick={handleRecord}
                disabled={!selectedStation}
                data-testid="start-recording-action"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <Circle className="text-accent" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Start Recording</h3>
                    <p className="text-sm text-muted-foreground">Capture live audio</p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="p-4 h-auto justify-start hover:border-primary group"
                data-testid="my-recordings-action"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <span className="text-primary text-lg">📁</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">My Recordings</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeRecordings.length} saved files
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="p-4 h-auto justify-start hover:border-accent group"
                onClick={() => setIsAIOpen(true)}
                data-testid="ask-ai-action"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <Bot className="text-accent" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Ask AI</h3>
                    <p className="text-sm text-muted-foreground">Find stations</p>
                  </div>
                </div>
              </Button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Radio Player */}
              <div className="lg:col-span-1">
                <RadioPlayer
                  station={selectedStation || undefined}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onRecord={handleRecord}
                  isRecording={isRecording}
                />
              </div>

              {/* Recording Panel */}
              <div className="lg:col-span-2">
                <RecordingPanel />
              </div>
            </div>

            {/* Station Grid */}
            <StationGrid
              onStationSelect={handleStationSelect}
              selectedStationId={selectedStation?.id}
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

      {/* Global Audio Player */}
      <GlobalAudioPlayer
        currentStation={selectedStation || undefined}
        isPlaying={isPlaying}
        isRecording={isRecording}
        onPlayPause={handlePlayPause}
        onRecord={handleRecord}
      />
    </div>
  );
}
