import { Writable, Readable } from "stream";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

export interface RecordingOptions {
  userId: string;
  stationId: string;
  title: string;
  maxDuration?: number; // in seconds
}

export class RecordingService {
  private activeRecordings = new Map<string, { stream: Writable; startTime: Date }>();
  private recordingsDir = path.join(process.cwd(), "recordings");

  constructor() {
    this.ensureRecordingsDir();
  }

  private async ensureRecordingsDir(): Promise<void> {
    try {
      await access(this.recordingsDir);
    } catch {
      await mkdir(this.recordingsDir, { recursive: true });
    }
  }

  async startRecording(recordingId: string, sourceStream: Readable, options: RecordingOptions): Promise<string> {
    const filename = `${recordingId}_${Date.now()}.wav`;
    const filepath = path.join(this.recordingsDir, filename);
    
    const writeStream = fs.createWriteStream(filepath);
    const startTime = new Date();

    // Pipe the source stream to the file
    sourceStream.pipe(writeStream);

    this.activeRecordings.set(recordingId, { stream: writeStream, startTime });

    // Auto-stop recording if maxDuration is set
    if (options.maxDuration) {
      setTimeout(() => {
        this.stopRecording(recordingId);
      }, options.maxDuration * 1000);
    }

    writeStream.on("error", (error) => {
      console.error(`Recording error for ${recordingId}:`, error);
      this.activeRecordings.delete(recordingId);
    });

    writeStream.on("finish", () => {
      console.log(`Recording finished for ${recordingId}`);
      this.activeRecordings.delete(recordingId);
    });

    return filename;
  }

  stopRecording(recordingId: string): void {
    const recording = this.activeRecordings.get(recordingId);
    if (recording) {
      recording.stream.end();
      this.activeRecordings.delete(recordingId);
    }
  }

  isRecording(recordingId: string): boolean {
    return this.activeRecordings.has(recordingId);
  }

  getRecordingDuration(recordingId: string): number {
    const recording = this.activeRecordings.get(recordingId);
    if (!recording) return 0;
    
    return Math.floor((Date.now() - recording.startTime.getTime()) / 1000);
  }

  getActiveRecordings(): string[] {
    return Array.from(this.activeRecordings.keys());
  }

  async getRecordingFile(filename: string): Promise<Buffer> {
    const filepath = path.join(this.recordingsDir, filename);
    return fs.promises.readFile(filepath);
  }

  async deleteRecordingFile(filename: string): Promise<void> {
    const filepath = path.join(this.recordingsDir, filename);
    try {
      await fs.promises.unlink(filepath);
    } catch (error) {
      console.error("Error deleting recording file:", error);
    }
  }

  async getRecordingFileStats(filename: string): Promise<{ size: number; duration: number } | null> {
    const filepath = path.join(this.recordingsDir, filename);
    try {
      const stats = await fs.promises.stat(filepath);
      // Estimate duration based on file size (rough approximation for WAV files)
      const estimatedDuration = Math.floor(stats.size / 176400); // 44.1kHz * 2 bytes * 2 channels
      return {
        size: stats.size,
        duration: estimatedDuration,
      };
    } catch (error) {
      console.error("Error getting file stats:", error);
      return null;
    }
  }
}

export const recordingService = new RecordingService();
