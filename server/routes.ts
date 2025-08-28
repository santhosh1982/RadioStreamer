import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { radioService } from "./services/radioService";
import { recordingService } from "./services/recordingService";
import { aiService } from "./services/aiService";
import { insertRadioStationSchema, insertRecordingSchema, insertFavoriteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Radio station routes
  app.get("/api/stations", async (req, res) => {
    try {
      const { genre } = req.query;
      const stations = genre 
        ? await storage.getRadioStationsByGenre(genre as string)
        : await storage.getRadioStations();
      res.json(stations);
    } catch (error) {
      console.error("Error fetching stations:", error);
      res.status(500).json({ message: "Failed to fetch stations" });
    }
  });

  app.post("/api/stations", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRadioStationSchema.parse(req.body);
      const station = await storage.createRadioStation(validatedData);
      res.status(201).json(station);
    } catch (error) {
      console.error("Error creating station:", error);
      res.status(400).json({ message: "Failed to create station" });
    }
  });

  // Recording routes
  app.get("/api/recordings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recordings = await storage.getUserRecordings(userId);
      res.json(recordings);
    } catch (error) {
      console.error("Error fetching recordings:", error);
      res.status(500).json({ message: "Failed to fetch recordings" });
    }
  });

  app.get("/api/recordings/active", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activeRecordings = await storage.getActiveRecordings(userId);
      res.json(activeRecordings);
    } catch (error) {
      console.error("Error fetching active recordings:", error);
      res.status(500).json({ message: "Failed to fetch active recordings" });
    }
  });

  app.post("/api/recordings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recordingData = insertRecordingSchema.parse({
        ...req.body,
        userId,
      });
      const recording = await storage.createRecording(recordingData);
      res.status(201).json(recording);
    } catch (error) {
      console.error("Error creating recording:", error);
      res.status(400).json({ message: "Failed to create recording" });
    }
  });

  app.delete("/api/recordings/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Get recording to verify ownership and get filename
      const recordings = await storage.getUserRecordings(userId);
      const recording = recordings.find(r => r.id === id);
      
      if (!recording) {
        return res.status(404).json({ message: "Recording not found" });
      }

      // Delete file and database record
      await recordingService.deleteRecordingFile(recording.filename);
      await storage.deleteRecording(id);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting recording:", error);
      res.status(500).json({ message: "Failed to delete recording" });
    }
  });

  app.get("/api/recordings/:id/download", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const recordings = await storage.getUserRecordings(userId);
      const recording = recordings.find(r => r.id === id);
      
      if (!recording) {
        return res.status(404).json({ message: "Recording not found" });
      }

      const fileBuffer = await recordingService.getRecordingFile(recording.filename);
      
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Disposition', `attachment; filename="${recording.title}.wav"`);
      res.send(fileBuffer);
    } catch (error) {
      console.error("Error downloading recording:", error);
      res.status(500).json({ message: "Failed to download recording" });
    }
  });

  // Favorites routes
  app.get("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId,
      });
      const favorite = await storage.addFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(400).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:stationId", isAuthenticated, async (req: any, res) => {
    try {
      const { stationId } = req.params;
      const userId = req.user.claims.sub;
      await storage.removeFavorite(userId, stationId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // AI Chat routes
  app.post("/api/ai/search", isAuthenticated, async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      const stations = await storage.getRadioStations();
      const response = await aiService.searchRadioStations(query, stations);
      res.json(response);
    } catch (error) {
      console.error("Error in AI search:", error);
      res.status(500).json({ message: "Failed to process AI search" });
    }
  });

  app.post("/api/ai/chat", isAuthenticated, async (req: any, res) => {
    try {
      const { message, conversationId } = req.body;
      const userId = req.user.claims.sub;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get conversation history if conversationId provided
      let conversationHistory: any[] = [];
      if (conversationId) {
        const conversations = await storage.getUserChatConversations(userId);
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
          conversationHistory = conversation.messages as any[];
        }
      }

      const response = await aiService.generateChatResponse(message, conversationHistory);
      
      // Update conversation with new messages
      const updatedMessages = [
        ...conversationHistory,
        { role: "user", content: message, timestamp: new Date() },
        { role: "assistant", content: response, timestamp: new Date() },
      ];

      if (conversationId) {
        await storage.updateChatConversation(conversationId, {
          messages: updatedMessages,
        });
      } else {
        await storage.createChatConversation({
          userId,
          messages: updatedMessages,
        });
      }

      res.json({ response });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time streaming and recording updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'start_stream':
            await handleStartStream(ws, message);
            break;
          case 'stop_stream':
            handleStopStream(ws, message);
            break;
          case 'start_recording':
            await handleStartRecording(ws, message);
            break;
          case 'stop_recording':
            handleStopRecording(ws, message);
            break;
          case 'get_recording_status':
            handleGetRecordingStatus(ws, message);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // WebSocket handlers
  async function handleStartStream(ws: WebSocket, message: any) {
    try {
      const { stationId, stationUrl } = message;
      const stream = await radioService.createStream(stationId, stationUrl);
      
      stream.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(chunk);
        }
      });

      ws.send(JSON.stringify({ 
        type: 'stream_started', 
        stationId,
        message: 'Stream started successfully' 
      }));
    } catch (error) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to start stream' 
      }));
    }
  }

  function handleStopStream(ws: WebSocket, message: any) {
    const { stationId } = message;
    radioService.stopStream(stationId);
    
    ws.send(JSON.stringify({ 
      type: 'stream_stopped', 
      stationId,
      message: 'Stream stopped successfully' 
    }));
  }

  async function handleStartRecording(ws: WebSocket, message: any) {
    try {
      const { recordingId, stationId, stationUrl, options } = message;
      
      const sourceStream = await radioService.createStream(`recording_${recordingId}`, stationUrl);
      const filename = await recordingService.startRecording(recordingId, sourceStream, options);
      
      ws.send(JSON.stringify({ 
        type: 'recording_started', 
        recordingId,
        filename,
        message: 'Recording started successfully' 
      }));

      // Send periodic updates about recording duration
      const interval = setInterval(() => {
        if (recordingService.isRecording(recordingId)) {
          const duration = recordingService.getRecordingDuration(recordingId);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'recording_update',
              recordingId,
              duration,
            }));
          }
        } else {
          clearInterval(interval);
        }
      }, 1000);
    } catch (error) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to start recording' 
      }));
    }
  }

  function handleStopRecording(ws: WebSocket, message: any) {
    const { recordingId } = message;
    recordingService.stopRecording(recordingId);
    
    ws.send(JSON.stringify({ 
      type: 'recording_stopped', 
      recordingId,
      message: 'Recording stopped successfully' 
    }));
  }

  function handleGetRecordingStatus(ws: WebSocket, message: any) {
    const activeRecordings = recordingService.getActiveRecordings();
    const status = activeRecordings.map(recordingId => ({
      recordingId,
      duration: recordingService.getRecordingDuration(recordingId),
      isActive: true,
    }));

    ws.send(JSON.stringify({
      type: 'recording_status',
      recordings: status,
    }));
  }

  return httpServer;
}
