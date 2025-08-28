import OpenAI from "openai";

// Using OpenRouter as the AI provider for access to multiple models
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || "default_key",
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : "https://radiowave.app",
    "X-Title": "RadioWave - AI Radio Assistant",
  },
});

export interface RadioRecommendation {
  name: string;
  genre: string;
  description: string;
  url?: string;
  location?: string;
  confidence: number;
}

export interface AIResponse {
  message: string;
  recommendations: RadioRecommendation[];
}

export class AIService {
  async searchRadioStations(query: string, availableStations: any[]): Promise<AIResponse> {
    try {
      const stationsContext = availableStations.map(station => ({
        name: station.name,
        genre: station.genre,
        description: station.description,
        location: `${station.city}, ${station.country}`,
      }));

      const response = await openai.chat.completions.create({
        model: "openai/gpt-4o", // Using OpenAI's GPT-4o via OpenRouter
        messages: [
          {
            role: "system",
            content: `You are a helpful radio station assistant. Based on the user's request, recommend radio stations from the available list. Always respond in JSON format with 'message' (a friendly response) and 'recommendations' (array of station objects with 'name', 'genre', 'description', 'location', and 'confidence' 0-1). Match user intent with appropriate stations.`
          },
          {
            role: "user",
            content: `Find radio stations for: "${query}"\n\nAvailable stations: ${JSON.stringify(stationsContext)}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        message: result.message || "Here are some radio stations I found for you:",
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      console.error("AI service error:", error);
      return {
        message: "I'm having trouble processing your request right now. Please try again later.",
        recommendations: [],
      };
    }
  }

  async generateChatResponse(message: string, conversationHistory: any[]): Promise<string> {
    try {
      const messages = [
        {
          role: "system",
          content: "You are a friendly radio assistant. Help users discover radio stations, answer questions about radio, and provide music recommendations. Keep responses conversational and helpful."
        },
        ...conversationHistory.slice(-5), // Keep last 5 messages for context
        {
          role: "user",
          content: message,
        }
      ];

      const response = await openai.chat.completions.create({
        model: "openai/gpt-4o", // Using OpenAI's GPT-4o via OpenRouter
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "I'm not sure how to respond to that. Can you try rephrasing your question?";
    } catch (error) {
      console.error("AI chat response error:", error);
      return "I'm having trouble right now. Please try again later.";
    }
  }
}

export const aiService = new AIService();
