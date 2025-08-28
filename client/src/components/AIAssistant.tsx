import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Play,
  Circle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: StationRecommendation[];
}

interface StationRecommendation {
  name: string;
  genre: string;
  description: string;
  location?: string;
  confidence: number;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onStationSelect?: (stationName: string) => void;
}

export default function AIAssistant({ isOpen, onClose, onStationSelect }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI radio assistant. I can help you find stations by describing what you want to listen to. Try saying something like \"Find me some chill jazz stations\" or \"I want to listen to 90s rock\".",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest('POST', '/api/ai/search', { query });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        recommendations: data.recommendations,
      };
      setMessages(prev => [...prev, assistantMessage]);
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
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/ai/chat', { 
        message,
        conversationId 
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
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
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Check if the message is asking for station recommendations
    const isSearchQuery = /find|search|recommend|want|listen|play|stations?|music|radio/i.test(inputValue);
    
    if (isSearchQuery) {
      searchMutation.mutate(inputValue);
    } else {
      chatMutation.mutate(inputValue);
    }

    setInputValue("");
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  const handleStationPlay = (stationName: string) => {
    onStationSelect?.(stationName);
    toast({
      title: "Station Selected",
      description: `Looking for "${stationName}"...`,
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" data-testid="ai-assistant-modal">
      <div className="fixed right-4 top-20 bottom-4 w-96 bg-card border border-border rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Bot className="text-accent-foreground w-4 h-4" />
              </div>
              <h3 className="font-semibold">AI Radio Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={onClose}
              data-testid="close-ai-assistant"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Ask me to find radio stations using natural language!
          </p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? "justify-end" : ""
                )}
                data-testid={`message-${index}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="text-accent-foreground w-3 h-3" />
                  </div>
                )}
                
                <div className={cn(
                  "rounded-lg p-3 max-w-[80%]",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary"
                )}>
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Station Recommendations */}
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {message.recommendations.map((station, stationIndex) => (
                        <div
                          key={stationIndex}
                          className="bg-card rounded-lg p-3 border border-border"
                          data-testid={`station-recommendation-${stationIndex}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{station.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {station.genre}
                            </Badge>
                            {station.location && (
                              <span className="text-xs text-muted-foreground">
                                {station.location}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {station.description}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 h-6 text-xs"
                              onClick={() => handleStationPlay(station.name)}
                              data-testid={`play-recommended-${stationIndex}`}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Play
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-6 h-6"
                              data-testid={`record-recommended-${stationIndex}`}
                            >
                              <Circle className="w-2 h-2" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
            
            {(searchMutation.isPending || chatMutation.isPending) && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="text-accent-foreground w-3 h-3 animate-pulse" />
                </div>
                <div className="bg-secondary rounded-lg p-3 max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for station recommendations..."
              className="flex-1"
              disabled={searchMutation.isPending || chatMutation.isPending}
              data-testid="ai-chat-input"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || searchMutation.isPending || chatMutation.isPending}
              data-testid="send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-1 mt-2">
            {["Jazz for work", "Upbeat pop", "News stations", "Classical music"].map((action) => (
              <Button
                key={action}
                variant="secondary"
                size="sm"
                className="text-xs h-6"
                onClick={() => handleQuickAction(action)}
                data-testid={`quick-action-${action.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
