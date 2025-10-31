import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { audioPlayer } from "@/lib/AudioPlayer";
import type { RadioStation } from "@shared/schema";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";

function Router({ onSelectStation }: { onSelectStation: (station: RadioStation) => void }) {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/"><Home onSelectStation={onSelectStation} /></Route>
      <Route path="/stations"><Home onSelectStation={onSelectStation} /></Route>
      <Route path="/recordings"><Home onSelectStation={onSelectStation} /></Route>
      <Route path="/favorites"><Home onSelectStation={onSelectStation} /></Route>
      <Route path="/recent"><Home onSelectStation={onSelectStation} /></Route>
      <Route path="/downloads"><Home onSelectStation={onSelectStation} /></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [currentStation, setCurrentStation] = useState<RadioStation | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);

  const { sendMessage } = useWebSocket({});

  const handleSelectStation = (station: RadioStation) => {
    if (currentStation) {
      sendMessage({ type: 'stop_stream', stationId: currentStation.id });
    }
    setCurrentStation(station);
    setIsPlaying(true);
    
    // Use proxy endpoint for better CORS handling
    const proxyUrl = `/api/stream/${station.id}`;
    audioPlayer.setStreamUrl(proxyUrl);
    audioPlayer.play();
  };

  const handlePlayPause = () => {
    if (!currentStation) return;

    if (isPlaying) {
      audioPlayer.pause();
      setIsPlaying(false);
    } else {
      const proxyUrl = `/api/stream/${currentStation.id}`;
      audioPlayer.setStreamUrl(proxyUrl);
      audioPlayer.play();
      setIsPlaying(true);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router onSelectStation={handleSelectStation} />
        <GlobalAudioPlayer
          currentStation={currentStation}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          isRecording={false} // This needs to be implemented
          onRecord={() => {}} // This needs to be implemented
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
