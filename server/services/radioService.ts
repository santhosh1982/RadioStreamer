import { Readable } from "stream";
import fetch from "node-fetch";

export interface StreamInfo {
  url: string;
  title?: string;
  genre?: string;
  bitrate?: number;
}

export class RadioService {
  private activeStreams = new Map<string, Readable>();

  async getStreamInfo(url: string): Promise<StreamInfo | null> {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentType = response.headers.get("content-type");
      
      if (!contentType?.includes("audio")) {
        return null;
      }

      return {
        url,
        title: response.headers.get("icy-name") || undefined,
        genre: response.headers.get("icy-genre") || undefined,
        bitrate: response.headers.get("icy-br") ? parseInt(response.headers.get("icy-br")!) : undefined,
      };
    } catch (error) {
      console.error("Error getting stream info:", error);
      return null;
    }
  }

  async createStream(stationId: string, url: string): Promise<Readable> {
    try {
      const response = await fetch(url);
      if (!response.ok || !response.body) {
        throw new Error(`Failed to connect to radio stream: ${response.statusText}`);
      }

      const stream = response.body as unknown as Readable;
      this.activeStreams.set(stationId, stream);
      
      stream.on("error", (error) => {
        console.error(`Stream error for station ${stationId}:`, error);
        this.activeStreams.delete(stationId);
      });

      stream.on("end", () => {
        console.log(`Stream ended for station ${stationId}`);
        this.activeStreams.delete(stationId);
      });

      return stream;
    } catch (error) {
      console.error("Error creating stream:", error);
      throw error;
    }
  }

  getActiveStream(stationId: string): Readable | undefined {
    return this.activeStreams.get(stationId);
  }

  stopStream(stationId: string): void {
    const stream = this.activeStreams.get(stationId);
    if (stream) {
      stream.destroy();
      this.activeStreams.delete(stationId);
    }
  }

  stopAllStreams(): void {
    for (const [stationId, stream] of this.activeStreams) {
      stream.destroy();
    }
    this.activeStreams.clear();
  }
}

export const radioService = new RadioService();
