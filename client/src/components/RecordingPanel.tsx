import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState, useEffect } from "react";
import { 
  Circle, 
  Square, 
  FileAudio, 
  Play, 
  Download, 
  Trash2,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Recording {
  id: string;
  title: string;
  filename: string;
  duration: number;
  fileSize: number;
  isActive: boolean;
  createdAt: string;
  stationId?: string;
}

interface ActiveRecording {
  recordingId: string;
  duration: number;
  isActive: boolean;
}

export default function RecordingPanel() {
  const [activeRecordings, setActiveRecordings] = useState<ActiveRecording[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recordings = [], isLoading } = useQuery({
    queryKey: ["/api/recordings"],
    enabled: !!user,
  });

  const { sendMessage } = useWebSocket({
    onMessage: (message) => {
      switch (message.type) {
        case 'recording_started':
          toast({
            title: "Recording Started",
            description: `Recording "${message.recordingId}" has begun`,
          });
          queryClient.invalidateQueries({ queryKey: ["/api/recordings"] });
          break;
        
        case 'recording_stopped':
          toast({
            title: "Recording Stopped",
            description: `Recording "${message.recordingId}" has ended`,
          });
          setActiveRecordings(prev => 
            prev.filter(r => r.recordingId !== message.recordingId)
          );
          queryClient.invalidateQueries({ queryKey: ["/api/recordings"] });
          break;
        
        case 'recording_update':
          setActiveRecordings(prev => 
            prev.map(r => 
              r.recordingId === message.recordingId 
                ? { ...r, duration: message.duration }
                : r
            )
          );
          break;
        
        case 'recording_status':
          setActiveRecordings(message.recordings || []);
          break;
      }
    },
  });

  const deleteRecordingMutation = useMutation({
    mutationFn: async (recordingId: string) => {
      await apiRequest('DELETE', `/api/recordings/${recordingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recordings"] });
      toast({
        title: "Recording Deleted",
        description: "Recording has been permanently deleted",
      });
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
        description: "Failed to delete recording",
        variant: "destructive",
      });
    },
  });

  const stopRecording = (recordingId: string) => {
    sendMessage({
      type: 'stop_recording',
      recordingId,
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const downloadRecording = (recordingId: string, title: string) => {
    const link = document.createElement('a');
    link.href = `/api/recordings/${recordingId}/download`;
    link.download = `${title}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Request recording status on mount
  useEffect(() => {
    sendMessage({ type: 'get_recording_status' });
  }, [sendMessage]);

  return (
    <div className="space-y-6">
      {/* Active Recordings */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Circle className="text-destructive w-5 h-5 animate-pulse" />
          Active Recordings
          {activeRecordings.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {activeRecordings.length}
            </Badge>
          )}
        </h2>
        
        <div className="space-y-3">
          {activeRecordings.map((recording) => (
            <div
              key={recording.recordingId}
              className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
              data-testid={`active-recording-${recording.recordingId}`}
            >
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <div className="flex-1">
                <p className="font-medium text-sm">Recording {recording.recordingId}</p>
                <p className="text-xs text-muted-foreground">
                  Recording for {formatDuration(recording.duration)}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="w-6 h-6 text-muted-foreground hover:text-destructive"
                onClick={() => stopRecording(recording.recordingId)}
                data-testid={`stop-recording-${recording.recordingId}`}
              >
                <Square className="w-3 h-3" />
              </Button>
            </div>
          ))}
          
          {activeRecordings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active recordings</p>
            </div>
          )}
          
          <Button
            variant="outline"
            className="w-full"
            disabled
            data-testid="start-new-recording"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start New Recording
          </Button>
        </div>
      </div>

      {/* Recent Recordings */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Recordings</h2>
          <Button variant="ghost" size="sm" data-testid="view-all-recordings">
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-12 h-12 bg-secondary rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recordings.length > 0 ? (
          <div className="space-y-3">
            {recordings.slice(0, 4).map((recording: Recording) => (
              <div
                key={recording.id}
                className="flex items-center gap-4 p-3 hover:bg-secondary/50 rounded-lg transition-colors"
                data-testid={`recording-${recording.id}`}
              >
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                  <FileAudio className="text-primary w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{recording.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(recording.duration)} • {formatFileSize(recording.fileSize)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(recording.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    disabled
                    data-testid={`play-recording-${recording.id}`}
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 hover:bg-accent hover:text-accent-foreground"
                    onClick={() => downloadRecording(recording.id, recording.title)}
                    data-testid={`download-recording-${recording.id}`}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => deleteRecordingMutation.mutate(recording.id)}
                    disabled={deleteRecordingMutation.isPending}
                    data-testid={`delete-recording-${recording.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileAudio className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recordings yet</p>
            <p className="text-xs">Start recording to save radio streams</p>
          </div>
        )}
      </div>
    </div>
  );
}
