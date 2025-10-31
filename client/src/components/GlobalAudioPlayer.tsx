import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Heart, 
  Circle,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";

import type { RadioStation } from "@shared/schema";

interface GlobalAudioPlayerProps {
  currentStation?: RadioStation;
  isPlaying: boolean;
  isRecording: boolean;
  onPlayPause: () => void;
  onRecord: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}

export default function GlobalAudioPlayer({
  currentStation,
  isPlaying,
  isRecording,
  onPlayPause,
  onRecord,
  onNext,
  onPrevious,
  className,
}: GlobalAudioPlayerProps) {
  const [volume, setVolume] = useState([75]);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!currentStation) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40",
      className
    )}>
      <div className="flex items-center gap-4 max-w-screen-xl mx-auto">
        {/* Current Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <Radio className="text-white w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium truncate" data-testid="global-player-station">
              {currentStation.name}
            </h4>
            <p className="text-sm text-muted-foreground truncate">
              {currentStation.genre}
              {currentStation.city && currentStation.country && 
                ` - ${currentStation.city}, ${currentStation.country}`}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            onClick={onPrevious}
            disabled={!onPrevious}
            data-testid="global-player-previous"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            className="w-12 h-12"
            onClick={onPlayPause}
            data-testid="global-player-play-pause"
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
            onClick={onNext}
            disabled={!onNext}
            data-testid="global-player-next"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume & Actions */}
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "w-8 h-8",
              isFavorite && "bg-red-50 text-red-500 hover:bg-red-100"
            )}
            onClick={() => setIsFavorite(!isFavorite)}
            data-testid="global-player-favorite"
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </Button>
          
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            className="w-8 h-8"
            onClick={onRecord}
            data-testid="global-player-record"
          >
            <Circle className={cn("w-4 h-4", isRecording && "animate-pulse")} />
          </Button>
          
          <div className="flex items-center gap-2 min-w-0">
            <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="w-20"
              data-testid="global-player-volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
