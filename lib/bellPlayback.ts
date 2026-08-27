export interface BellAudioElement {
  currentTime: number;
  muted: boolean;
  preload: string;
  load(): void;
  pause(): void;
  play(): Promise<void>;
  addEventListener(type: "ended" | "error", listener: () => void): void;
  removeEventListener(type: "ended" | "error", listener: () => void): void;
}

type PlaybackState = "idle" | "priming" | "playing";

/**
 * Serializes bell events so resetting a shared audio element cannot cut off or
 * swallow a preceding bell. Rejected autoplay attempts stay queued and can be
 * retried from the next user gesture.
 */
export class BellPlaybackQueue {
  private pending = 0;
  private state: PlaybackState = "idle";
  private operation = 0;
  private disposed = false;

  constructor(private readonly audio: BellAudioElement) {
    this.audio.preload = "auto";
    this.audio.addEventListener("ended", this.handleEnded);
    this.audio.addEventListener("error", this.handleError);
  }

  preload() {
    if (this.disposed) return;
    this.audio.load();
  }

  /** Unlocks the media element during a gesture without producing an audible bell. */
  prime() {
    if (this.disposed || this.state !== "idle" || this.pending > 0) return;

    const operation = ++this.operation;
    this.state = "priming";
    this.audio.muted = true;
    this.audio.currentTime = 0;

    void this.startPlayback().then(
      () => {
        if (operation !== this.operation || this.state !== "priming") return;
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.muted = false;
        this.state = "idle";
      },
      () => {
        if (operation !== this.operation || this.state !== "priming") return;
        this.audio.currentTime = 0;
        this.audio.muted = false;
        this.state = "idle";
      },
    );
  }

  enqueue() {
    if (this.disposed) return;
    this.pending += 1;

    if (this.state === "priming") {
      this.operation += 1;
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.muted = false;
      this.state = "idle";
    }

    this.tryPlayNext();
  }

  /** Retry a bell retained after an autoplay rejection. */
  retry() {
    this.tryPlayNext();
  }

  stop() {
    this.operation += 1;
    this.pending = 0;
    this.state = "idle";
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.muted = false;
  }

  dispose() {
    if (this.disposed) return;
    this.stop();
    this.disposed = true;
    this.audio.removeEventListener("ended", this.handleEnded);
    this.audio.removeEventListener("error", this.handleError);
  }

  private startPlayback(): Promise<void> {
    try {
      return this.audio.play();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private tryPlayNext() {
    if (this.disposed || this.state !== "idle" || this.pending === 0) return;

    const operation = ++this.operation;
    this.state = "playing";
    this.audio.muted = false;
    this.audio.currentTime = 0;

    void this.startPlayback().catch(() => {
      if (operation !== this.operation || this.state !== "playing") return;
      // Keep the event queued. A later pointer/key gesture calls retry().
      this.state = "idle";
    });
  }

  private readonly handleEnded = () => {
    if (this.disposed || this.state !== "playing") return;
    this.operation += 1;
    this.pending = Math.max(0, this.pending - 1);
    this.state = "idle";
    this.audio.currentTime = 0;
    this.tryPlayNext();
  };

  private readonly handleError = () => {
    if (this.disposed) return;
    // A media error is not recoverable by another gesture.
    this.stop();
  };
}
