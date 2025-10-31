class AudioPlayer {
  private audioElement: HTMLAudioElement;
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private isPlaying = false;
  private audioQueue: Uint8Array[] = [];
  private isSourceBufferUpdating = false;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = "anonymous";
    console.log("AudioPlayer created");
    
    // Set up audio element event listeners
    this.audioElement.addEventListener('loadstart', () => console.log('Audio loadstart'));
    this.audioElement.addEventListener('canplay', () => console.log('Audio canplay'));
    this.audioElement.addEventListener('playing', () => console.log('Audio playing'));
    this.audioElement.addEventListener('error', (e) => console.error('Audio error:', e));
  }

  public async play() {
    console.log("AudioPlayer.play() called");
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    
    try {
      if (this.audioElement.src) {
        await this.audioElement.play();
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }

  public pause() {
    console.log("AudioPlayer.pause() called");
    this.isPlaying = false;
    this.audioElement.pause();
    
    if (this.mediaSource) {
      try {
        if (this.mediaSource.readyState === 'open') {
          this.mediaSource.endOfStream();
        }
      } catch (error) {
        console.error("Error ending media source:", error);
      }
    }
  }

  public setStreamUrl(url: string) {
    console.log("Setting stream URL:", url);
    this.audioElement.src = url;
    this.audioElement.load();
  }

  public addChunk(chunk: ArrayBuffer) {
    // For direct streaming, we'll use the HTML5 audio element with the stream URL
    // This method is kept for compatibility but not used in direct streaming
    console.log("AudioPlayer.addChunk() called with chunk of size", chunk.byteLength);
  }

  public getVolume(): number {
    return this.audioElement.volume;
  }

  public setVolume(volume: number) {
    this.audioElement.volume = Math.max(0, Math.min(1, volume));
  }

  public getCurrentTime(): number {
    return this.audioElement.currentTime;
  }

  public getDuration(): number {
    return this.audioElement.duration || 0;
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying && !this.audioElement.paused;
  }
}

export const audioPlayer = new AudioPlayer();
