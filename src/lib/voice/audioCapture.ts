// src/lib/voice/audioCapture.ts

/**
 * Handles microphone capture and streaming raw PCM audio to the Gemini Live WebSocket.
 * 16-bit PCM at 16kHz — the format Gemini Live expects.
 */

export interface AudioCaptureHandles {
  stream: MediaStream;
  audioContext: AudioContext;
  processor: ScriptProcessorNode;
  analyser: AnalyserNode;
  stop: () => void;
}

export async function startAudioCapture(
  onAudioChunk: (base64: string) => void,
  onAudioLevel: (level: number) => void,
): Promise<AudioCaptureHandles> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const source = audioContext.createMediaStreamSource(stream);

  // Analyser for waveform — reads frequency data for the visualizer
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);

  // Poll audio level for waveform animation
  const freqData = new Uint8Array(analyser.frequencyBinCount);
  let animFrame: number;
  const pollLevel = () => {
    analyser.getByteFrequencyData(freqData);
    const avg = freqData.reduce((a, b) => a + b, 0) / freqData.length;
    onAudioLevel(avg / 255);
    animFrame = requestAnimationFrame(pollLevel);
  };
  animFrame = requestAnimationFrame(pollLevel);

  // ScriptProcessor captures raw PCM — 4096 samples at 16kHz ≈ 256ms per chunk
  const processor = audioContext.createScriptProcessor(4096, 1, 1);

  processor.onaudioprocess = (e) => {
    const float32 = e.inputBuffer.getChannelData(0);

    // Convert float32 → int16 PCM
    const pcm16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      pcm16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768));
    }

    // Convert to base64 for JSON transport
    const bytes = new Uint8Array(pcm16.buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    onAudioChunk(btoa(binary));
  };

  source.connect(processor);
  processor.connect(audioContext.destination);

  const stop = () => {
    cancelAnimationFrame(animFrame);
    processor.disconnect();
    audioContext.close();
    stream.getTracks().forEach((t) => t.stop());
  };

  return { stream, audioContext, processor, analyser, stop };
}
