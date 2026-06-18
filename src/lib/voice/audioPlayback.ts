// src/lib/voice/audioPlayback.ts

/**
 * Handles receiving raw PCM audio from Gemini Live and playing it back.
 * Gemini sends 16-bit PCM at 24kHz — we decode and queue it for smooth playback.
 */

export class AudioPlayback {
  private context: AudioContext;
  private queue: AudioBuffer[] = [];
  private isPlaying = false;
  private onPlaybackStart?: () => void;
  private onPlaybackEnd?: () => void;

  constructor(opts?: {
    onPlaybackStart?: () => void;
    onPlaybackEnd?: () => void;
  }) {
    this.context = new AudioContext({ sampleRate: 24000 });
    this.onPlaybackStart = opts?.onPlaybackStart;
    this.onPlaybackEnd = opts?.onPlaybackEnd;
  }

  /**
   * Accepts a base64-encoded raw 16-bit PCM chunk from Gemini,
   * decodes it, and queues it for playback.
   */
  enqueue(base64Data: string): void {
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Convert raw int16 PCM → float32 for Web Audio API
    const pcm16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768;
    }

    const buffer = this.context.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    this.queue.push(buffer);

    if (!this.isPlaying) {
      this.drain();
    }
  }

  private drain(): void {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.onPlaybackEnd?.();
      return;
    }

    this.isPlaying = true;
    this.onPlaybackStart?.();

    const buffer = this.queue.shift()!;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.onended = () => this.drain();
    source.start();
  }

  stop(): void {
    this.queue = [];
    this.isPlaying = false;
    this.context.close();
  }
}
