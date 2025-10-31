import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Play, 
  Heart, 
  Circle, 
  Radio,
  Music,
  Mic,
  Headphones,
  Guitar,
  Piano,
  Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RadioStation } from "@shared/schema";

interface StationGridProps {
  onStationSelect: (station: RadioStation) => void;
  selectedStationId?: string;
  className?: string;
}

const genreIcons: Record<string, any> = {
  jazz: Music,
  rock: Guitar,
  classical: Piano,
  news: Mic,
  electronic: Volume2,
  alternative: Headphones,
  default: Radio,
};

const genreColors = [
  "from-blue-500 to-purple-600",
  "from-red-500 to-orange-600", 
  "from-green-500 to-teal-600",
  "from-purple-500 to-pink-600",
  "from-yellow-500 to-red-600",
  "from-indigo-500 to-blue-600",
];

export default function StationGrid({ onStationSelect, selectedStationId, className }: StationGridProps) {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stations = [], isLoading } = useQuery({
    queryKey: ["/api/stations"],
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ stationId, action }: { stationId: string; action: 'add' | 'remove' }) => {
      if (action === 'add') {
        await apiRequest('POST', '/api/favorites', { stationId });
      } else {
        await apiRequest('DELETE', `/api/favorites/${stationId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    },
  });

  const genres = ["All", ...Array.from(new Set((stations as RadioStation[]).map((s: RadioStation) => s.genre)))];
  
  const filteredStations = (stations as RadioStation[]).filter((station: RadioStation) => 
    selectedGenre === "All" || station.genre === selectedGenre
  );

  const isFavorite = (stationId: string) => 
    (favorites as any[]).some((fav: any) => fav.stationId === stationId);

  const handleFavoriteToggle = (stationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const action = isFavorite(stationId) ? 'remove' : 'add';
    favoriteMutation.mutate({ stationId, action });
  };

  const getStationIcon = (genre: string) => {
    const IconComponent = genreIcons[genre.toLowerCase()] || genreIcons.default;
    return IconComponent;
  };

  const getColorClass = (index: number) => genreColors[index % genreColors.length];

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Popular Stations</h2>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-16 bg-secondary rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
              <div className="h-20 bg-secondary rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-secondary rounded w-3/4" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Genre Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Popular Stations</h2>
        <div className="flex gap-2">
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedGenre(genre)}
              data-testid={`genre-filter-${genre.toLowerCase()}`}
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>

      {/* Station Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStations.map((station: RadioStation, index: number) => {
          const IconComponent = getStationIcon(station.genre);
          const isSelected = selectedStationId === station.id;
          const stationIsFavorite = isFavorite(station.id);
          
          return (
            <div
              key={station.id}
              className={cn(
                "bg-card rounded-lg border border-border p-4 hover:border-primary transition-all group cursor-pointer",
                isSelected && "border-primary bg-primary/5"
              )}
              onClick={() => onStationSelect(station)}
              data-testid={`station-card-${station.id}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br",
                  getColorClass(index)
                )}>
                  <IconComponent className="text-white w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-medium group-hover:text-primary transition-colors truncate",
                    isSelected && "text-primary"
                  )}>
                    {station.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{station.genre}</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span className="text-xs text-muted-foreground">
                    {(station.listenerCount || 0) >= 1000 
                      ? `${((station.listenerCount || 0) / 1000).toFixed(1)}k`
                      : (station.listenerCount || 0)}
                  </span>
                </div>
              </div>
              
              {station.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {station.description}
                </p>
              )}
              
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStationSelect(station);
                  }}
                  data-testid={`play-station-${station.id}`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`record-station-${station.id}`}
                >
                  <Circle className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "w-8 h-8 hover:bg-accent hover:text-accent-foreground",
                    stationIsFavorite && "bg-red-50 text-red-500 hover:bg-red-100"
                  )}
                  onClick={(e) => handleFavoriteToggle(station.id, e)}
                  disabled={favoriteMutation.isPending}
                  data-testid={`favorite-station-${station.id}`}
                >
                  <Heart className={cn("w-3 h-3", stationIsFavorite && "fill-current")} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStations.length === 0 && (
        <div className="text-center py-12">
          <Radio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {selectedGenre === "All" 
              ? "No stations available"
              : `No ${selectedGenre} stations found`}
          </p>
        </div>
      )}
    </div>
  );
}
