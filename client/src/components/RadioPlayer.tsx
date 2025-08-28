import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  Heart, 
  Share2,
  Circle,
  SkipBack,
  SkipForward
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RadioPlayerProps {
  station?: {
    id: string;
    name: string;
    url: string;
    genre: string;
    city?: string;
    country?: string;
  };
  isPlaying: boolean;
  onPlayPause: () => void;
  onRecord?: () => void;
  isRecording?: boolean;
  className?: string;
}

export default function RadioPlayer({
  station,
  isPlaying,
  onPlayPause,
  onRecord,
  isRecording = false,
  className,
}: RadioPlayerProps) {
  const [volume, setVolume] = useState([75]);
  const [isFavorite, setIsFavorite] = useState(false);

  const { sendMessage } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'stream_started' && station) {
        console.log(`Stream started for ${station.name}`);
      } else if (message.type === 'stream_stopped') {
        console.log('Stream stopped');
      }
    },
  });

  useEffect(() => {
    if (isPlaying && station) {
      sendMessage({
        type: 'start_stream',
        stationId: station.id,
        stationUrl: station.url,
      });
    } else if (!isPlaying && station) {
      sendMessage({
        type: 'stop_stream',
        stationId: station.id,
      });
    }
  }, [isPlaying, station, sendMessage]);

  const WaveAnimation = () => (
    <div className="flex items-center gap-0.5">
      {[12, 20, 16, 24, 14].map((height, index) => (
        <div
          key={index}
          className="w-0.5 bg-accent rounded-sm animate-pulse"
          style={{
            height: `${height}px`,
            animationDelay: `${index * 0.1}s`,
            animationDuration: '1.5s',
          }}
        />
      ))}
    </div>
  );

  if (!station) {
    return (
      <div className={cn("bg-card rounded-lg border border-border p-6", className)}>
        <div className="text-center text-muted-foreground">
          <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a station to start listening</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-card rounded-lg border border-border p-6", className)}>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Play className="text-primary w-5 h-5" />
        Now Playing
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {/* Station Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="text-white text-xl font-bold">
              {station.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate" data-testid="station-name">
              {station.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate" data-testid="station-genre">
              {station.genre}
            </p>
            {station.city && station.country && (
              <p className="text-xs text-muted-foreground" data-testid="station-location">
                {station.city}, {station.country}
              </p>
            )}
          </div>
          
          {isPlaying && <WaveAnimation />}
        </div>
        
        {/* Player Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            onClick={() => setIsFavorite(!isFavorite)}
            data-testid="favorite-button"
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current text-red-500")} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            disabled
            data-testid="previous-button"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            className="w-10 h-10"
            onClick={onPlayPause}
            data-testid="play-pause-button"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            disabled
            data-testid="next-button"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            className="w-8 h-8"
            onClick={onRecord}
            data-testid="record-button"
          >
            <Circle className={cn("w-4 h-4", isRecording && "animate-pulse")} />
          </Button>
          
          <div className="flex-1" />
          
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            data-testid="share-button"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="flex-1"
            data-testid="volume-slider"
          />
          <span className="text-sm text-muted-foreground w-8 text-right">
            {volume[0]}%
          </span>
        </div>
      </div>
    </div>
  );
}
